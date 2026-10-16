import { fetchLocalSportsData } from '../utils/local-sports';
import { getTeamLogo, getTeamAccent, getTeamInitials, classifyMatchLeague } from '../../shared/team-logos';

const STREAM_VIDEO_SOURCES = {
  nba1: '/videos/basketball-live.webm',
  nba2: '/videos/basketball-arena.webm',
  pba1: '/videos/basketball-arena.webm',
  pba2: '/videos/basketball-live.webm'
};

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const matchId = query.matchId ? String(query.matchId) : '';
  const homeParam = query.home ? String(query.home) : '';
  const awayParam = query.away ? String(query.away) : '';
  const compParam = query.comp ? String(query.comp) : '';
  const refresh = query.refresh === 'true' || query.refresh === '1';

  setResponseHeaders(event, {
    'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0'
  });

  let matchData: any = null;
  let activeLiveStreamResults: any[] = [];

  try {
    const sportsData = await fetchLocalSportsData(refresh);
    const allMatches = sportsData.allMatches || [];
    activeLiveStreamResults = (sportsData.livestreams || []).filter(
      (m: any) => Array.isArray(m.sources) && m.sources.length > 0
    );

    // 1. Find match by exact matchId
    if (matchId) {
      matchData =
        activeLiveStreamResults.find(m => m.id === matchId) ||
        allMatches.find(m => m.id === matchId);
    }

    // 2. Fallback: Find by home/away team names
    if (!matchData && homeParam && awayParam) {
      const hLower = homeParam.toLowerCase().trim();
      const aLower = awayParam.toLowerCase().trim();
      matchData =
        activeLiveStreamResults.find(m =>
          (m.home?.name || '').toLowerCase().includes(hLower) &&
          (m.away?.name || '').toLowerCase().includes(aLower)
        ) ||
        allMatches.find(m =>
          (m.home?.name || '').toLowerCase().includes(hLower) &&
          (m.away?.name || '').toLowerCase().includes(aLower)
        );
    }

    // 3. Fallback: Pick top active Live88 stream match
    if (!matchData) {
      matchData =
        activeLiveStreamResults[0] ||
        allMatches.find(m => Array.isArray(m.sources) && m.sources.length > 0) ||
        allMatches[0];
    }
  } catch (err: any) {
    console.warn('[live-stream API] Warning fetching Live88 data:', err?.message);
  }

  // Build normalized list of all active Live88 video streams from livestream?segment=live
  const live88Streams = activeLiveStreamResults
    .filter(r => Array.isArray(r.sources) && r.sources.some((s: any) => s?.url))
    .map(r => {
      const src = r.sources.find((s: any) => s?.url) || r.sources[0];
      const hName = r.home?.name || 'Home';
      const aName = r.away?.name || 'Away';
      return {
        id: r.id,
        competition: r.competition || r.streamLabel || 'Live88 Broadcast',
        homeName: hName,
        awayName: aName,
        homeShort: r.home?.shortName || hName.split(' ').pop() || hName,
        awayShort: r.away?.shortName || aName.split(' ').pop() || aName,
        homeLogo: getTeamLogo(hName, r.home?.logo),
        awayLogo: getTeamLogo(aName, r.away?.logo),
        homeScore: r.homeScore ?? 0,
        awayScore: r.awayScore ?? 0,
        clock: r.clock || 'LIVE',
        streamUrl: src.url,
        proxyUrl: `/api/live88/stream-proxy?url=${encodeURIComponent(src.url)}`,
        streamType: src.type || (String(src.url).includes('.m3u8') ? 'hls' : 'flv'),
        streamLabel: src.label || 'Live88 FLV'
      };
    });

  const homeName = matchData?.home?.name || homeParam || live88Streams[0]?.homeName || 'Terrafirma Dyip';
  const awayName = matchData?.away?.name || awayParam || live88Streams[0]?.awayName || 'San Miguel Beermen';
  const homeLogo = getTeamLogo(homeName, matchData?.home?.logo);
  const awayLogo = getTeamLogo(awayName, matchData?.away?.logo);

  const classified = classifyMatchLeague({
    homeTeam: homeName,
    awayTeam: awayName,
    competition: matchData?.competition || compParam,
    sport: matchData?.sport,
    leagueId: matchData?.leagueId
  });
  const isNba = classified.leagueId === 'nba';
  const competition = matchData?.competition || compParam || classified.leagueFullName;

  const homeScore = matchData?.homeScore !== undefined ? matchData.homeScore : (live88Streams[0]?.homeScore ?? 0);
  const awayScore = matchData?.awayScore !== undefined ? matchData.awayScore : (live88Streams[0]?.awayScore ?? 0);
  const status = 'live';
  const clock = matchData?.clock || live88Streams[0]?.clock || 'LIVE';

  // Extract genuine upstream Live88 stream sources (FLV / HLS)
  const rawMatchSources = (matchData?.sources || []).filter(
    (s: any) => s && s.url && (s.url.startsWith('http://') || s.url.startsWith('https://'))
  );

  // Pair with all active Live88 streams so player can automatically fail over across active feeds
  const orderedFallbackStreams = !isNba
    ? [
        ...live88Streams.filter(s => /pba|governors|mpbl|philippine|uaap|ncaa/i.test(s.competition)),
        ...live88Streams.filter(s => !/pba|governors|mpbl|philippine|uaap|ncaa/i.test(s.competition))
      ]
    : [
        ...live88Streams.filter(s => !/pba|mpbl/i.test(s.competition)),
        ...live88Streams.filter(s => /pba|mpbl/i.test(s.competition))
      ];

  const seenUrls = new Set<string>();
  const upstreamSources: { id: string; label: string; type: string; url: string; proxyUrl: string }[] = [];

  for (const s of rawMatchSources) {
    if (!seenUrls.has(s.url)) {
      seenUrls.add(s.url);
      upstreamSources.push({
        id: String(s.id || matchData?.id || 'live'),
        label: String(s.label || 'Live88 Direct Stream'),
        type: s.type || (String(s.url).includes('.m3u8') ? 'hls' : 'flv'),
        url: String(s.url),
        proxyUrl: `/api/live88/stream-proxy?url=${encodeURIComponent(String(s.url))}`
      });
    }
  }

  for (const fb of orderedFallbackStreams) {
    if (fb.streamUrl && !seenUrls.has(fb.streamUrl)) {
      seenUrls.add(fb.streamUrl);
      upstreamSources.push({
        id: fb.id,
        label: `${fb.homeShort} vs ${fb.awayShort} (${fb.streamLabel})`,
        type: fb.streamType,
        url: fb.streamUrl,
        proxyUrl: fb.proxyUrl
      });
    }
  }

  const primaryUpstreamSource = upstreamSources[0] || null;

  const channels = [
    {
      id: 'feed1',
      name: 'Live88 Direct Stream',
      type: 'video_stream',
      url: isNba ? STREAM_VIDEO_SOURCES.nba1 : STREAM_VIDEO_SOURCES.pba1,
      flvUrl: primaryUpstreamSource?.type === 'flv' ? primaryUpstreamSource.url : undefined,
      hlsUrl: primaryUpstreamSource?.type === 'hls' ? primaryUpstreamSource.url : undefined,
      proxyUrl: primaryUpstreamSource?.proxyUrl,
      quality: 'Live88 FLV',
      badge: 'LIVE88 LIVE',
      isLive: true
    },
    {
      id: 'feed2',
      name: 'Courtside HD Backup',
      type: 'video_stream',
      url: isNba ? STREAM_VIDEO_SOURCES.nba2 : STREAM_VIDEO_SOURCES.pba2,
      quality: '1080p 60fps',
      badge: 'HD BACKUP',
      isLive: true
    },
    {
      id: 'radar',
      name: '2D Court Tracker',
      type: 'radar',
      quality: 'Interactive Live',
      badge: '2D COURT',
      isLive: true
    }
  ];

  return {
    success: true,
    matchId: matchData?.id || matchId || 'live88-live',
    competition,
    isNba,
    status,
    clock,
    shotClock: 24,
    venue: matchData?.venue || classified.defaultVenue,
    home: {
      id: matchData?.home?.id || 'home',
      name: homeName,
      shortName: matchData?.home?.shortName || homeName.split(' ').pop() || homeName,
      initials: getTeamInitials(homeName),
      accent: getTeamAccent(homeName),
      logo: homeLogo,
      score: homeScore
    },
    away: {
      id: matchData?.away?.id || 'away',
      name: awayName,
      shortName: matchData?.away?.shortName || awayName.split(' ').pop() || awayName,
      initials: getTeamInitials(awayName),
      accent: getTeamAccent(awayName),
      logo: awayLogo,
      score: awayScore
    },
    upstreamSources,
    live88Streams,
    channels,
    defaultChannelId: 'feed1',
    spectators: 18420,
    timestamp: new Date().toISOString()
  };
});

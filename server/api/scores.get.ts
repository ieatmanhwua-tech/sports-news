import { DEMO_SCORES } from '../db/demo-fixtures';
import type { GameScore } from '../../shared/types';
import { fetchLocalSportsData } from '../utils/local-sports';
import { getTeamLogo, classifyMatchLeague, isVerifiedNbaTeam, isVerifiedPbaTeam } from '../../shared/team-logos';
import { getUniqueMatchImage } from '../../shared/image-resolver';
import { formatGameDateLabelPht } from '../../shared/ph-date';

function isForeignOrInvalidMatch(homeName: string, awayName: string, comp: string): boolean {
  const combined = `${homeName} ${awayName} ${comp}`;
  return /\b(mississippi|alabama|ole miss|kentucky|duke|kansas|gonzaga|uconn|purdue|macau black knights|titan ultra|slovenia|wnba|fiba\s*wbla|wbla|euroleague)\b/i.test(combined);
}

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const league = query.league ? String(query.league) : undefined;
  const refresh = query.refresh === 'true' || query.refresh === '1';

  setResponseHeaders(event, {
    'Cache-Control': refresh
      ? 'no-cache, max-age=0, must-revalidate'
      : 'public, max-age=10, s-maxage=15, stale-while-revalidate=30'
  });

  let games: GameScore[] = [];
  let feedUpdatedAt = new Date().toISOString();
  const usedImages = new Set<string>();

  try {
    const phData = await fetchLocalSportsData(refresh);
    if (phData?.generatedAt) {
      feedUpdatedAt = phData.generatedAt;
    }
    if (phData && phData.allMatches && phData.allMatches.length > 0) {
      // Keep only verified NBA games, verified PBA games, and authentic Philippine basketball leagues (MPBL, UAAP, NCAA PH, Gilas)
      const verifiedMatches = phData.allMatches.filter(m => {
        const homeName = m.home?.name || '';
        const awayName = m.away?.name || '';
        const comp = m.competition || '';
        if (isForeignOrInvalidMatch(homeName, awayName, comp)) {
          return false;
        }
        if (m.leagueId === 'nba') {
          return isVerifiedNbaTeam(homeName) && isVerifiedNbaTeam(awayName);
        }
        if (m.leagueId === 'pba') {
          return isVerifiedPbaTeam(homeName) && isVerifiedPbaTeam(awayName);
        }
        if (m.leagueId === 'fiba') {
          return /gilas|philippines|pilipinas/i.test(`${homeName} ${awayName} ${comp}`);
        }
        return true;
      });

      games = verifiedMatches.map((m, idx) => {
        const homeName = m.home?.name || 'Home Team';
        const awayName = m.away?.name || 'Away Team';

        const classified = classifyMatchLeague({
          homeTeam: homeName,
          awayTeam: awayName,
          competition: m.competition,
          streamLabel: m.streamLabel,
          sport: m.sport,
          leagueId: m.leagueId
        });

        let mappedStatus: 'live' | 'upcoming' | 'final' = 'upcoming';
        if (m.status === 'live') mappedStatus = 'live';
        else if (m.status === 'finished') mappedStatus = 'final';
        else mappedStatus = 'upcoming';

        const gameDateInfo = formatGameDateLabelPht(m.startTime || m.startTimeIso);
        let statusDetail = m.manilaTimeFormatted || `${gameDateInfo.monthDay}, ${gameDateInfo.timePht}`;
        if (mappedStatus === 'live') {
          const cleanClock = String(m.clock || '').replace(/^LIVE\s*[-·•:]?\s*/i, '').trim();
          statusDetail = cleanClock && cleanClock !== 'FT' && cleanClock !== 'LIVE'
            ? cleanClock
            : 'In Progress';
        } else if (mappedStatus === 'final') {
          statusDetail = `Final · ${gameDateInfo.monthDay}`;
        } else {
          statusDetail = `${gameDateInfo.monthDay}, ${gameDateInfo.timePht}`;
        }

        const compText = m.competition || '';
        let stage = mappedStatus === 'live' ? 'Live In-Play' : 'Official Fixture';
        if (/quarterfinal/i.test(compText)) stage = 'Quarterfinals';
        else if (/semifinal/i.test(compText)) stage = 'Semifinals';
        else if (/final/i.test(compText)) stage = 'Finals';
        else if (classified.leagueId === 'pba') stage = "PBA Governors' Cup";
        else if (classified.leagueId === 'mpbl') stage = 'MPBL Regular Season';
        else if (classified.leagueId === 'uaap') stage = 'UAAP Basketball';
        else if (classified.leagueId === 'ncaa') stage = 'NCAA Basketball';
        else if (classified.leagueId === 'nba') stage = compText || 'NBA Matchup';

        const bannerUrl = getUniqueMatchImage(
          {
            id: m.id || `${classified.leagueId}-live88-${idx}`,
            away_team: awayName,
            home_team: homeName,
            league: classified.league,
            leagueId: classified.leagueId,
            bannerUrl: m.bannerUrl,
            status: m.status,
            awayScore: m.awayScore ?? 0,
            homeScore: m.homeScore ?? 0,
            clockOrTime: statusDetail,
            venue: m.venue || classified.defaultVenue
          },
          usedImages
        );

        return {
          id: m.id || `${classified.leagueId}-live88-${idx}`,
          league: classified.league,
          leagueFullName: classified.leagueFullName,
          leagueId: classified.leagueId,
          leagueLogo: classified.leagueLogo,
          eventName: m.competition || `${classified.league} Official Matchup`,
          stage,
          homeTeam: homeName,
          homeTeamLogo: getTeamLogo(homeName, m.home?.logo),
          awayTeam: awayName,
          awayTeamLogo: getTeamLogo(awayName, m.away?.logo),
          homeScore: mappedStatus === 'upcoming' ? undefined : (m.homeScore ?? 0),
          awayScore: mappedStatus === 'upcoming' ? undefined : (m.awayScore ?? 0),
          status: mappedStatus,
          statusDetail,
          gameTimeUtc: m.startTime || new Date().toISOString(),
          venue: m.venue || classified.defaultVenue,
          broadcast: m.streamLabel || classified.defaultBroadcast,
          bannerUrl,
          sourceName: 'Live88 & ESPN Official Real-Time Feed',
          updatedAt: feedUpdatedAt
        };
      });

      // Sort games so 1) Live games come first, 2) Today's (Manila date) upcoming & final games come next, 3) Yesterday/Tomorrow games follow
      games.sort((a, b) => {
        const aLive = a.status === 'live' ? 1 : 0;
        const bLive = b.status === 'live' ? 1 : 0;
        if (aLive !== bLive) return bLive - aLive;

        const dA = formatGameDateLabelPht(a.gameTimeUtc);
        const dB = formatGameDateLabelPht(b.gameTimeUtc);
        const aToday = dA.isToday ? 1 : 0;
        const bToday = dB.isToday ? 1 : 0;
        if (aToday !== bToday) return bToday - aToday;

        const aNear = (dA.isTomorrow || dA.isYesterday) ? 1 : 0;
        const bNear = (dB.isTomorrow || dB.isYesterday) ? 1 : 0;
        if (aNear !== bNear) return bNear - aNear;

        return 0;
      });
    }
  } catch (err) {
    console.warn('Could not fetch Live88 matches in /api/scores:', err);
  }

  if (games.length === 0) {
    games = DEMO_SCORES.map(g => {
      const classified = classifyMatchLeague({
        homeTeam: g.homeTeam,
        awayTeam: g.awayTeam,
        competition: g.eventName,
        league: g.league,
        leagueId: g.leagueId
      });
      const bannerUrl = getUniqueMatchImage(
        {
          id: g.id,
          away_team: g.awayTeam,
          home_team: g.homeTeam,
          league: classified.league,
          leagueId: classified.leagueId,
          status: g.status === 'final' ? 'finished' : g.status === 'live' ? 'live' : 'scheduled',
          awayScore: g.awayScore ?? 0,
          homeScore: g.homeScore ?? 0,
          clockOrTime: g.statusDetail,
          venue: g.venue || classified.defaultVenue
        },
        usedImages
      );
      return {
        ...g,
        league: classified.league,
        leagueId: classified.leagueId,
        leagueFullName: classified.leagueFullName,
        leagueLogo: classified.leagueLogo,
        homeTeamLogo: getTeamLogo(g.homeTeam, g.homeTeamLogo),
        awayTeamLogo: getTeamLogo(g.awayTeam, g.awayTeamLogo),
        bannerUrl
      };
    });
  }

  if (league && league !== 'all') {
    const target = league.toLowerCase().trim();
    games = games.filter(g => {
      const matchLeague = g.league.toLowerCase() === target;
      const matchLeagueId = g.leagueId && g.leagueId.toLowerCase() === target;
      return matchLeague || matchLeagueId;
    });
  }

  return {
    source: 'Live88 & ESPN Official Real-Time Feed',
    lastUpdatedUtc: feedUpdatedAt,
    displayTimezone: 'Asia/Manila',
    games
  };
});

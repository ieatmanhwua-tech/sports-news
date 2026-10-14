import { DEMO_SCORES } from '../db/demo-fixtures';
import type { GameScore } from '../../shared/types';
import { fetchNbaOdds } from '../utils/nba-odds';
import { fetchLocalSportsData } from '../utils/local-sports';
import { getTeamLogo } from '../../shared/team-logos';

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const league = query.league ? String(query.league) : undefined;

  let games: GameScore[] = [...DEMO_SCORES];

  // 1. Augment Local Philippine Sports (PBA, MPBL, Collegiate) from live88 API
  try {
    const phData = await fetchLocalSportsData();
    if (phData && phData.allMatches && phData.allMatches.length > 0) {
      const livePhScores: GameScore[] = phData.allMatches.map((m, idx) => {
        const comp = (m.competition || m.streamLabel || '').toLowerCase();
        let leagueName = 'PBA';
        let leagueId = 'pba';
        let leagueFullName = "Philippine Basketball Association (Governors' Cup)";
        let defaultVenue = 'Smart Araneta Coliseum / PhilSports Arena';

        if (comp.includes('mpbl')) {
          leagueName = 'MPBL';
          leagueId = 'mpbl';
          leagueFullName = 'Maharlika Pilipinas Basketball League';
          defaultVenue = 'Batangas City Sports Center / Cuneta Astrodome';
        } else if (comp.includes('uaap') || comp.includes('university athletic association')) {
          leagueName = 'UAAP';
          leagueId = 'uaap';
          leagueFullName = 'University Athletic Association of the Philippines';
          defaultVenue = 'SM Mall of Asia Arena / Araneta Coliseum';
        } else if (comp.includes('ncaa') || comp.includes('collegiate') || comp.includes('national collegiate')) {
          leagueName = 'NCAA';
          leagueId = 'ncaa';
          leagueFullName = 'National Collegiate Athletic Association (Philippines)';
          defaultVenue = 'Filoil EcoOil Centre, San Juan';
        } else {
          leagueName = 'PBA';
          leagueId = 'pba';
          leagueFullName = "Philippine Basketball Association (Governors' Cup)";
          defaultVenue = 'Smart Araneta Coliseum / PhilSports Arena';
        }

        const statusMapped: 'upcoming' | 'live' | 'final' = 
          m.status === 'live' ? 'live' : (m.status === 'finished' ? 'final' : 'upcoming');

        const statusDetail = m.status === 'live'
          ? (m.clock && m.clock !== 'FT' ? `LIVE · ${m.clock}` : 'LIVE')
          : m.status === 'finished'
            ? 'Final'
            : (m.manilaTimeFormatted || 'Scheduled');

        const homeName = m.home?.name || 'Home Team';
        const awayName = m.away?.name || 'Away Team';

        return {
          id: `ph-live88-${m.id || idx}`,
          league: leagueName,
          leagueFullName,
          leagueId,
          leagueLogo: leagueId === 'pba' ? '/img/pba.png' : (leagueId === 'mpbl' ? '/img/mpbl.png' : (leagueId === 'uaap' ? '/img/uaap.webp' : '/img/ncaa.png')),
          eventName: m.competition || m.streamLabel || `${leagueName} Matchup`,
          stage: m.streamLabel || 'Regular Season',
          homeTeam: homeName,
          homeTeamLogo: m.home?.logo || getTeamLogo(homeName),
          awayTeam: awayName,
          awayTeamLogo: m.away?.logo || getTeamLogo(awayName),
          homeScore: m.homeScore,
          awayScore: m.awayScore,
          status: statusMapped,
          statusDetail,
          gameTimeUtc: m.startTime,
          venue: m.venue || defaultVenue,
          broadcast: m.hasStream ? 'Live Stream · One Sports / Pilipinas Live' : 'PBA Rush / One Sports / RPTV',
          sourceName: 'Official PH Sports Feed',
          updatedAt: new Date().toISOString()
        };
      });

      // Filter out demo fixtures for leagues present in livePhScores, then prepend live fixtures
      const activeLeagueIds = new Set(livePhScores.map(s => s.leagueId));
      games = [
        ...livePhScores,
        ...games.filter(g => !g.leagueId || !activeLeagueIds.has(g.leagueId))
      ];
    }
  } catch (err) {
    console.warn('Could not fetch local PH sports in /api/scores:', err);
  }

  // 2. Augment NBA games from NBA Sports API worker
  try {
    const nbaData = await fetchNbaOdds();
    if (nbaData && nbaData.length > 0) {
      const liveNbaScores: GameScore[] = nbaData.slice(0, 12).map((item, idx) => {
        const spreadText = item.consensus?.spread
          ? ` (${item.consensus.spread.homeTeam} ${item.consensus.spread.point > 0 ? '+' : ''}${item.consensus.spread.point})`
          : '';
        const totalText = item.consensus?.total
          ? ` · O/U ${item.consensus.total.point}`
          : '';

        return {
          id: `worker-nba-${item.id || idx}`,
          league: 'NBA',
          leagueFullName: 'National Basketball Association',
          leagueId: 'nba',
          leagueLogo: '/img/nba-logo.webp',
          eventName: `NBA 2025-26 Season: ${item.away_team} @ ${item.home_team}`,
          stage: 'Regular Season Fixture',
          homeTeam: item.home_team,
          homeTeamLogo: getTeamLogo(item.home_team),
          awayTeam: item.away_team,
          awayTeamLogo: getTeamLogo(item.away_team),
          status: item.status || 'upcoming',
          statusDetail: item.status === 'live' 
            ? 'LIVE' 
            : `Upcoming${spreadText}${totalText}`,
          gameTimeUtc: item.commence_time,
          venue: `${item.home_team} Arena, USA`,
          broadcast: 'NBA League Pass / NBA TV Philippines',
          sourceName: 'NBA Sports API (Cloudflare Worker)',
          updatedAt: new Date().toISOString()
        };
      });

      games = [
        ...games.filter(g => g.leagueId !== 'nba'),
        ...liveNbaScores
      ];
    }
  } catch (err) {
    console.warn('Could not fetch upstream NBA sports API in /api/scores:', err);
  }

  // Ensure ALL games (including demo fixtures and international) have logos populated
  games = games.map(g => ({
    ...g,
    homeTeamLogo: g.homeTeamLogo || getTeamLogo(g.homeTeam),
    awayTeamLogo: g.awayTeamLogo || getTeamLogo(g.awayTeam)
  }));

  if (league && league !== 'all') {
    const target = league.toLowerCase().trim();
    games = games.filter(g => {
      const matchLeague = g.league.toLowerCase() === target;
      const matchLeagueId = g.leagueId && g.leagueId.toLowerCase() === target;
      const matchFuzzy = g.league.toLowerCase().includes(target) || (g.leagueId && target.includes(g.leagueId));
      return matchLeague || matchLeagueId || matchFuzzy;
    });
  }

  return {
    source: 'TipOffPh Official League Feeds & NBA Sports API Worker',
    lastUpdatedUtc: new Date().toISOString(),
    displayTimezone: 'Asia/Manila',
    games
  };
});

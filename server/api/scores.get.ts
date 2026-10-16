import { DEMO_SCORES } from '../db/demo-fixtures';
import type { GameScore } from '../../shared/types';
import { fetchLocalSportsData } from '../utils/local-sports';
import { getTeamLogo, classifyMatchLeague, isVerifiedNbaTeam } from '../../shared/team-logos';

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const league = query.league ? String(query.league) : undefined;
  const refresh = query.refresh === 'true' || query.refresh === '1';

  let games: GameScore[] = [];

  try {
    const phData = await fetchLocalSportsData(refresh);
    if (phData && phData.allMatches && phData.allMatches.length > 0) {
      // Keep only verified NBA games (both teams are official NBA franchises) and Philippine basketball leagues (PBA, MPBL, UAAP, NCAA, Gilas, PSL, EASL)
      const verifiedMatches = phData.allMatches.filter(m => {
        const homeName = m.home?.name || '';
        const awayName = m.away?.name || '';
        if (m.leagueId === 'nba') {
          return isVerifiedNbaTeam(homeName) && isVerifiedNbaTeam(awayName);
        }
        if (m.leagueId === 'fiba') {
          return /gilas|philippines|pilipinas/i.test(`${homeName} ${awayName} ${m.competition || ''}`);
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

        let statusDetail = m.manilaTimeFormatted || 'Scheduled';
        if (mappedStatus === 'live') {
          statusDetail = m.clock && m.clock !== 'FT' && m.clock !== 'LIVE'
            ? `LIVE · ${m.clock}`
            : 'LIVE';
        } else if (mappedStatus === 'final') {
          statusDetail = 'Final';
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
          sourceName: 'Live88 & ESPN Official Real-Time Feed',
          updatedAt: new Date().toISOString()
        };
      });

      // Ensure the top of the board features the latest/live verified NBA game alongside live PBA games for Courtside Scores accuracy
      if (!league || league === 'all') {
        const topNbaIdx = games.findIndex(
          g => g.leagueId === 'nba' && (g.status === 'live' || (g.status === 'final' && (g.homeScore || 0) > 0))
        );
        if (topNbaIdx > 0) {
          const [topNbaGame] = games.splice(topNbaIdx, 1);
          if (topNbaGame) {
            games.unshift(topNbaGame);
          }
        }
      }
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
      return {
        ...g,
        league: classified.league,
        leagueId: classified.leagueId,
        leagueFullName: classified.leagueFullName,
        leagueLogo: classified.leagueLogo,
        homeTeamLogo: getTeamLogo(g.homeTeam, g.homeTeamLogo),
        awayTeamLogo: getTeamLogo(g.awayTeam, g.awayTeamLogo)
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
    lastUpdatedUtc: new Date().toISOString(),
    displayTimezone: 'Asia/Manila',
    games
  };
});

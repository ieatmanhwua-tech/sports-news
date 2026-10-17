import { fetchLocalSportsData } from '../utils/local-sports';
import { classifyMatchLeague } from '../../shared/team-logos';

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const league = query.league ? String(query.league).toLowerCase() : undefined;
  const status = query.status ? String(query.status).toLowerCase() : undefined;
  const refresh = query.refresh === 'true' || query.refresh === '1';
  const mode = query.mode === 'scores' ? 'scores' : 'full';

  setResponseHeaders(
    event,
    refresh
      ? {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate'
        }
      : {
          'Cache-Control': 'public, max-age=10, s-maxage=15, stale-while-revalidate=30'
        }
  );

  try {
    const data = await fetchLocalSportsData(refresh, mode);

    let filteredMatches = data.allMatches;

    if (league && league !== 'all') {
      filteredMatches = filteredMatches.filter(m => {
        const classified = classifyMatchLeague({
          homeTeam: m.home?.name,
          awayTeam: m.away?.name,
          competition: m.competition,
          streamLabel: m.streamLabel,
          sport: m.sport,
          leagueId: m.leagueId
        });

        if (league === 'nba') return classified.leagueId === 'nba';
        if (league === 'pba') return classified.leagueId === 'pba';
        if (league === 'mpbl') return classified.leagueId === 'mpbl';
        if (league === 'uaap') return classified.leagueId === 'uaap';
        if (league === 'ncaa') return classified.leagueId === 'ncaa';
        if (league === 'collegiate') return classified.leagueId === 'uaap' || classified.leagueId === 'ncaa' || classified.sport === 'collegiate';
        return classified.leagueId === league;
      });
    }

    if (status && status !== 'all') {
      filteredMatches = filteredMatches.filter(m => m.status.toLowerCase() === status);
    }

    return {
      success: true,
      ...data,
      matches: filteredMatches
    };
  } catch (err: any) {
    throw createError({
      statusCode: 502,
      statusMessage: `Failed to retrieve local PH sports data: ${err.message}`
    });
  }
});



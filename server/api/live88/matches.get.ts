import { fetchLocalSportsData } from '../../utils/local-sports';

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const sport = query.sport ? String(query.sport).toLowerCase() : '';
  const leagueId = query.leagueId ? String(query.leagueId).toLowerCase() : '';
  const refresh = query.refresh === 'true' || query.refresh === '1';

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
    const data = await fetchLocalSportsData(refresh);
    let matches = data.allMatches;
    if (sport) {
      matches = matches.filter(m => m.sport === sport || m.leagueId === sport);
    }
    if (leagueId) {
      matches = matches.filter(m => m.leagueId === leagueId);
    }
    return {
      code: 0,
      generatedAt: data.generatedAt,
      data: matches
    };
  } catch (err: any) {
    console.warn('[live88/matches] Warning:', err?.message);
    return { code: 200, data: [] };
  }
});


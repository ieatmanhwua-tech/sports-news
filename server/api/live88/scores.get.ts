import { fetchLocalSportsData } from '../../utils/local-sports';

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const segment = String(query.segment || 'today').toLowerCase();
  const sport = query.sport ? String(query.sport).toLowerCase() : '';
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
    const data = await fetchLocalSportsData(refresh, 'scores');
    let results = segment === 'live' ? data.liveMatches : data.allMatches;
    if (sport) {
      results = results.filter(m => m.sport === sport || m.leagueId === sport);
    }
    return {
      code: 0,
      data: {
        generatedAt: data.generatedAt,
        count: results.length,
        results
      }
    };
  } catch (err: any) {
    console.warn('[live88/scores] Warning:', err?.message);
    return { code: 200, data: { count: 0, results: [] } };
  }
});


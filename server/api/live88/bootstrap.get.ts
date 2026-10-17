import { fetchLocalSportsData } from '../../utils/local-sports';

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
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
    return {
      code: 0,
      data: {
        generatedAt: data.generatedAt,
        leagues: [
          { id: 'nba', name: 'NBA' },
          { id: 'pba', name: 'PBA' },
          { id: 'mpbl', name: 'MPBL' },
          { id: 'uaap', name: 'UAAP' },
          { id: 'ncaa', name: 'NCAA' }
        ],
        matches: data.allMatches,
        signals: data.signals,
        liveCount: data.counts.activeLive
      }
    };
  } catch (err: any) {
    console.warn('[live88/bootstrap] Warning:', err?.message);
    return { code: 200, data: { leagues: [], matches: [], signals: [], liveCount: 0 } };
  }
});


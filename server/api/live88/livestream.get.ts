import { fetchLive88StreamsOnly } from '../../utils/local-sports';

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const segment = String(query.segment || 'live');
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
    const streams = await fetchLive88StreamsOnly(refresh);
    return {
      code: 0,
      data: {
        timezone: 'Asia/Manila',
        generatedAt: new Date().toISOString(),
        segment,
        count: streams.length,
        results: streams
      }
    };
  } catch (err: any) {
    console.warn('[live88/livestream] Warning:', err?.message);
    return { code: 200, data: { count: 0, results: [] } };
  }
});


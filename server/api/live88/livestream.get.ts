import { fetchLocalSportsData, isLive88BasketballMatch } from '../../utils/local-sports';

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const site = String(query.site || '-Qw82foL4XnLt_vBp8LVXjwW');
  const segment = String(query.segment || 'live');
  const refresh = query.refresh === 'true' || query.refresh === '1';
  const ts = Date.now();

  setResponseHeaders(event, {
    'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0'
  });

  try {
    const sportsData = await fetchLocalSportsData(refresh);
    if (sportsData.livestreams && sportsData.livestreams.length > 0) {
      return {
        code: 0,
        data: {
          timezone: 'Asia/Manila',
          generatedAt: new Date().toISOString(),
          segment,
          count: sportsData.livestreams.length,
          results: sportsData.livestreams
        }
      };
    }
  } catch (err: any) {
    console.warn('[live88/livestream] Local sports data warning:', err?.message);
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 5000);

  try {
    const targetUrl = `https://live88.eu.cc/api/v1/livestream?site=${encodeURIComponent(site)}&segment=${encodeURIComponent(segment)}&_t=${ts}`;
    const res = await fetch(targetUrl, {
      cache: 'no-store',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
        'Accept': 'application/json',
        'Cache-Control': 'no-cache',
        'Origin': 'https://live88.eu.cc',
        'Referer': 'https://live88.eu.cc/'
      },
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const json = await res.json();
      const rawResults = Array.isArray(json?.data?.results)
        ? json.data.results
        : Array.isArray(json?.data)
        ? json.data
        : [];
      const bballStreams = rawResults
        .filter(isLive88BasketballMatch)
        .map((item: any) => ({
          ...item,
          sport: item.sport === 'football' ? 'basketball' : item.sport
        }));
      return {
        code: 0,
        data: {
          timezone: 'Asia/Manila',
          generatedAt: new Date().toISOString(),
          segment,
          count: bballStreams.length,
          results: bballStreams
        }
      };
    }
  } catch (err: any) {
    clearTimeout(timeoutId);
    console.warn('[live88/livestream] Upstream fetch warning:', err?.message);
  }

  return { code: 200, data: { count: 0, results: [] } };
});

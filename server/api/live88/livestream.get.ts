import { fetchLocalSportsData } from '../../utils/local-sports';

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const site = String(query.site || '-Qw82foL4XnLt_vBp8LVXjwW');
  const segment = String(query.segment || 'live');
  const ts = Date.now();

  setResponseHeaders(event, {
    'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0'
  });

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 5000);

  try {
    const targetUrl = `https://live88.eu.cc/api/v1/livestream?site=${encodeURIComponent(site)}&segment=${encodeURIComponent(segment)}&_t=${ts}`;
    const res = await fetch(targetUrl, {
      cache: 'no-store',
      headers: {
        'User-Agent': 'TipOffPh/2.0',
        'Accept': 'application/json',
        'Cache-Control': 'no-cache',
        'Origin': 'https://live88.eu.cc',
        'Referer': 'https://live88.eu.cc/'
      },
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      return await res.json();
    }
  } catch (err: any) {
    clearTimeout(timeoutId);
    console.warn('[live88/livestream] Upstream fetch warning:', err?.message);
  }

  try {
    const fallbackData = await fetchLocalSportsData(false);
    return {
      code: 0,
      data: {
        count: fallbackData.livestreams.length,
        results: fallbackData.livestreams
      }
    };
  } catch {
    return { code: 200, data: { count: 0, results: [] } };
  }
});

import { getActiveLive88StreamUrlsSync } from '../../utils/local-sports';

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const rawUrl = String(query.url || '').trim();

  setResponseHeaders(event, {
    'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0'
  });

  if (!rawUrl) {
    return { ok: false, url: '/videos/basketball-live.webm', fallbackUrl: '/videos/basketball-live.webm' };
  }

  if (rawUrl.startsWith('/')) {
    return { ok: true, url: rawUrl, proxyUrl: rawUrl, fallbackUrl: '/videos/basketball-live.webm' };
  }

  const candidates: string[] = [rawUrl];
  for (const fb of getActiveLive88StreamUrlsSync()) {
    if (fb && !candidates.includes(fb)) {
      candidates.push(fb);
    }
  }

  for (const targetUrl of candidates.slice(0, 3)) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 1600);
    try {
      const res = await fetch(targetUrl, {
        method: 'GET',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
          'Referer': 'https://live88.eu.cc/',
          'Origin': 'https://live88.eu.cc',
          'Accept': '*/*'
        },
        signal: controller.signal
      });
      clearTimeout(timer);
      if (res.ok) {
        try {
          await res.body?.cancel();
        } catch {}
        return {
          ok: true,
          url: targetUrl,
          proxyUrl: `/api/live88/stream-proxy?url=${encodeURIComponent(targetUrl)}`,
          fallbackUrl: '/videos/basketball-live.webm'
        };
      }
    } catch {
      clearTimeout(timer);
    }
  }

  return {
    ok: false,
    url: '/videos/basketball-live.webm',
    proxyUrl: '/videos/basketball-live.webm',
    fallbackUrl: '/videos/basketball-live.webm'
  };
});

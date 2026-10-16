import { isUpstreamStreamAlive } from '../../utils/local-sports';

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const url = String(query.url || '').trim();

  setResponseHeaders(event, {
    'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0'
  });

  if (!url) {
    return { ok: false, url: '/videos/basketball-live.webm', fallbackUrl: '/videos/basketball-live.webm' };
  }

  if (url.startsWith('/')) {
    return { ok: true, url, fallbackUrl: '/videos/basketball-live.webm' };
  }

  const ok = await isUpstreamStreamAlive(url);
  return {
    ok,
    url: ok ? url : '/videos/basketball-live.webm',
    fallbackUrl: '/videos/basketball-live.webm'
  };
});

import { sendStream, setResponseHeaders } from 'h3';
import { getActiveLive88StreamUrlsSync } from '../../utils/local-sports';

const deadUrlCache = new Map<string, number>();
const DEAD_URL_TTL_MS = 60_000;

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const rawUrl = String(query.url || '').trim();

  setResponseHeaders(event, {
    'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
    'Access-Control-Allow-Origin': '*'
  });

  if (!rawUrl || (!rawUrl.startsWith('http://') && !rawUrl.startsWith('https://'))) {
    setResponseHeaders(event, { 'Content-Type': 'text/plain; charset=utf-8' });
    return 'NO_ACTIVE_UPSTREAM_FLV_STREAM';
  }

  const candidateUrls: string[] = [rawUrl];
  for (const fallbackUrl of getActiveLive88StreamUrlsSync()) {
    if (fallbackUrl && !candidateUrls.includes(fallbackUrl)) {
      candidateUrls.push(fallbackUrl);
    }
  }

  let closed = false;
  let activeController: AbortController | null = null;
  event.node.req.on('close', () => {
    closed = true;
    activeController?.abort();
  });

  const now = Date.now();
  for (const targetUrl of candidateUrls.slice(0, 3)) {
    if (closed) break;
    const deadUntil = deadUrlCache.get(targetUrl);
    if (deadUntil && deadUntil > now) {
      continue;
    }

    const controller = new AbortController();
    activeController = controller;
    const connectTimeout = setTimeout(() => controller.abort(), 900);

    try {
      const upstreamRes = await fetch(targetUrl, {
        method: 'GET',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
          'Referer': 'https://live88.eu.cc/',
          'Origin': 'https://live88.eu.cc',
          'Accept': '*/*'
        },
        signal: controller.signal
      });

      clearTimeout(connectTimeout);

      if (upstreamRes.ok && upstreamRes.body) {
        deadUrlCache.delete(targetUrl);
        const contentType = upstreamRes.headers.get('content-type') || (
          targetUrl.includes('.m3u8')
            ? 'application/vnd.apple.mpegurl'
            : 'video/x-flv'
        );

        setResponseHeaders(event, {
          'Content-Type': contentType,
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
          'Access-Control-Allow-Origin': '*'
        });

        return sendStream(event, upstreamRes.body);
      }
      deadUrlCache.set(targetUrl, Date.now() + DEAD_URL_TTL_MS);
    } catch {
      clearTimeout(connectTimeout);
      deadUrlCache.set(targetUrl, Date.now() + DEAD_URL_TTL_MS);
    }
  }

  // Return >13 bytes of non-FLV text with HTTP 200 so FLVDemuxer.probe() immediately triggers FORMAT_UNSUPPORTED in <2ms without 502 server errors
  setResponseHeaders(event, { 'Content-Type': 'text/plain; charset=utf-8' });
  return 'NO_ACTIVE_UPSTREAM_FLV_STREAM';
});


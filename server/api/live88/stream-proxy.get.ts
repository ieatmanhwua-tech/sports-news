import { sendStream } from 'h3';

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const rawUrl = String(query.url || '').trim();

  if (!rawUrl || (!rawUrl.startsWith('http://') && !rawUrl.startsWith('https://'))) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid stream URL'
    });
  }

  const controller = new AbortController();
  const connectTimeout = setTimeout(() => controller.abort(), 6000);

  event.node.req.on('close', () => {
    controller.abort();
  });

  try {
    const upstreamRes = await fetch(rawUrl, {
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

    if (!upstreamRes.ok || !upstreamRes.body) {
      throw createError({
        statusCode: 502,
        statusMessage: `Upstream stream returned ${upstreamRes.status}`
      });
    }

    const contentType = upstreamRes.headers.get('content-type') || (
      rawUrl.includes('.m3u8')
        ? 'application/vnd.apple.mpegurl'
        : 'video/x-flv'
    );

    setResponseHeaders(event, {
      'Content-Type': contentType,
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
      'Access-Control-Allow-Origin': '*'
    });

    return sendStream(event, upstreamRes.body);
  } catch (err: any) {
    clearTimeout(connectTimeout);
    throw createError({
      statusCode: 502,
      statusMessage: err?.message || 'Stream proxy error'
    });
  }
});

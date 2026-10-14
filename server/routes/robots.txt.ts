export default defineEventHandler((event) => {
  const config = useRuntimeConfig();
  const host = getRequestHeader(event, 'host');
  const proto = getRequestHeader(event, 'x-forwarded-proto') || 'https';
  const siteUrl = (config.public.siteUrl || (host ? `${proto}://${host}` : 'https://tipoffph.com')).replace(/\/$/, '');

  setResponseHeader(event, 'Content-Type', 'text/plain; charset=utf-8');

  return `User-agent: *
Disallow: /

User-agent: Googlebot
Disallow: /
`;
});

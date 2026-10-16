export default defineEventHandler((event) => {
  setResponseHeader(event, 'Content-Type', 'text/plain; charset=utf-8');

  return `User-agent: *
Allow: /
Disallow: /api/

Sitemap: https://tipoff.bybetcasino.ph/sitemap.xml
`;
});

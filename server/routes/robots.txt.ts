export default defineEventHandler((event) => {
  const config = useRuntimeConfig();
  const siteUrl = (config.public.siteUrl || '').replace(/\/$/, '');

  setResponseHeader(event, 'Content-Type', 'text/plain; charset=utf-8');

  return `User-agent: *
Disallow: /admin/
Disallow: /search
Disallow: /api/

Sitemap: ${siteUrl}/sitemap.xml
Sitemap: ${siteUrl}/news-sitemap.xml
`;
});

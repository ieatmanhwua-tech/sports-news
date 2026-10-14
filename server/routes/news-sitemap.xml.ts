import { ArticleRepository } from '../utils/repository';

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  const host = getRequestHeader(event, 'host');
  const proto = getRequestHeader(event, 'x-forwarded-proto') || 'https';
  const siteUrl = (config.public.siteUrl || (host ? `${proto}://${host}` : 'https://tipoffph.com')).replace(/\/$/, '');

  // Articles published within last 48 hours
  const { articles } = await ArticleRepository.getPublicArticles({ limit: 1000 });
  const fortyEightHoursAgo = Date.now() - 48 * 60 * 60 * 1000;

  const eligibleNews = articles.filter(a => {
    const pubTime = new Date(a.publishedAt).getTime();
    return pubTime >= fortyEightHoursAgo && pubTime <= Date.now();
  });

  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
  xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"\n`;
  xml += `        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">\n`;

  for (const art of eligibleNews) {
    const safeTitle = art.title.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    xml += `  <url>\n`;
    xml += `    <loc>${siteUrl}/news/${art.slug}</loc>\n`;
    xml += `    <news:news>\n`;
    xml += `      <news:publication>\n`;
    xml += `        <news:name>TipOffPh</news:name>\n`;
    xml += `        <news:language>en-PH</news:language>\n`;
    xml += `      </news:publication>\n`;
    xml += `      <news:publication_date>${art.publishedAt}</news:publication_date>\n`;
    xml += `      <news:title>${safeTitle}</news:title>\n`;
    xml += `    </news:news>\n`;
    xml += `  </url>\n`;
  }

  xml += `</urlset>`;

  setResponseHeader(event, 'Content-Type', 'text/xml; charset=utf-8');
  return xml;
});

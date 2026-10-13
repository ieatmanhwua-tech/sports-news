import { ArticleRepository } from '../utils/repository';

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  const siteUrl = (config.public.siteUrl || 'https://tipoffph.com').replace(/\/$/, '');

  const { articles } = await ArticleRepository.getPublicArticles({ limit: 50 });

  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
  xml += `<rss version="2.0" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:atom="http://www.w3.org/2005/Atom">\n`;
  xml += `  <channel>\n`;
  xml += `    <title>TipOffPh - Philippine Basketball News &amp; Updates</title>\n`;
  xml += `    <link>${siteUrl}</link>\n`;
  xml += `    <description>The premier independent Philippine basketball news publication covering PBA, MPBL, UAAP, NCAA, and Gilas Pilipinas.</description>\n`;
  xml += `    <language>en-PH</language>\n`;
  xml += `    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>\n`;
  xml += `    <atom:link href="${siteUrl}/rss.xml" rel="self" type="application/rss+xml"/>\n`;

  for (const art of articles) {
    const safeTitle = art.title.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    const safeExcerpt = art.excerpt.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    const pubDateRfc822 = new Date(art.publishedAt).toUTCString();
    const authorName = art.author?.name || 'TipOffPh Staff';

    xml += `    <item>\n`;
    xml += `      <title>${safeTitle}</title>\n`;
    xml += `      <link>${siteUrl}/news/${art.slug}</link>\n`;
    xml += `      <guid isPermaLink="true">${siteUrl}/news/${art.slug}</guid>\n`;
    xml += `      <description>${safeExcerpt}</description>\n`;
    xml += `      <dc:creator>${authorName}</dc:creator>\n`;
    xml += `      <pubDate>${pubDateRfc822}</pubDate>\n`;
    xml += `      <category>${art.category?.name || 'Basketball'}</category>\n`;
    xml += `    </item>\n`;
  }

  xml += `  </channel>\n`;
  xml += `</rss>`;

  setResponseHeader(event, 'Content-Type', 'application/rss+xml; charset=utf-8');
  return xml;
});

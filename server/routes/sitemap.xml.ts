import { ArticleRepository } from '../utils/repository';
import { CategoryRepository } from '../utils/common-repositories';

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  const host = getRequestHeader(event, 'host');
  const proto = getRequestHeader(event, 'x-forwarded-proto') || 'https';
  const siteUrl = (config.public.siteUrl || (host ? `${proto}://${host}` : 'https://tipoffph.com')).replace(/\/$/, '');

  // Fetch published articles
  const { articles } = await ArticleRepository.getPublicArticles({ limit: 1000 });
  const categories = await CategoryRepository.getAllCategoriesWithCounts();

  // Filter categories to only those with published content (as per requirement: "Register secondary categories now, but show them prominently and allow indexing only when they have genuine published content. Empty archives should have honest empty states and noindex.")
  const populatedCategories = categories.filter(c => c.articleCount > 0);

  const staticRoutes = [
    { loc: `${siteUrl}/`, changefreq: 'daily', priority: '1.0' },
    { loc: `${siteUrl}/latest-news`, changefreq: 'hourly', priority: '0.9' },
    { loc: `${siteUrl}/local-sports`, changefreq: 'hourly', priority: '0.9' },
    { loc: `${siteUrl}/scores-and-schedules`, changefreq: 'hourly', priority: '0.9' },
    { loc: `${siteUrl}/nba-odds`, changefreq: 'hourly', priority: '0.8' },
    { loc: `${siteUrl}/about-us`, changefreq: 'monthly', priority: '0.5' },
    { loc: `${siteUrl}/contact`, changefreq: 'monthly', priority: '0.5' },
    { loc: `${siteUrl}/write-for-us`, changefreq: 'monthly', priority: '0.5' },
    { loc: `${siteUrl}/editorial-policy`, changefreq: 'monthly', priority: '0.4' },
    { loc: `${siteUrl}/corrections-policy`, changefreq: 'monthly', priority: '0.4' },
    { loc: `${siteUrl}/privacy-policy`, changefreq: 'yearly', priority: '0.3' },
    { loc: `${siteUrl}/terms`, changefreq: 'yearly', priority: '0.3' }
  ];

  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
  xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

  // Static routes
  for (const r of staticRoutes) {
    xml += `  <url>\n    <loc>${r.loc}</loc>\n    <changefreq>${r.changefreq}</changefreq>\n    <priority>${r.priority}</priority>\n  </url>\n`;
  }

  // Populated category archives
  for (const cat of populatedCategories) {
    xml += `  <url>\n    <loc>${siteUrl}${cat.path}</loc>\n    <changefreq>daily</changefreq>\n    <priority>0.7</priority>\n  </url>\n`;
  }

  // Articles
  for (const art of articles) {
    const lastMod = art.updatedAt || art.publishedAt;
    xml += `  <url>\n    <loc>${siteUrl}/news/${art.slug}</loc>\n    <lastmod>${lastMod}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.8</priority>\n  </url>\n`;
  }

  xml += `</urlset>`;

  setResponseHeader(event, 'Content-Type', 'text/xml; charset=utf-8');
  return xml;
});

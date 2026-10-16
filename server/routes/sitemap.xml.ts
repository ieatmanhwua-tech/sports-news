import { ArticleRepository } from '../utils/repository';
import { CategoryRepository } from '../utils/common-repositories';
import { SEO_TABS, PRODUCTION_DOMAIN } from '../../shared/seo-routing';

export default defineEventHandler(async (event) => {
  const siteUrl = PRODUCTION_DOMAIN;

  // Fetch published articles
  const { articles } = await ArticleRepository.getPublicArticles({ limit: 1000 });
  const categories = await CategoryRepository.getAllCategoriesWithCounts();
  const populatedCategories = categories.filter(c => c.articleCount > 0);

  const staticRoutes = [
    { loc: `${siteUrl}/`, changefreq: 'hourly', priority: '1.0' },
    ...SEO_TABS.map(tab => ({
      loc: `${siteUrl}${tab.cleanPath}`,
      changefreq: 'always',
      priority: '0.95'
    })),
    { loc: `${siteUrl}/latest-news`, changefreq: 'hourly', priority: '0.9' },
    { loc: `${siteUrl}/local-sports`, changefreq: 'hourly', priority: '0.9' },
    { loc: `${siteUrl}/scores-and-schedules`, changefreq: 'hourly', priority: '0.9' },
    { loc: `${siteUrl}/nba-odds`, changefreq: 'hourly', priority: '0.85' },
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

  for (const r of staticRoutes) {
    xml += `  <url>\n    <loc>${r.loc}</loc>\n    <changefreq>${r.changefreq}</changefreq>\n    <priority>${r.priority}</priority>\n  </url>\n`;
  }

  for (const cat of populatedCategories) {
    xml += `  <url>\n    <loc>${siteUrl}${cat.path}</loc>\n    <changefreq>daily</changefreq>\n    <priority>0.7</priority>\n  </url>\n`;
  }

  for (const art of articles) {
    const lastMod = art.updatedAt || art.publishedAt;
    xml += `  <url>\n    <loc>${siteUrl}/news/${art.slug}</loc>\n    <lastmod>${lastMod}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.8</priority>\n  </url>\n`;
  }

  xml += `</urlset>`;

  setResponseHeader(event, 'Content-Type', 'text/xml; charset=utf-8');
  return xml;
});

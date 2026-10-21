import { ArticleRepository } from '../utils/repository';
import { CategoryRepository } from '../utils/common-repositories';
import { fetchLocalSportsData } from '../utils/local-sports';
import {
  SEO_TABS,
  PRODUCTION_DOMAIN,
  STATIC_BLOG_POSTS,
  isStrictNbaOrPbaMatch,
  getMatchPredictionSlug,
  getMatchReportSlug,
  getMatchWatchSlug,
  buildProductionCanonicalUrl
} from '../../shared/seo-routing';

export default defineEventHandler(async (event) => {
  const siteUrl = PRODUCTION_DOMAIN;

  // Fetch published articles, categories, and active NBA/PBA matches
  const [{ articles }, categories, sportsData] = await Promise.all([
    ArticleRepository.getPublicArticles({ limit: 1000 }),
    CategoryRepository.getAllCategoriesWithCounts(),
    fetchLocalSportsData(false).catch(() => null)
  ]);
  const populatedCategories = categories.filter(c => c.articleCount > 0);
  const allMatches = Array.isArray(sportsData?.allMatches) ? sportsData.allMatches : [];

  const seenLocs = new Set<string>();
  const entries: Array<{ loc: string; lastmod?: string; changefreq: string; priority: string }> = [];

  const addEntry = (loc: string, changefreq: string, priority: string, lastmod?: string) => {
    const cleanLoc = loc.trim();
    if (!cleanLoc || seenLocs.has(cleanLoc)) return;
    seenLocs.add(cleanLoc);
    entries.push({ loc: cleanLoc, lastmod, changefreq, priority });
  };

  addEntry(`${siteUrl}/`, 'hourly', '1.0');
  for (const tab of SEO_TABS) {
    addEntry(`${siteUrl}${tab.cleanPath}`, 'always', '0.95');
  }

  addEntry(`${siteUrl}/nba`, 'hourly', '0.95');
  addEntry(`${siteUrl}/latest-news`, 'hourly', '0.9');
  addEntry(`${siteUrl}/local-sports`, 'hourly', '0.9');
  addEntry(`${siteUrl}/scores-and-schedules`, 'hourly', '0.9');
  addEntry(`${siteUrl}/nba-odds`, 'hourly', '0.85');
  addEntry(`${siteUrl}/about-us`, 'monthly', '0.5');
  addEntry(`${siteUrl}/contact`, 'monthly', '0.5');
  addEntry(`${siteUrl}/write-for-us`, 'monthly', '0.5');
  addEntry(`${siteUrl}/editorial-policy`, 'monthly', '0.4');
  addEntry(`${siteUrl}/corrections-policy`, 'monthly', '0.4');
  addEntry(`${siteUrl}/privacy-policy`, 'yearly', '0.3');
  addEntry(`${siteUrl}/terms`, 'yearly', '0.3');

  for (const cat of populatedCategories) {
    addEntry(`${siteUrl}${cat.path}`, 'daily', '0.7');
  }

  // Static & Curated Prediction + Post-Game Highlight Blogs (/prediction/<slug>/ and /report/<slug>/)
  for (const post of STATIC_BLOG_POSTS) {
    const isRecap = post.type === 'highlight' || post.status === 'finished';
    const canonical = post.canonicalUrl || buildProductionCanonicalUrl(isRecap ? 'report' : 'prediction', post.slug);
    addEntry(canonical, 'hourly', '0.9', post.publishedAt);
  }

  // Dynamic Automated Prediction Blogs (/prediction/<slug>/) & Post-Game Recap Blogs (/report/<slug>/)
  for (const match of allMatches) {
    if (!isStrictNbaOrPbaMatch(match)) continue;
    const modIso = match.startTimeIso || match.startTime || new Date().toISOString();
    if (match.status === 'finished') {
      const reportUrl = buildProductionCanonicalUrl('report', getMatchReportSlug(match));
      addEntry(reportUrl, 'daily', '0.9', modIso);
    } else {
      const predUrl = buildProductionCanonicalUrl('prediction', getMatchPredictionSlug(match));
      addEntry(predUrl, 'hourly', '0.9', modIso);
      const watchUrl = buildProductionCanonicalUrl('watch', getMatchWatchSlug(match));
      addEntry(watchUrl, 'hourly', '0.85', modIso);
    }
  }

  // All Published News, Pre-Game Match Preview Blogs, and Post-Game Recap Articles (/news/<slug>)
  for (const art of articles) {
    const lastMod = art.updatedAt || art.publishedAt;
    addEntry(`${siteUrl}/news/${art.slug}`, 'daily', '0.85', lastMod);
  }

  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
  xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

  for (const entry of entries) {
    xml += `  <url>\n`;
    xml += `    <loc>${entry.loc}</loc>\n`;
    if (entry.lastmod) {
      xml += `    <lastmod>${entry.lastmod}</lastmod>\n`;
    }
    xml += `    <changefreq>${entry.changefreq}</changefreq>\n`;
    xml += `    <priority>${entry.priority}</priority>\n`;
    xml += `  </url>\n`;
  }

  xml += `</urlset>`;

  setResponseHeader(event, 'Content-Type', 'text/xml; charset=utf-8');
  return xml;
});

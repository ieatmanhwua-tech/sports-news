import { ArticleRepository } from '../utils/repository';
import { fetchLocalSportsData } from '../utils/local-sports';
import {
  PRODUCTION_DOMAIN,
  STATIC_BLOG_POSTS,
  isStrictNbaOrPbaMatch,
  getMatchPredictionSlug,
  getMatchReportSlug,
  buildProductionCanonicalUrl,
  generatePredictionBlogForMatch,
  generateHighlightReportForMatch
} from '../../shared/seo-routing';

function escapeXml(raw: string): string {
  return String(raw || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export default defineEventHandler(async (event) => {
  const siteUrl = PRODUCTION_DOMAIN;

  const [{ articles }, sportsData] = await Promise.all([
    ArticleRepository.getPublicArticles({ limit: 1000 }),
    fetchLocalSportsData(false).catch(() => null)
  ]);

  const nowMs = Date.now();
  const seventyTwoHoursAgo = nowMs - 72 * 60 * 60 * 1000;

  const seenLocs = new Set<string>();
  const newsEntries: Array<{ loc: string; pubDate: string; title: string }> = [];

  const addNewsItem = (loc: string, pubDate: string, title: string) => {
    const cleanLoc = loc.trim();
    if (!cleanLoc || seenLocs.has(cleanLoc)) return;
    seenLocs.add(cleanLoc);
    newsEntries.push({
      loc: cleanLoc,
      pubDate: pubDate || new Date().toISOString(),
      title
    });
  };

  // 1. Recent /news/<slug> articles (including automated pre-game prediction blogs & post-game recaps)
  for (const art of articles) {
    const pubTime = new Date(art.publishedAt).getTime();
    if (pubTime >= seventyTwoHoursAgo && pubTime <= nowMs + 24 * 3600 * 1000) {
      addNewsItem(`${siteUrl}/news/${art.slug}`, art.publishedAt, art.title);
    }
  }

  // 2. Automated /prediction/<slug>/ and /report/<slug>/ blog posts from live/today/finished NBA & PBA games
  const allMatches = Array.isArray(sportsData?.allMatches) ? sportsData.allMatches : [];
  for (const match of allMatches.slice(0, 30)) {
    if (!isStrictNbaOrPbaMatch(match)) continue;
    if (match.status === 'finished') {
      const rep = generateHighlightReportForMatch(match);
      addNewsItem(
        buildProductionCanonicalUrl('report', getMatchReportSlug(match)),
        rep.publishedAt,
        rep.headline
      );
    } else {
      const pred = generatePredictionBlogForMatch(match);
      addNewsItem(
        buildProductionCanonicalUrl('prediction', getMatchPredictionSlug(match)),
        pred.publishedAt,
        pred.headline
      );
    }
  }

  // 3. Static prediction & highlight recap blog posts
  for (const post of STATIC_BLOG_POSTS) {
    const isRecap = post.type === 'highlight' || post.status === 'finished';
    const canonical = post.canonicalUrl || buildProductionCanonicalUrl(isRecap ? 'report' : 'prediction', post.slug);
    addNewsItem(canonical, post.publishedAt, post.headline);
  }

  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
  xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"\n`;
  xml += `        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">\n`;

  for (const item of newsEntries) {
    xml += `  <url>\n`;
    xml += `    <loc>${escapeXml(item.loc)}</loc>\n`;
    xml += `    <news:news>\n`;
    xml += `      <news:publication>\n`;
    xml += `        <news:name>TipOff PH</news:name>\n`;
    xml += `        <news:language>en-PH</news:language>\n`;
    xml += `      </news:publication>\n`;
    xml += `      <news:publication_date>${escapeXml(item.pubDate)}</news:publication_date>\n`;
    xml += `      <news:title>${escapeXml(item.title)}</news:title>\n`;
    xml += `    </news:news>\n`;
    xml += `  </url>\n`;
  }

  xml += `</urlset>`;

  setResponseHeader(event, 'Content-Type', 'text/xml; charset=utf-8');
  return xml;
});

import {
  publishUrlToGoogleIndexing,
  syncGscSitemaps,
  getGscIndexingSummary,
  type IndexingCategory
} from '../../utils/gsc-indexing';
import { ensureTodaysMatchBlogsSynced } from '../../utils/match-blogs';

export default defineEventHandler(async (event) => {
  const body = await readBody(event).catch(() => ({}));
  const action = String(body?.action || 'sync_all');

  if (action === 'index_url' && body?.url) {
    const category = (body.category as IndexingCategory) || 'prediction';
    const title = String(body.title || body.url);
    const record = await publishUrlToGoogleIndexing(String(body.url), category, title);
    const summary = await getGscIndexingSummary(false);
    return {
      ok: record.status === 'indexed',
      record,
      summary
    };
  }

  if (action === 'ping_sitemaps') {
    await syncGscSitemaps(true);
    const summary = await getGscIndexingSummary(false);
    return {
      ok: true,
      summary
    };
  }

  // Default: sync_all — force sync of automated prediction & post-game match blogs and ping sitemaps
  await ensureTodaysMatchBlogsSynced(true);
  await syncGscSitemaps(true);
  const summary = await getGscIndexingSummary(false);

  return {
    ok: true,
    summary
  };
});

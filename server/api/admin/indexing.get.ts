import { getGscIndexingSummary } from '../../utils/gsc-indexing';
import { ensureTodaysMatchBlogsSynced } from '../../utils/match-blogs';

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const refresh = query.refresh === '1' || query.refresh === 'true';

  await ensureTodaysMatchBlogsSynced(false);
  const summary = await getGscIndexingSummary(refresh);

  return summary;
});

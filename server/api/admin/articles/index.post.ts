import { requireAdminSession } from '../../../utils/auth';
import { ArticleRepository } from '../../../utils/repository';

export default defineEventHandler(async (event) => {
  requireAdminSession(event);
  const body = await readBody(event);

  if (!body.title || !body.slug) {
    throw createError({ statusCode: 400, statusMessage: 'Title and slug are required' });
  }

  const saved = await ArticleRepository.saveArticle(body);
  return { success: true, article: saved };
});

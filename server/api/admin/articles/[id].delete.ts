import { requireAdminSession } from '../../../utils/auth';
import { ArticleRepository } from '../../../utils/repository';

export default defineEventHandler(async (event) => {
  requireAdminSession(event);
  const id = getRouterParam(event, 'id');
  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'Article ID is required' });
  }

  const success = await ArticleRepository.deleteArticle(id);
  return { success };
});

import { requireAdminSession } from '../../../utils/auth';
import { ArticleRepository } from '../../../utils/repository';

export default defineEventHandler(async (event) => {
  requireAdminSession(event);
  const id = getRouterParam(event, 'id');
  const body = await readBody(event);

  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'Article ID is required' });
  }

  const saved = await ArticleRepository.saveArticle({
    ...body,
    id
  });

  return { success: true, article: saved };
});

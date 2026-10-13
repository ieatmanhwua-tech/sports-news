import { requireAdminSession } from '../../../utils/auth';
import { ArticleRepository } from '../../../utils/repository';

export default defineEventHandler(async (event) => {
  requireAdminSession(event);
  const articles = await ArticleRepository.getAllArticlesForAdmin();
  return { articles };
});

import { AuthorRepository } from '../../utils/common-repositories';
import { ArticleRepository } from '../../utils/repository';

export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, 'slug');
  if (!slug) {
    throw createError({ statusCode: 400, statusMessage: 'Slug required' });
  }

  const author = await AuthorRepository.getAuthorBySlug(slug);
  if (!author) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Author Not Found',
      message: `No reporter or columnist matching "${slug}" was found.`
    });
  }

  const articlesResult = await ArticleRepository.getPublicArticles({
    authorSlug: slug,
    limit: 20
  });

  return {
    author,
    articles: articlesResult.articles,
    total: articlesResult.total
  };
});

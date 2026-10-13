import { ArticleRepository } from '../../utils/repository';

export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, 'slug');
  if (!slug) {
    throw createError({ statusCode: 400, statusMessage: 'Slug is required' });
  }

  const { article, redirectSlug } = await ArticleRepository.getPublicArticleBySlug(slug);

  if (redirectSlug) {
    // Return redirect signal
    return {
      redirect: true,
      statusCode: 301,
      targetUrl: `/news/${redirectSlug}`
    };
  }

  if (!article) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Article Not Found',
      message: `The article "${slug}" could not be found or has not been published yet.`
    });
  }

  // Fetch 3 related stories from same primary category
  const relatedResult = await ArticleRepository.getPublicArticles({
    categorySlug: article.primaryCategoryId,
    limit: 4
  });
  const related = relatedResult.articles.filter(a => a.id !== article.id).slice(0, 3);

  return {
    article,
    related
  };
});

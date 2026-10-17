import { ArticleRepository } from '../../utils/repository';
import type { ContentType } from '../../../shared/types';

export default defineEventHandler(async (event) => {
  setResponseHeaders(event, {
    'Cache-Control': 'public, max-age=10, s-maxage=15, stale-while-revalidate=60'
  });
  const query = getQuery(event);

  const categorySlug = query.category ? String(query.category) : undefined;
  const topicSlug = query.topic ? String(query.topic) : undefined;
  const contentType = query.contentType ? (String(query.contentType) as ContentType) : undefined;
  const authorSlug = query.author ? String(query.author) : undefined;
  const searchQuery = query.q ? String(query.q) : undefined;
  const limit = query.limit ? Math.min(100, Math.max(1, Number(query.limit))) : 20;
  const page = query.page ? Math.max(1, Number(query.page)) : 1;
  const offset = (page - 1) * limit;

  const isFeatured = query.featured !== undefined ? query.featured === 'true' : undefined;
  const isBreaking = query.breaking !== undefined ? query.breaking === 'true' : undefined;

  const result = await ArticleRepository.getPublicArticles({
    categorySlug,
    topicSlug,
    contentType,
    authorSlug,
    searchQuery,
    limit,
    offset,
    isFeatured,
    isBreaking
  });

  return {
    articles: result.articles,
    total: result.total,
    page,
    limit,
    totalPages: Math.ceil(result.total / limit)
  };
});

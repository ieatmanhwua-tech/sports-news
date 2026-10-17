import { ArticleRepository } from '../utils/repository';
import type { Article, GameScore } from '../../shared/types';
import { getCurrentManilaDateParts } from '../../shared/ph-date';

function toLightweightCardArticle(a: Article): Article {
  return {
    ...a,
    // Homepage cards only display headline, excerpt, category, author, and image — omitting full body cuts SSR HTML payload size significantly
    body: '',
    category: a.category
      ? {
          id: a.category.id,
          slug: a.category.slug,
          name: a.category.name,
          sectionGroup: a.category.sectionGroup,
          path: a.category.path,
          description: '',
          seoTitle: '',
          seoDescription: '',
          badgeText: a.category.badgeText
        }
      : undefined,
    topics: undefined
  };
}

export default defineEventHandler(async (event) => {
  setResponseHeaders(event, {
    'Cache-Control': 'public, max-age=10, s-maxage=15, stale-while-revalidate=60'
  });

  const [
    breakingRes,
    featuredRes,
    latestRes,
    pbaRes,
    mpblRes,
    collegiateRes,
    gilasRes,
    scoresRes
  ] = await Promise.all([
    ArticleRepository.getPublicArticles({ isBreaking: true, limit: 1 }),
    ArticleRepository.getPublicArticles({ isFeatured: true, limit: 1 }),
    ArticleRepository.getPublicArticles({ limit: 8 }),
    ArticleRepository.getPublicArticles({ categorySlug: 'pba-news', limit: 4 }),
    ArticleRepository.getPublicArticles({ categorySlug: 'mpbl-news', limit: 4 }),
    ArticleRepository.getPublicArticles({ topicSlug: 'uaap-basketball', limit: 4 }),
    ArticleRepository.getPublicArticles({ categorySlug: 'gilas-pilipinas', limit: 4 }),
    $fetch<{ games: GameScore[]; lastUpdatedUtc?: string }>('/api/scores')
  ]);

  const manilaDate = getCurrentManilaDateParts();
  const rawBreaking = breakingRes.articles[0] || null;
  const rawFeatured = featuredRes.articles[0] || latestRes.articles[0] || null;

  return {
    manilaDate: manilaDate.ymd,
    manilaDateLabel: manilaDate.fullLabel,
    breaking: rawBreaking ? toLightweightCardArticle(rawBreaking) : null,
    featured: rawFeatured ? toLightweightCardArticle(rawFeatured) : null,
    latest: (latestRes.articles || []).map(toLightweightCardArticle),
    pba: (pbaRes.articles || []).map(toLightweightCardArticle),
    mpbl: (mpblRes.articles || []).map(toLightweightCardArticle),
    collegiate: (collegiateRes.articles || []).map(toLightweightCardArticle),
    gilas: (gilasRes.articles || []).map(toLightweightCardArticle),
    scores: (scoresRes.games || []).slice(0, 36)
  };
});

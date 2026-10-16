import { getDatabaseStatus, executeQuery, inMemoryStore } from '../db/client';
import { CATEGORIES_REGISTRY, CATEGORY_MAP, PARENT_CATEGORY_ALIASES } from '../../shared/categories';
import type { Article, Author, CategoryInfo, ContactSubmission, ContentType, ArticleStatus } from '../../shared/types';
import { ensureTodaysMatchBlogsSynced, buildFallbackMatchBlogForSlug } from './match-blogs';

export class ArticleRepository {
  /**
   * Get public articles with optional filters.
   * Only returns status = 'published'.
   */
  static async getPublicArticles(options: {
    categorySlug?: string;
    topicSlug?: string;
    contentType?: ContentType;
    authorSlug?: string;
    searchQuery?: string;
    limit?: number;
    offset?: number;
    isFeatured?: boolean;
    isBreaking?: boolean;
  } = {}): Promise<{ articles: Article[]; total: number }> {
    await ensureTodaysMatchBlogsSynced();
    const status = await getDatabaseStatus();

    const runInMemoryFallback = () => {
      let filtered = inMemoryStore.articles.filter(a => a.status === 'published');

      if (options.categorySlug) {
        const matchSlugs = PARENT_CATEGORY_ALIASES[options.categorySlug] || [options.categorySlug];
        filtered = filtered.filter(a =>
          matchSlugs.includes(a.primaryCategoryId) ||
          (a.topicIds && a.topicIds.some(t => matchSlugs.includes(t)))
        );
      }

      if (options.topicSlug) {
        const topic = options.topicSlug;
        filtered = filtered.filter(a =>
          a.primaryCategoryId === topic ||
          (a.topicIds && a.topicIds.includes(topic))
        );
      }

      if (options.contentType) {
        filtered = filtered.filter(a => a.contentType === options.contentType);
      }

      if (options.authorSlug) {
        const author = inMemoryStore.authors.find(ath => ath.slug === options.authorSlug);
        if (author) {
          filtered = filtered.filter(a => a.authorId === author.id);
        } else {
          return { articles: [], total: 0 };
        }
      }

      if (options.isFeatured !== undefined) {
        filtered = filtered.filter(a => a.isFeatured === options.isFeatured);
      }

      if (options.isBreaking !== undefined) {
        filtered = filtered.filter(a => a.isBreaking === options.isBreaking);
      }

      if (options.searchQuery && options.searchQuery.trim().length > 0) {
        const q = options.searchQuery.toLowerCase().trim();
        filtered = filtered.filter(a =>
          a.title.toLowerCase().includes(q) ||
          a.excerpt.toLowerCase().includes(q) ||
          a.body.toLowerCase().includes(q)
        );
      }

      // Sort newest-first deterministically
      filtered.sort((a, b) => {
        return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
      });

      const total = filtered.length;
      const offset = options.offset || 0;
      const limit = options.limit || 20;
      const sliced = filtered.slice(offset, offset + limit);

      inMemoryStore.refreshRelations();
      return { articles: sliced, total };
    };

    if (status.mode !== 'MYSQL') {
      return runInMemoryFallback();
    }

    try {
      // MYSQL Mode
      const conditions: string[] = ["a.status = 'published'", 'a.published_at <= NOW()'];
      const params: any[] = [];

      if (options.categorySlug) {
        const matchSlugs = PARENT_CATEGORY_ALIASES[options.categorySlug] || [options.categorySlug];
        conditions.push('(a.primary_category_id IN (?) OR EXISTS (SELECT 1 FROM article_topics at WHERE at.article_id = a.id AND at.category_id IN (?)))');
        params.push(matchSlugs, matchSlugs);
      }

      if (options.topicSlug) {
        conditions.push('(a.primary_category_id = ? OR EXISTS (SELECT 1 FROM article_topics at WHERE at.article_id = a.id AND at.category_id = ?))');
        params.push(options.topicSlug, options.topicSlug);
      }

      if (options.contentType) {
        conditions.push('a.content_type = ?');
        params.push(options.contentType);
      }

      if (options.authorSlug) {
        conditions.push('ath.slug = ?');
        params.push(options.authorSlug);
      }

      if (options.isFeatured !== undefined) {
        conditions.push('a.is_featured = ?');
        params.push(options.isFeatured ? 1 : 0);
      }

      if (options.isBreaking !== undefined) {
        conditions.push('a.is_breaking = ?');
        params.push(options.isBreaking ? 1 : 0);
      }

      if (options.searchQuery && options.searchQuery.trim().length > 0) {
        const q = `%${options.searchQuery.trim()}%`;
        conditions.push('(a.title LIKE ? OR a.excerpt LIKE ? OR a.body LIKE ?)');
        params.push(q, q, q);
      }

      const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
      
      // Count total
      const countSql = `
        SELECT COUNT(DISTINCT a.id) as total
        FROM articles a
        JOIN authors ath ON a.author_id = ath.id
        JOIN categories c ON a.primary_category_id = c.id
        ${whereClause}
      `;
      const countRows = await executeQuery<{ total: number }>(countSql, params);
      const total = countRows[0]?.total || 0;

      // Fetch page
      const limit = options.limit || 20;
      const offset = options.offset || 0;
      const dataSql = `
        SELECT 
          a.id, a.slug, a.title, a.excerpt, a.body, a.primary_category_id as primaryCategoryId,
          a.author_id as authorId, a.content_type as contentType, a.source_url as sourceUrl,
          a.source_name as sourceName, a.featured_image_url as featuredImageUrl,
          a.image_alt as imageAlt, a.image_credit as imageCredit, a.seo_title as seoTitle,
          a.seo_description as seoDescription, a.is_featured as isFeatured, a.is_breaking as isBreaking,
          a.status, a.published_at as publishedAt, a.updated_at as updatedAt, a.created_at as createdAt,
          ath.id as ath_id, ath.slug as ath_slug, ath.name as ath_name, ath.bio as ath_bio,
          ath.role as ath_role, ath.email as ath_email, ath.avatar_url as ath_avatar, ath.twitter_handle as ath_twitter,
          c.id as cat_id, c.slug as cat_slug, c.name as cat_name, c.section_group as cat_group,
          c.description as cat_desc, c.seo_title as cat_seo_title, c.seo_description as cat_seo_desc,
          c.badge_text as cat_badge
        FROM articles a
        JOIN authors ath ON a.author_id = ath.id
        JOIN categories c ON a.primary_category_id = c.id
        ${whereClause}
        ORDER BY a.published_at DESC
        LIMIT ? OFFSET ?
      `;

      const rows = await executeQuery<any>(dataSql, [...params, limit, offset]);
      const articles: Article[] = rows.map(r => ({
        id: r.id,
        slug: r.slug,
        title: r.title,
        excerpt: r.excerpt,
        body: r.body,
        primaryCategoryId: r.primaryCategoryId,
        authorId: r.authorId,
        contentType: r.contentType,
        sourceUrl: r.sourceUrl,
        sourceName: r.sourceName,
        featuredImageUrl: r.featuredImageUrl,
        imageAlt: r.imageAlt,
        imageCredit: r.imageCredit,
        seoTitle: r.seoTitle,
        seoDescription: r.seoDescription,
        isFeatured: Boolean(r.isFeatured),
        isBreaking: Boolean(r.isBreaking),
        status: r.status,
        publishedAt: new Date(r.publishedAt).toISOString(),
        updatedAt: r.updatedAt ? new Date(r.updatedAt).toISOString() : undefined,
        createdAt: new Date(r.createdAt).toISOString(),
        category: {
          id: r.cat_id,
          slug: r.cat_slug,
          name: r.cat_name,
          sectionGroup: r.cat_group,
          path: `/${r.cat_slug}`,
          description: r.cat_desc,
          seoTitle: r.cat_seo_title,
          seoDescription: r.cat_seo_desc,
          badgeText: r.cat_badge
        },
        author: {
          id: r.ath_id,
          slug: r.ath_slug,
          name: r.ath_name,
          bio: r.ath_bio,
          role: r.ath_role,
          email: r.ath_email,
          avatarUrl: r.ath_avatar,
          twitterHandle: r.ath_twitter
        }
      }));

      return { articles, total };
    } catch (err: any) {
      console.warn('[Database] MySQL query failed, falling back to integrated data store:', err?.message);
      return runInMemoryFallback();
    }
  }

  /**
   * Get single article by slug for public view.
   * Checks slug_redirects if slug moved.
   */
  static async getPublicArticleBySlug(slug: string): Promise<{ article: Article | null; redirectSlug?: string }> {
    await ensureTodaysMatchBlogsSynced();
    const status = await getDatabaseStatus();
    const cleanSlug = decodeURIComponent(String(slug || '')).trim().replace(/\/+$/, '');
    const lowerSlug = cleanSlug.toLowerCase();

    const runInMemoryFallback = () => {
      // Check redirect map
      const redirectedTo = inMemoryStore.slugRedirects.get(cleanSlug) || inMemoryStore.slugRedirects.get(lowerSlug);
      if (redirectedTo) {
        return { article: null, redirectSlug: redirectedTo };
      }

      inMemoryStore.refreshRelations();
      const normalizedTarget = lowerSlug.replace(/-highlights-box-score$/, '-match-blog-today');
      const altTarget = lowerSlug.replace(/-match-blog-today$/, '-highlights-box-score');

      let article = inMemoryStore.articles.find(a => {
        const s = String(a.slug || '').toLowerCase();
        return (s === lowerSlug || s === normalizedTarget || s === altTarget) && a.status === 'published';
      });

      if (!article) {
        article = buildFallbackMatchBlogForSlug(lowerSlug) || undefined;
      }

      return { article: article || null };
    };

    if (status.mode !== 'MYSQL') {
      return runInMemoryFallback();
    }

    try {
      // Check redirect in MySQL
      const redirectRows = await executeQuery<{ new_slug: string }>(
        'SELECT new_slug FROM slug_redirects WHERE old_slug = ? LIMIT 1',
        [cleanSlug]
      );
      if (redirectRows.length > 0 && redirectRows[0]) {
        return { article: null, redirectSlug: redirectRows[0].new_slug };
      }

      // Query article
      const sql = `
        SELECT 
          a.id, a.slug, a.title, a.excerpt, a.body, a.primary_category_id as primaryCategoryId,
          a.author_id as authorId, a.content_type as contentType, a.source_url as sourceUrl,
          a.source_name as sourceName, a.featured_image_url as featuredImageUrl,
          a.image_alt as imageAlt, a.image_credit as imageCredit, a.seo_title as seoTitle,
          a.seo_description as seoDescription, a.is_featured as isFeatured, a.is_breaking as isBreaking,
          a.status, a.published_at as publishedAt, a.updated_at as updatedAt, a.created_at as createdAt,
          ath.id as ath_id, ath.slug as ath_slug, ath.name as ath_name, ath.bio as ath_bio,
          ath.role as ath_role, ath.email as ath_email, ath.avatar_url as ath_avatar, ath.twitter_handle as ath_twitter,
          c.id as cat_id, c.slug as cat_slug, c.name as cat_name, c.section_group as cat_group,
          c.description as cat_desc, c.seo_title as cat_seo_title, c.seo_description as cat_seo_desc,
          c.badge_text as cat_badge
        FROM articles a
        JOIN authors ath ON a.author_id = ath.id
        JOIN categories c ON a.primary_category_id = c.id
        WHERE a.slug = ? AND a.status = 'published'
        LIMIT 1
      `;

      const rows = await executeQuery<any>(sql, [cleanSlug]);
      if (rows.length === 0) return runInMemoryFallback();

      const r = rows[0];
      const article: Article = {
        id: r.id,
        slug: r.slug,
        title: r.title,
        excerpt: r.excerpt,
        body: r.body,
        primaryCategoryId: r.primaryCategoryId,
        authorId: r.authorId,
        contentType: r.contentType,
        sourceUrl: r.sourceUrl,
        sourceName: r.sourceName,
        featuredImageUrl: r.featuredImageUrl,
        imageAlt: r.imageAlt,
        imageCredit: r.imageCredit,
        seoTitle: r.seoTitle,
        seoDescription: r.seoDescription,
        isFeatured: Boolean(r.isFeatured),
        isBreaking: Boolean(r.isBreaking),
        status: r.status,
        publishedAt: new Date(r.publishedAt).toISOString(),
        updatedAt: r.updatedAt ? new Date(r.updatedAt).toISOString() : undefined,
        createdAt: new Date(r.createdAt).toISOString(),
        category: {
          id: r.cat_id,
          slug: r.cat_slug,
          name: r.cat_name,
          sectionGroup: r.cat_group,
          path: `/${r.cat_slug}`,
          description: r.cat_desc,
          seoTitle: r.cat_seo_title,
          seoDescription: r.cat_seo_desc,
          badgeText: r.cat_badge
        },
        author: {
          id: r.ath_id,
          slug: r.ath_slug,
          name: r.ath_name,
          bio: r.ath_bio,
          role: r.ath_role,
          email: r.ath_email,
          avatarUrl: r.ath_avatar,
          twitterHandle: r.ath_twitter
        }
      };

      return { article };
    } catch (err: any) {
      console.warn('[Database] MySQL query failed, falling back to integrated data store:', err?.message);
      return runInMemoryFallback();
    }
  }

  /**
   * Admin: Get all articles (including drafts, scheduled, archived)
   */
  static async getAllArticlesForAdmin(): Promise<Article[]> {
    const status = await getDatabaseStatus();

    const runInMemoryFallback = () => {
      inMemoryStore.refreshRelations();
      return [...inMemoryStore.articles].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    };

    if (status.mode !== 'MYSQL') {
      return runInMemoryFallback();
    }

    try {
      const sql = `
        SELECT 
          a.id, a.slug, a.title, a.excerpt, a.body, a.primary_category_id as primaryCategoryId,
          a.author_id as authorId, a.content_type as contentType, a.source_url as sourceUrl,
          a.source_name as sourceName, a.featured_image_url as featuredImageUrl,
          a.image_alt as imageAlt, a.image_credit as imageCredit, a.seo_title as seoTitle,
          a.seo_description as seoDescription, a.is_featured as isFeatured, a.is_breaking as isBreaking,
          a.status, a.published_at as publishedAt, a.updated_at as updatedAt, a.created_at as createdAt,
          ath.name as ath_name, c.name as cat_name
        FROM articles a
        JOIN authors ath ON a.author_id = ath.id
        JOIN categories c ON a.primary_category_id = c.id
        ORDER BY a.created_at DESC
      `;
      const rows = await executeQuery<any>(sql);
      return rows.map(r => ({
        id: r.id,
        slug: r.slug,
        title: r.title,
        excerpt: r.excerpt,
        body: r.body,
        primaryCategoryId: r.primaryCategoryId,
        authorId: r.authorId,
        contentType: r.contentType,
        sourceUrl: r.sourceUrl,
        sourceName: r.sourceName,
        featuredImageUrl: r.featuredImageUrl,
        imageAlt: r.imageAlt,
        imageCredit: r.imageCredit,
        seoTitle: r.seoTitle,
        seoDescription: r.seoDescription,
        isFeatured: Boolean(r.isFeatured),
        isBreaking: Boolean(r.isBreaking),
        status: r.status,
        publishedAt: new Date(r.publishedAt).toISOString(),
        updatedAt: r.updatedAt ? new Date(r.updatedAt).toISOString() : undefined,
        createdAt: new Date(r.createdAt).toISOString()
      }));
    } catch (err: any) {
      console.warn('[Database] MySQL query failed, falling back to integrated data store:', err?.message);
      return runInMemoryFallback();
    }
  }

  /**
   * Admin: Create or update article with slug redirect support.
   * Persists to disk immediately, and mirrors to MySQL if active.
   */
  static async saveArticle(article: Partial<Article>): Promise<Article> {
    const status = await getDatabaseStatus();

    let savedArticle: Article;
    let existingIndex = -1;
    if (article.id) {
      existingIndex = inMemoryStore.articles.findIndex(a => a.id === article.id);
    }

    if (existingIndex >= 0 && inMemoryStore.articles[existingIndex]) {
      const existing = inMemoryStore.articles[existingIndex]!;
      // If slug changed, create redirect
      if (article.slug && article.slug !== existing.slug) {
        inMemoryStore.slugRedirects.set(existing.slug, article.slug);
      }

      const updated: Article = {
        ...existing,
        ...article,
        id: existing.id,
        createdAt: existing.createdAt,
        updatedAt: new Date().toISOString()
      } as Article;

      inMemoryStore.articles[existingIndex] = updated;
      inMemoryStore.refreshRelations();
      inMemoryStore.saveToDisk();
      savedArticle = updated;
    } else {
      // Create new
      const defaultAuthor = inMemoryStore.authors[0]?.id || 'author-default';
      const newArt: Article = {
        id: article.id || `art-${Date.now()}`,
        slug: article.slug || `article-${Date.now()}`,
        title: article.title || 'Untitled Story',
        excerpt: article.excerpt || '',
        body: article.body || '',
        primaryCategoryId: article.primaryCategoryId || 'pba-news',
        authorId: article.authorId || defaultAuthor,
        contentType: article.contentType || 'news',
        sourceUrl: article.sourceUrl,
        sourceName: article.sourceName,
        featuredImageUrl: article.featuredImageUrl || '/img/articles/pba-governors-cup-2026.webp',
        imageAlt: article.imageAlt || 'TipOffPh Basketball News',
        imageCredit: article.imageCredit || 'TipOffPh Staff',
        seoTitle: article.seoTitle,
        seoDescription: article.seoDescription,
        targetKeyword: article.targetKeyword,
        isFeatured: Boolean(article.isFeatured),
        isBreaking: Boolean(article.isBreaking),
        status: article.status || 'draft',
        publishedAt: article.publishedAt || new Date().toISOString(),
        createdAt: new Date().toISOString()
      };
      inMemoryStore.articles.unshift(newArt);
      inMemoryStore.refreshRelations();
      inMemoryStore.saveToDisk();
      savedArticle = newArt;
    }

    // In MySQL mode, mirror change
    if (status.mode === 'MYSQL') {
      try {
        if (article.id) {
          const existingRows = await executeQuery<{ slug: string }>('SELECT slug FROM articles WHERE id = ?', [article.id]);
          if (existingRows.length > 0 && existingRows[0] && existingRows[0].slug !== article.slug && article.slug) {
            await executeQuery(
              'INSERT INTO slug_redirects (id, old_slug, new_slug) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE new_slug = ?',
              [`red-${Date.now()}`, existingRows[0].slug, article.slug, article.slug]
            );
          }

          await executeQuery(
            `UPDATE articles SET 
              slug = ?, title = ?, excerpt = ?, body = ?, primary_category_id = ?,
              author_id = ?, content_type = ?, source_url = ?, source_name = ?,
              featured_image_url = ?, image_alt = ?, image_credit = ?, seo_title = ?,
              seo_description = ?, is_featured = ?, is_breaking = ?, status = ?,
              published_at = ?, updated_at = NOW()
            WHERE id = ?`,
            [
              savedArticle.slug, savedArticle.title, savedArticle.excerpt, savedArticle.body, savedArticle.primaryCategoryId,
              savedArticle.authorId, savedArticle.contentType, savedArticle.sourceUrl, savedArticle.sourceName,
              savedArticle.featuredImageUrl, savedArticle.imageAlt, savedArticle.imageCredit, savedArticle.seoTitle,
              savedArticle.seoDescription, savedArticle.isFeatured ? 1 : 0, savedArticle.isBreaking ? 1 : 0,
              savedArticle.status, savedArticle.publishedAt, savedArticle.id
            ]
          );
        } else {
          await executeQuery(
            `INSERT INTO articles (
              id, slug, title, excerpt, body, primary_category_id, author_id,
              content_type, source_url, source_name, featured_image_url, image_alt,
              image_credit, seo_title, seo_description, is_featured, is_breaking,
              status, published_at, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
            [
              savedArticle.id, savedArticle.slug, savedArticle.title, savedArticle.excerpt, savedArticle.body, savedArticle.primaryCategoryId,
              savedArticle.authorId, savedArticle.contentType, savedArticle.sourceUrl, savedArticle.sourceName,
              savedArticle.featuredImageUrl, savedArticle.imageAlt, savedArticle.imageCredit, savedArticle.seoTitle,
              savedArticle.seoDescription, savedArticle.isFeatured ? 1 : 0, savedArticle.isBreaking ? 1 : 0,
              savedArticle.status, savedArticle.publishedAt
            ]
          );
        }
      } catch (err: any) {
        console.warn('[Database] MySQL write mirror skipped, article saved in integrated store:', err?.message);
      }
    }

    return savedArticle;
  }

  /**
   * Delete article
   */
  static async deleteArticle(id: string): Promise<boolean> {
    const status = await getDatabaseStatus();
    const idx = inMemoryStore.articles.findIndex(a => a.id === id);
    if (idx >= 0) {
      inMemoryStore.articles.splice(idx, 1);
      inMemoryStore.saveToDisk();
    }

    if (status.mode === 'MYSQL') {
      try {
        await executeQuery('DELETE FROM articles WHERE id = ?', [id]);
      } catch (err: any) {
        console.warn('[Database] MySQL delete mirror skipped:', err?.message);
      }
    }

    return true;
  }
}

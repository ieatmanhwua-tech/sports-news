import bcrypt from 'bcryptjs';
import { getDatabaseStatus, executeQuery, inMemoryStore } from '../db/client';
import { CATEGORIES_REGISTRY, CATEGORY_MAP } from '../../shared/categories';
import type { Author, CategoryInfo, ContactSubmission } from '../../shared/types';

export class AuthorRepository {
  static async getAllAuthors(): Promise<Author[]> {
    const status = await getDatabaseStatus();
    if (status.mode === 'DEMO' || status.mode === 'STANDALONE') {
      return [...inMemoryStore.authors];
    }
    const rows = await executeQuery<any>('SELECT * FROM authors ORDER BY name ASC');
    return rows.map(r => ({
      id: r.id,
      slug: r.slug,
      name: r.name,
      bio: r.bio,
      role: r.role,
      email: r.email,
      avatarUrl: r.avatar_url,
      twitterHandle: r.twitter_handle,
      createdAt: r.created_at
    }));
  }

  static async getAuthorBySlug(slug: string): Promise<Author | null> {
    const status = await getDatabaseStatus();
    if (status.mode === 'DEMO' || status.mode === 'STANDALONE') {
      return inMemoryStore.authors.find(a => a.slug === slug) || null;
    }
    const rows = await executeQuery<any>('SELECT * FROM authors WHERE slug = ? LIMIT 1', [slug]);
    if (rows.length === 0) return null;
    const r = rows[0];
    return {
      id: r.id,
      slug: r.slug,
      name: r.name,
      bio: r.bio,
      role: r.role,
      email: r.email,
      avatarUrl: r.avatar_url,
      twitterHandle: r.twitter_handle,
      createdAt: r.created_at
    };
  }
}

export class CategoryRepository {
  static async getAllCategoriesWithCounts(): Promise<Array<CategoryInfo & { articleCount: number }>> {
    const status = await getDatabaseStatus();
    const nowUtc = new Date().toISOString();

    if (status.mode === 'DEMO' || status.mode === 'STANDALONE') {
      return CATEGORIES_REGISTRY.map(cat => {
        const count = inMemoryStore.articles.filter(a =>
          (a.primaryCategoryId === cat.slug || (a.topicIds && a.topicIds.includes(cat.slug))) &&
          a.status === 'published' &&
          new Date(a.publishedAt).getTime() <= new Date(nowUtc).getTime()
        ).length;
        return {
          ...cat,
          articleCount: count
        };
      });
    }

    // MySQL mode
    const countSql = `
      SELECT c.slug, COUNT(DISTINCT a.id) as count
      FROM categories c
      LEFT JOIN articles a ON (a.primary_category_id = c.id OR EXISTS (SELECT 1 FROM article_topics at WHERE at.article_id = a.id AND at.category_id = c.id))
        AND a.status = 'published' AND a.published_at <= NOW()
      GROUP BY c.slug
    `;
    const rows = await executeQuery<{ slug: string; count: number }>(countSql);
    const countMap = new Map(rows.map(r => [r.slug, r.count]));

    return CATEGORIES_REGISTRY.map(cat => ({
      ...cat,
      articleCount: countMap.get(cat.slug) || 0
    }));
  }

  static async getCategoryBySlug(slug: string): Promise<{ category: CategoryInfo; articleCount: number } | null> {
    const cat = CATEGORY_MAP.get(slug);
    if (!cat) return null;

    const all = await this.getAllCategoriesWithCounts();
    const found = all.find(c => c.slug === slug);
    return found ? { category: found, articleCount: found.articleCount } : { category: cat, articleCount: 0 };
  }
}

export class ContactRepository {
  static async saveSubmission(data: Omit<ContactSubmission, 'id' | 'createdAt'>): Promise<ContactSubmission> {
    const status = await getDatabaseStatus();
    const id = `sub-${Date.now()}`;
    const createdAt = new Date().toISOString();

    const submission: ContactSubmission = {
      ...data,
      id,
      createdAt
    };

    if (status.mode === 'DEMO' || status.mode === 'STANDALONE') {
      inMemoryStore.contactSubmissions.unshift(submission);
      return submission;
    }

    await executeQuery(
      `INSERT INTO contact_submissions (id, name, email, subject, message, type, phone, portfolio_url, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
      [
        id, data.name, data.email, data.subject, data.message, data.type,
        data.phone || null, data.portfolioUrl || null
      ]
    );

    return submission;
  }
}

export class AuthRepository {
  /**
   * Initialize default admin store or check credentials
   */
  static async verifyAdmin(username: string, passwordPlain: string): Promise<{ id: string; username: string; role: string } | null> {
    const status = await getDatabaseStatus();

    if (status.mode === 'DEMO' || status.mode === 'STANDALONE') {
      const customUser = inMemoryStore.adminUsers.find(u => u.username === username);
      if (customUser) {
        const matches = await bcrypt.compare(passwordPlain, customUser.passwordHash);
        if (matches) return { id: customUser.id, username: customUser.username, role: customUser.role };
        return null;
      }

      // Default editorial admin credentials
      if (username === 'admin' && passwordPlain === 'TipOffPh2026!') {
        return { id: 'admin-01', username: 'admin', role: 'superadmin' };
      }
      return null;
    }

    // In MySQL mode
    const rows = await executeQuery<any>(
      'SELECT id, username, password_hash, role FROM admin_users WHERE username = ? OR email = ? LIMIT 1',
      [username, username]
    );

    if (rows.length === 0) return null;
    const user = rows[0];
    const valid = await bcrypt.compare(passwordPlain, user.password_hash);
    if (!valid) return null;

    return { id: user.id, username: user.username, role: user.role };
  }

  static async createAdminUser(username: string, email: string, passwordPlain: string, role = 'editor'): Promise<boolean> {
    const status = await getDatabaseStatus();
    const hash = await bcrypt.hash(passwordPlain, 10);
    const id = `usr-${Date.now()}`;

    if (status.mode === 'DEMO' || status.mode === 'STANDALONE') {
      inMemoryStore.adminUsers.push({
        id,
        username,
        email,
        passwordHash: hash,
        role
      });
      inMemoryStore.saveToDisk();
      return true;
    }

    await executeQuery(
      'INSERT INTO admin_users (id, username, email, password_hash, role, created_at) VALUES (?, ?, ?, ?, ?, NOW())',
      [id, username, email, hash, role]
    );
    return true;
  }
}

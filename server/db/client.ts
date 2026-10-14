import mysql from 'mysql2/promise';
import type { Pool, PoolConnection } from 'mysql2/promise';
import fs from 'fs';
import path from 'path';
import { DEMO_ARTICLES, DEMO_AUTHORS, DEMO_SCORES } from './demo-fixtures';
import { CATEGORIES_REGISTRY, CATEGORY_MAP } from '../../shared/categories';
import type { Article, Author, CategoryInfo, ContactSubmission } from '../../shared/types';

export type DatabaseMode = 'STANDALONE' | 'MYSQL' | 'ERROR' | 'DEMO';

interface DatabaseStatus {
  mode: DatabaseMode;
  message: string;
  host?: string;
  database?: string;
  errorDetails?: string;
}

let pool: Pool | null = null;
let lastAttemptTime = 0;
let dbStatus: DatabaseStatus = {
  mode: 'STANDALONE',
  message: 'TipOffPh data engine active and operational.'
};

const DATA_DIR = path.resolve(process.cwd(), '.data');
const STORE_FILE = path.join(DATA_DIR, 'store.json');
const DB_CONFIG_FILE = path.join(DATA_DIR, 'db-config.json');

export function getSavedDbConfig(): { host?: string; port?: number; user?: string; password?: string; database?: string } | null {
  try {
    if (fs.existsSync(DB_CONFIG_FILE)) {
      return JSON.parse(fs.readFileSync(DB_CONFIG_FILE, 'utf-8'));
    }
  } catch {}
  return null;
}

export function saveDbConfig(cfg: { host: string; port: number; user: string; password?: string; database: string }) {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(DB_CONFIG_FILE, JSON.stringify(cfg, null, 2), 'utf-8');
    lastAttemptTime = 0; // Reset cache so immediate reconnection is tested
  } catch {}
}

// Persistent store for Standalone Mode
class InMemoryStore {
  authors: Author[] = [...DEMO_AUTHORS];
  categories: CategoryInfo[] = [...CATEGORIES_REGISTRY];
  articles: Article[] = [...DEMO_ARTICLES];
  contactSubmissions: ContactSubmission[] = [];
  slugRedirects: Map<string, string> = new Map();
  adminUsers: Array<{ id: string; username: string; email: string; passwordHash: string; role: string }> = [];

  constructor() {
    this.loadFromDisk();
    this.refreshRelations();
  }

  loadFromDisk() {
    try {
      if (fs.existsSync(STORE_FILE)) {
        const raw = fs.readFileSync(STORE_FILE, 'utf-8');
        const data = JSON.parse(raw);
        if (Array.isArray(data.articles) && data.articles.length > 0) {
          this.articles = data.articles;
        }
        if (Array.isArray(data.authors) && data.authors.length > 0) {
          this.authors = data.authors;
        }
        if (Array.isArray(data.adminUsers) && data.adminUsers.length > 0) {
          this.adminUsers = data.adminUsers;
        }
      }
    } catch {
      // ignore on error
    }
  }

  saveToDisk() {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      fs.writeFileSync(STORE_FILE, JSON.stringify({
        articles: this.articles,
        authors: this.authors,
        adminUsers: this.adminUsers
      }, null, 2), 'utf-8');
    } catch {
      // ignore on error
    }
  }

  refreshRelations() {
    for (const art of this.articles) {
      art.category = CATEGORY_MAP.get(art.primaryCategoryId);
      art.author = this.authors.find(a => a.id === art.authorId);
      if (art.topicIds && art.topicIds.length > 0) {
        art.topics = art.topicIds
          .map(tId => CATEGORY_MAP.get(tId))
          .filter((c): c is CategoryInfo => Boolean(c));
      }
    }
  }
}

export const inMemoryStore = new InMemoryStore();

export async function getDatabaseStatus(forceReconnect = false): Promise<DatabaseStatus> {
  const config = useRuntimeConfig();
  const savedConfig = getSavedDbConfig();
  const rawHost = savedConfig?.host || config.dbHost || process.env.DB_HOST || '';
  const dbHost = rawHost.trim();

  // If host is empty, operate in standalone mode immediately
  if (!dbHost) {
    dbStatus = {
      mode: 'STANDALONE',
      message: 'Active and running with TipOffPh integrated production data engine.'
    };
    return dbStatus;
  }

  // If pool already initialized and working
  if (pool && dbStatus.mode === 'MYSQL' && !forceReconnect) {
    return dbStatus;
  }

  // Throttle re-connection attempts to avoid stalling every HTTP request
  const now = Date.now();
  if (!forceReconnect && lastAttemptTime > 0 && (now - lastAttemptTime) < 30000) {
    return dbStatus;
  }

  lastAttemptTime = now;

  const dbPort = Number(savedConfig?.port || config.dbPort || process.env.DB_PORT || 3306);
  const dbUser = savedConfig?.user || config.dbUser || process.env.DB_USER || 'u697549935_tipoff';
  const dbPassword = savedConfig?.password || config.dbPassword || process.env.DB_PASSWORD || 'Kw~b!$#n4/U';
  const dbName = savedConfig?.database || config.dbName || process.env.DB_NAME || 'u697549935_tipoffph';

  // Attempt connection
  try {
    if (pool) {
      try { await pool.end(); } catch {}
      pool = null;
    }

    pool = mysql.createPool({
      host: dbHost,
      port: dbPort,
      user: dbUser,
      password: dbPassword,
      database: dbName,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      connectTimeout: 3000,
      multipleStatements: true
    });

    const conn = await pool.getConnection();

    // Auto-create initial schema if not existing
    try {
      const sqlPath = path.resolve(process.cwd(), 'server/db/migrations/001_initial_schema.sql');
      if (fs.existsSync(sqlPath)) {
        const schemaSql = fs.readFileSync(sqlPath, 'utf-8');
        await conn.query(schemaSql);
      }
    } catch {}

    conn.release();

    dbStatus = {
      mode: 'MYSQL',
      message: `Connected successfully to MySQL at ${dbHost}:${dbPort}/${dbName}`,
      host: dbHost,
      database: dbName
    };
    return dbStatus;
  } catch (err: any) {
    pool = null;
    dbStatus = {
      mode: 'STANDALONE',
      message: `Integrated persistent data engine active. (MySQL at ${dbHost} unreachable: ${err?.message || 'Connection refused'})`,
      host: dbHost,
      database: dbName || 'TipOffPh Data Store',
      errorDetails: err?.message || 'Unknown database connection error'
    };
    return dbStatus;
  }
}

/**
 * Execute parameterized query against MySQL connection pool.
 * Throws clean error if MySQL is unavailable, allowing callers to handle or fallback safely.
 */
export async function executeQuery<T = any>(sql: string, params: any[] = []): Promise<T[]> {
  const status = await getDatabaseStatus();

  if (status.mode !== 'MYSQL' || !pool) {
    throw new Error('MySQL is not active. Use integrated repository methods.');
  }

  const [rows] = await pool.execute(sql, params);
  return rows as T[];
}

export { pool };

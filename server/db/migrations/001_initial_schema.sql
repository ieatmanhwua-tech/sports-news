-- TipOffPh MySQL Initial Schema Migration (001_initial_schema.sql)
-- Designed for MySQL 8.0+ / MariaDB 10.5+ on Hostinger Managed Node.js Web Apps

CREATE TABLE IF NOT EXISTS authors (
  id VARCHAR(64) PRIMARY KEY,
  slug VARCHAR(96) NOT NULL UNIQUE,
  name VARCHAR(128) NOT NULL,
  bio TEXT,
  role VARCHAR(100) NOT NULL DEFAULT 'Staff Writer',
  email VARCHAR(128) NOT NULL,
  avatar_url VARCHAR(255),
  twitter_handle VARCHAR(64),
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS categories (
  id VARCHAR(64) PRIMARY KEY,
  slug VARCHAR(96) NOT NULL UNIQUE,
  name VARCHAR(128) NOT NULL,
  section_group VARCHAR(64) NOT NULL,
  description TEXT,
  seo_title VARCHAR(128),
  seo_description VARCHAR(255),
  badge_text VARCHAR(48),
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS articles (
  id VARCHAR(64) PRIMARY KEY,
  slug VARCHAR(160) NOT NULL UNIQUE,
  title VARCHAR(255) NOT NULL,
  excerpt TEXT NOT NULL,
  body LONGTEXT NOT NULL,
  primary_category_id VARCHAR(64) NOT NULL,
  author_id VARCHAR(64) NOT NULL,
  content_type ENUM('news', 'rumor', 'editorial', 'interview') NOT NULL DEFAULT 'news',
  source_url VARCHAR(500),
  source_name VARCHAR(128),
  featured_image_url VARCHAR(500) NOT NULL,
  image_alt VARCHAR(255) NOT NULL,
  image_credit VARCHAR(255) NOT NULL,
  seo_title VARCHAR(128),
  seo_description VARCHAR(255),
  is_featured BOOLEAN NOT NULL DEFAULT FALSE,
  is_breaking BOOLEAN NOT NULL DEFAULT FALSE,
  status ENUM('draft', 'published', 'scheduled', 'archived') NOT NULL DEFAULT 'draft',
  published_at DATETIME NOT NULL,
  updated_at DATETIME,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_status_published (status, published_at),
  INDEX idx_primary_cat (primary_category_id),
  INDEX idx_author (author_id),
  INDEX idx_featured (is_featured),
  INDEX idx_breaking (is_breaking),
  CONSTRAINT fk_articles_author FOREIGN KEY (author_id) REFERENCES authors(id) ON DELETE RESTRICT,
  CONSTRAINT fk_articles_category FOREIGN KEY (primary_category_id) REFERENCES categories(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS article_topics (
  article_id VARCHAR(64) NOT NULL,
  category_id VARCHAR(64) NOT NULL,
  PRIMARY KEY (article_id, category_id),
  CONSTRAINT fk_topic_article FOREIGN KEY (article_id) REFERENCES articles(id) ON DELETE CASCADE,
  CONSTRAINT fk_topic_category FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS admin_users (
  id VARCHAR(64) PRIMARY KEY,
  username VARCHAR(64) NOT NULL UNIQUE,
  email VARCHAR(128) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(32) NOT NULL DEFAULT 'editor',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS contact_submissions (
  id VARCHAR(64) PRIMARY KEY,
  name VARCHAR(128) NOT NULL,
  email VARCHAR(128) NOT NULL,
  subject VARCHAR(200) NOT NULL,
  message TEXT NOT NULL,
  type ENUM('contact', 'contributor_application') NOT NULL DEFAULT 'contact',
  phone VARCHAR(64),
  portfolio_url VARCHAR(255),
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS slug_redirects (
  id VARCHAR(64) PRIMARY KEY,
  old_slug VARCHAR(160) NOT NULL UNIQUE,
  new_slug VARCHAR(160) NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_old_slug (old_slug)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

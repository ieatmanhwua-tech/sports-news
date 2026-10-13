import fs from 'fs';
import path from 'path';
import mysql from 'mysql2/promise';
import { CATEGORIES_REGISTRY } from '../../shared/categories';
import { DEMO_AUTHORS, DEMO_ARTICLES } from '../db/demo-fixtures';

async function migrateAndSeed() {
  const dbHost = process.env.DB_HOST;
  const dbPort = Number(process.env.DB_PORT || 3306);
  const dbUser = process.env.DB_USER || 'u697549935_tipoff';
  const dbPassword = process.env.DB_PASSWORD || 'Kw~b!$#n4/U';
  const dbName = process.env.DB_NAME || 'u697549935_tipoffph';

  if (!dbHost) {
    console.error('❌ Error: DB_HOST is not set. Please provide your MySQL Host or IP address (e.g. Hostinger server IP or Remote MySQL hostname).');
    console.error('   Usage: DB_HOST=<host_ip_or_domain> npm run db:migrate');
    process.exit(1);
  }

  console.log(`🔌 Connecting to MySQL database ${dbName} at ${dbHost}:${dbPort} as ${dbUser}...`);

  let connection;
  try {
    connection = await mysql.createConnection({
      host: dbHost,
      port: dbPort,
      user: dbUser,
      password: dbPassword,
      database: dbName,
      multipleStatements: true,
      connectTimeout: 10000
    });
    console.log('✅ Connected successfully to MySQL database!');
  } catch (err: any) {
    console.error('❌ Connection failed:', err.message);
    if (err.code === 'ETIMEDOUT' || err.code === 'ECONNREFUSED') {
      console.error('\n💡 Tip for Hostinger:');
      console.error('1. Go to Hostinger hPanel -> Databases -> Remote MySQL.');
      console.error('2. Add your current IP or "%" (wildcard) to allow remote connections.');
      console.error('3. Make sure to use the IP address or Hostname provided in Remote MySQL, not localhost.');
    }
    process.exit(1);
  }

  try {
    // 1. Run migrations
    console.log('\n📄 Executing schema migration (001_initial_schema.sql)...');
    const sqlPath = path.resolve(process.cwd(), 'server/db/migrations/001_initial_schema.sql');
    const schemaSql = fs.readFileSync(sqlPath, 'utf-8');

    // Split and execute statements or run directly with multipleStatements
    await connection.query(schemaSql);
    console.log('✅ Schema migration completed (all tables created).');

    // 2. Seed categories
    console.log('\n🏷️  Seeding categories registry...');
    for (const cat of CATEGORIES_REGISTRY) {
      await connection.execute(
        `INSERT INTO categories (id, slug, name, section_group, description, seo_title, seo_description, badge_text, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())
         ON DUPLICATE KEY UPDATE
           name = VALUES(name),
           section_group = VALUES(section_group),
           description = VALUES(description),
           seo_title = VALUES(seo_title),
           seo_description = VALUES(seo_description),
           badge_text = VALUES(badge_text)`,
        [
          cat.id,
          cat.slug,
          cat.name,
          cat.sectionGroup,
          cat.description || '',
          cat.seoTitle || '',
          cat.seoDescription || '',
          cat.badgeText || ''
        ]
      );
    }
    console.log(`✅ Seeded ${CATEGORIES_REGISTRY.length} categories.`);

    // 3. Seed authors
    console.log('\n✍️  Seeding authors...');
    for (const author of DEMO_AUTHORS) {
      await connection.execute(
        `INSERT INTO authors (id, slug, name, bio, role, email, avatar_url, twitter_handle, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())
         ON DUPLICATE KEY UPDATE
           name = VALUES(name),
           bio = VALUES(bio),
           role = VALUES(role),
           email = VALUES(email),
           avatar_url = VALUES(avatar_url),
           twitter_handle = VALUES(twitter_handle)`,
        [
          author.id,
          author.slug,
          author.name,
          author.bio || '',
          author.role || 'Staff Writer',
          author.email,
          author.avatarUrl || null,
          author.twitterHandle || null
        ]
      );
    }
    console.log(`✅ Seeded ${DEMO_AUTHORS.length} authors.`);

    // 4. Seed articles
    console.log('\n📰 Seeding articles (including new MPBL Playoff update)...');
    for (const article of DEMO_ARTICLES) {
      await connection.execute(
        `INSERT INTO articles (
           id, slug, title, excerpt, body, primary_category_id, author_id, content_type,
           source_url, source_name, featured_image_url, image_alt, image_credit,
           seo_title, seo_description, is_featured, is_breaking, status,
           published_at, created_at
         ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE
           title = VALUES(title),
           excerpt = VALUES(excerpt),
           body = VALUES(body),
           primary_category_id = VALUES(primary_category_id),
           author_id = VALUES(author_id),
           content_type = VALUES(content_type),
           source_url = VALUES(source_url),
           source_name = VALUES(source_name),
           featured_image_url = VALUES(featured_image_url),
           image_alt = VALUES(image_alt),
           image_credit = VALUES(image_credit),
           seo_title = VALUES(seo_title),
           seo_description = VALUES(seo_description),
           is_featured = VALUES(is_featured),
           is_breaking = VALUES(is_breaking),
           status = VALUES(status),
           published_at = VALUES(published_at)`,
        [
          article.id,
          article.slug,
          article.title,
          article.excerpt,
          article.body,
          article.primaryCategoryId,
          article.authorId,
          article.contentType || 'news',
          article.sourceUrl || null,
          article.sourceName || null,
          article.featuredImageUrl,
          article.imageAlt,
          article.imageCredit,
          article.seoTitle || null,
          article.seoDescription || null,
          article.isFeatured ? 1 : 0,
          article.isBreaking ? 1 : 0,
          article.status || 'published',
          new Date(article.publishedAt),
          new Date(article.createdAt)
        ]
      );

      // Seed article topics
      if (article.topicIds && article.topicIds.length > 0) {
        for (const topicId of article.topicIds) {
          await connection.execute(
            `INSERT IGNORE INTO article_topics (article_id, category_id) VALUES (?, ?)`,
            [article.id, topicId]
          );
        }
      }
    }
    console.log(`✅ Seeded ${DEMO_ARTICLES.length} articles with topic relationships.`);

    console.log('\n🎉 Database setup and seeding completed successfully!');
  } catch (err: any) {
    console.error('❌ Migration/seeding error:', err);
    process.exit(1);
  } finally {
    await connection.end();
  }
}

migrateAndSeed();

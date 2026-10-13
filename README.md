# TipOffPh 🏀

**TipOffPh** is an independent Philippine basketball news publication built with **Nuxt 3 / 4**, **Vue 3 Composition API**, **TypeScript**, and **Tailwind CSS**. It is architected for deployment on **Hostinger Managed Node.js Web Apps** running on **Node.js 22.x** with **MySQL** data persistence and server-side rendering (SSR).

---

## 1. Project Overview

- **Brand:** TipOffPh (*preserve this exact spelling and capitalization*)
- **Audience:** Basketball fans across the Philippines and diaspora
- **Language:** `en-PH` (natural Philippine English)
- **Timezone:** `Asia/Manila` (PHT, UTC+8) for all client displays; timestamps stored strictly in UTC (ISO 8601).
- **Core Coverage:** PBA (Philippine Cup, Commissioner's Cup, Governors' Cup, PBA D-League, Draft), MPBL, PSL, VisMin Cup, UAAP, NCAA, High School Hoops/NBTC, Gilas Pilipinas, FIBA, EASL, Overseas Pinoys (Japan B.League, KBL), and NBA.
- **Editorial Model:** Clear distinction between *Reported News*, *Attributed Rumors*, *Editorials / Opinion*, and *1-on-1 Interviews*.
- **Technical SEO:** Server-rendered Open Graph tags, Twitter Summary Large Image cards, dynamic XML sitemaps (`/sitemap.xml`), Google News sitemaps (`/news-sitemap.xml` for stories published in last 48 hours), RSS 2.0 feeds (`/rss.xml`), Schema.org `NewsArticle` / `BreadcrumbList` JSON-LD, crawlable pagination, and permanent 301 redirects for modified article slugs.

---

## 2. Hostinger Managed Node.js Web Apps Configuration

When configuring your web app in the **Hostinger hPanel** under **Node.js Web Apps**, specify the following settings:

| Configuration Field | Hostinger Value | Notes |
| :--- | :--- | :--- |
| **Framework / App Type** | `Nuxt` | Or generic Node.js Web App |
| **Node.js Version** | `22.x` (Compatible current 22 patch) | Matches modern Nuxt & ES2022 |
| **Package Manager** | `npm` | Standard npm package resolution |
| **Root Directory** | `/` (or directory containing `package.json`) | Application root |
| **Build Script Field** | `build` | Runs `npm run build` |
| **Output Directory** | `.output` | Nitro server build output |
| **Entry File** | `server/index.mjs` | Relative to `.output` |
| **CLI Production Start** | `node .output/server/index.mjs` | Nitro's standalone Node server |

> **Port Handling:** Nuxt Nitro automatically respects the `PORT` or `NITRO_PORT` environment variable provided by Hostinger's reverse proxy (e.g., Nginx or LiteSpeed). Do not hardcode a port number in production.

---

## 3. Environment Variables (.env)

Configure these variables in Hostinger hPanel under **Environment Variables** (or in `.env` for production):

```ini
# Hostinger MySQL Database Credentials
DB_HOST="srv123.main-hosting.eu"
DB_PORT="3306"
DB_USER="u123456789_tipoff"
DB_PASSWORD="your_secure_mysql_password_here"
DB_NAME="u123456789_tipoffdb"

# Public Canonical Site URL (No trailing slash)
NUXT_PUBLIC_SITE_URL="https://tipoffph.com"

# Session & Cookie Security
JWT_SECRET="generate_a_cryptographically_secure_random_string_64_chars"

# Initial Admin Bootstrap Token
ADMIN_SETUP_TOKEN="temporary_secret_key_used_for_first_admin_bootstrap"

# Environment
NODE_ENV="production"
```

---

## 4. Database Setup & Migrations

### Initial MySQL Schema Migration
1. Log in to **Hostinger hPanel** &rarr; **Databases** &rarr; **phpMyAdmin**.
2. Select your database (e.g. `u123456789_tipoffdb`).
3. Import or execute the SQL statements located in:
   ```
   server/db/migrations/001_initial_schema.sql
   ```
4. This provisions the tables:
   - `authors` (Beat reporters, columnists, correspondents)
   - `categories` (All 38 registered taxonomy topics)
   - `articles` (Full article records with indexes on `(status, published_at)`)
   - `article_topics` (Many-to-many topic relationships)
   - `admin_users` (Bcrypt-hashed credentials and roles)
   - `contact_submissions` (Contact inquiries and contributor pitches)
   - `slug_redirects` (Permanent 301 redirects for changed slugs)

---

## 5. First-Admin Account Provisioning

TipOffPh never seeds production databases with insecure default passwords. You can bootstrap your first administrator via either method:

### Method A: SSH / CLI Bootstrap Script
In your Hostinger Web App SSH terminal:
```bash
npx tsx server/scripts/bootstrap-admin.ts <username> <email> <password>
```
*Example:*
```bash
npx tsx server/scripts/bootstrap-admin.ts editor_lead editor@tipoffph.com "StrongSecretPassword2026!"
```

### Method B: Web Setup Endpoint
1. Ensure `ADMIN_SETUP_TOKEN` is set in your environment variables.
2. Navigate to `/admin/settings` on your site.
3. Complete the **Bootstrap First Production Admin Account** form using your matching `ADMIN_SETUP_TOKEN`.

---

## 6. Development & Preview Modes

- **Isolated Demo Mode:** If `DB_HOST` is not configured, the app operates in isolated Demo Mode with rich Philippine basketball fixtures (covering PBA, MPBL, UAAP, Gilas, NBA). Pages in Demo Mode automatically emit `noindex` and `X-Robots-Tag: noindex` to prevent accidental indexing of draft/mock content.
- **Fail-Safe Integrity:** If `DB_HOST` is provided but MySQL fails to connect, the application surfaces an honest error state and refuses to silently substitute fake stories for real news.

---

## 7. Development & Build Commands

```bash
# Install dependencies
npm install

# Start local Nuxt development server (Port 3000)
npm run dev

# Run TypeScript typecheck
npm run type-check

# Compile production build (Nitro node-server preset)
npm run build

# Start production server
npm run start
```

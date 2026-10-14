import tailwindcss from '@tailwindcss/vite';

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: false },
  devServer: {
    port: 3000
  },
  nitro: {
    preset: 'node-server'
  },
  vite: {
    plugins: [
      tailwindcss()
    ],
    server: {
      hmr: false
    }
  },
  css: ['~/assets/css/main.css'],
  typescript: {
    strict: true
  },
  runtimeConfig: {
    // Private keys (server only)
    dbHost: process.env.DB_HOST || '',
    dbPort: process.env.DB_PORT || '3306',
    dbUser: process.env.DB_USER || '',
    dbPassword: process.env.DB_PASSWORD || '',
    dbName: process.env.DB_NAME || '',
    jwtSecret: process.env.JWT_SECRET || 'tipoffph-secret-change-in-production',
    adminSetupToken: process.env.ADMIN_SETUP_TOKEN || '',
    // Public keys (client and server)
    public: {
      siteUrl: process.env.NUXT_PUBLIC_SITE_URL || '',
      siteName: 'TipOffPh',
      displayTimezone: 'Asia/Manila'
    }
  }
});

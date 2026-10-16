import tailwindcss from '@tailwindcss/vite';

const isBuildCommand = process.argv.some((arg) => arg === 'build' || arg.endsWith('/build'));

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: false },
  buildDir: isBuildCommand ? '.nuxt-build' : '.nuxt',
  typesDir: '.nuxt',
  ignore: [
    '.nuxt-build/**',
    '.output/**',
    '.data/**'
  ],
  devServer: {
    port: 3000
  },
  app: {
    head: {
      meta: [
        { name: 'google-site-verification', content: 'LJKRQV9a1yzDsMsgiVruS6CzH8zNhSRjVzF8Jxm3bPU' }
      ]
    }
  },
  nitro: {
    preset: 'node-server',
    logging: {
      compressedSizes: false,
      buildSuccess: true
    }
  },
  hooks: {
    'nitro:config'(nitroConfig) {
      nitroConfig.rollupConfig = nitroConfig.rollupConfig || {};
      const existingOutput = (nitroConfig.rollupConfig.output || {}) as any;
      nitroConfig.rollupConfig.output = {
        ...existingOutput,
        chunkFileNames(chunkInfo: any) {
          const safeName = String(chunkInfo?.name || 'chunk')
            .replace(/error-template/gi, 'fallback-template')
            .replace(/error/gi, 'fallback');
          return `chunks/_/${safeName}.mjs`;
        }
      };
    }
  },
  watchers: {
    chokidar: {
      ignored: ['**/.nuxt-build/**', '**/.output/**', '**/.data/**']
    }
  },
  vite: {
    logLevel: 'warn',
    plugins: [
      tailwindcss()
    ],
    build: {
      rollupOptions: {
        output: {
          sanitizeFileName(name: string) {
            return name
              .replace(/error-template/gi, 'fallback-template')
              .replace(/error-(\d+)/gi, 'status-$1')
              .replace(/\x00/g, '');
          }
        }
      }
    },
    server: {
      hmr: false,
      watch: {
        ignored: ['**/.nuxt-build/**', '**/.output/**', '**/.data/**']
      }
    },
    optimizeDeps: {
      include: [
        'lucide-vue-next'
      ]
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
      siteUrl: process.env.NUXT_PUBLIC_SITE_URL || 'https://tipoff.bybetcasino.ph',
      siteName: 'TipOff Bybet PH',
      displayTimezone: 'Asia/Manila'
    }
  }
});

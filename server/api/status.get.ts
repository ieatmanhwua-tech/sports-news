import { getDatabaseStatus } from '../db/client';
import { getGscIndexingSummary } from '../utils/gsc-indexing';

export default defineEventHandler(async () => {
  const [db, gsc] = await Promise.all([
    getDatabaseStatus(),
    getGscIndexingSummary(false).catch(() => null)
  ]);

  return {
    app: 'TipOffPh',
    version: '1.0.0',
    mode: db.mode, // 'DEMO' | 'MYSQL' | 'ERROR'
    message: db.message,
    host: db.host || 'TipOffPh Data Engine',
    database: db.database || (db.mode === 'MYSQL' ? 'MySQL Production' : 'TipOffPh Data Store'),
    errorDetails: db.errorDetails || null,
    nodeVersion: process.version,
    timezone: 'Asia/Manila',
    gscIndexing: gsc
      ? {
          enabled: gsc.enabled,
          serviceAccountEmail: gsc.serviceAccountEmail,
          projectId: gsc.projectId,
          siteUrl: gsc.siteUrl,
          permissionLevel: gsc.permissionLevel,
          lastRunAt: gsc.lastRunAt,
          lastSitemapPingAt: gsc.lastSitemapPingAt,
          stats: gsc.stats,
          sitemaps: gsc.sitemaps
        }
      : null
  };
});

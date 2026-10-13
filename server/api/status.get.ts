import { getDatabaseStatus } from '../db/client';

export default defineEventHandler(async () => {
  const db = await getDatabaseStatus();
  return {
    app: 'TipOffPh',
    version: '1.0.0',
    mode: db.mode, // 'DEMO' | 'MYSQL' | 'ERROR'
    message: db.message,
    host: db.host || 'TipOffPh Data Engine',
    database: db.database || (db.mode === 'MYSQL' ? 'MySQL Production' : 'TipOffPh Data Store'),
    errorDetails: db.errorDetails || null,
    nodeVersion: process.version,
    timezone: 'Asia/Manila'
  };
});

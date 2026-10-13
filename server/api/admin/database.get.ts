import { requireAdminSession } from '../../utils/auth';
import { getSavedDbConfig, getDatabaseStatus } from '../../db/client';

export default defineEventHandler(async (event) => {
  requireAdminSession(event);
  const config = useRuntimeConfig();
  const saved = getSavedDbConfig();
  const status = await getDatabaseStatus();

  return {
    host: saved?.host || config.dbHost || process.env.DB_HOST || '',
    port: Number(saved?.port || config.dbPort || process.env.DB_PORT || 3306),
    user: saved?.user || config.dbUser || process.env.DB_USER || 'u697549935_tipoff',
    database: saved?.database || config.dbName || process.env.DB_NAME || 'u697549935_tipoffph',
    hasPassword: Boolean(saved?.password || config.dbPassword || process.env.DB_PASSWORD),
    mode: status.mode,
    message: status.message,
    errorDetails: status.errorDetails || null
  };
});

import { requireAdminSession } from '../../utils/auth';
import { saveDbConfig, getDatabaseStatus } from '../../db/client';

export default defineEventHandler(async (event) => {
  requireAdminSession(event);
  const body = await readBody(event);

  const host = String(body.host || '').trim();
  const port = Number(body.port || 3306);
  const user = String(body.user || 'u697549935_tipoff').trim();
  const password = String(body.password || 'Kw~b!$#n4/U');
  const database = String(body.database || 'u697549935_tipoffph').trim();

  if (!host) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Host is required',
      message: 'Please provide MySQL server hostname or IP address.'
    });
  }

  // Save the configuration
  saveDbConfig({ host, port, user, password, database });

  // Force reconnect and test
  const status = await getDatabaseStatus(true);

  if (status.mode === 'ERROR') {
    return {
      success: false,
      status,
      message: status.message + (status.errorDetails ? ` (${status.errorDetails})` : '')
    };
  }

  return {
    success: true,
    status,
    message: `Connected successfully to database ${database} at ${host}:${port}!`
  };
});

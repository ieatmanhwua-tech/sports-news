import { AuthRepository } from '../../utils/common-repositories';

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const config = useRuntimeConfig();

  // Validate setup token from environment variables
  const expectedToken = config.adminSetupToken || process.env.ADMIN_SETUP_TOKEN;
  if (!expectedToken || expectedToken.trim().length === 0) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Setup Disabled',
      message: 'ADMIN_SETUP_TOKEN is not configured in private environment variables. Web-based setup is disabled.'
    });
  }

  if (body.token !== expectedToken) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Invalid Token',
      message: 'The setup token provided does not match the configured ADMIN_SETUP_TOKEN.'
    });
  }

  const { username, email, password } = body;
  if (!username || !email || !password || password.length < 8) {
    throw createError({
      statusCode: 422,
      statusMessage: 'Validation Error',
      message: 'Username, valid email, and a password of at least 8 characters are required.'
    });
  }

  await AuthRepository.createAdminUser(username.trim(), email.trim().toLowerCase(), password, 'superadmin');

  return {
    success: true,
    message: `Administrator account "${username}" has been successfully created. You can now log in at /admin/login.`
  };
});

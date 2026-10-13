import { AuthRepository } from '../../utils/common-repositories';
import { createSessionCookie } from '../../utils/auth';

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  if (!body || !body.username || !body.password) {
    throw createError({ statusCode: 400, statusMessage: 'Username and password required' });
  }

  const user = await AuthRepository.verifyAdmin(String(body.username).trim(), String(body.password));
  if (!user) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Invalid Credentials',
      message: 'The username or password provided does not match our records.'
    });
  }

  createSessionCookie(event, user);

  return {
    success: true,
    user: {
      id: user.id,
      username: user.username,
      role: user.role
    }
  };
});

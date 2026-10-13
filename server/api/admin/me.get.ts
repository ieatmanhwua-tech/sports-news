import { requireAdminSession } from '../../utils/auth';

export default defineEventHandler((event) => {
  const session = requireAdminSession(event);
  return {
    authenticated: true,
    user: {
      id: session.userId,
      username: session.username,
      role: session.role
    }
  };
});

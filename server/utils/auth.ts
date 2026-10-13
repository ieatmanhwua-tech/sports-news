import type { H3Event } from 'h3';
import crypto from 'crypto';

interface SessionData {
  userId: string;
  username: string;
  role: string;
  exp: number;
}

const COOKIE_NAME = 'tipoff_session';

function getSecret(): string {
  const config = useRuntimeConfig();
  return config.jwtSecret || process.env.JWT_SECRET || 'tipoffph-secret-change-in-production';
}

function sign(payload: string, secret: string): string {
  return crypto.createHmac('sha256', secret).update(payload).digest('hex');
}

export function createSessionCookie(event: H3Event, user: { id: string; username: string; role: string }) {
  const secret = getSecret();
  const session: SessionData = {
    userId: user.id,
    username: user.username,
    role: user.role,
    exp: Date.now() + 1000 * 60 * 60 * 24 * 7 // 7 days
  };

  const payload = Buffer.from(JSON.stringify(session)).toString('base64url');
  const signature = sign(payload, secret);
  const token = `${payload}.${signature}`;

  setCookie(event, COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7,
    path: '/'
  });
}

export function clearSessionCookie(event: H3Event) {
  deleteCookie(event, COOKIE_NAME, {
    path: '/'
  });
}

export function requireAdminSession(event: H3Event): SessionData {
  const token = getCookie(event, COOKIE_NAME);
  if (!token) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized',
      message: 'Authentication required to access admin services.'
    });
  }

  const [payload, signature] = token.split('.');
  if (!payload || !signature) {
    throw createError({ statusCode: 401, statusMessage: 'Invalid session' });
  }

  const secret = getSecret();
  const expectedSig = sign(payload, secret);
  if (signature !== expectedSig) {
    throw createError({ statusCode: 401, statusMessage: 'Session signature verification failed' });
  }

  try {
    const session: SessionData = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
    if (Date.now() > session.exp) {
      throw createError({ statusCode: 401, statusMessage: 'Session expired' });
    }
    return session;
  } catch (err: any) {
    throw createError({ statusCode: 401, statusMessage: 'Malformed session data' });
  }
}

export function getOptionalSession(event: H3Event): SessionData | null {
  try {
    return requireAdminSession(event);
  } catch {
    return null;
  }
}

import type { AuthResponse, AuthUser } from '@/types/auth';

const TOKEN_KEY = 'devdesk_access_token';
const USER_KEY = 'devdesk_user';

export function getToken(): string | null {
  if (typeof window === 'undefined') {
    return null;
  }

  return window.localStorage.getItem(TOKEN_KEY);
}

export function getCurrentUser(): AuthUser | null {
  if (typeof window === 'undefined') {
    return null;
  }

  const rawUser = window.localStorage.getItem(USER_KEY);

  if (!rawUser) {
    return null;
  }

  try {
    return JSON.parse(rawUser) as AuthUser;
  } catch {
    clearSession();
    return null;
  }
}

export function setSession(auth: AuthResponse): void {
  window.localStorage.setItem(TOKEN_KEY, auth.accessToken);
  window.localStorage.setItem(USER_KEY, JSON.stringify(auth.user));
}

export function updateStoredUser(user: AuthUser): void {
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(USER_KEY, JSON.stringify(user));
  }
}

export function clearSession(): void {
  if (typeof window !== 'undefined') {
    window.localStorage.removeItem(TOKEN_KEY);
    window.localStorage.removeItem(USER_KEY);
  }
}

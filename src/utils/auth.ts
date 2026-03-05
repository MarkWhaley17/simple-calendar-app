import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthUser } from '../types';

const TOKEN_KEY = '@auth_token';
const USER_KEY = '@auth_user';

const API_BASE = 'https://kalapamedia.com/wp-json/api/v1';
const WP_BASE  = 'https://kalapamedia.com/wp-json/wp/v2';

export async function login(username: string, password: string): Promise<AuthUser> {
  const tokenRes = await fetch(`${API_BASE}/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });

  const tokenData = await tokenRes.json();

  if (tokenData?.status === 'error' || !tokenRes.ok) {
    throw new Error(tokenData?.error_description ?? 'Invalid credentials');
  }

  const token: string = tokenData.jwt_token;

  // Fetch display name from WP REST API
  const meRes = await fetch(`${WP_BASE}/users/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const meData = meRes.ok ? await meRes.json() : {};

  const user: AuthUser = {
    email: username,
    displayName: meData.name ?? username,
  };

  await AsyncStorage.setItem(TOKEN_KEY, token);
  await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));

  return user;
}

export async function logout(): Promise<void> {
  await AsyncStorage.multiRemove([TOKEN_KEY, USER_KEY]);
}

export async function getToken(): Promise<string | null> {
  return AsyncStorage.getItem(TOKEN_KEY);
}

export async function getUser(): Promise<AuthUser | null> {
  const raw = await AsyncStorage.getItem(USER_KEY);
  if (!raw) return null;
  return JSON.parse(raw) as AuthUser;
}

/** Validates the stored token against the server. Returns false if expired/invalid. */
export async function isAuthenticated(): Promise<boolean> {
  const token = await getToken();
  if (!token) return false;

  try {
    const res = await fetch(`${API_BASE}/token-validate`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    return data?.status === 'TRUE';
  } catch {
    // Network error — trust the cached token rather than forcing re-login
    return true;
  }
}

/** Fetch a protected WP REST endpoint using the stored JWT. */
export async function wpFetch(path: string, options: RequestInit = {}): Promise<Response> {
  const token = await getToken();
  return fetch(`https://kalapamedia.com/wp-json${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers ?? {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
}

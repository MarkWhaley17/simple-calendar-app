/**
 * Base API client. All service modules call `apiFetch` rather than `fetch`
 * directly so auth headers, base URL, and error handling stay in one place.
 */
import { wpFetch } from '../utils/auth';

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/**
 * Authenticated fetch against this client's wpBaseUrl.
 * Throws ApiError on non-2xx responses.
 */
export async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await wpFetch(path, options);

  if (!res.ok) {
    let message = `HTTP ${res.status}`;
    try {
      const body = await res.json();
      message = body?.message ?? body?.error_description ?? message;
    } catch {
      // ignore parse errors
    }
    throw new ApiError(res.status, message);
  }

  return res.json() as Promise<T>;
}

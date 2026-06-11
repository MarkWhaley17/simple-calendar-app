/**
 * Recordings / video library service.
 * Fetches the list of videos available to the authenticated user.
 *
 * TODO: replace placeholder path with the real endpoint once available.
 */
import { apiFetch } from './api';

export interface Recording {
  id: string;
  title: string;
  description?: string;
  videoUrl: string;
  thumbnailUrl?: string;
  durationSeconds?: number;
  publishedAt: string; // ISO 8601
}

// TODO: confirm endpoint path with API provider
const ENDPOINT = '/api/v1/recordings';

export async function fetchRecordings(): Promise<Recording[]> {
  return apiFetch<Recording[]>(ENDPOINT);
}

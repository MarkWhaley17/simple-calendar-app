/**
 * Mantra count sync service.
 * Posts completed mantra session totals to the backend.
 *
 * TODO: replace placeholder path with the real endpoint once available.
 */
import { apiFetch } from './api';

export interface MantraSessionPayload {
  mantraId: string;
  mantraTitle: string;
  count: number;
  targetCount: number;
  elapsedSeconds: number;
  completedAt: string; // ISO 8601
  linkedSessionId?: string;
  sessionTitle?: string;
}

export interface MantraSessionResponse {
  id: string;
  recorded: boolean;
}

// TODO: confirm endpoint path with API provider
const ENDPOINT = '/api/v1/mantra-sessions';

export async function postMantraSession(payload: MantraSessionPayload): Promise<MantraSessionResponse> {
  return apiFetch<MantraSessionResponse>(ENDPOINT, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

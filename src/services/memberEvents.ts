/**
 * Member events service.
 * Fetches events that are only visible to authenticated users.
 *
 * TODO: replace placeholder path with the real endpoint once available.
 */
import { apiFetch } from './api';
import { CalendarEvent } from '../types';

// TODO: confirm endpoint path with API provider
const ENDPOINT = '/api/v1/member-events';

export async function fetchMemberEvents(): Promise<CalendarEvent[]> {
  return apiFetch<CalendarEvent[]>(ENDPOINT);
}

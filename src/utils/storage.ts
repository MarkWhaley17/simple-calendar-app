import AsyncStorage from '@react-native-async-storage/async-storage';
import { CalendarEvent, RecurrenceRule } from '../types';

const EVENTS_STORAGE_KEY = '@kalapa_calendar_events';
const EVENTS_STORAGE_BACKUP_KEY = '@kalapa_calendar_events_backup';

// Handles both the legacy plain-array format and the envelope format
// { version, savedAt, events } that was briefly used.
const tryParseStoredEvents = (raw: string | null): CalendarEvent[] | null => {
  if (!raw) return null;
  try {
    const parsed: unknown = JSON.parse(raw);
    const array = Array.isArray(parsed)
      ? parsed
      : parsed &&
        typeof parsed === 'object' &&
        Array.isArray((parsed as { events?: unknown }).events)
      ? (parsed as { events: unknown[] }).events
      : null;
    if (!array) return null;
    return array.map(hydrateEvent);
  } catch {
    return null;
  }
};

/**
 * Save events to local storage
 */
export const saveEvents = async (events: CalendarEvent[]): Promise<void> => {
  try {
    const jsonValue = JSON.stringify(events);

    // Preserve previous main as a backup before overwriting
    const previous = await AsyncStorage.getItem(EVENTS_STORAGE_KEY);
    if (previous !== null) {
      await AsyncStorage.setItem(EVENTS_STORAGE_BACKUP_KEY, previous);
    }

    await AsyncStorage.setItem(EVENTS_STORAGE_KEY, jsonValue);
  } catch (error) {
    console.error('Error saving events to storage:', error);
    throw error;
  }
};

/**
 * Load events from local storage
 */
export const loadEvents = async (): Promise<CalendarEvent[]> => {
  try {
    const raw = await AsyncStorage.getItem(EVENTS_STORAGE_KEY);
    const events = tryParseStoredEvents(raw);
    if (events) return events;

    // Fall back to backup if main is missing or corrupt
    const backupRaw = await AsyncStorage.getItem(EVENTS_STORAGE_BACKUP_KEY);
    return tryParseStoredEvents(backupRaw) ?? [];
  } catch (error) {
    console.error('Error loading events from storage:', error);
    return [];
  }
};

const hydrateEvent = (event: any): CalendarEvent => {
  return {
    ...event,
    date: event.date ? new Date(event.date) : undefined,
    fromDate: event.fromDate ? new Date(event.fromDate) : undefined,
    toDate: event.toDate ? new Date(event.toDate) : undefined,
    recurrence: hydrateRecurrence(event.recurrence),
  };
};

const hydrateRecurrence = (recurrence?: RecurrenceRule): RecurrenceRule | undefined => {
  if (!recurrence) return undefined;

  const overrides = recurrence.overrides
    ? Object.fromEntries(
        Object.entries(recurrence.overrides).map(([key, override]) => {
          const o = override as any;
          return [
            key,
            {
              ...o,
              date: o.date ? new Date(o.date) : undefined,
              fromDate: o.fromDate ? new Date(o.fromDate) : undefined,
              toDate: o.toDate ? new Date(o.toDate) : undefined,
            },
          ];
        })
      )
    : undefined;

  return {
    ...recurrence,
    endDate: recurrence.endDate ? new Date(recurrence.endDate) : undefined,
    overrides,
  };
};

/**
 * Clear all events from storage
 */
export const clearEvents = async (): Promise<void> => {
  try {
    await AsyncStorage.multiRemove([EVENTS_STORAGE_KEY, EVENTS_STORAGE_BACKUP_KEY]);
  } catch (error) {
    console.error('Error clearing events from storage:', error);
    throw error;
  }
};

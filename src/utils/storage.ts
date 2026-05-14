import AsyncStorage from '@react-native-async-storage/async-storage';
import { CalendarEvent, RecurrenceRule } from '../types';

const EVENTS_STORAGE_KEY = '@kalapa_calendar_events';
const EVENTS_STORAGE_BACKUP_KEY = '@kalapa_calendar_events_backup';
const EVENTS_STORAGE_TEMP_KEY = '@kalapa_calendar_events_tmp';
const EVENTS_STORAGE_SCHEMA_VERSION = 1;

interface StoredEventsEnvelope {
  version: number;
  savedAt: string;
  events: CalendarEvent[];
}

const isCalendarEventLike = (value: unknown): value is CalendarEvent =>
  Boolean(
    value &&
      typeof value === 'object' &&
      typeof (value as CalendarEvent).id === 'string' &&
      typeof (value as CalendarEvent).title === 'string'
  );

const hydrateEvent = (event: any): CalendarEvent => {
  const recurrence = hydrateRecurrence(event.recurrence);

  return {
    ...event,
    date: event.date ? new Date(event.date) : undefined,
    fromDate: event.fromDate ? new Date(event.fromDate) : undefined,
    toDate: event.toDate ? new Date(event.toDate) : undefined,
    recurrence,
  };
};

const tryParseStoredEvents = (raw: string | null): CalendarEvent[] | null => {
  if (!raw) return null;

  try {
    const parsed: unknown = JSON.parse(raw);
    const payload = Array.isArray(parsed)
      ? parsed
      : (
          parsed &&
          typeof parsed === 'object' &&
          Array.isArray((parsed as StoredEventsEnvelope).events)
        )
        ? (parsed as StoredEventsEnvelope).events
        : null;
    if (!payload || !payload.every(isCalendarEventLike)) {
      return null;
    }
    return payload.map(hydrateEvent);
  } catch {
    return null;
  }
};

/**
 * Save events to local storage
 */
export const saveEvents = async (events: CalendarEvent[]): Promise<void> => {
  try {
    const payload: StoredEventsEnvelope = {
      version: EVENTS_STORAGE_SCHEMA_VERSION,
      savedAt: new Date().toISOString(),
      events,
    };
    const jsonValue = JSON.stringify(payload);
    const previousMain = await AsyncStorage.getItem(EVENTS_STORAGE_KEY);

    if (previousMain !== null) {
      await AsyncStorage.setItem(EVENTS_STORAGE_BACKUP_KEY, previousMain);
    }

    await AsyncStorage.setItem(EVENTS_STORAGE_TEMP_KEY, jsonValue);
    const verifyTemp = await AsyncStorage.getItem(EVENTS_STORAGE_TEMP_KEY);
    if (!tryParseStoredEvents(verifyTemp)) {
      throw new Error('Temporary storage verification failed');
    }

    await AsyncStorage.setItem(EVENTS_STORAGE_KEY, jsonValue);
    await AsyncStorage.removeItem(EVENTS_STORAGE_TEMP_KEY);
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
    const [mainRaw, backupRaw, tempRaw] = await Promise.all([
      AsyncStorage.getItem(EVENTS_STORAGE_KEY),
      AsyncStorage.getItem(EVENTS_STORAGE_BACKUP_KEY),
      AsyncStorage.getItem(EVENTS_STORAGE_TEMP_KEY),
    ]);

    const mainEvents = tryParseStoredEvents(mainRaw);
    if (mainEvents) {
      return mainEvents;
    }

    const backupEvents = tryParseStoredEvents(backupRaw);
    if (backupEvents) {
      await AsyncStorage.setItem(
        EVENTS_STORAGE_KEY,
        backupRaw as string
      );
      return backupEvents;
    }

    const tempEvents = tryParseStoredEvents(tempRaw);
    if (tempEvents) {
      await AsyncStorage.setItem(
        EVENTS_STORAGE_KEY,
        tempRaw as string
      );
      await AsyncStorage.removeItem(EVENTS_STORAGE_TEMP_KEY);
      return tempEvents;
    }

    return [];
  } catch (error) {
    console.error('Error loading events from storage:', error);
    return [];
  }
};

const hydrateRecurrence = (recurrence?: RecurrenceRule): RecurrenceRule | undefined => {
  if (!recurrence) return undefined;

  const overrides = recurrence.overrides
    ? Object.fromEntries(
        Object.entries(recurrence.overrides).map(([key, override]) => {
          const overrideAny = override as any;
          return [
            key,
            {
              ...overrideAny,
              date: overrideAny.date ? new Date(overrideAny.date) : undefined,
              fromDate: overrideAny.fromDate ? new Date(overrideAny.fromDate) : undefined,
              toDate: overrideAny.toDate ? new Date(overrideAny.toDate) : undefined,
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
 * Clear all events from storage (useful for testing/debugging)
 */
export const clearEvents = async (): Promise<void> => {
  try {
    await AsyncStorage.multiRemove([
      EVENTS_STORAGE_KEY,
      EVENTS_STORAGE_BACKUP_KEY,
      EVENTS_STORAGE_TEMP_KEY,
    ]);
  } catch (error) {
    console.error('Error clearing events from storage:', error);
    throw error;
  }
};

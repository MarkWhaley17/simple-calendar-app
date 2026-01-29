import AsyncStorage from '@react-native-async-storage/async-storage';
import { CalendarEvent, RecurrenceRule } from '../types';

const EVENTS_STORAGE_KEY = '@kalapa_calendar_events';

/**
 * Save events to local storage
 */
export const saveEvents = async (events: CalendarEvent[]): Promise<void> => {
  try {
    const jsonValue = JSON.stringify(events);
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
    const jsonValue = await AsyncStorage.getItem(EVENTS_STORAGE_KEY);
    if (jsonValue === null) {
      return [];
    }

    const events = JSON.parse(jsonValue);

    // Convert date strings back to Date objects
    return events.map((event: any) => {
      const recurrence = hydrateRecurrence(event.recurrence);

      return {
        ...event,
        date: event.date ? new Date(event.date) : undefined,
        fromDate: event.fromDate ? new Date(event.fromDate) : undefined,
        toDate: event.toDate ? new Date(event.toDate) : undefined,
        recurrence,
      };
    });
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
    await AsyncStorage.removeItem(EVENTS_STORAGE_KEY);
  } catch (error) {
    console.error('Error clearing events from storage:', error);
    throw error;
  }
};

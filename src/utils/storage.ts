import AsyncStorage from '@react-native-async-storage/async-storage';
import { CalendarEvent } from '../types';

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
    return events.map((event: any) => ({
      ...event,
      date: event.date ? new Date(event.date) : undefined,
      fromDate: event.fromDate ? new Date(event.fromDate) : undefined,
      toDate: event.toDate ? new Date(event.toDate) : undefined,
    }));
  } catch (error) {
    console.error('Error loading events from storage:', error);
    return [];
  }
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

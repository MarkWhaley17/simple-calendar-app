import { CalendarEvent } from '../types';
import { isSameDay } from './dateHelpers';

/**
 * Filter events for a specific date
 */
export const getEventsForDate = (events: CalendarEvent[], date: Date): CalendarEvent[] => {
  return events.filter(event => {
    const eventDate = event.fromDate || event.date || new Date();
    return isSameDay(eventDate, date);
  });
};

/**
 * Check if a specific date has any events
 */
export const hasEventsOnDate = (events: CalendarEvent[], date: Date): boolean => {
  return getEventsForDate(events, date).length > 0;
};

/**
 * Sort events: all-day events first, then by time
 */
export const sortEvents = (events: CalendarEvent[]): CalendarEvent[] => {
  return [...events].sort((a, b) => {
    if (a.isAllDay && !b.isAllDay) return -1;
    if (!a.isAllDay && b.isAllDay) return 1;
    return 0;
  });
};

/**
 * Parse links from a newline-separated string
 */
export const parseLinks = (linksString: string): string[] => {
  return linksString
    .split('\n')
    .map(link => link.trim())
    .filter(link => link.length > 0);
};

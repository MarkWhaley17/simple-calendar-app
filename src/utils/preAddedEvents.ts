// Pre-added events for the calendar app
// Extracted from EVENTS.md

import { CalendarEvent } from '../types';

// Event data extracted from EVENTS.md
// Format: Title, Date (YYYY-MM-DD), Description
const eventData = [
  {
    title: "Losar - Year of the Fire Horse",
    date: "2026-02-18",
    description: "Losar, the Tibetan New Year, will be celebrated on February 18, 2026, marking the start of the 2153rd year—the Year of the Fire Horse. This 15-day festival involves cleaning homes, offering prayers, hanging prayer flags, and sharing traditional food like guthuk. Major celebrations typically span from February 18-20, 2026.",
  },
];

// Convert event data to CalendarEvent objects
export const getPreAddedEvents = (): CalendarEvent[] => {
  return eventData.map((event, index) => {
    const [year, month, day] = event.date.split('-').map(Number);
    const eventDate = new Date(year, month - 1, day); // month is 0-indexed in JS

    return {
      id: `pre-added-${index}`,
      title: event.title,
      fromDate: eventDate,
      fromTime: '',
      description: event.description,
      isAllDay: true,
      // Legacy fields for compatibility
      date: eventDate,
      startTime: '',
    };
  });
};

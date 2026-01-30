// Pre-added events for the calendar app
// Extracted from EVENTS.md

import { CalendarEvent } from '../types';

// Event data extracted from EVENTS.md
// Format: Title, Date (YYYY-MM-DD), Description
// Synced with EVENTS.md
const eventData = [
  {
    title: "Medicine Buddha Day",
    date: "2026-01-06",
    description: "Monthly practice day on the 8th lunar day honoring the Medicine Buddha, especially for healing prayers and mantra recitation.",
    image: "medicine-buddha.jpg",
  },
  {
    title: "Protector Day",
    date: "2026-01-07",
    description: "Monthly day on the 29th lunar day for Dharma protector practices, offerings, and removing obstacles.",
    image: "protector-day.jpg",
  },
  {
    title: "Guru Rinpoche Day",
    date: "2026-01-08",
    description: "Monthly holy day on the 10th Tibetan lunar day honoring Padmasambhava, traditionally observed with guru yoga, mantra recitation, and tsok offerings.",
    image: "guru-rinpoche.jpg",
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
      image: event.image, // new property for background image filename
      // Legacy fields for compatibility
      date: eventDate,
      startTime: '',
    };
  });
};

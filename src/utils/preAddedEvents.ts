// Pre-added events for the calendar app
// Extracted from EVENTS.md

import { CalendarEvent } from '../types';

// Event data extracted from EVENTS.md
// Format: Title, Date (YYYY-MM-DD), optional toDate (YYYY-MM-DD), Description
// Synced with EVENTS.md
const eventData: { title: string; date: string; toDate?: string; description: string; image?: string }[] = [
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
  {
    title: "Full Moon",
    date: "2026-03-03",
    description: "Full moon day.",
  },
  {
    title: "King of Ling Lhasang",
    date: "2026-03-03",
    description: "Celebration of the King of Ling with lhasang smoke offering ceremony.",
  },
  {
    title: "Protector Day",
    date: "2026-03-07",
    description: "Monthly day on the 29th lunar day for Dharma protector practices, offerings, and removing obstacles.",
    image: "protector-day.jpg",
  },
  {
    title: "Dakini Day",
    date: "2026-03-13",
    description: "Monthly Dakini Day on the 25th lunar day, honoring the feminine principle of enlightened energy.",
  },
  {
    title: "Jambhala Day",
    date: "2026-03-16",
    description: "Monthly Jambhala Day for wealth deity practices and generosity offerings.",
  },
  {
    title: "Protector Day",
    date: "2026-03-17",
    description: "Monthly day on the 29th lunar day for Dharma protector practices, offerings, and removing obstacles.",
    image: "protector-day.jpg",
  },
  {
    title: "New Moon",
    date: "2026-03-19",
    description: "New moon day.",
  },
  {
    title: "Spring Equinox",
    date: "2026-03-20",
    description: "Spring equinox.",
  },
  {
    title: "Jambhala Day",
    date: "2026-03-26",
    description: "Monthly Jambhala Day for wealth deity practices and generosity offerings.",
  },
  {
    title: "Protector Day",
    date: "2026-03-27",
    description: "Monthly day on the 29th lunar day for Dharma protector practices, offerings, and removing obstacles.",
    image: "protector-day.jpg",
  },
  {
    title: "Guru Rinpoche Day",
    date: "2026-03-28",
    description: "Monthly holy day on the 10th Tibetan lunar day honoring Padmasambhava, traditionally observed with guru yoga, mantra recitation, and tsok offerings.",
    image: "guru-rinpoche.jpg",
  },
  {
    title: "Vajrayana Series Weekend 1",
    date: "2026-04-04",
    toDate: "2026-04-05",
    description: "Vajrayana Series Weekend 1.",
  },
  {
    title: "Mahayana Series Weekend 2",
    date: "2026-04-25",
    toDate: "2026-04-26",
    description: "Mahayana Series Weekend 2.",
  },
  {
    title: "Vajrayana Series Weekend 2",
    date: "2026-05-16",
    toDate: "2026-05-17",
    description: "Vajrayana Series Weekend 2.",
  },
  {
    title: "Mahayana Online Retreat",
    date: "2026-05-27",
    toDate: "2026-05-31",
    description: "Mahayana Online Retreat.",
  },
  {
    title: "Vajrayana Series Weekend 3",
    date: "2026-06-13",
    toDate: "2026-06-14",
    description: "Vajrayana Series Weekend 3. Amitayus intensive, 2 full teaching days.",
  },
  {
    title: "Mahayana Series Weekend 3",
    date: "2026-06-20",
    toDate: "2026-06-21",
    description: "Mahayana Series Weekend 3.",
  },
  {
    title: "In-Person Events Vermont",
    date: "2026-07-10",
    toDate: "2026-07-19",
    description: "In-person events in Vermont.",
  },
  {
    title: "Mahayana Retreat",
    date: "2026-07-10",
    toDate: "2026-07-12",
    description: "Mahayana Retreat, Vermont.",
  },
  {
    title: "Vajrayana Retreat 1",
    date: "2026-07-13",
    toDate: "2026-07-15",
    description: "Vajrayana Retreat 1, Vermont.",
  },
  {
    title: "Vajrayana Retreat 2",
    date: "2026-07-17",
    toDate: "2026-07-19",
    description: "Vajrayana Retreat 2, Vermont.",
  },
  {
    title: "In-Person Events Switzerland",
    date: "2026-08-11",
    toDate: "2026-08-22",
    description: "In-person events in Switzerland.",
  },
  {
    title: "Mahayana Retreat",
    date: "2026-08-11",
    toDate: "2026-08-16",
    description: "Mahayana Retreat, Switzerland.",
  },
  {
    title: "Vajrayana Retreat",
    date: "2026-08-16",
    toDate: "2026-08-22",
    description: "Vajrayana Retreat, Switzerland.",
  },
  {
    title: "Vajrayana Series Weekend 4",
    date: "2026-09-12",
    toDate: "2026-09-13",
    description: "Vajrayana Series Weekend 4.",
  },
  {
    title: "Mahayana Series Weekend 4",
    date: "2026-09-19",
    toDate: "2026-09-20",
    description: "Mahayana Series Weekend 4.",
  },
  {
    title: "Vajrayana Online Retreat",
    date: "2026-09-30",
    toDate: "2026-10-04",
    description: "Vajrayana Online Retreat.",
  },
  {
    title: "Mahayana Series Weekend 5",
    date: "2026-10-17",
    toDate: "2026-10-18",
    description: "Mahayana Series Weekend 5.",
  },
  {
    title: "Guided Meditation Practice with Sakyong Mipham Rinpoche",
    date: "2026-10-25",
    description: "Guided Meditation Practice with Sakyong Mipham Rinpoche. Open to everyone.",
  },
  {
    title: "Vajrayana Series Weekend 5",
    date: "2026-11-07",
    toDate: "2026-11-08",
    description: "Vajrayana Series Weekend 5.",
  },
  {
    title: "Mahayana Series Weekend 6",
    date: "2026-11-21",
    toDate: "2026-11-22",
    description: "Mahayana Series Weekend 6.",
  },
  {
    title: "Vajrayana Series Weekend 6",
    date: "2026-12-05",
    toDate: "2026-12-06",
    description: "Vajrayana Series Weekend 6.",
  },
  {
    title: "Buddha Sadhana Teaching and Practice Weekend",
    date: "2026-12-12",
    toDate: "2026-12-13",
    description: "Buddha Sadhana Teaching and Practice Weekend. Two full teaching days.",
  },
];

// Convert event data to CalendarEvent objects
export const getPreAddedEvents = (): CalendarEvent[] => {
  return eventData.map((event, index) => {
    const [year, month, day] = event.date.split('-').map(Number);
    const eventDate = new Date(year, month - 1, day); // month is 0-indexed in JS

    let toDate: Date | undefined;
    if (event.toDate) {
      const [toYear, toMonth, toDay] = event.toDate.split('-').map(Number);
      toDate = new Date(toYear, toMonth - 1, toDay);
    }

    return {
      id: `pre-added-${index}`,
      title: event.title,
      fromDate: eventDate,
      toDate,
      fromTime: '',
      description: event.description,
      isAllDay: true,
      image: event.image,
      // Legacy fields for compatibility
      date: eventDate,
      startTime: '',
    };
  });
};

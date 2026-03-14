// Member-only events — visible only to signed-in users
// AUTO-GENERATED from MEMBER_EVENTS.md by scripts/sync-events-from-md.js

import { CalendarEvent } from '../types';

const memberEventData: { title: string; date: string; toDate?: string; description: string; image?: string }[] = [
  {
    title: "MY Weekend 1",
    date: "2026-03-01",
    description: "Member-only Mahayana/Vajrayana Weekend 1.",
  },
  {
    title: "VY Nepal Pilgrimage",
    date: "2026-03-12",
    toDate: "2026-03-21",
    description: "Member pilgrimage to Nepal. Begins March 12, returns March 21.",
  },
  {
    title: "Nepal Retreat",
    date: "2026-03-27",
    toDate: "2026-04-10",
    description: "Member retreat in Nepal.",
  },
  {
    title: "VY Weekend 1",
    date: "2026-04-04",
    toDate: "2026-04-05",
    description: "Member-only Vajrayana Weekend 1.",
  },
  {
    title: "MY Weekend 2",
    date: "2026-04-25",
    toDate: "2026-04-26",
    description: "Member-only Mahayana Weekend 2.",
  },
  {
    title: "VY Weekend 2",
    date: "2026-05-16",
    toDate: "2026-05-17",
    description: "Member-only Vajrayana Weekend 2.",
  },
  {
    title: "Online MY Retreat",
    date: "2026-05-27",
    toDate: "2026-05-31",
    description: "Member-only online Mahayana retreat.",
  },
  {
    title: "VY Weekend 3",
    date: "2026-06-13",
    toDate: "2026-06-14",
    description: "Member-only Vajrayana Weekend 3.",
  },
  {
    title: "MY Weekend 3",
    date: "2026-06-20",
    toDate: "2026-06-21",
    description: "Member-only Mahayana Weekend 3.",
  },
  {
    title: "Vermont MY Retreat",
    date: "2026-07-10",
    toDate: "2026-07-12",
    description: "Member-only Vermont Mahayana retreat.",
  },
  {
    title: "Vermont VY Retreat 1",
    date: "2026-07-13",
    toDate: "2026-07-15",
    description: "Member-only Vermont Vajrayana retreat 1.",
  },
  {
    title: "Vermont VY Retreat 2",
    date: "2026-07-17",
    toDate: "2026-07-19",
    description: "Member-only Vermont Vajrayana retreat 2.",
  },
  {
    title: "Swiss MY Retreat",
    date: "2026-08-11",
    toDate: "2026-08-15",
    description: "Member-only Swiss Mahayana retreat.",
  },
  {
    title: "Swiss VY Retreat",
    date: "2026-08-16",
    toDate: "2026-08-22",
    description: "Member-only Swiss Vajrayana retreat.",
  },
  {
    title: "Swiss Retreat ends",
    date: "2026-08-22",
    description: "Member retreat in Switzerland ends.",
  },
  {
    title: "VY Weekend 4",
    date: "2026-09-12",
    toDate: "2026-09-13",
    description: "Member-only Vajrayana Weekend 4.",
  },
  {
    title: "MY Weekend 4",
    date: "2026-09-19",
    toDate: "2026-09-20",
    description: "Member-only Mahayana Weekend 4.",
  },
  {
    title: "Online VY Retreat",
    date: "2026-09-30",
    toDate: "2026-10-04",
    description: "Member-only online Vajrayana retreat.",
  },
  {
    title: "Online VY Retreat ends",
    date: "2026-10-04",
    description: "Member-only online Vajrayana retreat ends.",
  },
  {
    title: "MY Weekend 5",
    date: "2026-10-17",
    toDate: "2026-10-18",
    description: "Member-only Mahayana Weekend 5.",
  },
  {
    title: "VY Weekend 5",
    date: "2026-11-07",
    toDate: "2026-11-08",
    description: "Member-only Vajrayana Weekend 5.",
  },
  {
    title: "MY Weekend 6",
    date: "2026-11-21",
    toDate: "2026-11-22",
    description: "Member-only Mahayana Weekend 6.",
  },
  {
    title: "VY Weekend 6",
    date: "2026-12-05",
    toDate: "2026-12-06",
    description: "Member-only Vajrayana Weekend 6.",
  },
  {
    title: "Buddha Sadhana Weekend",
    date: "2026-12-12",
    toDate: "2026-12-13",
    description: "Member-only Buddha Sadhana weekend.",
  },
  {
    title: "Mamo Chants begin",
    date: "2027-01-27",
    description: "Member-only Mamo chants begin.",
  },
  {
    title: "Mamo Chants end",
    date: "2027-02-04",
    description: "Member-only Mamo chants end.",
  },
];

export function getMemberEvents(): CalendarEvent[] {
  return memberEventData.map((event, index) => {
    const [year, month, day] = event.date.split('-').map(Number);
    const fromDate = new Date(year, month - 1, day);

    let toDate: Date | undefined;
    if (event.toDate) {
      const [ty, tm, td] = event.toDate.split('-').map(Number);
      toDate = new Date(ty, tm - 1, td);
    }

    return {
      id: `event-member-${index}`,
      title: event.title,
      description: event.description,
      fromDate,
      toDate,
      isAllDay: true,
      isMembersOnly: true,
      ...(event.image ? { image: event.image } : {}),
    } as CalendarEvent;
  });
}

// Member-only events — visible only to signed-in users
// Extracted from MEMBER_EVENTS.md

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
    title: "Nepal Retreat begins",
    date: "2026-03-27",
    description: "Member retreat in Nepal begins.",
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
      id: `pre-member-${index}`,
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

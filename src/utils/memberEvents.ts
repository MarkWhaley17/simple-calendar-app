// Member-only events — visible only to signed-in users
// Extracted from MEMBER_EVENTS.md

import { CalendarEvent } from '../types';

const memberEventData: { title: string; date: string; toDate?: string; description: string; image?: string }[] = [
  {
    title: "Member Retreat – Spring 2026",
    date: "2026-04-10",
    toDate: "2026-04-12",
    description: "Exclusive three-day spring retreat for registered members. Includes teachings, practice sessions, and community meals.",
  },
  {
    title: "Member Q&A with Teacher",
    date: "2026-05-15",
    description: "Private question and answer session for members. Submit your questions in advance through the member portal.",
  },
  {
    title: "Advanced Practice Day",
    date: "2026-06-20",
    description: "Member-only advanced practice day. Prerequisites apply — contact the center for details.",
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

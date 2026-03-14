import { CalendarEvent } from '../types';

export const isMemberOnlyEvent = (event: CalendarEvent): boolean =>
  event.isMembersOnly === true || event.id.startsWith('event-member-');

export const filterVisibleEvents = (
  events: CalendarEvent[],
  isSignedIn: boolean
): CalendarEvent[] => (isSignedIn ? events : events.filter(event => !isMemberOnlyEvent(event)));

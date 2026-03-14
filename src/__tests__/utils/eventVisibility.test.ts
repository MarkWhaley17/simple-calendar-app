import { CalendarEvent } from '../../types';
import { filterVisibleEvents, isMemberOnlyEvent } from '../../utils/eventVisibility';

const baseEvent: CalendarEvent = {
  id: '1',
  title: 'Event',
  fromDate: new Date('2026-01-01'),
  fromTime: '',
  description: 'desc',
  isAllDay: true,
};

describe('eventVisibility', () => {
  it('treats event-member-* IDs as member-only', () => {
    expect(isMemberOnlyEvent({ ...baseEvent, id: 'event-member-1' })).toBe(true);
  });

  it('treats explicit isMembersOnly as member-only', () => {
    expect(isMemberOnlyEvent({ ...baseEvent, id: 'custom', isMembersOnly: true })).toBe(true);
  });

  it('does not treat normal events as member-only', () => {
    expect(isMemberOnlyEvent({ ...baseEvent, id: 'event-public-1' })).toBe(false);
  });

  it('filters out member events when signed out', () => {
    const events: CalendarEvent[] = [
      { ...baseEvent, id: 'event-public-1' },
      { ...baseEvent, id: 'event-member-1' },
      { ...baseEvent, id: 'custom', isMembersOnly: true },
    ];

    const visible = filterVisibleEvents(events, false);
    expect(visible.map(event => event.id)).toEqual(['event-public-1']);
  });

  it('returns all events when signed in', () => {
    const events: CalendarEvent[] = [
      { ...baseEvent, id: 'event-public-1' },
      { ...baseEvent, id: 'event-member-1' },
    ];

    const visible = filterVisibleEvents(events, true);
    expect(visible).toHaveLength(2);
  });
});

import { CalendarEvent } from '../../types';
import {
  isPreloadedEvent,
  sanitizeEventUpdateForEditability,
} from '../../utils/eventEditability';

describe('eventEditability', () => {
  const baseEvent: CalendarEvent = {
    id: '1',
    title: 'Base Event',
    description: 'Original description',
    fromDate: new Date(2026, 0, 10),
    fromTime: '9:00 AM',
    toDate: new Date(2026, 0, 10),
    toTime: '10:00 AM',
    links: ['https://original.example'],
    isAllDay: false,
  };

  it('identifies pre-loaded event IDs', () => {
    expect(isPreloadedEvent({ ...baseEvent, id: 'pre-added-10' })).toBe(true);
    expect(isPreloadedEvent({ ...baseEvent, id: 'pre-member-10' })).toBe(true);
    expect(isPreloadedEvent(baseEvent)).toBe(false);
  });

  it('locks core fields for pre-loaded events and allows only links updates', () => {
    const incoming = {
      id: 'pre-added-10',
      title: 'Edited Title',
      description: 'Attempted new description',
      fromDate: new Date(2030, 0, 1),
      fromTime: '1:00 PM',
      toDate: new Date(2030, 0, 2),
      toTime: '2:00 PM',
      links: ['https://new.example'],
      isAllDay: true,
    };

    const result = sanitizeEventUpdateForEditability(
      { ...baseEvent, id: 'pre-added-10' },
      incoming
    );

    expect(result.title).toBe('Base Event');
    expect(result.fromDate).toEqual(baseEvent.fromDate);
    expect(result.fromTime).toBe('9:00 AM');
    expect(result.toDate).toEqual(baseEvent.toDate);
    expect(result.toTime).toBe('10:00 AM');
    expect(result.isAllDay).toBe(false);
    expect(result.description).toBe('Original description');
    expect(result.links).toEqual(['https://new.example']);
  });
});

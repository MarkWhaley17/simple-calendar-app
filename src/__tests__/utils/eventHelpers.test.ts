import { CalendarEvent } from '../../types';
import {
  getEventsForDate,
  hasEventsOnDate,
  sortEvents,
  parseLinks,
} from '../../utils/eventHelpers';

describe('eventHelpers', () => {
  const mockEvents: CalendarEvent[] = [
    {
      id: '1',
      title: 'Event 1',
      fromDate: new Date(2026, 0, 15),
      fromTime: '9:00 AM',
    },
    {
      id: '2',
      title: 'Event 2',
      fromDate: new Date(2026, 0, 15),
      fromTime: '2:00 PM',
    },
    {
      id: '3',
      title: 'Event 3',
      fromDate: new Date(2026, 0, 16),
      fromTime: '10:00 AM',
    },
  ];

  describe('getEventsForDate', () => {
    it('should return events for the specified date', () => {
      const date = new Date(2026, 0, 15);
      const events = getEventsForDate(mockEvents, date);

      expect(events).toHaveLength(2);
      expect(events[0].id).toBe('1');
      expect(events[1].id).toBe('2');
    });

    it('should return empty array when no events on date', () => {
      const date = new Date(2026, 0, 20);
      const events = getEventsForDate(mockEvents, date);

      expect(events).toHaveLength(0);
    });

    it('should handle legacy date field', () => {
      const eventsWithLegacyDate: CalendarEvent[] = [
        {
          id: '4',
          title: 'Legacy Event',
          date: new Date(2026, 0, 17),
          startTime: '3:00 PM',
          fromDate: new Date(2026, 0, 17),
        },
      ];

      const date = new Date(2026, 0, 17);
      const events = getEventsForDate(eventsWithLegacyDate, date);

      expect(events).toHaveLength(1);
      expect(events[0].title).toBe('Legacy Event');
    });
  });

  describe('hasEventsOnDate', () => {
    it('should return true when events exist', () => {
      const date = new Date(2026, 0, 15);
      expect(hasEventsOnDate(mockEvents, date)).toBe(true);
    });

    it('should return false when no events exist', () => {
      const date = new Date(2026, 0, 20);
      expect(hasEventsOnDate(mockEvents, date)).toBe(false);
    });
  });

  describe('sortEvents', () => {
    it('should place all-day events first', () => {
      const events: CalendarEvent[] = [
        {
          id: '1',
          title: 'Regular Event',
          fromDate: new Date(2026, 0, 15),
          fromTime: '9:00 AM',
          isAllDay: false,
        },
        {
          id: '2',
          title: 'All Day Event',
          fromDate: new Date(2026, 0, 15),
          isAllDay: true,
        },
        {
          id: '3',
          title: 'Another Regular Event',
          fromDate: new Date(2026, 0, 15),
          fromTime: '2:00 PM',
          isAllDay: false,
        },
      ];

      const sorted = sortEvents(events);

      expect(sorted[0].title).toBe('All Day Event');
      expect(sorted[0].isAllDay).toBe(true);
    });

    it('should not mutate original array', () => {
      const events: CalendarEvent[] = [
        {
          id: '1',
          title: 'Event 1',
          fromDate: new Date(2026, 0, 15),
          isAllDay: false,
        },
      ];

      const originalLength = events.length;
      sortEvents(events);

      expect(events).toHaveLength(originalLength);
    });
  });

  describe('parseLinks', () => {
    it('should parse newline-separated links', () => {
      const input = 'https://example.com\nhttps://google.com\nhttps://github.com';
      const result = parseLinks(input);

      expect(result).toEqual([
        'https://example.com',
        'https://google.com',
        'https://github.com',
      ]);
    });

    it('should trim whitespace', () => {
      const input = '  https://example.com  \n  https://google.com  ';
      const result = parseLinks(input);

      expect(result).toEqual([
        'https://example.com',
        'https://google.com',
      ]);
    });

    it('should filter empty lines', () => {
      const input = 'https://example.com\n\n\nhttps://google.com\n';
      const result = parseLinks(input);

      expect(result).toEqual([
        'https://example.com',
        'https://google.com',
      ]);
    });

    it('should handle empty string', () => {
      const result = parseLinks('');
      expect(result).toEqual([]);
    });
  });
});

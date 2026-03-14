import { getMemberEvents } from '../../utils/memberEvents';

describe('getMemberEvents', () => {
  it('returns a non-empty array', () => {
    const events = getMemberEvents();
    expect(events.length).toBeGreaterThan(0);
  });

  it('all events have IDs prefixed with event-member-', () => {
    const events = getMemberEvents();
    events.forEach(event => {
      expect(event.id).toMatch(/^event-member-/);
    });
  });

  it('all events have isMembersOnly set to true', () => {
    const events = getMemberEvents();
    events.forEach(event => {
      expect(event.isMembersOnly).toBe(true);
    });
  });

  it('all events are all-day events', () => {
    const events = getMemberEvents();
    events.forEach(event => {
      expect(event.isAllDay).toBe(true);
    });
  });

  it('all events have valid Date objects for fromDate', () => {
    const events = getMemberEvents();
    events.forEach(event => {
      expect(event.fromDate).toBeInstanceOf(Date);
      expect(isNaN(event.fromDate.getTime())).toBe(false);
    });
  });

  it('multi-day events have a valid toDate', () => {
    const events = getMemberEvents();
    const multiDay = events.filter(e => e.toDate);
    expect(multiDay.length).toBeGreaterThan(0);
    multiDay.forEach(event => {
      expect(event.toDate).toBeInstanceOf(Date);
      expect(isNaN(event.toDate!.getTime())).toBe(false);
      expect(event.toDate!.getTime()).toBeGreaterThan(event.fromDate.getTime());
    });
  });

  it('all events have a non-empty title and description', () => {
    const events = getMemberEvents();
    events.forEach(event => {
      expect(event.title.trim().length).toBeGreaterThan(0);
      expect(event.description!.trim().length).toBeGreaterThan(0);
    });
  });

  it('each event has a unique ID', () => {
    const events = getMemberEvents();
    const ids = events.map(e => e.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

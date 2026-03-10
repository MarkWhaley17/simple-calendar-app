import { shiftCalendarDay, toDayStart } from '../../utils/dayNavigation';

describe('dayNavigation', () => {
  it('normalizes a date to day start', () => {
    const source = new Date(2026, 2, 10, 18, 42, 33);
    const normalized = toDayStart(source);

    expect(normalized.getFullYear()).toBe(2026);
    expect(normalized.getMonth()).toBe(2);
    expect(normalized.getDate()).toBe(10);
    expect(normalized.getHours()).toBe(0);
    expect(normalized.getMinutes()).toBe(0);
  });

  it('shifts days deterministically across repeated changes', () => {
    let cursor = new Date(2026, 0, 1, 22, 15, 0);

    for (let i = 0; i < 45; i += 1) {
      cursor = shiftCalendarDay(cursor, 1);
    }

    expect(cursor.getFullYear()).toBe(2026);
    expect(cursor.getMonth()).toBe(1);
    expect(cursor.getDate()).toBe(15);
    expect(cursor.getHours()).toBe(0);
  });

  it('supports moving backward', () => {
    const start = new Date(2026, 2, 10, 12, 0, 0);
    const previous = shiftCalendarDay(start, -3);

    expect(previous.getFullYear()).toBe(2026);
    expect(previous.getMonth()).toBe(2);
    expect(previous.getDate()).toBe(7);
    expect(previous.getHours()).toBe(0);
  });
});

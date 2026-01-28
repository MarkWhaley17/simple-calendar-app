import {
  formatFullDate,
  isSameDay,
  getDayName,
  getMonthName,
  isToday,
  getFirstDayOfMonth,
  getDaysInMonth,
} from '../../utils/dateHelpers';

describe('dateHelpers', () => {
  describe('formatFullDate', () => {
    it('should format date correctly', () => {
      const date = new Date(2026, 0, 15); // January 15, 2026
      expect(formatFullDate(date)).toBe('January 15, 2026');
    });

    it('should handle different months', () => {
      const date = new Date(2026, 11, 31); // December 31, 2026
      expect(formatFullDate(date)).toBe('December 31, 2026');
    });
  });

  describe('isSameDay', () => {
    it('should return true for same day', () => {
      const date1 = new Date(2026, 0, 15, 10, 30);
      const date2 = new Date(2026, 0, 15, 14, 45);
      expect(isSameDay(date1, date2)).toBe(true);
    });

    it('should return false for different days', () => {
      const date1 = new Date(2026, 0, 15);
      const date2 = new Date(2026, 0, 16);
      expect(isSameDay(date1, date2)).toBe(false);
    });

    it('should return false for different months', () => {
      const date1 = new Date(2026, 0, 15);
      const date2 = new Date(2026, 1, 15);
      expect(isSameDay(date1, date2)).toBe(false);
    });

    it('should return false for different years', () => {
      const date1 = new Date(2026, 0, 15);
      const date2 = new Date(2027, 0, 15);
      expect(isSameDay(date1, date2)).toBe(false);
    });
  });

  describe('getDayName', () => {
    it('should return correct day name', () => {
      const sunday = new Date(2026, 0, 4); // January 4, 2026 is a Sunday
      const monday = new Date(2026, 0, 5);

      expect(getDayName(sunday)).toBe('Sunday');
      expect(getDayName(monday)).toBe('Monday');
    });
  });

  describe('getMonthName', () => {
    it('should return correct month name', () => {
      const january = new Date(2026, 0, 1);
      const december = new Date(2026, 11, 1);

      expect(getMonthName(january)).toBe('January');
      expect(getMonthName(december)).toBe('December');
    });
  });

  describe('getFirstDayOfMonth', () => {
    it('should return correct first day of month', () => {
      // January 2026 starts on Thursday (4)
      expect(getFirstDayOfMonth(2026, 0)).toBe(4);

      // February 2026 starts on Sunday (0)
      expect(getFirstDayOfMonth(2026, 1)).toBe(0);
    });
  });

  describe('getDaysInMonth', () => {
    it('should return correct number of days', () => {
      // January has 31 days
      expect(getDaysInMonth(2026, 0)).toBe(31);

      // February 2026 has 28 days (not a leap year)
      expect(getDaysInMonth(2026, 1)).toBe(28);

      // February 2024 has 29 days (leap year)
      expect(getDaysInMonth(2024, 1)).toBe(29);

      // April has 30 days
      expect(getDaysInMonth(2026, 3)).toBe(30);
    });
  });
});

import { MONTH_NAMES, DAY_NAMES } from '../constants/dates';

/**
 * Format a date as "Month Day, Year" (e.g., "January 28, 2026")
 */
export const formatFullDate = (date: Date): string => {
  return `${MONTH_NAMES[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
};

/**
 * Check if two dates are the same day
 */
export const isSameDay = (date1: Date, date2: Date): boolean => {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
};

/**
 * Get the day name for a date (e.g., "Monday")
 */
export const getDayName = (date: Date): string => {
  return DAY_NAMES[date.getDay()];
};

/**
 * Get the month name for a date (e.g., "January")
 */
export const getMonthName = (date: Date): string => {
  return MONTH_NAMES[date.getMonth()];
};

/**
 * Check if a date is today
 */
export const isToday = (date: Date): boolean => {
  return isSameDay(date, new Date());
};

/**
 * Get the first day of a month (0 = Sunday, 6 = Saturday)
 */
export const getFirstDayOfMonth = (year: number, month: number): number => {
  return new Date(year, month, 1).getDay();
};

/**
 * Get the number of days in a month
 */
export const getDaysInMonth = (year: number, month: number): number => {
  return new Date(year, month + 1, 0).getDate();
};

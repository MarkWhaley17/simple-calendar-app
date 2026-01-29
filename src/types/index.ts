export type RecurrenceFrequency = 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly';

export interface RecurrenceRule {
  frequency: RecurrenceFrequency;
  interval: number; // e.g., 1 for every week, 2 for every 2 weeks
  endDate?: Date; // when to stop repeating
  daysOfWeek?: number[]; // for weekly: [0,1,2,3,4,5,6] where 0=Sunday
  count?: number; // alternative to endDate: repeat N times
  exceptions?: string[]; // date keys (YYYY-MM-DD) to skip
  overrides?: Record<string, Partial<CalendarEvent>>; // date key -> override fields
}

export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  fromDate: Date;
  fromTime?: string;
  toDate?: Date;
  toTime?: string;
  links?: string[];
  isAllDay?: boolean;
  recurrence?: RecurrenceRule;
  recurrenceId?: string; // groups recurring event instances together
  isRecurringInstance?: boolean; // true if this is a generated instance
  originalEventId?: string; // reference to the master event for instances
  // Legacy fields for backward compatibility
  date?: Date;
  startTime?: string;
  endTime?: string;
}

export type ViewMode = 'month' | 'day' | 'event' | 'addEvent' | 'editEvent' | 'account' | 'eventsList';
export type NavView = 'month' | 'day' | 'events' | 'account';

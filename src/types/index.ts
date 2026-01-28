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
  // Legacy fields for backward compatibility
  date?: Date;
  startTime?: string;
  endTime?: string;
}

export type ViewMode = 'month' | 'day' | 'event' | 'addEvent' | 'editEvent' | 'account';
export type NavView = 'month' | 'day' | 'account';

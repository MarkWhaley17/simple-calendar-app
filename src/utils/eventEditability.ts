import { CalendarEvent, RecurrenceRule } from '../types';

export interface EditableEventUpdate {
  id: string;
  title: string;
  description: string;
  fromDate: Date;
  fromTime: string;
  toDate: Date;
  toTime: string;
  links: string[];
  accumulations?: number;
  isAllDay: boolean;
  recurrence?: RecurrenceRule;
  reminderEnabled?: boolean;
  reminderMinutesBefore?: number;
  reminderHoursBefore?: number;
}

const EVENT_PREFIXES = ['event-public-', 'event-member-', 'pre-added-', 'pre-member-'];

export const isEventItem = (event: CalendarEvent): boolean =>
  EVENT_PREFIXES.some(prefix => event.id.startsWith(prefix));

export const isSessionItem = (event: CalendarEvent): boolean =>
  !isEventItem(event);

export const sanitizeEventUpdateForEditability = (
  originalEvent: CalendarEvent,
  incomingUpdate: EditableEventUpdate
): EditableEventUpdate => {
  if (!isEventItem(originalEvent)) {
    return incomingUpdate;
  }

  return {
    ...incomingUpdate,
    title: originalEvent.title,
    description: originalEvent.description || '',
    fromDate: originalEvent.fromDate || originalEvent.date || incomingUpdate.fromDate,
    fromTime: originalEvent.fromTime || originalEvent.startTime || incomingUpdate.fromTime,
    toDate: originalEvent.toDate || originalEvent.date || incomingUpdate.toDate,
    toTime: originalEvent.toTime || originalEvent.endTime || incomingUpdate.toTime,
    accumulations: originalEvent.accumulations,
    isAllDay: originalEvent.isAllDay ?? incomingUpdate.isAllDay,
    recurrence: originalEvent.recurrence,
    reminderEnabled: originalEvent.reminderEnabled,
    reminderMinutesBefore: originalEvent.reminderMinutesBefore,
    reminderHoursBefore: originalEvent.reminderHoursBefore,
  };
};

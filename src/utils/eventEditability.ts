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
  isAllDay: boolean;
  recurrence?: RecurrenceRule;
  reminderEnabled?: boolean;
  reminderMinutesBefore?: number;
  reminderHoursBefore?: number;
}

export const isPreloadedEvent = (event: CalendarEvent): boolean =>
  event.id.startsWith('pre-added-') || event.id.startsWith('pre-member-');

export const sanitizeEventUpdateForEditability = (
  originalEvent: CalendarEvent,
  incomingUpdate: EditableEventUpdate
): EditableEventUpdate => {
  if (!isPreloadedEvent(originalEvent)) {
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
    isAllDay: originalEvent.isAllDay ?? incomingUpdate.isAllDay,
    recurrence: originalEvent.recurrence,
    reminderEnabled: originalEvent.reminderEnabled,
    reminderMinutesBefore: originalEvent.reminderMinutesBefore,
    reminderHoursBefore: originalEvent.reminderHoursBefore,
  };
};

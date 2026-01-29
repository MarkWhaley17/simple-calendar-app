import { CalendarEvent, RecurrenceRule } from '../types';
import { toDateKey } from './dateHelpers';

/**
 * Generate recurring event instances from a master event
 * @param masterEvent The event with recurrence rules
 * @param startDate Start date for generating instances
 * @param endDate End date for generating instances
 * @returns Array of event instances
 */
export const generateRecurringInstances = (
  masterEvent: CalendarEvent,
  startDate: Date,
  endDate: Date
): CalendarEvent[] => {
  if (!masterEvent.recurrence || masterEvent.recurrence.frequency === 'none') {
    return [masterEvent];
  }

  const instances: CalendarEvent[] = [];
  const recurrence = masterEvent.recurrence;
  const exceptions = recurrence.exceptions || [];
  const overrides = recurrence.overrides || {};
  let currentDate = new Date(masterEvent.fromDate);
  let instanceCount = 0;
  const maxInstances = recurrence.count || 365; // safety limit

  // Determine the end date for recurrence
  const recurrenceEndDate = recurrence.endDate
    ? new Date(recurrence.endDate)
    : new Date(endDate);
  recurrenceEndDate.setHours(23, 59, 59, 999);

  while (currentDate <= recurrenceEndDate && currentDate <= endDate && instanceCount < maxInstances) {
    // Check if we should create an instance for this date
    const occurrenceKey = toDateKey(currentDate);
    if (exceptions.includes(occurrenceKey)) {
      currentDate = getNextOccurrence(currentDate, recurrence);
      continue;
    }

    if (currentDate >= startDate && shouldCreateInstance(currentDate, recurrence, masterEvent.fromDate)) {
      const baseInstance = createInstance(masterEvent, currentDate, instanceCount);
      const override = overrides[occurrenceKey];
      const instance = override ? applyOverride(baseInstance, override) : baseInstance;
      instances.push(instance);
      instanceCount++;

      // Stop if we've reached the count limit
      if (recurrence.count && instanceCount >= recurrence.count) {
        break;
      }
    }

    // Move to next occurrence
    currentDate = getNextOccurrence(currentDate, recurrence);
  }

  return instances;
};

/**
 * Check if an instance should be created for a given date
 */
const shouldCreateInstance = (
  date: Date,
  recurrence: RecurrenceRule,
  originalDate: Date
): boolean => {
  // Always create if date is at or after original date
  return date >= originalDate;
};

/**
 * Get the next occurrence date based on recurrence rules
 */
const getNextOccurrence = (currentDate: Date, recurrence: RecurrenceRule): Date => {
  const next = new Date(currentDate);

  switch (recurrence.frequency) {
    case 'daily':
      next.setDate(next.getDate() + recurrence.interval);
      break;

    case 'weekly':
      // Add interval weeks (7 days * interval)
      // This maintains the same day of the week
      next.setDate(next.getDate() + (7 * recurrence.interval));
      break;

    case 'monthly':
      // Add interval months, keeping the same day of month
      next.setMonth(next.getMonth() + recurrence.interval);
      // Handle edge case: if day doesn't exist in new month (e.g., Jan 31 -> Feb 31)
      // JavaScript will roll over to next month, which is fine
      break;

    case 'yearly':
      // Add interval years, keeping the same month and day
      next.setFullYear(next.getFullYear() + recurrence.interval);
      break;

    default:
      next.setDate(next.getDate() + 1);
  }

  return next;
};

/**
 * Create a single instance from a master event
 */
const createInstance = (
  masterEvent: CalendarEvent,
  instanceDate: Date,
  instanceIndex: number
): CalendarEvent => {
  const duration = masterEvent.toDate
    ? masterEvent.toDate.getTime() - masterEvent.fromDate.getTime()
    : 0;

  const toDate = duration > 0
    ? new Date(instanceDate.getTime() + duration)
    : new Date(instanceDate);

  return {
    ...masterEvent,
    id: `${masterEvent.id}-instance-${instanceIndex}`,
    fromDate: new Date(instanceDate),
    toDate,
    date: new Date(instanceDate), // legacy field
    isRecurringInstance: true,
    originalEventId: masterEvent.id,
    recurrenceId: masterEvent.recurrenceId || masterEvent.id,
  };
};

const applyOverride = (
  instance: CalendarEvent,
  override: Partial<CalendarEvent>
): CalendarEvent => {
  const {
    id,
    recurrence,
    recurrenceId,
    isRecurringInstance,
    originalEventId,
    ...safeOverride
  } = override;

  return {
    ...instance,
    ...safeOverride,
  };
};

/**
 * Get all recurring instances for display in the calendar
 * This generates instances for a reasonable time window (e.g., 1 year)
 */
export const expandRecurringEvents = (events: CalendarEvent[]): CalendarEvent[] => {
  const expanded: CalendarEvent[] = [];
  const now = new Date();
  const oneYearAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
  const twoYearsFromNow = new Date(now.getFullYear() + 2, now.getMonth(), now.getDate());

  events.forEach(event => {
    if (event.recurrence && event.recurrence.frequency !== 'none' && !event.isRecurringInstance) {
      // This is a master recurring event, generate instances
      const instances = generateRecurringInstances(event, oneYearAgo, twoYearsFromNow);
      expanded.push(...instances);
    } else if (!event.recurrence || event.recurrence.frequency === 'none') {
      // Regular non-recurring event
      expanded.push(event);
    }
    // Skip recurring instances (they're generated from masters)
  });

  return expanded;
};

/**
 * Get the display label for a recurrence frequency
 */
export const getRecurrenceLabel = (recurrence?: RecurrenceRule): string => {
  if (!recurrence || recurrence.frequency === 'none') {
    return 'Does not repeat';
  }

  switch (recurrence.frequency) {
    case 'weekly':
      return recurrence.interval === 1 ? 'Weekly' : 'Every 2 weeks';
    case 'monthly':
      return 'Monthly';
    case 'yearly':
      return 'Yearly';
    default:
      return 'Does not repeat';
  }
};

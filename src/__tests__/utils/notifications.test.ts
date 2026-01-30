jest.mock('expo-notifications', () => ({
  AndroidImportance: { DEFAULT: 3 },
  IosAuthorizationStatus: { PROVISIONAL: 2 },
  setNotificationHandler: jest.fn(),
  setNotificationChannelAsync: jest.fn(),
  getPermissionsAsync: jest.fn(),
  requestPermissionsAsync: jest.fn(),
  cancelAllScheduledNotificationsAsync: jest.fn(),
  scheduleNotificationAsync: jest.fn(),
}));

import { getReminderTriggerDateForTest } from '../../utils/notifications';
import { CalendarEvent, NotificationSettings } from '../../types';

describe('notifications', () => {
  const baseSettings: NotificationSettings = {
    practiceDayReminders: true,
    eventReminders: true,
    dailyQuoteNotifications: false,
    eventReminderMinutes: 15,
    allDayReminderHours: 12,
  };

  const createFutureDate = (daysFromNow: number) => {
    const date = new Date();
    date.setDate(date.getDate() + daysFromNow);
    date.setHours(0, 0, 0, 0);
    return date;
  };

  it('uses per-event minutes override for timed events', () => {
    const eventDate = createFutureDate(5);
    const event: CalendarEvent = {
      id: 'event-1',
      title: 'Timed Event',
      fromDate: eventDate,
      fromTime: '9:00 AM',
      isAllDay: false,
      reminderMinutesBefore: 30,
    };

    const trigger = getReminderTriggerDateForTest(event, baseSettings);
    expect(trigger).not.toBeNull();

    const expected = new Date(eventDate);
    expected.setHours(8, 30, 0, 0);

    expect(trigger?.getTime()).toBe(expected.getTime());
  });

  it('uses default minutes for timed events when no override is set', () => {
    const eventDate = createFutureDate(6);
    const event: CalendarEvent = {
      id: 'event-2',
      title: 'Timed Event',
      fromDate: eventDate,
      fromTime: '9:00 AM',
      isAllDay: false,
    };

    const trigger = getReminderTriggerDateForTest(event, baseSettings);
    expect(trigger).not.toBeNull();

    const expected = new Date(eventDate);
    expected.setHours(8, 45, 0, 0);

    expect(trigger?.getTime()).toBe(expected.getTime());
  });

  it('uses per-event hours override for all-day events', () => {
    const eventDate = createFutureDate(7);
    const event: CalendarEvent = {
      id: 'event-3',
      title: 'All Day Event',
      fromDate: eventDate,
      isAllDay: true,
      reminderHoursBefore: 6,
    };

    const trigger = getReminderTriggerDateForTest(event, baseSettings);
    expect(trigger).not.toBeNull();

    const expected = new Date(eventDate);
    expected.setHours(0, 0, 0, 0);
    expected.setHours(expected.getHours() - 6);

    expect(trigger?.getTime()).toBe(expected.getTime());
  });

  it('uses default hours for all-day events when no override is set', () => {
    const eventDate = createFutureDate(8);
    const event: CalendarEvent = {
      id: 'event-4',
      title: 'All Day Event',
      fromDate: eventDate,
      isAllDay: true,
    };

    const trigger = getReminderTriggerDateForTest(event, baseSettings);
    expect(trigger).not.toBeNull();

    const expected = new Date(eventDate);
    expected.setHours(0, 0, 0, 0);
    expected.setHours(expected.getHours() - 12);

    expect(trigger?.getTime()).toBe(expected.getTime());
  });
});

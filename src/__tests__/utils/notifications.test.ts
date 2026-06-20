jest.mock('expo-notifications', () => ({
  AndroidImportance: { DEFAULT: 3 },
  IosAuthorizationStatus: { PROVISIONAL: 2 },
  SchedulableTriggerInputTypes: { DATE: 'date', DAILY: 'daily' },
  setNotificationHandler: jest.fn(),
  setNotificationChannelAsync: jest.fn(),
  getPermissionsAsync: jest.fn(),
  requestPermissionsAsync: jest.fn(),
  cancelAllScheduledNotificationsAsync: jest.fn(),
  scheduleNotificationAsync: jest.fn(),
}));

jest.mock('../../utils/dailyQuote', () => ({
  getUpcomingDailyQuotes: jest.fn(),
}));

import * as Notifications from 'expo-notifications';
import { getReminderTriggerDateForTest, scheduleNotifications } from '../../utils/notifications';
import { getUpcomingDailyQuotes } from '../../utils/dailyQuote';
import { CalendarEvent, NotificationSettings } from '../../types';

const mockSchedule = Notifications.scheduleNotificationAsync as jest.Mock;
const mockGetPermissions = Notifications.getPermissionsAsync as jest.Mock;
const mockUpcomingQuotes = getUpcomingDailyQuotes as jest.Mock;

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

describe('daily quote notifications', () => {
  const quoteOnlySettings: NotificationSettings = {
    practiceDayReminders: false,
    eventReminders: false,
    dailyQuoteNotifications: true,
    eventReminderMinutes: 15,
    allDayReminderHours: 12,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockGetPermissions.mockResolvedValue({ granted: true });
  });

  it('schedules a distinct dated notification per upcoming day (not one repeating trigger)', async () => {
    mockUpcomingQuotes.mockResolvedValue([
      { dayOffset: 0, quote: 'Quote A' },
      { dayOffset: 1, quote: 'Quote B' },
      { dayOffset: 2, quote: 'Quote C' },
    ]);

    await scheduleNotifications([], quoteOnlySettings);

    // dayOffset 0 (today at 8am) is skipped if 8am has already passed, so allow 2–3 calls.
    const calls = mockSchedule.mock.calls;
    expect(calls.length).toBeGreaterThanOrEqual(2);

    const bodies = calls.map(([arg]) => arg.content.body);
    // Every scheduled quote is unique — the regression guard for "same quote every day".
    expect(new Set(bodies).size).toBe(bodies.length);
    bodies.forEach((b) => expect(['Quote A', 'Quote B', 'Quote C']).toContain(b));

    // Each uses a one-shot DATE trigger, never a repeating DAILY trigger.
    calls.forEach(([arg]) => {
      expect(arg.content.title).toBe('Daily Quote');
      expect(arg.trigger.type).toBe('date');
      expect(arg.trigger.date).toBeInstanceOf(Date);
    });
  });

  it('does not schedule quote notifications when the setting is off', async () => {
    mockUpcomingQuotes.mockResolvedValue([{ dayOffset: 0, quote: 'Quote A' }]);

    await scheduleNotifications([], { ...quoteOnlySettings, dailyQuoteNotifications: false });

    expect(mockUpcomingQuotes).not.toHaveBeenCalled();
    expect(mockSchedule).not.toHaveBeenCalled();
  });
});

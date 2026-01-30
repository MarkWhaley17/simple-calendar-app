import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { CalendarEvent, NotificationSettings } from '../types';
import { getRandomQuote } from './quotes';

const DAILY_QUOTE_HOUR = 8;
const UPCOMING_WINDOW_DAYS = 90;

const hasAnyNotificationsEnabled = (settings: NotificationSettings): boolean => {
  return (
    settings.practiceDayReminders ||
    settings.eventReminders ||
    settings.dailyQuoteNotifications
  );
};

export const initializeNotifications = async (): Promise<void> => {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'Default',
      importance: Notifications.AndroidImportance.DEFAULT,
    });
  }
};

export const ensureNotificationPermissions = async (): Promise<boolean> => {
  const settings = await Notifications.getPermissionsAsync();
  if (settings.granted || settings.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL) {
    return true;
  }

  const requested = await Notifications.requestPermissionsAsync();
  return (
    requested.granted ||
    requested.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL
  );
};

export const scheduleNotifications = async (
  events: CalendarEvent[],
  settings: NotificationSettings
): Promise<void> => {
  await Notifications.cancelAllScheduledNotificationsAsync();

  if (!hasAnyNotificationsEnabled(settings)) {
    return;
  }

  const hasPermission = await ensureNotificationPermissions();
  if (!hasPermission) {
    return;
  }

  const { start, end } = getUpcomingWindow();
  const upcomingEvents = events.filter(event => {
    const date = event.fromDate || event.date;
    if (!date) return false;
    return date >= start && date <= end;
  });

  if (settings.practiceDayReminders) {
    const practiceEvents = upcomingEvents.filter(event => event.id.startsWith('pre-'));
    await Promise.all(practiceEvents.map(event => scheduleEventReminder(event, settings)));
  }

  if (settings.eventReminders) {
    const userEvents = upcomingEvents.filter(event => !event.id.startsWith('pre-'));
    await Promise.all(userEvents.map(event => scheduleEventReminder(event, settings)));
  }

  if (settings.dailyQuoteNotifications) {
    await scheduleDailyQuoteReminder();
  }
};

const getUpcomingWindow = (): { start: Date; end: Date } => {
  const start = new Date();
  const end = new Date();
  end.setDate(end.getDate() + UPCOMING_WINDOW_DAYS);
  return { start, end };
};

const scheduleEventReminder = async (
  event: CalendarEvent,
  settings: NotificationSettings
): Promise<void> => {
  const triggerDate = getReminderTriggerDateForTest(event, settings);
  if (!triggerDate) return;

  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: event.title || 'Upcoming event',
        body: event.isAllDay ? 'All day event' : 'Starting soon',
        sound: true,
        channelId: Platform.OS === 'android' ? 'default' : undefined,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: triggerDate,
        channelId: Platform.OS === 'android' ? 'default' : undefined,
      },
    });
  } catch (error) {
    console.error('Failed to schedule event reminder', {
      eventId: event.id,
      title: event.title,
      triggerDate: triggerDate.toISOString(),
      error,
    });
  }
};

const scheduleDailyQuoteReminder = async (): Promise<void> => {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Daily Quote',
      body: getRandomQuote(),
      sound: true,
      channelId: Platform.OS === 'android' ? 'default' : undefined,
    },
    trigger: {
      hour: DAILY_QUOTE_HOUR,
      minute: 0,
      repeats: true,
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      channelId: Platform.OS === 'android' ? 'default' : undefined,
    },
  });
};

export const getReminderTriggerDateForTest = (
  event: CalendarEvent,
  settings: NotificationSettings
): Date | null => {
  if (event.reminderEnabled === false) {
    return null;
  }

  const date = event.fromDate || event.date;
  if (!date) return null;

  const eventTime = event.isAllDay ? null : (event.fromTime || event.startTime || '');
  const eventDateTime = eventTime
    ? applyTimeToDate(date, eventTime)
    : applyTimeToDate(date, '12:00 AM');

  if (!eventDateTime) return null;

  const leadMs = event.isAllDay
    ? getAllDayLeadMs(event, settings)
    : getTimedLeadMs(event, settings);
  const triggerDate = new Date(eventDateTime.getTime() - leadMs);
  if (triggerDate <= new Date()) return null;
  return triggerDate;
};

const getTimedLeadMs = (
  event: CalendarEvent,
  settings: NotificationSettings
): number => {
  const minutes = event.reminderMinutesBefore ?? settings.eventReminderMinutes;
  return Math.max(minutes, 0) * 60 * 1000;
};

const getAllDayLeadMs = (
  event: CalendarEvent,
  settings: NotificationSettings
): number => {
  const hours = event.reminderHoursBefore ?? settings.allDayReminderHours;
  return Math.max(hours, 0) * 60 * 60 * 1000;
};

const applyTimeToDate = (baseDate: Date, timeString: string): Date | null => {
  const parsed = parseTimeString(timeString);
  if (!parsed) return null;

  const result = new Date(baseDate);
  result.setHours(parsed.hours, parsed.minutes, 0, 0);
  return result;
};

const parseTimeString = (
  timeString: string
): { hours: number; minutes: number } | null => {
  const match = timeString.trim().match(/^(\d{1,2})(?::(\d{2}))?\s*(AM|PM)$/i);
  if (!match) {
    return null;
  }

  let hours = Number(match[1]);
  const minutes = Number(match[2] || '0');
  const meridiem = match[3].toUpperCase();

  if (meridiem === 'PM' && hours < 12) {
    hours += 12;
  } else if (meridiem === 'AM' && hours === 12) {
    hours = 0;
  }

  return { hours, minutes };
};

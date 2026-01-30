import AsyncStorage from '@react-native-async-storage/async-storage';
import { NotificationSettings } from '../types';

const NOTIFICATION_SETTINGS_KEY = '@kalapa_notification_settings';

export const defaultNotificationSettings: NotificationSettings = {
  practiceDayReminders: true,
  eventReminders: true,
  dailyQuoteNotifications: false,
};

export const loadNotificationSettings = async (): Promise<NotificationSettings> => {
  try {
    const jsonValue = await AsyncStorage.getItem(NOTIFICATION_SETTINGS_KEY);
    if (!jsonValue) {
      return defaultNotificationSettings;
    }

    const parsed = JSON.parse(jsonValue);
    return {
      ...defaultNotificationSettings,
      ...parsed,
    } as NotificationSettings;
  } catch (error) {
    console.error('Error loading notification settings:', error);
    return defaultNotificationSettings;
  }
};

export const saveNotificationSettings = async (
  settings: NotificationSettings
): Promise<void> => {
  try {
    await AsyncStorage.setItem(NOTIFICATION_SETTINGS_KEY, JSON.stringify(settings));
  } catch (error) {
    console.error('Error saving notification settings:', error);
    throw error;
  }
};

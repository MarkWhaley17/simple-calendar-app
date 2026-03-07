import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { AuthUser } from '../types';

const FEEDBACK_ENDPOINT = process.env.EXPO_PUBLIC_FEEDBACK_WEBHOOK_URL;
const FEEDBACK_TOKEN = process.env.EXPO_PUBLIC_FEEDBACK_APP_TOKEN;
const INSTALLATION_KEY = '@feedback_installation_id';
const MAX_SUBJECT_LENGTH = 140;
const MAX_MESSAGE_LENGTH = 4000;

export interface FeedbackInput {
  message: string;
  subject: string;
  user: AuthUser | null;
}

const clamp = (value: string, maxLength: number) => value.trim().slice(0, maxLength);

const createInstallationId = () => {
  const randomPart = Math.random().toString(36).slice(2, 10);
  return `kalapa-${Date.now()}-${randomPart}`;
};

const getAppMetadata = () => {
  const expoConfig = Constants.expoConfig;
  const appVersion = expoConfig?.version ?? 'unknown';
  const appBuild =
    (Platform.OS === 'ios'
      ? expoConfig?.ios?.buildNumber
      : expoConfig?.android?.versionCode?.toString()) ?? 'unknown';

  return { appBuild, appVersion };
};

const getInstallationId = async () => {
  const existing = await AsyncStorage.getItem(INSTALLATION_KEY);
  if (existing) {
    return existing;
  }

  const created = createInstallationId();
  await AsyncStorage.setItem(INSTALLATION_KEY, created);
  return created;
};

export async function submitFeedback(input: FeedbackInput): Promise<void> {
  if (!FEEDBACK_ENDPOINT || !FEEDBACK_TOKEN) {
    throw new Error('Feedback service is not configured.');
  }

  const subject = clamp(input.subject, MAX_SUBJECT_LENGTH);
  const message = clamp(input.message, MAX_MESSAGE_LENGTH);
  if (!subject || !message) {
    throw new Error('Please provide both a subject and message.');
  }

  const installationId = await getInstallationId();
  const { appBuild, appVersion } = getAppMetadata();
  const payload = {
    appBuild,
    appToken: FEEDBACK_TOKEN,
    appVersion,
    honeypot: '',
    installationId,
    message,
    platform: Platform.OS,
    source: 'kalapa-calendar-app',
    subject,
    timestampUtc: new Date().toISOString(),
    userDisplayName: input.user?.displayName ?? '',
    userEmail: input.user?.email ?? '',
  };

  const response = await fetch(FEEDBACK_ENDPOINT, {
    body: JSON.stringify(payload),
    headers: {
      'Content-Type': 'application/json',
    },
    method: 'POST',
  });

  let responseBody: { message?: string; ok?: boolean } | null = null;
  try {
    responseBody = await response.json();
  } catch {
    responseBody = null;
  }

  if (!response.ok || responseBody?.ok !== true) {
    throw new Error(responseBody?.message ?? 'Could not submit feedback.');
  }
}

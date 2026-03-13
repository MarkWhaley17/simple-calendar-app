import { Platform } from 'react-native';

let mockNativeBuildVersion: string | null = '14';
let mockExpoConfig: any = {
  version: '1.0.0',
  ios: { buildNumber: '10' },
  android: { versionCode: 42 },
};

jest.mock('expo-application', () => ({
  get nativeBuildVersion() {
    return mockNativeBuildVersion;
  },
}));

jest.mock('expo-constants', () => ({
  __esModule: true,
  default: {
    get expoConfig() {
      return mockExpoConfig;
    },
  },
}));

describe('submitFeedback metadata', () => {
  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
    process.env.EXPO_PUBLIC_FEEDBACK_WEBHOOK_URL = 'https://example.com/feedback';
    process.env.EXPO_PUBLIC_FEEDBACK_APP_TOKEN = 'token-123';
    mockNativeBuildVersion = '14';
    mockExpoConfig = {
      version: '1.0.0',
      ios: { buildNumber: '10' },
      android: { versionCode: 42 },
    };
    const AsyncStorage = require('@react-native-async-storage/async-storage');
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue('installation-1');
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ ok: true }),
    } as never);
  });

  it('prefers native runtime build number over expo config build number', async () => {
    const { submitFeedback } = require('../../utils/feedback');
    await submitFeedback({
      message: 'Message body',
      subject: 'Feedback subject',
      user: null,
    });

    const request = (global.fetch as jest.Mock).mock.calls[0][1];
    const payload = JSON.parse(request.body as string);

    expect(payload.appBuild).toBe('14');
    expect(payload.appVersion).toBe('1.0.0');
  });

  it('falls back to configured build when native runtime build is unavailable', async () => {
    mockNativeBuildVersion = null;
    const { submitFeedback } = require('../../utils/feedback');

    await submitFeedback({
      message: 'Message body',
      subject: 'Feedback subject',
      user: null,
    });

    const request = (global.fetch as jest.Mock).mock.calls[0][1];
    const payload = JSON.parse(request.body as string);
    const expectedBuild = Platform.OS === 'ios' ? '10' : '42';

    expect(payload.appBuild).toBe(expectedBuild);
  });
});

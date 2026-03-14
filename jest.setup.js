// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

// Mock DateTimePicker
jest.mock('@react-native-community/datetimepicker', () => 'DateTimePicker');

// Mock expo modules
jest.mock('expo-status-bar', () => ({
  StatusBar: 'StatusBar',
}));
jest.mock('expo-haptics', () => ({
  selectionAsync: jest.fn(() => Promise.resolve()),
  impactAsync: jest.fn(() => Promise.resolve()),
  notificationAsync: jest.fn(() => Promise.resolve()),
  ImpactFeedbackStyle: {
    Light: 'Light',
  },
  NotificationFeedbackType: {
    Success: 'Success',
  },
}));
jest.mock('expo-av', () => ({
  InterruptionModeIOS: {
    DoNotMix: 'DoNotMix',
  },
  Audio: {
    setAudioModeAsync: jest.fn(() => Promise.resolve()),
    Sound: {
      createAsync: jest.fn(() => {
        let statusCallCount = 0;
        return Promise.resolve({
          sound: {
            setOnPlaybackStatusUpdate: jest.fn(),
            playAsync: jest.fn(() => Promise.resolve()),
            getStatusAsync: jest.fn(() => {
              statusCallCount += 1;
              if (statusCallCount < 2) {
                return Promise.resolve({ isLoaded: true, isPlaying: true, didJustFinish: false, positionMillis: 250 });
              }
              return Promise.resolve({ isLoaded: true, isPlaying: false, didJustFinish: true, positionMillis: 10000 });
            }),
            unloadAsync: jest.fn(() => Promise.resolve()),
          },
        });
      }),
    },
  },
}));

jest.mock('react-native-reanimated', () => {
  const Reanimated = require('react-native-reanimated/mock');
  Reanimated.default.call = () => {};
  return Reanimated;
});

// Global setup for Expo
global.__ExpoImportMetaRegistry = {};
global.structuredClone = (val) => JSON.parse(JSON.stringify(val));

import * as Haptics from 'expo-haptics';
import { Audio } from 'expo-av';
import { playPracticeCompletionFeedback, playPracticeGong } from '../../utils/practiceCompletion';

describe('practice completion audio feedback', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('plays gong sound without completion haptics when called directly', async () => {
    await playPracticeGong();

    expect(Audio.setAudioModeAsync).toHaveBeenCalled();
    expect(Audio.Sound.createAsync).toHaveBeenCalled();
    expect(Haptics.notificationAsync).not.toHaveBeenCalled();
  });

  it('plays gong sound when playback starts normally', async () => {
    await playPracticeCompletionFeedback();

    expect(Audio.setAudioModeAsync).toHaveBeenCalled();
    expect(Audio.Sound.createAsync).toHaveBeenCalled();
    expect(Haptics.notificationAsync).toHaveBeenCalledTimes(3);
  });

  it('still triggers three subtle haptic pulses when playback does not start', async () => {
    let statusCallCount = 0;
    (Audio.Sound.createAsync as jest.Mock).mockResolvedValueOnce({
      sound: {
        setOnPlaybackStatusUpdate: jest.fn(),
        playAsync: jest.fn(() => Promise.resolve()),
        getStatusAsync: jest.fn(() => {
          statusCallCount += 1;
          if (statusCallCount < 2) {
            return Promise.resolve({ isLoaded: true, isPlaying: true, didJustFinish: false, positionMillis: 40 });
          }
          return Promise.resolve({ isLoaded: true, isPlaying: false, didJustFinish: true, positionMillis: 120 });
        }),
        unloadAsync: jest.fn(() => Promise.resolve()),
      },
    });

    await playPracticeCompletionFeedback();

    expect(Haptics.notificationAsync).toHaveBeenCalledTimes(3);
  });
});

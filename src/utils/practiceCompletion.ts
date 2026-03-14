import { Audio, InterruptionModeIOS } from 'expo-av';
import * as Haptics from 'expo-haptics';

const gongSoundAsset = require('../../assets/sounds/gong.wav');

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const playFallbackHaptics = async (count = 3): Promise<void> => {
  for (let i = 0; i < count; i += 1) {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    await delay(220);
  }
};

const playGongSound = async (): Promise<void> => {
  await Audio.setAudioModeAsync({
    allowsRecordingIOS: false,
    staysActiveInBackground: false,
    playsInSilentModeIOS: false,
    interruptionModeIOS: InterruptionModeIOS.DoNotMix,
    shouldDuckAndroid: true,
    playThroughEarpieceAndroid: false,
  });

  const { sound } = await Audio.Sound.createAsync(
    gongSoundAsset,
    {
      shouldPlay: false,
      isLooping: false,
      volume: 0.85,
      rate: 1.0,
    }
  );

  const initialStatus = await sound.getStatusAsync();
  const durationMillis =
    initialStatus.isLoaded && typeof initialStatus.durationMillis === 'number'
      ? initialStatus.durationMillis
      : null;

  await sound.playAsync();
  const startedAt = Date.now();
  const maxWaitMs = Math.min(
    30000,
    Math.max(3000, (durationMillis ?? 10000) + 1500)
  );
  while (Date.now() - startedAt < maxWaitMs) {
    await delay(200);
    const status = await sound.getStatusAsync();
    if (!status.isLoaded) continue;

    if (status.didJustFinish) {
      break;
    }

    if (
      typeof status.durationMillis === 'number' &&
      typeof status.positionMillis === 'number' &&
      status.positionMillis >= status.durationMillis - 60
    ) {
      break;
    }
  }
  await sound.unloadAsync();
};

export const playPracticeGong = async (): Promise<void> => {
  try {
    await playGongSound();
  } catch (error) {
    console.warn('Practice gong feedback failed', error);
  }
};

export const playPracticeCompletionFeedback = async (): Promise<void> => {
  // Always provide tactile completion feedback (3 subtle pulses).
  // This guarantees feedback even when iOS silent mode mutes audio.
  const hapticsPromise = playFallbackHaptics(3);

  try {
    await playGongSound();
  } catch (error) {
    console.warn('Practice completion feedback failed', error);
  } finally {
    await hapticsPromise;
  }
};

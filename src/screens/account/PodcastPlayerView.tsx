import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Slider from '@react-native-community/slider';
import { Audio, AVPlaybackStatus, InterruptionModeIOS } from 'expo-av';
import { PodcastEpisode } from '../../services/podcasts';
import { colors, spacing } from '../../theme/tokens';
import config from '../../config';

interface PodcastPlayerViewProps {
  episode: PodcastEpisode;
  onBack: () => void;
}

function formatMillis(millis: number): string {
  const totalSeconds = Math.max(0, Math.round(millis / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const mm = hours > 0 ? String(minutes).padStart(2, '0') : String(minutes);
  const ss = String(seconds).padStart(2, '0');
  return hours > 0 ? `${hours}:${mm}:${ss}` : `${mm}:${ss}`;
}

/**
 * Foreground-only playback, built on the expo-av module already used for the practice gong.
 * No background audio or lock-screen controls yet — that needs the native
 * react-native-track-player setup planned for a later step.
 */
const PodcastPlayerView: React.FC<PodcastPlayerViewProps> = ({ episode, onBack }) => {
  const soundRef = useRef<Audio.Sound | null>(null);
  const isSeekingRef = useRef(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [positionMillis, setPositionMillis] = useState(0);
  const [durationMillis, setDurationMillis] = useState((episode.durationSeconds ?? 0) * 1000);

  const onStatusUpdate = useCallback((status: AVPlaybackStatus) => {
    if (!status.isLoaded) {
      if (status.error) {
        setError(status.error);
      }
      return;
    }
    setIsPlaying(status.isPlaying);
    if (!isSeekingRef.current) {
      setPositionMillis(status.positionMillis);
    }
    if (typeof status.durationMillis === 'number') {
      setDurationMillis(status.durationMillis);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      try {
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: false,
          staysActiveInBackground: false,
          playsInSilentModeIOS: true,
          interruptionModeIOS: InterruptionModeIOS.DoNotMix,
          shouldDuckAndroid: true,
          playThroughEarpieceAndroid: false,
        });

        const { sound } = await Audio.Sound.createAsync(
          { uri: episode.audioUrl },
          { shouldPlay: true, progressUpdateIntervalMillis: 500 },
          onStatusUpdate
        );

        if (!isMounted) {
          await sound.unloadAsync();
          return;
        }

        soundRef.current = sound;
        setIsLoading(false);
      } catch (err: unknown) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Could not play this episode.');
          setIsLoading(false);
        }
      }
    };

    load();

    return () => {
      isMounted = false;
      soundRef.current?.unloadAsync();
      soundRef.current = null;
    };
  }, [episode.audioUrl, onStatusUpdate]);

  const togglePlay = async () => {
    if (!soundRef.current) return;
    if (isPlaying) {
      await soundRef.current.pauseAsync();
    } else {
      await soundRef.current.playAsync();
    }
  };

  const handleSlidingComplete = async (value: number) => {
    isSeekingRef.current = false;
    setPositionMillis(value);
    await soundRef.current?.setPositionAsync(value);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Image source={config.assets.headerPatternImage} style={styles.headerPattern} resizeMode="cover" />
        <View style={styles.headerButtons}>
          <TouchableOpacity onPress={onBack} style={styles.headerButton} testID="podcast-player-back">
            <Text style={styles.headerButtonText}>Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {episode.title}
          </Text>
          <View style={styles.headerButton} />
        </View>
      </View>

      <View style={styles.content}>
        {isLoading ? (
          <View style={styles.centered} testID="podcast-player-loading">
            <ActivityIndicator color={colors.brandPrimary} />
            <Text style={styles.loadingText}>Loading episode…</Text>
          </View>
        ) : error ? (
          <View style={styles.centered} testID="podcast-player-error">
            <Text style={styles.errorTitle}>Could not play this episode.</Text>
            <Text style={styles.errorBody}>{error}</Text>
          </View>
        ) : (
          <View style={styles.playerBody}>
            <View style={styles.artwork} />
            <Text style={styles.episodeTitle} numberOfLines={2}>
              {episode.title}
            </Text>

            <Slider
              style={styles.slider}
              minimumValue={0}
              maximumValue={Math.max(durationMillis, 1)}
              value={positionMillis}
              onSlidingStart={() => {
                isSeekingRef.current = true;
              }}
              onSlidingComplete={handleSlidingComplete}
              minimumTrackTintColor={colors.brandPrimary}
              maximumTrackTintColor={colors.borderSubtle}
              thumbTintColor={colors.brandPrimary}
              testID="podcast-player-slider"
            />
            <View style={styles.timeRow}>
              <Text style={styles.timeText}>{formatMillis(positionMillis)}</Text>
              <Text style={styles.timeText}>-{formatMillis(Math.max(durationMillis - positionMillis, 0))}</Text>
            </View>

            <TouchableOpacity onPress={togglePlay} style={styles.playButton} testID="podcast-player-play-pause">
              <Text style={styles.playButtonText}>{isPlaying ? 'Pause' : 'Play'}</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.bgSubtle,
    flex: 1,
  },
  header: {
    backgroundColor: colors.headerPlainBg,
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
    paddingHorizontal: spacing.lg + spacing.xs,
    overflow: 'hidden',
    shadowColor: colors.brandPrimaryDark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  headerPattern: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.15,
    transform: [{ translateX: -90 }, { translateY: -20 }, { scale: 0.8 }],
  },
  headerButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    color: colors.brandPrimaryDark,
    flex: 1,
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.3,
    marginHorizontal: spacing.sm,
    textAlign: 'center',
  },
  headerButton: {
    minWidth: 72,
    paddingVertical: 10,
  },
  headerButtonText: {
    color: colors.brandPrimaryDark,
    fontSize: 17,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  content: {
    flex: 1,
  },
  centered: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    padding: spacing.lg,
  },
  loadingText: {
    color: colors.textSecondary,
    fontSize: 14,
    marginTop: spacing.sm,
  },
  errorTitle: {
    color: colors.textPrimary,
    fontSize: 18,
    fontWeight: '700',
    marginBottom: spacing.xs,
    textAlign: 'center',
  },
  errorBody: {
    color: colors.textSecondary,
    textAlign: 'center',
  },
  playerBody: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  artwork: {
    backgroundColor: colors.brandSurface,
    borderRadius: 20,
    height: 180,
    marginBottom: spacing.xl,
    width: 180,
  },
  episodeTitle: {
    color: colors.brandInk,
    fontSize: 17,
    fontWeight: '700',
    marginBottom: spacing.xl,
    textAlign: 'center',
  },
  slider: {
    marginBottom: spacing.xs,
    width: '100%',
  },
  timeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xl,
    width: '100%',
  },
  timeText: {
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: '600',
  },
  playButton: {
    alignItems: 'center',
    backgroundColor: colors.brandPrimary,
    borderRadius: 999,
    paddingHorizontal: spacing.xxl,
    paddingVertical: spacing.md,
  },
  playButtonText: {
    color: colors.textOnBrand,
    fontSize: 16,
    fontWeight: '700',
  },
});

export default PodcastPlayerView;

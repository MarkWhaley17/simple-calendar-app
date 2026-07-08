import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { fetchPodcastEpisodes, PodcastEpisode } from '../../services/podcasts';
import { colors, elevation, spacing } from '../../theme/tokens';
import config from '../../config';

interface PodcastListViewProps {
  onBack: () => void;
  onSelectEpisode: (episode: PodcastEpisode) => void;
}

function formatEpisodeDuration(seconds?: number): string | null {
  if (seconds === undefined || Number.isNaN(seconds)) return null;
  const totalSeconds = Math.max(0, Math.round(seconds));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const secs = totalSeconds % 60;
  const mm = hours > 0 ? String(minutes).padStart(2, '0') : String(minutes);
  const ss = String(secs).padStart(2, '0');
  return hours > 0 ? `${hours}:${mm}:${ss}` : `${mm}:${ss}`;
}

function formatEpisodeDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

const PodcastListView: React.FC<PodcastListViewProps> = ({ onBack, onSelectEpisode }) => {
  const [episodes, setEpisodes] = useState<PodcastEpisode[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadEpisodes = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await fetchPodcastEpisodes();
      setEpisodes(result);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Could not load podcasts.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadEpisodes();
  }, [loadEpisodes]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Image source={config.assets.headerPatternImage} style={styles.headerPattern} resizeMode="cover" />
        <View style={styles.headerButtons}>
          <TouchableOpacity onPress={onBack} style={styles.headerButton} testID="podcasts-header-back">
            <Text style={styles.headerButtonText}>Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Podcasts</Text>
          <View style={styles.headerButton} />
        </View>
      </View>

      <View style={styles.content}>
        {isLoading ? (
          <View style={styles.centered} testID="podcasts-loading">
            <ActivityIndicator color={colors.brandPrimary} />
            <Text style={styles.loadingText}>Loading podcasts…</Text>
          </View>
        ) : error ? (
          <View style={styles.centered} testID="podcasts-error">
            <Text style={styles.errorTitle}>Could not load podcasts.</Text>
            <Text style={styles.errorBody}>{error}</Text>
            <TouchableOpacity onPress={loadEpisodes} style={styles.retryButton} testID="podcasts-retry-button">
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : episodes.length === 0 ? (
          <View style={styles.centered} testID="podcasts-empty">
            <Text style={styles.emptyText}>No episodes yet. Check back soon.</Text>
          </View>
        ) : (
          <FlatList
            data={episodes}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.list}
            renderItem={({ item }) => {
              const duration = formatEpisodeDuration(item.durationSeconds);
              return (
                <TouchableOpacity
                  style={styles.episodeRow}
                  onPress={() => onSelectEpisode(item)}
                  testID={`podcast-episode-${item.id}`}
                >
                  <Text style={styles.episodeTitle}>{item.title}</Text>
                  <Text style={styles.episodeMeta}>
                    {formatEpisodeDate(item.publishedAt)}
                    {duration ? ` · ${duration}` : ''}
                  </Text>
                  {item.description ? (
                    <Text style={styles.episodeDescription} numberOfLines={2}>
                      {item.description}
                    </Text>
                  ) : null}
                </TouchableOpacity>
              );
            }}
          />
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
    fontSize: 22,
    fontWeight: '700',
    letterSpacing: 0.3,
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
  list: {
    padding: spacing.md,
    rowGap: spacing.sm,
  },
  episodeRow: {
    backgroundColor: colors.surfaceSolid,
    borderColor: colors.borderSubtle,
    borderRadius: 16,
    borderWidth: 1,
    padding: spacing.md,
    ...elevation.card,
  },
  episodeTitle: {
    color: colors.brandInk,
    fontSize: 16,
    fontWeight: '700',
    marginBottom: spacing.xs,
  },
  episodeMeta: {
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  episodeDescription: {
    color: colors.textSecondary,
    fontSize: 13,
    lineHeight: 19,
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
    marginBottom: spacing.lg,
    textAlign: 'center',
  },
  retryButton: {
    alignItems: 'center',
    backgroundColor: colors.brandPrimary,
    borderRadius: 12,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  retryButtonText: {
    color: colors.textOnBrand,
    fontSize: 16,
    fontWeight: '600',
  },
  emptyText: {
    color: colors.textSecondary,
    fontSize: 15,
    textAlign: 'center',
  },
});

export default PodcastListView;

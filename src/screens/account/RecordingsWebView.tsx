import React, { useMemo, useState } from 'react';
import { ActivityIndicator, Linking, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { WebView } from 'react-native-webview';
import { colors, spacing } from '../../theme/tokens';

const RECORDINGS_URL = 'https://kalapamedia.com/my-recordings/';
const LOGIN_URL = `https://kalapamedia.com/wp-login.php?redirect_to=${encodeURIComponent(RECORDINGS_URL)}`;

interface RecordingsWebViewProps {
  onBack: () => void;
}

const RecordingsWebView: React.FC<RecordingsWebViewProps> = ({ onBack }) => {
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  const source = useMemo(() => ({ uri: LOGIN_URL }), [refreshKey]);

  const handleOpenInBrowser = async () => {
    await Linking.openURL(RECORDINGS_URL);
  };

  const handleRetry = () => {
    setHasError(false);
    setIsLoading(true);
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.headerButton}>
          <Text style={styles.headerButtonText}>Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Recordings</Text>
        <TouchableOpacity onPress={handleOpenInBrowser} style={styles.headerButton}>
          <Text style={styles.headerButtonText}>Browser</Text>
        </TouchableOpacity>
      </View>

      {hasError ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>Could not load recordings.</Text>
          <Text style={styles.errorBody}>Check your connection and try again.</Text>
          <TouchableOpacity onPress={handleRetry} style={styles.retryButton}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.webviewWrap}>
          <WebView
            key={refreshKey}
            source={source}
            onLoadEnd={() => setIsLoading(false)}
            onError={() => {
              setIsLoading(false);
              setHasError(true);
            }}
          />
          {isLoading ? (
            <View style={styles.loadingOverlay}>
              <ActivityIndicator size="large" color={colors.brandPrimary} />
            </View>
          ) : null}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bgSubtle,
  },
  header: {
    alignItems: 'center',
    backgroundColor: colors.brandPrimary,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  headerTitle: {
    color: colors.textOnBrand,
    fontSize: 18,
    fontWeight: '700',
  },
  headerButton: {
    minWidth: 72,
    paddingVertical: spacing.xs,
  },
  headerButtonText: {
    color: colors.textOnBrand,
    fontSize: 16,
    fontWeight: '600',
  },
  webviewWrap: {
    flex: 1,
  },
  loadingOverlay: {
    alignItems: 'center',
    backgroundColor: colors.bgSubtle,
    bottom: 0,
    justifyContent: 'center',
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
  },
  errorContainer: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  errorTitle: {
    color: colors.textPrimary,
    fontSize: 20,
    fontWeight: '700',
    marginBottom: spacing.sm,
  },
  errorBody: {
    color: colors.textMuted,
    marginBottom: spacing.lg,
    textAlign: 'center',
  },
  retryButton: {
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
});

export default RecordingsWebView;

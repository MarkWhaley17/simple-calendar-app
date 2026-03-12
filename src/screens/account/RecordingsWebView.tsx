import React, { useMemo, useRef, useState } from 'react';
import { Animated, Image, Linking, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { WebView } from 'react-native-webview';

import { GlassSurface } from '../../components/ui/GlassSurface';
import { ENABLE_GLASS_UI } from '../../theme/flags';
import { colors, elevation, spacing } from '../../theme/tokens';

const RECORDINGS_URL = 'https://kalapamedia.com/my-recordings/';
const LOGIN_URL = `https://kalapamedia.com/wp-login.php?redirect_to=${encodeURIComponent(RECORDINGS_URL)}`;

interface RecordingsWebViewProps {
  onBack: () => void;
}

interface NavState {
  canGoBack: boolean;
  canGoForward: boolean;
  currentUrl: string;
}

const RecordingsWebView: React.FC<RecordingsWebViewProps> = ({ onBack }) => {
  const useGlass = ENABLE_GLASS_UI;
  const dayPattern = require('../../../assets/day-view-pattern.png');
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);
  const [navState, setNavState] = useState<NavState>({
    canGoBack: false,
    canGoForward: false,
    currentUrl: LOGIN_URL,
  });

  const webViewRef = useRef<any>(null);
  const headerOpacity = useRef(new Animated.Value(0)).current;
  const headerTranslate = useRef(new Animated.Value(-16)).current;
  const shellAnim = useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.parallel([
      Animated.timing(headerOpacity, {
        duration: 280,
        toValue: 1,
        useNativeDriver: true,
      }),
      Animated.timing(headerTranslate, {
        duration: 280,
        toValue: 0,
        useNativeDriver: true,
      }),
      Animated.timing(shellAnim, {
        duration: 320,
        toValue: 1,
        useNativeDriver: true,
      }),
    ]).start();
  }, [headerOpacity, headerTranslate, shellAnim]);

  const source = useMemo(() => ({ uri: LOGIN_URL }), [refreshKey]);
  const showLoginHint = navState.currentUrl.includes('/wp-login.php');

  const handleOpenInBrowser = async () => {
    await Linking.openURL(RECORDINGS_URL);
  };

  const handleRetry = () => {
    setHasError(false);
    setIsLoading(true);
    setNavState({
      canGoBack: false,
      canGoForward: false,
      currentUrl: LOGIN_URL,
    });
    setRefreshKey((prev) => prev + 1);
  };

  const shellAnimStyle = {
    opacity: shellAnim,
    transform: [
      {
        translateY: shellAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [18, 0],
        }),
      },
    ],
  };

  const renderErrorState = () => {
    const errorContent = (
      <View style={styles.errorContainer}>
        <Text style={styles.errorTitle}>Could not load recordings.</Text>
        <Text style={styles.errorBody}>Check your connection and try again.</Text>
        <Text style={styles.errorHint}>If login loops, try Browser first.</Text>
        <View style={styles.errorButtons}>
          <TouchableOpacity onPress={handleRetry} style={styles.retryButton}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleOpenInBrowser} style={styles.secondaryButton}>
            <Text style={styles.secondaryButtonText}>Open in Browser</Text>
          </TouchableOpacity>
        </View>
      </View>
    );

    if (useGlass) {
      return (
        <GlassSurface style={styles.errorCard} intensity={42} contentStyle={styles.cardInner}>
          {errorContent}
        </GlassSurface>
      );
    }

    return <View style={[styles.errorCard, styles.fallbackCard]}>{errorContent}</View>;
  };

  const renderWebShell = () => {
    const webContent = (
      <View style={styles.webviewWrap}>
        <WebView
          key={refreshKey}
          ref={webViewRef}
          source={source}
          onLoadEnd={() => setIsLoading(false)}
          onNavigationStateChange={(state) => {
            setNavState({
              canGoBack: Boolean(state.canGoBack),
              canGoForward: Boolean(state.canGoForward),
              currentUrl: state.url || LOGIN_URL,
            });
          }}
          onError={() => {
            setIsLoading(false);
            setHasError(true);
          }}
          startInLoadingState={false}
        />
        {isLoading ? (
          <View style={styles.loadingOverlay} testID="webview-loading-overlay">
            <Text style={styles.loadingTitle}>Loading My Recordings</Text>
            <Text style={styles.loadingBody}>Signing in and opening your recording library.</Text>
            <View style={styles.loadingSkeleton} />
          </View>
        ) : null}
      </View>
    );

    if (useGlass) {
      return (
        <GlassSurface style={styles.webShellCard} intensity={42} contentStyle={styles.cardInner}>
          {webContent}
        </GlassSurface>
      );
    }

    return <View style={[styles.webShellCard, styles.fallbackCard]}>{webContent}</View>;
  };

  return (
    <View style={styles.container}>
      <Image source={dayPattern} style={styles.backgroundPattern} resizeMode="cover" testID="webview-background-pattern" />

      <Animated.View
        style={[
          styles.header,
          {
            opacity: headerOpacity,
            transform: [{ translateY: headerTranslate }],
          },
        ]}
      >
        <TouchableOpacity onPress={onBack} style={styles.headerButton} testID="recordings-header-back">
          <Text style={styles.headerButtonText}>Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Recordings</Text>
        <TouchableOpacity onPress={handleOpenInBrowser} style={styles.headerButton} testID="recordings-header-browser">
          <Text style={styles.headerButtonText}>Browser</Text>
        </TouchableOpacity>
      </Animated.View>

      <Animated.View style={[styles.content, shellAnimStyle]}>
        {showLoginHint && !hasError ? (
          <View style={styles.loginHint} testID="recordings-login-hint">
            <Text style={styles.loginHintText}>Log in to view your recordings.</Text>
          </View>
        ) : null}

        {!hasError ? (
          <View style={styles.controlsRow}>
            <TouchableOpacity
              onPress={() => webViewRef.current?.goBack?.()}
              disabled={!navState.canGoBack}
              testID="webview-control-back"
              accessibilityState={{ disabled: !navState.canGoBack }}
              style={[styles.controlButton, !navState.canGoBack && styles.controlButtonDisabled]}
            >
              <Text style={[styles.controlButtonText, !navState.canGoBack && styles.controlButtonTextDisabled]}>Back</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => webViewRef.current?.goForward?.()}
              disabled={!navState.canGoForward}
              testID="webview-control-forward"
              accessibilityState={{ disabled: !navState.canGoForward }}
              style={[styles.controlButton, !navState.canGoForward && styles.controlButtonDisabled]}
            >
              <Text style={[styles.controlButtonText, !navState.canGoForward && styles.controlButtonTextDisabled]}>Forward</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => webViewRef.current?.reload?.()}
              testID="webview-control-refresh"
              style={styles.controlButton}
            >
              <Text style={styles.controlButtonText}>Refresh</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleOpenInBrowser}
              testID="webview-control-browser"
              style={styles.controlButton}
            >
              <Text style={styles.controlButtonText}>Browser</Text>
            </TouchableOpacity>
          </View>
        ) : null}

        {hasError ? renderErrorState() : renderWebShell()}
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.bgSubtle,
    flex: 1,
  },
  backgroundPattern: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.25,
    transform: [{ translateX: -120 }, { translateY: -180 }, { scale: 1 }],
  },
  header: {
    alignItems: 'center',
    backgroundColor: colors.brandPrimary,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    minHeight: 144,
    ...elevation.card,
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
  content: {
    flex: 1,
    padding: spacing.md,
    rowGap: spacing.sm,
  },
  loginHint: {
    backgroundColor: colors.warningSurface,
    borderColor: colors.warningBorder,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  loginHintText: {
    color: colors.warningText,
    fontSize: 13,
    fontWeight: '600',
  },
  controlsRow: {
    columnGap: spacing.xs,
    flexDirection: 'row',
    marginBottom: spacing.xs,
  },
  controlButton: {
    alignItems: 'center',
    backgroundColor: colors.surfaceSolid,
    borderColor: colors.borderInput,
    borderRadius: 10,
    borderWidth: 1,
    flex: 1,
    paddingVertical: spacing.sm,
  },
  controlButtonDisabled: {
    backgroundColor: '#E2E8F0',
    borderColor: '#CBD5E1',
  },
  controlButtonText: {
    color: colors.brandPrimaryDark,
    fontSize: 13,
    fontWeight: '700',
  },
  controlButtonTextDisabled: {
    color: '#64748B',
  },
  cardInner: {
    flex: 1,
  },
  webShellCard: {
    flex: 1,
    overflow: 'hidden',
  },
  fallbackCard: {
    backgroundColor: colors.surfaceSolid,
    borderColor: colors.borderSubtle,
    borderRadius: 18,
    borderWidth: 1,
    ...elevation.card,
  },
  webviewWrap: {
    flex: 1,
    minHeight: 340,
  },
  loadingOverlay: {
    alignItems: 'center',
    backgroundColor: colors.surfaceStrong,
    bottom: 0,
    justifyContent: 'center',
    left: 0,
    paddingHorizontal: spacing.lg,
    position: 'absolute',
    right: 0,
    top: 0,
  },
  loadingTitle: {
    color: colors.brandPrimaryDark,
    fontSize: 18,
    fontWeight: '700',
    marginBottom: spacing.xs,
  },
  loadingBody: {
    color: colors.textSecondary,
    fontSize: 14,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  loadingSkeleton: {
    backgroundColor: '#DDE8FB',
    borderRadius: 12,
    height: 120,
    width: '100%',
  },
  errorCard: {
    flex: 1,
    justifyContent: 'center',
    padding: spacing.lg,
  },
  errorContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorTitle: {
    color: colors.textPrimary,
    fontSize: 20,
    fontWeight: '700',
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  errorBody: {
    color: colors.textSecondary,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  errorHint: {
    color: colors.textTertiary,
    fontSize: 13,
    marginBottom: spacing.lg,
    textAlign: 'center',
  },
  errorButtons: {
    rowGap: spacing.sm,
    width: '100%',
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
  secondaryButton: {
    alignItems: 'center',
    backgroundColor: colors.surfaceSolid,
    borderColor: colors.borderInput,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  secondaryButtonText: {
    color: colors.brandPrimaryDark,
    fontSize: 15,
    fontWeight: '600',
  },
});

export default RecordingsWebView;

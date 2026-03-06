import React from 'react';
import { Platform, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';

import { platformSurface } from '../../theme/platformSurface';
import { colors, radius } from '../../theme/tokens';

type GlassSurfaceProps = {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
  intensity?: number;
};

let BlurViewComponent: React.ComponentType<any> | null = null;
try {
  // Keep a runtime fallback for environments where expo-blur isn't available.
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const blurModule = require('expo-blur');
  BlurViewComponent = blurModule.BlurView;
} catch {
  BlurViewComponent = null;
}

export function GlassSurface({
  children,
  style,
  contentStyle,
  intensity,
}: GlassSurfaceProps) {
  const blurIntensity = intensity ?? platformSurface.blurIntensity;
  const shouldBlur = Platform.OS === 'ios' || Platform.OS === 'android' || Platform.OS === 'web';

  return (
    <View style={[styles.container, style]}>
      {shouldBlur ? (
        BlurViewComponent ? (
          <BlurViewComponent intensity={blurIntensity} tint="light" style={StyleSheet.absoluteFill} />
        ) : (
          <View style={[StyleSheet.absoluteFill, styles.blurFallback]} />
        )
      ) : null}
      <View style={styles.overlay} />
      <View style={[styles.content, contentStyle]}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderSoft,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.surfaceOverlay,
  },
  blurFallback: {
    backgroundColor: colors.surfaceStrong,
  },
  content: {
    position: 'relative',
  },
});

import React from 'react';
import { StyleSheet } from 'react-native';
import Animated, { useAnimatedStyle, withSpring } from 'react-native-reanimated';

import { motion } from '../../theme/motion';
import { colors, radius } from '../../theme/tokens';

type AnimatedTabIndicatorProps = {
  x: number;
  width: number;
  height?: number;
};

export function AnimatedTabIndicator({ x, width, height = 44 }: AnimatedTabIndicatorProps) {
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: withSpring(x, motion.spring.snappy) }],
    width: withSpring(width, motion.spring.snappy),
    height: withSpring(height, motion.spring.snappy),
  }));

  return (
    <Animated.View
      pointerEvents="none"
      style={[styles.indicator, animatedStyle]}
    />
  );
}

const styles = StyleSheet.create({
  indicator: {
    position: 'absolute',
    left: 0,
    top: 4,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceOverlay,
    borderWidth: 1,
    borderColor: colors.borderStrong,
  },
});

import React, { useEffect } from 'react';
import { StyleProp, TextStyle, View, ViewStyle } from 'react-native';
import Animated, { interpolate, useAnimatedStyle, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';

import { motion } from '../../theme/motion';

type AnimatedTabItemContentProps = {
  isActive: boolean;
  icon: React.ReactNode;
  label: string;
  labelStyle?: StyleProp<TextStyle>;
  iconContainerStyle?: StyleProp<ViewStyle>;
};

export function AnimatedTabItemContent({
  isActive,
  icon,
  label,
  labelStyle,
  iconContainerStyle,
}: AnimatedTabItemContentProps) {
  const progress = useSharedValue(isActive ? 1 : 0);

  useEffect(() => {
    progress.value = withSpring(isActive ? 1 : 0, motion.spring.soft);
  }, [isActive, progress]);

  const iconAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateY: interpolate(
          progress.value,
          [0, 1],
          [0, motion.translate.iconLift]
        ),
      },
    ],
  }));

  const labelAnimatedStyle = useAnimatedStyle(() => ({
    opacity: withTiming(
      isActive ? motion.opacity.visible : motion.opacity.muted,
      { duration: motion.duration.fast }
    ),
  }));

  return (
    <View style={{ alignItems: 'center' }}>
      <Animated.View style={[iconContainerStyle, iconAnimatedStyle]}>
        {icon}
      </Animated.View>
      <Animated.Text style={[labelStyle, labelAnimatedStyle]}>
        {label}
      </Animated.Text>
    </View>
  );
}

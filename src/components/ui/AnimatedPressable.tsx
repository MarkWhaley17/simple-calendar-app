import React from 'react';
import { Pressable, PressableProps, StyleProp, ViewStyle } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

import { motion } from '../../theme/motion';
import { lightTap } from '../../utils/haptics';

const ReanimatedPressable = Animated.createAnimatedComponent(Pressable);

type AnimatedPressableProps = Omit<PressableProps, 'style'> & {
  style?: StyleProp<ViewStyle>;
  scaleTo?: number;
  hapticOnPress?: boolean;
};

export function AnimatedPressable({
  style,
  scaleTo = motion.scale.pressIn,
  hapticOnPress = false,
  onPress,
  onPressIn,
  onPressOut,
  ...rest
}: AnimatedPressableProps) {
  const scale = useSharedValue(motion.scale.active);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      {
        scale: withSpring(scale.value, motion.spring.soft),
      },
    ],
  }));

  return (
    <ReanimatedPressable
      {...rest}
      style={[style, animatedStyle]}
      onPress={(event) => {
        if (hapticOnPress) {
          void lightTap();
        }
        onPress?.(event);
      }}
      onPressIn={(event) => {
        scale.value = scaleTo;
        onPressIn?.(event);
      }}
      onPressOut={(event) => {
        scale.value = motion.scale.active;
        onPressOut?.(event);
      }}
    />
  );
}

import React, { useEffect, useState } from 'react';
import { StyleProp, StyleSheet, TextStyle, View, ViewStyle } from 'react-native';
import Animated, { runOnJS, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

import { motion } from '../../theme/motion';

type AnimatedMonthTitleProps = {
  title: string;
  style?: StyleProp<TextStyle>;
  containerStyle?: StyleProp<ViewStyle>;
};

export function AnimatedMonthTitle({ title, style, containerStyle }: AnimatedMonthTitleProps) {
  const [currentTitle, setCurrentTitle] = useState(title);
  const [nextTitle, setNextTitle] = useState<string | null>(null);
  const progress = useSharedValue(1);

  useEffect(() => {
    if (title === currentTitle) return;

    setNextTitle(title);
    progress.value = 0;
    progress.value = withTiming(1, { duration: motion.duration.normal }, (finished) => {
      if (finished) {
        runOnJS(setCurrentTitle)(title);
        runOnJS(setNextTitle)(null);
      }
    });
  }, [title, currentTitle, progress]);

  const currentAnimatedStyle = useAnimatedStyle(() => ({
    opacity: nextTitle ? 1 - progress.value : 1,
    transform: [
      {
        translateY: nextTitle ? -motion.translate.titleShift * progress.value : 0,
      },
    ],
  }));

  const nextAnimatedStyle = useAnimatedStyle(() => ({
    opacity: nextTitle ? progress.value : 0,
    transform: [
      {
        translateY: nextTitle ? motion.translate.titleShift * (1 - progress.value) : 0,
      },
    ],
  }));

  return (
    <View style={[styles.container, containerStyle]}>
      <Animated.Text style={[style, currentAnimatedStyle]}>
        {currentTitle}
      </Animated.Text>
      {nextTitle ? (
        <Animated.Text style={[styles.absoluteText, style, nextAnimatedStyle]}>
          {nextTitle}
        </Animated.Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  absoluteText: {
    position: 'absolute',
  },
});

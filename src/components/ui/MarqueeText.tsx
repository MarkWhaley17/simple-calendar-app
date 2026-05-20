import React, { useEffect, useRef, useState } from 'react';
import { Animated, Easing, StyleProp, Text, TextStyle, View, ViewStyle } from 'react-native';

interface MarqueeTextProps {
  text: string;
  style?: StyleProp<TextStyle>;
  containerStyle?: StyleProp<ViewStyle>;
  speed?: number; // pixels per second
  pauseMs?: number; // pause at start before scrolling
}

const MarqueeText: React.FC<MarqueeTextProps> = ({
  text,
  style,
  containerStyle,
  speed = 40,
  pauseMs = 1200,
}) => {
  const [containerWidth, setContainerWidth] = useState(0);
  const [textWidth, setTextWidth] = useState(0);
  const translateX = useRef(new Animated.Value(0)).current;
  const animationRef = useRef<Animated.CompositeAnimation | null>(null);

  const overflow = containerWidth > 0 && textWidth > containerWidth;
  const scrollDistance = textWidth - containerWidth + 32; // extra padding at the end

  useEffect(() => {
    if (animationRef.current) {
      animationRef.current.stop();
      animationRef.current = null;
    }
    translateX.setValue(0);

    if (!overflow || scrollDistance <= 0) return;

    const duration = (scrollDistance / speed) * 1000;

    animationRef.current = Animated.loop(
      Animated.sequence([
        Animated.delay(pauseMs),
        Animated.timing(translateX, {
          toValue: -scrollDistance,
          duration,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
        Animated.delay(pauseMs / 2),
        Animated.timing(translateX, {
          toValue: 0,
          duration: 0,
          useNativeDriver: true,
        }),
      ])
    );

    animationRef.current.start();

    return () => {
      animationRef.current?.stop();
    };
  }, [overflow, scrollDistance, speed, pauseMs, text]);

  return (
    <View
      style={[containerStyle, { overflow: 'hidden' }]}
      onLayout={(e) => setContainerWidth(e.nativeEvent.layout.width)}
      testID="marquee-container"
    >
      {/* Hidden text sized to its natural width for measurement */}
      <View style={{ position: 'absolute', opacity: 0, width: 9999 }} pointerEvents="none" testID="marquee-measure-wrapper">
        <Text
          numberOfLines={1}
          style={style}
          onLayout={(e) => setTextWidth(e.nativeEvent.layout.width)}
          testID="marquee-measure-text"
        >
          {text}
        </Text>
      </View>

      <Animated.Text
        numberOfLines={1}
        testID="marquee-visible-text"
        style={[
          style,
          {
            transform: [{ translateX }],
            width: textWidth > 0 ? textWidth + 32 : undefined,
          },
        ]}
      >
        {text}
      </Animated.Text>
    </View>
  );
};

export default MarqueeText;

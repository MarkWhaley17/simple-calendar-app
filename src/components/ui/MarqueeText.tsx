import React, { useEffect, useRef, useState } from 'react';
import { Animated, StyleProp, Text, TextStyle, View, ViewStyle } from 'react-native';

interface MarqueeTextProps {
  text: string;
  style?: StyleProp<TextStyle>;
  containerStyle?: StyleProp<ViewStyle>;
  speed?: number; // pixels per second
  pauseMs?: number; // pause before first scroll
}

const INTER_GAP = 64;

const MarqueeText: React.FC<MarqueeTextProps> = ({
  text,
  style,
  containerStyle,
  speed = 55,
  pauseMs = 1200,
}) => {
  const [containerWidth, setContainerWidth] = useState(0);
  const [textWidth, setTextWidth] = useState(0);
  const translateX = useRef(new Animated.Value(0)).current;

  const cw = Math.round(containerWidth);
  const tw = Math.round(textWidth);
  const overflow = cw > 0 && tw > cw;
  const totalScroll = tw + INTER_GAP;

  useEffect(() => {
    translateX.setValue(0);
    if (!overflow) return;

    const duration = (totalScroll / speed) * 1000;
    let active = true;
    let rafId: number | null = null;
    let startTime: number | null = null;

    const tick = (now: number) => {
      if (!active) return;
      if (startTime === null) startTime = now;
      const elapsed = now - startTime;
      // elapsed % duration loops 0→duration→0→duration seamlessly
      const progress = (elapsed % duration) / duration;
      translateX.setValue(-totalScroll * progress);
      rafId = requestAnimationFrame(tick);
    };

    const timer = setTimeout(() => {
      if (active) rafId = requestAnimationFrame(tick);
    }, pauseMs);

    return () => {
      active = false;
      clearTimeout(timer);
      if (rafId !== null) cancelAnimationFrame(rafId);
      translateX.setValue(0);
    };
  }, [overflow, totalScroll, speed, pauseMs, text]);

  return (
    <View
      style={[containerStyle, overflow ? { overflow: 'hidden' } : undefined]}
      onLayout={(e) => setContainerWidth(e.nativeEvent.layout.width)}
      testID="marquee-container"
    >
      {/* Hidden text for measuring natural single-line width */}
      <View
        style={{ position: 'absolute', opacity: 0, width: 9999 }}
        pointerEvents="none"
        testID="marquee-measure-wrapper"
      >
        <Text
          numberOfLines={1}
          style={[style, { alignSelf: 'flex-start' }]}
          onLayout={(e) => setTextWidth(e.nativeEvent.layout.width)}
          testID="marquee-measure-text"
        >
          {text}
        </Text>
      </View>

      {/* Two copies side-by-side: when copy1 exits left, copy2 is at position 0 */}
      <Animated.View
        testID="marquee-visible-text"
        style={[
          { flexDirection: 'row', width: tw > 0 ? totalScroll * 2 : undefined },
          { transform: [{ translateX }] },
        ]}
      >
        <Text numberOfLines={1} style={[style, { width: tw > 0 ? tw : undefined }]}>
          {text}
        </Text>
        {overflow && <View style={{ width: INTER_GAP }} />}
        {overflow && (
          <Text numberOfLines={1} style={[style, { width: tw > 0 ? tw : undefined }]}>
            {text}
          </Text>
        )}
      </Animated.View>
    </View>
  );
};

export default MarqueeText;

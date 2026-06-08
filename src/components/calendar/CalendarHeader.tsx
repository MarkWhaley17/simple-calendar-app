import React from 'react';
import { View, Text, StyleSheet, Image, ImageBackground } from 'react-native';
import { MONTH_NAMES } from '../../constants/dates';
import { ENABLE_MOTION_UI, ENABLE_CALENDAR_HEADER_BANNER } from '../../theme/flags';
import { colors, spacing } from '../../theme/tokens';
import { AnimatedPressable } from '../ui/AnimatedPressable';
import { AnimatedMonthTitle } from './AnimatedMonthTitle';
import config from '../../config';

interface CalendarHeaderProps {
  currentDate: Date;
  onPreviousMonth: () => void;
  onNextMonth: () => void;
  onDatePress?: () => void;
}

const CalendarHeader: React.FC<CalendarHeaderProps> = ({
  currentDate,
  onPreviousMonth,
  onNextMonth,
  onDatePress,
}) => {
  const monthName = MONTH_NAMES[currentDate.getMonth()];
  const year = currentDate.getFullYear();

  const innerContent = (
    <View style={[styles.container, !ENABLE_CALENDAR_HEADER_BANNER && styles.containerPlain]}>
      <AnimatedPressable
        style={styles.navButton}
        onPress={onPreviousMonth}
        scaleTo={ENABLE_MOTION_UI ? 0.97 : 1}
        hapticOnPress={ENABLE_MOTION_UI}
      >
        <Text style={[styles.navButtonText, !ENABLE_CALENDAR_HEADER_BANNER && styles.navButtonTextPlain]}>‹</Text>
      </AnimatedPressable>

      <AnimatedPressable
        style={styles.dateContainer}
        onPress={onDatePress}
        scaleTo={ENABLE_MOTION_UI ? 0.985 : 1}
        disabled={!onDatePress}
      >
        {ENABLE_MOTION_UI ? (
          <AnimatedMonthTitle
            title={monthName}
            style={[styles.monthText, !ENABLE_CALENDAR_HEADER_BANNER && styles.monthTextPlain]}
          />
        ) : (
          <Text style={[styles.monthText, !ENABLE_CALENDAR_HEADER_BANNER && styles.monthTextPlain]}>{monthName}</Text>
        )}
        <Text style={[styles.yearText, !ENABLE_CALENDAR_HEADER_BANNER && styles.yearTextPlain]}>{year} ▼</Text>
      </AnimatedPressable>

      <AnimatedPressable
        style={styles.navButton}
        onPress={onNextMonth}
        scaleTo={ENABLE_MOTION_UI ? 0.97 : 1}
        hapticOnPress={ENABLE_MOTION_UI}
      >
        <Text style={[styles.navButtonText, !ENABLE_CALENDAR_HEADER_BANNER && styles.navButtonTextPlain]}>›</Text>
      </AnimatedPressable>
    </View>
  );

  if (ENABLE_CALENDAR_HEADER_BANNER) {
    const headerBackground = require('../../../assets/day-bg.jpg');
    const offset = config.bannerImageOffset;
    return (
      <ImageBackground
        source={headerBackground}
        style={styles.headerBackground}
        imageStyle={offset > 0 ? { bottom: -offset } : undefined}
        resizeMode="cover"
        testID="calendar-header-banner"
      >
        {innerContent}
      </ImageBackground>
    );
  }

  return (
    <View style={styles.plainHeader} testID="calendar-header-plain">
      <Image
        source={config.assets.headerPatternImage}
        style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, opacity: 0.2, transform: [{ translateX: -90 }, { translateY: -20 }, { scale: 0.8 }] }}
        resizeMode="cover"
      />
      {innerContent}
    </View>
  );
};

const styles = StyleSheet.create({
  headerBackground: {
    width: '100%',
    overflow: 'hidden',
  },
  plainHeader: {
    width: '100%',
    overflow: 'hidden',
    backgroundColor: colors.headerPlainBg,
  },
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: spacing.lg + spacing.xs,
    paddingBottom: spacing.xl,
    paddingHorizontal: spacing.lg + spacing.xs,
    minHeight: 144,
    backgroundColor: colors.brandOverlay,
  },
  containerPlain: {
    minHeight: 72,
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
    backgroundColor: 'transparent',
  },
  navButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 22,
  },
  navButtonText: {
    fontSize: 34,
    lineHeight: 34,
    fontWeight: '400',
    color: colors.textOnBrandMuted,
    textAlign: 'center',
    includeFontPadding: false,
  },
  navButtonTextPlain: {
    color: colors.brandPrimaryDark,
  },
  dateContainer: {
    alignItems: 'center',
  },
  monthText: {
    fontSize: 24,
    fontWeight: '600',
    color: colors.white,
  },
  monthTextPlain: {
    color: colors.brandPrimaryDark,
  },
  yearText: {
    fontSize: 16,
    fontWeight: '400',
    color: colors.textOnBrandMuted,
    marginTop: 2,
  },
  yearTextPlain: {
    color: colors.brandPrimary,
  },
});

export default CalendarHeader;

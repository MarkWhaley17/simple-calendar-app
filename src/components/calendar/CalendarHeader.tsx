import React from 'react';
import { View, Text, StyleSheet, ImageBackground } from 'react-native';
import { MONTH_NAMES } from '../../constants/dates';
import { ENABLE_MOTION_UI } from '../../theme/flags';
import { colors, spacing } from '../../theme/tokens';
import { AnimatedPressable } from '../ui/AnimatedPressable';
import { AnimatedMonthTitle } from './AnimatedMonthTitle';

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
  const headerBackground = require('../../../assets/day-bg.jpg');

  return (
    <ImageBackground source={headerBackground} style={styles.headerBackground} resizeMode="cover">
      <View style={styles.container}>
        <AnimatedPressable
          style={styles.navButton}
          onPress={onPreviousMonth}
          scaleTo={ENABLE_MOTION_UI ? 0.97 : 1}
          hapticOnPress={ENABLE_MOTION_UI}
        >
          <Text style={styles.navButtonText}>‹</Text>
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
              style={styles.monthText}
            />
          ) : (
            <Text style={styles.monthText}>{monthName}</Text>
          )}
          <Text style={styles.yearText}>{year} ▼</Text>
        </AnimatedPressable>

        <AnimatedPressable
          style={styles.navButton}
          onPress={onNextMonth}
          scaleTo={ENABLE_MOTION_UI ? 0.97 : 1}
          hapticOnPress={ENABLE_MOTION_UI}
        >
          <Text style={styles.navButtonText}>›</Text>
        </AnimatedPressable>
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  headerBackground: {
    width: '100%',
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
  dateContainer: {
    alignItems: 'center',
  },
  monthText: {
    fontSize: 24,
    fontWeight: '600',
    color: colors.white,
  },
  yearText: {
    fontSize: 16,
    fontWeight: '400',
    color: colors.textOnBrandMuted,
    marginTop: 2,
  },
});

export default CalendarHeader;

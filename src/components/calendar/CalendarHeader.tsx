import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MONTH_NAMES } from '../../constants/dates';
import { ENABLE_GLASS_UI, ENABLE_MOTION_UI } from '../../theme/flags';
import { colors, radius, spacing } from '../../theme/tokens';
import { AnimatedPressable } from '../ui/AnimatedPressable';
import { AnimatedMonthTitle } from './AnimatedMonthTitle';
import { GlassSurface } from '../ui/GlassSurface';
import { glassStyles } from '../ui/glassStyles';

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

  const content = (
    <>
      <AnimatedPressable
        style={[styles.navButton, ENABLE_GLASS_UI && styles.glassNavButton]}
        onPress={onPreviousMonth}
        scaleTo={ENABLE_MOTION_UI ? 0.97 : 1}
        hapticOnPress={ENABLE_MOTION_UI}
      >
        <Text style={[styles.navButtonText, ENABLE_GLASS_UI && styles.glassNavButtonText]}>‹</Text>
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
            style={[styles.monthText, ENABLE_GLASS_UI && styles.glassMonthText]}
          />
        ) : (
          <Text style={[styles.monthText, ENABLE_GLASS_UI && styles.glassMonthText]}>{monthName}</Text>
        )}
        <Text style={[styles.yearText, ENABLE_GLASS_UI && styles.glassYearText]}>{year} ▼</Text>
      </AnimatedPressable>

      <AnimatedPressable
        style={[styles.navButton, ENABLE_GLASS_UI && styles.glassNavButton]}
        onPress={onNextMonth}
        scaleTo={ENABLE_MOTION_UI ? 0.97 : 1}
        hapticOnPress={ENABLE_MOTION_UI}
      >
        <Text style={[styles.navButtonText, ENABLE_GLASS_UI && styles.glassNavButtonText]}>›</Text>
      </AnimatedPressable>
    </>
  );

  if (ENABLE_GLASS_UI) {
    return (
      <View style={styles.glassOuter}>
        <GlassSurface
          style={[styles.glassContainer, glassStyles.card]}
          intensity={32}
          contentStyle={styles.glassContent}
        >
          {content}
        </GlassSurface>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {content}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 16,
    backgroundColor: colors.brandPrimary,
  },
  navButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 22,
    backgroundColor: colors.accentStrong,
  },
  navButtonText: {
    fontSize: 32,
    fontWeight: '300',
    color: colors.white,
    marginTop: -4,
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
    color: colors.brandSurface,
    marginTop: 2,
  },
  glassOuter: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  glassContainer: {
    backgroundColor: colors.surfaceStrong,
  },
  glassContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
  },
  glassNavButton: {
    backgroundColor: colors.surfaceStrong,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    borderRadius: radius.pill,
  },
  glassNavButtonText: {
    color: colors.accent,
    fontWeight: '400',
  },
  glassMonthText: {
    color: colors.textPrimary,
  },
  glassYearText: {
    color: colors.textSecondary,
  },
});

export default CalendarHeader;

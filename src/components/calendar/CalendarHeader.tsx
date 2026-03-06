import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MONTH_NAMES } from '../../constants/dates';
import { ENABLE_GLASS_UI } from '../../theme/flags';
import { colors, radius, spacing } from '../../theme/tokens';
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
      <TouchableOpacity
        style={[styles.navButton, ENABLE_GLASS_UI && styles.glassNavButton]}
        onPress={onPreviousMonth}
        activeOpacity={0.7}
      >
        <Text style={[styles.navButtonText, ENABLE_GLASS_UI && styles.glassNavButtonText]}>‹</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.dateContainer}
        onPress={onDatePress}
        activeOpacity={0.7}
        disabled={!onDatePress}
      >
        <Text style={[styles.monthText, ENABLE_GLASS_UI && styles.glassMonthText]}>{monthName}</Text>
        <Text style={[styles.yearText, ENABLE_GLASS_UI && styles.glassYearText]}>{year} ▼</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.navButton, ENABLE_GLASS_UI && styles.glassNavButton]}
        onPress={onNextMonth}
        activeOpacity={0.7}
      >
        <Text style={[styles.navButtonText, ENABLE_GLASS_UI && styles.glassNavButtonText]}>›</Text>
      </TouchableOpacity>
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
    backgroundColor: '#2563EB', // Blue header
  },
  navButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 22,
    backgroundColor: '#F59E0B', // Gold buttons
  },
  navButtonText: {
    fontSize: 32,
    fontWeight: '300',
    color: '#fff',
    marginTop: -4,
  },
  dateContainer: {
    alignItems: 'center',
  },
  monthText: {
    fontSize: 24,
    fontWeight: '600',
    color: '#fff', // White text on blue
  },
  yearText: {
    fontSize: 16,
    fontWeight: '400',
    color: '#DBEAFE', // Light blue text
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

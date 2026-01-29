import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MONTH_NAMES } from '../../constants/dates';

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

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.navButton}
        onPress={onPreviousMonth}
        activeOpacity={0.7}
      >
        <Text style={styles.navButtonText}>‹</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.dateContainer}
        onPress={onDatePress}
        activeOpacity={0.7}
        disabled={!onDatePress}
      >
        <Text style={styles.monthText}>{monthName}</Text>
        <Text style={styles.yearText}>{year} ▼</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.navButton}
        onPress={onNextMonth}
        activeOpacity={0.7}
      >
        <Text style={styles.navButtonText}>›</Text>
      </TouchableOpacity>
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
});

export default CalendarHeader;

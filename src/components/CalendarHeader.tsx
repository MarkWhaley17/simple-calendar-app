import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

interface CalendarHeaderProps {
  currentDate: Date;
  onPreviousMonth: () => void;
  onNextMonth: () => void;
}

const CalendarHeader: React.FC<CalendarHeaderProps> = ({
  currentDate,
  onPreviousMonth,
  onNextMonth,
}) => {
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const monthName = monthNames[currentDate.getMonth()];
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

      <View style={styles.dateContainer}>
        <Text style={styles.monthText}>{monthName}</Text>
        <Text style={styles.yearText}>{year}</Text>
      </View>

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
    backgroundColor: '#fff',
  },
  navButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 22,
    backgroundColor: '#f0f0f0',
  },
  navButtonText: {
    fontSize: 32,
    fontWeight: '300',
    color: '#333',
    marginTop: -4,
  },
  dateContainer: {
    alignItems: 'center',
  },
  monthText: {
    fontSize: 24,
    fontWeight: '600',
    color: '#333',
  },
  yearText: {
    fontSize: 16,
    fontWeight: '400',
    color: '#666',
    marginTop: 2,
  },
});

export default CalendarHeader;

import React from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';

interface CalendarGridProps {
  currentDate: Date;
  onDayPress?: (date: Date) => void;
}

const CalendarGrid: React.FC<CalendarGridProps> = ({ currentDate, onDayPress }) => {
  const today = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();

  // Get the first day of the month (0 = Sunday, 6 = Saturday)
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();

  // Get the number of days in the current month
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

  // Get the number of days in the previous month
  const daysInPrevMonth = new Date(currentYear, currentMonth, 0).getDate();

  // Days of the week
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Generate calendar days
  const calendarDays: Array<{
    day: number;
    isCurrentMonth: boolean;
    isToday: boolean;
  }> = [];

  // Add previous month's days
  for (let i = firstDayOfMonth - 1; i >= 0; i--) {
    calendarDays.push({
      day: daysInPrevMonth - i,
      isCurrentMonth: false,
      isToday: false,
    });
  }

  // Add current month's days
  for (let day = 1; day <= daysInMonth; day++) {
    const isToday =
      day === today.getDate() &&
      currentMonth === today.getMonth() &&
      currentYear === today.getFullYear();

    calendarDays.push({
      day,
      isCurrentMonth: true,
      isToday,
    });
  }

  // Add next month's days to complete the grid
  const remainingDays = 42 - calendarDays.length; // 6 rows × 7 days
  for (let day = 1; day <= remainingDays; day++) {
    calendarDays.push({
      day,
      isCurrentMonth: false,
      isToday: false,
    });
  }

  return (
    <View style={styles.container}>
      {/* Week day headers */}
      <View style={styles.weekDaysRow}>
        {weekDays.map((day) => (
          <View key={day} style={styles.weekDayCell}>
            <Text style={styles.weekDayText}>{day}</Text>
          </View>
        ))}
      </View>

      {/* Calendar grid */}
      <View style={styles.calendarGrid}>
        {calendarDays.map((dayData, index) => {
          const handlePress = () => {
            if (dayData.isCurrentMonth && onDayPress) {
              const selectedDate = new Date(currentYear, currentMonth, dayData.day);
              onDayPress(selectedDate);
            }
          };

          return (
            <TouchableOpacity
              key={index}
              style={styles.dayCell}
              onPress={handlePress}
              activeOpacity={0.7}
              disabled={!dayData.isCurrentMonth}
            >
              <View
                style={[
                  styles.dayContent,
                  dayData.isToday && styles.todayContent,
                ]}
              >
                <Text
                  style={[
                    styles.dayText,
                    !dayData.isCurrentMonth && styles.otherMonthText,
                    dayData.isToday && styles.todayText,
                  ]}
                >
                  {dayData.day}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const screenWidth = Dimensions.get('window').width;
const cellSize = screenWidth / 7;

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    paddingHorizontal: 8,
    paddingBottom: 20,
  },
  weekDaysRow: {
    flexDirection: 'row',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  weekDayCell: {
    width: cellSize,
    alignItems: 'center',
  },
  weekDayText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: cellSize,
    height: cellSize,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayContent: {
    width: cellSize - 8,
    height: cellSize - 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
  },
  todayContent: {
    backgroundColor: '#007AFF',
  },
  dayText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  otherMonthText: {
    color: '#ccc',
  },
  todayText: {
    color: '#fff',
    fontWeight: '700',
  },
});

export default CalendarGrid;

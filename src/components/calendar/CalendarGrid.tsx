import React from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
import { CalendarEvent } from '../../types';
import { WEEK_DAY_ABBR } from '../../constants/dates';

interface CalendarGridProps {
  currentDate: Date;
  onDayPress?: (date: Date) => void;
  events?: CalendarEvent[];
}

const CalendarGrid: React.FC<CalendarGridProps> = ({ currentDate, onDayPress, events = [] }) => {
  const today = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();

  // Get the first day of the month (0 = Sunday, 6 = Saturday)
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();

  // Get the number of days in the current month
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

  // Get the number of days in the previous month
  const daysInPrevMonth = new Date(currentYear, currentMonth, 0).getDate();

  // Helper function to check if a date has events
  const hasEvents = (year: number, month: number, day: number) => {
    return events.some(event => {
      const eventDate = event.fromDate || event.date || new Date();
      return eventDate.getFullYear() === year &&
             eventDate.getMonth() === month &&
             eventDate.getDate() === day;
    });
  };

  // Generate calendar days
  const calendarDays: Array<{
    day: number;
    month: number;
    year: number;
    isCurrentMonth: boolean;
    isToday: boolean;
    hasEvents: boolean;
  }> = [];

  // Add previous month's days
  const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
  const prevYear = currentMonth === 0 ? currentYear - 1 : currentYear;
  for (let i = firstDayOfMonth - 1; i >= 0; i--) {
    calendarDays.push({
      day: daysInPrevMonth - i,
      month: prevMonth,
      year: prevYear,
      isCurrentMonth: false,
      isToday: false,
      hasEvents: hasEvents(prevYear, prevMonth, daysInPrevMonth - i),
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
      month: currentMonth,
      year: currentYear,
      isCurrentMonth: true,
      isToday,
      hasEvents: hasEvents(currentYear, currentMonth, day),
    });
  }

  // Add next month's days to complete the grid
  const remainingDays = 42 - calendarDays.length; // 6 rows × 7 days
  const nextMonth = currentMonth === 11 ? 0 : currentMonth + 1;
  const nextYear = currentMonth === 11 ? currentYear + 1 : currentYear;
  for (let day = 1; day <= remainingDays; day++) {
    calendarDays.push({
      day,
      month: nextMonth,
      year: nextYear,
      isCurrentMonth: false,
      isToday: false,
      hasEvents: hasEvents(nextYear, nextMonth, day),
    });
  }

  return (
    <View style={styles.container}>
      {/* Week day headers */}
      <View style={styles.weekDaysRow}>
        {WEEK_DAY_ABBR.map((day) => (
          <View key={day} style={styles.weekDayCell}>
            <Text style={styles.weekDayText}>{day}</Text>
          </View>
        ))}
      </View>

      {/* Calendar grid */}
      <View style={styles.calendarGrid}>
        {calendarDays.map((dayData, index) => {
          const handlePress = () => {
            if (onDayPress) {
              const selectedDate = new Date(dayData.year, dayData.month, dayData.day);
              onDayPress(selectedDate);
            }
          };

          return (
            <TouchableOpacity
              key={index}
              style={styles.dayCell}
              onPress={handlePress}
              activeOpacity={0.7}
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
                {dayData.hasEvents && (
                  <View style={styles.eventIndicator} />
                )}
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const screenWidth = Dimensions.get('window').width;
const cellSize = (screenWidth - 8) / 7; // Account for borders: 1 left + 7 right = 8px total

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    paddingBottom: 20,
  },
  weekDaysRow: {
    flexDirection: 'row',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#BFDBFE', // Light blue border
  },
  weekDayCell: {
    width: cellSize,
    alignItems: 'center',
  },
  weekDayText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E40AF', // Dark blue text
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderColor: '#BFDBFE', // Light blue grid lines
  },
  dayCell: {
    width: cellSize,
    height: cellSize,
    alignItems: 'center',
    justifyContent: 'center',
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#BFDBFE', // Light blue grid lines
  },
  dayContent: {
    width: cellSize - 8,
    height: cellSize - 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
  },
  todayContent: {
    backgroundColor: '#F59E0B', // Gold for today
  },
  dayText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1E3A8A', // Dark blue text
  },
  otherMonthText: {
    color: '#BFDBFE', // Light blue for other months
  },
  todayText: {
    color: '#fff',
    fontWeight: '700',
  },
  eventIndicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#F59E0B', // Gold dot for events
    position: 'absolute',
    bottom: 4,
  },
});

export default CalendarGrid;

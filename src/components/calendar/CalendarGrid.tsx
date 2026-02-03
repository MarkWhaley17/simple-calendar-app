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
      const start = event.fromDate || event.date;
      if (!start) return false;
      const end = event.toDate || start;
      const checkDate = new Date(year, month, day);
      const checkDateOnly = new Date(checkDate.getFullYear(), checkDate.getMonth(), checkDate.getDate());
      const startDateOnly = new Date(start.getFullYear(), start.getMonth(), start.getDate());
      const endDateOnly = new Date(end.getFullYear(), end.getMonth(), end.getDate());
      return checkDateOnly >= startDateOnly && checkDateOnly <= endDateOnly && startDateOnly <= endDateOnly;
    });
  };

  const hasNonMultiDayEvents = (year: number, month: number, day: number) => {
    return events.some(event => {
      const start = event.fromDate || event.date;
      if (!start) return false;
      const end = event.toDate || start;
      const checkDate = new Date(year, month, day);
      const checkDateOnly = new Date(checkDate.getFullYear(), checkDate.getMonth(), checkDate.getDate());
      const startDateOnly = new Date(start.getFullYear(), start.getMonth(), start.getDate());
      const endDateOnly = new Date(end.getFullYear(), end.getMonth(), end.getDate());

      const isMultiDay = startDateOnly < endDateOnly;
      const spansDay = checkDateOnly >= startDateOnly && checkDateOnly <= endDateOnly;
      return spansDay && !isMultiDay;
    });
  };
  // Helper to get multi-day event status for a day
  const getMultiDayEventType = (year: number, month: number, day: number) => {
    for (const event of events) {
      const start = event.fromDate || event.date;
      if (!start) continue;
      const end = event.toDate;
      if (!end) continue;
      const checkDate = new Date(year, month, day);
      const checkDateOnly = new Date(checkDate.getFullYear(), checkDate.getMonth(), checkDate.getDate());
      const startDateOnly = new Date(start.getFullYear(), start.getMonth(), start.getDate());
      const endDateOnly = new Date(end.getFullYear(), end.getMonth(), end.getDate());

      if (checkDateOnly >= startDateOnly && checkDateOnly <= endDateOnly && startDateOnly < endDateOnly) {
        if (
          checkDateOnly.getFullYear() === startDateOnly.getFullYear() &&
          checkDateOnly.getMonth() === startDateOnly.getMonth() &&
          checkDateOnly.getDate() === startDateOnly.getDate()
        ) {
          return 'start';
        } else if (
          checkDateOnly.getFullYear() === endDateOnly.getFullYear() &&
          checkDateOnly.getMonth() === endDateOnly.getMonth() &&
          checkDateOnly.getDate() === endDateOnly.getDate()
        ) {
          return 'end';
        } else {
          return 'middle';
        }
      }
    }
    return null;
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

  // Add next month's days to complete the last row only
  const remainingDays = (7 - (calendarDays.length % 7)) % 7; // Days needed to complete the week
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
          const dayKey = `${dayData.year}-${dayData.month}-${dayData.day}`;
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
                {/* Multi-day event gold line with rounded ends */}
                {(() => {
                  const type = getMultiDayEventType(dayData.year, dayData.month, dayData.day);
                  if (!type) return null;
                  if (type === 'start') {
                    return (
                      <View
                        style={[styles.multiDayLine, styles.multiDayLineStart]}
                        testID={`multi-day-line-${dayKey}`}
                      />
                    );
                  } else if (type === 'end') {
                    return (
                      <View
                        style={[styles.multiDayLine, styles.multiDayLineEnd]}
                        testID={`multi-day-line-${dayKey}`}
                      />
                    );
                  } else {
                    return <View style={styles.multiDayLine} testID={`multi-day-line-${dayKey}`} />;
                  }
                })()}
                {/* Single-day event indicator */}
                {hasNonMultiDayEvents(dayData.year, dayData.month, dayData.day) && (
                  <View style={styles.eventIndicator} testID={`event-indicator-${dayKey}`} />
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
const cellSize = (screenWidth - 16) / 7; // Account for horizontal padding (8px on each side)

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    paddingBottom: 24,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    overflow: 'hidden',
  },
  weekDaysRow: {
    flexDirection: 'row',
    paddingVertical: 16,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(37, 99, 235, 0.1)', // Softer blue border
  },
  weekDayCell: {
    width: cellSize,
    alignItems: 'center',
  },
  weekDayText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1E40AF',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 8,
    paddingTop: 8,
  },
  dayCell: {
    width: cellSize,
    height: cellSize,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 2,
  },
  dayContent: {
    width: cellSize - 10,
    height: cellSize - 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
  },
  todayContent: {
    backgroundColor: '#F59E0B',
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  dayText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#1E3A8A',
    lineHeight: 24,
  },
  otherMonthText: {
    color: '#94A3B8',
    fontWeight: '400',
  },
  todayText: {
    color: '#fff',
    fontWeight: '700',
  },
  eventIndicator: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#991B1B',
    position: 'absolute',
    bottom: 2,
    zIndex: 2,
    shadowColor: '#991B1B',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.4,
    shadowRadius: 2,
  },
  multiDayLine: {
    position: 'absolute',
    bottom: 8,
    height: 2,
    width: cellSize,
    left: -5,
    backgroundColor: '#F59E0B',
    zIndex: 1,
  },
  multiDayLineStart: {
    borderTopLeftRadius: 6,
    borderBottomLeftRadius: 6,
    borderTopRightRadius: 0,
    borderBottomRightRadius: 0,
  },
  multiDayLineEnd: {
    borderTopRightRadius: 6,
    borderBottomRightRadius: 6,
    borderTopLeftRadius: 0,
    borderBottomLeftRadius: 0,
  },
});

export default CalendarGrid;

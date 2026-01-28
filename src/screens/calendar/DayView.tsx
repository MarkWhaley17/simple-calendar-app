import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { CalendarEvent } from '../../types';
import { DAY_NAMES, MONTH_NAMES } from '../../constants/dates';

interface DayViewProps {
  selectedDate: Date;
  onBack: () => void;
  events?: CalendarEvent[];
  onEventPress?: (event: CalendarEvent) => void;
  onAddEvent?: () => void;
}

const DayView: React.FC<DayViewProps> = ({ selectedDate, onBack, events = [], onEventPress, onAddEvent }) => {
  const dayName = DAY_NAMES[selectedDate.getDay()];
  const monthName = MONTH_NAMES[selectedDate.getMonth()];
  const dayNumber = selectedDate.getDate();
  const year = selectedDate.getFullYear();

  // Filter events for the selected date
  const dayEvents = events.filter(event => {
    const eventDate = event.fromDate || event.date || new Date();
    return eventDate.getFullYear() === year &&
           eventDate.getMonth() === selectedDate.getMonth() &&
           eventDate.getDate() === dayNumber;
  });

  // Sort events: all-day first, then by time
  const sortedEvents = [...dayEvents].sort((a, b) => {
    if (a.isAllDay && !b.isAllDay) return -1;
    if (!a.isAllDay && b.isAllDay) return 1;
    return 0;
  });

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={onBack}
          activeOpacity={0.7}
        >
          <Text style={styles.backButtonText}>‹ Back</Text>
        </TouchableOpacity>

        <View style={styles.dateInfo}>
          <Text style={styles.dayName}>{dayName}</Text>
          <Text style={styles.fullDate}>
            {monthName} {dayNumber}, {year}
          </Text>
        </View>
      </View>

      {/* Events list */}
      <ScrollView style={styles.eventsContainer}>
        {sortedEvents.length > 0 ? (
          <View style={styles.eventsList}>
            {sortedEvents.map((event) => {
              const eventTime = event.isAllDay
                ? 'All Day'
                : (event.fromTime || event.startTime || '');

              return (
                <TouchableOpacity
                  key={event.id}
                  style={styles.eventCard}
                  onPress={() => onEventPress && onEventPress(event)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.eventTitle}>{event.title}</Text>
                  {eventTime && (
                    <Text style={styles.eventTime}>{eventTime}</Text>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>No events for this day</Text>
          </View>
        )}
      </ScrollView>

      {/* Add event button */}
      <TouchableOpacity
        style={styles.addButton}
        activeOpacity={0.8}
        onPress={onAddEvent}
      >
        <Text style={styles.addButtonText}>+ Add Event</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EFF6FF', // Light blue background
  },
  header: {
    backgroundColor: '#2563EB', // Blue header
    paddingTop: 16,
    paddingBottom: 20,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1E40AF', // Darker blue border
  },
  backButton: {
    alignSelf: 'flex-start',
    paddingVertical: 8,
    paddingRight: 16,
  },
  backButtonText: {
    fontSize: 18,
    color: '#F59E0B', // Gold back button
    fontWeight: '500',
  },
  dateInfo: {
    marginTop: 8,
  },
  dayName: {
    fontSize: 28,
    fontWeight: '700',
    color: '#fff', // White text on blue
  },
  fullDate: {
    fontSize: 16,
    color: '#DBEAFE', // Light blue text
    marginTop: 4,
  },
  eventsContainer: {
    flex: 1,
  },
  eventsList: {
    padding: 16,
  },
  eventCard: {
    backgroundColor: '#F59E0B', // Gold background
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
  },
  eventTime: {
    fontSize: 14,
    fontWeight: '500',
    color: '#fff',
    opacity: 0.9,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 60,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#60A5FA',
    fontStyle: 'italic',
  },
  addButton: {
    backgroundColor: '#F59E0B', // Gold button
    margin: 16,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});

export default DayView;

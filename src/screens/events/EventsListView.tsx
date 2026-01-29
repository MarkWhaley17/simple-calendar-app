import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { CalendarEvent } from '../../types';
import { MONTH_NAMES } from '../../constants/dates';

interface EventsListViewProps {
  events: CalendarEvent[];
  onEventPress: (event: CalendarEvent) => void;
}

const EventsListView: React.FC<EventsListViewProps> = ({ events, onEventPress }) => {
  // Sort events chronologically
  const sortedEvents = [...events].sort((a, b) => {
    const dateA = a.fromDate || a.date || new Date();
    const dateB = b.fromDate || b.date || new Date();
    return dateA.getTime() - dateB.getTime();
  });

  const formatEventDate = (event: CalendarEvent): string => {
    const eventDate = event.fromDate || event.date || new Date();
    const eventTime = event.fromTime || event.startTime;

    const monthName = MONTH_NAMES[eventDate.getMonth()];
    const day = eventDate.getDate();
    const year = eventDate.getFullYear();

    if (event.isAllDay) {
      return `${monthName} ${day}, ${year} • All Day`;
    }

    return `${monthName} ${day}, ${year}${eventTime ? ` • ${eventTime}` : ''}`;
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>All Events</Text>
        <Text style={styles.headerSubtitle}>{sortedEvents.length} event{sortedEvents.length !== 1 ? 's' : ''}</Text>
      </View>

      {/* Events list */}
      <ScrollView style={styles.eventsContainer}>
        {sortedEvents.length > 0 ? (
          <View style={styles.eventsList}>
            {sortedEvents.map((event) => (
              <TouchableOpacity
                key={event.id}
                style={styles.eventBar}
                onPress={() => onEventPress(event)}
                activeOpacity={0.8}
              >
                <Text style={styles.eventTitle}>{event.title}</Text>
                <Text style={styles.eventDate}>{formatEventDate(event)}</Text>
              </TouchableOpacity>
            ))}
          </View>
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>No events yet</Text>
            <Text style={styles.emptyStateSubtext}>Add an event to get started</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EFF6FF',
  },
  header: {
    backgroundColor: '#2563EB',
    paddingTop: 20,
    paddingBottom: 24,
    paddingHorizontal: 20,
    shadowColor: '#1E40AF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: 0.3,
  },
  headerSubtitle: {
    fontSize: 15,
    color: '#DBEAFE',
    marginTop: 6,
    letterSpacing: 0.3,
  },
  eventsContainer: {
    flex: 1,
  },
  eventsList: {
    padding: 20,
  },
  eventBar: {
    backgroundColor: '#fff',
    paddingVertical: 20,
    paddingHorizontal: 22,
    borderRadius: 16,
    marginBottom: 16,
    borderLeftWidth: 5,
    borderLeftColor: '#991B1B',
    borderWidth: 1,
    borderColor: 'rgba(37, 99, 235, 0.08)',
    shadowColor: '#1E40AF',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 6,
  },
  eventTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1E3A8A',
    marginBottom: 8,
    letterSpacing: 0.2,
  },
  eventDate: {
    fontSize: 14,
    fontWeight: '600',
    color: '#991B1B',
    letterSpacing: 0.2,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 80,
  },
  emptyStateText: {
    fontSize: 18,
    lineHeight: 26,
    color: '#60A5FA',
    fontWeight: '700',
    marginBottom: 10,
    letterSpacing: 0.2,
  },
  emptyStateSubtext: {
    fontSize: 15,
    lineHeight: 22,
    color: '#93C5FD',
    fontStyle: 'italic',
    letterSpacing: 0.2,
  },
});

export default EventsListView;

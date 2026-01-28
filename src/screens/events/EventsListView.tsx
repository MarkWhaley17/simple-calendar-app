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
    paddingTop: 16,
    paddingBottom: 20,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1E40AF',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#fff',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#DBEAFE',
    marginTop: 4,
  },
  eventsContainer: {
    flex: 1,
  },
  eventsList: {
    padding: 16,
  },
  eventBar: {
    backgroundColor: '#F59E0B',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 6,
  },
  eventDate: {
    fontSize: 14,
    fontWeight: '500',
    color: '#fff',
    opacity: 0.9,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 80,
  },
  emptyStateText: {
    fontSize: 18,
    color: '#60A5FA',
    fontWeight: '600',
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#93C5FD',
    fontStyle: 'italic',
  },
});

export default EventsListView;

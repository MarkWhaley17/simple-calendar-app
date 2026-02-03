import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ImageBackground, Image } from 'react-native';
import { CalendarEvent } from '../../types';
import { DAY_NAMES, MONTH_NAMES } from '../../constants/dates';

interface DayViewProps {
  selectedDate: Date;
  onBack: () => void;
  events?: CalendarEvent[];
  onEventPress?: (event: CalendarEvent) => void;
  onAddEvent?: () => void;
  onChangeDate?: (date: Date) => void;
}

const DayView: React.FC<DayViewProps> = ({
  selectedDate,
  onBack,
  events = [],
  onEventPress,
  onAddEvent,
}) => {
  const dayName = DAY_NAMES[selectedDate.getDay()];
  const monthName = MONTH_NAMES[selectedDate.getMonth()];
  const dayNumber = selectedDate.getDate();
  const year = selectedDate.getFullYear();
  // Swipe handling is managed by the parent view.

  // Filter events for the selected date, including multi-day events
  const dayEvents = events.filter(event => {
    const start = event.fromDate || event.date || new Date();
    const end = event.toDate || start;
    // Check if selectedDate is within the event's date range (inclusive)
    return (
      selectedDate >= start &&
      selectedDate <= end &&
      start <= end // sanity check
    );
  });

  // Sort events: all-day first, then by time
  const sortedEvents = [...dayEvents].sort((a, b) => {
    if (a.isAllDay && !b.isAllDay) return -1;
    if (!a.isAllDay && b.isAllDay) return 1;
    return 0;
  });

  // Map image filenames to static require calls
  const imageMap: Record<string, any> = {
    'medicine-buddha.jpg': require('../../../assets/medicine-buddha.jpg'),
    'protector-day.jpg': require('../../../assets/protector-day.jpg'),
    'guru-rinpoche.jpg': require('../../../assets/guru-rinpoche.jpg'),
    // Add more mappings as you add images
  };

  const eventWithImage = sortedEvents.find(e => e.image && imageMap[e.image]);
  const headerBackground = eventWithImage && eventWithImage.image && imageMap[eventWithImage.image]
    ? imageMap[eventWithImage.image]
    : require('../../../assets/day-bg.jpg');
  const eventsBackground = require('../../../assets/day-view-pattern.png');

  return (
    <View style={styles.container}>
      {/* Header */}
      <ImageBackground
        source={headerBackground}
        style={styles.headerBackground}
        resizeMode="cover"
        testID="day-view-header-image"
      >
        <View style={styles.headerOverlay}>
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
      </ImageBackground>

      {/* Events list */}
      <View style={styles.eventsBackground}>
        <Image
          source={eventsBackground}
          style={styles.eventsPatternImage}
          resizeMode="repeat"
          testID="day-view-events-background"
        />
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
      </View>

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
    backgroundColor: '#EFF6FF',
  },
  headerBackground: {
    width: '100%',
  },
  headerOverlay: {
    backgroundColor: 'rgba(37, 99, 235, 0.55)',
    paddingTop: 20,
    paddingBottom: 24,
    paddingHorizontal: 20,
    shadowColor: '#1E40AF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  backButton: {
    alignSelf: 'flex-start',
    paddingVertical: 8,
    paddingRight: 16,
  },
  backButtonText: {
    fontSize: 18,
    color: '#F59E0B',
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  dateInfo: {
    marginTop: 12,
  },
  dayName: {
    fontSize: 32,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: 0.3,
  },
  fullDate: {
    fontSize: 16,
    color: '#DBEAFE',
    marginTop: 6,
    letterSpacing: 0.3,
  },
  eventsContainer: {
    flex: 1,
  },
  eventsBackground: {
    flex: 1,
    position: 'relative',
  },
  eventsPatternImage: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.25,
  },
  eventsList: {
    padding: 20,
  },
  eventCard: {
    backgroundColor: '#fff',
    padding: 18,
    borderRadius: 16,
    marginBottom: 14,
    borderLeftWidth: 4,
    borderLeftColor: '#991B1B',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
  },
  eventTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1E3A8A',
    marginBottom: 6,
    letterSpacing: 0.2,
  },
  eventTime: {
    fontSize: 14,
    fontWeight: '600',
    color: '#991B1B',
    letterSpacing: 0.2,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 60,
  },
  emptyStateText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#60A5FA',
    fontStyle: 'italic',
    letterSpacing: 0.2,
  },
  addButton: {
    backgroundColor: '#F59E0B',
    margin: 20,
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.4,
  },
});

export default DayView;

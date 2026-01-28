import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { CalendarEvent } from '../../types';
import { MONTH_NAMES } from '../../constants/dates';

interface EventViewProps {
  event: CalendarEvent;
  onBack: () => void;
  onEdit?: () => void;
}

const EventView: React.FC<EventViewProps> = ({ event, onBack, onEdit }) => {
  // Support both new and legacy event structures
  const eventDate = event.fromDate || event.date || new Date();
  const eventTime = event.fromTime || event.startTime;

  const monthName = MONTH_NAMES[eventDate.getMonth()];
  const dayNumber = eventDate.getDate();
  const year = eventDate.getFullYear();

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={onBack}
            activeOpacity={0.7}
          >
            <Text style={styles.backButtonText}>‹ Back</Text>
          </TouchableOpacity>
          {onEdit && (
            <TouchableOpacity
              style={styles.editButton}
              onPress={onEdit}
              activeOpacity={0.7}
            >
              <Text style={styles.editButtonText}>Edit</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.eventInfo}>
          <Text style={styles.eventTitle}>{event.title}</Text>
          <Text style={styles.eventDate}>
            {monthName} {dayNumber}, {year}
            {eventTime && ` • ${eventTime}`}
          </Text>
        </View>
      </View>

      {/* Event Details */}
      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.descriptionText}>
            {event.description || 'No description available'}
          </Text>
        </View>

        {event.links && event.links.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Links</Text>
            {event.links.map((link, index) => (
              <Text key={index} style={styles.linkText}>
                {link}
              </Text>
            ))}
          </View>
        )}
      </ScrollView>
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
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  backButton: {
    paddingVertical: 8,
    paddingRight: 16,
  },
  backButtonText: {
    fontSize: 18,
    color: '#F59E0B', // Gold back button
    fontWeight: '500',
  },
  editButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  editButtonText: {
    fontSize: 18,
    color: '#F59E0B', // Gold edit button
    fontWeight: '600',
  },
  eventInfo: {
    marginTop: 8,
  },
  eventTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#fff', // White text on blue
  },
  eventDate: {
    fontSize: 16,
    color: '#DBEAFE', // Light blue text
    marginTop: 4,
  },
  content: {
    flex: 1,
  },
  section: {
    backgroundColor: '#fff',
    padding: 20,
    marginTop: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E40AF', // Dark blue
    marginBottom: 12,
  },
  descriptionText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#1E3A8A', // Dark blue text
  },
  linkText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#2563EB', // Blue link color
    marginBottom: 8,
  },
});

export default EventView;

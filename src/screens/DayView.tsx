import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';

interface DayViewProps {
  selectedDate: Date;
  onBack: () => void;
}

const DayView: React.FC<DayViewProps> = ({ selectedDate, onBack }) => {
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const dayName = dayNames[selectedDate.getDay()];
  const monthName = monthNames[selectedDate.getMonth()];
  const dayNumber = selectedDate.getDate();
  const year = selectedDate.getFullYear();

  // Generate time slots for the day (7 AM to 9 PM)
  const timeSlots = [];
  for (let hour = 7; hour <= 21; hour++) {
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour > 12 ? hour - 12 : hour;
    timeSlots.push(`${displayHour}:00 ${period}`);
  }

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

      {/* Time slots */}
      <ScrollView style={styles.timeSlotsContainer}>
        {timeSlots.map((time, index) => (
          <View key={index} style={styles.timeSlot}>
            <View style={styles.timeLabel}>
              <Text style={styles.timeText}>{time}</Text>
            </View>
            <View style={styles.eventSpace}>
              <Text style={styles.placeholderText}>No events</Text>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Add event button */}
      <TouchableOpacity style={styles.addButton} activeOpacity={0.8}>
        <Text style={styles.addButtonText}>+ Add Event</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#fff',
    paddingTop: 16,
    paddingBottom: 20,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    alignSelf: 'flex-start',
    paddingVertical: 8,
    paddingRight: 16,
  },
  backButtonText: {
    fontSize: 18,
    color: '#007AFF',
    fontWeight: '500',
  },
  dateInfo: {
    marginTop: 8,
  },
  dayName: {
    fontSize: 28,
    fontWeight: '700',
    color: '#333',
  },
  fullDate: {
    fontSize: 16,
    color: '#666',
    marginTop: 4,
  },
  timeSlotsContainer: {
    flex: 1,
  },
  timeSlot: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    marginVertical: 1,
    minHeight: 60,
  },
  timeLabel: {
    width: 80,
    paddingTop: 12,
    paddingLeft: 16,
  },
  timeText: {
    fontSize: 12,
    color: '#999',
    fontWeight: '500',
  },
  eventSpace: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 12,
    justifyContent: 'center',
    borderLeftWidth: 1,
    borderLeftColor: '#e0e0e0',
  },
  placeholderText: {
    fontSize: 14,
    color: '#ccc',
    fontStyle: 'italic',
  },
  addButton: {
    backgroundColor: '#007AFF',
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

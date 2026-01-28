import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Platform, Switch, Alert } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { CalendarEvent } from '../../types';
import { MONTH_NAMES } from '../../constants/dates';

interface EditEventViewProps {
  event: CalendarEvent;
  onBack: () => void;
  onSave: (eventData: {
    id: string;
    title: string;
    description: string;
    fromDate: Date;
    fromTime: string;
    toDate: Date;
    toTime: string;
    links: string[];
    isAllDay: boolean;
  }) => void;
  onDelete: (eventId: string) => void;
}

const EditEventView: React.FC<EditEventViewProps> = ({ event, onBack, onSave, onDelete }) => {
  const [title, setTitle] = useState(event.title);
  const [description, setDescription] = useState(event.description || '');
  const [fromDate, setFromDate] = useState(event.fromDate || event.date || new Date());
  const [fromTime, setFromTime] = useState(event.fromTime || event.startTime || '9:00 AM');
  const [toDate, setToDate] = useState(event.toDate || event.date || new Date());
  const [toTime, setToTime] = useState(event.toTime || event.endTime || '10:00 AM');
  const [links, setLinks] = useState((event.links || []).join('\n'));
  const [isAllDay, setIsAllDay] = useState(event.isAllDay || false);

  const [showFromDatePicker, setShowFromDatePicker] = useState(false);
  const [showToDatePicker, setShowToDatePicker] = useState(false);

  const formatDate = (date: Date) => {
    return `${MONTH_NAMES[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
  };

  const handleSave = () => {
    if (!title.trim()) {
      return; // Could add validation UI here
    }

    const linkArray = links
      .split('\n')
      .map(link => link.trim())
      .filter(link => link.length > 0);

    onSave({
      id: event.id,
      title: title.trim(),
      description: description.trim(),
      fromDate,
      fromTime: isAllDay ? '12:01 AM' : fromTime,
      toDate,
      toTime: isAllDay ? '11:59 PM' : toTime,
      links: linkArray,
      isAllDay,
    });
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Event',
      'Are you sure you want to delete this event? This action cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => onDelete(event.id),
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerButtons}>
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={onBack}
            activeOpacity={0.7}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Edit Event</Text>
          <TouchableOpacity
            style={styles.saveButton}
            onPress={handleSave}
            activeOpacity={0.7}
          >
            <Text style={styles.saveButtonText}>Save</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Form */}
      <ScrollView style={styles.form}>
        {/* Title */}
        <View style={styles.section}>
          <Text style={styles.label}>Title *</Text>
          <TextInput
            style={styles.input}
            placeholder="Event title"
            placeholderTextColor="#BFDBFE"
            value={title}
            onChangeText={setTitle}
          />
        </View>

        {/* Description */}
        <View style={styles.section}>
          <Text style={styles.label}>Description</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Add description or practice details"
            placeholderTextColor="#BFDBFE"
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
          />
        </View>

        {/* All Day Toggle */}
        <View style={styles.section}>
          <View style={styles.toggleRow}>
            <Text style={styles.label}>All Day</Text>
            <Switch
              value={isAllDay}
              onValueChange={setIsAllDay}
              trackColor={{ false: '#BFDBFE', true: '#F59E0B' }}
              thumbColor={isAllDay ? '#fff' : '#f4f3f4'}
            />
          </View>
        </View>

        {/* From Date/Time */}
        <View style={styles.section}>
          <Text style={styles.label}>From</Text>
          <View style={styles.dateTimeRow}>
            <TouchableOpacity
              style={[styles.dateTimeInput, styles.dateInput]}
              onPress={() => setShowFromDatePicker(true)}
            >
              <Text style={styles.dateTimeText}>{formatDate(fromDate)}</Text>
            </TouchableOpacity>
            {!isAllDay && (
              <TextInput
                style={[styles.input, styles.timeInput]}
                placeholder="9:00 AM"
                placeholderTextColor="#BFDBFE"
                value={fromTime}
                onChangeText={setFromTime}
              />
            )}
          </View>
          {showFromDatePicker && (
            <DateTimePicker
              value={fromDate}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={(event, selectedDate) => {
                setShowFromDatePicker(Platform.OS === 'ios');
                if (selectedDate) {
                  setFromDate(selectedDate);
                }
              }}
            />
          )}
        </View>

        {/* To Date/Time */}
        <View style={styles.section}>
          <Text style={styles.label}>To</Text>
          <View style={styles.dateTimeRow}>
            <TouchableOpacity
              style={[styles.dateTimeInput, styles.dateInput]}
              onPress={() => setShowToDatePicker(true)}
            >
              <Text style={styles.dateTimeText}>{formatDate(toDate)}</Text>
            </TouchableOpacity>
            {!isAllDay && (
              <TextInput
                style={[styles.input, styles.timeInput]}
                placeholder="10:00 AM"
                placeholderTextColor="#BFDBFE"
                value={toTime}
                onChangeText={setToTime}
              />
            )}
          </View>
          {showToDatePicker && (
            <DateTimePicker
              value={toDate}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={(event, selectedDate) => {
                setShowToDatePicker(Platform.OS === 'ios');
                if (selectedDate) {
                  setToDate(selectedDate);
                }
              }}
            />
          )}
        </View>

        {/* Links */}
        <View style={styles.section}>
          <Text style={styles.label}>Links</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Add links (one per line)"
            placeholderTextColor="#BFDBFE"
            value={links}
            onChangeText={setLinks}
            multiline
            numberOfLines={3}
          />
        </View>

        {/* Delete Button */}
        <View style={styles.deleteSection}>
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={handleDelete}
            activeOpacity={0.8}
          >
            <Text style={styles.deleteButtonText}>Delete Event</Text>
          </TouchableOpacity>
        </View>
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
    paddingBottom: 20,
    paddingHorizontal: 20,
    shadowColor: '#1E40AF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  headerButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cancelButton: {
    paddingVertical: 10,
    paddingHorizontal: 6,
  },
  cancelButtonText: {
    fontSize: 17,
    color: '#DBEAFE',
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: 0.3,
  },
  saveButton: {
    paddingVertical: 10,
    paddingHorizontal: 6,
  },
  saveButtonText: {
    fontSize: 17,
    color: '#F59E0B',
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  form: {
    flex: 1,
  },
  section: {
    backgroundColor: '#fff',
    padding: 20,
    marginTop: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 2,
    elevation: 1,
  },
  label: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1E40AF',
    marginBottom: 10,
    letterSpacing: 0.2,
  },
  input: {
    borderWidth: 2,
    borderColor: 'rgba(37, 99, 235, 0.15)',
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    lineHeight: 22,
    color: '#1E3A8A',
    backgroundColor: '#fff',
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  dateTimeRow: {
    flexDirection: 'row',
    gap: 14,
  },
  dateTimeInput: {
    borderWidth: 2,
    borderColor: 'rgba(37, 99, 235, 0.15)',
    borderRadius: 12,
    padding: 14,
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  dateInput: {
    flex: 1,
  },
  timeInput: {
    width: 110,
  },
  dateTimeText: {
    fontSize: 16,
    color: '#1E3A8A',
    fontWeight: '500',
    letterSpacing: 0.2,
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  deleteSection: {
    padding: 20,
    paddingTop: 40,
    paddingBottom: 60,
  },
  deleteButton: {
    backgroundColor: '#fff',
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#991B1B',
  },
  deleteButtonText: {
    color: '#991B1B',
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
});

export default EditEventView;

import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Platform, Switch } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { MONTH_NAMES } from '../../constants/dates';

interface AddEventViewProps {
  onBack: () => void;
  onSave: (event: {
    title: string;
    description: string;
    fromDate: Date;
    fromTime: string;
    toDate: Date;
    toTime: string;
    links: string[];
    isAllDay: boolean;
  }) => void;
  initialDate?: Date;
}

const AddEventView: React.FC<AddEventViewProps> = ({ onBack, onSave, initialDate }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [fromDate, setFromDate] = useState(initialDate || new Date());
  const [fromTime, setFromTime] = useState('9:00 AM');
  const [toDate, setToDate] = useState(initialDate || new Date());
  const [toTime, setToTime] = useState('10:00 AM');
  const [links, setLinks] = useState('');
  const [isAllDay, setIsAllDay] = useState(false);

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
          <Text style={styles.headerTitle}>New Event</Text>
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
            placeholder="Add description"
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
    paddingBottom: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1E40AF',
  },
  headerButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cancelButton: {
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#DBEAFE',
    fontWeight: '500',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#fff',
  },
  saveButton: {
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  saveButtonText: {
    fontSize: 16,
    color: '#F59E0B',
    fontWeight: '600',
  },
  form: {
    flex: 1,
  },
  section: {
    backgroundColor: '#fff',
    padding: 16,
    marginTop: 1,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E40AF',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#BFDBFE',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#1E3A8A',
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  dateTimeRow: {
    flexDirection: 'row',
    gap: 12,
  },
  dateTimeInput: {
    borderWidth: 1,
    borderColor: '#BFDBFE',
    borderRadius: 8,
    padding: 12,
    justifyContent: 'center',
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
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});

export default AddEventView;

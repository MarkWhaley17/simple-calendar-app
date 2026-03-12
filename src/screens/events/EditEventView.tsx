import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Platform, Switch, Alert, Pressable, KeyboardAvoidingView } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { CalendarEvent, RecurrenceRule } from '../../types';
import { MONTH_NAMES } from '../../constants/dates';
import RecurrencePicker from '../../components/common/RecurrencePicker';
import { ENABLE_GLASS_UI } from '../../theme/flags';
import { GlassSurface } from '../../components/ui/GlassSurface';
import { colors, elevation, spacing } from '../../theme/tokens';
import { getRecurrenceLabel } from '../../utils/recurrence';
import { isPreloadedEvent } from '../../utils/eventEditability';

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
    accumulations?: number;
    isAllDay: boolean;
    recurrence?: RecurrenceRule;
    reminderEnabled?: boolean;
    reminderMinutesBefore?: number;
    reminderHoursBefore?: number;
  }) => void;
  onDelete: (eventId: string) => void;
  deleteMode?: 'delete' | 'skip';
  showRecurringNotice?: boolean;
  defaultEventReminderMinutes: number;
  defaultAllDayReminderHours: number;
}

interface SectionContainerProps {
  children: React.ReactNode;
  useIosPilot: boolean;
}

const SectionContainer: React.FC<SectionContainerProps> = ({ children, useIosPilot }) => {
  if (useIosPilot) {
    return (
      <View style={styles.sectionWrapper}>
        <GlassSurface style={styles.section} intensity={36}>
          {children}
        </GlassSurface>
      </View>
    );
  }

  return <View style={styles.section}>{children}</View>;
};

const EditEventView: React.FC<EditEventViewProps> = ({
  event,
  onBack,
  onSave,
  onDelete,
  deleteMode = 'delete',
  showRecurringNotice = true,
  defaultEventReminderMinutes,
  defaultAllDayReminderHours,
}) => {
  const useIosPilot = ENABLE_GLASS_UI && Platform.OS === 'ios';
  const isLockedEvent = isPreloadedEvent(event);
  const [title, setTitle] = useState(event.title);
  const [description, setDescription] = useState(event.description || '');
  const [fromDate, setFromDate] = useState(event.fromDate || event.date || new Date());
  const [fromTime, setFromTime] = useState(event.fromTime || event.startTime || '9:00 AM');
  const [toDate, setToDate] = useState(event.toDate || event.date || new Date());
  const [toTime, setToTime] = useState(event.toTime || event.endTime || '10:00 AM');
  const [links, setLinks] = useState((event.links || []).join('\n'));
  const [accumulationsInput, setAccumulationsInput] = useState(
    event.accumulations === undefined ? '' : `${event.accumulations}`
  );
  const [isAllDay, setIsAllDay] = useState(event.isAllDay || false);
  const [recurrence, setRecurrence] = useState<RecurrenceRule>(
    event.recurrence || { frequency: 'none', interval: 1 }
  );
  const [reminderEnabled, setReminderEnabled] = useState(event.reminderEnabled !== false);
  const [useDefaultReminder, setUseDefaultReminder] = useState(
    event.reminderMinutesBefore === undefined && event.reminderHoursBefore === undefined
  );
  const [reminderMinutesInput, setReminderMinutesInput] = useState(
    `${event.reminderMinutesBefore ?? defaultEventReminderMinutes}`
  );
  const [reminderHoursInput, setReminderHoursInput] = useState(
    `${event.reminderHoursBefore ?? defaultAllDayReminderHours}`
  );
  const [reminderError, setReminderError] = useState<string | null>(null);

  const [showFromDatePicker, setShowFromDatePicker] = useState(false);
  const [showToDatePicker, setShowToDatePicker] = useState(false);
  const [showRecurrencePicker, setShowRecurrencePicker] = useState(false);

  const formatDate = (date: Date) => {
    return `${MONTH_NAMES[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
  };

  const parsePositiveInt = (value: string, fallback: number): number => {
    const parsed = Number.parseInt(value, 10);
    if (Number.isNaN(parsed) || parsed < 0) {
      return fallback;
    }
    return parsed;
  };

  const validateReminder = (): boolean => {
    if (!reminderEnabled || useDefaultReminder) {
      setReminderError(null);
      return true;
    }

    const min = isAllDay ? 1 : 1;
    const max = isAllDay ? 168 : 1440;
    const rawValue = isAllDay ? reminderHoursInput : reminderMinutesInput;
    const parsed = Number.parseInt(rawValue, 10);

    if (Number.isNaN(parsed)) {
      setReminderError('Enter a number');
      return false;
    }

    if (parsed < min || parsed > max) {
      setReminderError(`Use ${min}-${max}`);
      return false;
    }

    setReminderError(null);
    return true;
  };

  const parseAccumulations = (value: string): number | undefined | null => {
    const trimmed = value.trim();
    if (!trimmed) return undefined;
    if (!/^\d+$/.test(trimmed)) return null;
    return Number.parseInt(trimmed, 10);
  };

  const handleSave = () => {
    if (!title.trim()) {
      return; // Could add validation UI here
    }

    if (!validateReminder()) {
      return;
    }

    const linkArray = links
      .split('\n')
      .map(link => link.trim())
      .filter(link => link.length > 0);
    const accumulations = parseAccumulations(accumulationsInput);
    if (accumulations === null) {
      Alert.alert('Invalid accumulations', 'Please enter a non-negative whole number.');
      return;
    }

    onSave({
      id: event.id,
      title: title.trim(),
      description: description.trim(),
      fromDate,
      fromTime: isAllDay ? '12:01 AM' : fromTime,
      toDate,
      toTime: isAllDay ? '11:59 PM' : toTime,
      links: linkArray,
      accumulations,
      isAllDay,
      recurrence: recurrence.frequency !== 'none' ? recurrence : undefined,
      reminderEnabled,
      reminderMinutesBefore: !reminderEnabled || useDefaultReminder || isAllDay
        ? undefined
        : parsePositiveInt(reminderMinutesInput, defaultEventReminderMinutes),
      reminderHoursBefore: !reminderEnabled || useDefaultReminder || !isAllDay
        ? undefined
        : parsePositiveInt(reminderHoursInput, defaultAllDayReminderHours),
    });
  };

  const handleDelete = () => {
    const isSkip = deleteMode === 'skip';
    Alert.alert(
      isSkip ? 'Skip Occurrence' : 'Delete Event',
      isSkip
        ? 'Skip this single occurrence? This does not affect future events.'
        : 'Are you sure you want to delete this event? This action cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: isSkip ? 'Skip' : 'Delete',
          style: isSkip ? 'default' : 'destructive',
          onPress: () => onDelete(event.id),
        },
      ]
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 24 : 0}
    >
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
      <ScrollView
        style={styles.form}
        contentContainerStyle={styles.formContent}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="none"
        automaticallyAdjustKeyboardInsets
        testID="edit-event-scrollview"
      >
        {/* Recurring Event Notice */}
        {showRecurringNotice && event.recurrence && event.recurrence.frequency !== 'none' && (
          <View style={styles.noticeSection}>
            <Text style={styles.noticeText}>
              Editing this recurring event will update all future occurrences.
            </Text>
          </View>
        )}
        {isLockedEvent && (
          <View style={styles.noticeSection}>
            <Text style={styles.noticeText}>
              This pre-loaded event is locked. You can edit links only.
            </Text>
          </View>
        )}

        {/* Title */}
        <SectionContainer useIosPilot={useIosPilot}>
          <Text style={styles.label}>Title *</Text>
          <TextInput
            style={styles.input}
            placeholder="Event title"
            placeholderTextColor={colors.placeholder}
            value={title}
            onChangeText={setTitle}
            editable={!isLockedEvent}
            testID="edit-title-input"
          />
        </SectionContainer>

        {/* Description */}
        <SectionContainer useIosPilot={useIosPilot}>
          <Text style={styles.label}>Description</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Add description or practice details"
            placeholderTextColor={colors.placeholder}
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
            editable={!isLockedEvent}
            testID="edit-description-input"
          />
        </SectionContainer>

        {/* Notes */}
        <SectionContainer useIosPilot={useIosPilot}>
          <Text style={styles.label}>Notes</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Add your notes and comments here"
            placeholderTextColor={colors.placeholder}
            value={links}
            onChangeText={setLinks}
            multiline
            numberOfLines={3}
            blurOnSubmit={false}
            returnKeyType="default"
            submitBehavior="newline"
            testID="edit-links-input"
          />
        </SectionContainer>

        {!isLockedEvent && (
          <SectionContainer useIosPilot={useIosPilot}>
            <Text style={styles.label}>Accumulations</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter a whole number"
              placeholderTextColor={colors.placeholder}
              value={accumulationsInput}
              onChangeText={setAccumulationsInput}
              keyboardType="number-pad"
              testID="edit-accumulations-input"
            />
          </SectionContainer>
        )}

        {/* All Day Toggle */}
        <SectionContainer useIosPilot={useIosPilot}>
          <View style={styles.toggleRow}>
            <Text style={styles.label}>All Day</Text>
            <Switch
              value={isAllDay}
              onValueChange={setIsAllDay}
              trackColor={{ false: colors.placeholder, true: colors.toggleDangerTrack }}
              thumbColor={isAllDay ? colors.danger : colors.toggleThumb}
              disabled={isLockedEvent}
            />
          </View>
        </SectionContainer>

        {/* From Date/Time */}
        <SectionContainer useIosPilot={useIosPilot}>
          <Text style={styles.label}>From</Text>
          <View style={styles.dateTimeRow}>
            <TouchableOpacity
              style={[styles.dateTimeInput, styles.dateInput]}
              onPress={() => setShowFromDatePicker(true)}
              disabled={isLockedEvent}
              accessibilityState={{ disabled: isLockedEvent }}
              testID="edit-from-date-button"
            >
              <Text style={styles.dateTimeText}>{formatDate(fromDate)}</Text>
            </TouchableOpacity>
            {!isAllDay && (
              <TextInput
                style={[styles.input, styles.timeInput]}
                placeholder="9:00 AM"
                placeholderTextColor={colors.placeholder}
                value={fromTime}
                onChangeText={setFromTime}
                editable={!isLockedEvent}
                testID="edit-from-time-input"
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
        </SectionContainer>

        {/* To Date/Time */}
        <SectionContainer useIosPilot={useIosPilot}>
          <Text style={styles.label}>To</Text>
          <View style={styles.dateTimeRow}>
            <TouchableOpacity
              style={[styles.dateTimeInput, styles.dateInput]}
              onPress={() => setShowToDatePicker(true)}
              disabled={isLockedEvent}
              accessibilityState={{ disabled: isLockedEvent }}
              testID="edit-to-date-button"
            >
              <Text style={styles.dateTimeText}>{formatDate(toDate)}</Text>
            </TouchableOpacity>
            {!isAllDay && (
              <TextInput
                style={[styles.input, styles.timeInput]}
                placeholder="10:00 AM"
                placeholderTextColor={colors.placeholder}
                value={toTime}
                onChangeText={setToTime}
                editable={!isLockedEvent}
                testID="edit-to-time-input"
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
        </SectionContainer>

        {/* Recurrence */}
        <SectionContainer useIosPilot={useIosPilot}>
          <Text style={styles.label}>Repeat</Text>
          <Pressable
            style={({ pressed }) => [
              styles.dateTimeInput,
              pressed && { opacity: 0.7 }
            ]}
            onPress={() => {
              console.log('Repeat button pressed');
              setShowRecurrencePicker(true);
            }}
            disabled={isLockedEvent}
            accessibilityState={{ disabled: isLockedEvent }}
            testID="edit-repeat-button"
          >
            <Text style={styles.dateTimeText}>{getRecurrenceLabel(recurrence)}</Text>
          </Pressable>
        </SectionContainer>

        {/* Reminder */}
        <SectionContainer useIosPilot={useIosPilot}>
          <View style={styles.toggleRow}>
            <Text style={styles.label}>Enable Reminder</Text>
            <Switch
              value={reminderEnabled}
              onValueChange={(value) => {
                setReminderEnabled(value);
                if (!value) {
                  setReminderError(null);
                }
              }}
              trackColor={{ false: colors.placeholder, true: colors.accentStrong }}
              thumbColor={colors.white}
              disabled={isLockedEvent}
            />
          </View>
          {reminderEnabled && (
            <>
              <View style={[styles.toggleRow, styles.subToggleRow]}>
                <Text style={styles.label}>Use Default Reminder</Text>
                <Switch
                  value={useDefaultReminder}
                  onValueChange={(value) => {
                    setUseDefaultReminder(value);
                    if (value) {
                      setReminderError(null);
                    }
                  }}
                  trackColor={{ false: colors.placeholder, true: colors.accentStrong }}
                  thumbColor={colors.white}
                  disabled={isLockedEvent}
                />
              </View>
              {!useDefaultReminder && (
                <View style={styles.reminderInputRow}>
                  <Text style={styles.reminderLabel}>
                    {isAllDay ? 'Hours before' : 'Minutes before'}
                  </Text>
                  <TextInput
                    style={[styles.input, styles.reminderInput]}
                    keyboardType="number-pad"
                    value={isAllDay ? reminderHoursInput : reminderMinutesInput}
                    onChangeText={isAllDay ? setReminderHoursInput : setReminderMinutesInput}
                    editable={!isLockedEvent}
                    testID="edit-reminder-input"
                  />
                </View>
              )}
              {reminderError && (
                <Text style={styles.inputError}>{reminderError}</Text>
              )}
            </>
          )}
        </SectionContainer>

        {/* Delete Button */}
        {!isLockedEvent && (
          <View style={styles.deleteSection}>
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={handleDelete}
              activeOpacity={0.8}
            >
              <Text style={styles.deleteButtonText}>Delete Event</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* Recurrence Picker Modal */}
      <RecurrencePicker
        visible={showRecurrencePicker}
        recurrence={recurrence}
        onClose={() => setShowRecurrencePicker(false)}
        onSave={setRecurrence}
      />
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bgSubtle,
  },
  header: {
    backgroundColor: colors.brandPrimary,
    paddingTop: spacing.lg + spacing.xs,
    paddingBottom: spacing.lg + spacing.xs,
    paddingHorizontal: spacing.lg + spacing.xs,
    minHeight: 144,
    shadowColor: colors.brandPrimaryDark,
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
    color: colors.textOnBrandMuted,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.textOnBrand,
    letterSpacing: 0.3,
  },
  saveButton: {
    paddingVertical: 10,
    paddingHorizontal: 6,
  },
  saveButtonText: {
    fontSize: 17,
    color: colors.accentStrong,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  form: {
    flex: 1,
  },
  formContent: {
    paddingBottom: 24,
  },
  section: {
    backgroundColor: colors.surfaceSolid,
    padding: 20,
    marginTop: 1,
    ...elevation.card,
  },
  sectionWrapper: {
    marginTop: 1,
  },
  label: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.brandPrimaryDark,
    marginBottom: 10,
    letterSpacing: 0.2,
  },
  input: {
    borderWidth: 2,
    borderColor: colors.borderInput,
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    lineHeight: 22,
    color: colors.brandInk,
    backgroundColor: colors.surfaceSolid,
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
    borderColor: colors.borderInput,
    borderRadius: 12,
    padding: 14,
    justifyContent: 'center',
    backgroundColor: colors.surfaceSolid,
  },
  dateInput: {
    flex: 1,
  },
  timeInput: {
    width: 110,
  },
  dateTimeText: {
    fontSize: 16,
    color: colors.brandInk,
    fontWeight: '500',
    letterSpacing: 0.2,
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  subToggleRow: {
    marginTop: 12,
  },
  reminderInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  reminderLabel: {
    fontSize: 15,
    color: colors.brandInk,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  reminderInput: {
    width: 90,
    textAlign: 'center',
  },
  inputError: {
    marginTop: 8,
    color: colors.error,
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  noticeSection: {
    backgroundColor: colors.warningSurface,
    padding: 16,
    marginTop: 1,
    borderLeftWidth: 4,
    borderLeftColor: colors.warningBorder,
  },
  noticeText: {
    fontSize: 14,
    color: colors.warningText,
    fontWeight: '600',
    letterSpacing: 0.2,
    lineHeight: 20,
  },
  deleteSection: {
    padding: 20,
    paddingTop: 40,
    paddingBottom: 60,
  },
  deleteButton: {
    backgroundColor: colors.surfaceSolid,
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.danger,
  },
  deleteButtonText: {
    color: colors.danger,
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
});

export default EditEventView;

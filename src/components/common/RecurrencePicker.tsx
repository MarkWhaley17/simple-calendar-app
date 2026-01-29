import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, ScrollView } from 'react-native';
import { RecurrenceRule, RecurrenceFrequency } from '../../types';

interface RecurrencePickerProps {
  visible: boolean;
  recurrence: RecurrenceRule;
  onClose: () => void;
  onSave: (recurrence: RecurrenceRule) => void;
}

const RecurrencePicker: React.FC<RecurrencePickerProps> = ({ visible, recurrence, onClose, onSave }) => {
  const options: Array<{ label: string; frequency: RecurrenceFrequency; interval: number }> = [
    { label: 'Does not repeat', frequency: 'none', interval: 1 },
    { label: 'Weekly', frequency: 'weekly', interval: 1 },
    { label: 'Every 2 weeks', frequency: 'weekly', interval: 2 },
    { label: 'Monthly', frequency: 'monthly', interval: 1 },
    { label: 'Yearly', frequency: 'yearly', interval: 1 },
  ];

  const handleSelect = (frequency: RecurrenceFrequency, interval: number) => {
    const newRecurrence: RecurrenceRule = {
      frequency,
      interval,
    };
    onSave(newRecurrence);
    onClose();
  };

  const isSelected = (freq: RecurrenceFrequency, interval: number) => {
    return recurrence.frequency === freq && recurrence.interval === interval;
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
      presentationStyle="overFullScreen"
    >
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <TouchableOpacity
          style={styles.container}
          activeOpacity={1}
          onPress={(e) => e.stopPropagation()}
        >
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Repeat</Text>
          </View>

          <ScrollView style={styles.content}>
            <View style={styles.section}>
              {options.map((option, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.option}
                  onPress={() => handleSelect(option.frequency, option.interval)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.optionText,
                      isSelected(option.frequency, option.interval) && styles.selectedOptionText
                    ]}
                  >
                    {option.label}
                  </Text>
                  {isSelected(option.frequency, option.interval) && (
                    <Text style={styles.checkmark}>✓</Text>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  container: {
    backgroundColor: '#fff',
    borderRadius: 20,
    width: '90%',
    maxWidth: 400,
    maxHeight: '60%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 10,
  },
  header: {
    backgroundColor: '#2563EB',
    paddingVertical: 20,
    paddingHorizontal: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: 0.3,
  },
  content: {
    flex: 1,
  },
  section: {
    padding: 20,
  },
  option: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(37, 99, 235, 0.08)',
  },
  optionText: {
    fontSize: 16,
    color: '#1E3A8A',
    letterSpacing: 0.2,
  },
  selectedOptionText: {
    fontWeight: '700',
    color: '#2563EB',
  },
  checkmark: {
    fontSize: 18,
    color: '#2563EB',
    fontWeight: '700',
  },
});

export default RecurrencePicker;

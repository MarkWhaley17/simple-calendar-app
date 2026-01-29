import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView } from 'react-native';
import { MONTH_NAMES } from '../../constants/dates';

interface MonthYearPickerProps {
  visible: boolean;
  currentDate: Date;
  onClose: () => void;
  onSelect: (date: Date) => void;
}

const MonthYearPicker: React.FC<MonthYearPickerProps> = ({ visible, currentDate, onClose, onSelect }) => {
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth());
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());

  // Generate year range (current year ± 10 years)
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 21 }, (_, i) => currentYear - 10 + i);

  const handleApply = () => {
    const newDate = new Date(selectedYear, selectedMonth, 1);
    onSelect(newDate);
    onClose();
  };

  const handleCancel = () => {
    // Reset to current date
    setSelectedMonth(currentDate.getMonth());
    setSelectedYear(currentDate.getFullYear());
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={handleCancel}
    >
      <View style={styles.overlay}>
        <View style={styles.pickerContainer}>
          <Text style={styles.title}>Select Month & Year</Text>

          <View style={styles.selectorsContainer}>
            {/* Month Selector */}
            <View style={styles.selectorColumn}>
              <Text style={styles.selectorLabel}>Month</Text>
              <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                {MONTH_NAMES.map((month, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.selectorItem,
                      selectedMonth === index && styles.selectedItem,
                    ]}
                    onPress={() => setSelectedMonth(index)}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.selectorText,
                        selectedMonth === index && styles.selectedText,
                      ]}
                    >
                      {month}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* Year Selector */}
            <View style={styles.selectorColumn}>
              <Text style={styles.selectorLabel}>Year</Text>
              <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                {years.map((year) => (
                  <TouchableOpacity
                    key={year}
                    style={[
                      styles.selectorItem,
                      selectedYear === year && styles.selectedItem,
                    ]}
                    onPress={() => setSelectedYear(year)}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.selectorText,
                        selectedYear === year && styles.selectedText,
                      ]}
                    >
                      {year}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={handleCancel}
              activeOpacity={0.7}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.applyButton]}
              onPress={handleApply}
              activeOpacity={0.7}
            >
              <Text style={styles.applyButtonText}>Apply</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
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
  pickerContainer: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1E3A8A',
    marginBottom: 24,
    textAlign: 'center',
    letterSpacing: 0.3,
  },
  selectorsContainer: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 24,
  },
  selectorColumn: {
    flex: 1,
  },
  selectorLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E40AF',
    marginBottom: 12,
    textAlign: 'center',
    letterSpacing: 0.3,
  },
  scrollView: {
    maxHeight: 280,
    borderRadius: 12,
    backgroundColor: '#EFF6FF',
    padding: 8,
  },
  selectorItem: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 10,
    marginBottom: 6,
  },
  selectedItem: {
    backgroundColor: '#2563EB',
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  selectorText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E3A8A',
    textAlign: 'center',
    letterSpacing: 0.2,
  },
  selectedText: {
    color: '#fff',
    fontWeight: '700',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#EFF6FF',
    borderWidth: 2,
    borderColor: '#2563EB',
  },
  cancelButtonText: {
    color: '#2563EB',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  applyButton: {
    backgroundColor: '#2563EB',
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 4,
  },
  applyButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
});

export default MonthYearPicker;

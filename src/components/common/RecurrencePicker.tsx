import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, ScrollView, Platform } from 'react-native';
import { RecurrenceRule, RecurrenceFrequency } from '../../types';
import { ENABLE_GLASS_UI, ENABLE_IOS_NATIVE_PILOT } from '../../theme/flags';
import { GlassSurface } from '../ui/GlassSurface';
import { colors, elevation, radius, spacing } from '../../theme/tokens';

interface RecurrencePickerProps {
  visible: boolean;
  recurrence: RecurrenceRule;
  onClose: () => void;
  onSave: (recurrence: RecurrenceRule) => void;
}

const RecurrencePicker: React.FC<RecurrencePickerProps> = ({ visible, recurrence, onClose, onSave }) => {
  const useIosPilot = ENABLE_GLASS_UI && ENABLE_IOS_NATIVE_PILOT && Platform.OS === 'ios';
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
      <View style={styles.overlay}>
        {useIosPilot ? (
          <GlassSurface style={styles.container} intensity={42}>
            <View style={styles.header}>
              <Text style={styles.headerTitle}>Repeat</Text>
              <TouchableOpacity
                onPress={onClose}
                accessibilityRole="button"
                accessibilityLabel="Close repeat picker"
                style={styles.closeButton}
              >
                <Text style={styles.closeButtonText}>×</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
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
          </GlassSurface>
        ) : (
          <View style={styles.container}>
            <View style={styles.header}>
              <Text style={styles.headerTitle}>Repeat</Text>
              <TouchableOpacity
                onPress={onClose}
                accessibilityRole="button"
                accessibilityLabel="Close repeat picker"
                style={styles.closeButton}
              >
                <Text style={styles.closeButtonText}>×</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
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
          </View>
        )}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: colors.overlayBackdrop,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg + spacing.xs,
  },
  container: {
    backgroundColor: colors.surfaceSolid,
    borderRadius: radius.lg - spacing.xs,
    width: '90%',
    maxWidth: 400,
    maxHeight: '70%',
    minHeight: 260,
    ...elevation.floating,
  },
  header: {
    backgroundColor: colors.brandPrimary,
    paddingVertical: spacing.lg + spacing.xs,
    paddingHorizontal: spacing.lg + spacing.xs,
    borderTopLeftRadius: radius.lg - spacing.xs,
    borderTopRightRadius: radius.lg - spacing.xs,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.textOnBrand,
    letterSpacing: 0.3,
  },
  closeButton: {
    position: 'absolute',
    right: 12,
    top: 12,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonText: {
    color: colors.textOnBrand,
    fontSize: 26,
    lineHeight: 28,
    fontWeight: '700',
  },
  content: {
    flexGrow: 0,
  },
  contentContainer: {
    paddingBottom: 12,
  },
  section: {
    padding: spacing.lg + spacing.xs,
  },
  option: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSubtle,
  },
  optionText: {
    fontSize: 16,
    color: colors.brandInk,
    letterSpacing: 0.2,
  },
  selectedOptionText: {
    fontWeight: '700',
    color: colors.brandPrimary,
  },
  checkmark: {
    fontSize: 18,
    color: colors.brandPrimary,
    fontWeight: '700',
  },
});

export default RecurrencePicker;

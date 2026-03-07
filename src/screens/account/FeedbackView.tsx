import React, { useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { colors, spacing } from '../../theme/tokens';

interface FeedbackViewProps {
  onBack: () => void;
}

const FeedbackView: React.FC<FeedbackViewProps> = ({ onBack }) => {
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = () => {
    if (!subject.trim() || !message.trim()) {
      Alert.alert('Missing details', 'Please enter both a subject and message.');
      return;
    }

    Alert.alert('Thanks for the feedback', 'Your message has been captured for review.');
    setSubject('');
    setMessage('');
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.headerButton}>
          <Text style={styles.headerButtonText}>Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Send Feedback</Text>
        <View style={styles.headerButton} />
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>Help us improve Kalapa Calendar</Text>
        <Text style={styles.body}>
          Share bugs, ideas, or requests. Fill this out and we can route feedback in a later backend step.
        </Text>

        <TextInput
          placeholder="Subject"
          placeholderTextColor={colors.textMuted}
          style={styles.input}
          value={subject}
          onChangeText={setSubject}
        />
        <TextInput
          placeholder="Message"
          placeholderTextColor={colors.textMuted}
          style={[styles.input, styles.messageInput]}
          value={message}
          onChangeText={setMessage}
          multiline
        />

        <TouchableOpacity style={styles.primaryButton} onPress={handleSubmit}>
          <Text style={styles.primaryButtonText}>Submit Feedback</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bgSubtle },
  header: {
    alignItems: 'center',
    backgroundColor: colors.brandPrimary,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  headerTitle: { color: colors.textOnBrand, fontSize: 18, fontWeight: '700' },
  headerButton: { minWidth: 72, paddingVertical: spacing.xs },
  headerButtonText: { color: colors.textOnBrand, fontSize: 16, fontWeight: '600' },
  content: { flex: 1, padding: spacing.lg },
  title: {
    color: colors.textPrimary,
    fontSize: 22,
    fontWeight: '700',
    marginBottom: spacing.sm,
  },
  body: {
    color: colors.textMuted,
    fontSize: 15,
    lineHeight: 22,
    marginBottom: spacing.xl,
  },
  input: {
    backgroundColor: colors.surfaceSolid,
    borderColor: colors.borderInput,
    borderRadius: 12,
    borderWidth: 1,
    color: colors.textPrimary,
    marginBottom: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  messageInput: {
    minHeight: 140,
    textAlignVertical: 'top',
  },
  primaryButton: {
    alignItems: 'center',
    backgroundColor: colors.brandPrimary,
    borderRadius: 12,
    marginBottom: spacing.md,
    paddingVertical: spacing.md,
  },
  primaryButtonText: { color: colors.textOnBrand, fontSize: 16, fontWeight: '700' },
});

export default FeedbackView;

import React, { useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { colors, spacing } from '../../theme/tokens';
import { AuthUser } from '../../types';
import { submitFeedback } from '../../utils/feedback';

interface FeedbackViewProps {
  onBack: () => void;
  user: AuthUser | null;
}

const FeedbackView: React.FC<FeedbackViewProps> = ({ onBack, user }) => {
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (isSubmitting) {
      return;
    }

    if (!subject.trim() || !message.trim()) {
      Alert.alert('Missing details', 'Please enter both a subject and message.');
      return;
    }

    try {
      setIsSubmitting(true);
      await submitFeedback({
        message,
        subject,
        user,
      });
      Alert.alert('Thanks for the feedback', 'Your feedback was sent successfully.');
      setSubject('');
      setMessage('');
    } catch (error) {
      const fallback = 'Could not send feedback right now. Please try again shortly.';
      Alert.alert('Submit failed', error instanceof Error ? error.message : fallback);
    } finally {
      setIsSubmitting(false);
    }
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
          Share bugs, ideas, or requests. Feedback is submitted securely to our review queue.
        </Text>

        <TextInput
          placeholder="Subject"
          placeholderTextColor={colors.textMuted}
          style={styles.input}
          value={subject}
          onChangeText={setSubject}
          editable={!isSubmitting}
        />
        <TextInput
          placeholder="Message"
          placeholderTextColor={colors.textMuted}
          style={[styles.input, styles.messageInput]}
          value={message}
          onChangeText={setMessage}
          multiline
          editable={!isSubmitting}
        />

        <TouchableOpacity
          style={[styles.primaryButton, isSubmitting && styles.primaryButtonDisabled]}
          onPress={handleSubmit}
          testID="submit-feedback"
          disabled={isSubmitting}
        >
          <Text style={styles.primaryButtonText}>{isSubmitting ? 'Sending…' : 'Submit Feedback'}</Text>
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
  primaryButtonDisabled: {
    opacity: 0.7,
  },
  primaryButtonText: { color: colors.textOnBrand, fontSize: 16, fontWeight: '700' },
});

export default FeedbackView;

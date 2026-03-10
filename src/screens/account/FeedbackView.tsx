import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { GlassSurface } from '../../components/ui/GlassSurface';
import { ENABLE_GLASS_UI } from '../../theme/flags';
import { colors, elevation, spacing } from '../../theme/tokens';
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
  const useGlass = ENABLE_GLASS_UI;
  const dayPattern = require('../../../assets/day-view-pattern.png');

  const headerOpacity = useRef(new Animated.Value(0)).current;
  const headerTranslate = useRef(new Animated.Value(-16)).current;
  const cardAnims = useRef([new Animated.Value(0), new Animated.Value(0)]).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(headerOpacity, {
        duration: 280,
        toValue: 1,
        useNativeDriver: true,
      }),
      Animated.timing(headerTranslate, {
        duration: 280,
        toValue: 0,
        useNativeDriver: true,
      }),
    ]).start();

    Animated.stagger(
      85,
      cardAnims.map((anim) =>
        Animated.timing(anim, {
          duration: 260,
          toValue: 1,
          useNativeDriver: true,
        })
      )
    ).start();
  }, [cardAnims, headerOpacity, headerTranslate]);

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

  const introAnimStyle = {
    opacity: cardAnims[0],
    transform: [
      {
        translateY: cardAnims[0].interpolate({
          inputRange: [0, 1],
          outputRange: [18, 0],
        }),
      },
    ],
  };

  const formAnimStyle = {
    opacity: cardAnims[1],
    transform: [
      {
        translateY: cardAnims[1].interpolate({
          inputRange: [0, 1],
          outputRange: [18, 0],
        }),
      },
    ],
  };

  const IntroCard = () =>
    useGlass ? (
      <GlassSurface style={styles.card} intensity={42} contentStyle={styles.cardInner}>
        <Text style={styles.title}>Help us improve Kalapa Calendar</Text>
        <Text style={styles.body}>
          Share bugs, ideas, or requests. Feedback is submitted securely to our review queue.
        </Text>
      </GlassSurface>
    ) : (
      <View style={[styles.card, styles.fallbackCard]}>
        <Text style={styles.title}>Help us improve Kalapa Calendar</Text>
        <Text style={styles.body}>
          Share bugs, ideas, or requests. Feedback is submitted securely to our review queue.
        </Text>
      </View>
    );

  const FormCard = () =>
    useGlass ? (
      <GlassSurface style={styles.card} intensity={42} contentStyle={styles.cardInner}>
        <TextInput
          placeholder="Subject"
          placeholderTextColor={colors.textSecondary}
          style={styles.input}
          value={subject}
          onChangeText={setSubject}
          editable={!isSubmitting}
        />
        <TextInput
          placeholder="Message"
          placeholderTextColor={colors.textSecondary}
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
      </GlassSurface>
    ) : (
      <View style={[styles.card, styles.fallbackCard]}>
        <TextInput
          placeholder="Subject"
          placeholderTextColor={colors.textSecondary}
          style={styles.input}
          value={subject}
          onChangeText={setSubject}
          editable={!isSubmitting}
        />
        <TextInput
          placeholder="Message"
          placeholderTextColor={colors.textSecondary}
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
    );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 24 : 0}
    >
      <Image
        source={dayPattern}
        style={styles.backgroundPattern}
        resizeMode="cover"
        testID="feedback-background-pattern"
      />

      <Animated.View
        style={[
          styles.header,
          {
            opacity: headerOpacity,
            transform: [{ translateY: headerTranslate }],
          },
        ]}
      >
        <TouchableOpacity onPress={onBack} style={styles.headerButton}>
          <Text style={styles.headerButtonText}>Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Send Feedback</Text>
        <View style={styles.headerButton} />
      </Animated.View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="none"
        automaticallyAdjustKeyboardInsets
      >
        <Animated.View style={introAnimStyle} testID="feedback-intro-card">
          <IntroCard />
        </Animated.View>

        <Animated.View style={formAnimStyle} testID="feedback-form-card">
          <FormCard />
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.bgSubtle,
    flex: 1,
  },
  backgroundPattern: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.25,
    transform: [{ translateX: -120 }, { translateY: -180 }, { scale: 1 }],
  },
  header: {
    alignItems: 'center',
    backgroundColor: colors.brandPrimary,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    ...elevation.card,
  },
  headerTitle: {
    color: colors.textOnBrand,
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  headerButton: {
    minWidth: 72,
    paddingVertical: spacing.xs,
  },
  headerButtonText: {
    color: colors.textOnBrand,
    fontSize: 16,
    fontWeight: '600',
  },
  scroll: {
    flex: 1,
  },
  content: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
    rowGap: spacing.md,
  },
  card: {
    marginBottom: spacing.md,
    padding: spacing.lg,
  },
  cardInner: {
    rowGap: spacing.sm,
  },
  fallbackCard: {
    backgroundColor: colors.surfaceSolid,
    borderColor: colors.borderSubtle,
    borderRadius: 18,
    borderWidth: 1,
    ...elevation.card,
  },
  title: {
    color: colors.brandPrimaryDark,
    fontSize: 22,
    fontWeight: '700',
    marginBottom: spacing.xs,
  },
  body: {
    color: colors.textSecondary,
    fontSize: 15,
    lineHeight: 22,
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
    marginBottom: spacing.xs,
    paddingVertical: spacing.md,
  },
  primaryButtonDisabled: {
    opacity: 0.7,
  },
  primaryButtonText: {
    color: colors.textOnBrand,
    fontSize: 16,
    fontWeight: '700',
  },
});

export default FeedbackView;

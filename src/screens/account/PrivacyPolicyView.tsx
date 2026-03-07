import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors, spacing } from '../../theme/tokens';

interface PrivacyPolicyViewProps {
  onBack: () => void;
}

const PrivacyPolicyView: React.FC<PrivacyPolicyViewProps> = ({ onBack }) => {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.headerButton}>
          <Text style={styles.headerButtonText}>Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Privacy Policy</Text>
        <View style={styles.headerButton} />
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.updatedText}>Last updated: March 7, 2026</Text>
        <Text style={styles.heading}>What we store</Text>
        <Text style={styles.body}>
          The app stores your account session token and local calendar preferences on your device. Notification settings
          and your personal calendar events are saved locally unless synced through your account.
        </Text>
        <Text style={styles.heading}>How we use data</Text>
        <Text style={styles.body}>
          Account credentials are used to authenticate with Kalapa Media services. Event and reminder data is used only
          to render your calendar and notifications.
        </Text>
        <Text style={styles.heading}>Your controls</Text>
        <Text style={styles.body}>
          You can sign out at any time from Account. You can also disable notifications in the Account settings section.
        </Text>
      </ScrollView>
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
  content: { padding: spacing.lg },
  updatedText: { color: colors.textMuted, marginBottom: spacing.md },
  heading: {
    color: colors.textPrimary,
    fontSize: 18,
    fontWeight: '700',
    marginBottom: spacing.xs,
    marginTop: spacing.md,
  },
  body: {
    color: colors.textMuted,
    fontSize: 15,
    lineHeight: 22,
  },
});

export default PrivacyPolicyView;

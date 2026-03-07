import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors, spacing } from '../../theme/tokens';

interface TermsOfServiceViewProps {
  onBack: () => void;
}

const TermsOfServiceView: React.FC<TermsOfServiceViewProps> = ({ onBack }) => {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.headerButton}>
          <Text style={styles.headerButtonText}>Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Terms of Service</Text>
        <View style={styles.headerButton} />
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.updatedText}>Last updated: March 7, 2026</Text>
        <Text style={styles.heading}>Use of the app</Text>
        <Text style={styles.body}>
          Kalapa Calendar is provided for personal spiritual practice and event planning. You agree to use the app in a
          lawful manner and not interfere with service availability.
        </Text>
        <Text style={styles.heading}>Account responsibility</Text>
        <Text style={styles.body}>
          You are responsible for keeping your account credentials secure. If you suspect unauthorized access, sign out
          and update your password on Kalapa Media.
        </Text>
        <Text style={styles.heading}>Content access</Text>
        <Text style={styles.body}>
          Member-only content availability is controlled by your Kalapa Media membership level and related access rules.
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

export default TermsOfServiceView;

import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, TextInput, ActivityIndicator, Platform } from 'react-native';
import { NotificationSettings, AuthUser } from '../../types';
import { login, logout } from '../../utils/auth';
import { ENABLE_GLASS_UI } from '../../theme/flags';
import { GlassSurface } from '../../components/ui/GlassSurface';
import { colors, elevation, spacing } from '../../theme/tokens';

interface AccountViewProps {
  notificationSettings: NotificationSettings;
  onUpdateNotificationSettings: (settings: NotificationSettings) => void;
  settingsReady?: boolean;
  user: AuthUser | null;
  onUserChange: (user: AuthUser | null) => void;
  onOpenRecordings: () => void;
  onOpenPrivacyPolicy: () => void;
  onOpenTermsOfService: () => void;
  onOpenFeedback: () => void;
}

const AccountView: React.FC<AccountViewProps> = ({
  notificationSettings,
  onUpdateNotificationSettings,
  settingsReady = true,
  user,
  onUserChange,
  onOpenRecordings,
  onOpenPrivacyPolicy,
  onOpenTermsOfService,
  onOpenFeedback,
}) => {
  const useIosPilot = ENABLE_GLASS_UI && Platform.OS === 'ios';
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [eventMinutesInput, setEventMinutesInput] = useState(`${notificationSettings.eventReminderMinutes}`);
  const [allDayHoursInput, setAllDayHoursInput] = useState(`${notificationSettings.allDayReminderHours}`);
  const [eventMinutesError, setEventMinutesError] = useState<string | null>(null);
  const [allDayHoursError, setAllDayHoursError] = useState<string | null>(null);

  useEffect(() => {
    setEventMinutesInput(`${notificationSettings.eventReminderMinutes}`);
    setAllDayHoursInput(`${notificationSettings.allDayReminderHours}`);
    setEventMinutesError(null);
    setAllDayHoursError(null);
  }, [notificationSettings.eventReminderMinutes, notificationSettings.allDayReminderHours]);

  const updateSetting = (key: keyof NotificationSettings, value: boolean) => {
    onUpdateNotificationSettings({
      ...notificationSettings,
      [key]: value,
    });
  };

  const updateNumberSetting = (
    key: 'eventReminderMinutes' | 'allDayReminderHours',
    value: string,
    min: number,
    max: number
  ) => {
    const parsed = Number.parseInt(value, 10);
    if (Number.isNaN(parsed)) {
      const message = 'Enter a number';
      if (key === 'eventReminderMinutes') {
        setEventMinutesError(message);
      } else {
        setAllDayHoursError(message);
      }
      return;
    }

    if (parsed < min || parsed > max) {
      const message = `Use ${min}-${max}`;
      if (key === 'eventReminderMinutes') {
        setEventMinutesError(message);
      } else {
        setAllDayHoursError(message);
      }
      return;
    }

    if (key === 'eventReminderMinutes') {
      setEventMinutesError(null);
    } else {
      setAllDayHoursError(null);
    }

    onUpdateNotificationSettings({
      ...notificationSettings,
      [key]: parsed,
    });
  };

  const handleSignIn = async () => {
    if (!username.trim() || !password) {
      setAuthError('Please enter your username and password.');
      return;
    }
    setAuthLoading(true);
    setAuthError(null);
    try {
      const loggedInUser = await login(username.trim(), password);
      onUserChange(loggedInUser);
      setUsername('');
      setPassword('');
    } catch (err: unknown) {
      setAuthError(err instanceof Error ? err.message : 'Sign in failed. Please try again.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleSignOut = async () => {
    await logout();
    onUserChange(null);
    setAuthError(null);
  };

  const renderCard = (children: React.ReactNode) => {
    if (useIosPilot) {
      return (
        <View style={styles.cardWrapper}>
          <GlassSurface style={styles.card} intensity={40}>
            {children}
          </GlassSurface>
        </View>
      );
    }

    return <View style={styles.card}>{children}</View>;
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Account</Text>
      </View>

      {/* Content */}
      <ScrollView style={styles.content}>
        {/* Login/Sign Up Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Profile</Text>
          {renderCard(
            <>
            {user ? (
              <>
                <Text style={styles.cardText}>Signed in as</Text>
                <Text style={styles.userDisplayName}>{user.displayName}</Text>
                <Text style={styles.userEmail}>@{user.email}</Text>
                <TouchableOpacity style={styles.secondaryButton} onPress={handleSignOut}>
                  <Text style={styles.secondaryButtonText}>Sign Out</Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <Text style={styles.cardText}>Sign in to see member-level events.</Text>
                <TextInput
                  style={styles.authInput}
                  placeholder="Username"
                  placeholderTextColor={colors.textMutedSoft}
                  autoCapitalize="none"
                  keyboardType="default"
                  value={username}
                  onChangeText={setUsername}
                  editable={!authLoading}
                />
                <TextInput
                  style={[styles.authInput, styles.authInputSpaced]}
                  placeholder="Password"
                  placeholderTextColor={colors.textMutedSoft}
                  secureTextEntry
                  value={password}
                  onChangeText={setPassword}
                  editable={!authLoading}
                />
                {authError && <Text style={styles.authError}>{authError}</Text>}
                <TouchableOpacity
                  style={[styles.primaryButton, authLoading && styles.buttonDisabled]}
                  onPress={handleSignIn}
                  disabled={authLoading}
                >
                  {authLoading
                    ? <ActivityIndicator color={colors.white} />
                    : <Text style={styles.primaryButtonText}>Sign In</Text>
                  }
                </TouchableOpacity>
              </>
            )}
            <View style={styles.profileDivider} />
            <Text style={styles.cardText}>My Recordings</Text>
            <Text style={styles.settingDescription}>
              Open your Kalapa Media recordings library.
            </Text>
            <TouchableOpacity
              style={[styles.primaryButton, styles.recordingsButton]}
              onPress={onOpenRecordings}
              testID="open-recordings-button"
            >
              <Text style={styles.primaryButtonText}>Open My Recordings</Text>
            </TouchableOpacity>
            </>
          )}
        </View>

        {/* Notification Settings Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notifications</Text>
          {renderCard(
            <>
            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>Practice Day Reminders</Text>
                <Text style={styles.settingDescription}>
                  Get notified for regular practice and feast days
                </Text>
              </View>
              <Switch
                value={notificationSettings.practiceDayReminders}
                onValueChange={(value) => updateSetting('practiceDayReminders', value)}
                trackColor={{ false: colors.placeholder, true: colors.accentStrong }}
                thumbColor={colors.white}
                disabled={!settingsReady}
              />
            </View>

            <View style={[styles.settingRow, styles.settingRowBorder]}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>Event Reminders</Text>
                <Text style={styles.settingDescription}>
                  Get notified before your personal events
                </Text>
              </View>
              <Switch
                value={notificationSettings.eventReminders}
                onValueChange={(value) => updateSetting('eventReminders', value)}
                trackColor={{ false: colors.placeholder, true: colors.accentStrong }}
                thumbColor={colors.white}
                disabled={!settingsReady}
              />
            </View>

            <View style={[styles.settingRow, styles.settingRowBorder]}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>Daily Quote Notifications</Text>
                <Text style={styles.settingDescription}>
                  Receive a dharma quote each day
                </Text>
              </View>
              <Switch
                value={notificationSettings.dailyQuoteNotifications}
                onValueChange={(value) => updateSetting('dailyQuoteNotifications', value)}
                trackColor={{ false: colors.placeholder, true: colors.accentStrong }}
                thumbColor={colors.white}
                disabled={!settingsReady}
              />
            </View>

            <View style={[styles.settingRow, styles.settingRowBorder]}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>Event Reminder Lead Time</Text>
                <Text style={styles.settingDescription}>
                  Minutes before a timed event (default)
                </Text>
              </View>
              <TextInput
                style={styles.numberInput}
                keyboardType="number-pad"
                value={eventMinutesInput}
                onChangeText={(value) => {
                  setEventMinutesInput(value);
                  if (settingsReady) {
                    updateNumberSetting('eventReminderMinutes', value, 1, 1440);
                  }
                }}
                editable={settingsReady}
              />
            </View>
            {eventMinutesError && (
              <Text style={styles.inputError}>{eventMinutesError}</Text>
            )}

            <View style={[styles.settingRow, styles.settingRowBorder]}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>All-Day Reminder Lead Time</Text>
                <Text style={styles.settingDescription}>
                  Hours before the day starts (default)
                </Text>
              </View>
              <TextInput
                style={styles.numberInput}
                keyboardType="number-pad"
                value={allDayHoursInput}
                onChangeText={(value) => {
                  setAllDayHoursInput(value);
                  if (settingsReady) {
                    updateNumberSetting('allDayReminderHours', value, 1, 168);
                  }
                }}
                editable={settingsReady}
              />
            </View>
            {allDayHoursError && (
              <Text style={styles.inputError}>{allDayHoursError}</Text>
            )}
            </>
          )}
        </View>

        {/* About Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          {renderCard(
            <>
            <View style={styles.aboutRow}>
              <Text style={styles.aboutLabel}>Version</Text>
              <Text style={styles.aboutValue}>1.0.0</Text>
            </View>
            <View style={[styles.aboutRow, styles.settingRowBorder]}>
              <Text style={styles.aboutLabel}>App Name</Text>
              <Text style={styles.aboutValue}>Kalapa Calendar</Text>
            </View>
            <TouchableOpacity style={[styles.aboutRow, styles.settingRowBorder]} onPress={onOpenPrivacyPolicy} testID="open-privacy-policy">
              <Text style={styles.aboutLabel}>Privacy Policy</Text>
              <Text style={styles.linkText}>View →</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.aboutRow, styles.settingRowBorder]} onPress={onOpenTermsOfService} testID="open-terms-of-service">
              <Text style={styles.aboutLabel}>Terms of Service</Text>
              <Text style={styles.linkText}>View →</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.aboutRow, styles.settingRowBorder]} onPress={onOpenFeedback} testID="open-feedback">
              <Text style={styles.aboutLabel}>Send Feedback</Text>
              <Text style={styles.linkText}>Open →</Text>
            </TouchableOpacity>
            </>
          )}
        </View>

        {/* Footer info */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            A calendar app for Buddhist practice days and personal events
          </Text>
          <Text style={styles.footerSubtext}>
            Made with dedication to the dharma
          </Text>
        </View>
      </ScrollView>
    </View>
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
    paddingBottom: spacing.xl,
    paddingHorizontal: spacing.lg + spacing.xs,
    shadowColor: colors.brandPrimaryDark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.textOnBrand,
    letterSpacing: 0.3,
  },
  content: {
    flex: 1,
  },
  section: {
    marginTop: spacing.xl + spacing.xs,
    paddingHorizontal: spacing.lg + spacing.xs,
  },
  sectionTitle: {
    fontSize: 19,
    fontWeight: '700',
    color: colors.brandPrimaryDark,
    marginBottom: 14,
    letterSpacing: 0.3,
  },
  card: {
    backgroundColor: colors.surfaceSolid,
    borderRadius: 16,
    padding: 20,
    ...elevation.card,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  cardWrapper: {
    borderRadius: 16,
  },
  cardText: {
    fontSize: 15,
    lineHeight: 23,
    color: colors.brandInk,
    marginBottom: 20,
    letterSpacing: 0.2,
  },
  profileDivider: {
    height: 1,
    backgroundColor: colors.borderSubtle,
    marginVertical: spacing.lg,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 14,
  },
  primaryButton: {
    flex: 1,
    backgroundColor: colors.brandPrimary,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: colors.brandPrimary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 4,
  },
  primaryButtonText: {
    color: colors.textOnBrand,
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: colors.bgSubtle,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.brandPrimary,
  },
  recordingsButton: {
    marginTop: spacing.sm,
  },
  secondaryButtonText: {
    color: colors.brandPrimary,
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
  },
  settingRowBorder: {
    borderTopWidth: 1,
    borderTopColor: colors.borderSubtle,
    marginTop: 4,
  },
  settingInfo: {
    flex: 1,
    marginRight: 20,
  },
  numberInput: {
    minWidth: 64,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: colors.borderInput,
    borderRadius: 10,
    backgroundColor: colors.bgSubtle,
    color: colors.brandInk,
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
  },
  inputError: {
    marginTop: 4,
    marginBottom: 8,
    color: colors.error,
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.brandInk,
    marginBottom: 6,
    letterSpacing: 0.2,
  },
  settingDescription: {
    fontSize: 13,
    lineHeight: 20,
    color: colors.textMuted,
    letterSpacing: 0.1,
  },
  aboutRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
  },
  aboutLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.brandInk,
    letterSpacing: 0.2,
  },
  aboutValue: {
    fontSize: 16,
    color: colors.textMuted,
    letterSpacing: 0.1,
  },
  userDisplayName: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.brandInk,
    marginBottom: 4,
    letterSpacing: 0.2,
  },
  userEmail: {
    fontSize: 14,
    color: colors.textMuted,
    marginBottom: 20,
    letterSpacing: 0.1,
  },
  authInput: {
    borderWidth: 1,
    borderColor: colors.borderInput,
    borderRadius: 10,
    backgroundColor: colors.bgSubtle,
    color: colors.brandInk,
    paddingVertical: 12,
    paddingHorizontal: 14,
    fontSize: 15,
    marginBottom: 0,
  },
  authInputSpaced: {
    marginTop: 10,
    marginBottom: 14,
  },
  authError: {
    color: colors.error,
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 12,
    letterSpacing: 0.2,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  linkText: {
    fontSize: 16,
    color: colors.brandPrimary,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  footer: {
    padding: 28,
    alignItems: 'center',
    marginTop: 8,
  },
  footerText: {
    fontSize: 14,
    lineHeight: 22,
    color: colors.textMuted,
    textAlign: 'center',
    marginBottom: 10,
    letterSpacing: 0.2,
  },
  footerSubtext: {
    fontSize: 13,
    lineHeight: 20,
    color: colors.textMutedSoft,
    fontStyle: 'italic',
    textAlign: 'center',
    letterSpacing: 0.3,
  },
});

export default AccountView;

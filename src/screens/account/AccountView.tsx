import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, TextInput } from 'react-native';
import { NotificationSettings } from '../../types';

interface AccountViewProps {
  notificationSettings: NotificationSettings;
  onUpdateNotificationSettings: (settings: NotificationSettings) => void;
  settingsReady?: boolean;
}

const AccountView: React.FC<AccountViewProps> = ({
  notificationSettings,
  onUpdateNotificationSettings,
  settingsReady = true,
}) => {
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
          <View style={styles.card}>
            <Text style={styles.cardText}>Sign in to sync your events across devices</Text>
            <View style={styles.buttonRow}>
              <TouchableOpacity style={styles.primaryButton}>
                <Text style={styles.primaryButtonText}>Sign In</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.secondaryButton}>
                <Text style={styles.secondaryButtonText}>Create Account</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Notification Settings Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notifications</Text>
          <View style={styles.card}>
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
                trackColor={{ false: '#BFDBFE', true: '#F59E0B' }}
                thumbColor="#fff"
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
                trackColor={{ false: '#BFDBFE', true: '#F59E0B' }}
                thumbColor="#fff"
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
                trackColor={{ false: '#BFDBFE', true: '#F59E0B' }}
                thumbColor="#fff"
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
          </View>
        </View>

        {/* About Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          <View style={styles.card}>
            <View style={styles.aboutRow}>
              <Text style={styles.aboutLabel}>Version</Text>
              <Text style={styles.aboutValue}>1.0.0</Text>
            </View>
            <View style={[styles.aboutRow, styles.settingRowBorder]}>
              <Text style={styles.aboutLabel}>App Name</Text>
              <Text style={styles.aboutValue}>Kalapa Calendar</Text>
            </View>
            <TouchableOpacity style={[styles.aboutRow, styles.settingRowBorder]}>
              <Text style={styles.aboutLabel}>Privacy Policy</Text>
              <Text style={styles.linkText}>View →</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.aboutRow, styles.settingRowBorder]}>
              <Text style={styles.aboutLabel}>Terms of Service</Text>
              <Text style={styles.linkText}>View →</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.aboutRow, styles.settingRowBorder]}>
              <Text style={styles.aboutLabel}>Send Feedback</Text>
              <Text style={styles.linkText}>Email →</Text>
            </TouchableOpacity>
          </View>
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
    backgroundColor: '#EFF6FF',
  },
  header: {
    backgroundColor: '#2563EB',
    paddingTop: 20,
    paddingBottom: 24,
    paddingHorizontal: 20,
    shadowColor: '#1E40AF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: 0.3,
  },
  content: {
    flex: 1,
  },
  section: {
    marginTop: 28,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 19,
    fontWeight: '700',
    color: '#1E40AF',
    marginBottom: 14,
    letterSpacing: 0.3,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: 'rgba(37, 99, 235, 0.08)',
  },
  cardText: {
    fontSize: 15,
    lineHeight: 23,
    color: '#1E3A8A',
    marginBottom: 20,
    letterSpacing: 0.2,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 14,
  },
  primaryButton: {
    flex: 1,
    backgroundColor: '#2563EB',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 4,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: '#EFF6FF',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#2563EB',
  },
  secondaryButtonText: {
    color: '#2563EB',
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
    borderTopColor: 'rgba(37, 99, 235, 0.08)',
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
    borderColor: 'rgba(37, 99, 235, 0.2)',
    borderRadius: 10,
    backgroundColor: '#EFF6FF',
    color: '#1E3A8A',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
  },
  inputError: {
    marginTop: 4,
    marginBottom: 8,
    color: '#B91C1C',
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E3A8A',
    marginBottom: 6,
    letterSpacing: 0.2,
  },
  settingDescription: {
    fontSize: 13,
    lineHeight: 20,
    color: '#60A5FA',
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
    color: '#1E3A8A',
    letterSpacing: 0.2,
  },
  aboutValue: {
    fontSize: 16,
    color: '#60A5FA',
    letterSpacing: 0.1,
  },
  linkText: {
    fontSize: 16,
    color: '#2563EB',
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
    color: '#60A5FA',
    textAlign: 'center',
    marginBottom: 10,
    letterSpacing: 0.2,
  },
  footerSubtext: {
    fontSize: 13,
    lineHeight: 20,
    color: '#93C5FD',
    fontStyle: 'italic',
    textAlign: 'center',
    letterSpacing: 0.3,
  },
});

export default AccountView;

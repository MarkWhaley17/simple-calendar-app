import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch } from 'react-native';

const AccountView: React.FC = () => {
  // Notification settings state
  const [practiceDayReminders, setPracticeDayReminders] = useState(true);
  const [eventReminders, setEventReminders] = useState(true);
  const [dailyQuoteNotifications, setDailyQuoteNotifications] = useState(false);

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
                  Get notified for Medicine Buddha Day, Protector Day, and Guru Rinpoche Day
                </Text>
              </View>
              <Switch
                value={practiceDayReminders}
                onValueChange={setPracticeDayReminders}
                trackColor={{ false: '#BFDBFE', true: '#F59E0B' }}
                thumbColor="#fff"
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
                value={eventReminders}
                onValueChange={setEventReminders}
                trackColor={{ false: '#BFDBFE', true: '#F59E0B' }}
                thumbColor="#fff"
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
                value={dailyQuoteNotifications}
                onValueChange={setDailyQuoteNotifications}
                trackColor={{ false: '#BFDBFE', true: '#F59E0B' }}
                thumbColor="#fff"
              />
            </View>
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
              <Text style={styles.aboutValue}>Dharma Calendar</Text>
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
    paddingTop: 16,
    paddingBottom: 20,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1E40AF',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#fff',
  },
  content: {
    flex: 1,
  },
  section: {
    marginTop: 24,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E40AF',
    marginBottom: 12,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  cardText: {
    fontSize: 15,
    color: '#1E3A8A',
    marginBottom: 16,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  primaryButton: {
    flex: 1,
    backgroundColor: '#2563EB',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: '#EFF6FF',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2563EB',
  },
  secondaryButtonText: {
    color: '#2563EB',
    fontSize: 16,
    fontWeight: '600',
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  settingRowBorder: {
    borderTopWidth: 1,
    borderTopColor: '#EFF6FF',
  },
  settingInfo: {
    flex: 1,
    marginRight: 16,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E3A8A',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 13,
    color: '#60A5FA',
  },
  aboutRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
  },
  aboutLabel: {
    fontSize: 16,
    color: '#1E3A8A',
  },
  aboutValue: {
    fontSize: 16,
    color: '#60A5FA',
  },
  linkText: {
    fontSize: 16,
    color: '#2563EB',
    fontWeight: '500',
  },
  footer: {
    padding: 24,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: '#60A5FA',
    textAlign: 'center',
    marginBottom: 8,
  },
  footerSubtext: {
    fontSize: 12,
    color: '#93C5FD',
    fontStyle: 'italic',
    textAlign: 'center',
  },
});

export default AccountView;

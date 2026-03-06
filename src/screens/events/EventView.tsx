import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Linking, Alert } from 'react-native';
import { CalendarEvent } from '../../types';
import { MONTH_NAMES } from '../../constants/dates';
import { colors, elevation, spacing } from '../../theme/tokens';

interface EventViewProps {
  event: CalendarEvent;
  onBack: () => void;
  onEdit?: () => void;
}

const EventView: React.FC<EventViewProps> = ({ event, onBack, onEdit }) => {
  // Support both new and legacy event structures
  const eventDate = event.fromDate || event.date || new Date();
  const eventTime = event.fromTime || event.startTime;

  const monthName = MONTH_NAMES[eventDate.getMonth()];
  const dayNumber = eventDate.getDate();
  const year = eventDate.getFullYear();

  const handleLinkPress = async (url: string) => {
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        Alert.alert('Error', `Unable to open this link: ${url}`);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to open link');
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={onBack}
            activeOpacity={0.7}
          >
            <Text style={styles.backButtonText}>‹ Back</Text>
          </TouchableOpacity>
          {onEdit && (
            <TouchableOpacity
              style={styles.editButton}
              onPress={onEdit}
              activeOpacity={0.7}
            >
              <Text style={styles.editButtonText}>Edit</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.eventInfo}>
          <Text style={styles.eventTitle}>{event.title}</Text>
          <Text style={styles.eventDate}>
            {monthName} {dayNumber}, {year}
            {eventTime && ` • ${eventTime}`}
          </Text>
        </View>
      </View>

      {/* Event Details */}
      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.descriptionText}>
            {event.description || 'No description available'}
          </Text>
        </View>

        {event.links && event.links.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Links</Text>
            {event.links.map((link, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => handleLinkPress(link)}
                activeOpacity={0.7}
              >
                <Text style={styles.linkText}>
                  {link}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
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
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  backButton: {
    paddingVertical: 8,
    paddingRight: 16,
  },
  backButtonText: {
    fontSize: 18,
    color: colors.accentStrong,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  editButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  editButtonText: {
    fontSize: 18,
    color: colors.accentStrong,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  eventInfo: {
    marginTop: 12,
  },
  eventTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.textOnBrand,
    letterSpacing: 0.3,
  },
  eventDate: {
    fontSize: 16,
    color: colors.textOnBrandMuted,
    marginTop: 6,
    letterSpacing: 0.3,
  },
  content: {
    flex: 1,
  },
  section: {
    backgroundColor: colors.surfaceSolid,
    padding: 24,
    marginTop: 1,
    ...elevation.card,
  },
  sectionTitle: {
    fontSize: 19,
    fontWeight: '700',
    color: colors.brandPrimaryDark,
    marginBottom: 14,
    letterSpacing: 0.3,
  },
  descriptionText: {
    fontSize: 16,
    lineHeight: 26,
    color: colors.brandInk,
    letterSpacing: 0.2,
  },
  linkText: {
    fontSize: 16,
    lineHeight: 26,
    color: colors.brandPrimary,
    marginBottom: 10,
    fontWeight: '600',
    letterSpacing: 0.2,
    textDecorationLine: 'underline',
  },
});

export default EventView;

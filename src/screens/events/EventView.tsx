import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform } from 'react-native';
import { CalendarEvent } from '../../types';
import { MONTH_NAMES } from '../../constants/dates';
import { ENABLE_GLASS_UI } from '../../theme/flags';
import { colors, elevation, spacing } from '../../theme/tokens';
import { GlassSurface } from '../../components/ui/GlassSurface';

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

  const useIosNativePilot = ENABLE_GLASS_UI && Platform.OS === 'ios';

  const renderSection = (title: string, content: React.ReactNode) => {
    if (useIosNativePilot) {
      return (
        <View style={styles.pilotSectionOuter}>
          <GlassSurface style={styles.pilotSection} intensity={46}>
            <Text style={styles.sectionTitle}>{title}</Text>
            {content}
          </GlassSurface>
        </View>
      );
    }

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{title}</Text>
        {content}
      </View>
    );
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
        {renderSection('Description', (
          <Text style={styles.descriptionText}>
            {event.description || 'No description available'}
          </Text>
        ))}

        {event.links && event.links.length > 0 && (
          renderSection('Notes', (
            <>
            {event.links.map((link, index) => (
              <Text key={index} style={styles.notesText}>
                {link}
              </Text>
            ))}
            </>
          ))
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
  pilotSectionOuter: {
    paddingHorizontal: spacing.lg + spacing.xs,
    paddingTop: spacing.sm,
  },
  pilotSection: {
    padding: spacing.xl,
    backgroundColor: colors.surfaceStrong,
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
  notesText: {
    fontSize: 16,
    lineHeight: 26,
    color: colors.brandInk,
    marginBottom: 10,
    fontWeight: '500',
    letterSpacing: 0.2,
  },
});

export default EventView;

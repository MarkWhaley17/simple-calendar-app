import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform, ImageBackground, Image } from 'react-native';
import { CalendarEvent } from '../../types';
import { ENABLE_GLASS_UI } from '../../theme/flags';
import { colors, elevation, spacing } from '../../theme/tokens';
import { GlassSurface } from '../../components/ui/GlassSurface';
import { isEventItem } from '../../utils/eventEditability';
import { formatFullDate, isSameDay } from '../../utils/dateHelpers';

interface EventViewProps {
  event: CalendarEvent;
  onBack: () => void;
  onEdit?: () => void;
  onAddNotes?: () => void;
}

const EventView: React.FC<EventViewProps> = ({ event, onBack, onEdit, onAddNotes }) => {
  // Support both new and legacy event structures
  const eventDate = event.fromDate || event.date || new Date();
  const eventEndDate = event.toDate || eventDate;
  const eventTime = event.fromTime || event.startTime;

  const useIosNativePilot = ENABLE_GLASS_UI && Platform.OS === 'ios';
  const imageMap: Record<string, any> = {
    'medicine-buddha.jpg': require('../../../assets/medicine-buddha.jpg'),
    'protector-day.jpg': require('../../../assets/protector-day.jpg'),
    'guru-rinpoche.jpg': require('../../../assets/guru-rinpoche.jpg'),
    'green-tara.jpg': require('../../../assets/green-tara.jpg'),
    'full-moon.png': require('../../../assets/full-moon.png'),
    'new-moon.png': require('../../../assets/new-moon.png'),
    'dakini.jpg': require('../../../assets/dakini.jpg'),
    'jambhala.jpg': require('../../../assets/jambhala.jpg'),
  };

  const titleLower = event.title.toLowerCase();
  let resolvedImageKey: string | undefined;
  if (event.image && imageMap[event.image]) {
    resolvedImageKey = event.image;
  } else if (titleLower.includes('full moon')) {
    resolvedImageKey = 'full-moon.png';
  } else if (titleLower.includes('new moon')) {
    resolvedImageKey = 'new-moon.png';
  } else if (titleLower.includes('dakini day')) {
    resolvedImageKey = 'dakini.jpg';
  } else if (titleLower.includes('jambhala day')) {
    resolvedImageKey = 'jambhala.jpg';
  } else if (titleLower.includes('guru rinpoche day')) {
    resolvedImageKey = 'guru-rinpoche.jpg';
  } else if (titleLower.includes('medicine buddha day')) {
    resolvedImageKey = 'medicine-buddha.jpg';
  } else if (titleLower.includes('tara day')) {
    resolvedImageKey = 'green-tara.jpg';
  } else if (titleLower.includes('protector day')) {
    resolvedImageKey = 'protector-day.jpg';
  }

  const headerBackground = resolvedImageKey
    ? imageMap[resolvedImageKey]
    : require('../../../assets/day-bg.jpg');
  const detailsBackground = require('../../../assets/day-view-pattern.png');
  const isEvent = isEventItem(event);
  const showsDateRange = !isSameDay(eventDate, eventEndDate);
  const eventDateLabel = showsDateRange
    ? `${formatFullDate(eventDate)} - ${formatFullDate(eventEndDate)}`
    : formatFullDate(eventDate);
  const actionLabel = isEvent ? 'Add Notes' : 'Edit';
  const actionHandler = isEvent ? onAddNotes : onEdit;

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
      <ImageBackground
        source={headerBackground}
        style={styles.headerBackground}
        resizeMode="cover"
        testID="event-view-header-image"
      >
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={onBack}
              activeOpacity={0.7}
            >
              <Text style={styles.backButtonText}>‹ Back</Text>
            </TouchableOpacity>
            {actionHandler && (
              <TouchableOpacity
                style={styles.editButton}
                onPress={actionHandler}
                activeOpacity={0.7}
              >
                <Text style={styles.backButtonText}>{actionLabel}</Text>
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.eventInfo}>
            <Text style={styles.eventTitle}>{event.title}</Text>
            <Text style={styles.eventDate}>
              {eventDateLabel}
              {!showsDateRange && eventTime && ` • ${eventTime}`}
            </Text>
          </View>
        </View>
      </ImageBackground>

      {/* Event Details */}
      <View style={styles.detailsBackground}>
        <Image source={detailsBackground} style={styles.detailsPatternImage} resizeMode="cover" />
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

          {event.accumulations !== undefined && (
            renderSection('Accumulations', (
              <Text style={styles.notesText}>{event.accumulations}</Text>
            ))
          )}
        </ScrollView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bgSubtle,
  },
  headerBackground: {
    width: '100%',
  },
  header: {
    backgroundColor: colors.brandOverlay,
    paddingTop: spacing.lg + spacing.xs,
    paddingBottom: spacing.xl,
    paddingHorizontal: spacing.lg + spacing.xs,
    minHeight: 144,
    justifyContent: 'flex-end',
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
  detailsBackground: {
    flex: 1,
    overflow: 'hidden',
  },
  detailsPatternImage: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.25,
    transform: [{ translateX: -120 }, { translateY: -180 }, { scale: 1 }],
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

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ImageBackground, Image, Platform } from 'react-native';
import { CalendarEvent } from '../../types';
import { DAY_NAMES, MONTH_NAMES } from '../../constants/dates';
import { ENABLE_GLASS_UI } from '../../theme/flags';
import { GlassSurface } from '../../components/ui/GlassSurface';
import { colors, elevation, spacing } from '../../theme/tokens';

interface DayViewProps {
  selectedDate: Date;
  onBack: () => void;
  events?: CalendarEvent[];
  onEventPress?: (event: CalendarEvent) => void;
  onAddEvent?: () => void;
  onChangeDate?: (date: Date) => void;
}

const DayView: React.FC<DayViewProps> = ({
  selectedDate,
  onBack,
  events = [],
  onEventPress,
  onAddEvent,
}) => {
  const useIosPilot = ENABLE_GLASS_UI && Platform.OS === 'ios';
  const dayName = DAY_NAMES[selectedDate.getDay()];
  const monthName = MONTH_NAMES[selectedDate.getMonth()];
  const dayNumber = selectedDate.getDate();
  const year = selectedDate.getFullYear();
  // Swipe handling is managed by the parent view.
  const toDateOnly = (date: Date) => new Date(date.getFullYear(), date.getMonth(), date.getDate());

  // Filter events for the selected date, including multi-day events
  const dayEvents = events.filter(event => {
    const start = event.fromDate || event.date || new Date();
    const end = event.toDate || start;
    const selectedDateOnly = toDateOnly(selectedDate);
    const startDateOnly = toDateOnly(start);
    const endDateOnly = toDateOnly(end);
    // Check if selectedDate is within the event's date range (inclusive)
    return (
      selectedDateOnly >= startDateOnly &&
      selectedDateOnly <= endDateOnly &&
      startDateOnly <= endDateOnly // sanity check
    );
  });

  // Sort events: all-day first, then by time
  const sortedEvents = [...dayEvents].sort((a, b) => {
    if (a.isAllDay && !b.isAllDay) return -1;
    if (!a.isAllDay && b.isAllDay) return 1;
    return 0;
  });

  // Map image filenames to static require calls
  const imageMap: Record<string, any> = {
    'medicine-buddha.jpg': require('../../../assets/medicine-buddha.jpg'),
    'protector-day.jpg': require('../../../assets/protector-day.jpg'),
    'guru-rinpoche.jpg': require('../../../assets/guru-rinpoche.jpg'),
    'full-moon.png': require('../../../assets/full-moon.png'),
    'new-moon.png': require('../../../assets/new-moon.png'),
    'dakini.jpg': require('../../../assets/dakini.jpg'),
    'jambhala.jpg': require('../../../assets/jambhala.jpg'),
    // Add more mappings as you add images
  };

  const getEventImageKey = (event: CalendarEvent): string | undefined => {
    if (event.image && imageMap[event.image]) {
      return event.image;
    }
    if (event.title.toLowerCase().includes('full moon')) {
      return 'full-moon.png';
    }
    if (event.title.toLowerCase().includes('new moon')) {
      return 'new-moon.png';
    }
    if (event.title.toLowerCase().includes('dakini day')) {
      return 'dakini.jpg';
    }
    if (event.title.toLowerCase().includes('jambhala day')) {
      return 'jambhala.jpg';
    }
    return undefined;
  };

  const eventWithImageKey = sortedEvents
    .map(getEventImageKey)
    .find((key): key is string => Boolean(key));

  const headerBackground = eventWithImageKey
    ? imageMap[eventWithImageKey]
    : require('../../../assets/day-bg.jpg');
  const eventsBackground = require('../../../assets/day-view-pattern.png');

  const formatDateRange = (start: Date, end: Date) => {
    const startMonth = MONTH_NAMES[start.getMonth()];
    const endMonth = MONTH_NAMES[end.getMonth()];
    return `${startMonth} ${start.getDate()} - ${endMonth} ${end.getDate()}`;
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <ImageBackground
        source={headerBackground}
        style={styles.headerBackground}
        resizeMode="cover"
        testID="day-view-header-image"
      >
        <View style={styles.headerOverlay}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={onBack}
            activeOpacity={0.7}
          >
            <Text style={styles.backButtonText}>‹ Back</Text>
          </TouchableOpacity>

          <View style={styles.dateInfo}>
            <Text style={styles.dayName}>{dayName}</Text>
            <Text style={styles.fullDate}>
              {monthName} {dayNumber}, {year}
            </Text>
          </View>
        </View>
      </ImageBackground>

      {/* Events list */}
      <View style={styles.eventsBackground}>
        <Image
          source={eventsBackground}
          style={styles.eventsPatternImage}
          resizeMode="cover"
          testID="day-view-events-background"
        />
        <ScrollView style={styles.eventsContainer}>
          {sortedEvents.length > 0 ? (
            <View style={styles.eventsList}>
              {sortedEvents.map((event) => {
                const start = event.fromDate || event.date || selectedDate;
                const end = event.toDate || start;
                const isMultiDayAllDay = Boolean(event.isAllDay && start < end);
                const eventTime = isMultiDayAllDay
                  ? formatDateRange(start, end)
                  : (event.isAllDay ? 'All Day' : (event.fromTime || event.startTime || ''));

                return (
                  <TouchableOpacity
                    key={event.id}
                    style={styles.eventCardTouchable}
                    onPress={() => onEventPress && onEventPress(event)}
                    activeOpacity={0.8}
                  >
                    {useIosPilot ? (
                      <GlassSurface style={styles.eventCard} intensity={38}>
                        <Text style={styles.eventTitle}>{event.title}</Text>
                        {eventTime && (
                          <Text style={styles.eventTime}>{eventTime}</Text>
                        )}
                      </GlassSurface>
                    ) : (
                      <View style={styles.eventCard}>
                        <Text style={styles.eventTitle}>{event.title}</Text>
                        {eventTime && (
                          <Text style={styles.eventTime}>{eventTime}</Text>
                        )}
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>No events for this day</Text>
            </View>
          )}
        </ScrollView>
      </View>

      {/* Add event button */}
      <TouchableOpacity
        style={styles.addButton}
        activeOpacity={0.8}
        onPress={onAddEvent}
      >
        <Text style={styles.addButtonText}>+ Add Event</Text>
      </TouchableOpacity>
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
  headerOverlay: {
    backgroundColor: colors.brandOverlay,
    paddingTop: spacing.lg + spacing.xs,
    paddingBottom: spacing.xl,
    paddingHorizontal: spacing.lg + spacing.xs,
    shadowColor: colors.brandPrimaryDark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  backButton: {
    alignSelf: 'flex-start',
    paddingVertical: 8,
    paddingRight: 16,
  },
  backButtonText: {
    fontSize: 18,
    color: colors.accentStrong,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  dateInfo: {
    marginTop: 12,
  },
  dayName: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.textOnBrand,
    letterSpacing: 0.3,
  },
  fullDate: {
    fontSize: 16,
    color: colors.textOnBrandMuted,
    marginTop: 6,
    letterSpacing: 0.3,
  },
  eventsContainer: {
    flex: 1,
  },
  eventsBackground: {
    flex: 1,
    overflow: 'hidden',
  },
  eventsPatternImage: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.25,
    transform: [{ translateX: -120 }, { translateY: -180 }, { scale: 1 }],
  },
  eventsList: {
    padding: spacing.lg + spacing.xs,
  },
  eventCard: {
    backgroundColor: colors.surfaceSolid,
    padding: 18,
    borderRadius: 16,
    marginBottom: 0,
    borderLeftWidth: 4,
    borderLeftColor: colors.danger,
    ...elevation.card,
  },
  eventCardTouchable: {
    marginBottom: 14,
  },
  eventTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.brandInk,
    marginBottom: 6,
    letterSpacing: 0.2,
  },
  eventTime: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.danger,
    letterSpacing: 0.2,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 60,
  },
  emptyStateText: {
    fontSize: 16,
    lineHeight: 24,
    color: colors.textMuted,
    fontStyle: 'italic',
    letterSpacing: 0.2,
  },
  addButton: {
    backgroundColor: colors.accentStrong,
    margin: 20,
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    shadowColor: colors.accentStrong,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  addButtonText: {
    color: colors.white,
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.4,
  },
});

export default DayView;

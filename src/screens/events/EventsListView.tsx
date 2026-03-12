import React, { useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform, Animated } from 'react-native';
import { CalendarEvent } from '../../types';
import { MONTH_NAMES } from '../../constants/dates';
import { ENABLE_GLASS_UI } from '../../theme/flags';
import { GlassSurface } from '../../components/ui/GlassSurface';
import { colors, elevation, radius, spacing } from '../../theme/tokens';

interface EventsListViewProps {
  events: CalendarEvent[];
  onEventPress: (event: CalendarEvent) => void;
}

const EventsListView: React.FC<EventsListViewProps> = ({ events, onEventPress }) => {
  const [visibleMonthDate, setVisibleMonthDate] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
  const touchStart = useRef<{ x: number; y: number } | null>(null);
  const translateX = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(1)).current;
  const isAnimating = useRef(false);
  const useIosPilot = ENABLE_GLASS_UI && Platform.OS === 'ios';
  const visibleYear = visibleMonthDate.getFullYear();
  const visibleMonth = visibleMonthDate.getMonth();

  const shiftVisibleMonth = (delta: number) => {
    setVisibleMonthDate(prev => new Date(prev.getFullYear(), prev.getMonth() + delta, 1));
  };

  const settleBack = () => {
    Animated.parallel([
      Animated.spring(translateX, {
        toValue: 0,
        useNativeDriver: true,
        friction: 8,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const runMonthSwipeTransition = (direction: 'previous' | 'next') => {
    if (isAnimating.current) return;
    isAnimating.current = true;

    const swipeOutX = direction === 'previous' ? 300 : -300;
    const swipeInStartX = direction === 'previous' ? -300 : 300;
    const monthDelta = direction === 'previous' ? -1 : 1;

    Animated.parallel([
      Animated.timing(translateX, {
        toValue: swipeOutX,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      shiftVisibleMonth(monthDelta);
      translateX.setValue(swipeInStartX);
      opacity.setValue(0);

      Animated.parallel([
        Animated.timing(translateX, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start(() => {
        isAnimating.current = false;
      });
    });
  };

  // Filter to visible month and sort chronologically
  const sortedEvents = [...events]
    .filter(event => {
      const eventDate = event.fromDate || event.date || new Date();
      return eventDate.getFullYear() === visibleYear && eventDate.getMonth() === visibleMonth;
    })
    .sort((a, b) => {
      const dateA = a.fromDate || a.date || new Date();
      const dateB = b.fromDate || b.date || new Date();
      return dateA.getTime() - dateB.getTime();
    });

  const formatEventDate = (event: CalendarEvent): string => {
    const eventDate = event.fromDate || event.date || new Date();
    const eventTime = event.fromTime || event.startTime;

    const monthName = MONTH_NAMES[eventDate.getMonth()];
    const day = eventDate.getDate();
    const year = eventDate.getFullYear();

    if (event.isAllDay) {
      return `${monthName} ${day}, ${year} • All Day`;
    }

    return `${monthName} ${day}, ${year}${eventTime ? ` • ${eventTime}` : ''}`;
  };

  return (
    <View
      style={styles.container}
      testID="events-list-swipe-area"
      onTouchStart={(evt) => {
        if (isAnimating.current) return;
        touchStart.current = {
          x: evt.nativeEvent.pageX,
          y: evt.nativeEvent.pageY,
        };
      }}
      onTouchMove={(evt) => {
        if (!touchStart.current || isAnimating.current) return;
        const dx = evt.nativeEvent.pageX - touchStart.current.x;
        const dy = evt.nativeEvent.pageY - touchStart.current.y;
        if (Math.abs(dx) <= Math.abs(dy)) return;

        translateX.setValue(dx);
        const opacityValue = 1 - Math.abs(dx) / 1000;
        opacity.setValue(Math.max(opacityValue, 0.7));
      }}
      onTouchEnd={(evt) => {
        if (!touchStart.current || isAnimating.current) return;
        const dx = evt.nativeEvent.pageX - touchStart.current.x;
        const dy = evt.nativeEvent.pageY - touchStart.current.y;
        touchStart.current = null;

        const threshold = 60;
        if (Math.abs(dx) <= Math.abs(dy) || Math.abs(dx) < threshold) {
          settleBack();
          return;
        }

        runMonthSwipeTransition(dx > 0 ? 'previous' : 'next');
      }}
    >
      <Animated.View
        style={[
          styles.animatedContent,
          {
            transform: [{ translateX }],
            opacity,
          },
        ]}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>{MONTH_NAMES[visibleMonth]} {visibleYear}</Text>
          <Text style={styles.headerSubtitle}>{sortedEvents.length} event{sortedEvents.length !== 1 ? 's' : ''}</Text>
        </View>

        {/* Events list */}
        <ScrollView style={styles.eventsContainer}>
          {sortedEvents.length > 0 ? (
            <View style={styles.eventsList}>
              {sortedEvents.map((event) => (
                <TouchableOpacity
                  key={event.id}
                  style={styles.eventBarTouchable}
                  onPress={() => onEventPress(event)}
                  activeOpacity={0.8}
                >
                  {useIosPilot ? (
                    <GlassSurface style={styles.eventBar} intensity={40}>
                      <Text style={styles.eventTitle}>{event.title}</Text>
                      <Text style={styles.eventDate}>{formatEventDate(event)}</Text>
                    </GlassSurface>
                  ) : (
                    <View style={styles.eventBar}>
                      <Text style={styles.eventTitle}>{event.title}</Text>
                      <Text style={styles.eventDate}>{formatEventDate(event)}</Text>
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>No events this month</Text>
              <Text style={styles.emptyStateSubtext}>Swipe left or right to change months</Text>
            </View>
          )}
        </ScrollView>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bgSubtle,
  },
  animatedContent: {
    flex: 1,
  },
  header: {
    backgroundColor: colors.brandPrimary,
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
  headerTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.textOnBrand,
    letterSpacing: 0.3,
  },
  headerSubtitle: {
    fontSize: 15,
    color: colors.textOnBrandMuted,
    marginTop: 6,
    letterSpacing: 0.3,
  },
  eventsContainer: {
    flex: 1,
  },
  eventsList: {
    padding: spacing.lg + spacing.xs,
  },
  eventBar: {
    backgroundColor: colors.surfaceSolid,
    paddingVertical: 20,
    paddingHorizontal: 22,
    borderRadius: radius.md,
    marginBottom: 0,
    borderLeftWidth: 5,
    borderLeftColor: colors.danger,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    ...elevation.card,
  },
  eventBarTouchable: {
    marginBottom: 16,
  },
  eventTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.brandInk,
    marginBottom: 8,
    letterSpacing: 0.2,
  },
  eventDate: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.danger,
    letterSpacing: 0.2,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 80,
  },
  emptyStateText: {
    fontSize: 18,
    lineHeight: 26,
    color: colors.textMuted,
    fontWeight: '700',
    marginBottom: 10,
    letterSpacing: 0.2,
  },
  emptyStateSubtext: {
    fontSize: 15,
    lineHeight: 22,
    color: colors.textMutedSoft,
    fontStyle: 'italic',
    letterSpacing: 0.2,
  },
});

export default EventsListView;

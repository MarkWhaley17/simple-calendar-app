import React, { useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform, Animated, ImageBackground, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { CalendarEvent } from '../../types';
import { MONTH_NAMES } from '../../constants/dates';
import { ENABLE_GLASS_UI } from '../../theme/flags';
import { GlassSurface } from '../../components/ui/GlassSurface';
import { colors, elevation, spacing } from '../../theme/tokens';
import { isPreloadedEvent } from '../../utils/eventEditability';

interface EventsListViewProps {
  events: CalendarEvent[];
  onEventPress: (event: CalendarEvent) => void;
  onAddEvent?: () => void;
}

type EventsTab = 'preloaded' | 'personal';

const EventsListView: React.FC<EventsListViewProps> = ({ events, onEventPress, onAddEvent }) => {
  const headerBackground = require('../../../assets/day-bg.jpg');
  const eventsBackground = require('../../../assets/day-view-pattern.png');
  const [visibleMonthDate, setVisibleMonthDate] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
  const [activeTab, setActiveTab] = useState<EventsTab>('preloaded');
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

  // Filter to visible month and sort chronologically.
  const visibleMonthEvents = [...events]
    .filter(event => {
      const eventDate = event.fromDate || event.date || new Date();
      return eventDate.getFullYear() === visibleYear && eventDate.getMonth() === visibleMonth;
    })
    .sort((a, b) => {
      const dateA = a.fromDate || a.date || new Date();
      const dateB = b.fromDate || b.date || new Date();
      return dateA.getTime() - dateB.getTime();
    });
  const sortedEvents = visibleMonthEvents;
  const preloadedEvents = sortedEvents.filter(isPreloadedEvent);
  const personalEvents = sortedEvents.filter(event => !isPreloadedEvent(event));
  const activeEvents = activeTab === 'preloaded' ? preloadedEvents : personalEvents;
  const headerCountLabel =
    activeTab === 'preloaded'
      ? `event${activeEvents.length !== 1 ? 's' : ''}`
      : `session${activeEvents.length !== 1 ? 's' : ''}`;

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
        <ImageBackground source={headerBackground} style={styles.headerBackground} resizeMode="cover">
          <View style={styles.header}>
            <View style={styles.headerTopRow}>
              <View style={styles.headerMonthBlock}>
                <Text style={styles.headerTitle}>{MONTH_NAMES[visibleMonth]} {visibleYear}</Text>
                <Text style={styles.headerSubtitle}>{activeEvents.length} {headerCountLabel}</Text>
              </View>
            </View>
            <TouchableOpacity
              style={[styles.headerNavButton, styles.headerNavButtonLeft]}
              onPress={() => runMonthSwipeTransition('previous')}
              activeOpacity={0.8}
              testID="events-header-prev-month"
              accessibilityLabel="Previous month"
            >
              <Text style={styles.headerNavButtonText}>‹</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.headerNavButton, styles.headerNavButtonRight]}
              onPress={() => runMonthSwipeTransition('next')}
              activeOpacity={0.8}
              testID="events-header-next-month"
              accessibilityLabel="Next month"
            >
              <Text style={styles.headerNavButtonText}>›</Text>
            </TouchableOpacity>
          </View>
        </ImageBackground>

        <View style={styles.tabBarContainer}>
          <View style={styles.tabBar}>
            <TouchableOpacity
              style={[styles.tabButton, activeTab === 'preloaded' && styles.tabButtonActive]}
              onPress={() => setActiveTab('preloaded')}
              activeOpacity={0.85}
              testID="events-tab-preloaded"
            >
              <Text style={[styles.tabButtonText, activeTab === 'preloaded' && styles.tabButtonTextActive]}>
                Events
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tabButton, activeTab === 'personal' && styles.tabButtonActive]}
              onPress={() => setActiveTab('personal')}
              activeOpacity={0.85}
              testID="events-tab-personal"
            >
              <Text style={[styles.tabButtonText, activeTab === 'personal' && styles.tabButtonTextActive]}>
                My Sessions
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.eventsBackground}>
          <Image
            source={eventsBackground}
            style={styles.eventsPatternImage}
            resizeMode="cover"
            testID="events-list-background-pattern"
          />

          {/* Events list */}
          <ScrollView style={styles.eventsContainer}>
            {activeEvents.length > 0 ? (
              <View style={styles.eventsList}>
                {activeEvents.map((event) => (
                  isPreloadedEvent(event) ? (
                    <TouchableOpacity
                      key={event.id}
                      style={styles.preloadedEventTouchable}
                      onPress={() => onEventPress(event)}
                      activeOpacity={0.8}
                      testID={`events-list-preloaded-${event.id}`}
                    >
                      {useIosPilot ? (
                        <GlassSurface style={styles.preloadedEventRowGlass} contentStyle={styles.preloadedEventRowContent} intensity={28}>
                          <LinearGradient
                            colors={['rgba(245, 158, 11, 0.1)', 'rgba(254, 243, 199, 0.2)']}
                            locations={[0, 1]}
                            start={{ x: 0, y: 0.5 }}
                            end={{ x: 1, y: 0.5 }}
                            style={styles.preloadedEventGradient}
                          />
                          <View style={styles.preloadedEventTextColumn}>
                            <Text style={styles.eventTitle}>{event.title}</Text>
                            <Text style={styles.eventDate}>{formatEventDate(event)}</Text>
                          </View>
                          <Text style={styles.preloadedEventChevron}>›</Text>
                        </GlassSurface>
                      ) : (
                        <View style={styles.preloadedEventRowFallback}>
                          <LinearGradient
                            colors={['rgba(245, 158, 11, 0.09)', 'rgba(254, 243, 199, 0.16)']}
                            locations={[0, 1]}
                            start={{ x: 0, y: 0.5 }}
                            end={{ x: 1, y: 0.5 }}
                            style={styles.preloadedEventGradient}
                          />
                          <View style={styles.preloadedEventTextColumn}>
                            <Text style={styles.eventTitle}>{event.title}</Text>
                            <Text style={styles.eventDate}>{formatEventDate(event)}</Text>
                          </View>
                          <Text style={styles.preloadedEventChevron}>›</Text>
                        </View>
                      )}
                    </TouchableOpacity>
                  ) : (
                  <TouchableOpacity
                    key={event.id}
                    style={styles.eventBarTouchable}
                    onPress={() => onEventPress(event)}
                    activeOpacity={0.8}
                    testID={`events-list-user-${event.id}`}
                  >
                    {useIosPilot ? (
                      <GlassSurface style={styles.eventBar} contentStyle={styles.userEventRowContent} intensity={40}>
                        <View style={styles.userEventTextColumn}>
                          <Text style={styles.eventTitle}>{event.title}</Text>
                          <Text style={styles.eventDate}>{formatEventDate(event)}</Text>
                        </View>
                        <Text style={styles.preloadedEventChevron}>›</Text>
                      </GlassSurface>
                    ) : (
                      <View style={styles.eventBar}>
                        <View style={styles.userEventTextColumn}>
                          <Text style={styles.eventTitle}>{event.title}</Text>
                          <Text style={styles.eventDate}>{formatEventDate(event)}</Text>
                        </View>
                        <Text style={styles.preloadedEventChevron}>›</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                )
                ))}
              </View>
            ) : (
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateText}>
                  {activeTab === 'preloaded' ? 'No preloaded events this month' : 'No personal sessions this month'}
                </Text>
                <Text style={styles.emptyStateSubtext}>Swipe left or right to change months</Text>
              </View>
            )}
          </ScrollView>

          {activeTab === 'personal' && (
            <TouchableOpacity
              style={styles.addButton}
              activeOpacity={0.8}
              onPress={onAddEvent}
              testID="events-list-add-session"
            >
              <Text style={styles.addButtonText}>+ Add Practice Session</Text>
            </TouchableOpacity>
          )}
        </View>
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
  headerBackground: {
    width: '100%',
  },
  header: {
    backgroundColor: colors.brandOverlay,
    paddingTop: 0,
    paddingBottom: 0,
    paddingHorizontal: spacing.lg + spacing.xs,
    minHeight: 144,
    justifyContent: 'center',
    position: 'relative',
    shadowColor: colors.brandPrimaryDark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  headerTopRow: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerMonthBlock: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerNavButton: {
    position: 'absolute',
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    top: '50%',
    marginTop: -22,
  },
  headerNavButtonLeft: {
    left: spacing.lg + spacing.xs,
  },
  headerNavButtonRight: {
    right: spacing.lg + spacing.xs,
  },
  headerNavButtonText: {
    fontSize: 34,
    lineHeight: 34,
    color: colors.textOnBrandMuted,
    fontWeight: '400',
    textAlign: 'center',
    includeFontPadding: false,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: colors.textOnBrand,
    letterSpacing: 0,
    textAlign: 'center',
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
  eventsBackground: {
    flex: 1,
    overflow: 'hidden',
  },
  eventsPatternImage: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.25,
    transform: [{ translateX: -120 }, { translateY: -180 }, { scale: 1 }],
  },
  tabBarContainer: {
    paddingHorizontal: spacing.lg + spacing.xs,
    paddingTop: spacing.sm,
    paddingBottom: spacing.sm,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: colors.surfaceMuted,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    padding: 3,
  },
  tabButton: {
    flex: 1,
    minHeight: 36,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabButtonActive: {
    backgroundColor: colors.brandPrimary,
  },
  tabButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textMuted,
    letterSpacing: 0.2,
  },
  tabButtonTextActive: {
    color: colors.textOnBrand,
  },
  eventsList: {
    paddingVertical: spacing.lg + spacing.xs,
  },
  eventBar: {
    backgroundColor: 'rgba(37, 99, 235, 0.08)',
    minHeight: 84,
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: spacing.lg + spacing.xs,
    paddingRight: spacing.lg + spacing.xs,
    paddingVertical: 18,
    borderRadius: 0,
    marginBottom: 0,
    borderWidth: 1,
    borderColor: colors.borderInput,
  },
  userEventTextColumn: {
    flex: 1,
  },
  userEventRowContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  eventBarTouchable: {
    marginBottom: 14,
  },
  preloadedEventTouchable: {
    marginBottom: 14,
  },
  preloadedEventRowGlass: {
    borderRadius: 0,
    borderWidth: 1,
    borderColor: colors.borderInput,
  },
  preloadedEventRowContent: {
    position: 'relative',
    minHeight: 84,
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: spacing.lg + spacing.xs,
    paddingRight: spacing.lg + spacing.xs,
    paddingVertical: 18,
  },
  preloadedEventRowFallback: {
    position: 'relative',
    minHeight: 84,
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: spacing.lg + spacing.xs,
    paddingRight: spacing.lg + spacing.xs,
    paddingVertical: 18,
    backgroundColor: colors.warningSurface,
    borderWidth: 1,
    borderColor: colors.borderInput,
  },
  preloadedEventGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  preloadedEventTextColumn: {
    flex: 1,
  },
  preloadedEventChevron: {
    fontSize: 24,
    lineHeight: 24,
    color: colors.brandPrimary,
    marginLeft: spacing.md,
    opacity: 0.9,
    fontWeight: '700',
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

export default EventsListView;

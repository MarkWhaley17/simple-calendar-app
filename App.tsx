import React, { useState, useRef, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View, SafeAreaView, ScrollView, PanResponder, Animated, Text } from 'react-native';
import { CalendarHeader, CalendarGrid } from './src/components/calendar';
import { BottomNav } from './src/components/navigation';
import { DayView } from './src/screens/calendar';
import { EventView, AddEventView, EditEventView, EventsListView } from './src/screens/events';
import { AccountView } from './src/screens/account';
import { CalendarEvent, ViewMode, NavView } from './src/types';
import { getRandomQuote } from './src/utils/quotes';

export default function App() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('month');
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [previousView, setPreviousView] = useState<ViewMode | null>(null);
  const [currentQuote, setCurrentQuote] = useState<string>(getRandomQuote());

  // Animation values for page turning effect
  const translateX = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(1)).current;

  // Change quote every 5 minutes
  useEffect(() => {
    const quoteInterval = setInterval(() => {
      setCurrentQuote(getRandomQuote());
    }, 5 * 60 * 1000); // 5 minutes in milliseconds

    return () => clearInterval(quoteInterval);
  }, []);

  // Sample events
  const [events, setEvents] = useState<CalendarEvent[]>([
    {
      id: '1',
      title: 'Losar - Year of the Fire Horse',
      fromDate: new Date(2026, 1, 18), // February 18, 2026
      fromTime: '9:00 AM',
      description: 'Losar, the Tibetan New Year, will be celebrated on February 18, 2026, marking the start of the 2153rd year—the Year of the Fire Horse. This 15-day festival involves cleaning homes, offering prayers, hanging prayer flags, and sharing traditional food like guthuk. Major celebrations typically span from February 18-20, 2026.',
      // Legacy fields
      date: new Date(2026, 1, 18),
      startTime: '9:00 AM',
    },
  ]);

  const handlePreviousMonth = () => {
    // Animate the transition - slide right and fade out
    Animated.parallel([
      Animated.timing(translateX, {
        toValue: 400,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setCurrentDate(prevDate => {
        const newDate = new Date(prevDate);
        newDate.setMonth(newDate.getMonth() - 1);
        return newDate;
      });
      translateX.setValue(0);
      opacity.setValue(1);
    });
  };

  const handleNextMonth = () => {
    // Animate the transition - slide left and fade out
    Animated.parallel([
      Animated.timing(translateX, {
        toValue: -400,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setCurrentDate(prevDate => {
        const newDate = new Date(prevDate);
        newDate.setMonth(newDate.getMonth() + 1);
        return newDate;
      });
      translateX.setValue(0);
      opacity.setValue(1);
    });
  };

  const handleDayPress = (date: Date) => {
    // If the clicked day is from a different month, update the current month
    if (date.getMonth() !== currentDate.getMonth() || date.getFullYear() !== currentDate.getFullYear()) {
      setCurrentDate(new Date(date.getFullYear(), date.getMonth(), 1));
    }
    setSelectedDate(date);
    setViewMode('day');
  };

  const handleBackToMonth = () => {
    setViewMode('month');
    setSelectedDate(null);
  };

  const handleEventPress = (event: CalendarEvent) => {
    setPreviousView(viewMode);
    setSelectedEvent(event);
    setViewMode('event');
  };

  const handleBackToDay = () => {
    if (previousView === 'eventsList') {
      setViewMode('eventsList');
    } else {
      setViewMode('day');
    }
    setSelectedEvent(null);
    setPreviousView(null);
  };

  const handleAddEvent = () => {
    setViewMode('addEvent');
  };

  const handleSaveEvent = (eventData: {
    title: string;
    description: string;
    fromDate: Date;
    fromTime: string;
    toDate: Date;
    toTime: string;
    links: string[];
    isAllDay: boolean;
  }) => {
    const newEvent: CalendarEvent = {
      id: Date.now().toString(),
      title: eventData.title,
      description: eventData.description,
      fromDate: eventData.fromDate,
      fromTime: eventData.fromTime,
      toDate: eventData.toDate,
      toTime: eventData.toTime,
      links: eventData.links,
      isAllDay: eventData.isAllDay,
      // Legacy fields for compatibility
      date: eventData.fromDate,
      startTime: eventData.fromTime,
    };

    setEvents([...events, newEvent]);
    setViewMode('day');
  };

  const handleCancelAddEvent = () => {
    setViewMode('day');
  };

  const handleEditEvent = () => {
    setViewMode('editEvent');
  };

  const handleUpdateEvent = (eventData: {
    id: string;
    title: string;
    description: string;
    fromDate: Date;
    fromTime: string;
    toDate: Date;
    toTime: string;
    links: string[];
    isAllDay: boolean;
  }) => {
    const updatedEvents = events.map(event =>
      event.id === eventData.id
        ? {
            ...event,
            title: eventData.title,
            description: eventData.description,
            fromDate: eventData.fromDate,
            fromTime: eventData.fromTime,
            toDate: eventData.toDate,
            toTime: eventData.toTime,
            links: eventData.links,
            isAllDay: eventData.isAllDay,
            // Update legacy fields
            date: eventData.fromDate,
            startTime: eventData.fromTime,
          }
        : event
    );

    setEvents(updatedEvents);
    setViewMode('event');
  };

  const handleCancelEditEvent = () => {
    setViewMode('event');
  };

  const handleBottomNavigation = (view: NavView) => {
    if (view === 'month') {
      setViewMode('month');
      setCurrentDate(new Date()); // Reset to current month
      setSelectedDate(null);
      setSelectedEvent(null);
    } else if (view === 'day') {
      setViewMode('day');
      setSelectedDate(new Date()); // Set to today
      setSelectedEvent(null);
    } else if (view === 'events') {
      setViewMode('eventsList');
      setSelectedEvent(null);
    } else if (view === 'account') {
      setViewMode('account');
    }
  };

  // Pan responder for swipe gestures on month view
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_evt, gestureState) => {
        // Only respond to horizontal swipes
        return Math.abs(gestureState.dx) > Math.abs(gestureState.dy);
      },
      onPanResponderMove: (_evt, gestureState) => {
        // Update translateX during the gesture for smooth feedback
        translateX.setValue(gestureState.dx * 0.3); // Damping factor for subtlety

        // Fade slightly during drag
        const opacityValue = 1 - Math.abs(gestureState.dx) / 1000;
        opacity.setValue(Math.max(opacityValue, 0.7));
      },
      onPanResponderRelease: (_evt, gestureState) => {
        // Swipe left (next month)
        if (gestureState.dx < -50) {
          // Slide current month out to the left
          Animated.parallel([
            Animated.timing(translateX, {
              toValue: -400,
              duration: 200,
              useNativeDriver: true,
            }),
            Animated.timing(opacity, {
              toValue: 0,
              duration: 200,
              useNativeDriver: true,
            }),
          ]).start(() => {
            // Change to new month
            setCurrentDate(prevDate => {
              const newDate = new Date(prevDate);
              newDate.setMonth(newDate.getMonth() + 1);
              return newDate;
            });
            // Position new month off-screen to the right
            translateX.setValue(400);
            opacity.setValue(0);
            // Slide new month in from the right
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
            ]).start();
          });
        }
        // Swipe right (previous month)
        else if (gestureState.dx > 50) {
          // Slide current month out to the right
          Animated.parallel([
            Animated.timing(translateX, {
              toValue: 400,
              duration: 200,
              useNativeDriver: true,
            }),
            Animated.timing(opacity, {
              toValue: 0,
              duration: 200,
              useNativeDriver: true,
            }),
          ]).start(() => {
            // Change to new month
            setCurrentDate(prevDate => {
              const newDate = new Date(prevDate);
              newDate.setMonth(newDate.getMonth() - 1);
              return newDate;
            });
            // Position new month off-screen to the left
            translateX.setValue(-400);
            opacity.setValue(0);
            // Slide new month in from the left
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
            ]).start();
          });
        } else {
          // Return to original position if swipe was too short
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
        }
      },
    })
  ).current;

  // Determine which nav item is active
  const getCurrentNavView = (): NavView => {
    if (viewMode === 'account') return 'account';
    if (viewMode === 'eventsList') return 'events';
    if (viewMode === 'day' || viewMode === 'event' || viewMode === 'addEvent' || viewMode === 'editEvent') return 'day';
    return 'month';
  };

  // Check if we should show bottom nav (hide on event detail screens)
  const shouldShowBottomNav = viewMode === 'month' || viewMode === 'day' || viewMode === 'account' || viewMode === 'eventsList';

  return (
    <SafeAreaView style={styles.container}>
      {viewMode === 'editEvent' && selectedEvent ? (
        <EditEventView
          event={selectedEvent}
          onBack={handleCancelEditEvent}
          onSave={handleUpdateEvent}
        />
      ) : viewMode === 'addEvent' ? (
        <AddEventView
          onBack={handleCancelAddEvent}
          onSave={handleSaveEvent}
          initialDate={selectedDate || new Date()}
        />
      ) : viewMode === 'event' && selectedEvent ? (
        <EventView event={selectedEvent} onBack={handleBackToDay} onEdit={handleEditEvent} />
      ) : (
        <>
          {viewMode === 'account' ? (
            <AccountView />
          ) : viewMode === 'eventsList' ? (
            <EventsListView
              events={events}
              onEventPress={handleEventPress}
            />
          ) : viewMode === 'day' && selectedDate ? (
            <DayView
              selectedDate={selectedDate}
              onBack={handleBackToMonth}
              events={events}
              onEventPress={handleEventPress}
              onAddEvent={handleAddEvent}
            />
          ) : (
            <View style={styles.monthViewContainer} {...panResponder.panHandlers}>
              <Animated.View
                style={[
                  styles.animatedContent,
                  {
                    transform: [{ translateX }],
                    opacity,
                  },
                ]}
              >
                <ScrollView style={styles.content}>
                  <CalendarHeader
                    currentDate={currentDate}
                    onPreviousMonth={handlePreviousMonth}
                    onNextMonth={handleNextMonth}
                  />
                  <CalendarGrid currentDate={currentDate} onDayPress={handleDayPress} events={events} />
                  <View style={styles.quoteContainer}>
                    <Text style={styles.quoteText}>{currentQuote}</Text>
                  </View>
                  <StatusBar style="auto" />
                </ScrollView>
              </Animated.View>
            </View>
          )}
          {shouldShowBottomNav && (
            <BottomNav
              currentView={getCurrentNavView()}
              onNavigate={handleBottomNavigation}
              todayDate={new Date().getDate()}
            />
          )}
        </>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EFF6FF', // Light blue background
  },
  monthViewContainer: {
    flex: 1,
  },
  animatedContent: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  quoteContainer: {
    backgroundColor: '#fff',
    padding: 20,
    marginHorizontal: 16,
    marginTop: 20,
    marginBottom: 20,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#F59E0B', // Gold accent
  },
  quoteText: {
    fontSize: 15,
    lineHeight: 22,
    color: '#1E3A8A', // Dark blue text
    fontStyle: 'italic',
  },
});

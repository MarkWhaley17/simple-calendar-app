import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

interface BottomNavProps {
  currentView: 'month' | 'day' | 'events' | 'account';
  onNavigate: (view: 'month' | 'day' | 'events' | 'account') => void;
  todayDate?: number;
}

const BottomNav: React.FC<BottomNavProps> = ({ currentView, onNavigate, todayDate = new Date().getDate() }) => {
  return (
    <View style={styles.container}>
      {/* Account */}
      <TouchableOpacity
        style={[styles.navItem, currentView === 'account' && styles.activeNavItem]}
        onPress={() => onNavigate('account')}
        activeOpacity={0.7}
      >
        <View style={styles.iconContainer}>
          <View style={[styles.userIcon, currentView === 'account' && styles.activeIcon]}>
            <Text style={[styles.userIconText, currentView === 'account' && styles.activeIconText]}>👤</Text>
          </View>
        </View>
        <Text style={[styles.navLabel, currentView === 'account' && styles.activeNavLabel]}>Account</Text>
      </TouchableOpacity>

      {/* Month View */}
      <TouchableOpacity
        style={[styles.navItem, currentView === 'month' && styles.activeNavItem]}
        onPress={() => onNavigate('month')}
        activeOpacity={0.7}
      >
        <View style={styles.iconContainer}>
          <View style={[styles.monthIcon, currentView === 'month' && styles.activeIcon]}>
            <View style={styles.gridRow}>
              <View style={[styles.gridDot, currentView === 'month' && styles.activeGridDot]} />
              <View style={[styles.gridDot, currentView === 'month' && styles.activeGridDot]} />
              <View style={[styles.gridDot, currentView === 'month' && styles.activeGridDot]} />
            </View>
            <View style={styles.gridRow}>
              <View style={[styles.gridDot, currentView === 'month' && styles.activeGridDot]} />
              <View style={[styles.gridDot, currentView === 'month' && styles.activeGridDot]} />
              <View style={[styles.gridDot, currentView === 'month' && styles.activeGridDot]} />
            </View>
            <View style={styles.gridRow}>
              <View style={[styles.gridDot, currentView === 'month' && styles.activeGridDot]} />
              <View style={[styles.gridDot, currentView === 'month' && styles.activeGridDot]} />
              <View style={[styles.gridDot, currentView === 'month' && styles.activeGridDot]} />
            </View>
          </View>
        </View>
        <Text style={[styles.navLabel, currentView === 'month' && styles.activeNavLabel]}>Month</Text>
      </TouchableOpacity>

      {/* Day View */}
      <TouchableOpacity
        style={[styles.navItem, currentView === 'day' && styles.activeNavItem]}
        onPress={() => onNavigate('day')}
        activeOpacity={0.7}
      >
        <View style={styles.iconContainer}>
          <View style={[styles.dayIcon, currentView === 'day' && styles.activeIcon]}>
            <Text style={[styles.dayIconText, currentView === 'day' && styles.activeIconText]}>
              {todayDate}
            </Text>
          </View>
        </View>
        <Text style={[styles.navLabel, currentView === 'day' && styles.activeNavLabel]}>Today</Text>
      </TouchableOpacity>

      {/* Events List */}
      <TouchableOpacity
        style={[styles.navItem, currentView === 'events' && styles.activeNavItem]}
        onPress={() => onNavigate('events')}
        activeOpacity={0.7}
      >
        <View style={styles.iconContainer}>
          <View style={[styles.eventsIcon, currentView === 'events' && styles.activeIcon]}>
            <View style={[styles.eventBar, currentView === 'events' && styles.activeEventBar]} />
            <View style={[styles.eventBar, currentView === 'events' && styles.activeEventBar]} />
            <View style={[styles.eventBar, currentView === 'events' && styles.activeEventBar]} />
          </View>
        </View>
        <Text style={[styles.navLabel, currentView === 'events' && styles.activeNavLabel]}>Events</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#2563EB', // Blue background
    paddingVertical: 8,
    paddingBottom: 20, // Extra padding for iOS home indicator
    borderTopWidth: 1,
    borderTopColor: '#1E40AF',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 4,
  },
  activeNavItem: {
    // Active state styling
  },
  iconContainer: {
    marginBottom: 4,
  },
  userIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#DBEAFE',
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeIcon: {
    backgroundColor: '#F59E0B', // Gold background when active
  },
  userIconText: {
    fontSize: 20,
  },
  activeIconText: {
    // Keep icon appearance same when active
  },
  dayIcon: {
    width: 32,
    height: 32,
    borderRadius: 6,
    backgroundColor: '#DBEAFE',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dayIconText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E40AF',
  },
  eventsIcon: {
    width: 32,
    height: 32,
    borderRadius: 6,
    backgroundColor: '#DBEAFE',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 6,
  },
  eventBar: {
    width: 20,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: '#1E40AF',
    marginVertical: 1.5,
  },
  activeEventBar: {
    backgroundColor: '#fff',
  },
  monthIcon: {
    width: 32,
    height: 32,
    borderRadius: 6,
    backgroundColor: '#DBEAFE',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 4,
  },
  gridRow: {
    flexDirection: 'row',
    gap: 3,
    marginVertical: 1,
  },
  gridDot: {
    width: 5,
    height: 5,
    borderRadius: 1,
    backgroundColor: '#1E40AF',
  },
  activeGridDot: {
    backgroundColor: '#fff',
  },
  navLabel: {
    fontSize: 11,
    color: '#DBEAFE',
    fontWeight: '500',
  },
  activeNavLabel: {
    color: '#F59E0B', // Gold text when active
    fontWeight: '600',
  },
});

export default BottomNav;

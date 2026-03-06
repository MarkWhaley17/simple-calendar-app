import React from 'react';
import { Platform, View, Text, StyleSheet, TouchableOpacity } from 'react-native';

import { ENABLE_GLASS_UI } from '../../theme/flags';
import { colors, radius, spacing } from '../../theme/tokens';
import { GlassSurface } from '../ui/GlassSurface';
import { glassStyles } from '../ui/glassStyles';

interface BottomNavProps {
  currentView: 'month' | 'day' | 'events' | 'account';
  onNavigate: (view: 'month' | 'day' | 'events' | 'account') => void;
  todayDate?: number;
}

const BottomNav: React.FC<BottomNavProps> = ({ currentView, onNavigate, todayDate = new Date().getDate() }) => {
  const bottomInset = Platform.OS === 'ios' ? spacing.lg : spacing.sm;

  const containerStyle = ENABLE_GLASS_UI
    ? [styles.glassOuter, { paddingBottom: bottomInset + spacing.sm }]
    : [styles.container];
  const barStyle = ENABLE_GLASS_UI ? [styles.glassContainer, glassStyles.floating] : null;

  const content = (
    <>
      {/* Account */}
      <TouchableOpacity
        style={[styles.navItem, currentView === 'account' && styles.activeNavItem, ENABLE_GLASS_UI && styles.glassNavItem]}
        onPress={() => onNavigate('account')}
        activeOpacity={0.7}
      >
        <View style={styles.iconContainer}>
          <View style={[styles.userIcon, ENABLE_GLASS_UI && styles.glassIcon, currentView === 'account' && styles.activeIcon]}>
            <Text style={[styles.userIconText, currentView === 'account' && styles.activeIconText]}>👤</Text>
          </View>
        </View>
        <Text style={[styles.navLabel, currentView === 'account' && styles.activeNavLabel, ENABLE_GLASS_UI && styles.glassNavLabel]}>Account</Text>
      </TouchableOpacity>

      {/* Month View */}
      <TouchableOpacity
        style={[styles.navItem, currentView === 'month' && styles.activeNavItem, ENABLE_GLASS_UI && styles.glassNavItem]}
        onPress={() => onNavigate('month')}
        activeOpacity={0.7}
      >
        <View style={styles.iconContainer}>
          <View style={[styles.monthIcon, ENABLE_GLASS_UI && styles.glassIcon, currentView === 'month' && styles.activeIcon]}>
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
        <Text style={[styles.navLabel, currentView === 'month' && styles.activeNavLabel, ENABLE_GLASS_UI && styles.glassNavLabel]}>Month</Text>
      </TouchableOpacity>

      {/* Day View */}
      <TouchableOpacity
        style={[styles.navItem, currentView === 'day' && styles.activeNavItem, ENABLE_GLASS_UI && styles.glassNavItem]}
        onPress={() => onNavigate('day')}
        activeOpacity={0.7}
      >
        <View style={styles.iconContainer}>
          <View style={[styles.dayIcon, ENABLE_GLASS_UI && styles.glassIcon, currentView === 'day' && styles.activeIcon]}>
            <Text style={[styles.dayIconText, currentView === 'day' && styles.activeIconText]}>
              {todayDate}
            </Text>
          </View>
        </View>
        <Text style={[styles.navLabel, currentView === 'day' && styles.activeNavLabel, ENABLE_GLASS_UI && styles.glassNavLabel]}>Today</Text>
      </TouchableOpacity>

      {/* Events List */}
      <TouchableOpacity
        style={[styles.navItem, currentView === 'events' && styles.activeNavItem, ENABLE_GLASS_UI && styles.glassNavItem]}
        onPress={() => onNavigate('events')}
        activeOpacity={0.7}
      >
        <View style={styles.iconContainer}>
          <View style={[styles.eventsIcon, ENABLE_GLASS_UI && styles.glassIcon, currentView === 'events' && styles.activeIcon]}>
            <View style={[styles.eventBar, currentView === 'events' && styles.activeEventBar]} />
            <View style={[styles.eventBar, currentView === 'events' && styles.activeEventBar]} />
            <View style={[styles.eventBar, currentView === 'events' && styles.activeEventBar]} />
          </View>
        </View>
        <Text style={[styles.navLabel, currentView === 'events' && styles.activeNavLabel, ENABLE_GLASS_UI && styles.glassNavLabel]}>Events</Text>
      </TouchableOpacity>
    </>
  );

  if (ENABLE_GLASS_UI) {
    return (
      <View style={containerStyle}>
        <GlassSurface style={barStyle} contentStyle={styles.glassRow} intensity={Platform.OS === 'ios' ? 38 : 20}>
          {content}
        </GlassSurface>
      </View>
    );
  }

  return (
    <View style={containerStyle}>
      {content}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: colors.brandPrimary,
    paddingVertical: 8,
    paddingBottom: 20, // Extra padding for iOS home indicator
    borderTopWidth: 1,
    borderTopColor: colors.brandPrimaryDark,
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
  glassOuter: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xs,
  },
  glassContainer: {
    backgroundColor: colors.surfaceStrong,
    borderRadius: radius.xl,
  },
  glassRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xs,
    minHeight: 72,
  },
  iconContainer: {
    marginBottom: 4,
  },
  glassNavItem: {
    borderRadius: radius.pill,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
  },
  userIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.brandSurface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeIcon: {
    backgroundColor: colors.accentStrong,
  },
  glassIcon: {
    backgroundColor: colors.surfaceStrong,
    borderWidth: 1,
    borderColor: colors.borderStrong,
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
    backgroundColor: colors.brandSurface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dayIconText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.brandPrimaryDark,
  },
  eventsIcon: {
    width: 32,
    height: 32,
    borderRadius: 6,
    backgroundColor: colors.brandSurface,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 6,
  },
  eventBar: {
    width: 20,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: colors.brandPrimaryDark,
    marginVertical: 1.5,
  },
  activeEventBar: {
    backgroundColor: colors.white,
  },
  monthIcon: {
    width: 32,
    height: 32,
    borderRadius: 6,
    backgroundColor: colors.brandSurface,
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
    backgroundColor: colors.brandPrimaryDark,
  },
  activeGridDot: {
    backgroundColor: colors.white,
  },
  navLabel: {
    fontSize: 11,
    color: colors.brandSurface,
    fontWeight: '500',
  },
  glassNavLabel: {
    color: colors.textSecondary,
  },
  activeNavLabel: {
    color: colors.accentStrong,
    fontWeight: '600',
  },
});

export default BottomNav;

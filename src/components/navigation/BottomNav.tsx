import React, { useMemo, useState } from 'react';
import { LayoutChangeEvent, Platform, View, Text, StyleSheet } from 'react-native';

import { ENABLE_GLASS_UI, ENABLE_MOTION_UI } from '../../theme/flags';
import { colors, radius, spacing } from '../../theme/tokens';
import { AnimatedPressable } from '../ui/AnimatedPressable';
import { GlassSurface } from '../ui/GlassSurface';
import { glassStyles } from '../ui/glassStyles';
import { AnimatedTabIndicator } from './AnimatedTabIndicator';
import { AnimatedTabItemContent } from './AnimatedTabItemContent';

interface BottomNavProps {
  currentView: 'month' | 'day' | 'events' | 'account';
  onNavigate: (view: 'month' | 'day' | 'events' | 'account') => void;
  todayDate?: number;
}

const BottomNav: React.FC<BottomNavProps> = ({ currentView, onNavigate, todayDate = new Date().getDate() }) => {
  type NavItemKey = BottomNavProps['currentView'];
  type TabLayout = { x: number; width: number };

  const bottomInset = Platform.OS === 'ios' ? spacing.lg : spacing.sm;
  const [tabLayouts, setTabLayouts] = useState<Record<NavItemKey, TabLayout | null>>({
    account: null,
    month: null,
    day: null,
    events: null,
  });

  const containerStyle = ENABLE_GLASS_UI
    ? [styles.glassOuter, { paddingBottom: bottomInset + spacing.sm }]
    : [styles.container];
  const barStyle = ENABLE_GLASS_UI ? [styles.glassContainer, glassStyles.floating] : null;

  const tabs: Array<{ key: NavItemKey; label: string }> = useMemo(() => ([
    { key: 'account', label: 'Account' },
    { key: 'month', label: 'Month' },
    { key: 'day', label: 'Today' },
    { key: 'events', label: 'Events' },
  ]), []);

  const handleLayout = (key: NavItemKey) => (event: LayoutChangeEvent) => {
    const { x, width } = event.nativeEvent.layout;
    setTabLayouts((prev) => ({ ...prev, [key]: { x, width } }));
  };

  const activeLayout = tabLayouts[currentView];

  const renderIcon = (key: NavItemKey, isActive: boolean) => {
    if (key === 'account') {
      return (
        <View style={[styles.userIcon, ENABLE_GLASS_UI && styles.glassIcon, isActive && styles.activeIcon]}>
          <Text style={[styles.userIconText, isActive && styles.activeIconText]}>👤</Text>
        </View>
      );
    }

    if (key === 'month') {
      return (
        <View style={[styles.monthIcon, ENABLE_GLASS_UI && styles.glassIcon, isActive && styles.activeIcon]}>
          <View style={styles.gridRow}>
            <View style={[styles.gridDot, isActive && styles.activeGridDot]} />
            <View style={[styles.gridDot, isActive && styles.activeGridDot]} />
            <View style={[styles.gridDot, isActive && styles.activeGridDot]} />
          </View>
          <View style={styles.gridRow}>
            <View style={[styles.gridDot, isActive && styles.activeGridDot]} />
            <View style={[styles.gridDot, isActive && styles.activeGridDot]} />
            <View style={[styles.gridDot, isActive && styles.activeGridDot]} />
          </View>
          <View style={styles.gridRow}>
            <View style={[styles.gridDot, isActive && styles.activeGridDot]} />
            <View style={[styles.gridDot, isActive && styles.activeGridDot]} />
            <View style={[styles.gridDot, isActive && styles.activeGridDot]} />
          </View>
        </View>
      );
    }

    if (key === 'day') {
      return (
        <View style={[styles.dayIcon, ENABLE_GLASS_UI && styles.glassIcon, isActive && styles.activeIcon]}>
          <Text style={[styles.dayIconText, isActive && styles.activeIconText]}>
            {todayDate}
          </Text>
        </View>
      );
    }

    return (
      <View style={[styles.eventsIcon, ENABLE_GLASS_UI && styles.glassIcon, isActive && styles.activeIcon]}>
        <View style={[styles.eventBar, isActive && styles.activeEventBar]} />
        <View style={[styles.eventBar, isActive && styles.activeEventBar]} />
        <View style={[styles.eventBar, isActive && styles.activeEventBar]} />
      </View>
    );
  };

  const content = (
    <>
      {ENABLE_MOTION_UI && activeLayout ? (
        <AnimatedTabIndicator x={activeLayout.x} width={activeLayout.width} />
      ) : null}
      {tabs.map((tab) => {
        const isActive = currentView === tab.key;
        return (
          <AnimatedPressable
            key={tab.key}
            style={[styles.navItem, ENABLE_GLASS_UI && styles.glassNavItem]}
            onLayout={handleLayout(tab.key)}
            onPress={() => onNavigate(tab.key)}
            hapticOnPress={ENABLE_MOTION_UI && currentView !== tab.key}
            scaleTo={ENABLE_MOTION_UI ? 0.985 : 1}
          >
            <AnimatedTabItemContent
              isActive={ENABLE_MOTION_UI ? isActive : false}
              icon={renderIcon(tab.key, isActive)}
              label={tab.label}
              iconContainerStyle={styles.iconContainer}
              labelStyle={[
                styles.navLabel,
                isActive && styles.activeNavLabel,
                ENABLE_GLASS_UI && styles.glassNavLabel,
              ]}
            />
          </AnimatedPressable>
        );
      })}
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
  glassOuter: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xs,
  },
  glassContainer: {
    backgroundColor: colors.surfaceStrong,
    borderRadius: radius.xl,
  },
  glassRow: {
    position: 'relative',
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

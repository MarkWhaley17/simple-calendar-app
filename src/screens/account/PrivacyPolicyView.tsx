import React, { useEffect, useMemo, useRef } from 'react';
import { Animated, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { GlassSurface } from '../../components/ui/GlassSurface';
import { ENABLE_GLASS_UI } from '../../theme/flags';
import { colors, elevation, spacing } from '../../theme/tokens';

interface PrivacyPolicyViewProps {
  onBack: () => void;
}

const PrivacyPolicyView: React.FC<PrivacyPolicyViewProps> = ({ onBack }) => {
  const useGlass = ENABLE_GLASS_UI;
  const dayPattern = require('../../../assets/day-view-pattern.png');
  const sections = useMemo(
    () => [
      {
        title: 'What we store',
        body: 'The app stores your account session token and local calendar preferences on your device. Notification settings and your personal calendar events are saved locally unless synced through your account.',
      },
      {
        title: 'How we use data',
        body: 'Account credentials are used to authenticate with Kalapa Media services. Event and reminder data is used only to render your calendar and notifications.',
      },
      {
        title: 'Your controls',
        body: 'You can sign out at any time from Account. You can also disable notifications in the Account settings section.',
      },
    ],
    []
  );

  const headerOpacity = useRef(new Animated.Value(0)).current;
  const headerTranslate = useRef(new Animated.Value(-16)).current;
  const cardAnims = useRef(sections.map(() => new Animated.Value(0))).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(headerOpacity, {
        duration: 280,
        toValue: 1,
        useNativeDriver: true,
      }),
      Animated.timing(headerTranslate, {
        duration: 280,
        toValue: 0,
        useNativeDriver: true,
      }),
    ]).start();

    Animated.stagger(
      85,
      cardAnims.map((anim) =>
        Animated.timing(anim, {
          duration: 260,
          toValue: 1,
          useNativeDriver: true,
        })
      )
    ).start();
  }, [cardAnims, headerOpacity, headerTranslate]);

  return (
    <View style={styles.container}>
      <Image source={dayPattern} style={styles.backgroundPattern} resizeMode="cover" />

      <Animated.View
        style={[
          styles.header,
          {
            opacity: headerOpacity,
            transform: [{ translateY: headerTranslate }],
          },
        ]}
      >
        <TouchableOpacity onPress={onBack} style={styles.headerButton}>
          <Text style={styles.headerButtonText}>Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Privacy Policy</Text>
        <View style={styles.headerButton} />
      </Animated.View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.updatedText}>Last updated: March 7, 2026</Text>
        {sections.map((section, index) => {
          const cardStyle = {
            opacity: cardAnims[index],
            transform: [
              {
                translateY: cardAnims[index].interpolate({
                  inputRange: [0, 1],
                  outputRange: [18, 0],
                }),
              },
            ],
          };

          return (
            <Animated.View key={section.title} style={cardStyle}>
              {useGlass ? (
                <GlassSurface style={styles.card} intensity={42}>
                  <Text style={styles.heading}>{section.title}</Text>
                  <Text style={styles.body}>{section.body}</Text>
                </GlassSurface>
              ) : (
                <View style={[styles.card, styles.fallbackCard]}>
                  <Text style={styles.heading}>{section.title}</Text>
                  <Text style={styles.body}>{section.body}</Text>
                </View>
              )}
            </Animated.View>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.bgSubtle,
    flex: 1,
  },
  backgroundPattern: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.25,
    transform: [{ translateX: -120 }, { translateY: -180 }, { scale: 1 }],
  },
  header: {
    alignItems: 'center',
    backgroundColor: colors.brandPrimary,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    minHeight: 144,
    ...elevation.card,
  },
  headerTitle: {
    color: colors.textOnBrand,
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  headerButton: {
    minWidth: 72,
    paddingVertical: spacing.xs,
  },
  headerButtonText: {
    color: colors.textOnBrand,
    fontSize: 16,
    fontWeight: '600',
  },
  content: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
    rowGap: spacing.md,
  },
  updatedText: {
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  card: {
    marginBottom: spacing.md,
    padding: spacing.lg,
  },
  fallbackCard: {
    backgroundColor: colors.surfaceSolid,
    borderColor: colors.borderSubtle,
    borderRadius: 18,
    borderWidth: 1,
    ...elevation.card,
  },
  heading: {
    color: colors.brandPrimaryDark,
    fontSize: 18,
    fontWeight: '700',
    marginBottom: spacing.xs,
  },
  body: {
    color: colors.textSecondary,
    fontSize: 15,
    lineHeight: 22,
  },
});

export default PrivacyPolicyView;

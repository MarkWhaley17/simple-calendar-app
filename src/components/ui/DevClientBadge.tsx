import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import config from '../../config';

/**
 * Shown only in development builds (__DEV__).
 * Displays the active client ID in the top-left corner so it's always
 * obvious which config is running when testing multiple white-label clients.
 */
const DevClientBadge: React.FC = () => {
  if (!__DEV__) return null;

  return (
    <View style={styles.badge} pointerEvents="none">
      <Text style={styles.text}>⚙ {config.clientId}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: 'rgba(0,0,0,0.55)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    zIndex: 9999,
  },
  text: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
});

export default DevClientBadge;

import { StyleSheet } from 'react-native';

import { colors, elevation, radius } from '../../theme/tokens';

export const glassStyles = StyleSheet.create({
  floating: {
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    ...elevation.floating,
  },
  card: {
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    ...elevation.card,
  },
});

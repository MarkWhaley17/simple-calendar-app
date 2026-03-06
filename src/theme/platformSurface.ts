import { Platform } from 'react-native';

import { blur } from './tokens';

export const platformSurface = {
  blurIntensity: Platform.select({
    ios: blur.high,
    android: blur.low,
    web: blur.medium,
    default: blur.low,
  }) as number,
  useStrongShadow: Platform.OS === 'ios',
};

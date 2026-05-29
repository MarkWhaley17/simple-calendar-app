import config from '../config';

const { theme } = config;

/**
 * Base palette — values that never vary between clients.
 * Client-specific overrides (brand, accent, danger, bg) come from the config layer.
 */
const base = {
  black: '#000000',
  white: '#FFFFFF',
  overlayBackdrop: 'rgba(0, 0, 0, 0.5)',
  surface: 'rgba(255,255,255,0.58)',
  surfaceStrong: 'rgba(255,255,255,0.78)',
  surfaceOverlay: 'rgba(255,255,255,0.18)',
  surfaceSolid: '#FFFFFF',
  borderSoft: 'rgba(255,255,255,0.42)',
  borderStrong: 'rgba(255,255,255,0.58)',
  borderSubtle: 'rgba(37, 99, 235, 0.08)',
  borderInput: 'rgba(37, 99, 235, 0.15)',
  textPrimary: '#0F172A',
  textSecondary: '#475569',
  textOnBrand: '#FFFFFF',
  textOnBrandMuted: '#DBEAFE',
  textMuted: '#60A5FA',
  textMutedSoft: '#93C5FD',
  textTertiary: '#94A3B8',
  accent: '#2F6FED',
  warningSurface: '#FEF3C7',
  warningText: '#92400E',
  warningBorder: '#F59E0B',
  placeholder: '#BFDBFE',
  error: '#B91C1C',
  toggleThumb: '#F4F3F4',
  toggleDangerTrack: '#FEE2E2',
  multiDaySpanFill: 'rgba(245, 158, 11, 0.11)',
  multiDaySpanBorder: 'rgba(245, 158, 11, 0.23)',
  dayCellSurface: 'rgba(255, 255, 255, 0.7)',
  shadow: 'rgba(15,23,42,0.12)',
  shadowStrong: 'rgba(15,23,42,0.18)',
};

/** Merged color palette — base values overridden by the active client config. */
export const colors = {
  ...base,
  // Client-configurable tokens
  bg: theme.bg,
  bgSubtle: theme.bgSubtle,
  brandPrimary: theme.brandPrimary,
  brandPrimaryDark: theme.brandPrimaryDark,
  brandOverlay: theme.brandOverlay,
  brandSurface: theme.brandSurface,
  brandInk: theme.brandInk,
  accentStrong: theme.accentStrong,
  accentWarm: theme.accentWarm,
  danger: theme.danger,
};

export const radius = {
  sm: 12,
  md: 18,
  lg: 24,
  xl: 30,
  pill: 999,
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
};

export const blur = {
  low: 16,
  medium: 28,
  high: 40,
};

export const elevation = {
  card: {
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },
  floating: {
    shadowColor: '#000',
    shadowOpacity: 0.16,
    shadowRadius: 22,
    shadowOffset: { width: 0, height: 12 },
    elevation: 10,
  },
};

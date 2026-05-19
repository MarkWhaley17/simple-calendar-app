export const RIKPA_RECOGNITION_DEFAULT = 3;

export const RIKPA_RECOGNITION_LABELS: Record<number, string> = {
  1: 'Dim',
  2: 'Mild',
  3: 'Clear',
  4: 'Vivid',
  5: 'Open',
};

export const RIKPA_DURATION_PRESETS_SECONDS = [0, 30, 60, 120, 300, 600, 900, 1800];

export const RIKPA_DURATION_LABELS: Record<number, string> = {
  0: 'Skip',
  30: '30s',
  60: '1m',
  120: '2m',
  300: '5m',
  600: '10m',
  900: '15m',
  1800: '30m',
};

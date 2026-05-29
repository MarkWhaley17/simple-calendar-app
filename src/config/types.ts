/**
 * ClientConfig defines every value that can vary between white-label builds.
 * Add new fields here as new customisation needs emerge.
 */

export interface ThemeOverrides {
  /** Primary brand colour (buttons, active states, links) */
  brandPrimary: string;
  brandPrimaryDark: string;
  brandOverlay: string;
  brandSurface: string;
  brandInk: string;
  /** Accent colour (FAB, highlights) */
  accentStrong: string;
  accentWarm: string;
  /** Danger / destructive colour */
  danger: string;
  /** App background */
  bg: string;
  bgSubtle: string;
}

export interface AssetConfig {
  /** App icon shown on the home screen */
  appIcon: number;
  /** Splash screen image */
  splashImage: number;
  /** Default header image used in DayView when no event-specific image is set */
  headerDefault: number;
  /** Background pattern used on practice screens */
  practiceBackground: number;
}

export interface FeatureFlags {
  timedMeditation: boolean;
  mantraLibrary: boolean;
  rikpaTracker: boolean;
  /** Recordings webview in the Account tab */
  recordings: boolean;
  /** Member-only events fetched from WordPress */
  memberEvents: boolean;
  /** Glass / blur UI style */
  glassUI: boolean;
  /** Motion / parallax animations */
  motionUI: boolean;
}

export interface CopyOverrides {
  appName: string;
  practiceTabLabel: string;
  eventsTabLabel: string;
  calendarTabLabel: string;
  accountTabLabel: string;
  signInPrompt: string;
}

export interface ClientConfig {
  /** Short identifier used in env vars and EAS build profiles, e.g. "kalapa" */
  clientId: string;
  /** iOS bundle identifier */
  bundleId: string;
  /** Android package name */
  androidPackage: string;
  theme: ThemeOverrides;
  assets: AssetConfig;
  features: FeatureFlags;
  copy: CopyOverrides;
}

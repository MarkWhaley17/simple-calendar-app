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
  /** Background used for plain (no-image) header bars */
  headerPlainBg: string;
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
  /** Allow users to sign in and access member-only content */
  userAuthentication: boolean;
  /** Member-only events fetched from WordPress */
  memberEvents: boolean;
  /** Glass / blur UI style */
  glassUI: boolean;
  /** Motion / parallax animations */
  motionUI: boolean;
  /** Show a banner image in the calendar header; false = plain coloured title bar */
  calendarHeaderBanner: boolean;
  /** Show the quote block above the calendar grid (true) or below (false) */
  quoteAboveCalendar: boolean;
  /** Scroll long quotes as a marquee; false = static wrapping text */
  quoteScrolling: boolean;
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
  /**
   * Pixels to extend the image layout below the container so cover-mode
   * crops toward the top of the image instead of the centre. 0 = default centred.
   */
  bannerImageOffset: number;
  /**
   * Event titles to exclude from the calendar entirely for this client.
   * Matched case-sensitively against the event title.
   */
  excludedEventTitles: string[];
  /** iOS bundle identifier */
  bundleId: string;
  /** Android package name */
  androidPackage: string;
  theme: ThemeOverrides;
  assets: AssetConfig;
  features: FeatureFlags;
  copy: CopyOverrides;
}

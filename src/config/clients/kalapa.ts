import { ClientConfig } from '../types';

const kalapa: ClientConfig = {
  clientId: 'kalapa',
  bundleId: 'com.kalapamedia.kalapacalendar',
  androidPackage: 'com.kalapamedia.kalapacalendar',

  theme: {
    brandPrimary: '#2563EB',
    brandPrimaryDark: '#1E40AF',
    brandOverlay: 'rgba(37, 99, 235, 0.35)',
    brandSurface: '#DBEAFE',
    brandInk: '#1E3A8A',
    accentStrong: '#F59E0B',
    accentWarm: '#D4A94D',
    danger: '#991B1B',
    bg: '#F6F8FB',
    bgSubtle: '#EFF6FF',
    headerPlainBg: '#DBEAFE',
  },

  assets: {
    appIcon: require('../../../assets/KalapaCalIcon1.png'),
    splashImage: require('../../../assets/KalapaCalIcon1.png'),
    headerDefault: require('../../../assets/dakini.jpg'),
    practiceBackground: require('../../../assets/day-bg.jpg'),
  },

  features: {
    timedMeditation: true,
    mantraLibrary: true,
    rikpaTracker: false,
    recordings: true,
    memberEvents: true,
    glassUI: true,
    motionUI: true,
    calendarHeaderBanner: false,
    quoteAboveCalendar: true,
    quoteScrolling: false,
  },

  copy: {
    appName: 'Kalapa Calendar',
    practiceTabLabel: 'Practice',
    eventsTabLabel: 'Events',
    calendarTabLabel: 'Calendar',
    accountTabLabel: 'Account',
    signInPrompt: 'Sign in with your email to see member-level events and features.',
  },
};

export default kalapa;

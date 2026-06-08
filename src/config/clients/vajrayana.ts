import { ClientConfig } from '../types';
import { PRACTICE_MANTRA_LIBRARY } from '../../constants/practice';

const vajrayana: ClientConfig = {
  clientId: 'vajrayana',
  excludedEventTitles: ['Jambhala Day', 'King of Ling Lhasang'],
  bannerImageOffset: 300,
  bannerImageOffsets: {
    'full-moon.png': 0,
    'green-tara.jpg': 200,
  },
  headerPatternOffset: 0,
  bundleId: 'com.vajrayana.calendar',
  androidPackage: 'com.vajrayana.calendar',

  theme: {
    brandPrimary: '#B45309',
    brandPrimaryDark: '#92400E',
    brandOverlay: 'rgba(180, 83, 9, 0.15)',
    brandSurface: '#FEF3C7',
    brandInk: '#78350F',
    accentStrong: '#F59E0B',
    accentWarm: '#D4A94D',
    danger: '#991B1B',
    bg: '#FFFBF0',
    bgSubtle: '#FEF9E7',
    headerPlainBg: '#FEF3C7',
  },

  assets: {
    // TODO: replace with Vajrayana Calendar assets
    appIcon: require('../../../assets/KalapaCalIcon1.png'),
    splashImage: require('../../../assets/KalapaCalIcon1.png'),
    headerDefault: require('../../../assets/dakini.jpg'),
    practiceBackground: require('../../../assets/day-bg.jpg'),
    headerPatternImage: require('../../../assets/day-view-pattern.png'),
  },

  features: {
    timedMeditation: true,
    mantraLibrary: true,
    rikpaTracker: false,
    recordings: false,
    userAuthentication: false,
    memberEvents: true,
    glassUI: true,
    motionUI: true,
    calendarHeaderBanner: true,
    quoteAboveCalendar: false,
    quoteScrolling: true,
  },

  copy: {
    appName: 'Vajrayana Calendar',
    practiceTabLabel: 'Practice',
    eventsTabLabel: 'Events',
    calendarTabLabel: 'Calendar',
    accountTabLabel: 'Account',
    signInPrompt: 'Sign in with your email to see member-level events and features.',
  },

  mantraLibrary: PRACTICE_MANTRA_LIBRARY,
};

export default vajrayana;

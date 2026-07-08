import { ClientConfig } from '../types';

const kalapa: ClientConfig = {
  clientId: 'kalapa',
  wpBaseUrl: 'https://kalapamedia.com/wp-json',
  excludedEventTitles: [],
  bannerImageOffset: 0,
  bannerImageOffsets: {},
  headerPatternOffset: 0,
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
    headerPlainBg: '#F59E0B',
  },

  assets: {
    appIcon: require('../../../assets/KalapaCalIcon1.png'),
    splashImage: require('../../../assets/KalapaCalIcon1.png'),
    headerDefault: require('../../../assets/dakini.jpg'),
    practiceBackground: require('../../../assets/day-bg.jpg'),
    headerPatternImage: require('../../../assets/parasol.png'),
  },

  features: {
    timedMeditation: true,
    mantraLibrary: true,
    rikpaTracker: false,
    recordings: true,
    userAuthentication: true,
    memberEvents: true,
    glassUI: true,
    motionUI: true,
    calendarHeaderBanner: false,
    quoteAboveCalendar: true,
    quoteScrolling: false,
    podcasts: true,
  },

  podcastSource: {
    type: 'rss',
    // STOPGAP: manually-maintained feed in a secret GitHub gist while WP media
    // uploads are restricted and real file-level privacy isn't set up yet.
    // TODO: replace with a real WP endpoint or protected feed once available.
    feedUrl: 'https://gist.githubusercontent.com/MarkWhaley17/64951a7c04d29607e9f159d1c9ffeea4/raw/kalapa-podcasts.xml',
  },

  copy: {
    appName: 'Kalapa Calendar',
    practiceTabLabel: 'Practice',
    eventsTabLabel: 'Events',
    calendarTabLabel: 'Calendar',
    accountTabLabel: 'Account',
    signInPrompt: 'Sign in with your email to see member-level events and features.',
  },

  mantraLibrary: [
    {
      id: 'amitayus',
      title: 'Amitayus',
      mantra: 'Om Amarani Jivantiye Svaha',
      description:
        'The mantra of Amitayus, the Buddha of Boundless Life. Practiced to extend life, purify the causes of untimely death, and accumulate the merit of the longevity siddhi.',
    },
    {
      id: 'seven-line-supplication',
      title: 'Seven-Line Supplication to Padmakara',
      mantra:
        'HUM in the northwest of the land of Uddiyana\n' +
        'On a blooming lotus flower\n' +
        'You have attained supreme wonderous siddhi\n' +
        'You are renowned as Padmakara\n' +
        'Surrounded by your retinue of many dakinis\n' +
        'We practice following your example\n' +
        'Please approach and grant your blessings\n' +
        'GURU PADMA SIDDHI HUM',
      description:
        'The most revered invocation of Guru Padmasambhava, composed at the request of King Trisong Detsen. Reciting it clears obstacles, invokes blessings, and connects the practitioner with the enlightened activity of Padmakara.',
    },
    {
      id: 'medicine-buddha',
      title: 'Medicine Buddha',
      mantra: 'Tayata Om Bekandze Bekandze Maha Bekandze Radza Samudgate Soha',
      description:
        'The mantra of the Medicine Buddha, Sangye Menla, who embodies the healing power of all enlightened beings. Recited to purify illness, negative karma, and the causes of suffering, and to awaken the natural luminosity of mind.',
    },
    {
      id: 'condensed-tara',
      title: 'Condensed Supplication to Tara',
      mantra: 'Om Tare Tuttare Ture Svaha',
      description:
        'The root mantra of Tara, condensing her swift compassionate activity into six syllables. Recited to invoke protection from the eight fears, clear obstacles, and awaken the blessings of the mother of all buddhas.',
    },
    {
      id: 'pacifying-turmoil-mamos',
      title: 'Pacifying the Turmoil of the Mamos',
      mantra: '',
      description: '',
    },
    {
      id: 'condensed-dispelling-obstacles',
      title: 'Condensed Dispelling of Obstacles',
      mantra: '',
      description: '',
    },
  ],
};

export default kalapa;

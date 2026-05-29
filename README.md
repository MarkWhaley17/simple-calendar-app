# Kalapa / Vajrayana Calendar

A white-label React Native calendar and practice app built with Expo and TypeScript. One codebase serves multiple clients — each with its own branding, feature set, and App Store presence.

---

## Clients

| Client ID   | App Name           | Bundle ID                      | Status      |
|-------------|--------------------|--------------------------------|-------------|
| `kalapa`    | Kalapa Calendar    | com.kalapamedia.kalapacalendar | Production  |
| `vajrayana` | Vajrayana Calendar | com.vajrayana.calendar         | In progress |

---

## Tech Stack

- **React Native 0.81.5** + **React 19**
- **Expo SDK 54** (managed workflow)
- **TypeScript 5.9**
- **EAS Build** for per-client App Store binaries
- Jest + Testing Library for tests

---

## Getting Started

### Prerequisites

- Node.js v22+
- Expo CLI (`npm install -g expo-cli`)
- Expo Go on your device, or an iOS/Android simulator

### Installation

```bash
npm install
```

### Environment variables

Copy `.env.example` to `.env` and fill in your values:

```
EXPO_PUBLIC_APP_CLIENT=kalapa
EXPO_PUBLIC_WP_BASE_URL=https://kalapamedia.com
EXPO_PUBLIC_FEEDBACK_WEBHOOK_URL=...
EXPO_PUBLIC_FEEDBACK_APP_TOKEN=...
```

---

## Running locally

```bash
# Start a specific client
npm run start:kalapa
npm run start:vajrayana

# Start with tunnel (for physical devices on different networks)
npm run start:kalapa:tunnel
npm run start:vajrayana:tunnel

# Generic start (uses EXPO_PUBLIC_APP_CLIENT from .env)
npm start

# Platform-specific
npm run ios
npm run android
```

A **⚙ clientId** badge appears in the top-left corner in dev mode to confirm which client is active.

---

## Running tests

```bash
npm test                  # full suite
npm run test:watch        # watch mode
npm run test:coverage     # with coverage report
```

---

## Building for TestFlight / Play Store

```bash
# Kalapa
eas build --profile preview           # internal preview
eas build --profile production        # App Store / Play Store

# Vajrayana
eas build --profile vajrayana-preview
eas build --profile vajrayana-production
```

---

## Adding a new client

1. Copy an existing config: `cp src/config/clients/kalapa.ts src/config/clients/newclient.ts`
2. Update `clientId`, `bundleId`, `androidPackage`, `theme`, `assets`, `features`, and `copy`
3. Register it in `src/config/index.ts`:
   ```ts
   import newclient from './clients/newclient';
   const clients = { kalapa, vajrayana, newclient };
   ```
4. Add build profiles to `eas.json`
5. Add a start script to `package.json`
6. Update the client table in this README and in `CLAUDE.md`

---

## Project structure

```
src/
├── config/               # White-label client configs
│   ├── types.ts          # ClientConfig TypeScript shape
│   ├── index.ts          # Active client selector
│   └── clients/          # One file per client
├── components/           # Shared UI components
├── constants/            # App-wide constants (dates, mantras, etc.)
├── screens/              # Full-screen views
├── theme/                # Design tokens and feature flags
│   ├── tokens.ts         # Colors, spacing, radius (merged with client config)
│   └── flags.ts          # Feature flags (driven by client config)
├── types/                # TypeScript interfaces
└── utils/                # Utility functions
```

---

## Feedback integration

The in-app feedback form posts to a Google Apps Script web app that writes to Google Sheets.

Required env vars:
- `EXPO_PUBLIC_FEEDBACK_WEBHOOK_URL`
- `EXPO_PUBLIC_FEEDBACK_APP_TOKEN`

See [`integrations/google-feedback-apps-script/README.md`](integrations/google-feedback-apps-script/README.md) for setup.

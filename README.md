# Simple Calendar App

A React Native calendar application built with Expo and TypeScript.

## Features

- 📅 Month view calendar
- 📱 Cross-platform (iOS, Android, Web)
- 🎨 Modern, clean UI
- ⚡ Built with TypeScript for type safety

## Project Structure

```
src/
├── components/   # Reusable UI components
├── screens/      # App screens
├── types/        # TypeScript type definitions
└── utils/        # Utility functions
```

## Getting Started

### Prerequisites

- Node.js (v22+)
- npm or yarn
- Expo Go app on your mobile device (for testing)

### Installation

```bash
npm install
```

### Running the App

```bash
# Start the Expo development server
npm start

# Run on iOS simulator
npm run ios

# Run on Android emulator
npm run android

# Run in web browser
npm run web
```

## Development

This project uses:
- **Expo** - React Native framework
- **TypeScript** - Type-safe JavaScript
- **React Native** - Cross-platform mobile development

## Feedback Ingestion Setup

The in-app feedback form can post to a Google Apps Script web app that writes to Google Sheets.

Required env vars:

- `EXPO_PUBLIC_FEEDBACK_WEBHOOK_URL`
- `EXPO_PUBLIC_FEEDBACK_APP_TOKEN`

Deployment template:

- See [`integrations/google-feedback-apps-script/README.md`](integrations/google-feedback-apps-script/README.md)

## Tech Stack

- React Native
- Expo SDK
- TypeScript
- React Hooks

---

Built with Gas Town multi-agent orchestration system

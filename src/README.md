# Project Structure

This document outlines the organization of the codebase.

## Directory Structure

```
src/
├── components/          # Reusable UI components
│   ├── calendar/        # Calendar-specific components
│   │   ├── CalendarGrid.tsx
│   │   ├── CalendarHeader.tsx
│   │   └── index.ts
│   └── navigation/      # Navigation components
│       ├── BottomNav.tsx
│       └── index.ts
├── screens/             # Full-screen views
│   ├── account/         # Account management screens
│   │   ├── AccountView.tsx
│   │   └── index.ts
│   ├── calendar/        # Calendar view screens
│   │   ├── DayView.tsx
│   │   └── index.ts
│   └── events/          # Event management screens
│       ├── AddEventView.tsx
│       ├── EditEventView.tsx
│       ├── EventView.tsx
│       └── index.ts
├── types/               # TypeScript type definitions
│   └── index.ts
└── constants/           # App-wide constants
    └── dates.ts
```

## Key Principles

### Components
- **calendar/**: Components specific to calendar rendering (grid, header)
- **navigation/**: Navigation-related components (bottom nav, etc.)

### Screens
- **account/**: User account and settings screens
- **calendar/**: Calendar viewing screens (month, day views)
- **events/**: Event creation, viewing, and editing screens

### Types
- Centralized TypeScript interfaces and type definitions
- Exports: `CalendarEvent`, `ViewMode`, `NavView`

### Constants
- **dates.ts**: Month names, day names, and other date-related constants

## Import Patterns

Use barrel exports for cleaner imports:

```typescript
// Good - uses barrel exports
import { CalendarHeader, CalendarGrid } from './src/components/calendar';
import { EventView, AddEventView } from './src/screens/events';
import { CalendarEvent, ViewMode } from './src/types';

// Avoid - direct file imports
import CalendarHeader from './src/components/calendar/CalendarHeader';
import EventView from './src/screens/events/EventView';
```

## Adding New Features

1. **New Component**: Add to appropriate `components/` subdirectory
2. **New Screen**: Add to appropriate `screens/` subdirectory
3. **New Type**: Add to `types/index.ts`
4. **New Constant**: Add to appropriate file in `constants/`
5. **Update barrel exports**: Add to relevant `index.ts` file

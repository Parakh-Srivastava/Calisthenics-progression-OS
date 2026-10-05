# Calisthenics Progression OS

> Your personal calisthenics progression operating system — a premium, offline-first PWA for tracking and progressing through a 30-month calisthenics program.

## Overview

Calisthenics OS is a **fully offline, mobile-first Progressive Web App** designed to feel like a high-end training operating system. Every piece of data is stored locally on your device using IndexedDB (via Dexie.js). No accounts, no cloud, no tracking.

### Five Primary Goals (30-Month Horizon)

| Goal | Target |
|------|--------|
| 🫸 One-Arm Push-Ups | 15 per arm |
| 💪 Pull-Ups | 15 reps |
| 🔱 Dips | 15 reps |
| 🦵 Pistol Squats | 15 per leg |
| 🤸 Handstand Push-Ups | 15 reps |

## Tech Stack

- **Vite** — Build tool
- **React 19** — UI framework
- **Tailwind CSS v4** — Styling
- **Framer Motion** — Animations
- **Dexie.js** — IndexedDB persistence (offline-first)
- **Recharts** — Analytics charts
- **Lucide React** — Icons
- **date-fns** — Date calculations
- **canvas-confetti** — Milestone celebrations
- **vite-plugin-pwa** — Service worker & PWA configuration
- **React Router** — Client-side routing

## Getting Started

### Prerequisites

- Node.js 18+
- npm 9+

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Opens at `http://localhost:5173`

### Production Build

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## PWA Installation

### Desktop (Chrome/Edge)

1. Visit the app URL
2. Click the install icon in the address bar
3. Click "Install"

### Android (Chrome)

1. Visit the app URL
2. Tap "Add to Home Screen" in the browser menu
3. The app will launch in standalone mode

### iOS (Safari)

1. Visit the app URL
2. Tap the Share button
3. Tap "Add to Home Screen"

## Offline Behavior

After the first visit, all application assets are cached by the service worker. The app works with:

- ✅ Airplane mode
- ✅ No Wi-Fi
- ✅ No mobile data
- ✅ No server
- ✅ No account

All workout data, goals, achievements, and settings are stored in IndexedDB and persist across browser sessions, app restarts, and device reboots.

## Android Packaging (Capacitor)

The app is structured for Capacitor packaging:

```bash
# Install Capacitor
npm install @capacitor/core @capacitor/cli

# Initialize Capacitor
npx cap init "Calisthenics OS" "com.calisthenics.os" --web-dir dist

# Build the web app
npm run build

# Add Android platform
npx cap add android

# Sync web assets to native project
npx cap sync

# Open in Android Studio
npx cap open android
```

Then build and run from Android Studio.

## Project Structure

```
src/
├── App.jsx                    # Main app with routing
├── main.jsx                   # Entry point
├── index.css                  # Global styles & design system
├── components/
│   ├── navigation/
│   │   └── BottomNav.jsx      # Bottom navigation bar
│   └── ui/
│       ├── BottomSheet.jsx    # Bottom sheet & confirm modal
│       ├── Card.jsx           # Card, StatCard, EmptyState
│       └── ProgressRing.jsx   # SVG progress ring & bar
├── data/
│   ├── exercises.js           # Exercise library (20+ exercises)
│   ├── progressions.js        # Progression trees for 5 goals
│   └── schedule.js            # Weekly schedule & achievements
├── db/
│   ├── database.js            # Dexie schema & settings helpers
│   └── services.js            # All database operations
├── hooks/
│   ├── useDatabase.js         # Reactive Dexie hooks
│   └── useTimer.js            # Timer, stopwatch, haptics, online status
├── pages/
│   ├── ActiveWorkout.jsx      # Focus mode workout execution
│   ├── AchievementsPage.jsx   # Achievement unlocks
│   ├── AnalyticsPage.jsx      # Charts & analytics dashboard
│   ├── CalendarPage.jsx       # Monthly calendar view
│   ├── Dashboard.jsx          # Home dashboard
│   ├── ExerciseLibraryPage.jsx # Searchable exercise database
│   ├── GoalsPage.jsx          # Goals overview & detail
│   ├── HistoryPage.jsx        # Workout history & detail
│   ├── MorePage.jsx           # Navigation hub
│   ├── Onboarding.jsx         # First-launch onboarding flow
│   ├── PRsPage.jsx            # Personal records
│   ├── ProgressPage.jsx       # Progress tracking & charts
│   ├── ProgressionTreesPage.jsx # Visual progression trees
│   ├── RecoveryPage.jsx       # Recovery & readiness tracking
│   └── SettingsPage.jsx       # Settings, export/import, reset
└── utils/
    └── helpers.js             # Date, formatting, calculation utilities
```

## Database Schema (Dexie / IndexedDB)

| Store | Purpose |
|-------|---------|
| `settings` | App preferences |
| `goals` | Five primary goals + custom goals |
| `goalHistory` | Goal achievement history |
| `exercises` | Exercise library |
| `workouts` | Workout sessions |
| `workoutSets` | Individual set logs |
| `progressions` | Progression tree state |
| `personalRecords` | PRs per exercise |
| `achievements` | Unlocked achievements |
| `recoveryLogs` | Daily recovery entries |
| `painLogs` | Exercise-specific pain tracking |
| `calendarEvents` | Calendar markers |
| `customWorkouts` | User-created workouts |
| `weeklySchedule` | Customizable weekly plan |
| `progressPhotos` | Local progress photos |

## Features

### Core Training
- 📋 **Weekly program** — Push/Pull/Legs/Upper/Lower/Rest split
- 🎯 **Focus mode** — Distraction-free workout execution
- ⏱️ **Rest timer** — Countdown with +15s/+30s/+60s/skip
- 📊 **RIR tracking** — Reps in reserve (0-3 + failure)
- 🦵 **Unilateral tracking** — Independent left/right tracking

### Goal System
- 🎯 **Five primary goals** with 30-month timeline
- 🌳 **Progression trees** — Visual path from beginner to goal
- 🏆 **Early achievement** — Raise target, add variation, or continue
- 📈 **Progress rings** — Animated goal completion visualization

### Analytics & History
- 📊 **Volume charts** — Reps, sets, frequency over time
- 📅 **Calendar view** — Monthly view with workout/rest/PR indicators
- 🏆 **Personal records** — Automatic PR detection and tracking
- 📈 **Streak tracking** — Rest-day-aware consistency tracking

### Recovery & Safety
- 😴 **Recovery tracking** — Sleep, energy, soreness, stress
- ⚠️ **Pain tracking** — Exercise-specific with safety reminders
- 🛡️ **Skill exercise warnings** — "DO NOT TRAIN TO FAILURE"

### Data Management
- 💾 **JSON export** — Complete data backup
- 📥 **JSON import** — Merge or replace data
- 🗑️ **Reset options** — Progress, workouts, or everything
- 🔒 **Privacy** — All data stays on device

## Key Design Principles

1. **Offline-first** — Works without internet, always
2. **Mobile-first** — Designed for one-handed operation
3. **Performance-oriented** — Not gamified; visible progress is the motivation
4. **Safety-conscious** — Never encourages training through pain
5. **Long-term** — Built for 30 months of progression tracking

## Privacy

- ✅ All data stored locally (IndexedDB)
- ✅ No analytics or tracking
- ✅ No external requests
- ✅ No accounts or auth
- ✅ No telemetry
- ✅ No third-party cloud storage

## License

Private project.

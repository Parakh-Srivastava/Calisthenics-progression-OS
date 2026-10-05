import Dexie from 'dexie';

export const db = new Dexie('CalisthenicsOS');

db.version(1).stores({
  settings: 'key',
  goals: '++id, name, category, createdAt',
  goalHistory: '++id, goalId, type, createdAt',
  exercises: '++id, name, category, muscleGroup, createdAt',
  workouts: '++id, date, dayType, status, createdAt',
  workoutSets: '++id, workoutId, exerciseId, setNumber, createdAt',
  progressions: '++id, goalId, exerciseId, level, createdAt',
  personalRecords: '++id, exerciseId, type, value, createdAt',
  achievements: '++id, key, unlockedAt',
  recoveryLogs: '++id, date, createdAt',
  painLogs: '++id, exerciseId, workoutId, date, createdAt',
  calendarEvents: '++id, date, type, createdAt',
  customWorkouts: '++id, name, createdAt',
  weeklySchedule: '++id, dayOfWeek',
  progressPhotos: '++id, date, type, createdAt',
});

// Default settings
export const DEFAULT_SETTINGS = {
  theme: 'dark',
  accentColor: 'violet',
  units: 'metric',
  soundEnabled: true,
  hapticsEnabled: true,
  notificationsEnabled: false,
  defaultRestTime: 60,
  defaultRIR: 2,
  weekStartDay: 1, // Monday
  programStartDate: null,
  onboardingComplete: false,
  userName: '',
};

// Helper to get a setting
export async function getSetting(key) {
  const row = await db.settings.get(key);
  return row ? row.value : DEFAULT_SETTINGS[key] ?? null;
}

// Helper to set a setting
export async function setSetting(key, value) {
  await db.settings.put({ key, value, updatedAt: new Date().toISOString() });
}

// Helper to get all settings as object
export async function getAllSettings() {
  const rows = await db.settings.toArray();
  const settings = { ...DEFAULT_SETTINGS };
  rows.forEach(row => {
    settings[row.key] = row.value;
  });
  return settings;
}

export default db;

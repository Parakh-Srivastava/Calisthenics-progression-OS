import { db, setSetting } from './database';
import { DEFAULT_EXERCISES } from '../data/exercises';
import { DEFAULT_SCHEDULE, WORKOUT_TEMPLATES } from '../data/schedule';
import { PROGRESSION_TREES, GOAL_CATEGORIES } from '../data/progressions';
import { todayString } from '../utils/helpers';

/** Initialize the database with default data on first launch */
export async function initializeDatabase(programStartDate, abilities = {}) {
  const now = new Date().toISOString();

  // Save settings
  await setSetting('programStartDate', programStartDate);
  await setSetting('onboardingComplete', true);

  // Insert default exercises
  const existingExercises = await db.exercises.count();
  if (existingExercises === 0) {
    const exercises = DEFAULT_EXERCISES.map(ex => ({
      ...ex,
      createdAt: now,
      updatedAt: now,
    }));
    await db.exercises.bulkAdd(exercises);
  }

  // Insert default goals
  const existingGoals = await db.goals.count();
  if (existingGoals === 0) {
    const goals = Object.entries(GOAL_CATEGORIES).map(([key, cat]) => ({
      name: cat.name,
      category: key,
      target: PROGRESSION_TREES[key].target,
      currentBest: 0,
      currentLevel: abilities[key] || 0,
      progressionTreeId: cat.progressionTree,
      color: cat.color,
      achievedAt: null,
      originalTarget: PROGRESSION_TREES[key].target,
      deadline: null,
      status: 'active',
      createdAt: now,
      updatedAt: now,
    }));
    await db.goals.bulkAdd(goals);
  }

  // Insert default weekly schedule
  const existingSchedule = await db.weeklySchedule.count();
  if (existingSchedule === 0) {
    await db.weeklySchedule.bulkAdd(DEFAULT_SCHEDULE.map(d => ({
      ...d,
      createdAt: now,
      updatedAt: now,
    })));
  }
}

/** Log a completed workout */
export async function saveWorkout(workout) {
  const now = new Date().toISOString();
  const id = await db.workouts.add({
    ...workout,
    createdAt: now,
    updatedAt: now,
  });
  return id;
}

/** Log a set */
export async function saveWorkoutSet(set) {
  const now = new Date().toISOString();
  const id = await db.workoutSets.add({
    ...set,
    createdAt: now,
    updatedAt: now,
  });
  return id;
}

/** Update a workout */
export async function updateWorkout(id, changes) {
  await db.workouts.update(id, {
    ...changes,
    updatedAt: new Date().toISOString(),
  });
}

/** Get today's workout */
export async function getTodayWorkout() {
  const today = todayString();
  return await db.workouts.where('date').equals(today).first();
}

/** Get workout template for a day type */
export function getWorkoutTemplate(dayType) {
  return WORKOUT_TEMPLATES[dayType] || null;
}

/** Check and update personal records after a set */
export async function checkPersonalRecord(exerciseId, type, value) {
  const now = new Date().toISOString();
  const existing = await db.personalRecords
    .where('exerciseId').equals(exerciseId)
    .filter(r => r.type === type)
    .first();

  if (!existing || value > existing.value) {
    const prData = {
      exerciseId,
      type,
      value,
      previousValue: existing?.value || null,
      date: todayString(),
      createdAt: now,
      updatedAt: now,
    };

    if (existing) {
      await db.personalRecords.update(existing.id, prData);
    } else {
      await db.personalRecords.add(prData);
    }

    return { isNewPR: true, previousValue: existing?.value || null, newValue: value };
  }

  return { isNewPR: false };
}

/** Update a goal's current best */
export async function updateGoalProgress(goalId, currentBest) {
  const goal = await db.goals.get(goalId);
  if (!goal) return null;

  const updates = {
    currentBest: Math.max(goal.currentBest || 0, currentBest),
    updatedAt: new Date().toISOString(),
  };

  // Check if goal achieved
  if (currentBest >= goal.target && !goal.achievedAt) {
    updates.achievedAt = new Date().toISOString();
    updates.status = 'achieved';

    // Log goal history
    await db.goalHistory.add({
      goalId,
      type: 'achieved',
      value: currentBest,
      target: goal.target,
      createdAt: new Date().toISOString(),
    });
  }

  await db.goals.update(goalId, updates);
  return updates;
}

/** Create a new advanced goal after achieving one */
export async function createAdvancedGoal(originalGoalId, newTarget, newName, variation) {
  const now = new Date().toISOString();
  const original = await db.goals.get(originalGoalId);
  if (!original) return null;

  // Log history
  await db.goalHistory.add({
    goalId: originalGoalId,
    type: 'advanced',
    value: original.currentBest,
    newTarget,
    newName: newName || variation,
    createdAt: now,
  });

  // Update goal
  await db.goals.update(originalGoalId, {
    target: newTarget,
    name: newName || original.name,
    status: 'active',
    updatedAt: now,
  });
}

/** Save recovery log */
export async function saveRecoveryLog(data) {
  const now = new Date().toISOString();
  const today = todayString();

  // Check if already logged today
  const existing = await db.recoveryLogs.where('date').equals(today).first();
  if (existing) {
    await db.recoveryLogs.update(existing.id, { ...data, updatedAt: now });
    return existing.id;
  }

  return await db.recoveryLogs.add({
    ...data,
    date: today,
    createdAt: now,
    updatedAt: now,
  });
}

/** Save pain log */
export async function savePainLog(data) {
  const now = new Date().toISOString();
  return await db.painLogs.add({
    ...data,
    date: todayString(),
    createdAt: now,
    updatedAt: now,
  });
}

/** Unlock achievement */
export async function unlockAchievement(key) {
  const existing = await db.achievements.where('key').equals(key).first();
  if (existing) return false; // already unlocked

  await db.achievements.add({
    key,
    unlockedAt: new Date().toISOString(),
  });
  return true;
}

/** Check all achievement conditions */
export async function checkAchievements() {
  const workoutCount = await db.workouts.where('status').equals('completed').count();
  const prCount = await db.personalRecords.count();
  const totalReps = await db.workoutSets.toArray().then(sets =>
    sets.reduce((sum, s) => sum + (s.reps || 0), 0)
  );

  const unlocked = [];

  if (workoutCount >= 1) {
    const r = await unlockAchievement('first-workout');
    if (r) unlocked.push('first-workout');
  }
  if (workoutCount >= 100) {
    const r = await unlockAchievement('100-workouts');
    if (r) unlocked.push('100-workouts');
  }
  if (prCount >= 1) {
    const r = await unlockAchievement('first-pr');
    if (r) unlocked.push('first-pr');
  }
  if (prCount >= 10) {
    const r = await unlockAchievement('10-prs');
    if (r) unlocked.push('10-prs');
  }
  if (prCount >= 50) {
    const r = await unlockAchievement('50-prs');
    if (r) unlocked.push('50-prs');
  }
  if (totalReps >= 1000) {
    const r = await unlockAchievement('1000-reps');
    if (r) unlocked.push('1000-reps');
  }
  if (totalReps >= 10000) {
    const r = await unlockAchievement('10000-reps');
    if (r) unlocked.push('10000-reps');
  }

  return unlocked;
}

/** Export all data as JSON */
export async function exportAllData() {
  const data = {
    version: 1,
    exportDate: new Date().toISOString(),
    settings: await db.settings.toArray(),
    goals: await db.goals.toArray(),
    goalHistory: await db.goalHistory.toArray(),
    exercises: await db.exercises.toArray(),
    workouts: await db.workouts.toArray(),
    workoutSets: await db.workoutSets.toArray(),
    progressions: await db.progressions.toArray(),
    personalRecords: await db.personalRecords.toArray(),
    achievements: await db.achievements.toArray(),
    recoveryLogs: await db.recoveryLogs.toArray(),
    painLogs: await db.painLogs.toArray(),
    calendarEvents: await db.calendarEvents.toArray(),
    customWorkouts: await db.customWorkouts.toArray(),
    weeklySchedule: await db.weeklySchedule.toArray(),
  };
  return data;
}

/** Import data from JSON */
export async function importData(data, mode = 'merge') {
  if (!data || !data.version) {
    throw new Error('Invalid backup file format');
  }

  if (mode === 'replace') {
    // Clear all tables
    await Promise.all([
      db.settings.clear(),
      db.goals.clear(),
      db.goalHistory.clear(),
      db.exercises.clear(),
      db.workouts.clear(),
      db.workoutSets.clear(),
      db.progressions.clear(),
      db.personalRecords.clear(),
      db.achievements.clear(),
      db.recoveryLogs.clear(),
      db.painLogs.clear(),
      db.calendarEvents.clear(),
      db.customWorkouts.clear(),
      db.weeklySchedule.clear(),
    ]);
  }

  // Import each table
  const tables = [
    'settings', 'goals', 'goalHistory', 'exercises', 'workouts',
    'workoutSets', 'progressions', 'personalRecords', 'achievements',
    'recoveryLogs', 'painLogs', 'calendarEvents', 'customWorkouts', 'weeklySchedule',
  ];

  for (const table of tables) {
    if (data[table] && data[table].length > 0) {
      if (mode === 'replace') {
        await db[table].bulkAdd(data[table]);
      } else {
        // Merge: put (upsert)
        await db[table].bulkPut(data[table]);
      }
    }
  }
}

/** Reset specific data */
export async function resetData(type) {
  switch (type) {
    case 'progress':
      await Promise.all([
        db.workouts.clear(),
        db.workoutSets.clear(),
        db.personalRecords.clear(),
        db.achievements.clear(),
        db.calendarEvents.clear(),
      ]);
      // Reset goal progress
      const goals = await db.goals.toArray();
      for (const goal of goals) {
        await db.goals.update(goal.id, { currentBest: 0, achievedAt: null, status: 'active' });
      }
      break;
    case 'workouts':
      await Promise.all([
        db.workouts.clear(),
        db.workoutSets.clear(),
      ]);
      break;
    case 'everything':
      await Promise.all(Object.keys(db._dbSchema).map(table => db[table].clear()));
      break;
    default:
      break;
  }
}

/** Get stats for analytics */
export async function getStats(days = 30) {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);
  const cutoffStr = cutoff.toISOString().split('T')[0];

  const workouts = await db.workouts
    .where('date').aboveOrEqual(cutoffStr)
    .toArray();

  const completedWorkouts = workouts.filter(w => w.status === 'completed');

  const workoutIds = completedWorkouts.map(w => w.id);
  const allSets = await db.workoutSets.toArray();
  const sets = allSets.filter(s => workoutIds.includes(s.workoutId));

  const totalSets = sets.length;
  const totalReps = sets.reduce((sum, s) => sum + (s.reps || 0), 0);
  const totalDuration = sets.reduce((sum, s) => sum + (s.duration || 0), 0);

  // Exercise frequency
  const exerciseFreq = {};
  sets.forEach(s => {
    exerciseFreq[s.exerciseId] = (exerciseFreq[s.exerciseId] || 0) + 1;
  });

  return {
    totalWorkouts: completedWorkouts.length,
    totalSets,
    totalReps,
    totalDuration,
    exerciseFrequency: exerciseFreq,
    workoutsPerWeek: completedWorkouts.length / (days / 7),
  };
}

/** Calculate workout streak */
export async function getWorkoutStreak() {
  const schedule = await db.weeklySchedule.toArray();
  const restDays = schedule.filter(d => d.type === 'rest').map(d => d.dayOfWeek);

  const workouts = await db.workouts
    .where('status').equals('completed')
    .toArray();

  const workoutDates = new Set(workouts.map(w => w.date));

  let streak = 0;
  let checkDate = new Date();

  for (let i = 0; i < 365; i++) {
    const dateStr = checkDate.toISOString().split('T')[0];
    const dayOfWeek = checkDate.getDay();

    if (restDays.includes(dayOfWeek)) {
      // Rest day counts as adherence
      streak++;
    } else if (workoutDates.has(dateStr)) {
      streak++;
    } else {
      // If it's today and we haven't worked out yet, skip
      if (i === 0) {
        checkDate.setDate(checkDate.getDate() - 1);
        continue;
      }
      break;
    }
    checkDate.setDate(checkDate.getDate() - 1);
  }

  return streak;
}

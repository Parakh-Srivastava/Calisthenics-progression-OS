import { useLiveQuery } from 'dexie-react-hooks';
import { db, getSetting, setSetting, getAllSettings } from '../db/database';

/** Hook to reactively read all settings */
export function useSettings() {
  const settings = useLiveQuery(async () => {
    return await getAllSettings();
  }, []);

  return settings || {};
}

/** Hook to reactively read a single setting */
export function useSetting(key) {
  const value = useLiveQuery(async () => {
    return await getSetting(key);
  }, [key]);

  const update = async (newValue) => {
    await setSetting(key, newValue);
  };

  return [value, update];
}

/** Hook for all workouts */
export function useWorkouts() {
  return useLiveQuery(() => db.workouts.orderBy('date').reverse().toArray()) || [];
}

/** Hook for a specific workout */
export function useWorkout(id) {
  return useLiveQuery(() => id ? db.workouts.get(Number(id)) : null, [id]);
}

/** Hook for workout sets for a workout */
export function useWorkoutSets(workoutId) {
  return useLiveQuery(
    () => workoutId ? db.workoutSets.where('workoutId').equals(Number(workoutId)).toArray() : [],
    [workoutId]
  ) || [];
}

/** Hook for all goals */
export function useGoals() {
  return useLiveQuery(() => db.goals.toArray()) || [];
}

/** Hook for goal history */
export function useGoalHistory(goalId) {
  return useLiveQuery(
    () => goalId ? db.goalHistory.where('goalId').equals(goalId).toArray() : [],
    [goalId]
  ) || [];
}

/** Hook for personal records */
export function usePersonalRecords(exerciseId) {
  return useLiveQuery(
    () => exerciseId
      ? db.personalRecords.where('exerciseId').equals(exerciseId).toArray()
      : db.personalRecords.toArray(),
    [exerciseId]
  ) || [];
}

/** Hook for all achievements */
export function useAchievements() {
  return useLiveQuery(() => db.achievements.toArray()) || [];
}

/** Hook for recovery logs */
export function useRecoveryLogs() {
  return useLiveQuery(() => db.recoveryLogs.orderBy('date').reverse().toArray()) || [];
}

/** Hook for pain logs */
export function usePainLogs() {
  return useLiveQuery(() => db.painLogs.orderBy('date').reverse().toArray()) || [];
}

/** Hook for exercises */
export function useExercises() {
  return useLiveQuery(() => db.exercises.toArray()) || [];
}

/** Hook for custom workouts */
export function useCustomWorkouts() {
  return useLiveQuery(() => db.customWorkouts.toArray()) || [];
}

/** Hook for progress photos */
export function useProgressPhotos() {
  return useLiveQuery(() => db.progressPhotos.orderBy('date').reverse().toArray()) || [];
}

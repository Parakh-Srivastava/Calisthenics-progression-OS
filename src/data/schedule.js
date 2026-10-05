// Weekly schedule data

export const DAY_TYPES = {
  PUSH: 'push',
  PULL: 'pull',
  LEGS: 'legs',
  UPPER: 'upper',
  LOWER: 'lower',
  REST: 'rest',
};

export const DEFAULT_SCHEDULE = [
  { dayOfWeek: 1, name: 'Monday', type: DAY_TYPES.PUSH, label: 'Push + Plank', icon: '🫸' },
  { dayOfWeek: 2, name: 'Tuesday', type: DAY_TYPES.PULL, label: 'Pull + Plank', icon: '💪' },
  { dayOfWeek: 3, name: 'Wednesday', type: DAY_TYPES.LEGS, label: 'Legs', icon: '🦵' },
  { dayOfWeek: 4, name: 'Thursday', type: DAY_TYPES.REST, label: 'Rest / Recovery', icon: '🧘' },
  { dayOfWeek: 5, name: 'Friday', type: DAY_TYPES.UPPER, label: 'Upper + Plank', icon: '🔱' },
  { dayOfWeek: 6, name: 'Saturday', type: DAY_TYPES.LOWER, label: 'Lower + Plank', icon: '🏋️' },
  { dayOfWeek: 0, name: 'Sunday', type: DAY_TYPES.REST, label: 'Rest', icon: '😴' },
];

// Default workout templates for each day type
export const WORKOUT_TEMPLATES = {
  [DAY_TYPES.PUSH]: {
    name: 'Push + Plank',
    exercises: [
      { exerciseId: 'pushups', sets: 3, targetReps: [13, 14, 15], restTime: 60, notes: 'Last set may approach failure' },
      { exerciseId: 'pike-pushups', sets: 3, targetReps: [5, 6, 7], restTime: 90, notes: '' },
      { exerciseId: 'bench-dips', sets: 3, targetReps: [13, 14, 15], restTime: 60, notes: '' },
      { exerciseId: 'plank', sets: 3, targetDuration: [50, 55, null], restTime: 60, notes: 'Goal: 2 minutes. Last set to failure.', isTimeBased: true },
    ],
  },
  [DAY_TYPES.PULL]: {
    name: 'Pull + Plank',
    exercises: [
      { exerciseId: 'dead-hangs', sets: 3, targetDuration: [20, 25, 30], restTime: 60, isTimeBased: true, notes: 'Focus on grip' },
      { exerciseId: 'scapular-pulls', sets: 3, targetReps: [8, 8, 8], restTime: 60, notes: '' },
      { exerciseId: 'band-rows', sets: 3, targetReps: [12, 12, 12], restTime: 60, notes: '' },
      { exerciseId: 'band-face-pulls', sets: 3, targetReps: [15, 15, 15], restTime: 45, notes: '' },
      { exerciseId: 'bicep-curls', sets: 3, targetReps: [12, 12, 12], restTime: 45, notes: '' },
      { exerciseId: 'hammer-curls', sets: 3, targetReps: [12, 12, 12], restTime: 45, notes: '' },
      { exerciseId: 'plank', sets: 3, targetDuration: [50, 55, null], restTime: 60, isTimeBased: true, notes: 'Last set to failure' },
    ],
  },
  [DAY_TYPES.LEGS]: {
    name: 'Legs',
    exercises: [
      { exerciseId: 'lunges', sets: 3, targetReps: [12, 12, 12], restTime: 60, unilateral: true, notes: 'Track each leg' },
      { exerciseId: 'bulgarian-split-squats', sets: 3, targetReps: [10, 10, 10], restTime: 90, unilateral: true, notes: 'Track each leg' },
      { exerciseId: 'glute-bridges', sets: 3, targetReps: [15, 15, 15], restTime: 45, notes: '' },
      { exerciseId: 'squats', sets: 3, targetReps: [15, 15, 15], restTime: 60, notes: '' },
      { exerciseId: 'good-mornings', sets: 3, targetReps: [12, 12, 12], restTime: 60, notes: 'Hamstring work' },
    ],
  },
  [DAY_TYPES.UPPER]: {
    name: 'Upper + Plank',
    skillExercises: [
      { exerciseId: 'dead-hangs', sets: 3, targetDuration: [20, 25, 30], restTime: 60, isTimeBased: true, isSkill: true, notes: 'SKILL — DO NOT TRAIN TO FAILURE' },
      { exerciseId: 'negatives', sets: 3, targetReps: [3, 3, 3], restTime: 120, isSkill: true, notes: 'SKILL — DO NOT TRAIN TO FAILURE' },
      { exerciseId: 'dips-top-half', sets: 3, targetReps: [5, 5, 5], restTime: 90, isSkill: true, notes: 'SKILL — DO NOT TRAIN TO FAILURE' },
    ],
    exercises: [
      { exerciseId: 'pike-pushups', sets: 3, targetReps: [5, 6, 7], restTime: 90, notes: '' },
      { exerciseId: 'decline-pushups', sets: 3, targetReps: [10, 12, 12], restTime: 60, notes: '' },
      { exerciseId: 'plank', sets: 3, targetDuration: [50, 55, null], restTime: 60, isTimeBased: true, notes: 'Last set to failure' },
    ],
  },
  [DAY_TYPES.LOWER]: {
    name: 'Lower + Plank',
    exercises: [
      { exerciseId: 'lunges', sets: 3, targetReps: [12, 12, 12], restTime: 60, unilateral: true, notes: 'Track each leg' },
      { exerciseId: 'bulgarian-split-squats', sets: 3, targetReps: [10, 10, 10], restTime: 90, unilateral: true, notes: 'Track each leg' },
      { exerciseId: 'glute-bridges', sets: 3, targetReps: [15, 15, 15], restTime: 45, notes: '' },
      { exerciseId: 'squats', sets: 3, targetReps: [15, 15, 15], restTime: 60, notes: '' },
      { exerciseId: 'good-mornings', sets: 3, targetReps: [12, 12, 12], restTime: 60, notes: 'Hamstring work' },
      { exerciseId: 'plank', sets: 3, targetDuration: [50, 55, null], restTime: 60, isTimeBased: true, notes: 'Last set to failure' },
    ],
  },
};

export const ACHIEVEMENTS_LIST = [
  { key: 'first-workout', name: 'First Workout', description: 'Complete your first workout', icon: '🏁', condition: 'workouts >= 1' },
  { key: '7-day-streak', name: '7 Day Consistency', description: 'Work out consistently for 7 days', icon: '🔥', condition: 'streak >= 7' },
  { key: '30-day-streak', name: '30 Day Consistency', description: 'Work out consistently for 30 days', icon: '🔥', condition: 'streak >= 30' },
  { key: '100-workouts', name: '100 Workouts', description: 'Complete 100 workouts', icon: '💯', condition: 'workouts >= 100' },
  { key: 'first-pullup', name: 'First Pull-Up', description: 'Complete your first unassisted pull-up', icon: '💪', condition: 'pullup_unlocked' },
  { key: 'first-dip', name: 'First Dip', description: 'Complete your first parallel-bar dip', icon: '🔱', condition: 'dip_unlocked' },
  { key: 'first-pistol', name: 'First Pistol', description: 'Complete your first pistol squat', icon: '🦵', condition: 'pistol_unlocked' },
  { key: 'first-hspu', name: 'First HSPU', description: 'Complete your first wall HSPU', icon: '🤸', condition: 'hspu_unlocked' },
  { key: 'first-oapu', name: 'First One-Arm Push-Up', description: 'Complete your first one-arm push-up', icon: '🫸', condition: 'oapu_unlocked' },
  { key: 'first-pr', name: 'First PR', description: 'Set your first personal record', icon: '🏆', condition: 'prs >= 1' },
  { key: '10-prs', name: '10 PRs', description: 'Set 10 personal records', icon: '🏆', condition: 'prs >= 10' },
  { key: '50-prs', name: '50 PRs', description: 'Set 50 personal records', icon: '🏆', condition: 'prs >= 50' },
  { key: 'goal-achieved', name: 'Goal Achieved', description: 'Achieve one of your five primary goals', icon: '🎯', condition: 'goals_achieved >= 1' },
  { key: 'goal-early', name: 'Goal Achieved Early', description: 'Achieve a goal ahead of schedule', icon: '⚡', condition: 'goals_early >= 1' },
  { key: 'goal-crushed', name: 'Goal Crushed', description: 'Achieve all five primary goals', icon: '👑', condition: 'goals_achieved >= 5' },
  { key: '1000-reps', name: '1,000 Total Reps', description: 'Complete 1,000 total reps', icon: '📊', condition: 'total_reps >= 1000' },
  { key: '10000-reps', name: '10,000 Total Reps', description: 'Complete 10,000 total reps', icon: '📊', condition: 'total_reps >= 10000' },
  { key: '90-day-streak', name: '90 Day Consistency', description: 'Work out consistently for 90 days', icon: '🔥', condition: 'streak >= 90' },
  { key: '365-day-streak', name: '365 Day Consistency', description: 'One full year of consistency', icon: '👑', condition: 'streak >= 365' },
];

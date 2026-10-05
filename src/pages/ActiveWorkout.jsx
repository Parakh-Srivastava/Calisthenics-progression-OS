import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, SkipForward, Edit3, Timer, Plus, Minus, AlertCircle, ChevronDown } from 'lucide-react';
import { db } from '../db/database';
import { saveWorkout, saveWorkoutSet, checkPersonalRecord, checkAchievements } from '../db/services';
import { DEFAULT_SCHEDULE, WORKOUT_TEMPLATES } from '../data/schedule';
import { EXERCISE_MAP } from '../data/exercises';
import { useTimer } from '../hooks/useTimer';
import { useHaptics } from '../hooks/useTimer';
import { formatTime, todayString } from '../utils/helpers';
import BottomSheet from '../components/ui/BottomSheet';
import confetti from 'canvas-confetti';

export default function ActiveWorkout() {
  const navigate = useNavigate();
  const { vibrate } = useHaptics();

  // Workout state
  const [workoutId, setWorkoutId] = useState(null);
  const [exercises, setExercises] = useState([]);
  const [currentExIndex, setCurrentExIndex] = useState(0);
  const [currentSetIndex, setCurrentSetIndex] = useState(0);
  const [completedSets, setCompletedSets] = useState([]);
  const [isResting, setIsResting] = useState(false);
  const [showCompleteSheet, setShowCompleteSheet] = useState(false);
  const [showEditSheet, setShowEditSheet] = useState(false);
  const [showPainSheet, setShowPainSheet] = useState(false);
  const [workoutComplete, setWorkoutComplete] = useState(false);
  const [newPRs, setNewPRs] = useState([]);

  // Current set input
  const [reps, setReps] = useState(0);
  const [duration, setDuration] = useState(0);
  const [rir, setRir] = useState(2);
  const [setNotes, setSetNotes] = useState('');
  const [painLevel, setPainLevel] = useState(0);

  // Rest timer
  const restTimer = useTimer(60);

  // Workout stopwatch (counts up for timed exercises)
  const exerciseTimer = useTimer(0);

  // Initialize workout
  useEffect(() => {
    const dayOfWeek = new Date().getDay();
    const schedule = DEFAULT_SCHEDULE.find(d => d.dayOfWeek === dayOfWeek);

    if (!schedule || schedule.type === 'rest') {
      navigate('/workout');
      return;
    }

    const template = WORKOUT_TEMPLATES[schedule.type];
    if (!template) {
      navigate('/workout');
      return;
    }

    // Combine skill and strength exercises
    const allExercises = [
      ...(template.skillExercises || []).map(ex => ({ ...ex, isSkill: true })),
      ...template.exercises,
    ];

    setExercises(allExercises);

    // Set initial reps target
    if (allExercises.length > 0) {
      const first = allExercises[0];
      if (first.isTimeBased) {
        setDuration(first.targetDuration?.[0] || 30);
      } else {
        setReps(first.targetReps?.[0] || 10);
      }
    }

    // Create workout record
    const initWorkout = async () => {
      const existing = await db.workouts.where('date').equals(todayString()).first();
      if (existing) {
        setWorkoutId(existing.id);
        // Load existing sets
        const sets = await db.workoutSets.where('workoutId').equals(existing.id).toArray();
        setCompletedSets(sets);
        // Resume from where left off
        if (sets.length > 0) {
          const lastSet = sets[sets.length - 1];
          const exIdx = allExercises.findIndex(e => e.exerciseId === lastSet.exerciseId);
          if (exIdx >= 0) {
            const setsForEx = sets.filter(s => s.exerciseId === lastSet.exerciseId);
            if (setsForEx.length >= allExercises[exIdx].sets) {
              setCurrentExIndex(Math.min(exIdx + 1, allExercises.length - 1));
              setCurrentSetIndex(0);
            } else {
              setCurrentExIndex(exIdx);
              setCurrentSetIndex(setsForEx.length);
            }
          }
        }
      } else {
        const id = await saveWorkout({
          date: todayString(),
          dayType: schedule.type,
          dayLabel: schedule.label,
          status: 'in-progress',
          totalSets: 0,
          totalReps: 0,
          startedAt: new Date().toISOString(),
        });
        setWorkoutId(id);
      }
    };

    initWorkout();
  }, [navigate]);

  const currentExercise = exercises[currentExIndex];
  const exerciseInfo = currentExercise ? EXERCISE_MAP[currentExercise.exerciseId] : null;
  const isTimeBased = currentExercise?.isTimeBased;
  const isSkill = currentExercise?.isSkill;
  const totalExercises = exercises.length;
  const setsForCurrentExercise = completedSets.filter(
    s => s.exerciseId === currentExercise?.exerciseId
  );

  // Update reps/duration when exercise changes
  useEffect(() => {
    if (currentExercise) {
      if (isTimeBased) {
        const target = currentExercise.targetDuration?.[currentSetIndex] || 30;
        setDuration(target || 30);
      } else {
        const target = currentExercise.targetReps?.[currentSetIndex] || 10;
        setReps(target);
      }
      setRir(isSkill ? 3 : 2);
      setSetNotes('');
      setPainLevel(0);
    }
  }, [currentExIndex, currentSetIndex, currentExercise, isTimeBased, isSkill]);

  const handleCompleteSet = useCallback(async () => {
    if (!workoutId || !currentExercise) return;

    vibrate(20);

    const setData = {
      workoutId,
      exerciseId: currentExercise.exerciseId,
      setNumber: currentSetIndex + 1,
      reps: isTimeBased ? null : reps,
      duration: isTimeBased ? duration : null,
      weight: null,
      resistanceBand: null,
      rir,
      failure: rir <= 0,
      notes: setNotes,
      painLevel: painLevel > 0 ? painLevel : null,
      date: todayString(),
      timestamp: new Date().toISOString(),
    };

    const setId = await saveWorkoutSet(setData);
    setCompletedSets(prev => [...prev, { ...setData, id: setId }]);

    // Check PR
    if (!isTimeBased && reps > 0) {
      const prResult = await checkPersonalRecord(currentExercise.exerciseId, 'reps', reps);
      if (prResult.isNewPR) {
        setNewPRs(prev => [...prev, { exerciseId: currentExercise.exerciseId, value: reps, previous: prResult.previousValue }]);
        vibrate([50, 50, 50]);
      }
    }
    if (isTimeBased && duration > 0) {
      const prResult = await checkPersonalRecord(currentExercise.exerciseId, 'duration', duration);
      if (prResult.isNewPR) {
        setNewPRs(prev => [...prev, { exerciseId: currentExercise.exerciseId, value: duration, type: 'duration', previous: prResult.previousValue }]);
        vibrate([50, 50, 50]);
      }
    }

    // Update workout totals
    const allSets = await db.workoutSets.where('workoutId').equals(workoutId).toArray();
    await db.workouts.update(workoutId, {
      totalSets: allSets.length,
      totalReps: allSets.reduce((sum, s) => sum + (s.reps || 0), 0),
      updatedAt: new Date().toISOString(),
    });

    // Move to next set or exercise
    const nextSetIndex = currentSetIndex + 1;
    if (nextSetIndex >= currentExercise.sets) {
      // Exercise complete, move to next
      const nextExIndex = currentExIndex + 1;
      if (nextExIndex >= totalExercises) {
        // Workout complete!
        await finishWorkout();
      } else {
        setCurrentExIndex(nextExIndex);
        setCurrentSetIndex(0);
        // Start rest
        const nextEx = exercises[nextExIndex];
        const restTime = currentExercise.restTime || 60;
        startRest(restTime);
      }
    } else {
      setCurrentSetIndex(nextSetIndex);
      // Start rest between sets
      const restTime = currentExercise.restTime || 60;
      startRest(restTime);
    }
  }, [workoutId, currentExercise, currentExIndex, currentSetIndex, reps, duration, rir, setNotes, painLevel, isTimeBased, totalExercises, exercises, vibrate]);

  const startRest = (time) => {
    setIsResting(true);
    restTimer.reset(time);
    restTimer.start(time);
  };

  const skipRest = () => {
    setIsResting(false);
    restTimer.reset();
  };

  const skipExercise = () => {
    const nextExIndex = currentExIndex + 1;
    if (nextExIndex >= totalExercises) {
      finishWorkout();
    } else {
      setCurrentExIndex(nextExIndex);
      setCurrentSetIndex(0);
    }
  };

  const finishWorkout = async () => {
    if (!workoutId) return;
    await db.workouts.update(workoutId, {
      status: 'completed',
      completedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    // Check achievements
    await checkAchievements();

    setWorkoutComplete(true);

    // Celebration
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#7c3aed', '#06b6d4', '#f59e0b', '#22c55e'],
    });
  };

  // Rest timer completion
  useEffect(() => {
    if (restTimer.isComplete) {
      vibrate([100, 50, 100]);
      setIsResting(false);
    }
  }, [restTimer.isComplete, vibrate]);

  // Workout complete screen
  if (workoutComplete) {
    return (
      <motion.div
        className="min-h-screen flex flex-col items-center justify-center px-6 text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', delay: 0.2 }}
          className="text-6xl mb-6"
        >
          🎉
        </motion.div>
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-3xl font-bold mb-2"
        >
          Workout Complete!
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-zinc-400 mb-2"
        >
          {completedSets.length} sets • {completedSets.reduce((s, set) => s + (set.reps || 0), 0)} reps
        </motion.p>

        {newPRs.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="mt-4 mb-6 space-y-2"
          >
            {newPRs.map((pr, i) => (
              <div key={i} className="px-4 py-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
                <span className="text-amber-400 font-semibold">🏆 New PR: </span>
                <span className="text-amber-300">{pr.exerciseId} — {pr.value} {pr.type === 'duration' ? 'sec' : 'reps'}</span>
              </div>
            ))}
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="flex gap-3 w-full max-w-xs mt-4"
        >
          <button
            onClick={() => navigate('/progress')}
            className="flex-1 py-3 rounded-xl bg-zinc-800 text-zinc-300 font-medium touch-target"
          >
            Progress
          </button>
          <button
            onClick={() => navigate('/')}
            className="flex-1 py-3 rounded-xl bg-violet-600 text-white font-medium touch-target"
          >
            Done
          </button>
        </motion.div>
      </motion.div>
    );
  }

  if (!currentExercise) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-zinc-500">Loading workout...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col safe-area-top safe-area-bottom">
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800">
        <button
          onClick={() => navigate('/workout')}
          className="p-2 rounded-xl hover:bg-zinc-800 transition-colors touch-target"
          aria-label="Close workout"
        >
          <X size={22} />
        </button>
        <div className="text-center">
          <p className="text-xs text-zinc-500 font-medium">
            Exercise {currentExIndex + 1}/{totalExercises}
          </p>
          <p className="text-xs text-zinc-600">
            Set {currentSetIndex + 1}/{currentExercise.sets}
          </p>
        </div>
        <button
          onClick={skipExercise}
          className="p-2 rounded-xl hover:bg-zinc-800 transition-colors text-zinc-500 touch-target"
          aria-label="Skip exercise"
        >
          <SkipForward size={20} />
        </button>
      </div>

      {/* Progress bar */}
      <div className="h-1 bg-zinc-900">
        <motion.div
          className="h-full bg-gradient-to-r from-violet-500 to-cyan-400"
          animate={{ width: `${((currentExIndex * 3 + currentSetIndex) / (totalExercises * 3)) * 100}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>

      {/* Rest Timer Overlay */}
      <AnimatePresence>
        {isResting && (
          <motion.div
            className="absolute inset-0 z-20 bg-zinc-950/95 flex flex-col items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <p className="text-sm text-zinc-500 mb-4 font-medium uppercase tracking-wider">Rest</p>
            <motion.div
              className="text-7xl font-bold tabular-nums font-mono"
              key={restTimer.time}
              initial={{ scale: 1.1 }}
              animate={{ scale: 1 }}
            >
              {formatTime(restTimer.time)}
            </motion.div>

            {/* Quick add buttons */}
            <div className="flex gap-3 mt-8">
              {[15, 30, 60].map(sec => (
                <button
                  key={sec}
                  onClick={() => restTimer.addTime(sec)}
                  className="px-4 py-2 rounded-xl bg-zinc-800 text-sm font-medium text-zinc-400 touch-target"
                >
                  +{sec}s
                </button>
              ))}
            </div>

            <button
              onClick={skipRest}
              className="mt-8 px-8 py-4 rounded-xl bg-violet-600 text-white font-semibold text-lg touch-target"
            >
              Skip Rest
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main content */}
      <div className="flex-1 flex flex-col px-4 py-6">
        {/* Skill warning */}
        {isSkill && (
          <div className="flex items-center gap-2 px-3 py-2 mb-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
            <AlertCircle size={16} className="text-amber-400 flex-shrink-0" />
            <span className="text-xs text-amber-300 font-medium">SKILL — DO NOT TRAIN TO FAILURE</span>
          </div>
        )}

        {/* Exercise name */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold mb-1">{exerciseInfo?.name || currentExercise.exerciseId}</h1>
          <p className="text-sm text-zinc-500">
            Set {currentSetIndex + 1} of {currentExercise.sets}
          </p>
          {currentExercise.notes && (
            <p className="text-xs text-zinc-600 mt-1">{currentExercise.notes}</p>
          )}
        </div>

        {/* Previous performance */}
        {setsForCurrentExercise.length > 0 && (
          <div className="flex gap-2 justify-center mb-6">
            {setsForCurrentExercise.map((s, i) => (
              <div key={i} className="px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 text-xs font-mono">
                S{s.setNumber}: {s.reps || s.duration || 0}{s.duration ? 's' : ''}
              </div>
            ))}
          </div>
        )}

        {/* Input area */}
        <div className="flex-1 flex flex-col items-center justify-center">
          {isTimeBased ? (
            /* Duration input */
            <div className="text-center">
              <p className="text-xs text-zinc-500 mb-3 uppercase tracking-wider">Duration (seconds)</p>
              <div className="flex items-center gap-6">
                <button
                  onClick={() => setDuration(d => Math.max(0, d - 5))}
                  className="w-14 h-14 rounded-full bg-zinc-800 flex items-center justify-center touch-target active:scale-90 transition-transform"
                >
                  <Minus size={24} />
                </button>
                <span className="text-6xl font-bold tabular-nums font-mono w-32 text-center">
                  {duration}
                </span>
                <button
                  onClick={() => setDuration(d => d + 5)}
                  className="w-14 h-14 rounded-full bg-zinc-800 flex items-center justify-center touch-target active:scale-90 transition-transform"
                >
                  <Plus size={24} />
                </button>
              </div>
              <p className="text-sm text-zinc-600 mt-2">
                Target: {currentExercise.targetDuration?.[currentSetIndex] || '—'}s
              </p>
            </div>
          ) : (
            /* Reps input */
            <div className="text-center">
              <p className="text-xs text-zinc-500 mb-3 uppercase tracking-wider">Reps</p>
              <div className="flex items-center gap-6">
                <button
                  onClick={() => setReps(r => Math.max(0, r - 1))}
                  className="w-14 h-14 rounded-full bg-zinc-800 flex items-center justify-center touch-target active:scale-90 transition-transform"
                >
                  <Minus size={24} />
                </button>
                <span className="text-7xl font-bold tabular-nums font-mono w-28 text-center">
                  {reps}
                </span>
                <button
                  onClick={() => setReps(r => r + 1)}
                  className="w-14 h-14 rounded-full bg-zinc-800 flex items-center justify-center touch-target active:scale-90 transition-transform"
                >
                  <Plus size={24} />
                </button>
              </div>
              <p className="text-sm text-zinc-600 mt-2">
                Target: {currentExercise.targetReps?.[currentSetIndex] || '—'}
              </p>
            </div>
          )}

          {/* RIR selector */}
          <div className="mt-8">
            <p className="text-xs text-zinc-500 mb-2 text-center uppercase tracking-wider">RIR</p>
            <div className="flex gap-2">
              {[3, 2, 1, 0, -1].map(r => (
                <button
                  key={r}
                  onClick={() => setRir(r)}
                  className={`px-3 py-2 rounded-lg text-xs font-medium touch-target transition-colors ${
                    rir === r
                      ? r === -1
                        ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                        : 'bg-violet-500/20 text-violet-400 border border-violet-500/30'
                      : 'bg-zinc-800 text-zinc-500'
                  }`}
                >
                  {r === -1 ? 'Fail' : `RIR ${r}`}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom action */}
      <div className="px-4 pb-4 space-y-3">
        <button
          onClick={handleCompleteSet}
          className="w-full py-4 rounded-2xl bg-gradient-to-r from-violet-600 to-violet-500 text-white font-bold text-lg touch-target active:scale-[0.98] transition-transform flex items-center justify-center gap-2"
        >
          <Check size={22} />
          Complete Set
        </button>
        <div className="flex gap-3">
          <button
            onClick={() => setShowPainSheet(true)}
            className="flex-1 py-3 rounded-xl bg-zinc-900 border border-zinc-800 text-sm text-zinc-400 font-medium touch-target"
          >
            Pain / Discomfort
          </button>
          <button
            onClick={() => setShowEditSheet(true)}
            className="flex-1 py-3 rounded-xl bg-zinc-900 border border-zinc-800 text-sm text-zinc-400 font-medium touch-target"
          >
            <Edit3 size={14} className="inline mr-1" /> Notes
          </button>
        </div>
      </div>

      {/* Pain Sheet */}
      <BottomSheet isOpen={showPainSheet} onClose={() => setShowPainSheet(false)} title="Pain / Discomfort">
        <div className="space-y-4">
          <div>
            <p className="text-sm text-zinc-400 mb-2">Pain Level (0 = none, 10 = severe)</p>
            <div className="flex gap-1.5">
              {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(level => (
                <button
                  key={level}
                  onClick={() => setPainLevel(level)}
                  className={`flex-1 py-2 rounded-lg text-xs font-medium touch-target ${
                    painLevel === level
                      ? level >= 7 ? 'bg-red-500/30 text-red-300' : level >= 4 ? 'bg-amber-500/30 text-amber-300' : 'bg-zinc-700 text-zinc-200'
                      : 'bg-zinc-800 text-zinc-500'
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>

          {painLevel >= 4 && (
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300">
              ⚠️ Consider modifying the exercise, reducing range of motion, or stopping if pain persists. Consult a professional if needed.
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={skipExercise}
              className="flex-1 py-3 rounded-xl bg-zinc-800 text-zinc-300 font-medium touch-target"
            >
              Skip Exercise
            </button>
            <button
              onClick={() => setShowPainSheet(false)}
              className="flex-1 py-3 rounded-xl bg-violet-600 text-white font-medium touch-target"
            >
              Continue
            </button>
          </div>
        </div>
      </BottomSheet>

      {/* Notes Sheet */}
      <BottomSheet isOpen={showEditSheet} onClose={() => setShowEditSheet(false)} title="Set Notes">
        <textarea
          value={setNotes}
          onChange={e => setSetNotes(e.target.value)}
          placeholder="Add notes for this set..."
          className="w-full h-24 p-3 rounded-xl bg-zinc-800 border border-zinc-700 text-sm resize-none focus:outline-none focus:border-violet-500"
        />
        <button
          onClick={() => setShowEditSheet(false)}
          className="w-full mt-3 py-3 rounded-xl bg-violet-600 text-white font-medium touch-target"
        >
          Save
        </button>
      </BottomSheet>
    </div>
  );
}

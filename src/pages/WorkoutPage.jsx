import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Play, Calendar, Clock, ChevronRight, AlertCircle } from 'lucide-react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/database';
import { DEFAULT_SCHEDULE, WORKOUT_TEMPLATES } from '../data/schedule';
import { EXERCISE_MAP } from '../data/exercises';
import Card, { EmptyState } from '../components/ui/Card';
import { todayString, formatDate } from '../utils/helpers';

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } },
};
const item = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } };

export default function WorkoutPage() {
  const navigate = useNavigate();
  const [todaySchedule, setTodaySchedule] = useState(null);
  const [template, setTemplate] = useState(null);

  const todayWorkout = useLiveQuery(async () => {
    return await db.workouts.where('date').equals(todayString()).first();
  });

  const recentWorkouts = useLiveQuery(() =>
    db.workouts.orderBy('date').reverse().limit(5).toArray()
  ) || [];

  useEffect(() => {
    const dayOfWeek = new Date().getDay();
    const schedule = DEFAULT_SCHEDULE.find(d => d.dayOfWeek === dayOfWeek);
    setTodaySchedule(schedule);
    if (schedule && WORKOUT_TEMPLATES[schedule.type]) {
      setTemplate(WORKOUT_TEMPLATES[schedule.type]);
    }
  }, []);

  const handleStart = () => {
    navigate('/workout/active');
  };

  const isRestDay = todaySchedule?.type === 'rest';

  return (
    <motion.div
      className="min-h-screen pb-24 px-4 pt-6 safe-area-top"
      variants={container}
      initial="hidden"
      animate="show"
    >
      <motion.h1 variants={item} className="text-2xl font-bold mb-6">Workout</motion.h1>

      {/* Today's Session */}
      <motion.div variants={item} className="mb-6">
        {isRestDay ? (
          <Card className="border-amber-500/20">
            <div className="flex items-center gap-3 mb-3">
              <span className="text-3xl">{todaySchedule?.icon}</span>
              <div>
                <h2 className="text-lg font-bold">{todaySchedule?.label}</h2>
                <p className="text-sm text-zinc-500">Focus on recovery today</p>
              </div>
            </div>
            <div className="space-y-2 text-sm text-zinc-400">
              <p>• Light walking or stretching</p>
              <p>• Mobility work</p>
              <p>• Stay hydrated</p>
              <p>• Track your recovery</p>
            </div>
            <button
              onClick={() => navigate('/more/recovery')}
              className="mt-4 w-full py-3 rounded-xl bg-zinc-800 text-zinc-300 font-medium touch-target"
            >
              Log Recovery
            </button>
          </Card>
        ) : todayWorkout?.status === 'completed' ? (
          <Card className="border-emerald-500/20 glow-green">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center">
                <span className="text-xl">✓</span>
              </div>
              <div className="flex-1">
                <h2 className="text-lg font-bold text-emerald-400">Workout Complete</h2>
                <p className="text-sm text-zinc-500">{todaySchedule?.label} — {todaySchedule?.name}</p>
              </div>
              <button
                onClick={() => navigate(`/more/history/${todayWorkout.id}`)}
                className="px-4 py-2 rounded-xl bg-zinc-800 text-sm font-medium touch-target"
              >
                View
              </button>
            </div>
          </Card>
        ) : (
          <Card className="border-violet-500/20 glow-violet">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-3xl">{todaySchedule?.icon}</span>
              <div>
                <h2 className="text-lg font-bold">{todaySchedule?.label || "Today's Workout"}</h2>
                <p className="text-sm text-zinc-500">{todaySchedule?.name}</p>
              </div>
            </div>

            {/* Exercise Preview */}
            {template && (
              <div className="space-y-2 mb-4">
                {(template.skillExercises || []).map((ex, i) => (
                  <div key={`skill-${i}`} className="flex items-center gap-3 py-2 px-3 rounded-xl bg-amber-500/5 border border-amber-500/10">
                    <AlertCircle size={14} className="text-amber-400 flex-shrink-0" />
                    <span className="text-sm font-medium text-amber-300">
                      {EXERCISE_MAP[ex.exerciseId]?.name || ex.exerciseId}
                    </span>
                    <span className="text-xs text-zinc-500 ml-auto">{ex.sets} sets • SKILL</span>
                  </div>
                ))}
                {template.exercises.map((ex, i) => (
                  <div key={i} className="flex items-center gap-3 py-2 px-3 rounded-xl bg-zinc-800/50">
                    <div className="w-1.5 h-1.5 rounded-full bg-violet-400" />
                    <span className="text-sm">
                      {EXERCISE_MAP[ex.exerciseId]?.name || ex.exerciseId}
                    </span>
                    <span className="text-xs text-zinc-500 ml-auto">
                      {ex.sets} × {ex.isTimeBased ? 'time' : (ex.targetReps?.[0] || '?')}
                    </span>
                  </div>
                ))}
              </div>
            )}

            <button
              onClick={handleStart}
              className="w-full flex items-center justify-center gap-2 py-4 rounded-xl bg-violet-600 hover:bg-violet-500 active:scale-[0.98] transition-all text-white font-bold text-lg touch-target"
            >
              <Play size={22} fill="white" />
              Start Workout
            </button>
          </Card>
        )}
      </motion.div>

      {/* Recent Workouts */}
      <motion.div variants={item}>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-semibold text-zinc-300">Recent Sessions</h2>
          <button
            onClick={() => navigate('/more/history')}
            className="text-xs text-violet-400 font-medium flex items-center gap-1"
          >
            View All <ChevronRight size={14} />
          </button>
        </div>

        {recentWorkouts.length === 0 ? (
          <EmptyState
            icon="🏋️"
            title="No workouts yet"
            subtitle="Your first session starts your progression history."
            action={handleStart}
            actionLabel="Start First Workout"
          />
        ) : (
          <div className="space-y-2">
            {recentWorkouts.map(workout => (
              <Card
                key={workout.id}
                onClick={() => navigate(`/more/history/${workout.id}`)}
                className="active:scale-[0.99]"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    workout.status === 'completed' ? 'bg-emerald-500/20' : 'bg-zinc-800'
                  }`}>
                    <Calendar size={18} className={workout.status === 'completed' ? 'text-emerald-400' : 'text-zinc-500'} />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{workout.dayLabel || workout.dayType}</p>
                    <p className="text-xs text-zinc-500">{formatDate(workout.date)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-zinc-500">{workout.totalSets || 0} sets</p>
                    <p className="text-xs text-zinc-600">{workout.totalReps || 0} reps</p>
                  </div>
                  <ChevronRight size={16} className="text-zinc-600" />
                </div>
              </Card>
            ))}
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}

import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Calendar, ChevronRight, CheckCircle2, XCircle } from 'lucide-react';
import { useWorkouts, useWorkoutSets } from '../hooks/useDatabase';
import Card, { EmptyState } from '../components/ui/Card';
import { formatDate, formatDuration } from '../utils/helpers';

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.04 } } };
const item = { hidden: { opacity: 0, y: 8 }, show: { opacity: 1, y: 0 } };

export default function HistoryPage() {
  const navigate = useNavigate();
  const workouts = useWorkouts();

  return (
    <motion.div
      className="min-h-screen pb-24 px-4 pt-6 safe-area-top"
      variants={container}
      initial="hidden"
      animate="show"
    >
      <motion.div variants={item} className="flex items-center gap-2 mb-6">
        <button onClick={() => navigate('/more')} className="text-sm text-violet-400 touch-target">← Back</button>
        <h1 className="text-2xl font-bold">History</h1>
      </motion.div>

      {workouts.length === 0 ? (
        <EmptyState
          icon="📋"
          title="No workout history"
          subtitle="Complete your first workout to see it here."
          action={() => navigate('/workout')}
          actionLabel="Start Workout"
        />
      ) : (
        <div className="space-y-2">
          {workouts.map(workout => (
            <motion.div key={workout.id} variants={item}>
              <Card
                onClick={() => navigate(`/more/history/${workout.id}`)}
                className="active:scale-[0.99]"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    workout.status === 'completed' ? 'bg-emerald-500/20' : 'bg-amber-500/20'
                  }`}>
                    {workout.status === 'completed'
                      ? <CheckCircle2 size={20} className="text-emerald-400" />
                      : <XCircle size={20} className="text-amber-400" />
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold">{workout.dayLabel || workout.dayType}</p>
                    <p className="text-xs text-zinc-500">{formatDate(workout.date)}</p>
                  </div>
                  <div className="text-right mr-2">
                    <p className="text-xs text-zinc-400">{workout.totalSets || 0} sets</p>
                    <p className="text-xs text-zinc-500">{workout.totalReps || 0} reps</p>
                  </div>
                  <ChevronRight size={16} className="text-zinc-600" />
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
}

/** Workout detail page */
export function WorkoutDetailPage() {
  const { workoutId } = useParams();
  const navigate = useNavigate();
  const workouts = useWorkouts();
  const sets = useWorkoutSets(workoutId);

  const workout = workouts.find(w => w.id === Number(workoutId));

  if (!workout) {
    return (
      <div className="min-h-screen flex items-center justify-center text-zinc-500">
        Workout not found
      </div>
    );
  }

  // Group sets by exercise
  const groupedSets = sets.reduce((acc, set) => {
    if (!acc[set.exerciseId]) acc[set.exerciseId] = [];
    acc[set.exerciseId].push(set);
    return acc;
  }, {});

  return (
    <motion.div
      className="min-h-screen pb-24 px-4 pt-6 safe-area-top"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
    >
      <button onClick={() => navigate('/more/history')} className="text-sm text-violet-400 mb-4 touch-target">
        ← Back to History
      </button>

      <div className="mb-6">
        <h1 className="text-2xl font-bold">{workout.dayLabel || workout.dayType}</h1>
        <p className="text-sm text-zinc-500">{formatDate(workout.date)}</p>
        <div className="flex gap-4 mt-2">
          <span className="text-sm text-zinc-400">{workout.totalSets || sets.length} sets</span>
          <span className="text-sm text-zinc-400">{workout.totalReps || 0} reps</span>
          <span className={`text-sm font-medium ${workout.status === 'completed' ? 'text-emerald-400' : 'text-amber-400'}`}>
            {workout.status === 'completed' ? 'Completed' : 'In Progress'}
          </span>
        </div>
      </div>

      {/* Sets by exercise */}
      <div className="space-y-4">
        {Object.entries(groupedSets).map(([exerciseId, exerciseSets]) => (
          <Card key={exerciseId}>
            <h3 className="text-sm font-semibold text-zinc-300 mb-3">{exerciseId}</h3>
            <div className="space-y-2">
              {exerciseSets.sort((a, b) => a.setNumber - b.setNumber).map(set => (
                <div key={set.id} className="flex items-center gap-3 py-1.5 px-3 rounded-lg bg-zinc-800/50">
                  <span className="text-xs font-mono text-zinc-500 w-8">S{set.setNumber}</span>
                  <span className="text-sm font-medium tabular-nums flex-1">
                    {set.reps ? `${set.reps} reps` : set.duration ? `${set.duration}s` : '—'}
                  </span>
                  {set.rir !== null && set.rir !== undefined && (
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      set.rir <= 0 ? 'bg-red-500/20 text-red-400' : 'bg-zinc-700 text-zinc-400'
                    }`}>
                      {set.rir === -1 ? 'Fail' : `RIR ${set.rir}`}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </Card>
        ))}
      </div>

      {sets.length === 0 && (
        <EmptyState icon="📋" title="No sets recorded" subtitle="This workout has no logged sets." />
      )}
    </motion.div>
  );
}

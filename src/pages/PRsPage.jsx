import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Trophy, TrendingUp } from 'lucide-react';
import { usePersonalRecords } from '../hooks/useDatabase';
import { EXERCISE_MAP } from '../data/exercises';
import Card, { EmptyState } from '../components/ui/Card';
import { formatDate } from '../utils/helpers';

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.04 } } };
const item = { hidden: { opacity: 0, y: 8 }, show: { opacity: 1, y: 0 } };

export default function PRsPage() {
  const navigate = useNavigate();
  const prs = usePersonalRecords();

  // Group by exercise
  const grouped = prs.reduce((acc, pr) => {
    if (!acc[pr.exerciseId]) acc[pr.exerciseId] = [];
    acc[pr.exerciseId].push(pr);
    return acc;
  }, {});

  return (
    <motion.div
      className="min-h-screen pb-24 px-4 pt-6 safe-area-top"
      variants={container}
      initial="hidden"
      animate="show"
    >
      <motion.div variants={item} className="flex items-center gap-2 mb-6">
        <button onClick={() => navigate('/more')} className="text-sm text-violet-400 touch-target">← Back</button>
        <h1 className="text-2xl font-bold">Personal Records</h1>
      </motion.div>

      <motion.div variants={item} className="mb-4">
        <Card className="text-center border-amber-500/20">
          <Trophy size={32} className="text-amber-400 mx-auto mb-2" />
          <p className="text-3xl font-bold text-amber-400 tabular-nums">{prs.length}</p>
          <p className="text-sm text-zinc-500">Total PRs</p>
        </Card>
      </motion.div>

      {prs.length === 0 ? (
        <EmptyState
          icon="🏆"
          title="No personal records yet"
          subtitle="Complete workouts and beat your previous bests to set PRs."
          action={() => navigate('/workout')}
          actionLabel="Start Workout"
        />
      ) : (
        <div className="space-y-4">
          {Object.entries(grouped).map(([exerciseId, exercisePRs]) => {
            const exerciseInfo = EXERCISE_MAP[exerciseId];
            return (
              <motion.div key={exerciseId} variants={item}>
                <Card>
                  <h3 className="text-sm font-semibold text-zinc-300 mb-3">
                    {exerciseInfo?.name || exerciseId}
                  </h3>
                  <div className="space-y-2">
                    {exercisePRs.map(pr => (
                      <div key={pr.id} className="flex items-center gap-3 py-2 px-3 rounded-xl bg-zinc-800/50">
                        <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center flex-shrink-0">
                          <TrendingUp size={14} className="text-amber-400" />
                        </div>
                        <div className="flex-1">
                          <p className="text-xs text-zinc-500 capitalize">{pr.type}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold tabular-nums text-amber-400">{pr.value}</p>
                          {pr.previousValue !== null && pr.previousValue !== undefined && (
                            <p className="text-xs text-emerald-400">
                              ↑ {pr.value - pr.previousValue} from {pr.previousValue}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  {exercisePRs[0]?.date && (
                    <p className="text-xs text-zinc-600 mt-2">Last set: {formatDate(exercisePRs[0].date)}</p>
                  )}
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
}

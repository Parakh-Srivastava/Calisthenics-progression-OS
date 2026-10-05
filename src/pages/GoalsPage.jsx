import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronRight, Edit3, Trophy, TrendingUp, Target } from 'lucide-react';
import { useGoals } from '../hooks/useDatabase';
import { PROGRESSION_TREES } from '../data/progressions';
import { useSetting } from '../hooks/useDatabase';
import { db } from '../db/database';
import { createAdvancedGoal } from '../db/services';
import ProgressRing from '../components/ui/ProgressRing';
import { ProgressBar } from '../components/ui/ProgressRing';
import Card, { StatCard } from '../components/ui/Card';
import BottomSheet from '../components/ui/BottomSheet';
import { percentage, formatDate, daysBetween, monthsBetween } from '../utils/helpers';

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.06 } } };
const item = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } };

export default function GoalsPage() {
  const navigate = useNavigate();
  const goals = useGoals();

  return (
    <motion.div
      className="min-h-screen pb-24 px-4 pt-6 safe-area-top"
      variants={container}
      initial="hidden"
      animate="show"
    >
      <motion.div variants={item} className="mb-6">
        <h1 className="text-2xl font-bold mb-1">Goals</h1>
        <p className="text-sm text-zinc-500">Your 30-month calisthenics progression</p>
      </motion.div>

      {/* Overview rings */}
      <motion.div variants={item} className="flex justify-around mb-6 py-4">
        {goals.map(goal => {
          const tree = PROGRESSION_TREES[goal.category];
          const pct = percentage(goal.currentBest, goal.target);
          return (
            <motion.div
              key={goal.id}
              className="flex flex-col items-center cursor-pointer"
              onClick={() => navigate(`/goals/${goal.id}`)}
              whileTap={{ scale: 0.95 }}
            >
              <ProgressRing value={pct} max={100} size={56} strokeWidth={4} color={goal.color}>
                <span className="text-[11px] font-bold tabular-nums">{Math.round(pct)}%</span>
              </ProgressRing>
              <span className="text-[10px] text-zinc-500 mt-1.5 font-medium">{tree?.icon}</span>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Goal Cards */}
      <div className="space-y-3">
        {goals.map(goal => {
          const tree = PROGRESSION_TREES[goal.category];
          const pct = percentage(goal.currentBest, goal.target);
          const currentLevel = tree?.levels?.[goal.currentLevel || 0];
          const nextLevel = tree?.levels?.[(goal.currentLevel || 0) + 1];
          const isAchieved = goal.status === 'achieved';

          return (
            <motion.div key={goal.id} variants={item}>
              <Card
                onClick={() => navigate(`/goals/${goal.id}`)}
                className={`${isAchieved ? 'border-emerald-500/20 glow-green' : 'border-zinc-800/60'}`}
              >
                <div className="flex items-start gap-4">
                  <div className="mt-1">
                    <ProgressRing value={pct} max={100} size={48} strokeWidth={3.5} color={goal.color}>
                      <span className="text-lg">{tree?.icon}</span>
                    </ProgressRing>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-base font-semibold truncate">{goal.name}</h3>
                      {isAchieved && <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400">Achieved</span>}
                    </div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-2xl font-bold tabular-nums" style={{ color: goal.color }}>
                        {goal.currentBest}
                      </span>
                      <span className="text-sm text-zinc-600">/ {goal.target}</span>
                      <span className="text-xs text-zinc-500 ml-auto">{Math.round(pct)}%</span>
                    </div>
                    <ProgressBar value={pct} max={100} color={goal.color} height={4} />

                    <div className="flex items-center gap-4 mt-3 text-xs text-zinc-500">
                      {currentLevel && (
                        <span>Current: <span className="text-zinc-300">{currentLevel.name}</span></span>
                      )}
                      {nextLevel && (
                        <span>Next: <span className="text-zinc-400">{nextLevel.name}</span></span>
                      )}
                    </div>
                  </div>
                  <ChevronRight size={18} className="text-zinc-600 mt-3 flex-shrink-0" />
                </div>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}

/** Individual goal detail page */
export function GoalDetailPage() {
  const { goalId } = useParams();
  const navigate = useNavigate();
  const goals = useGoals();
  const [showEditSheet, setShowEditSheet] = useState(false);
  const [showAdvancedSheet, setShowAdvancedSheet] = useState(false);
  const [newTarget, setNewTarget] = useState('');
  const [programStartDate] = useSetting('programStartDate');

  const goal = goals.find(g => g.id === Number(goalId));
  if (!goal) return <div className="min-h-screen flex items-center justify-center text-zinc-500">Goal not found</div>;

  const tree = PROGRESSION_TREES[goal.category];
  const pct = percentage(goal.currentBest, goal.target);
  const currentLevel = tree?.levels?.[goal.currentLevel || 0];
  const isAchieved = goal.status === 'achieved';

  const monthsElapsed = programStartDate ? monthsBetween(programStartDate, new Date()) : 0;
  const expectedMonth = 30;
  const daysAhead = programStartDate ? daysBetween(new Date(), new Date(new Date(programStartDate).getTime() + expectedMonth * 30 * 24 * 60 * 60 * 1000)) : 0;

  const handleUpdateTarget = async () => {
    const target = parseInt(newTarget);
    if (target > 0) {
      await createAdvancedGoal(goal.id, target, goal.name);
      setShowEditSheet(false);
    }
  };

  return (
    <motion.div
      className="min-h-screen pb-24 px-4 pt-6 safe-area-top"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
    >
      <button onClick={() => navigate('/goals')} className="text-sm text-violet-400 mb-4 touch-target">
        ← Back to Goals
      </button>

      {/* Hero */}
      <div className="text-center mb-8">
        <div className="text-5xl mb-3">{tree?.icon}</div>
        <h1 className="text-2xl font-bold mb-1">{goal.name}</h1>
        <ProgressRing value={pct} max={100} size={120} strokeWidth={8} color={goal.color} className="mx-auto mt-4">
          <div className="text-center">
            <div className="text-2xl font-bold tabular-nums" style={{ color: goal.color }}>{Math.round(pct)}%</div>
          </div>
        </ProgressRing>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <StatCard label="Current Best" value={goal.currentBest} color={goal.color} />
        <StatCard label="Target" value={goal.target} color="#a1a1aa" />
        <StatCard label="Month" value={`${monthsElapsed}/30`} color="#06b6d4" />
        <StatCard label="Current Level" value={currentLevel?.name || '—'} color="#f59e0b" />
      </div>

      {/* Achievement */}
      {isAchieved && (
        <Card className="border-emerald-500/20 glow-green mb-4">
          <div className="flex items-center gap-3">
            <Trophy size={24} className="text-emerald-400" />
            <div>
              <h3 className="text-lg font-bold text-emerald-400">Goal Achieved!</h3>
              <p className="text-sm text-zinc-400">Achieved on {formatDate(goal.achievedAt)}</p>
            </div>
          </div>
          <button
            onClick={() => setShowAdvancedSheet(true)}
            className="w-full mt-3 py-3 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 font-medium touch-target"
          >
            What's Next? →
          </button>
        </Card>
      )}

      {/* Timeline position */}
      <Card className="mb-4">
        <h3 className="text-sm font-semibold text-zinc-400 mb-3">30-Month Timeline</h3>
        <div className="relative h-2 bg-zinc-800 rounded-full mb-3">
          <motion.div
            className="absolute h-full rounded-full"
            style={{ backgroundColor: goal.color }}
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(100, (monthsElapsed / 30) * 100)}%` }}
            transition={{ duration: 1 }}
          />
          {/* Goal progress marker */}
          <div
            className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full border-2 border-zinc-950"
            style={{ left: `${Math.min(100, pct)}%`, backgroundColor: goal.color }}
          />
        </div>
        <div className="flex justify-between text-xs text-zinc-500">
          <span>Start</span>
          <span>Month {monthsElapsed}</span>
          <span>Month 30</span>
        </div>
      </Card>

      {/* Progression Tree */}
      <Card className="mb-4">
        <h3 className="text-sm font-semibold text-zinc-400 mb-3">Progression Path</h3>
        <div className="space-y-0">
          {tree?.levels?.map((level, i) => {
            const isCompleted = i < (goal.currentLevel || 0);
            const isCurrent = i === (goal.currentLevel || 0);
            const isLocked = i > (goal.currentLevel || 0);

            return (
              <div key={level.id} className="flex items-center gap-3">
                {/* Vertical line */}
                <div className="flex flex-col items-center w-6">
                  <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                    isCompleted ? 'bg-emerald-500 border-emerald-500' :
                    isCurrent ? 'border-violet-400 bg-violet-400/20' :
                    'border-zinc-700 bg-zinc-900'
                  }`}>
                    {isCompleted && <span className="text-[8px] text-white">✓</span>}
                    {isCurrent && <div className="w-1.5 h-1.5 rounded-full bg-violet-400" />}
                  </div>
                  {i < tree.levels.length - 1 && (
                    <div className={`w-0.5 h-8 ${isCompleted ? 'bg-emerald-500/30' : 'bg-zinc-800'}`} />
                  )}
                </div>
                {/* Label */}
                <div className={`py-2 ${isLocked ? 'opacity-40' : ''}`}>
                  <p className={`text-sm font-medium ${isCurrent ? 'text-violet-400' : isCompleted ? 'text-emerald-400' : ''}`}>
                    {level.name}
                  </p>
                  <p className="text-xs text-zinc-500">{level.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Edit target */}
      <button
        onClick={() => { setNewTarget(String(goal.target)); setShowEditSheet(true); }}
        className="w-full py-3 rounded-xl bg-zinc-900 border border-zinc-800 text-sm text-zinc-400 font-medium touch-target flex items-center justify-center gap-2"
      >
        <Edit3 size={14} /> Edit Target
      </button>

      {/* Edit Sheet */}
      <BottomSheet isOpen={showEditSheet} onClose={() => setShowEditSheet(false)} title="Edit Target">
        <div className="space-y-4">
          <div>
            <label className="text-sm text-zinc-400 mb-1 block">New Target</label>
            <input
              type="number"
              value={newTarget}
              onChange={e => setNewTarget(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-zinc-800 border border-zinc-700 text-lg font-bold focus:outline-none focus:border-violet-500"
            />
          </div>
          <button onClick={handleUpdateTarget} className="w-full py-3 rounded-xl bg-violet-600 text-white font-medium touch-target">
            Update Target
          </button>
        </div>
      </BottomSheet>

      {/* Advanced Goal Sheet */}
      <BottomSheet isOpen={showAdvancedSheet} onClose={() => setShowAdvancedSheet(false)} title="What's Next?">
        <div className="space-y-3">
          <p className="text-sm text-zinc-400 mb-2">You crushed this goal! Choose your next challenge:</p>
          {[
            { label: 'Increase reps', action: () => { setNewTarget(String(goal.target + 5)); setShowAdvancedSheet(false); setShowEditSheet(true); } },
            { label: 'Add weight (weighted variation)', action: () => {} },
            { label: 'Choose harder variation', action: () => {} },
            { label: 'Create custom goal', action: () => {} },
            { label: 'Keep goal completed', action: () => setShowAdvancedSheet(false) },
          ].map((opt, i) => (
            <button
              key={i}
              onClick={opt.action}
              className="w-full py-3 px-4 rounded-xl bg-zinc-800 text-left text-sm font-medium hover:bg-zinc-700 transition-colors touch-target"
            >
              {opt.label}
            </button>
          ))}
        </div>
      </BottomSheet>
    </motion.div>
  );
}

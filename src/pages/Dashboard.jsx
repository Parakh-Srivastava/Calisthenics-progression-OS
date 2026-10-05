import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Play, Flame, Trophy, TrendingUp, ChevronRight, Wifi, WifiOff } from 'lucide-react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/database';
import { getWorkoutStreak, getStats } from '../db/services';
import { DEFAULT_SCHEDULE } from '../data/schedule';
import { PROGRESSION_TREES } from '../data/progressions';
import ProgressRing from '../components/ui/ProgressRing';
import { ProgressBar } from '../components/ui/ProgressRing';
import Card, { StatCard } from '../components/ui/Card';
import { getGreeting, formatDate, todayString, percentage } from '../utils/helpers';
import { useOnlineStatus } from '../hooks/useTimer';
import { useGoals, useSettings } from '../hooks/useDatabase';

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.06 },
  },
};

const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0 },
};

export default function Dashboard() {
  const navigate = useNavigate();
  const goals = useGoals();
  const settings = useSettings();
  const isOnline = useOnlineStatus();
  const [streak, setStreak] = useState(0);
  const [stats, setStats] = useState(null);
  const [todaySchedule, setTodaySchedule] = useState(null);

  const recentPRs = useLiveQuery(() =>
    db.personalRecords.orderBy('createdAt').reverse().limit(3).toArray()
  ) || [];

  const weekWorkouts = useLiveQuery(async () => {
    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay() + 1); // Monday
    weekStart.setHours(0, 0, 0, 0);
    const startStr = weekStart.toISOString().split('T')[0];
    return await db.workouts
      .where('date').aboveOrEqual(startStr)
      .filter(w => w.status === 'completed')
      .count();
  }) || 0;

  const todayWorkout = useLiveQuery(async () => {
    const today = todayString();
    return await db.workouts.where('date').equals(today).first();
  });

  useEffect(() => {
    const dayOfWeek = new Date().getDay();
    const schedule = DEFAULT_SCHEDULE.find(d => d.dayOfWeek === dayOfWeek);
    setTodaySchedule(schedule);

    getWorkoutStreak().then(setStreak);
    getStats(7).then(setStats);
  }, []);

  // Count planned workouts this week (non-rest days)
  const plannedPerWeek = DEFAULT_SCHEDULE.filter(d => d.type !== 'rest').length;

  const handleStartWorkout = () => {
    if (todayWorkout?.status === 'completed') {
      navigate('/workout');
    } else {
      navigate('/workout/active');
    }
  };

  return (
    <motion.div
      className="min-h-screen pb-24 px-4 pt-6 safe-area-top grid-pattern"
      variants={container}
      initial="hidden"
      animate="show"
    >
      {/* Header */}
      <motion.div variants={item} className="mb-6">
        <div className="flex items-center justify-between mb-1">
          <div>
            <p className="text-sm text-zinc-500 font-medium">{getGreeting()}</p>
            <h1 className="text-2xl font-bold tracking-tight">Calisthenics OS</h1>
          </div>
          <div className="flex items-center gap-2">
            <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
              isOnline ? 'bg-emerald-500/10 text-emerald-400' : 'bg-zinc-800 text-zinc-400'
            }`}>
              {isOnline ? <Wifi size={12} /> : <WifiOff size={12} />}
              {isOnline ? 'Online' : 'Offline'}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Today's Focus */}
      {todaySchedule && (
        <motion.div variants={item} className="mb-4">
          <Card className={`${todaySchedule.type === 'rest' ? 'border-zinc-700/40' : 'border-violet-500/20 glow-violet'}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-1">Today's Focus</p>
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{todaySchedule.icon}</span>
                  <div>
                    <h2 className="text-xl font-bold">{todaySchedule.label}</h2>
                    <p className="text-sm text-zinc-500">{todaySchedule.name}</p>
                  </div>
                </div>
              </div>
              {todaySchedule.type !== 'rest' && (
                <button
                  onClick={handleStartWorkout}
                  className="flex items-center gap-2 px-5 py-3 rounded-xl bg-violet-600 hover:bg-violet-500 active:scale-95 transition-all text-white font-semibold touch-target"
                >
                  <Play size={18} fill="white" />
                  {todayWorkout?.status === 'completed' ? 'View' : 'Start'}
                </button>
              )}
            </div>
            {todayWorkout?.status === 'completed' && (
              <div className="mt-3 pt-3 border-t border-zinc-800 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-400" />
                <span className="text-sm text-emerald-400 font-medium">Completed today ✓</span>
              </div>
            )}
          </Card>
        </motion.div>
      )}

      {/* Quick Stats Row */}
      <motion.div variants={item} className="grid grid-cols-3 gap-3 mb-4">
        <StatCard
          label="Streak"
          value={`${streak}d`}
          icon="🔥"
          color="#f59e0b"
        />
        <StatCard
          label="This Week"
          value={`${weekWorkouts}/${plannedPerWeek}`}
          icon="📊"
          color="#06b6d4"
        />
        <StatCard
          label="Total Sets"
          value={stats?.totalSets || 0}
          icon="💪"
          color="#7c3aed"
        />
      </motion.div>

      {/* Goals Overview */}
      <motion.div variants={item} className="mb-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-semibold text-zinc-300">Goal Progress</h2>
          <button
            onClick={() => navigate('/goals')}
            className="text-xs text-violet-400 font-medium flex items-center gap-1"
          >
            View All <ChevronRight size={14} />
          </button>
        </div>
        <div className="grid grid-cols-5 gap-2">
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
                <ProgressRing
                  value={pct}
                  max={100}
                  size={52}
                  strokeWidth={4}
                  color={goal.color}
                >
                  <span className="text-xs font-bold tabular-nums">{Math.round(pct)}%</span>
                </ProgressRing>
                <span className="text-[10px] text-zinc-500 mt-1 text-center leading-tight">
                  {tree?.icon}
                </span>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* Goals Detail Cards */}
      <motion.div variants={item} className="space-y-2 mb-4">
        {goals.slice(0, 3).map(goal => {
          const tree = PROGRESSION_TREES[goal.category];
          const pct = percentage(goal.currentBest, goal.target);
          const currentLevel = tree?.levels?.[goal.currentLevel || 0];
          return (
            <Card
              key={goal.id}
              onClick={() => navigate(`/goals/${goal.id}`)}
              className="active:scale-[0.99] transition-transform"
            >
              <div className="flex items-center gap-3">
                <div className="text-2xl">{tree?.icon}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="text-sm font-semibold truncate">{goal.name}</h3>
                    <span className="text-sm font-bold tabular-nums" style={{ color: goal.color }}>
                      {goal.currentBest}/{goal.target}
                    </span>
                  </div>
                  <ProgressBar value={pct} max={100} color={goal.color} height={4} />
                  {currentLevel && (
                    <p className="text-xs text-zinc-500 mt-1">Current: {currentLevel.name}</p>
                  )}
                </div>
                <ChevronRight size={16} className="text-zinc-600 flex-shrink-0" />
              </div>
            </Card>
          );
        })}
      </motion.div>

      {/* Recent PRs */}
      {recentPRs.length > 0 && (
        <motion.div variants={item} className="mb-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-semibold text-zinc-300">Recent PRs</h2>
            <button
              onClick={() => navigate('/more/prs')}
              className="text-xs text-violet-400 font-medium flex items-center gap-1"
            >
              View All <ChevronRight size={14} />
            </button>
          </div>
          <div className="space-y-2">
            {recentPRs.map(pr => (
              <Card key={pr.id} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center">
                  <Trophy size={16} className="text-amber-400" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">{pr.exerciseId}</p>
                  <p className="text-xs text-zinc-500">
                    {pr.value} {pr.type === 'reps' ? 'reps' : 'sec'}
                    {pr.previousValue !== null && (
                      <span className="text-emerald-400 ml-1">+{pr.value - pr.previousValue}</span>
                    )}
                  </p>
                </div>
              </Card>
            ))}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}

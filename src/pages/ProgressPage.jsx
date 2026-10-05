import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { TrendingUp, BarChart3, Calendar, Target } from 'lucide-react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/database';
import { getStats, getWorkoutStreak } from '../db/services';
import { useGoals, usePersonalRecords } from '../hooks/useDatabase';
import { PROGRESSION_TREES } from '../data/progressions';
import ProgressRing from '../components/ui/ProgressRing';
import { ProgressBar } from '../components/ui/ProgressRing';
import Card, { StatCard, EmptyState } from '../components/ui/Card';
import { percentage, formatNumber } from '../utils/helpers';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.05 } } };
const item = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } };

const TIME_RANGES = [
  { label: '7D', days: 7 },
  { label: '30D', days: 30 },
  { label: '90D', days: 90 },
  { label: '1Y', days: 365 },
  { label: 'All', days: 9999 },
];

export default function ProgressPage() {
  const navigate = useNavigate();
  const goals = useGoals();
  const allPRs = usePersonalRecords();
  const [timeRange, setTimeRange] = useState(30);
  const [stats, setStats] = useState(null);
  const [streak, setStreak] = useState(0);

  const workoutHistory = useLiveQuery(async () => {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - timeRange);
    const cutoffStr = cutoff.toISOString().split('T')[0];
    return await db.workouts
      .where('date').aboveOrEqual(cutoffStr)
      .filter(w => w.status === 'completed')
      .toArray();
  }, [timeRange]) || [];

  useEffect(() => {
    getStats(timeRange).then(setStats);
    getWorkoutStreak().then(setStreak);
  }, [timeRange]);

  // Build chart data
  const chartData = workoutHistory
    .sort((a, b) => a.date.localeCompare(b.date))
    .map(w => ({
      date: w.date.slice(5), // MM-DD
      sets: w.totalSets || 0,
      reps: w.totalReps || 0,
    }));

  const totalGoalProgress = goals.length > 0
    ? Math.round(goals.reduce((sum, g) => sum + percentage(g.currentBest, g.target), 0) / goals.length)
    : 0;

  return (
    <motion.div
      className="min-h-screen pb-24 px-4 pt-6 safe-area-top"
      variants={container}
      initial="hidden"
      animate="show"
    >
      <motion.div variants={item} className="mb-6">
        <h1 className="text-2xl font-bold mb-1">Progress</h1>
        <p className="text-sm text-zinc-500">Track your calisthenics journey</p>
      </motion.div>

      {/* Time Range Selector */}
      <motion.div variants={item} className="flex gap-2 mb-6">
        {TIME_RANGES.map(tr => (
          <button
            key={tr.days}
            onClick={() => setTimeRange(tr.days)}
            className={`flex-1 py-2 rounded-lg text-xs font-medium touch-target transition-colors ${
              timeRange === tr.days ? 'bg-violet-500/20 text-violet-400 border border-violet-500/30' : 'bg-zinc-800 text-zinc-500'
            }`}
          >
            {tr.label}
          </button>
        ))}
      </motion.div>

      {/* Stats Overview */}
      <motion.div variants={item} className="grid grid-cols-2 gap-3 mb-4">
        <StatCard label="Workouts" value={stats?.totalWorkouts || 0} icon="🏋️" color="#7c3aed" />
        <StatCard label="Total Sets" value={formatNumber(stats?.totalSets || 0)} icon="📊" color="#06b6d4" />
        <StatCard label="Total Reps" value={formatNumber(stats?.totalReps || 0)} icon="💪" color="#f59e0b" />
        <StatCard label="Streak" value={`${streak}d`} icon="🔥" color="#ef4444" />
      </motion.div>

      {/* Overall Progress */}
      <motion.div variants={item} className="mb-4">
        <Card>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-zinc-400">Overall Goal Progress</h3>
            <span className="text-lg font-bold" style={{ color: '#7c3aed' }}>{totalGoalProgress}%</span>
          </div>
          <ProgressBar value={totalGoalProgress} max={100} color="#7c3aed" height={6} />
          <div className="grid grid-cols-5 gap-2 mt-4">
            {goals.map(goal => {
              const pct = percentage(goal.currentBest, goal.target);
              const tree = PROGRESSION_TREES[goal.category];
              return (
                <div key={goal.id} className="text-center">
                  <ProgressRing value={pct} max={100} size={36} strokeWidth={3} color={goal.color}>
                    <span className="text-[9px]">{tree?.icon}</span>
                  </ProgressRing>
                  <p className="text-[9px] text-zinc-500 mt-1">{Math.round(pct)}%</p>
                </div>
              );
            })}
          </div>
        </Card>
      </motion.div>

      {/* Workout Volume Chart */}
      {chartData.length > 0 && (
        <motion.div variants={item} className="mb-4">
          <Card>
            <h3 className="text-sm font-semibold text-zinc-400 mb-4">Workout Volume</h3>
            <div className="h-40">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="volumeGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#7c3aed" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="#7c3aed" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#71717a' }} axisLine={false} tickLine={false} />
                  <YAxis hide />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: 12, fontSize: 12 }}
                    labelStyle={{ color: '#a1a1aa' }}
                  />
                  <Area type="monotone" dataKey="reps" stroke="#7c3aed" fill="url(#volumeGrad)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </motion.div>
      )}

      {/* Sets Per Workout Chart */}
      {chartData.length > 0 && (
        <motion.div variants={item} className="mb-4">
          <Card>
            <h3 className="text-sm font-semibold text-zinc-400 mb-4">Sets Per Workout</h3>
            <div className="h-32">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#71717a' }} axisLine={false} tickLine={false} />
                  <YAxis hide />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: 12, fontSize: 12 }}
                  />
                  <Bar dataKey="sets" fill="#06b6d4" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </motion.div>
      )}

      {/* Personal Records */}
      {allPRs.length > 0 && (
        <motion.div variants={item}>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-zinc-400">Personal Records</h3>
            <button onClick={() => navigate('/more/prs')} className="text-xs text-violet-400 font-medium">View All →</button>
          </div>
          <div className="space-y-2">
            {allPRs.slice(0, 5).map(pr => (
              <Card key={pr.id} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center flex-shrink-0">
                  <TrendingUp size={14} className="text-amber-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{pr.exerciseId}</p>
                  <p className="text-xs text-zinc-500">{pr.type}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold tabular-nums" style={{ color: '#f59e0b' }}>{pr.value}</p>
                  {pr.previousValue !== null && (
                    <p className="text-xs text-emerald-400">+{pr.value - pr.previousValue}</p>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </motion.div>
      )}

      {workoutHistory.length === 0 && (
        <EmptyState
          icon="📊"
          title="No data yet"
          subtitle="Complete your first workout to start tracking progress."
          action={() => navigate('/workout')}
          actionLabel="Start Workout"
        />
      )}
    </motion.div>
  );
}

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BarChart3 } from 'lucide-react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/database';
import { getStats, getWorkoutStreak } from '../db/services';
import { useGoals } from '../hooks/useDatabase';
import { PROGRESSION_TREES } from '../data/progressions';
import { EXERCISE_MAP } from '../data/exercises';
import Card, { StatCard, EmptyState } from '../components/ui/Card';
import { ProgressBar } from '../components/ui/ProgressRing';
import { percentage, formatNumber } from '../utils/helpers';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.05 } } };
const item = { hidden: { opacity: 0, y: 8 }, show: { opacity: 1, y: 0 } };

const TIME_RANGES = [
  { label: '7D', days: 7 },
  { label: '30D', days: 30 },
  { label: '90D', days: 90 },
  { label: '1Y', days: 365 },
  { label: 'All', days: 9999 },
];

export default function AnalyticsPage() {
  const navigate = useNavigate();
  const goals = useGoals();
  const [timeRange, setTimeRange] = useState(30);
  const [stats, setStats] = useState(null);
  const [streak, setStreak] = useState(0);

  const workouts = useLiveQuery(async () => {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - timeRange);
    const cutoffStr = cutoff.toISOString().split('T')[0];
    return await db.workouts
      .where('date').aboveOrEqual(cutoffStr)
      .filter(w => w.status === 'completed')
      .toArray();
  }, [timeRange]) || [];

  const allSets = useLiveQuery(async () => {
    const workoutIds = workouts.map(w => w.id);
    if (workoutIds.length === 0) return [];
    const sets = await db.workoutSets.toArray();
    return sets.filter(s => workoutIds.includes(s.workoutId));
  }, [workouts.length]) || [];

  useEffect(() => {
    getStats(timeRange).then(setStats);
    getWorkoutStreak().then(setStreak);
  }, [timeRange]);

  // Volume chart data
  const volumeData = workouts
    .sort((a, b) => a.date.localeCompare(b.date))
    .map(w => ({ date: w.date.slice(5), reps: w.totalReps || 0, sets: w.totalSets || 0 }));

  // Exercise frequency pie data
  const exerciseFreq = {};
  allSets.forEach(s => {
    const name = EXERCISE_MAP[s.exerciseId]?.name || s.exerciseId;
    exerciseFreq[name] = (exerciseFreq[name] || 0) + 1;
  });
  const pieData = Object.entries(exerciseFreq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([name, value]) => ({ name, value }));
  const PIE_COLORS = ['#7c3aed', '#06b6d4', '#f59e0b', '#22c55e', '#ef4444', '#ec4899'];

  // Weekly consistency
  const weeklyData = [];
  if (workouts.length > 0) {
    const weeks = {};
    workouts.forEach(w => {
      const d = new Date(w.date);
      const weekStart = new Date(d);
      weekStart.setDate(d.getDate() - d.getDay() + 1);
      const key = weekStart.toISOString().split('T')[0];
      weeks[key] = (weeks[key] || 0) + 1;
    });
    Object.entries(weeks)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .forEach(([week, count]) => {
        weeklyData.push({ week: week.slice(5), workouts: count });
      });
  }

  return (
    <motion.div
      className="min-h-screen pb-24 px-4 pt-6 safe-area-top"
      variants={container}
      initial="hidden"
      animate="show"
    >
      <motion.div variants={item} className="flex items-center gap-2 mb-4">
        <button onClick={() => navigate('/more')} className="text-sm text-violet-400 touch-target">← Back</button>
        <h1 className="text-2xl font-bold">Analytics</h1>
      </motion.div>

      {/* Time Range */}
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

      {/* Key Stats */}
      <motion.div variants={item} className="grid grid-cols-2 gap-3 mb-4">
        <StatCard label="Workouts" value={stats?.totalWorkouts || 0} icon="🏋️" color="#7c3aed" />
        <StatCard label="Per Week" value={(stats?.workoutsPerWeek || 0).toFixed(1)} icon="📅" color="#06b6d4" />
        <StatCard label="Total Reps" value={formatNumber(stats?.totalReps || 0)} icon="💪" color="#f59e0b" />
        <StatCard label="Streak" value={`${streak}d`} icon="🔥" color="#ef4444" />
      </motion.div>

      {workouts.length === 0 ? (
        <EmptyState
          icon="📊"
          title="No data yet"
          subtitle="Complete workouts to see analytics."
          action={() => navigate('/workout')}
          actionLabel="Start Workout"
        />
      ) : (
        <>
          {/* Volume Chart */}
          <motion.div variants={item} className="mb-4">
            <Card>
              <h3 className="text-sm font-semibold text-zinc-400 mb-4">Workout Volume (Reps)</h3>
              <div className="h-40">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={volumeData}>
                    <defs>
                      <linearGradient id="grad1" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#7c3aed" stopOpacity={0.3} />
                        <stop offset="100%" stopColor="#7c3aed" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#52525b' }} axisLine={false} tickLine={false} />
                    <YAxis hide />
                    <Tooltip contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: 12, fontSize: 12 }} />
                    <Area type="monotone" dataKey="reps" stroke="#7c3aed" fill="url(#grad1)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </motion.div>

          {/* Weekly Consistency */}
          {weeklyData.length > 1 && (
            <motion.div variants={item} className="mb-4">
              <Card>
                <h3 className="text-sm font-semibold text-zinc-400 mb-4">Weekly Consistency</h3>
                <div className="h-32">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={weeklyData}>
                      <XAxis dataKey="week" tick={{ fontSize: 10, fill: '#52525b' }} axisLine={false} tickLine={false} />
                      <YAxis hide />
                      <Tooltip contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: 12, fontSize: 12 }} />
                      <Bar dataKey="workouts" fill="#06b6d4" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </Card>
            </motion.div>
          )}

          {/* Exercise Frequency */}
          {pieData.length > 0 && (
            <motion.div variants={item} className="mb-4">
              <Card>
                <h3 className="text-sm font-semibold text-zinc-400 mb-4">Exercise Frequency</h3>
                <div className="flex items-center gap-4">
                  <div className="w-32 h-32">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={pieData} dataKey="value" cx="50%" cy="50%" innerRadius={30} outerRadius={55} paddingAngle={2}>
                          {pieData.map((_, i) => (
                            <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                          ))}
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex-1 space-y-1.5">
                    {pieData.map((entry, i) => (
                      <div key={entry.name} className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }} />
                        <span className="text-xs text-zinc-400 truncate flex-1">{entry.name}</span>
                        <span className="text-xs font-medium tabular-nums text-zinc-300">{entry.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            </motion.div>
          )}

          {/* Goal Progress Bars */}
          <motion.div variants={item}>
            <Card>
              <h3 className="text-sm font-semibold text-zinc-400 mb-4">Goal Completion</h3>
              <div className="space-y-3">
                {goals.map(goal => {
                  const tree = PROGRESSION_TREES[goal.category];
                  const pct = percentage(goal.currentBest, goal.target);
                  return (
                    <div key={goal.id}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-zinc-400">{tree?.icon} {tree?.name}</span>
                        <span className="text-xs font-medium tabular-nums" style={{ color: goal.color }}>{Math.round(pct)}%</span>
                      </div>
                      <ProgressBar value={pct} max={100} color={goal.color} height={5} />
                    </div>
                  );
                })}
              </div>
            </Card>
          </motion.div>
        </>
      )}
    </motion.div>
  );
}

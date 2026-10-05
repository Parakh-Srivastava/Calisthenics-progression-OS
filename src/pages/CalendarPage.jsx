import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, CheckCircle2, XCircle, Trophy, Bed } from 'lucide-react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/database';
import { DEFAULT_SCHEDULE } from '../data/schedule';
import Card from '../components/ui/Card';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, addMonths, subMonths, isSameDay, isToday } from 'date-fns';

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.04 } } };
const item = { hidden: { opacity: 0, y: 8 }, show: { opacity: 1, y: 0 } };

const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export default function CalendarPage() {
  const navigate = useNavigate();
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Get workouts for this month
  const monthStr = format(monthStart, 'yyyy-MM');
  const workouts = useLiveQuery(async () => {
    const startStr = format(monthStart, 'yyyy-MM-dd');
    const endStr = format(monthEnd, 'yyyy-MM-dd');
    return await db.workouts
      .where('date').between(startStr, endStr, true, true)
      .toArray();
  }, [monthStr]) || [];

  const workoutMap = {};
  workouts.forEach(w => { workoutMap[w.date] = w; });

  // Get PRs for this month
  const prs = useLiveQuery(async () => {
    const startStr = format(monthStart, 'yyyy-MM-dd');
    const endStr = format(monthEnd, 'yyyy-MM-dd');
    return await db.personalRecords
      .filter(pr => pr.date >= startStr && pr.date <= endStr)
      .toArray();
  }, [monthStr]) || [];

  const prDates = new Set(prs.map(p => p.date));

  // Rest days (from schedule)
  const restDayNumbers = DEFAULT_SCHEDULE.filter(d => d.type === 'rest').map(d => d.dayOfWeek);

  // Calculate start offset (Monday = 0)
  const startDayOfWeek = (getDay(monthStart) + 6) % 7; // Convert Sun=0 to Mon=0

  // GitHub-style activity heatmap for the year
  const getIntensity = (date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const workout = workoutMap[dateStr];
    if (!workout) return 0;
    if (workout.status === 'completed') return workout.totalReps > 100 ? 4 : workout.totalReps > 50 ? 3 : 2;
    return 1;
  };

  return (
    <motion.div
      className="min-h-screen pb-24 px-4 pt-6 safe-area-top"
      variants={container}
      initial="hidden"
      animate="show"
    >
      <motion.div variants={item} className="flex items-center gap-2 mb-6">
        <button onClick={() => navigate('/more')} className="text-sm text-violet-400 touch-target">← Back</button>
        <h1 className="text-2xl font-bold">Calendar</h1>
      </motion.div>

      {/* Month navigator */}
      <motion.div variants={item} className="flex items-center justify-between mb-4">
        <button
          onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
          className="p-2 rounded-xl hover:bg-zinc-800 touch-target"
        >
          <ChevronLeft size={20} />
        </button>
        <h2 className="text-lg font-semibold">{format(currentMonth, 'MMMM yyyy')}</h2>
        <button
          onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
          className="p-2 rounded-xl hover:bg-zinc-800 touch-target"
        >
          <ChevronRight size={20} />
        </button>
      </motion.div>

      {/* Calendar Grid */}
      <motion.div variants={item}>
        <Card>
          {/* Day labels */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {DAY_LABELS.map(label => (
              <div key={label} className="text-center text-xs text-zinc-600 font-medium py-1">
                {label}
              </div>
            ))}
          </div>

          {/* Days */}
          <div className="grid grid-cols-7 gap-1">
            {/* Empty cells for offset */}
            {Array.from({ length: startDayOfWeek }).map((_, i) => (
              <div key={`empty-${i}`} className="aspect-square" />
            ))}

            {days.map(day => {
              const dateStr = format(day, 'yyyy-MM-dd');
              const workout = workoutMap[dateStr];
              const dayOfWeek = getDay(day);
              const isRest = restDayNumbers.includes(dayOfWeek);
              const hasPR = prDates.has(dateStr);
              const today = isToday(day);
              const completed = workout?.status === 'completed';

              return (
                <button
                  key={dateStr}
                  onClick={() => workout && navigate(`/more/history/${workout.id}`)}
                  className={`aspect-square rounded-lg flex flex-col items-center justify-center text-xs relative transition-colors touch-target ${
                    today ? 'ring-1 ring-violet-500' : ''
                  } ${
                    completed ? 'bg-emerald-500/20 text-emerald-400' :
                    isRest ? 'bg-zinc-800/30 text-zinc-600' :
                    'bg-zinc-800/50 text-zinc-400'
                  }`}
                >
                  <span className="font-medium">{format(day, 'd')}</span>
                  {completed && <div className="w-1 h-1 rounded-full bg-emerald-400 mt-0.5" />}
                  {hasPR && (
                    <div className="absolute top-0.5 right-0.5 w-2 h-2 rounded-full bg-amber-400" />
                  )}
                </button>
              );
            })}
          </div>
        </Card>
      </motion.div>

      {/* Legend */}
      <motion.div variants={item} className="mt-4 flex gap-4 justify-center text-xs text-zinc-500">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-emerald-500/30" />
          <span>Completed</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-zinc-800/30" />
          <span>Rest Day</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-amber-400" />
          <span>PR</span>
        </div>
      </motion.div>

      {/* Month Summary */}
      <motion.div variants={item} className="mt-6">
        <Card>
          <h3 className="text-sm font-semibold text-zinc-400 mb-3">Month Summary</h3>
          <div className="grid grid-cols-3 gap-3">
            <div className="text-center">
              <p className="text-2xl font-bold text-emerald-400 tabular-nums">
                {workouts.filter(w => w.status === 'completed').length}
              </p>
              <p className="text-xs text-zinc-500">Workouts</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-violet-400 tabular-nums">
                {workouts.reduce((sum, w) => sum + (w.totalReps || 0), 0)}
              </p>
              <p className="text-xs text-zinc-500">Total Reps</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-amber-400 tabular-nums">{prs.length}</p>
              <p className="text-xs text-zinc-500">PRs</p>
            </div>
          </div>
        </Card>
      </motion.div>
    </motion.div>
  );
}

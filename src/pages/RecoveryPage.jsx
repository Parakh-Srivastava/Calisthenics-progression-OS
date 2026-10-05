import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, Moon, Zap, Frown, SmilePlus, Save } from 'lucide-react';
import { useRecoveryLogs } from '../hooks/useDatabase';
import { saveRecoveryLog } from '../db/services';
import Card, { EmptyState } from '../components/ui/Card';
import { formatDate, todayString } from '../utils/helpers';

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.04 } } };
const item = { hidden: { opacity: 0, y: 8 }, show: { opacity: 1, y: 0 } };

const EMOJI_SCALE = ['😫', '😕', '😐', '🙂', '😄'];

function RatingSelector({ label, icon: Icon, value, onChange, color }) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        <Icon size={16} style={{ color }} />
        <span className="text-sm font-medium text-zinc-300">{label}</span>
        <span className="text-sm font-bold ml-auto tabular-nums" style={{ color }}>{value}/5</span>
      </div>
      <div className="flex gap-2">
        {[1, 2, 3, 4, 5].map(level => (
          <button
            key={level}
            onClick={() => onChange(level)}
            className={`flex-1 py-3 rounded-xl text-lg transition-all touch-target ${
              value === level
                ? 'bg-zinc-700 scale-110 shadow-lg'
                : 'bg-zinc-800/50 opacity-50 hover:opacity-75'
            }`}
          >
            {EMOJI_SCALE[level - 1]}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function RecoveryPage() {
  const navigate = useNavigate();
  const logs = useRecoveryLogs();
  const [sleep, setSleep] = useState(7);
  const [energy, setEnergy] = useState(3);
  const [soreness, setSoreness] = useState(2);
  const [stress, setStress] = useState(2);
  const [notes, setNotes] = useState('');
  const [saved, setSaved] = useState(false);

  const todayLog = logs.find(l => l.date === todayString());

  useState(() => {
    if (todayLog) {
      setSleep(todayLog.sleep || 7);
      setEnergy(todayLog.energy || 3);
      setSoreness(todayLog.soreness || 2);
      setStress(todayLog.stress || 2);
      setNotes(todayLog.notes || '');
    }
  }, [todayLog]);

  const readiness = Math.round(((energy + (6 - soreness) + (6 - stress)) / 15) * 100);
  const readinessColor = readiness >= 70 ? '#22c55e' : readiness >= 40 ? '#f59e0b' : '#ef4444';
  const readinessLabel = readiness >= 70 ? 'Good to go' : readiness >= 40 ? 'Moderate' : 'Take it easy';

  const handleSave = async () => {
    await saveRecoveryLog({ sleep, energy, soreness, stress, notes });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
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
        <h1 className="text-2xl font-bold">Recovery</h1>
      </motion.div>

      {/* Readiness */}
      <motion.div variants={item} className="mb-6">
        <Card className="text-center">
          <p className="text-xs text-zinc-500 uppercase tracking-wider mb-2">Readiness Score</p>
          <div className="text-5xl font-bold tabular-nums" style={{ color: readinessColor }}>
            {readiness}%
          </div>
          <p className="text-sm mt-1" style={{ color: readinessColor }}>{readinessLabel}</p>
        </Card>
      </motion.div>

      {/* Input Form */}
      <motion.div variants={item} className="space-y-5 mb-6">
        {/* Sleep */}
        <Card>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Moon size={16} className="text-violet-400" />
              <span className="text-sm font-medium">Sleep</span>
            </div>
            <span className="text-lg font-bold text-violet-400 tabular-nums">{sleep}h</span>
          </div>
          <input
            type="range"
            min="3"
            max="12"
            step="0.5"
            value={sleep}
            onChange={e => setSleep(parseFloat(e.target.value))}
            className="w-full accent-violet-500"
          />
          <div className="flex justify-between text-xs text-zinc-600 mt-1">
            <span>3h</span>
            <span>12h</span>
          </div>
        </Card>

        {/* Energy */}
        <Card>
          <RatingSelector label="Energy" icon={Zap} value={energy} onChange={setEnergy} color="#f59e0b" />
        </Card>

        {/* Soreness */}
        <Card>
          <RatingSelector label="Soreness" icon={Frown} value={soreness} onChange={setSoreness} color="#ef4444" />
          <p className="text-xs text-zinc-600 mt-2">1 = no soreness, 5 = very sore</p>
        </Card>

        {/* Stress */}
        <Card>
          <RatingSelector label="Stress" icon={Heart} value={stress} onChange={setStress} color="#06b6d4" />
          <p className="text-xs text-zinc-600 mt-2">1 = relaxed, 5 = very stressed</p>
        </Card>

        {/* Notes */}
        <Card>
          <label className="text-sm font-medium text-zinc-300 mb-2 block">Notes</label>
          <textarea
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder="How are you feeling today?"
            className="w-full h-20 p-3 rounded-xl bg-zinc-800 border border-zinc-700 text-sm resize-none focus:outline-none focus:border-violet-500"
          />
        </Card>
      </motion.div>

      {/* Save Button */}
      <motion.div variants={item}>
        <button
          onClick={handleSave}
          className={`w-full py-4 rounded-2xl font-bold text-lg touch-target flex items-center justify-center gap-2 transition-all ${
            saved ? 'bg-emerald-600 text-white' : 'bg-violet-600 text-white active:scale-[0.98]'
          }`}
        >
          {saved ? (
            <>✓ Saved</>
          ) : (
            <><Save size={20} /> Save Recovery Log</>
          )}
        </button>
      </motion.div>

      {/* History */}
      {logs.length > 0 && (
        <motion.div variants={item} className="mt-8">
          <h3 className="text-sm font-semibold text-zinc-400 mb-3">Recent Logs</h3>
          <div className="space-y-2">
            {logs.slice(0, 7).map(log => (
              <Card key={log.id} className="flex items-center gap-3">
                <div className="text-lg">{EMOJI_SCALE[(log.energy || 3) - 1]}</div>
                <div className="flex-1">
                  <p className="text-sm font-medium">{formatDate(log.date)}</p>
                  <p className="text-xs text-zinc-500">
                    Sleep: {log.sleep}h • Energy: {log.energy}/5 • Soreness: {log.soreness}/5
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

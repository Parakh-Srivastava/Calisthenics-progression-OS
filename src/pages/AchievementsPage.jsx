import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock, Unlock, Award } from 'lucide-react';
import { useAchievements } from '../hooks/useDatabase';
import { ACHIEVEMENTS_LIST } from '../data/schedule';
import Card, { EmptyState } from '../components/ui/Card';
import { formatDate } from '../utils/helpers';

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.04 } } };
const item = { hidden: { opacity: 0, y: 8 }, show: { opacity: 1, y: 0 } };

export default function AchievementsPage() {
  const navigate = useNavigate();
  const unlockedAchievements = useAchievements();
  const unlockedKeys = new Set(unlockedAchievements.map(a => a.key));

  const unlockedCount = unlockedAchievements.length;
  const totalCount = ACHIEVEMENTS_LIST.length;

  return (
    <motion.div
      className="min-h-screen pb-24 px-4 pt-6 safe-area-top"
      variants={container}
      initial="hidden"
      animate="show"
    >
      <motion.div variants={item} className="flex items-center gap-2 mb-2">
        <button onClick={() => navigate('/more')} className="text-sm text-violet-400 touch-target">← Back</button>
        <h1 className="text-2xl font-bold">Achievements</h1>
      </motion.div>

      <motion.div variants={item} className="mb-6">
        <p className="text-sm text-zinc-500">{unlockedCount}/{totalCount} unlocked</p>
        <div className="h-1.5 bg-zinc-800 rounded-full mt-2">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-amber-500 to-amber-400"
            initial={{ width: 0 }}
            animate={{ width: `${(unlockedCount / totalCount) * 100}%` }}
            transition={{ duration: 0.8 }}
          />
        </div>
      </motion.div>

      {/* Unlocked */}
      {unlockedAchievements.length > 0 && (
        <motion.div variants={item} className="mb-6">
          <h2 className="text-xs font-semibold text-amber-400 uppercase tracking-wider mb-3">Unlocked</h2>
          <div className="space-y-2">
            {unlockedAchievements.map(ua => {
              const def = ACHIEVEMENTS_LIST.find(a => a.key === ua.key);
              if (!def) return null;
              return (
                <motion.div
                  key={ua.key}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card className="border-amber-500/20 glow-amber">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center text-2xl">
                        {def.icon}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-sm font-bold text-amber-300">{def.name}</h3>
                        <p className="text-xs text-zinc-500">{def.description}</p>
                        <p className="text-xs text-zinc-600 mt-0.5">Unlocked {formatDate(ua.unlockedAt)}</p>
                      </div>
                      <Unlock size={16} className="text-amber-400" />
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* Locked */}
      <motion.div variants={item}>
        <h2 className="text-xs font-semibold text-zinc-600 uppercase tracking-wider mb-3">Locked</h2>
        <div className="space-y-2">
          {ACHIEVEMENTS_LIST.filter(a => !unlockedKeys.has(a.key)).map(achievement => (
            <Card key={achievement.key} className="opacity-50">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-zinc-800 flex items-center justify-center text-2xl grayscale">
                  {achievement.icon}
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-medium text-zinc-400">{achievement.name}</h3>
                  <p className="text-xs text-zinc-600">{achievement.description}</p>
                </div>
                <Lock size={14} className="text-zinc-600" />
              </div>
            </Card>
          ))}
        </div>
      </motion.div>

      {unlockedAchievements.length === 0 && ACHIEVEMENTS_LIST.length === 0 && (
        <EmptyState
          icon="🏆"
          title="No achievements yet"
          subtitle="Complete workouts to unlock achievements."
          action={() => navigate('/workout')}
          actionLabel="Start Workout"
        />
      )}
    </motion.div>
  );
}

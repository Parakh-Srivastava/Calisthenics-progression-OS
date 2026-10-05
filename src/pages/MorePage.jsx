import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  History, BarChart3, BookOpen, Calendar, Award, Trophy,
  Heart, Settings, Database, GitBranch, ChevronRight
} from 'lucide-react';
import Card from '../components/ui/Card';

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.04 } } };
const item = { hidden: { opacity: 0, y: 8 }, show: { opacity: 1, y: 0 } };

const MENU_ITEMS = [
  { path: '/more/history', icon: History, label: 'Workout History', color: '#7c3aed' },
  { path: '/more/analytics', icon: BarChart3, label: 'Analytics', color: '#06b6d4' },
  { path: '/more/exercises', icon: BookOpen, label: 'Exercise Library', color: '#f59e0b' },
  { path: '/more/progressions', icon: GitBranch, label: 'Progression Trees', color: '#22c55e' },
  { path: '/more/calendar', icon: Calendar, label: 'Calendar', color: '#ec4899' },
  { path: '/more/achievements', icon: Award, label: 'Achievements', color: '#f59e0b' },
  { path: '/more/prs', icon: Trophy, label: 'Personal Records', color: '#ef4444' },
  { path: '/more/recovery', icon: Heart, label: 'Recovery', color: '#22c55e' },
  { path: '/more/settings', icon: Settings, label: 'Settings', color: '#71717a' },
];

export default function MorePage() {
  const navigate = useNavigate();

  return (
    <motion.div
      className="min-h-screen pb-24 px-4 pt-6 safe-area-top"
      variants={container}
      initial="hidden"
      animate="show"
    >
      <motion.h1 variants={item} className="text-2xl font-bold mb-6">More</motion.h1>

      <div className="space-y-2">
        {MENU_ITEMS.map(({ path, icon: Icon, label, color }) => (
          <motion.div key={path} variants={item}>
            <Card onClick={() => navigate(path)} className="active:scale-[0.99] transition-transform">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${color}15` }}>
                  <Icon size={20} style={{ color }} />
                </div>
                <span className="flex-1 text-sm font-medium">{label}</span>
                <ChevronRight size={16} className="text-zinc-600" />
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* App info */}
      <motion.div variants={item} className="mt-8 text-center">
        <p className="text-xs text-zinc-600">Calisthenics OS v1.0.0</p>
        <p className="text-xs text-zinc-700 mt-1">All data stored locally on your device</p>
      </motion.div>
    </motion.div>
  );
}

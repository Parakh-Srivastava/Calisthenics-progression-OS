import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, Filter, Dumbbell, ChevronRight } from 'lucide-react';
import { DEFAULT_EXERCISES, MUSCLE_GROUPS } from '../data/exercises';
import Card, { EmptyState } from '../components/ui/Card';
import BottomSheet from '../components/ui/BottomSheet';

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.03 } } };
const item = { hidden: { opacity: 0, y: 8 }, show: { opacity: 1, y: 0 } };

const DIFFICULTY_COLORS = ['', '#22c55e', '#22c55e', '#f59e0b', '#f59e0b', '#ef4444', '#ef4444', '#7c3aed', '#7c3aed', '#ef4444', '#ef4444'];
const DIFFICULTY_LABELS = ['', 'Beginner', 'Beginner', 'Intermediate', 'Intermediate', 'Advanced', 'Advanced', 'Elite', 'Elite', 'Elite', 'Elite'];

export default function ExerciseLibraryPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [selectedExercise, setSelectedExercise] = useState(null);

  const categories = ['all', 'push', 'pull', 'legs', 'core'];

  const filtered = DEFAULT_EXERCISES.filter(ex => {
    const matchesSearch = ex.name.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = filterCategory === 'all' || ex.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <motion.div
      className="min-h-screen pb-24 px-4 pt-6 safe-area-top"
      variants={container}
      initial="hidden"
      animate="show"
    >
      <motion.div variants={item} className="flex items-center gap-2 mb-4">
        <button onClick={() => navigate('/more')} className="text-sm text-violet-400 touch-target">← Back</button>
        <h1 className="text-2xl font-bold">Exercise Library</h1>
      </motion.div>

      {/* Search */}
      <motion.div variants={item} className="mb-4">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search exercises..."
            className="w-full pl-10 pr-4 py-3 rounded-xl bg-zinc-900 border border-zinc-800 text-sm focus:outline-none focus:border-violet-500"
          />
        </div>
      </motion.div>

      {/* Category Filter */}
      <motion.div variants={item} className="flex gap-2 mb-4 overflow-x-auto pb-1">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setFilterCategory(cat)}
            className={`px-4 py-2 rounded-lg text-xs font-medium whitespace-nowrap touch-target transition-colors ${
              filterCategory === cat
                ? 'bg-violet-500/20 text-violet-400 border border-violet-500/30'
                : 'bg-zinc-800 text-zinc-500'
            }`}
          >
            {cat === 'all' ? 'All' : cat.charAt(0).toUpperCase() + cat.slice(1)}
          </button>
        ))}
      </motion.div>

      <motion.p variants={item} className="text-xs text-zinc-500 mb-3">{filtered.length} exercises</motion.p>

      {/* Exercise list */}
      <div className="space-y-2">
        {filtered.map(exercise => (
          <motion.div key={exercise.id} variants={item}>
            <Card
              onClick={() => setSelectedExercise(exercise)}
              className="active:scale-[0.99]"
            >
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  exercise.classification === 'skill' ? 'bg-amber-500/20' : 'bg-violet-500/20'
                }`}>
                  <Dumbbell size={18} className={exercise.classification === 'skill' ? 'text-amber-400' : 'text-violet-400'} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold truncate">{exercise.name}</h3>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs capitalize px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-500">
                      {exercise.category}
                    </span>
                    <span
                      className="text-xs font-medium"
                      style={{ color: DIFFICULTY_COLORS[exercise.difficulty] || '#71717a' }}
                    >
                      {DIFFICULTY_LABELS[exercise.difficulty] || ''}
                    </span>
                    {exercise.classification === 'skill' && (
                      <span className="text-xs text-amber-400 font-medium">SKILL</span>
                    )}
                  </div>
                </div>
                <ChevronRight size={16} className="text-zinc-600 flex-shrink-0" />
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Exercise Detail Sheet */}
      <BottomSheet
        isOpen={!!selectedExercise}
        onClose={() => setSelectedExercise(null)}
        title={selectedExercise?.name}
      >
        {selectedExercise && (
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {selectedExercise.muscleGroup?.map(mg => (
                <span key={mg} className="px-2.5 py-1 rounded-lg bg-violet-500/10 text-violet-400 text-xs font-medium">
                  {mg}
                </span>
              ))}
              <span className="px-2.5 py-1 rounded-lg bg-zinc-800 text-zinc-400 text-xs font-medium capitalize">
                {selectedExercise.classification}
              </span>
            </div>

            <div>
              <h4 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1">Instructions</h4>
              <p className="text-sm text-zinc-300">{selectedExercise.instructions}</p>
            </div>

            {selectedExercise.commonMistakes && (
              <div>
                <h4 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1">Common Mistakes</h4>
                <p className="text-sm text-zinc-400">{selectedExercise.commonMistakes}</p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-xl bg-zinc-800">
                <p className="text-xs text-zinc-500 mb-0.5">Tempo</p>
                <p className="text-sm font-medium">{selectedExercise.tempo}</p>
              </div>
              <div className="p-3 rounded-xl bg-zinc-800">
                <p className="text-xs text-zinc-500 mb-0.5">Rest</p>
                <p className="text-sm font-medium">{selectedExercise.recommendedRest}s</p>
              </div>
              <div className="p-3 rounded-xl bg-zinc-800">
                <p className="text-xs text-zinc-500 mb-0.5">Progression</p>
                <p className="text-sm font-medium text-emerald-400">{selectedExercise.progression || '—'}</p>
              </div>
              <div className="p-3 rounded-xl bg-zinc-800">
                <p className="text-xs text-zinc-500 mb-0.5">Regression</p>
                <p className="text-sm font-medium text-amber-400">{selectedExercise.regression || '—'}</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <p className="text-xs text-zinc-500 w-full mb-1">Equipment:</p>
              {selectedExercise.equipment?.map(eq => (
                <span key={eq} className="px-2.5 py-1 rounded-lg bg-zinc-800 text-zinc-400 text-xs">
                  {eq}
                </span>
              ))}
            </div>
          </div>
        )}
      </BottomSheet>
    </motion.div>
  );
}

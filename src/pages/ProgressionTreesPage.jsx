import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { PROGRESSION_TREES } from '../data/progressions';
import { useGoals } from '../hooks/useDatabase';
import Card from '../components/ui/Card';

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.06 } } };
const item = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } };

export default function ProgressionTreesPage() {
  const navigate = useNavigate();
  const goals = useGoals();

  return (
    <motion.div
      className="min-h-screen pb-24 px-4 pt-6 safe-area-top"
      variants={container}
      initial="hidden"
      animate="show"
    >
      <motion.div variants={item} className="flex items-center gap-2 mb-6">
        <button onClick={() => navigate('/more')} className="text-sm text-violet-400 touch-target">← Back</button>
        <h1 className="text-2xl font-bold">Progression Trees</h1>
      </motion.div>

      <div className="space-y-6">
        {Object.entries(PROGRESSION_TREES).map(([key, tree]) => {
          const goal = goals.find(g => g.category === key);
          const currentLevel = goal?.currentLevel || 0;

          return (
            <motion.div key={key} variants={item}>
              <Card className="border-zinc-800/60">
                {/* Header */}
                <div className="flex items-center gap-3 mb-5">
                  <span className="text-3xl">{tree.icon}</span>
                  <div>
                    <h2 className="text-lg font-bold">{tree.name}</h2>
                    <p className="text-xs text-zinc-500">
                      Target: {tree.target} {tree.unit}
                    </p>
                  </div>
                </div>

                {/* Tree visualization */}
                <div className="relative pl-4">
                  {tree.levels.map((level, i) => {
                    const isCompleted = i < currentLevel;
                    const isCurrent = i === currentLevel;
                    const isLocked = i > currentLevel;
                    const isLast = i === tree.levels.length - 1;

                    return (
                      <div key={level.id} className="relative flex items-start gap-4 pb-1">
                        {/* Connector line */}
                        {!isLast && (
                          <div className={`absolute left-[7px] top-5 w-0.5 h-full ${
                            isCompleted ? 'bg-emerald-500/40' : 'bg-zinc-800'
                          }`} />
                        )}

                        {/* Node */}
                        <div className="relative z-10 flex-shrink-0">
                          <motion.div
                            className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                              isCompleted ? 'bg-emerald-500 border-emerald-500' :
                              isCurrent ? 'border-violet-400 bg-violet-400/20 shadow-lg shadow-violet-500/20' :
                              'border-zinc-700 bg-zinc-900'
                            }`}
                            initial={isCurrent ? { scale: 0.8 } : {}}
                            animate={isCurrent ? { scale: [0.8, 1.1, 1] } : {}}
                            transition={{ duration: 0.5, delay: 0.3 }}
                          >
                            {isCompleted && (
                              <svg width="8" height="8" viewBox="0 0 8 8" fill="white">
                                <path d="M1 4l2 2 4-4" stroke="white" strokeWidth="1.5" fill="none" />
                              </svg>
                            )}
                          </motion.div>
                        </div>

                        {/* Content */}
                        <div className={`pb-5 ${isLocked ? 'opacity-30' : ''}`}>
                          <p className={`text-sm font-semibold leading-tight ${
                            isCurrent ? 'text-violet-400' :
                            isCompleted ? 'text-emerald-400' :
                            'text-zinc-500'
                          }`}>
                            {level.name}
                          </p>
                          <p className="text-xs text-zinc-600 mt-0.5">{level.description}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-[10px] text-zinc-600">
                              {level.target} {level.unit}
                            </span>
                            {isCurrent && (
                              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-violet-500/20 text-violet-400 font-medium">
                                CURRENT
                              </span>
                            )}
                            {isCompleted && (
                              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-medium">
                                ✓
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}

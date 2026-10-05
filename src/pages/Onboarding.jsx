import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronLeft, Check } from 'lucide-react';
import { PROGRESSION_TREES, GOAL_CATEGORIES } from '../data/progressions';
import { initializeDatabase } from '../db/services';

const STEPS = ['welcome', 'date', 'goals', 'ability', 'schedule', 'ready'];

const ABILITIES = [
  { value: 0, label: 'Beginner', desc: 'Just starting out' },
  { value: 1, label: 'Some Experience', desc: 'Have done some training' },
  { value: 2, label: 'Intermediate', desc: 'Consistent for a while' },
  { value: 3, label: 'Custom', desc: 'Set your own level' },
];

export default function Onboarding({ onComplete }) {
  const [step, setStep] = useState(0);
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [abilities, setAbilities] = useState({});

  const currentStep = STEPS[step];

  const handleNext = () => {
    if (step < STEPS.length - 1) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 0) setStep(step - 1);
  };

  const handleFinish = async () => {
    await initializeDatabase(startDate, abilities);
    onComplete();
  };

  const setAbility = (goalKey, level) => {
    setAbilities(prev => ({ ...prev, [goalKey]: level }));
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center px-6 safe-area-top safe-area-bottom">
      {/* Progress dots */}
      <div className="flex gap-2 mb-12">
        {STEPS.map((_, i) => (
          <div
            key={i}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              i === step ? 'w-6 bg-violet-500' :
              i < step ? 'bg-violet-500/40' : 'bg-zinc-700'
            }`}
          />
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -50 }}
          transition={{ duration: 0.25 }}
          className="w-full max-w-md"
        >
          {/* STEP: Welcome */}
          {currentStep === 'welcome' && (
            <div className="text-center">
              <motion.div
                className="text-6xl mb-6"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', delay: 0.2 }}
              >
                🏋️
              </motion.div>
              <h1 className="text-3xl font-bold mb-3 bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">
                Calisthenics OS
              </h1>
              <p className="text-zinc-400 text-sm mb-2">Your personal progression operating system</p>
              <p className="text-zinc-500 text-xs max-w-xs mx-auto">
                Your 30-month calisthenics progression starts here. Track workouts, unlock progressions, and crush your goals.
              </p>
            </div>
          )}

          {/* STEP: Start Date */}
          {currentStep === 'date' && (
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-2">When do you start?</h2>
              <p className="text-zinc-500 text-sm mb-8">This sets the beginning of your 30-month progression timeline.</p>
              <input
                type="date"
                value={startDate}
                onChange={e => setStartDate(e.target.value)}
                className="w-full px-4 py-4 rounded-2xl bg-zinc-900 border border-zinc-800 text-center text-lg font-medium focus:outline-none focus:border-violet-500"
              />
              <p className="text-xs text-zinc-600 mt-3">You can change this later in Settings.</p>
            </div>
          )}

          {/* STEP: Goals Confirmation */}
          {currentStep === 'goals' && (
            <div>
              <h2 className="text-2xl font-bold mb-2 text-center">Your 5 Goals</h2>
              <p className="text-zinc-500 text-sm mb-6 text-center">These are your 30-month targets. You can modify them anytime.</p>
              <div className="space-y-3">
                {Object.entries(GOAL_CATEGORIES).map(([key, cat]) => {
                  const tree = PROGRESSION_TREES[key];
                  return (
                    <div
                      key={key}
                      className="flex items-center gap-3 p-4 rounded-2xl bg-zinc-900 border border-zinc-800"
                    >
                      <span className="text-2xl">{tree.icon}</span>
                      <div className="flex-1">
                        <p className="text-sm font-semibold">{cat.name}</p>
                        <p className="text-xs text-zinc-500">{tree.target} {tree.unit}</p>
                      </div>
                      <div className="w-6 h-6 rounded-full bg-violet-500/20 flex items-center justify-center">
                        <Check size={14} className="text-violet-400" />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP: Current Ability */}
          {currentStep === 'ability' && (
            <div>
              <h2 className="text-2xl font-bold mb-2 text-center">Your Current Level</h2>
              <p className="text-zinc-500 text-sm mb-6 text-center">For each goal, select your starting level.</p>
              <div className="space-y-4">
                {Object.entries(PROGRESSION_TREES).map(([key, tree]) => (
                  <div key={key}>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-lg">{tree.icon}</span>
                      <span className="text-sm font-semibold">{tree.name}</span>
                    </div>
                    <div className="grid grid-cols-4 gap-2">
                      {ABILITIES.map(ab => (
                        <button
                          key={ab.value}
                          onClick={() => setAbility(key, ab.value)}
                          className={`py-2 px-2 rounded-xl text-xs font-medium transition-all touch-target ${
                            (abilities[key] || 0) === ab.value
                              ? 'bg-violet-500/20 text-violet-400 border border-violet-500/30'
                              : 'bg-zinc-800 text-zinc-500'
                          }`}
                        >
                          {ab.label}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STEP: Schedule Confirmation */}
          {currentStep === 'schedule' && (
            <div>
              <h2 className="text-2xl font-bold mb-2 text-center">Your Weekly Schedule</h2>
              <p className="text-zinc-500 text-sm mb-6 text-center">Default training split. You can customize later.</p>
              <div className="space-y-2">
                {[
                  { day: 'Monday', type: 'Push + Plank', icon: '🫸' },
                  { day: 'Tuesday', type: 'Pull + Plank', icon: '💪' },
                  { day: 'Wednesday', type: 'Legs', icon: '🦵' },
                  { day: 'Thursday', type: 'Rest / Recovery', icon: '🧘' },
                  { day: 'Friday', type: 'Upper + Plank', icon: '🔱' },
                  { day: 'Saturday', type: 'Lower + Plank', icon: '🏋️' },
                  { day: 'Sunday', type: 'Rest', icon: '😴' },
                ].map(d => (
                  <div key={d.day} className="flex items-center gap-3 py-3 px-4 rounded-xl bg-zinc-900 border border-zinc-800">
                    <span className="text-lg">{d.icon}</span>
                    <span className="text-sm font-medium flex-1">{d.day}</span>
                    <span className="text-xs text-zinc-500">{d.type}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STEP: Ready */}
          {currentStep === 'ready' && (
            <div className="text-center">
              <motion.div
                className="text-6xl mb-6"
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', delay: 0.2 }}
              >
                🚀
              </motion.div>
              <h2 className="text-3xl font-bold mb-3">You're Ready</h2>
              <p className="text-zinc-400 text-sm mb-2">Your progression journey begins now.</p>
              <p className="text-zinc-500 text-xs max-w-xs mx-auto">
                All data is stored locally on your device. No accounts, no cloud, no tracking. Just you and your training.
              </p>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Navigation */}
      <div className="flex gap-3 mt-12 w-full max-w-md">
        {step > 0 && (
          <button
            onClick={handleBack}
            className="px-6 py-4 rounded-2xl bg-zinc-800 text-zinc-300 font-medium touch-target flex items-center gap-1"
          >
            <ChevronLeft size={18} /> Back
          </button>
        )}
        <button
          onClick={currentStep === 'ready' ? handleFinish : handleNext}
          className="flex-1 py-4 rounded-2xl bg-gradient-to-r from-violet-600 to-violet-500 text-white font-bold text-lg touch-target active:scale-[0.98] transition-transform flex items-center justify-center gap-2"
        >
          {currentStep === 'ready' ? (
            <>Start Training</>
          ) : (
            <>Continue <ChevronRight size={18} /></>
          )}
        </button>
      </div>
    </div>
  );
}

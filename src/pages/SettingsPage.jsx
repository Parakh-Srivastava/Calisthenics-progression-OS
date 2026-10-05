import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Download, Upload, Trash2, RotateCcw, Volume2, Vibrate, Bell, Palette, ChevronRight } from 'lucide-react';
import { useSettings } from '../hooks/useDatabase';
import { setSetting } from '../db/database';
import { exportAllData, importData, resetData } from '../db/services';
import Card from '../components/ui/Card';
import { ConfirmModal } from '../components/ui/BottomSheet';
import BottomSheet from '../components/ui/BottomSheet';

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.04 } } };
const item = { hidden: { opacity: 0, y: 8 }, show: { opacity: 1, y: 0 } };

export default function SettingsPage() {
  const navigate = useNavigate();
  const settings = useSettings();
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [resetType, setResetType] = useState(null);
  const [showImportSheet, setShowImportSheet] = useState(false);
  const [importMode, setImportMode] = useState('merge');
  const [importError, setImportError] = useState('');
  const [importSuccess, setImportSuccess] = useState(false);

  const toggleSetting = async (key) => {
    await setSetting(key, !settings[key]);
  };

  const handleExport = async () => {
    try {
      const data = await exportAllData();
      const json = JSON.stringify(data, null, 2);
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      const date = new Date().toISOString().split('T')[0];
      a.href = url;
      a.download = `calisthenics-backup-${date}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Export failed:', err);
    }
  };

  const handleImport = async (file) => {
    try {
      setImportError('');
      setImportSuccess(false);
      const text = await file.text();
      const data = JSON.parse(text);
      if (!data.version) throw new Error('Invalid backup file');
      await importData(data, importMode);
      setImportSuccess(true);
    } catch (err) {
      setImportError(err.message || 'Failed to import data');
    }
  };

  const handleReset = async () => {
    try {
      await resetData(resetType);
      setShowResetConfirm(false);
      if (resetType === 'everything') {
        window.location.reload();
      }
    } catch (err) {
      console.error('Reset failed:', err);
    }
  };

  const handleRestTimeChange = async (value) => {
    await setSetting('defaultRestTime', parseInt(value) || 60);
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
        <h1 className="text-2xl font-bold">Settings</h1>
      </motion.div>

      {/* Preferences */}
      <motion.div variants={item} className="mb-6">
        <h2 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3">Preferences</h2>
        <div className="space-y-2">
          <Card className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Volume2 size={18} className="text-zinc-400" />
              <span className="text-sm">Sound Effects</span>
            </div>
            <button
              onClick={() => toggleSetting('soundEnabled')}
              className={`w-12 h-7 rounded-full transition-colors ${settings.soundEnabled ? 'bg-violet-600' : 'bg-zinc-700'}`}
            >
              <div className={`w-5 h-5 bg-white rounded-full transition-transform mx-1 ${settings.soundEnabled ? 'translate-x-5' : 'translate-x-0'}`} />
            </button>
          </Card>

          <Card className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Vibrate size={18} className="text-zinc-400" />
              <span className="text-sm">Haptic Feedback</span>
            </div>
            <button
              onClick={() => toggleSetting('hapticsEnabled')}
              className={`w-12 h-7 rounded-full transition-colors ${settings.hapticsEnabled ? 'bg-violet-600' : 'bg-zinc-700'}`}
            >
              <div className={`w-5 h-5 bg-white rounded-full transition-transform mx-1 ${settings.hapticsEnabled ? 'translate-x-5' : 'translate-x-0'}`} />
            </button>
          </Card>

          <Card className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Bell size={18} className="text-zinc-400" />
              <span className="text-sm">Notifications</span>
            </div>
            <button
              onClick={() => toggleSetting('notificationsEnabled')}
              className={`w-12 h-7 rounded-full transition-colors ${settings.notificationsEnabled ? 'bg-violet-600' : 'bg-zinc-700'}`}
            >
              <div className={`w-5 h-5 bg-white rounded-full transition-transform mx-1 ${settings.notificationsEnabled ? 'translate-x-5' : 'translate-x-0'}`} />
            </button>
          </Card>

          <Card>
            <div className="flex items-center justify-between">
              <span className="text-sm">Default Rest Time</span>
              <div className="flex items-center gap-2">
                {[30, 45, 60, 90, 120].map(sec => (
                  <button
                    key={sec}
                    onClick={() => handleRestTimeChange(sec)}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-medium ${
                      settings.defaultRestTime === sec
                        ? 'bg-violet-500/20 text-violet-400'
                        : 'bg-zinc-800 text-zinc-500'
                    }`}
                  >
                    {sec}s
                  </button>
                ))}
              </div>
            </div>
          </Card>
        </div>
      </motion.div>

      {/* Data Management */}
      <motion.div variants={item} className="mb-6">
        <h2 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3">Data Management</h2>
        <div className="space-y-2">
          <Card onClick={handleExport} className="flex items-center gap-3 active:scale-[0.99]">
            <Download size={18} className="text-cyan-400" />
            <span className="text-sm flex-1">Export Data</span>
            <ChevronRight size={16} className="text-zinc-600" />
          </Card>

          <Card onClick={() => setShowImportSheet(true)} className="flex items-center gap-3 active:scale-[0.99]">
            <Upload size={18} className="text-emerald-400" />
            <span className="text-sm flex-1">Import Data</span>
            <ChevronRight size={16} className="text-zinc-600" />
          </Card>
        </div>
      </motion.div>

      {/* Danger Zone */}
      <motion.div variants={item}>
        <h2 className="text-xs font-semibold text-red-400/60 uppercase tracking-wider mb-3">Danger Zone</h2>
        <div className="space-y-2">
          <Card
            onClick={() => { setResetType('progress'); setShowResetConfirm(true); }}
            className="flex items-center gap-3 border-red-500/10 active:scale-[0.99]"
          >
            <RotateCcw size={18} className="text-amber-400" />
            <span className="text-sm flex-1 text-zinc-400">Reset Progress</span>
          </Card>
          <Card
            onClick={() => { setResetType('workouts'); setShowResetConfirm(true); }}
            className="flex items-center gap-3 border-red-500/10 active:scale-[0.99]"
          >
            <RotateCcw size={18} className="text-amber-400" />
            <span className="text-sm flex-1 text-zinc-400">Reset Workouts</span>
          </Card>
          <Card
            onClick={() => { setResetType('everything'); setShowResetConfirm(true); }}
            className="flex items-center gap-3 border-red-500/20 active:scale-[0.99]"
          >
            <Trash2 size={18} className="text-red-400" />
            <span className="text-sm flex-1 text-red-400">Reset Everything</span>
          </Card>
        </div>
      </motion.div>

      {/* About */}
      <motion.div variants={item} className="mt-8 text-center space-y-1">
        <p className="text-xs text-zinc-600">Calisthenics Progression OS v1.0.0</p>
        <p className="text-xs text-zinc-700">No data leaves your device. No tracking. No accounts.</p>
        <p className="text-xs text-zinc-700">Built for the 30-month journey.</p>
      </motion.div>

      {/* Reset Confirm Modal */}
      <ConfirmModal
        isOpen={showResetConfirm}
        onClose={() => setShowResetConfirm(false)}
        onConfirm={handleReset}
        title={`Reset ${resetType === 'everything' ? 'Everything' : resetType === 'progress' ? 'Progress' : 'Workouts'}?`}
        message={
          resetType === 'everything'
            ? 'This will permanently delete ALL your data including goals, workouts, achievements, and settings. This cannot be undone.'
            : `This will reset your ${resetType}. Export your data first if you want to keep a backup.`
        }
        confirmText={resetType === 'everything' ? 'Delete Everything' : 'Reset'}
        danger
      />

      {/* Import Sheet */}
      <BottomSheet isOpen={showImportSheet} onClose={() => { setShowImportSheet(false); setImportError(''); setImportSuccess(false); }} title="Import Data">
        <div className="space-y-4">
          <div>
            <p className="text-sm text-zinc-400 mb-3">Choose how to handle existing data:</p>
            <div className="flex gap-2">
              {['merge', 'replace'].map(mode => (
                <button
                  key={mode}
                  onClick={() => setImportMode(mode)}
                  className={`flex-1 py-3 rounded-xl text-sm font-medium ${
                    importMode === mode ? 'bg-violet-500/20 text-violet-400 border border-violet-500/30' : 'bg-zinc-800 text-zinc-500'
                  }`}
                >
                  {mode === 'merge' ? 'Merge' : 'Replace'}
                </button>
              ))}
            </div>
            {importMode === 'replace' && (
              <p className="text-xs text-red-400 mt-2">⚠️ Replace will delete all existing data before importing.</p>
            )}
          </div>

          <label className="block w-full py-4 rounded-xl border-2 border-dashed border-zinc-700 text-center cursor-pointer hover:border-violet-500/50 transition-colors">
            <input
              type="file"
              accept=".json"
              className="hidden"
              onChange={e => e.target.files?.[0] && handleImport(e.target.files[0])}
            />
            <span className="text-sm text-zinc-400">Tap to select backup file (.json)</span>
          </label>

          {importError && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-sm text-red-400">
              {importError}
            </div>
          )}
          {importSuccess && (
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-sm text-emerald-400">
              ✓ Data imported successfully!
            </div>
          )}
        </div>
      </BottomSheet>
    </motion.div>
  );
}

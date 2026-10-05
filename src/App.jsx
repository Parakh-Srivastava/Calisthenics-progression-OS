import { useState, useEffect, useRef, Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { App as CapacitorApp } from '@capacitor/app';
import { Capacitor } from '@capacitor/core';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from './db/database';
import BottomNav from './components/navigation/BottomNav';
import { dismissTopBackAction } from './hooks/useBackDismiss';
import Onboarding from './pages/Onboarding';
import GoalsPage, { GoalDetailPage } from './pages/GoalsPage';
import HistoryPage, { WorkoutDetailPage } from './pages/HistoryPage';

// Lazy load pages for performance
const Dashboard = lazy(() => import('./pages/Dashboard'));
const WorkoutPage = lazy(() => import('./pages/WorkoutPage'));
const ActiveWorkout = lazy(() => import('./pages/ActiveWorkout'));
const ProgressPage = lazy(() => import('./pages/ProgressPage'));
const MorePage = lazy(() => import('./pages/MorePage'));
const SettingsPage = lazy(() => import('./pages/SettingsPage'));
const RecoveryPage = lazy(() => import('./pages/RecoveryPage'));
const AchievementsPage = lazy(() => import('./pages/AchievementsPage'));
const PRsPage = lazy(() => import('./pages/PRsPage'));
const CalendarPage = lazy(() => import('./pages/CalendarPage'));
const ExerciseLibraryPage = lazy(() => import('./pages/ExerciseLibraryPage'));
const ProgressionTreesPage = lazy(() => import('./pages/ProgressionTreesPage'));
const AnalyticsPage = lazy(() => import('./pages/AnalyticsPage'));

function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-950">
      <div className="text-center">
        <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-xs text-zinc-500">Loading...</p>
      </div>
    </div>
  );
}

function BackHandler() {
  const location = useLocation();
  const navigate = useNavigate();
  const locationRef = useRef(location);

  useEffect(() => {
    locationRef.current = location;
  }, [location]);

  useEffect(() => {
    const handleBack = () => {
      if (dismissTopBackAction()) return;

      if (window.scrollY > 0) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }

      if (locationRef.current.pathname !== '/') {
        navigate('/', { replace: true });
      } else if (window.history.length > 1) {
        window.history.back();
      }
    };

    const handleKeyDown = event => {
      if (event.key !== 'Backspace' || event.target instanceof HTMLElement && (
        event.target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(event.target.tagName)
      )) return;
      event.preventDefault();
      handleBack();
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('popstate', handleBack);

    let removeCapacitorListener;
    if (Capacitor.isNativePlatform()) {
      let listener;
      CapacitorApp.addListener('backButton', handleBack).then(subscription => {
        listener = subscription;
        removeCapacitorListener = () => listener.remove();
      });
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('popstate', handleBack);
      removeCapacitorListener?.();
    };
  }, [navigate]);

  return null;
}

export default function App() {
  const [isOnboarded, setIsOnboarded] = useState(null);

  const onboardingComplete = useLiveQuery(async () => {
    const row = await db.settings.get('onboardingComplete');
    return row?.value || false;
  });

  useEffect(() => {
    if (onboardingComplete !== undefined) {
      setIsOnboarded(onboardingComplete);
    }
  }, [onboardingComplete]);

  if (isOnboarded === null) {
    return <LoadingScreen />;
  }

  if (!isOnboarded) {
    return <Onboarding onComplete={() => setIsOnboarded(true)} />;
  }

  return (
    <BrowserRouter>
      <BackHandler />
      <div className="min-h-screen bg-zinc-950 text-zinc-100">
        <Suspense fallback={<LoadingScreen />}>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/workout" element={<WorkoutPage />} />
            <Route path="/workout/active" element={<ActiveWorkout />} />
            <Route path="/progress" element={<ProgressPage />} />
            <Route path="/goals" element={<GoalsPage />} />
            <Route path="/goals/:goalId" element={<GoalDetailPage />} />
            <Route path="/more" element={<MorePage />} />
            <Route path="/more/history" element={<HistoryPage />} />
            <Route path="/more/history/:workoutId" element={<WorkoutDetailPage />} />
            <Route path="/more/settings" element={<SettingsPage />} />
            <Route path="/more/recovery" element={<RecoveryPage />} />
            <Route path="/more/achievements" element={<AchievementsPage />} />
            <Route path="/more/prs" element={<PRsPage />} />
            <Route path="/more/calendar" element={<CalendarPage />} />
            <Route path="/more/exercises" element={<ExerciseLibraryPage />} />
            <Route path="/more/progressions" element={<ProgressionTreesPage />} />
            <Route path="/more/analytics" element={<AnalyticsPage />} />
          </Routes>
        </Suspense>
        <BottomNav />
      </div>
    </BrowserRouter>
  );
}

import { useState, useEffect, useRef, useCallback } from 'react';

/** Rest timer hook */
export function useTimer(initialTime = 60) {
  const [time, setTime] = useState(initialTime);
  const [isRunning, setIsRunning] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const intervalRef = useRef(null);
  const startTimeRef = useRef(null);
  const totalTimeRef = useRef(initialTime);

  const start = useCallback((duration) => {
    if (duration !== undefined) {
      totalTimeRef.current = duration;
      setTime(duration);
    }
    setIsRunning(true);
    setIsComplete(false);
    startTimeRef.current = Date.now();
  }, []);

  const pause = useCallback(() => {
    setIsRunning(false);
  }, []);

  const reset = useCallback((duration) => {
    setIsRunning(false);
    setIsComplete(false);
    const t = duration !== undefined ? duration : totalTimeRef.current;
    totalTimeRef.current = t;
    setTime(t);
  }, []);

  const addTime = useCallback((seconds) => {
    setTime(prev => prev + seconds);
    totalTimeRef.current += seconds;
  }, []);

  useEffect(() => {
    if (isRunning && time > 0) {
      intervalRef.current = setInterval(() => {
        setTime(prev => {
          if (prev <= 1) {
            setIsRunning(false);
            setIsComplete(true);
            clearInterval(intervalRef.current);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(intervalRef.current);
  }, [isRunning, time > 0]);

  const progress = totalTimeRef.current > 0 ? (totalTimeRef.current - time) / totalTimeRef.current : 0;

  return { time, isRunning, isComplete, progress, start, pause, reset, addTime, totalTime: totalTimeRef.current };
}

/** Stopwatch hook (counts up) */
export function useStopwatch() {
  const [time, setTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef(null);

  const start = useCallback(() => setIsRunning(true), []);
  const pause = useCallback(() => setIsRunning(false), []);
  const reset = useCallback(() => { setIsRunning(false); setTime(0); }, []);

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setTime(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(intervalRef.current);
  }, [isRunning]);

  return { time, isRunning, start, pause, reset };
}

/** Haptic feedback */
export function useHaptics() {
  const vibrate = useCallback((pattern = 10) => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(pattern);
    }
  }, []);

  return { vibrate };
}

/** Online status */
export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
}

/** Local storage hook for tiny preferences */
export function useLocalStorage(key, defaultValue) {
  const [value, setValue] = useState(() => {
    try {
      const stored = localStorage.getItem(key);
      return stored !== null ? JSON.parse(stored) : defaultValue;
    } catch {
      return defaultValue;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch { /* ignore */ }
  }, [key, value]);

  return [value, setValue];
}

/** Debounced value */
export function useDebounce(value, delay = 300) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}

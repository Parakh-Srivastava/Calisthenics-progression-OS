import { format, formatDistanceToNow, differenceInDays, differenceInMonths, startOfWeek, endOfWeek, eachDayOfInterval, isToday, isSameDay, getDay, addDays } from 'date-fns';

/** Format seconds into MM:SS */
export function formatTime(seconds) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

/** Format seconds into human readable */
export function formatDuration(seconds) {
  if (seconds < 60) return `${seconds}s`;
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  if (s === 0) return `${m}m`;
  return `${m}m ${s}s`;
}

/** Format date for display */
export function formatDate(date) {
  return format(new Date(date), 'MMM d, yyyy');
}

/** Format date short */
export function formatDateShort(date) {
  return format(new Date(date), 'MMM d');
}

/** Relative time */
export function timeAgo(date) {
  return formatDistanceToNow(new Date(date), { addSuffix: true });
}

/** Days between two dates */
export function daysBetween(date1, date2) {
  return differenceInDays(new Date(date2), new Date(date1));
}

/** Months between two dates */
export function monthsBetween(date1, date2) {
  return differenceInMonths(new Date(date2), new Date(date1));
}

/** Get day of week (0=Sun, 1=Mon, ...) */
export function getDayOfWeek(date) {
  return getDay(new Date(date));
}

/** Check if a date is today */
export function checkIsToday(date) {
  return isToday(new Date(date));
}

/** Check if two dates are same day */
export function isSameDate(date1, date2) {
  return isSameDay(new Date(date1), new Date(date2));
}

/** Get current week's dates */
export function getCurrentWeekDates() {
  const now = new Date();
  const weekStart = startOfWeek(now, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(now, { weekStartsOn: 1 });
  return eachDayOfInterval({ start: weekStart, end: weekEnd });
}

/** Get today's date as YYYY-MM-DD */
export function todayString() {
  return format(new Date(), 'yyyy-MM-dd');
}

/** Get a greeting based on time */
export function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 5) return 'Good Night';
  if (hour < 12) return 'Good Morning';
  if (hour < 17) return 'Good Afternoon';
  if (hour < 21) return 'Good Evening';
  return 'Good Night';
}

/** Calculate percentage */
export function percentage(current, total) {
  if (total <= 0) return 0;
  return Math.min(100, Math.round((current / total) * 100 * 10) / 10);
}

/** Generate a unique ID */
export function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

/** Clamp a number between min and max */
export function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

/** Format a number with commas */
export function formatNumber(num) {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

/** Get ISO week number */
export function getWeekNumber(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 3 - (d.getDay() + 6) % 7);
  const week1 = new Date(d.getFullYear(), 0, 4);
  return 1 + Math.round(((d - week1) / 86400000 - 3 + (week1.getDay() + 6) % 7) / 7);
}

/** Safely parse JSON */
export function safeJsonParse(str, fallback = null) {
  try {
    return JSON.parse(str);
  } catch {
    return fallback;
  }
}

/** Deep clone */
export function deepClone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

/** Get ordinal suffix */
export function ordinal(n) {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

/** Color for a goal category */
export const GOAL_COLORS = {
  pullups: '#06b6d4',
  dips: '#7c3aed',
  oneArmPushup: '#f59e0b',
  pistolSquat: '#22c55e',
  hspu: '#ef4444',
};

/** RIR display label */
export function rirLabel(rir) {
  if (rir === null || rir === undefined) return '';
  if (rir === 0) return 'RIR 0';
  if (rir === -1) return 'Failure';
  return `RIR ${rir}`;
}

/** Estimate month on a 30-month timeline */
export function monthOnTimeline(startDate, currentDate) {
  return monthsBetween(startDate, currentDate || new Date());
}

/** Calculate expected position on 30 month timeline */
export function expectedProgress(startDate, targetMonth = 30) {
  const elapsed = monthsBetween(startDate, new Date());
  return Math.min(100, (elapsed / targetMonth) * 100);
}

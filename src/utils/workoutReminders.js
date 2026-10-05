import { Capacitor } from '@capacitor/core';
import { LocalNotifications } from '@capacitor/local-notifications';
import { db } from '../db/database';

const REMINDER_ID_START = 73100;
const REMINDER_CHANNEL_ID = 'workout-reminders';

export async function setWorkoutReminders(enabled, time) {
  if (!Capacitor.isNativePlatform()) {
    if (!enabled) return;
    throw new Error('Scheduled workout reminders are only available in the installed mobile app.');
  }

  const ids = Array.from({ length: 7 }, (_, index) => REMINDER_ID_START + index);
  if (!enabled) {
    await LocalNotifications.cancel({ notifications: ids.map(id => ({ id })) });
    return;
  }

  const permission = await LocalNotifications.checkPermissions();
  const requestedPermission = permission.display === 'granted'
    ? permission
    : await LocalNotifications.requestPermissions();
  if (requestedPermission.display !== 'granted') {
    throw new Error('Notification permission was not granted. Enable notifications in your device settings to use workout reminders.');
  }

  if (Capacitor.getPlatform() === 'android') {
    await LocalNotifications.createChannel({
      id: REMINDER_CHANNEL_ID,
      name: 'Workout reminders',
      description: 'Vibrates at your chosen time on scheduled workout days.',
      importance: 4,
      vibration: true,
    });
  }

  const [hour, minute] = time.split(':').map(Number);
  if (!Number.isInteger(hour) || hour < 0 || hour > 23 || !Number.isInteger(minute) || minute < 0 || minute > 59) {
    throw new Error('Choose a valid workout reminder time.');
  }

  const workoutDays = (await db.weeklySchedule.toArray())
    .filter(day => day.type !== 'rest')
    .map(day => day.dayOfWeek);

  if (workoutDays.length === 0) {
    throw new Error('No workout days are scheduled. Add a workout day before enabling reminders.');
  }

  await LocalNotifications.cancel({ notifications: ids.map(id => ({ id })) });
  await LocalNotifications.schedule({
    notifications: workoutDays.map((dayOfWeek, index) => ({
      id: ids[index],
      title: 'Workout time',
      body: "It's time for your scheduled workout. Let's get moving!",
      channelId: REMINDER_CHANNEL_ID,
      schedule: {
        on: {
          weekday: dayOfWeek === 0 ? 1 : dayOfWeek + 1,
          hour,
          minute,
        },
        repeats: true,
        allowWhileIdle: true,
      },
    })),
  });
}

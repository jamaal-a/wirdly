import * as Notifications from 'expo-notifications';
import {
  AppSettings,
  PrayerTimes,
  ReminderNotificationData,
  TimeComponents,
  WirdReminder,
} from '../types';
import { settingsService } from './settingsService';

const DEFAULT_TIME: TimeComponents = { hours: 9, minutes: 0 };

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

const isReminderNotification = (data: any): data is ReminderNotificationData => {
  return data && typeof data === 'object' && data.type === 'wird_reminder' && typeof data.reminderId === 'string';
};

const parseTimeToComponents = (rawTime?: string): TimeComponents => {
  if (!rawTime) {
    return DEFAULT_TIME;
  }

  const trimmed = rawTime.trim();
  if (!trimmed) {
    return DEFAULT_TIME;
  }

  const upper = trimmed.toUpperCase();
  const hasMeridiem = upper.includes('AM') || upper.includes('PM');

  let hours = DEFAULT_TIME.hours;
  let minutes = DEFAULT_TIME.minutes;

  try {
    if (hasMeridiem) {
      const cleaned = upper.replace(/\s*(AM|PM)\s*/g, '');
      const [hourStr = '', minuteStr = ''] = cleaned.split(':');
      const parsedHour12 = Math.max(1, Math.min(12, parseInt(hourStr, 10) || DEFAULT_TIME.hours));
      const parsedMinute = Math.max(0, Math.min(59, parseInt(minuteStr, 10) || DEFAULT_TIME.minutes));

      const isPM = upper.includes('PM');
      const isAM = upper.includes('AM');

      hours = parsedHour12 % 12;
      if (isPM) {
        hours += 12;
      }
      if (isAM && parsedHour12 === 12) {
        hours = 0;
      }
      minutes = parsedMinute;
    } else {
      const [hourStr = '', minuteStr = ''] = upper.split(':');
      const parsedHour24 = Math.max(0, Math.min(23, parseInt(hourStr, 10) ?? DEFAULT_TIME.hours));
      const parsedMinute = Math.max(0, Math.min(59, parseInt(minuteStr, 10) ?? DEFAULT_TIME.minutes));

      hours = parsedHour24;
      minutes = parsedMinute;
    }
  } catch (error) {
    console.warn('Failed to parse reminder time, falling back to default', error);
    hours = DEFAULT_TIME.hours;
    minutes = DEFAULT_TIME.minutes;
  }

  return { hours, minutes };
};

const getDaysInMonth = (year: number, monthIndex: number) => {
  return new Date(year, monthIndex + 1, 0).getDate();
};

const clampDayOfMonth = (year: number, monthIndex: number, desiredDay?: number) => {
  if (!desiredDay) return 1;
  return Math.max(1, Math.min(desiredDay, getDaysInMonth(year, monthIndex)));
};

const computeNextDailyOccurrence = (time?: string): Date => {
  const { hours, minutes } = parseTimeToComponents(time);
  const now = new Date();
  const next = new Date(now);
  next.setHours(hours, minutes, 0, 0);
  if (next <= now) {
    next.setDate(next.getDate() + 1);
  }
  return next;
};

const computeNextWeeklyOccurrence = (dayOfWeek?: number, time?: string): Date | null => {
  if (dayOfWeek === undefined || dayOfWeek < 0 || dayOfWeek > 6) {
    return null;
  }
  const { hours, minutes } = parseTimeToComponents(time);
  const now = new Date();
  const next = new Date(now);
  const currentDay = now.getDay();
  let daysUntil = (dayOfWeek - currentDay + 7) % 7;
  next.setDate(now.getDate() + daysUntil);
  next.setHours(hours, minutes, 0, 0);
  if (daysUntil === 0 && next <= now) {
    next.setDate(next.getDate() + 7);
  }
  return next;
};

const computeNextMonthlyOccurrence = (dayOfMonth?: number, time?: string): Date | null => {
  if (!dayOfMonth) {
    return null;
  }
  const { hours, minutes } = parseTimeToComponents(time);
  const now = new Date();
  const next = new Date(now);
  const clampedDay = clampDayOfMonth(now.getFullYear(), now.getMonth(), dayOfMonth);
  next.setDate(clampedDay);
  next.setHours(hours, minutes, 0, 0);

  if (next <= now) {
    const nextMonthIndex = (now.getMonth() + 1) % 12;
    const nextYear = now.getFullYear() + (now.getMonth() === 11 ? 1 : 0);
    const adjustedDay = clampDayOfMonth(nextYear, nextMonthIndex, dayOfMonth);
    next.setMonth(nextMonthIndex, adjustedDay);
    next.setFullYear(nextYear);
  }

  return next;
};

const computeNextYearlyOccurrence = (month?: number, dayOfMonth?: number, time?: string): Date | null => {
  if (!month || !dayOfMonth) {
    return null;
  }
  const { hours, minutes } = parseTimeToComponents(time);
  const now = new Date();
  const next = new Date(now);
  const monthIndex = Math.max(0, Math.min(11, month - 1));
  const clampedDay = clampDayOfMonth(now.getFullYear(), monthIndex, dayOfMonth);
  next.setMonth(monthIndex, clampedDay);
  next.setHours(hours, minutes, 0, 0);

  if (next <= now) {
    const nextYear = now.getFullYear() + 1;
    const adjustedDay = clampDayOfMonth(nextYear, monthIndex, dayOfMonth);
    next.setFullYear(nextYear, monthIndex, adjustedDay);
  }

  return next;
};

const computeNextHourlyOccurrence = (): Date => {
  const now = new Date();
  const next = new Date(now);
  next.setMinutes(0, 0, 0);
  next.setHours(now.getHours() + (now.getMinutes() === 0 && now.getSeconds() === 0 ? 0 : 1));
  return next;
};

const buildReminderNotificationData = (reminder: WirdReminder): ReminderNotificationData => ({
  type: 'wird_reminder',
  reminderId: reminder.id,
  reminderTitle: reminder.title,
  reminderDescription: reminder.description,
  reminderCategory: reminder.category,
  reminderImageUrl: reminder.imageUrl,
  reminderFileUrl: reminder.fileUrl,
  reminderLinkUrl: reminder.linkUrl,
});

const buildNotificationContent = (
  reminder: WirdReminder,
  enableSound: boolean | undefined,
): Notifications.NotificationContentInput => ({
  title: `📿 ${reminder.title}`,
  body: reminder.description || 'Time for your wird reminder',
  sound: enableSound ? 'default' : false,
  data: buildReminderNotificationData(reminder) as unknown as Record<string, unknown>,
});

const buildTrigger = (
  reminder: WirdReminder,
  nextOccurrence: Date,
): Notifications.NotificationTriggerInput | null => {
  // Ensure we only schedule future notifications
  const now = new Date();
  if (nextOccurrence <= now) {
    console.warn(`⚠️ Next occurrence is in the past for reminder "${reminder.title}". Skipping.`);
    return null;
  }

  switch (reminder.type) {
    case 'daily': {
      const { hours, minutes } = parseTimeToComponents(reminder.time);
      // Use DateTrigger for the first occurrence - schedule for next occurrence
      // Note: For true daily repeats, we'd need to schedule multiple notifications
      // For now, schedule the next occurrence and it will need to be rescheduled after it fires
      return { type: 'date', date: nextOccurrence } as Notifications.NotificationTriggerInput;
    }
    case 'weekly': {
      if (reminder.dayOfWeek === undefined) return null;
      // Use DateTrigger for the next weekly occurrence
      return { type: 'date', date: nextOccurrence } as Notifications.NotificationTriggerInput;
    }
    case 'monthly': {
      if (!reminder.dayOfMonth) return null;
      // Use DateTrigger for the next monthly occurrence
      return { type: 'date', date: nextOccurrence } as Notifications.NotificationTriggerInput;
    }
    case 'yearly': {
      if (!reminder.month || !reminder.dayOfMonth) return null;
      // Use DateTrigger for the next yearly occurrence
      return { type: 'date', date: nextOccurrence } as Notifications.NotificationTriggerInput;
    }
    case 'hourly': {
      // Use DateTrigger for the next hourly occurrence
      return { type: 'date', date: nextOccurrence } as Notifications.NotificationTriggerInput;
    }
    case 'prayer':
      return null;
    default:
      return null;
  }
};

const cancelReminderNotifications = async (reminderId: string): Promise<number> => {
  try {
    const scheduled = await Notifications.getAllScheduledNotificationsAsync();
    const matching = scheduled.filter(notification =>
      isReminderNotification(notification.content?.data) &&
      notification.content.data.reminderId === reminderId
    );

    await Promise.all(
      matching.map(notification =>
        Notifications.cancelScheduledNotificationAsync(notification.identifier),
      ),
    );

    if (matching.length > 0) {
      console.log(`🧹 Cleared ${matching.length} scheduled notifications for reminder ${reminderId}`);
    }

    return matching.length;
  } catch (error) {
    console.warn('Failed to cancel reminder notifications', error);
    return 0;
  }
};

const cancelAllReminderNotifications = async (): Promise<number> => {
  try {
    const scheduled = await Notifications.getAllScheduledNotificationsAsync();
    const reminderNotifications = scheduled.filter(notification =>
      isReminderNotification(notification.content?.data),
    );

    await Promise.all(
      reminderNotifications.map(notification =>
        Notifications.cancelScheduledNotificationAsync(notification.identifier),
      ),
    );

    if (reminderNotifications.length > 0) {
      console.log(`🧹 Cleared ${reminderNotifications.length} wird reminder notifications`);
    }

    return reminderNotifications.length;
  } catch (error) {
    console.warn('Failed to clear wird reminder notifications', error);
    return 0;
  }
};

export const notificationService = {
  requestPermissions: async (): Promise<boolean> => {
    try {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      if (existingStatus === 'granted') {
        return true;
      }
      const { status } = await Notifications.requestPermissionsAsync();
      return status === 'granted';
    } catch (error) {
      console.warn('Error requesting notification permissions', error);
      return false;
    }
  },

  schedulePrayerNotifications: async (prayerTimes: PrayerTimes, date: Date) => {
    try {
      const settings = settingsService.getAllSettings();
      if (!settings.prayerNotifications) return;

      const existing = await Notifications.getAllScheduledNotificationsAsync();
      await Promise.all(
        existing
          .filter(notification => typeof notification.identifier === 'string' && notification.identifier.startsWith('prayer_'))
          .map(notification => Notifications.cancelScheduledNotificationAsync(notification.identifier)),
      );

      const prayerNames: Array<keyof PrayerTimes> = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];
      for (const prayerName of prayerNames) {
        const prayerTime = prayerTimes[prayerName];
        if (!prayerTime) continue;

        const [hours, minutes] = prayerTime.split(':').map(Number);
        const triggerDate = new Date(date);
        triggerDate.setHours(hours, minutes, 0, 0);

        if (triggerDate <= new Date()) {
          continue;
        }

        try {
          await Notifications.scheduleNotificationAsync({
            content: {
              title: `🕌 ${prayerName} Prayer Time`,
              body: `It's time for ${prayerName} prayer`,
              sound: settings.notificationSound ? 'default' : false,
            },
            trigger: { type: 'date' as const, date: triggerDate } as Notifications.NotificationTriggerInput,
          });
        } catch (error) {
          console.warn(`Failed to schedule prayer notification for ${prayerName}`, error);
        }
      }
    } catch (error) {
      console.error('Error scheduling prayer notifications', error);
    }
  },

  scheduleWirdReminder: async (reminder: WirdReminder): Promise<string | null> => {
    try {
      if (!reminder.isActive) {
        console.log(`Skipping inactive reminder "${reminder.title}"`);
        return null;
      }

      const hasPermission = await notificationService.requestPermissions();
      if (!hasPermission) {
        console.warn('Notification permissions not granted');
        return null;
      }

      const settings = settingsService.getAllSettings();
      if (!settings.reminderNotifications) {
        console.log('Reminder notifications disabled in settings');
        return null;
      }

      let nextOccurrence: Date | null = null;

      switch (reminder.type) {
        case 'daily':
          nextOccurrence = computeNextDailyOccurrence(reminder.time);
          break;
        case 'weekly':
          nextOccurrence = computeNextWeeklyOccurrence(reminder.dayOfWeek, reminder.time);
          break;
        case 'monthly':
          nextOccurrence = computeNextMonthlyOccurrence(reminder.dayOfMonth, reminder.time);
          break;
        case 'yearly':
          nextOccurrence = computeNextYearlyOccurrence(reminder.month, reminder.dayOfMonth, reminder.time);
          break;
        case 'hourly':
          nextOccurrence = computeNextHourlyOccurrence();
          break;
        case 'prayer':
          return null;
        default:
          nextOccurrence = null;
      }

      if (!nextOccurrence) {
        console.warn(`Could not determine next occurrence for reminder "${reminder.title}"`);
        return null;
      }

      const trigger = buildTrigger(reminder, nextOccurrence);
      if (!trigger) {
        console.warn(`Unable to build trigger for reminder "${reminder.title}"`);
        return null;
      }

      await cancelReminderNotifications(reminder.id);

      console.log('==========================================');
      console.log(`Scheduling reminder "${reminder.title}"`);
      console.log(`Type: ${reminder.type}`);
      console.log(`Next occurrence: ${nextOccurrence.toLocaleString()}`);
      console.log('Trigger:', trigger);
      console.log('==========================================');

      let notificationId: string | null = null;
      try {
        notificationId = await Notifications.scheduleNotificationAsync({
          content: buildNotificationContent(reminder, settings.notificationSound),
          trigger,
        });
        console.log(`✅ Scheduled reminder "${reminder.title}" with ID ${notificationId}`);
      } catch (error) {
        console.error('❌ Error scheduling reminder notification', error);
        return null;
      }

      return notificationId;
    } catch (error) {
      console.error('Error scheduling wird reminder', error);
      return null;
    }
  },

  cancelReminderNotifications,

  rescheduleAllReminders: async (getReminders: () => WirdReminder[]) => {
    try {
      const reminders = getReminders().filter(reminder => reminder.isActive);
      if (reminders.length === 0) {
        console.log('📭 No active reminders to schedule');
        return;
      }

      // Get currently scheduled notifications
      const scheduled = await Notifications.getAllScheduledNotificationsAsync();
      const scheduledReminderIds = new Set(
        scheduled
          .filter(n => isReminderNotification(n.content?.data))
          .map(n => n.content.data.reminderId)
      );

      // Only cancel and reschedule if there are missing or changed reminders
      const activeReminderIds = new Set(reminders.map(r => r.id));
      const needsReschedule = 
        reminders.length !== scheduledReminderIds.size ||
        reminders.some(r => !scheduledReminderIds.has(r.id));

      if (!needsReschedule) {
        console.log('✅ All reminders are already scheduled correctly. Skipping reschedule.');
        return;
      }

      console.log(`🔄 Rescheduling ${reminders.length} reminders...`);
      await cancelAllReminderNotifications();

      const now = new Date();
      let scheduledCount = 0;
      let skippedCount = 0;

      for (const reminder of reminders) {
        // Compute next occurrence
        let nextOccurrence: Date | null = null;
        switch (reminder.type) {
          case 'daily':
            nextOccurrence = computeNextDailyOccurrence(reminder.time);
            break;
          case 'weekly':
            nextOccurrence = computeNextWeeklyOccurrence(reminder.dayOfWeek, reminder.time);
            break;
          case 'monthly':
            nextOccurrence = computeNextMonthlyOccurrence(reminder.dayOfMonth, reminder.time);
            break;
          case 'yearly':
            nextOccurrence = computeNextYearlyOccurrence(reminder.month, reminder.dayOfMonth, reminder.time);
            break;
          case 'hourly':
            nextOccurrence = computeNextHourlyOccurrence();
            break;
        }

        // Skip if next occurrence is in the past or null
        if (!nextOccurrence || nextOccurrence <= now) {
          console.warn(`⚠️ Skipping reminder "${reminder.title}" - next occurrence is in the past or invalid`);
          skippedCount++;
          continue;
        }

        const result = await notificationService.scheduleWirdReminder(reminder);
        if (result) {
          scheduledCount++;
        } else {
          skippedCount++;
        }
      }

      console.log(`✅ Rescheduling complete: ${scheduledCount} scheduled, ${skippedCount} skipped`);
    } catch (error) {
      console.error('❌ Error rescheduling wird reminders', error);
    }
  },

  playAdhan: async (prayerName: string) => {
    try {
      const settings = settingsService.getAllSettings();
      if (!settings.notificationSound) return;
      console.log(`🎶 Playing adhan for ${prayerName}`);
    } catch (error) {
      console.warn('Error playing adhan', error);
    }
  },

  getAdhanReciters: () => [
    { id: 'default', name: 'Default', description: 'Standard adhan' },
    { id: 'mishary', name: 'Mishary Rashid', description: 'Beautiful recitation' },
    { id: 'sudais', name: 'Sheikh Sudais', description: 'Mecca Grand Mosque' },
    { id: 'shuraim', name: 'Sheikh Shuraim', description: 'Mecca Grand Mosque' },
    { id: 'maher', name: 'Maher Al Mueaqly', description: 'Medina Grand Mosque' },
  ],

  testNotification: async (secondsFromNow: number = 5) => {
    try {
      const triggerDate = new Date();
      triggerDate.setSeconds(triggerDate.getSeconds() + secondsFromNow);
      const id = await Notifications.scheduleNotificationAsync({
        content: {
          title: '🧪 Test Notification',
          body: `This is a test notification scheduled for ${secondsFromNow} seconds from now`,
          sound: 'default',
          data: { type: 'test' },
        },
        trigger: { type: 'date' as const, date: triggerDate } as Notifications.NotificationTriggerInput,
      });
      return id;
    } catch (error) {
      console.warn('Failed to schedule test notification', error);
      return null;
    }
  },

  getAllScheduledNotifications: async () => {
    try {
      return await Notifications.getAllScheduledNotificationsAsync();
    } catch (error) {
      console.warn('Failed to fetch scheduled notifications', error);
      return [];
    }
  },

  updateNotificationSettings: (updates: Partial<AppSettings>) => {
    const settings = settingsService.updateSettings(updates);
    return settings;
  },
};

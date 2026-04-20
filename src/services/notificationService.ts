import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { toGregorian, toHijri } from 'hijri-converter';
import {
  AppSettings,
  Location,
  PrayerTimes,
  ReminderNotificationData,
  TimeComponents,
  WirdReminder,
} from '../types';
import { fetchPrayerTimesByDate } from './prayerTimesService';
import { getCurrentLocation, getLastKnownLocation } from './locationService';
import { settingsService } from './settingsService';
import { parseAladhanTimeString } from '../utils/aladhanTime';

/** Salah keys we schedule for prayer-type wird reminders (matches app UI). */
const PRAYER_WIRD_KEYS: (keyof PrayerTimes)[] = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];

/** Max notifications per reminder batch (stay under iOS ~64 global limit). */
const MAX_DAILY_BATCH = 14;
const MAX_WEEKLY_BATCH = 8;
const MAX_MONTHLY_BATCH = 6;
const MAX_YEARLY_BATCH = 3;
const MAX_NOTIFICATIONS_PER_REMINDER = 32;

/** iOS often rejects date triggers in the immediate future; keep a small buffer. */
const MIN_NOTIFICATION_LEAD_MS = 5_000;

/** Android 8+ requires a channel for heads-up / reliable delivery of scheduled notifications. */
const ANDROID_NOTIF_CHANNEL_ID = 'wirdly_default';

const resolveLocationForPrayerNotifications = async (): Promise<Location | null> => {
  const s = settingsService.getAllSettings();
  if (s.locationMethod === 'manual' && s.manualLocation) {
    return {
      latitude: s.manualLocation.latitude,
      longitude: s.manualLocation.longitude,
    };
  }
  let loc = await getLastKnownLocation();
  if (loc) return loc;
  try {
    return await getCurrentLocation();
  } catch {
    return null;
  }
};

const cancelPrayerAlertNotifications = async (): Promise<void> => {
  const existing = await Notifications.getAllScheduledNotificationsAsync();
  await Promise.all(
    existing
      .filter(n => {
        const d = n.content?.data as Record<string, unknown> | undefined;
        return d?.type === 'prayer_alert';
      })
      .map(n => Notifications.cancelScheduledNotificationAsync(n.identifier)),
  );
};

/** Map common typos / casing from storage or older builds onto canonical Aladhan keys. */
const PRAYER_NAME_ALIASES: Record<string, keyof PrayerTimes> = {
  fajr: 'Fajr',
  dhuhr: 'Dhuhr',
  zuhr: 'Dhuhr',
  zohr: 'Dhuhr',
  asr: 'Asr',
  maghrib: 'Maghrib',
  isha: 'Isha',
};

const normalizePrayerKey = (key: string): keyof PrayerTimes | null => {
  const t = String(key).trim();
  if ((PRAYER_WIRD_KEYS as readonly string[]).includes(t)) return t as keyof PrayerTimes;
  const alias = PRAYER_NAME_ALIASES[t.toLowerCase()];
  return alias ?? null;
};

const getPrayerKeysForReminder = (reminder: WirdReminder): (keyof PrayerTimes)[] => {
  const raw: string[] = (
    reminder.prayerTimes && reminder.prayerTimes.length > 0
      ? (reminder.prayerTimes as unknown as string[])
      : reminder.prayerTime
        ? [String(reminder.prayerTime)]
        : []
  );
  const seen = new Set<string>();
  const out: (keyof PrayerTimes)[] = [];
  for (const k of raw) {
    const norm = normalizePrayerKey(k);
    if (norm && !seen.has(norm)) {
      seen.add(norm);
      out.push(norm);
    }
  }
  if (raw.length > 0 && out.length === 0) {
    console.warn(
      `Prayer reminder "${reminder.title}" (${reminder.category}) had prayer keys none of which matched Fajr/Dhuhr/Asr/Maghrib/Isha — raw:`,
      raw,
    );
  }
  return out;
};

const DEFAULT_TIME: TimeComponents = { hours: 9, minutes: 0 };

const MAX_NOTIF_TITLE_LEN = 180;
const MAX_NOTIF_BODY_LEN = 380;
const MAX_NOTIF_DATA_STRING_LEN = 400;

/** Strip NULs and cap length so Android/iOS notification payloads stay valid. */
const sanitizeNotifText = (value: unknown, maxLen: number): string => {
  if (value === undefined || value === null) return '';
  const s = String(value).replace(/\u0000/g, '');
  return s.length <= maxLen ? s : s.slice(0, maxLen);
};

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

/** Compute next occurrence for yearly Hijri reminder (e.g. Ramadan 15) */
const computeNextHijriYearlyOccurrence = (hijriMonth: number, hijriDay: number, time?: string): Date | null => {
  if (!hijriMonth || !hijriDay) return null;
  const { hours, minutes } = parseTimeToComponents(time);
  const now = new Date();
  const { hy: currentHijriYear } = toHijri(now.getFullYear(), now.getMonth() + 1, now.getDate());

  // Try this Hijri year first
  try {
    const greg = toGregorian(currentHijriYear, hijriMonth, Math.min(hijriDay, 30));
    const next = new Date(greg.gy, greg.gm - 1, greg.gd, hours, minutes, 0, 0);
    if (next > now) return next;
  } catch {
    // Invalid date, try next year
  }

  // Try next Hijri year
  try {
    const greg = toGregorian(currentHijriYear + 1, hijriMonth, Math.min(hijriDay, 30));
    return new Date(greg.gy, greg.gm - 1, greg.gd, hours, minutes, 0, 0);
  } catch {
    return null;
  }
};

/** Next N clock-hour starts (:00) strictly after `minTimeMs` (for Android / fallback). */
const computeTopOfHourOccurrences = (count: number, minTimeMs: number): Date[] => {
  const now = new Date();
  let slot = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours(), 0, 0, 0);
  while (slot.getTime() <= minTimeMs) {
    slot.setHours(slot.getHours() + 1);
  }
  const results: Date[] = [];
  for (let i = 0; i < count; i++) {
    results.push(new Date(slot));
    slot.setHours(slot.getHours() + 1);
  }
  return results;
};

const computeDailyBatchOccurrences = (reminder: WirdReminder): Date[] => {
  const now = new Date();
  const { hours, minutes } = parseTimeToComponents(reminder.time);
  const results: Date[] = [];

  if (reminder.daysOfWeek && reminder.daysOfWeek.length > 0) {
    const allowed = new Set(reminder.daysOfWeek);
    for (let offset = 0; offset < 120 && results.length < MAX_DAILY_BATCH; offset++) {
      const candidate = new Date(now);
      candidate.setDate(now.getDate() + offset);
      if (!allowed.has(candidate.getDay())) continue;
      candidate.setHours(hours, minutes, 0, 0);
      if (candidate > now) {
        results.push(candidate);
      }
    }
    return results;
  }

  const first = computeNextDailyOccurrence(reminder.time);
  for (let i = 0; i < MAX_DAILY_BATCH; i++) {
    const d = new Date(first);
    d.setDate(first.getDate() + i);
    d.setHours(hours, minutes, 0, 0);
    if (d > now) {
      results.push(d);
    }
  }
  return results;
};

const computeWeeklyBatchOccurrences = (reminder: WirdReminder): Date[] => {
  const first = computeNextWeeklyOccurrence(reminder.dayOfWeek, reminder.time);
  if (!first) return [];
  const now = new Date();
  const { hours, minutes } = parseTimeToComponents(reminder.time);
  const results: Date[] = [];
  for (let i = 0; i < MAX_WEEKLY_BATCH; i++) {
    const d = new Date(first);
    d.setDate(first.getDate() + i * 7);
    d.setHours(hours, minutes, 0, 0);
    if (d > now) {
      results.push(d);
    }
  }
  return results;
};

const computeMonthlyBatchOccurrences = (reminder: WirdReminder): Date[] => {
  const now = new Date();
  const { hours, minutes } = parseTimeToComponents(reminder.time);
  const results: Date[] = [];

  if (reminder.daysOfMonth && reminder.daysOfMonth.length > 0) {
    if (reminder.isHijriMonthly) {
      for (let offset = 0; offset < 400 && results.length < MAX_MONTHLY_BATCH; offset++) {
        const candidate = new Date(now);
        candidate.setDate(now.getDate() + offset);
        candidate.setHours(hours, minutes, 0, 0);
        if (candidate <= now) continue;
        try {
          const { hd } = toHijri(candidate.getFullYear(), candidate.getMonth() + 1, candidate.getDate());
          if (reminder.daysOfMonth.includes(hd)) {
            results.push(candidate);
          }
        } catch {
          /* skip invalid */
        }
      }
      return results;
    }
    for (let offset = 0; offset < 120 && results.length < MAX_MONTHLY_BATCH; offset++) {
      const candidate = new Date(now);
      candidate.setDate(now.getDate() + offset);
      candidate.setHours(hours, minutes, 0, 0);
      if (candidate <= now) continue;
      if (reminder.daysOfMonth.includes(candidate.getDate())) {
        results.push(candidate);
      }
    }
    return results;
  }

  if (!reminder.dayOfMonth) return [];
  let next: Date | null = computeNextMonthlyOccurrence(reminder.dayOfMonth, reminder.time);
  for (let i = 0; i < MAX_MONTHLY_BATCH && next; i++) {
    if (next > now) {
      results.push(new Date(next));
    }
    const n = new Date(next);
    n.setMonth(n.getMonth() + 1);
    const dim = new Date(n.getFullYear(), n.getMonth() + 1, 0).getDate();
    n.setDate(Math.min(reminder.dayOfMonth, dim));
    n.setHours(hours, minutes, 0, 0);
    next = n;
  }
  return results;
};

const computeYearlyBatchOccurrences = (reminder: WirdReminder): Date[] => {
  const now = new Date();
  const results: Date[] = [];

  if (reminder.isHijriYearly) {
    let next: Date | null = computeNextHijriYearlyOccurrence(
      reminder.month!,
      reminder.dayOfMonth!,
      reminder.time,
    );
    for (let i = 0; i < MAX_YEARLY_BATCH && next; i++) {
      if (next > now) {
        results.push(new Date(next));
      }
      const { hy } = toHijri(next.getFullYear(), next.getMonth() + 1, next.getDate());
      try {
        const g = toGregorian(hy + 1, reminder.month!, Math.min(reminder.dayOfMonth!, 30));
        next = new Date(
          g.gy,
          g.gm - 1,
          g.gd,
          parseTimeToComponents(reminder.time).hours,
          parseTimeToComponents(reminder.time).minutes,
          0,
          0,
        );
      } catch {
        break;
      }
    }
    return results;
  }

  let next: Date | null = computeNextYearlyOccurrence(reminder.month, reminder.dayOfMonth, reminder.time);
  for (let i = 0; i < MAX_YEARLY_BATCH && next; i++) {
    if (next > now) {
      results.push(new Date(next));
    }
    const n = new Date(next);
    n.setFullYear(n.getFullYear() + 1);
    next = n;
  }
  return results;
};

const buildReminderNotificationData = (reminder: WirdReminder): ReminderNotificationData => {
  const data: ReminderNotificationData = {
    type: 'wird_reminder',
    reminderId: reminder.id,
    reminderTitle: sanitizeNotifText(reminder.title, MAX_NOTIF_DATA_STRING_LEN) || 'Wird reminder',
    reminderCategory: reminder.category,
  };
  const desc = reminder.description ? sanitizeNotifText(reminder.description, MAX_NOTIF_DATA_STRING_LEN) : '';
  if (desc) data.reminderDescription = desc;
  if (reminder.imageUrl) data.reminderImageUrl = sanitizeNotifText(reminder.imageUrl, MAX_NOTIF_DATA_STRING_LEN);
  if (reminder.fileUrl) data.reminderFileUrl = sanitizeNotifText(reminder.fileUrl, MAX_NOTIF_DATA_STRING_LEN);
  if (reminder.linkUrl) data.reminderLinkUrl = sanitizeNotifText(reminder.linkUrl, MAX_NOTIF_DATA_STRING_LEN);
  return data;
};

const buildNotificationContent = (
  reminder: WirdReminder,
  enableSound: boolean | undefined,
): Notifications.NotificationContentInput => {
  const titleCore = sanitizeNotifText(reminder.title, MAX_NOTIF_TITLE_LEN) || 'Wird reminder';
  const bodyText =
    sanitizeNotifText(reminder.description, MAX_NOTIF_BODY_LEN) || 'Time for your wird reminder';
  const base: Notifications.NotificationContentInput = {
    title: `📿 ${titleCore}`,
    body: bodyText,
    sound: enableSound ? 'default' : false,
    data: buildReminderNotificationData(reminder) as unknown as Record<string, unknown>,
  };
  if (Platform.OS === 'android') {
    return {
      ...base,
      android: { channelId: ANDROID_NOTIF_CHANNEL_ID },
    } as Notifications.NotificationContentInput;
  }
  return base;
};

const schedulePrayerWirdNotifications = async (
  reminder: WirdReminder,
  enableSound: boolean | undefined,
): Promise<string | null> => {
  const keys = getPrayerKeysForReminder(reminder);
  if (keys.length === 0) {
    console.warn(`No prayer times selected for reminder "${reminder.title}"`);
    return null;
  }

  let location: Location | null = await getLastKnownLocation();
  if (!location) {
    try {
      location = await getCurrentLocation();
    } catch {
      console.warn('No location available for prayer reminder scheduling');
      return null;
    }
  }

  const now = new Date();
  const minTime = Date.now() + MIN_NOTIFICATION_LEAD_MS;
  const triggers: Date[] = [];
  const maxDays = 14;
  const maxOccurrences = 12;

  for (let dayOffset = 0; dayOffset < maxDays && triggers.length < maxOccurrences * 3; dayOffset++) {
    const dayDate = new Date(now);
    dayDate.setDate(now.getDate() + dayOffset);
    dayDate.setHours(12, 0, 0, 0);

    try {
      if (dayOffset > 0) {
        await new Promise<void>(resolve => setTimeout(resolve, 350));
      }
      const response = await fetchPrayerTimesByDate(dayDate, location);
      const timings = response.data.timings;

      for (const key of keys) {
        const timeStr = timings[key];
        if (!timeStr) continue;
        const parsed = parseAladhanTimeString(timeStr);
        if (!parsed) continue;
        const trigger = new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate() + dayOffset,
          parsed.hours,
          parsed.minutes,
          0,
          0,
        );
        if (trigger.getTime() > minTime) {
          triggers.push(trigger);
        }
      }
    } catch (e) {
      console.warn(`Prayer times fetch failed for scheduling (day ${dayOffset}):`, e);
    }
  }

  triggers.sort((a, b) => a.getTime() - b.getTime());
  const seen = new Set<number>();
  const uniqueSorted: Date[] = [];
  for (const t of triggers) {
    const k = t.getTime();
    if (!seen.has(k)) {
      seen.add(k);
      uniqueSorted.push(t);
    }
  }
  const toSchedule = uniqueSorted
    .filter(d => d.getTime() >= minTime)
    .slice(0, maxOccurrences);

  let scheduledCount = 0;
  for (const date of toSchedule) {
    try {
      await Notifications.scheduleNotificationAsync({
        content: buildNotificationContent(reminder, enableSound),
        trigger: { type: 'date', date } as Notifications.NotificationTriggerInput,
      });
      scheduledCount++;
    } catch (err) {
      console.warn('Failed to schedule prayer wird notification', err);
    }
  }

  console.log(`✅ Scheduled ${scheduledCount} prayer notifications for "${reminder.title}"`);
  return scheduledCount > 0 ? 'prayer_batch' : null;
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

const scheduleBatchAtDates = async (
  reminder: WirdReminder,
  dates: Date[],
  enableSound: boolean | undefined,
): Promise<string | null> => {
  await cancelReminderNotifications(reminder.id);
  const minTime = Date.now() + MIN_NOTIFICATION_LEAD_MS;
  const sorted = [...dates]
    .filter(d => d.getTime() >= minTime)
    .sort((a, b) => a.getTime() - b.getTime());
  const capped = sorted.slice(0, MAX_NOTIFICATIONS_PER_REMINDER);
  let scheduledCount = 0;
  for (const date of capped) {
    try {
      await Notifications.scheduleNotificationAsync({
        content: buildNotificationContent(reminder, enableSound),
        trigger: { type: 'date', date } as Notifications.NotificationTriggerInput,
      });
      scheduledCount++;
    } catch (err) {
      console.warn('Failed to schedule batch notification', err);
    }
  }
  console.log(`✅ Scheduled ${scheduledCount} batch notifications for "${reminder.title}" (${reminder.type})`);
  return scheduledCount > 0 ? 'batch' : null;
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

  /** Android 8+: required for scheduled local notifications to show reliably. */
  ensureAndroidNotificationChannel: async (): Promise<void> => {
    if (Platform.OS !== 'android') return;
    try {
      await Notifications.setNotificationChannelAsync(ANDROID_NOTIF_CHANNEL_ID, {
        name: 'Wirdly',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
      });
    } catch (e) {
      console.warn('ensureAndroidNotificationChannel failed', e);
    }
  },

  /**
   * Schedule salah alerts for one or more calendar days (today + tomorrow recommended).
   * Respects `prayerNotificationTime` (minutes before adhan) and tags notifications with
   * `data.type === 'prayer_alert'` so they can be cancelled reliably.
   */
  schedulePrayerNotifications: async (
    blocks: Array<{ anchorDate: Date; timings: PrayerTimes }>,
  ): Promise<void> => {
    try {
      const settings = settingsService.getAllSettings();
      if (!settings.prayerNotifications) return;

      const hasPermission = await notificationService.requestPermissions();
      if (!hasPermission) return;

      await cancelPrayerAlertNotifications();

      const leadMinutes = Math.max(0, Math.min(120, Number(settings.prayerNotificationTime) || 5));
      const prayerNames: Array<keyof PrayerTimes> = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];
      const minTime = Date.now() + MIN_NOTIFICATION_LEAD_MS;

      for (const { anchorDate, timings } of blocks) {
        for (const prayerName of prayerNames) {
          const prayerTime = timings[prayerName];
          if (!prayerTime) continue;

          const parsed = parseAladhanTimeString(prayerTime);
          if (!parsed) continue;

          const atPrayer = new Date(anchorDate);
          atPrayer.setHours(parsed.hours, parsed.minutes, 0, 0);

          const alertDate = new Date(atPrayer.getTime() - leadMinutes * 60 * 1000);

          if (alertDate.getTime() <= minTime) continue;

          try {
            const prayerContent = {
              title:
                leadMinutes > 0
                  ? `🕌 ${prayerName} in ${leadMinutes} min`
                  : `🕌 ${prayerName} prayer`,
              body:
                leadMinutes > 0
                  ? `${prayerName} is at ${prayerTime.trim().split(/\s+/)[0]}`
                  : `It's time for ${prayerName}`,
              sound: settings.notificationSound ? 'default' : false,
              data: { type: 'prayer_alert', prayer: prayerName },
              ...(Platform.OS === 'android'
                ? { android: { channelId: ANDROID_NOTIF_CHANNEL_ID } }
                : {}),
            } as Notifications.NotificationContentInput;
            await Notifications.scheduleNotificationAsync({
              content: prayerContent,
              trigger: { type: 'date' as const, date: alertDate } as Notifications.NotificationTriggerInput,
            });
          } catch (error) {
            console.warn(`Failed to schedule prayer notification for ${prayerName}`, error);
          }
        }
      }
    } catch (error) {
      console.error('Error scheduling prayer notifications', error);
    }
  },

  /** Re-fetch prayer times and re-schedule salah alerts (e.g. after changing settings). */
  refreshPrayerTimeNotificationsFromSettings: async (): Promise<void> => {
    const settings = settingsService.getAllSettings();
    await cancelPrayerAlertNotifications();
    if (!settings.prayerNotifications) return;

    const location = await resolveLocationForPrayerNotifications();
    if (!location) {
      console.warn('Prayer notifications: no location available');
      return;
    }

    const hasPermission = await notificationService.requestPermissions();
    if (!hasPermission) return;

    try {
      const todayResp = await fetchPrayerTimesByDate(new Date(), location);
      await new Promise<void>(r => setTimeout(r, 400));
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const tomorrowResp = await fetchPrayerTimesByDate(tomorrow, location);
      await notificationService.schedulePrayerNotifications([
        { anchorDate: new Date(), timings: todayResp.data.timings },
        { anchorDate: tomorrow, timings: tomorrowResp.data.timings },
      ]);
    } catch (e) {
      console.warn('refreshPrayerTimeNotificationsFromSettings failed', e);
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

      switch (reminder.type) {
        case 'daily': {
          const dates = computeDailyBatchOccurrences(reminder);
          return scheduleBatchAtDates(reminder, dates, settings.notificationSound);
        }
        case 'weekly': {
          const dates = computeWeeklyBatchOccurrences(reminder);
          return scheduleBatchAtDates(reminder, dates, settings.notificationSound);
        }
        case 'monthly': {
          const dates = computeMonthlyBatchOccurrences(reminder);
          return scheduleBatchAtDates(reminder, dates, settings.notificationSound);
        }
        case 'yearly': {
          const dates = computeYearlyBatchOccurrences(reminder);
          return scheduleBatchAtDates(reminder, dates, settings.notificationSound);
        }
        case 'hourly': {
          await cancelReminderNotifications(reminder.id);
          const minTime = Date.now() + MIN_NOTIFICATION_LEAD_MS;

          // iOS: one repeating calendar trigger at minute 0 every hour (saves notification slots
          // and matches "on the hour" without relying on dozens of date triggers).
          if (Platform.OS === 'ios') {
            try {
              await Notifications.scheduleNotificationAsync({
                content: buildNotificationContent(reminder, settings.notificationSound),
                trigger: {
                  type: Notifications.SchedulableTriggerInputTypes.CALENDAR,
                  repeats: true,
                  minute: 0,
                  second: 0,
                } as Notifications.NotificationTriggerInput,
              });
              console.log(`✅ Scheduled hourly (calendar, top of hour) for "${reminder.title}"`);
              return 'hourly_calendar';
            } catch (err) {
              console.warn('Hourly calendar trigger failed, falling back to date batch', err);
            }
          }

          const hourlyDates = computeTopOfHourOccurrences(48, minTime);
          let scheduledCount = 0;
          for (const occ of hourlyDates) {
            if (occ.getTime() < minTime) continue;
            try {
              await Notifications.scheduleNotificationAsync({
                content: buildNotificationContent(reminder, settings.notificationSound),
                trigger: { type: 'date', date: occ } as Notifications.NotificationTriggerInput,
              });
              scheduledCount++;
            } catch (err) {
              console.warn('Failed to schedule hourly notification', err);
            }
          }
          console.log(`✅ Scheduled ${scheduledCount} hourly notifications for "${reminder.title}"`);
          return scheduledCount > 0 ? 'hourly_batch' : null;
        }
        case 'prayer': {
          await cancelReminderNotifications(reminder.id);
          return schedulePrayerWirdNotifications(reminder, settings.notificationSound);
        }
        default:
          console.warn(`Unknown reminder type for scheduling: ${reminder.type}`);
          return null;
      }
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

      // Always run a full reschedule. A previous optimization skipped when every active
      // reminder id appeared in *some* scheduled notification — but batched types (prayer,
      // hourly, daily, etc.) must be refreshed as times fire or location changes, and that
      // check caused prayer wird reminders to never reschedule after a failed first attempt.
      console.log(`🔄 Rescheduling ${reminders.length} reminders...`);
      await cancelAllReminderNotifications();

      let scheduledCount = 0;
      let skippedCount = 0;

      for (const reminder of reminders) {
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
      const testContent = {
        title: '🧪 Test Notification',
        body: `This is a test notification scheduled for ${secondsFromNow} seconds from now`,
        sound: 'default',
        data: { type: 'test' },
        ...(Platform.OS === 'android'
          ? { android: { channelId: ANDROID_NOTIF_CHANNEL_ID } }
          : {}),
      } as Notifications.NotificationContentInput;
      const id = await Notifications.scheduleNotificationAsync({
        content: testContent,
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

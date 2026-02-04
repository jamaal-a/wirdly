import { WirdReminder, PrayerTimes, TimeComponents } from '../types';
import { notificationService } from './notificationService';
import AsyncStorage from '@react-native-async-storage/async-storage';

const REMINDERS_STORAGE_KEY = '@wirdly_reminders';

// In-memory storage for reminders (also persisted to AsyncStorage)
let reminders: WirdReminder[] = [];
let isInitialized = false;

// Helper function to convert reminders to/from storage format (Date objects need special handling)
const serializeReminders = (reminders: WirdReminder[]): string => {
  return JSON.stringify(reminders.map(reminder => ({
    ...reminder,
    createdAt: reminder.createdAt instanceof Date ? reminder.createdAt.toISOString() : reminder.createdAt,
    lastTriggered: reminder.lastTriggered instanceof Date ? reminder.lastTriggered.toISOString() : reminder.lastTriggered,
    nextTrigger: reminder.nextTrigger instanceof Date ? reminder.nextTrigger.toISOString() : reminder.nextTrigger,
  })));
};

const deserializeReminders = (data: string): WirdReminder[] => {
  try {
    const parsed = JSON.parse(data);
    return parsed.map((reminder: any) => ({
      ...reminder,
      createdAt: reminder.createdAt ? new Date(reminder.createdAt) : new Date(),
      lastTriggered: reminder.lastTriggered ? new Date(reminder.lastTriggered) : undefined,
      nextTrigger: reminder.nextTrigger ? new Date(reminder.nextTrigger) : undefined,
    }));
  } catch (error) {
    console.error('Error deserializing reminders:', error);
    return [];
  }
};

// Load reminders from AsyncStorage
const loadRemindersFromStorage = async (): Promise<WirdReminder[]> => {
  try {
    const data = await AsyncStorage.getItem(REMINDERS_STORAGE_KEY);
    if (data) {
      return deserializeReminders(data);
    }
  } catch (error) {
    console.error('Error loading reminders from storage:', error);
  }
  return [];
};

// Save reminders to AsyncStorage
const saveRemindersToStorage = async (remindersToSave: WirdReminder[]): Promise<void> => {
  try {
    const serialized = serializeReminders(remindersToSave);
    await AsyncStorage.setItem(REMINDERS_STORAGE_KEY, serialized);
  } catch (error) {
    console.error('Error saving reminders to storage:', error);
  }
};

// Initialize reminders from storage (call this on app start)
const initializeReminders = async (): Promise<void> => {
  if (isInitialized) return;
  
  try {
    reminders = await loadRemindersFromStorage();
    isInitialized = true;
    console.log(`📝 Loaded ${reminders.length} reminders from storage`);
  } catch (error) {
    console.error('Error initializing reminders:', error);
    reminders = [];
    isInitialized = true;
  }
};

export const reminderService = {
  // Initialize reminders from storage (call this on app start)
  initialize: initializeReminders,

  // Create a new reminder
  createReminder: (reminder: {
    title: string;
    description?: string;
    category: WirdReminder['category'];
    type: WirdReminder['type'];
    prayerTime?: keyof PrayerTimes;
    time?: string;
    dayOfWeek?: number;
    dayOfMonth?: number;
    month?: number;
    isActive: boolean;
  }): WirdReminder => {
    // Generate unique ID using timestamp + random number to avoid duplicates
    const uniqueId = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const newReminder: WirdReminder = {
      ...reminder,
      id: uniqueId,
      createdAt: new Date(),
      nextTrigger: calculateNextTrigger({ ...reminder, id: uniqueId, createdAt: new Date() } as WirdReminder),
    };
    
    reminders.push(newReminder);
    
    // Save to storage
    saveRemindersToStorage(reminders).catch(err => console.error('Error saving reminder:', err));
    
    // Schedule notification immediately for background support
    if (newReminder.isActive) {
      notificationService.scheduleWirdReminder(newReminder).catch(err => 
        console.error('Error scheduling notification for new reminder:', err)
      );
    }
    
    console.log('📝 Reminder created:', {
      id: newReminder.id,
      title: newReminder.title,
      type: newReminder.type,
      time: newReminder.time,
      isActive: newReminder.isActive,
    });
    
    return newReminder;
  },

  // Get all reminders
  getAllReminders: (): WirdReminder[] => {
    return [...reminders];
  },

  // Get active reminders
  getActiveReminders: (): WirdReminder[] => {
    return reminders.filter(reminder => reminder.isActive);
  },

  // Get reminders by type
  getRemindersByType: (type: WirdReminder['type']): WirdReminder[] => {
    return reminders.filter(reminder => reminder.type === type);
  },

  // Get prayer-based reminders
  getPrayerReminders: (): WirdReminder[] => {
    return reminders.filter(reminder => reminder.type === 'prayer' && reminder.isActive);
  },

  // Update a reminder
  updateReminder: (
    id: string,
    updates: Partial<WirdReminder>,
    options: { skipReschedule?: boolean } = {},
  ): WirdReminder | null => {
    const index = reminders.findIndex(reminder => reminder.id === id);
    if (index === -1) return null;
    
    const updatedReminder = { ...reminders[index], ...updates };
    const shouldRecalculateTrigger = Boolean(
      updates.type !== undefined ||
      updates.dayOfWeek !== undefined ||
      updates.dayOfMonth !== undefined ||
      updates.month !== undefined ||
      updates.time !== undefined
    );

    if (shouldRecalculateTrigger) {
      updatedReminder.nextTrigger = calculateNextTrigger(updatedReminder);
    }
    
    reminders[index] = updatedReminder;
    
    // Save to storage
    saveRemindersToStorage(reminders).catch(err => console.error('Error saving reminder update:', err));
    
    const shouldReschedule =
      !options.skipReschedule &&
      updatedReminder.isActive &&
      (
        shouldRecalculateTrigger ||
        updates.isActive !== undefined
      );

    if (shouldReschedule) {
      notificationService.scheduleWirdReminder(updatedReminder).catch(err =>
        console.error('Error rescheduling notification for updated reminder:', err)
      );
    } else if (updates.isActive === false) {
      notificationService.cancelReminderNotifications(updatedReminder.id).catch(err =>
        console.error('Error cancelling notification for updated reminder:', err)
      );
    }
    
    console.log('📝 Reminder updated');
    
    return updatedReminder;
  },

  // Delete a reminder
  deleteReminder: (id: string): boolean => {
    const index = reminders.findIndex(reminder => reminder.id === id);
    if (index === -1) return false;
    
    // Note: Background checker handles notifications, no need to cancel here
    console.log('📝 Reminder deleted, will no longer trigger');
    notificationService.cancelReminderNotifications(id).catch(err =>
      console.error('Error cancelling notifications for deleted reminder:', err)
    );
    
    reminders.splice(index, 1);
    
    // Save to storage
    saveRemindersToStorage(reminders).catch(err => console.error('Error saving reminder deletion:', err));
    
    return true;
  },

  // Toggle reminder active status
  toggleReminder: (id: string): WirdReminder | null => {
    const reminder = reminders.find(r => r.id === id);
    if (!reminder) return null;
    
    return reminderService.updateReminder(id, { isActive: !reminder.isActive });
  },

  // Mark reminder as triggered
  markTriggered: (id: string): WirdReminder | null => {
    const reminder = reminders.find(r => r.id === id);
    if (!reminder) return null;
    
    const updatedReminder: WirdReminder = {
      ...reminder,
      lastTriggered: new Date(),
      nextTrigger: calculateNextTrigger(reminder),
    };
    
    return reminderService.updateReminder(id, updatedReminder, { skipReschedule: true });
  },

  // Get reminders that should trigger now
  getDueReminders: (currentTime: Date, prayerTimes?: PrayerTimes): WirdReminder[] => {
    return reminders.filter(reminder => {
      if (!reminder.isActive) return false;
      
      switch (reminder.type) {
        case 'prayer':
          return prayerTimes && isPrayerTimeDue(reminder.prayerTime!, prayerTimes, currentTime);
        case 'daily':
          return isDailyReminderDue(reminder.time!, currentTime);
        case 'weekly':
          return isWeeklyReminderDue(reminder.dayOfWeek!, currentTime);
        case 'monthly':
          return isMonthlyReminderDue(reminder.dayOfMonth!, currentTime);
        case 'yearly':
          return isYearlyReminderDue(reminder.month!, reminder.dayOfMonth!, currentTime);
        case 'hourly':
          return isHourlyReminderDue(currentTime);
        default:
          return false;
      }
    });
  },
};

// Helper functions to calculate next trigger times
function calculateNextTrigger(reminder: WirdReminder): Date | undefined {
  const now = new Date();
  
  switch (reminder.type) {
    case 'prayer':
      // Prayer reminders will be calculated dynamically based on prayer times
      return undefined;
    case 'daily':
      return calculateNextDailyTrigger(reminder.time, now);
    case 'weekly':
      if (reminder.dayOfWeek === undefined) return undefined;
      return calculateNextWeeklyTrigger(reminder.dayOfWeek, reminder.time, now);
    case 'monthly':
      if (!reminder.dayOfMonth) return undefined;
      return calculateNextMonthlyTrigger(reminder.dayOfMonth, reminder.time, now);
    case 'yearly':
      if (!reminder.month || !reminder.dayOfMonth) return undefined;
      return calculateNextYearlyTrigger(reminder.month, reminder.dayOfMonth, reminder.time, now);
    case 'hourly':
      return calculateNextHourlyTrigger(now);
    default:
      return undefined;
  }
}

// Parse time string that can be in 12-hour (HH:MM AM/PM) or 24-hour (HH:MM) format
function parseTimeString(time?: string): TimeComponents {
  if (!time) {
    return { hours: 9, minutes: 0 };
  }

  const trimmed = time.trim();
  if (!trimmed) {
    return { hours: 9, minutes: 0 };
  }

  const upper = trimmed.toUpperCase();
  const hasMeridiem = upper.includes('AM') || upper.includes('PM');

  if (hasMeridiem) {
    const cleaned = upper.replace(/\s*(AM|PM)\s*/g, '');
    const [hourStr = '', minuteStr = ''] = cleaned.split(':');
    const hour12 = Math.max(1, Math.min(12, parseInt(hourStr, 10) || 9));
    const minutes = Math.max(0, Math.min(59, parseInt(minuteStr, 10) || 0));

    let hours24 = hour12 % 12;
    if (upper.includes('PM')) {
      hours24 += 12;
    }
    if (upper.includes('AM') && hour12 === 12) {
      hours24 = 0;
    }

    return { hours: hours24, minutes };
  }

  const [hourStr = '', minuteStr = ''] = upper.split(':');
  const hours = Math.max(0, Math.min(23, parseInt(hourStr, 10) ?? 9));
  const minutes = Math.max(0, Math.min(59, parseInt(minuteStr, 10) ?? 0));
  return { hours, minutes };
}

function calculateNextDailyTrigger(time: string | undefined, from: Date): Date {
  const { hours, minutes } = parseTimeString(time);
  const next = new Date(from);
  next.setHours(hours, minutes, 0, 0);
  
  if (next <= from) {
    next.setDate(next.getDate() + 1);
  }
  
  return next;
}

function calculateNextWeeklyTrigger(dayOfWeek: number, time: string | undefined, from: Date): Date {
  const next = new Date(from);
  const currentDay = from.getDay();
  const daysUntilNext = (dayOfWeek - currentDay + 7) % 7;
  
  next.setDate(from.getDate() + daysUntilNext);
  const { hours, minutes } = parseTimeString(time);
  next.setHours(hours, minutes, 0, 0);
  
  if (daysUntilNext === 0 && next <= from) {
    next.setDate(next.getDate() + 7);
  }
  
  return next;
}

function calculateNextMonthlyTrigger(dayOfMonth: number, time: string | undefined, from: Date): Date {
  const next = new Date(from);
  const daysInMonth = new Date(from.getFullYear(), from.getMonth() + 1, 0).getDate();
  const targetDay = Math.max(1, Math.min(dayOfMonth, daysInMonth));
  next.setDate(targetDay);
  const { hours, minutes } = parseTimeString(time);
  next.setHours(hours, minutes, 0, 0);
  
  if (next <= from) {
    next.setMonth(next.getMonth() + 1);
    const nextMonthDays = new Date(next.getFullYear(), next.getMonth() + 1, 0).getDate();
    next.setDate(Math.max(1, Math.min(dayOfMonth, nextMonthDays)));
  }
  
  return next;
}

function calculateNextYearlyTrigger(month: number, dayOfMonth: number, time: string | undefined, from: Date): Date {
  const next = new Date(from);
  next.setMonth(month - 1); // Month is 0-indexed
  const daysInMonth = new Date(next.getFullYear(), month, 0).getDate();
  const targetDay = Math.max(1, Math.min(dayOfMonth, daysInMonth));
  next.setDate(targetDay);
  const { hours, minutes } = parseTimeString(time);
  next.setHours(hours, minutes, 0, 0);
  
  if (next <= from) {
    next.setFullYear(next.getFullYear() + 1);
    const nextYearDays = new Date(next.getFullYear(), month, 0).getDate();
    next.setDate(Math.max(1, Math.min(dayOfMonth, nextYearDays)));
  }
  
  return next;
}

// Helper functions to check if reminders are due
function isPrayerTimeDue(prayerTime: keyof PrayerTimes, prayerTimes: PrayerTimes, currentTime: Date): boolean {
  const prayerTimeStr = prayerTimes[prayerTime];
  if (!prayerTimeStr) return false;
  
  const [hours, minutes] = prayerTimeStr.split(':').map(Number);
  const prayerDate = new Date();
  prayerDate.setHours(hours, minutes, 0, 0);
  
  const timeDiff = Math.abs(currentTime.getTime() - prayerDate.getTime());
  return timeDiff <= 5 * 60 * 1000; // Within 5 minutes
}

function isDailyReminderDue(time: string, currentTime: Date): boolean {
  const { hours, minutes } = parseTimeString(time);
  const reminderTime = new Date();
  reminderTime.setHours(hours, minutes, 0, 0);
  
  const timeDiff = Math.abs(currentTime.getTime() - reminderTime.getTime());
  return timeDiff <= 5 * 60 * 1000; // Within 5 minutes
}

function isWeeklyReminderDue(dayOfWeek: number, currentTime: Date): boolean {
  return currentTime.getDay() === dayOfWeek;
}

function isMonthlyReminderDue(dayOfMonth: number, currentTime: Date): boolean {
  return currentTime.getDate() === dayOfMonth;
}

function isYearlyReminderDue(month: number, dayOfMonth: number, currentTime: Date): boolean {
  return currentTime.getMonth() === month - 1 && currentTime.getDate() === dayOfMonth;
}

function calculateNextHourlyTrigger(from: Date): Date {
  const next = new Date(from);
  next.setHours(next.getHours() + 1);
  next.setMinutes(0, 0, 0); // Set to top of the hour
  return next;
}

function isHourlyReminderDue(currentTime: Date): boolean {
  // Check if it's the top of the hour (minutes = 0)
  return currentTime.getMinutes() === 0;
} 
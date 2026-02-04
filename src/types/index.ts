export interface PrayerTimes {
  Fajr: string;
  Sunrise: string;
  Dhuhr: string;
  Asr: string;
  Sunset: string;
  Maghrib: string;
  Isha: string;
  Imsak: string;
  Midnight: string;
  Firstthird: string;
  Lastthird: string;
}

export interface Location {
  latitude: number;
  longitude: number;
}

export interface IslamicDate {
  date: string;
  day: string;
  month: {
    number: number;
    en: string;
    ar: string;
  };
  year: string;
  weekday: {
    en: string;
    ar: string;
  };
}

export interface WirdReminder {
  id: string;
  title: string;
  description?: string;
  category: 'quran' | 'dhikr' | 'dua' | 'other';
  type: 'prayer' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'hourly';
  prayerTime?: keyof PrayerTimes; // Only for prayer-based reminders
  time?: string; // For daily reminders
  dayOfWeek?: number; // 0-6 for weekly (Sunday = 0)
  dayOfMonth?: number; // 1-31 for monthly
  month?: number; // 1-12 for yearly
  isActive: boolean;
  createdAt: Date;
  lastTriggered?: Date;
  nextTrigger?: Date;
  imageUrl?: string; // URL to image
  fileUrl?: string; // URL to file
  linkUrl?: string; // URL to external link
  completedDates?: string[]; // Array of dates when completed
  streakCount?: number; // Current streak count
  totalCompletions?: number; // Total times completed
}

export interface TimeComponents {
  hours: number;
  minutes: number;
}

export interface ReminderNotificationData {
  type: 'wird_reminder';
  reminderId: string;
  reminderTitle: string;
  reminderDescription?: string;
  reminderCategory?: WirdReminder['category'];
  reminderImageUrl?: string;
  reminderFileUrl?: string;
  reminderLinkUrl?: string;
}

export interface TasbeehCounter {
  id: string;
  title: string;
  description?: string;
  target: number;
  current: number;
  isActive: boolean;
  createdAt: Date;
  lastUsed: Date;
  totalCount: number; // Total count across all sessions
  sessions: TasbeehSession[];
}

export interface TasbeehSession {
  id: string;
  counterId: string;
  startTime: Date;
  endTime?: Date;
  count: number;
  target: number;
}

export interface AladhanResponse {
  code: number;
  status: string;
  data: {
    timings: PrayerTimes;
    date: {
      readable: string;
      timestamp: string;
      gregorian: {
        date: string;
        format: string;
        day: string;
        weekday: {
          en: string;
        };
        month: {
          number: number;
          en: string;
        };
        year: string;
      };
      hijri: IslamicDate;
    };
    meta: {
      latitude: number;
      longitude: number;
      timezone: string;
      method: {
        id: number;
        name: string;
        params: {
          Fajr: number;
          Isha: number;
        };
        location: {
          latitude: number;
          longitude: number;
        };
      };
      latitudeAdjustmentMethod: string;
      midnightMode: string;
      school: string;
      offset: Record<string, number>;
    };
  };
}

export interface AppSettings {
  // Prayer Times Settings
  calculationMethod: number;
  locationMethod: 'gps' | 'manual';
  manualLocation?: {
    latitude: number;
    longitude: number;
    city: string;
  };
  
  // Notification Settings
  prayerNotifications: boolean;
  reminderNotifications: boolean;
  notificationSound: boolean;
  notificationVibration: boolean;
  prayerNotificationTime: number; // minutes before prayer
  
  // Tasbeeh Settings
  tasbeehVibration: boolean;
  
  // App Settings
  language: string;
  timeFormat: '12h' | '24h';
  
  // Privacy Settings
  dataCollection: boolean;
  analytics: boolean;
  crashReporting: boolean;
  
  // Backup Settings
  autoBackup: boolean;
  backupFrequency: 'daily' | 'weekly' | 'monthly';
  cloudSync: boolean;
  
  // Offline Settings
  offlineMode: boolean;
  cacheDays: number;
  
  // Theme Settings
  theme: 'original' | 'dark' | 'calm';
  
}

export interface PrayerTimeData {
  date: string;
  timings: PrayerTimes;
  location: Location;
  calculationMethod: number;
  cachedAt: Date;
}

export interface QiblaData {
  direction: number; // degrees from north
  distance: number; // kilometers to Kaaba
  latitude: number;
  longitude: number;
}

export interface WirdCategory {
  id: string;
  name: string;
  description: string;
  color: string;
  icon: string;
}

export interface WirdTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  content: string;
  target: number;
  isDefault: boolean;
}

export interface UserProgress {
  totalPrayers: number;
  totalWirds: number;
  currentStreak: number;
  longestStreak: number;
  achievements: string[];
  lastActive: Date;
}

export type RootTabParamList = {
  Home: undefined;
  Wirds: { reminderId?: string } | undefined;
  Tasbeeh: undefined;
  History: undefined;
  Settings: undefined;
}; 
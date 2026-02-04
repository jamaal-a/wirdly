import { AppSettings } from '../types';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SETTINGS_STORAGE_KEY = '@wirdly_settings';

// Default settings
const defaultSettings: AppSettings = {
  // Prayer Times Settings
  calculationMethod: 2, // ISNA
  locationMethod: 'gps',
  
  // Notification Settings
  prayerNotifications: true,
  reminderNotifications: true,
  notificationSound: true,
  notificationVibration: true,
  prayerNotificationTime: 5, // 5 minutes before prayer
  
  // Tasbeeh Settings
  tasbeehVibration: false,
  
  // App Settings
  language: 'en',
  timeFormat: '12h',
  
  // Privacy Settings
  dataCollection: false,
  analytics: false,
  crashReporting: true,
  
  // Backup Settings
  autoBackup: false,
  backupFrequency: 'weekly',
  cloudSync: false,
  
  // Offline Settings
  offlineMode: true,
  cacheDays: 7,
  
  // Theme Settings
  theme: 'original',
  
};

// In-memory storage for settings (also persisted to AsyncStorage)
let currentSettings: AppSettings = { ...defaultSettings };
let isInitialized = false;

// Load settings from AsyncStorage
const loadSettingsFromStorage = async (): Promise<AppSettings> => {
  try {
    const data = await AsyncStorage.getItem(SETTINGS_STORAGE_KEY);
    if (data) {
      const parsed = JSON.parse(data);
      return { ...defaultSettings, ...parsed };
    }
  } catch (error) {
    console.error('Error loading settings from storage:', error);
  }
  return { ...defaultSettings };
};

// Save settings to AsyncStorage
const saveSettingsToStorage = async (settings: AppSettings): Promise<void> => {
  try {
    await AsyncStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
  } catch (error) {
    console.error('Error saving settings to storage:', error);
  }
};

// Initialize settings from storage (call this on app start)
const initializeSettings = async (): Promise<void> => {
  if (isInitialized) return;
  
  try {
    currentSettings = await loadSettingsFromStorage();
    isInitialized = true;
    console.log('⚙️ Settings loaded from storage');
  } catch (error) {
    console.error('Error initializing settings:', error);
    currentSettings = { ...defaultSettings };
    isInitialized = true;
  }
};

export const settingsService = {
  // Initialize settings from storage (call this on app start)
  initialize: initializeSettings,

  // Get all settings
  getAllSettings: (): AppSettings => {
    return { ...currentSettings };
  },

  // Get a specific setting
  getSetting: <K extends keyof AppSettings>(key: K): AppSettings[K] => {
    return currentSettings[key];
  },

  // Update a single setting
  updateSetting: <K extends keyof AppSettings>(key: K, value: AppSettings[K]): AppSettings => {
    currentSettings[key] = value;
    saveSettingsToStorage(currentSettings).catch(err => console.error('Error saving setting:', err));
    return { ...currentSettings };
  },

  // Update multiple settings
  updateSettings: (updates: Partial<AppSettings>): AppSettings => {
    currentSettings = { ...currentSettings, ...updates };
    saveSettingsToStorage(currentSettings).catch(err => console.error('Error saving settings:', err));
    return { ...currentSettings };
  },

  // Reset to default settings
  resetToDefaults: (): AppSettings => {
    currentSettings = { ...defaultSettings };
    saveSettingsToStorage(currentSettings).catch(err => console.error('Error saving reset settings:', err));
    return { ...currentSettings };
  },

  // Reset specific category
  resetCategory: (category: keyof AppSettings) => {
    switch (category) {
      case 'calculationMethod':
      case 'locationMethod':
      case 'manualLocation':
        currentSettings.calculationMethod = defaultSettings.calculationMethod;
        currentSettings.locationMethod = defaultSettings.locationMethod;
        currentSettings.manualLocation = defaultSettings.manualLocation;
        break;
      case 'prayerNotifications':
      case 'reminderNotifications':
      case 'notificationSound':
      case 'notificationVibration':
      case 'tasbeehVibration':
        currentSettings.prayerNotifications = defaultSettings.prayerNotifications;
        currentSettings.reminderNotifications = defaultSettings.reminderNotifications;
        currentSettings.notificationSound = defaultSettings.notificationSound;
        currentSettings.notificationVibration = defaultSettings.notificationVibration;
        currentSettings.tasbeehVibration = defaultSettings.tasbeehVibration;
        break;
      // Commented out - may use in the future
      // case 'theme':
      // case 'language':
      // case 'timeFormat':
      //   currentSettings.theme = defaultSettings.theme;
      //   currentSettings.language = defaultSettings.language;
      //   currentSettings.timeFormat = defaultSettings.timeFormat;
      //   break;
      case 'dataCollection':
      case 'analytics':
      case 'crashReporting':
        currentSettings.dataCollection = defaultSettings.dataCollection;
        currentSettings.analytics = defaultSettings.analytics;
        currentSettings.crashReporting = defaultSettings.crashReporting;
        break;
      case 'autoBackup':
      case 'backupFrequency':
      case 'cloudSync':
        currentSettings.autoBackup = defaultSettings.autoBackup;
        currentSettings.backupFrequency = defaultSettings.backupFrequency;
        currentSettings.cloudSync = defaultSettings.cloudSync;
        break;
    }
    return { ...currentSettings };
  },

  // Get calculation method name
  getCalculationMethodName: (method: number): string => {
    const methods = {
      0: 'Shia Ithna-Ansari',
      1: 'University of Islamic Sciences, Karachi',
      2: 'Islamic Society of North America (ISNA)',
      3: 'Muslim World League (MWL)',
      4: 'Umm al-Qura, Makkah',
      5: 'Egyptian General Authority of Survey',
      6: 'Institute of Geophysics, University of Tehran',
      7: 'Gulf Region',
      8: 'Kuwait',
      9: 'Qatar',
      10: 'Majlis Ugama Islam Singapura, Singapore',
      11: 'Union Organization islamic de France',
      12: 'Diyanet İşleri Başkanlığı, Turkey',
      13: 'Spiritual Administration of Muslims of Russia',
      14: 'Moonsighting Committee Worldwide (also requires shafaq parameter)',
      15: 'Dubai (unofficial)',
      16: 'Konsulat Negara Brunei Darussalam di Bandar Seri Begawan (Brunei)',
      17: 'Kementerian Agama Republik Indonesia (Indonesia)',
      18: 'Jabatan Kemajuan Islam Malaysia (JAKIM) (Malaysia)',
      19: 'Majlis Agama Islam Wilayah Persekutuan (Malaysia)',
      20: 'Lembaga Falakiyah (Indonesia)',
      21: 'Kementerian Agama Republik Indonesia (Indonesia)',
      22: 'Kementerian Agama Republik Indonesia (Indonesia)',
      23: 'Kementerian Agama Republik Indonesia (Indonesia)',
      24: 'Kementerian Agama Republik Indonesia (Indonesia)',
      25: 'Kementerian Agama Republik Indonesia (Indonesia)',
      26: 'Kementerian Agama Republik Indonesia (Indonesia)',
      27: 'Kementerian Agama Republik Indonesia (Indonesia)',
      28: 'Kementerian Agama Republik Indonesia (Indonesia)',
      29: 'Kementerian Agama Republik Indonesia (Indonesia)',
      30: 'Kementerian Agama Republik Indonesia (Indonesia)',
      31: 'Kementerian Agama Republik Indonesia (Indonesia)',
      32: 'Kementerian Agama Republik Indonesia (Indonesia)',
      33: 'Kementerian Agama Republik Indonesia (Indonesia)',
      34: 'Kementerian Agama Republik Indonesia (Indonesia)',
      35: 'Kementerian Agama Republik Indonesia (Indonesia)',
      36: 'Kementerian Agama Republik Indonesia (Indonesia)',
      37: 'Kementerian Agama Republik Indonesia (Indonesia)',
      38: 'Kementerian Agama Republik Indonesia (Indonesia)',
      39: 'Kementerian Agama Republik Indonesia (Indonesia)',
      40: 'Kementerian Agama Republik Indonesia (Indonesia)',
      41: 'Kementerian Agama Republik Indonesia (Indonesia)',
      42: 'Kementerian Agama Republik Indonesia (Indonesia)',
      43: 'Kementerian Agama Republik Indonesia (Indonesia)',
      44: 'Kementerian Agama Republik Indonesia (Indonesia)',
      45: 'Kementerian Agama Republik Indonesia (Indonesia)',
      46: 'Kementerian Agama Republik Indonesia (Indonesia)',
      47: 'Kementerian Agama Republik Indonesia (Indonesia)',
      48: 'Kementerian Agama Republik Indonesia (Indonesia)',
      49: 'Kementerian Agama Republik Indonesia (Indonesia)',
      50: 'Kementerian Agama Republik Indonesia (Indonesia)',
    };
    return methods[method as keyof typeof methods] || 'Unknown Method';
  },

  // Get available languages
  getAvailableLanguages: () => [
    { code: 'en', name: 'English' },
    { code: 'ar', name: 'العربية' },
    { code: 'ur', name: 'اردو' },
    { code: 'tr', name: 'Türkçe' },
    { code: 'fr', name: 'Français' },
    { code: 'es', name: 'Español' },
    { code: 'de', name: 'Deutsch' },
    { code: 'id', name: 'Bahasa Indonesia' },
    { code: 'ms', name: 'Bahasa Melayu' },
  ],

  // Get language name
  getLanguageName: (code: string): string => {
    const languages = settingsService.getAvailableLanguages();
    const language = languages.find(lang => lang.code === code);
    return language ? language.name : 'English';
  },
};

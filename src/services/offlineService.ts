import { PrayerTimeData, Location, PrayerTimes } from '../types';
import { settingsService } from './settingsService';

// In-memory cache (in a real app, this would be AsyncStorage)
let prayerTimeCache: Map<string, PrayerTimeData> = new Map();

export const offlineService = {
  // Cache prayer times for offline access
  cachePrayerTimes: (date: string, timings: PrayerTimes, location: Location, calculationMethod: number) => {
    try {
      const cacheKey = `${date}_${location.latitude}_${location.longitude}_${calculationMethod}`;
      const prayerData: PrayerTimeData = {
        date,
        timings,
        location,
        calculationMethod,
        cachedAt: new Date(),
      };
      
      prayerTimeCache.set(cacheKey, prayerData);
      console.log('Cached prayer times for:', date);
    } catch (error) {
      console.error('Error caching prayer times:', error);
    }
  },

  // Get cached prayer times
  getCachedPrayerTimes: (date: string, location: Location, calculationMethod: number): PrayerTimeData | null => {
    try {
      const cacheKey = `${date}_${location.latitude}_${location.longitude}_${calculationMethod}`;
      const cached = prayerTimeCache.get(cacheKey);
      
      if (cached) {
        const settings = settingsService.getAllSettings();
        const cacheAge = Date.now() - cached.cachedAt.getTime();
        const maxAge = settings.cacheDays * 24 * 60 * 60 * 1000; // Convert days to milliseconds
        
        if (cacheAge < maxAge) {
          console.log('Using cached prayer times for:', date);
          return cached;
        } else {
          // Cache expired, remove it
          prayerTimeCache.delete(cacheKey);
        }
      }
      
      return null;
    } catch (error) {
      console.error('Error getting cached prayer times:', error);
      return null;
    }
  },

  // Check if we have cached data for a location
  hasCachedData: (location: Location, calculationMethod: number): boolean => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const cacheKey = `${today}_${location.latitude}_${location.longitude}_${calculationMethod}`;
      return prayerTimeCache.has(cacheKey);
    } catch (error) {
      console.error('Error checking cached data:', error);
      return false;
    }
  },

  // Get all cached dates for a location
  getCachedDates: (location: Location, calculationMethod: number): string[] => {
    try {
      const dates: string[] = [];
      const locationKey = `${location.latitude}_${location.longitude}_${calculationMethod}`;
      
      for (const [key, data] of prayerTimeCache.entries()) {
        if (key.includes(locationKey)) {
          dates.push(data.date);
        }
      }
      
      return dates.sort();
    } catch (error) {
      console.error('Error getting cached dates:', error);
      return [];
    }
  },

  // Clear expired cache
  clearExpiredCache: () => {
    try {
      const settings = settingsService.getAllSettings();
      const maxAge = settings.cacheDays * 24 * 60 * 60 * 1000;
      const now = Date.now();
      
      for (const [key, data] of prayerTimeCache.entries()) {
        const cacheAge = now - data.cachedAt.getTime();
        if (cacheAge > maxAge) {
          prayerTimeCache.delete(key);
        }
      }
      
      console.log('Cleared expired cache entries');
    } catch (error) {
      console.error('Error clearing expired cache:', error);
    }
  },

  // Clear all cache
  clearAllCache: () => {
    try {
      prayerTimeCache.clear();
      console.log('Cleared all cache');
    } catch (error) {
      console.error('Error clearing all cache:', error);
    }
  },

  // Get cache size
  getCacheSize: (): number => {
    return prayerTimeCache.size;
  },

  // Check if offline mode is enabled
  isOfflineMode: (): boolean => {
    const settings = settingsService.getAllSettings();
    return settings.offlineMode;
  },

  // Get last known location from cache
  getLastKnownLocation: (): Location | null => {
    try {
      // In a real app, this would be stored in AsyncStorage
      const stored = localStorage?.getItem('lastKnownLocation');
      if (stored) {
        return JSON.parse(stored);
      }
      return null;
    } catch (error) {
      console.error('Error getting last known location:', error);
      return null;
    }
  },

  // Save last known location
  saveLastKnownLocation: (location: Location) => {
    try {
      // In a real app, this would be stored in AsyncStorage
      localStorage?.setItem('lastKnownLocation', JSON.stringify(location));
      console.log('Saved last known location');
    } catch (error) {
      console.error('Error saving last known location:', error);
    }
  },

  // Check network connectivity
  isOnline: (): boolean => {
    // In a real app, you would use NetInfo
    return navigator.onLine !== false;
  },

  // Get offline status message
  getOfflineStatus: (): { isOffline: boolean; message: string } => {
    const isOffline = !offlineService.isOnline();
    const hasCachedData = offlineService.getLastKnownLocation() !== null;
    
    if (isOffline && hasCachedData) {
      return {
        isOffline: true,
        message: 'Offline mode - using cached data'
      };
    } else if (isOffline) {
      return {
        isOffline: true,
        message: 'No internet connection - some features unavailable'
      };
    } else {
      return {
        isOffline: false,
        message: 'Online'
      };
    }
  },
};

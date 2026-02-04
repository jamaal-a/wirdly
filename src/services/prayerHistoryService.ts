import { PrayerTimes, Location, PrayerTimeData } from '../types';
import { fetchPrayerTimesByDate } from './prayerTimesService';
import { offlineService } from './offlineService';

export const prayerHistoryService = {
  // Get prayer times for a specific date
  getPrayerTimesForDate: async (date: Date, location: Location): Promise<PrayerTimeData | null> => {
    try {
      const dateString = date.toISOString().split('T')[0];
      console.log(`Loading prayer times for ${dateString} at location:`, location);
      
      // Check cache first
      const cached = offlineService.getCachedPrayerTimes(dateString, location, 2);
      if (cached) {
        console.log('Using cached prayer times for:', dateString);
        return cached;
      }

      // Fetch from API
      console.log('Fetching prayer times from API for:', dateString);
      const response = await fetchPrayerTimesByDate(date, location);
      console.log('API response:', response);
      
      if (response && response.data && response.data.timings) {
        const prayerData: PrayerTimeData = {
          date: dateString,
          timings: response.data.timings,
          location,
          calculationMethod: 2,
          cachedAt: new Date(),
        };

        // Cache the result
        offlineService.cachePrayerTimes(dateString, response.data.timings, location, 2);
        console.log('Cached prayer times for:', dateString);
        return prayerData;
      }

      console.log('No prayer times data in response');
      return null;
    } catch (error) {
      console.error('Error getting prayer times for date:', error);
      // Try to return cached data even if it's expired
      const dateString = date.toISOString().split('T')[0];
      const expiredCached = offlineService.getCachedPrayerTimes(dateString, location, 2);
      if (expiredCached) {
        console.log('Using expired cached data for:', dateString);
      }
      return expiredCached;
    }
  },

  // Get prayer times for a date range
  getPrayerTimesForRange: async (
    startDate: Date,
    endDate: Date,
    location: Location
  ): Promise<PrayerTimeData[]> => {
    try {
      const results: PrayerTimeData[] = [];
      const currentDate = new Date(startDate);

      while (currentDate <= endDate) {
        try {
          const prayerData = await prayerHistoryService.getPrayerTimesForDate(currentDate, location);
          if (prayerData) {
            results.push(prayerData);
          }
        } catch (dateError) {
          console.error(`Error getting prayer times for ${currentDate.toISOString()}:`, dateError);
          // Continue with next date instead of failing completely
        }
        currentDate.setDate(currentDate.getDate() + 1);
      }

      return results;
    } catch (error) {
      console.error('Error getting prayer times for range:', error);
      return [];
    }
  },

  // Get prayer times for current month
  getCurrentMonthPrayerTimes: async (location: Location): Promise<PrayerTimeData[]> => {
    try {
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

      return await prayerHistoryService.getPrayerTimesForRange(startOfMonth, endOfMonth, location);
    } catch (error) {
      console.error('Error getting current month prayer times:', error);
      return [];
    }
  },

  // Get prayer times for next month
  getNextMonthPrayerTimes: async (location: Location): Promise<PrayerTimeData[]> => {
    try {
      const now = new Date();
      const startOfNextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
      const endOfNextMonth = new Date(now.getFullYear(), now.getMonth() + 2, 0);

      return await prayerHistoryService.getPrayerTimesForRange(startOfNextMonth, endOfNextMonth, location);
    } catch (error) {
      console.error('Error getting next month prayer times:', error);
      return [];
    }
  },

  // Get prayer times for a specific month
  getMonthPrayerTimes: async (year: number, month: number, location: Location): Promise<PrayerTimeData[]> => {
    try {
      const startOfMonth = new Date(year, month - 1, 1);
      const endOfMonth = new Date(year, month, 0);

      return await prayerHistoryService.getPrayerTimesForRange(startOfMonth, endOfMonth, location);
    } catch (error) {
      console.error('Error getting month prayer times:', error);
      return [];
    }
  },

  // Get prayer times for a specific week
  getWeekPrayerTimes: async (date: Date, location: Location): Promise<PrayerTimeData[]> => {
    try {
      const startOfWeek = new Date(date);
      const dayOfWeek = startOfWeek.getDay();
      startOfWeek.setDate(startOfWeek.getDate() - dayOfWeek); // Start from Sunday
      
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(endOfWeek.getDate() + 6); // End on Saturday

      return await prayerHistoryService.getPrayerTimesForRange(startOfWeek, endOfWeek, location);
    } catch (error) {
      console.error('Error getting week prayer times:', error);
      return [];
    }
  },

  // Get available cached dates
  getAvailableDates: (location: Location): string[] => {
    return offlineService.getCachedDates(location, 2);
  },

  // Check if prayer times are available for a date
  isPrayerTimesAvailable: (date: Date, location: Location): boolean => {
    const dateString = date.toISOString().split('T')[0];
    const cached = offlineService.getCachedPrayerTimes(dateString, location, 2);
    return cached !== null;
  },

  // Get prayer time statistics
  getPrayerTimeStats: (prayerTimes: PrayerTimeData[]) => {
    if (prayerTimes.length === 0) return null;

    const stats = {
      totalDays: prayerTimes.length,
      dateRange: {
        start: prayerTimes[0]?.date,
        end: prayerTimes[prayerTimes.length - 1]?.date,
      },
      averageTimes: {
        Fajr: '',
        Dhuhr: '',
        Asr: '',
        Maghrib: '',
        Isha: '',
      },
    };

    // Calculate average times (simplified - in real app you'd do proper time calculations)
    const prayerNames = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'] as const;
    
    for (const prayer of prayerNames) {
      const times = prayerTimes
        .map(pt => pt.timings[prayer])
        .filter(time => time)
        .map(time => {
          const [hours, minutes] = time.split(':').map(Number);
          return hours * 60 + minutes; // Convert to minutes
        });

      if (times.length > 0) {
        const averageMinutes = times.reduce((sum, time) => sum + time, 0) / times.length;
        const hours = Math.floor(averageMinutes / 60);
        const minutes = Math.round(averageMinutes % 60);
        stats.averageTimes[prayer] = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
      }
    }

    return stats;
  },

};

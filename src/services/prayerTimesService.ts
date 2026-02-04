import axios from 'axios';
import { AladhanResponse, Location } from '../types';
import { settingsService } from './settingsService';

const ALADHAN_API_BASE_URL = 'https://api.aladhan.com/v1';

// Add delay between requests to avoid 429 errors
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const fetchPrayerTimes = async (location: Location): Promise<AladhanResponse> => {
  try {
    const settings = settingsService.getAllSettings();
    
    const response = await axios.get(`${ALADHAN_API_BASE_URL}/timings`, {
      params: {
        latitude: location.latitude,
        longitude: location.longitude,
        method: settings.calculationMethod,
        timestamp: Math.floor(Date.now() / 1000)
      }
    });
    
    return response.data;
  } catch (error) {
    console.error('Error fetching prayer times:', error);
    throw new Error('Failed to fetch prayer times');
  }
};

export const fetchPrayerTimesByDate = async (
  date: Date,
  location: Location,
  method?: number
): Promise<AladhanResponse> => {
  try {
    const settings = settingsService.getAllSettings();
    const calculationMethod = method || settings.calculationMethod;
    const timestamp = Math.floor(date.getTime() / 1000);
    
    const response = await axios.get(`${ALADHAN_API_BASE_URL}/timings/${timestamp}`, {
      params: {
        latitude: location.latitude,
        longitude: location.longitude,
        method: calculationMethod
      }
    });
    
    return response.data;
  } catch (error) {
    console.error('Error fetching prayer times for date:', error);
    throw new Error('Failed to fetch prayer times for date');
  }
};

export const fetchPrayerTimesForMonth = async (
  year: number,
  month: number,
  location: Location,
  method?: number
): Promise<AladhanResponse> => {
  try {
    const settings = settingsService.getAllSettings();
    const calculationMethod = method || settings.calculationMethod;
    
    const response = await axios.get(`${ALADHAN_API_BASE_URL}/calendarByMonth/${year}/${month}`, {
      params: {
        latitude: location.latitude,
        longitude: location.longitude,
        method: calculationMethod
      }
    });
    
    return response.data;
  } catch (error) {
    console.error('Error fetching prayer times for month:', error);
    throw new Error('Failed to fetch prayer times for month');
  }
}; 
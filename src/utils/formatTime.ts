import { settingsService } from '../services/settingsService';

export const formatTime = (timeString: string): string => {
  // Remove any extra characters and format as HH:MM
  const cleanTime = timeString.replace(/[^0-9:]/g, '');
  const [hours, minutes] = cleanTime.split(':');
  
  if (!hours || !minutes) return timeString;
  
  // Always use 24-hour format
  return `${hours}:${minutes}`;
};

export const getCurrentDate = (): string => {
  const now = new Date();
  return now.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

export const isCurrentPrayer = (prayerTime: string): boolean => {
  const now = new Date();
  const currentTime = now.getHours() * 60 + now.getMinutes();
  
  const [hours, minutes] = prayerTime.split(':');
  const prayerMinutes = parseInt(hours) * 60 + parseInt(minutes);
  
  // Check if current time is within 30 minutes of prayer time
  return Math.abs(currentTime - prayerMinutes) <= 30;
}; 
import { IslamicDate } from '../types';

export const formatIslamicDate = (islamicDate: IslamicDate): string => {
  const { day, month, year, weekday } = islamicDate;
  
  return `${weekday.en}, ${day} ${month.en} ${year} AH`;
};

export const formatIslamicDateShort = (islamicDate: IslamicDate): string => {
  const { day, month } = islamicDate;
  
  return `${day} ${month.en}`;
};

export const getIslamicMonthName = (monthNumber: number): string => {
  const months = [
    'Muharram', 'Safar', 'Rabi al-Awwal', 'Rabi al-Thani',
    'Jumada al-Awwal', 'Jumada al-Thani', 'Rajab', 'Shaban',
    'Ramadan', 'Shawwal', 'Dhu al-Qadah', 'Dhu al-Hijjah'
  ];
  
  return months[monthNumber - 1] || 'Unknown';
};

export const getIslamicWeekdayName = (weekdayNumber: number): string => {
  const weekdays = [
    'Sunday', 'Monday', 'Tuesday', 'Wednesday',
    'Thursday', 'Friday', 'Saturday'
  ];
  
  return weekdays[weekdayNumber] || 'Unknown';
};

export const isSpecialIslamicDay = (islamicDate: IslamicDate): { isSpecial: boolean; name: string; description: string } => {
  const { day, month } = islamicDate;
  
  // Check for special Islamic days
  if (month.number === 1 && day === '10') {
    return {
      isSpecial: true,
      name: 'Ashura',
      description: 'Day of fasting and reflection'
    };
  }
  
  if (month.number === 3 && day === '12') {
    return {
      isSpecial: true,
      name: 'Mawlid al-Nabi',
      description: 'Birth of Prophet Muhammad (PBUH)'
    };
  }
  
  if (month.number === 7 && day === '27') {
    return {
      isSpecial: true,
      name: 'Laylat al-Qadr',
      description: 'Night of Power (estimated)'
    };
  }
  
  if (month.number === 9 && day === '1') {
    return {
      isSpecial: true,
      name: 'First Day of Ramadan',
      description: 'Beginning of blessed month'
    };
  }
  
  if (month.number === 10 && day === '1') {
    return {
      isSpecial: true,
      name: 'Eid al-Fitr',
      description: 'Festival of Breaking the Fast'
    };
  }
  
  if (month.number === 12 && day === '10') {
    return {
      isSpecial: true,
      name: 'Eid al-Adha',
      description: 'Festival of Sacrifice'
    };
  }
  
  return {
    isSpecial: false,
    name: '',
    description: ''
  };
}; 
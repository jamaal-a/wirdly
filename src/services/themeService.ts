import { AppSettings } from '../types';
import { settingsService } from './settingsService';

export interface ThemeColors {
  primary: string;
  secondary: string;
  background: string;
  surface: string;
  card: string;
  text: string;
  textSecondary: string;
  border: string;
  success: string;
  warning: string;
  error: string;
  info: string;
  shadow: string;
  tabBar: string;
  tabBarActive: string;
  tabBarInactive: string;
}

export const lightTheme: ThemeColors = {
  primary: '#2E7D32',
  secondary: '#1976D2',
  background: '#F0F0EC',
  surface: '#FFFFFF',
  card: '#FFFFFF',
  text: '#1A1A1A',
  textSecondary: '#4A4A4A',
  border: '#D0D0D0',
  success: '#2E7D32',
  warning: '#F57C00',
  error: '#D32F2F',
  info: '#1976D2',
  shadow: '#000000',
  tabBar: '#FFFFFF',
  tabBarActive: '#2E7D32',
  tabBarInactive: '#757575',
};

export const darkTheme: ThemeColors = {
  primary: '#4CAF50',
  secondary: '#64B5F6',
  background: '#121212',
  surface: '#1E1E1E',
  card: '#1E1E1E',
  text: '#FFFFFF',
  textSecondary: '#B0B0B0',
  border: '#333333',
  success: '#4CAF50',
  warning: '#FF9800',
  error: '#F44336',
  info: '#2196F3',
  shadow: '#000000',
  tabBar: '#1E1E1E',
  tabBarActive: '#4CAF50',
  tabBarInactive: '#757575',
};

export const calmTheme: ThemeColors = {
  primary: '#8B6F47',
  secondary: '#A67C52',
  background: '#F5F1EB',
  surface: '#FAF8F4',
  card: '#FAF8F4',
  text: '#3E2723',
  textSecondary: '#6D4C41',
  border: '#D7CCC8',
  success: '#8B6F47',
  warning: '#BC8F5A',
  error: '#A67C52',
  info: '#8B6F47',
  shadow: '#000000',
  tabBar: '#FAF8F4',
  tabBarActive: '#8B6F47',
  tabBarInactive: '#A67C52',
};

export type ThemeMode = 'original' | 'dark' | 'calm';

// Theme service with theme switching support
export const themeService = {
  // Get current theme based on saved preference
  getCurrentTheme: (): ThemeColors => {
    const themeMode = themeService.getThemeMode();
    return themeService.getTheme(themeMode);
  },

  // Get theme by mode
  getTheme: (mode: ThemeMode): ThemeColors => {
    switch (mode) {
      case 'dark':
        return darkTheme;
      case 'calm':
        return calmTheme;
      case 'original':
      default:
        return lightTheme;
    }
  },

  // Get current theme mode from settings
  getThemeMode: (): ThemeMode => {
    try {
      const settings = settingsService.getAllSettings();
      return settings.theme || 'original';
    } catch {
      return 'original';
    }
  },

  // Set theme mode (updates settings)
  setThemeMode: (mode: ThemeMode): void => {
    settingsService.updateSetting('theme', mode);
  },

  // Get theme-aware color
  getColor: (colorKey: keyof ThemeColors): string => {
    return themeService.getCurrentTheme()[colorKey];
  },
};
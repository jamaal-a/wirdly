import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  RefreshControl,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PrayerTimes, Location as LocationType, IslamicDate } from '../types';
import { fetchPrayerTimes } from '../services/prayerTimesService';
import { getCurrentLocation, getLastKnownLocation } from '../services/locationService';
import * as ExpoLocation from 'expo-location';
import { formatTime, getCurrentDate, isCurrentPrayer } from '../utils/formatTime';
import { formatIslamicDate, isSpecialIslamicDay } from '../utils/islamicDate';
import { notificationService } from '../services/notificationService';
import { offlineService } from '../services/offlineService';
import { themeService } from '../services/themeService';
import { settingsService } from '../services/settingsService';

const HomeScreen: React.FC = () => {
  const [prayerTimes, setPrayerTimes] = useState<PrayerTimes | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [location, setLocation] = useState<LocationType | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [islamicDate, setIslamicDate] = useState<IslamicDate | null>(null);
  const [specialDay, setSpecialDay] = useState<{ isSpecial: boolean; name: string; description: string } | null>(null);
  const [offlineStatus, setOfflineStatus] = useState<{ isOffline: boolean; message: string } | null>(null);
  const [nextPrayer, setNextPrayer] = useState<{ name: string; time: string; hoursLeft: number; minutesLeft: number } | null>(null);
  const [cityName, setCityName] = useState<string>('');
  const [timeUntilPrayer, setTimeUntilPrayer] = useState<{ totalMinutes: number; totalSeconds: number } | null>(null);
  const theme = themeService.getCurrentTheme();
  const [themeKey, setThemeKey] = useState(0);

  // Listen for theme changes
  useEffect(() => {
    const interval = setInterval(() => {
      const currentSettings = settingsService.getAllSettings();
      const currentTheme = themeService.getCurrentTheme();
      // Force re-render if theme changed
      if (currentTheme.background !== theme.background) {
        setThemeKey(prev => prev + 1);
      }
    }, 500);
    return () => clearInterval(interval);
  }, [theme.background]);

  const loadPrayerTimes = async (useLastKnownLocation = false) => {
    try {
      setError(null);
      let currentLocation: LocationType | null;

      if (useLastKnownLocation) {
        currentLocation = await getLastKnownLocation();
        if (!currentLocation) {
          throw new Error('No last known location available');
        }
      } else {
        currentLocation = await getCurrentLocation();
      }

      if (currentLocation) {
        setLocation(currentLocation);
        
        // Get city name from coordinates
        try {
          const geocode = await ExpoLocation.reverseGeocodeAsync({
            latitude: currentLocation.latitude,
            longitude: currentLocation.longitude,
          });
          if (geocode && geocode.length > 0) {
            const city = geocode[0].city || geocode[0].subregion || geocode[0].region || 'Unknown';
            setCityName(city);
          }
        } catch (geocodeError) {
          console.error('Error getting city name:', geocodeError);
          setCityName('Location');
        }
        
        // Check offline status
        const status = offlineService.getOfflineStatus();
        setOfflineStatus(status);
        
        
        // Cache location for offline use
        offlineService.saveLastKnownLocation(currentLocation);
        
        const response = await fetchPrayerTimes(currentLocation);
        setPrayerTimes(response.data.timings);
        
        // Cache prayer times for offline access
        const today = new Date().toISOString().split('T')[0];
        offlineService.cachePrayerTimes(today, response.data.timings, currentLocation, 2);
        
        // Set Islamic date
        if (response.data.date.hijri) {
          setIslamicDate(response.data.date.hijri);
          const special = isSpecialIslamicDay(response.data.date.hijri);
          setSpecialDay(special);
        }
        
        // Calculate next prayer
        calculateNextPrayer(response.data.timings);
        
        // Note: Prayer notifications disabled due to Expo limitations
        // Scheduled notifications don't work properly even in development builds
        // TODO: Re-enable when using standalone build or different notification approach
        // await notificationService.schedulePrayerNotifications(response.data.timings, new Date());
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load prayer times';
      setError(errorMessage);
      Alert.alert('Error', errorMessage);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadPrayerTimes(true); // Try to use last known location first
  }, []);

  const calculateNextPrayer = (timings: PrayerTimes) => {
    const now = new Date();
    const prayers = [
      { name: 'Fajr', time: timings.Fajr },
      { name: 'Dhuhr', time: timings.Dhuhr },
      { name: 'Asr', time: timings.Asr },
      { name: 'Maghrib', time: timings.Maghrib },
      { name: 'Isha', time: timings.Isha },
    ];

    for (const prayer of prayers) {
      const [hours, minutes] = prayer.time.split(':').map(Number);
      const prayerTime = new Date();
      prayerTime.setHours(hours, minutes, 0, 0);

      if (prayerTime > now) {
        const totalMinutesLeft = Math.floor((prayerTime.getTime() - now.getTime()) / (1000 * 60));
        const hoursLeft = Math.floor(totalMinutesLeft / 60);
        const minutesLeft = totalMinutesLeft % 60;
        const totalSeconds = Math.floor((prayerTime.getTime() - now.getTime()) / 1000);
        
        setNextPrayer({
          name: prayer.name,
          time: prayer.time,
          hoursLeft,
          minutesLeft,
        });
        
        setTimeUntilPrayer({
          totalMinutes: totalMinutesLeft,
          totalSeconds,
        });
        
        break;
      }
    }
  };

  // Update countdown every second
  useEffect(() => {
    if (!nextPrayer || !timeUntilPrayer) return;

    const interval = setInterval(() => {
      const now = new Date();
      const [hours, minutes] = nextPrayer.time.split(':').map(Number);
      const prayerTime = new Date();
      prayerTime.setHours(hours, minutes, 0, 0);

      if (prayerTime > now) {
        const totalMinutesLeft = Math.floor((prayerTime.getTime() - now.getTime()) / (1000 * 60));
        const totalSeconds = Math.floor((prayerTime.getTime() - now.getTime()) / 1000);
        const hoursLeft = Math.floor(totalMinutesLeft / 60);
        const minutesLeft = totalMinutesLeft % 60;

        setNextPrayer({
          ...nextPrayer,
          hoursLeft,
          minutesLeft,
        });

        setTimeUntilPrayer({
          totalMinutes: totalMinutesLeft,
          totalSeconds,
        });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [nextPrayer, timeUntilPrayer]);

  const getDynamicStyles = () => {
    return StyleSheet.create({
      container: {
        flex: 1,
        backgroundColor: theme.background,
      },
      scrollView: {
        flex: 1,
      },
      content: {
        padding: 16,
      },
      header: {
        backgroundColor: theme.primary,
        padding: 24,
        alignItems: 'center',
        borderRadius: 16,
        margin: 16,
        marginBottom: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
      },
      title: {
        fontSize: 32,
        fontWeight: 'bold',
        color: 'white',
        marginBottom: 8,
        textAlign: 'center',
      },
      subtitle: {
        fontSize: 16,
        color: '#000000',
        textAlign: 'center',
        fontWeight: '500',
      },
      islamicDateContainer: {
        backgroundColor: theme.card,
        padding: 16,
        borderRadius: 12,
        marginBottom: 16,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
      },
      islamicDateText: {
        fontSize: 18,
        fontWeight: '600',
        color: theme.text,
        marginBottom: 4,
      },
      islamicDateSubtext: {
        fontSize: 14,
        color: theme.textSecondary,
      },
      specialDayContainer: {
        backgroundColor: theme.primary,
        padding: 12,
        borderRadius: 8,
        marginTop: 8,
        alignItems: 'center',
      },
      specialDayText: {
        color: 'white',
        fontSize: 14,
        fontWeight: '600',
        textAlign: 'center',
      },
      offlineContainer: {
        backgroundColor: theme.warning,
        padding: 12,
        borderRadius: 8,
        marginBottom: 16,
        alignItems: 'center',
      },
      offlineText: {
        color: 'white',
        fontSize: 14,
        fontWeight: '600',
      },
      nextPrayerContainer: {
        backgroundColor: theme.card,
        padding: 16,
        borderRadius: 12,
        marginBottom: 16,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
      },
      nextPrayerTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: theme.text,
        marginBottom: 8,
      },
      nextPrayerName: {
        fontSize: 20,
        fontWeight: 'bold',
        color: theme.primary,
        marginBottom: 4,
      },
      nextPrayerTime: {
        fontSize: 18,
        color: theme.text,
        marginBottom: 8,
      },
      nextPrayerCountdown: {
        fontSize: 16,
        color: theme.textSecondary,
      },
      prayerTimesContainer: {
        backgroundColor: theme.card,
        borderRadius: 16,
        padding: 20,
        margin: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 6,
        elevation: 4,
      },
      prayerTimesTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: theme.text,
        marginBottom: 20,
        textAlign: 'center',
      },
      prayerTimeRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 16,
        paddingHorizontal: 8,
        borderBottomWidth: 1,
        borderBottomColor: theme.border,
        borderRadius: 8,
        marginVertical: 2,
      },
      prayerTimeRowLast: {
        borderBottomWidth: 0,
      },
      prayerName: {
        fontSize: 18,
        fontWeight: '600',
        color: theme.text,
      },
      prayerTime: {
        fontSize: 18,
        fontWeight: '600',
        color: theme.primary,
      },
      currentPrayer: {
        backgroundColor: theme.primary,
        borderRadius: 8,
        paddingHorizontal: 16,
        paddingVertical: 16,
        marginVertical: 2,
      },
      currentPrayerText: {
        color: 'white',
        fontSize: 18,
        fontWeight: '600',
      },
      loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
      },
      loadingText: {
        marginTop: 16,
        fontSize: 16,
        color: theme.text,
      },
      errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
      },
      errorText: {
        fontSize: 16,
        color: theme.error,
        textAlign: 'center',
        marginBottom: 16,
      },
      retryButton: {
        backgroundColor: theme.primary,
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 8,
      },
      retryButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
      },
    });
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadPrayerTimes(false); // Get fresh location
  };

  const renderPrayerTime = (prayerName: string, time: string) => {
    const isCurrent = isCurrentPrayer(time);
    
    return (
      <View key={prayerName} style={[dynamicStyles.prayerTimeRow, isCurrent && dynamicStyles.currentPrayer]}>
        <Text style={[dynamicStyles.prayerName, isCurrent && dynamicStyles.currentPrayerText]}>
          {prayerName}
        </Text>
        <Text style={[dynamicStyles.prayerTime, isCurrent && dynamicStyles.currentPrayerText]}>
          {formatTime(time)}
        </Text>
      </View>
    );
  };

  const dynamicStyles = getDynamicStyles();

  if (loading) {
    return (
      <SafeAreaView key={themeKey} style={dynamicStyles.container}>
        <View style={dynamicStyles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.primary} />
          <Text style={dynamicStyles.loadingText}>Loading prayer times...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView key={themeKey} style={dynamicStyles.container}>
        <View style={dynamicStyles.errorContainer}>
          <Text style={dynamicStyles.errorText}>{error}</Text>
          <TouchableOpacity style={dynamicStyles.retryButton} onPress={() => loadPrayerTimes(false)}>
            <Text style={dynamicStyles.retryButtonText}>Tap to retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView key={themeKey} style={dynamicStyles.container}>
      <ScrollView
        style={dynamicStyles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={dynamicStyles.header}>
          <Text style={dynamicStyles.title}>Prayer Times</Text>
          <Text style={dynamicStyles.subtitle}>{getCurrentDate()}</Text>
          {islamicDate && (
            <View style={dynamicStyles.islamicDateContainer}>
              <Text style={dynamicStyles.islamicDateText}>
                📅 {formatIslamicDate(islamicDate)}
              </Text>
              <Text style={dynamicStyles.islamicDateSubtext}>
                Islamic Calendar
              </Text>
            </View>
          )}
          {cityName && (
            <Text style={dynamicStyles.subtitle}>
              📍 {cityName}
            </Text>
          )}
        </View>

        {specialDay && specialDay.isSpecial && (
          <View style={dynamicStyles.specialDayContainer}>
            <Text style={dynamicStyles.specialDayText}>🌟 {specialDay.name}</Text>
            <Text style={dynamicStyles.specialDayText}>{specialDay.description}</Text>
          </View>
        )}

        {offlineStatus && offlineStatus.isOffline && (
          <View style={dynamicStyles.offlineContainer}>
            <Text style={dynamicStyles.offlineText}>📶 {offlineStatus.message}</Text>
          </View>
        )}

        {nextPrayer && (
          <View style={dynamicStyles.nextPrayerContainer}>
            <Text style={dynamicStyles.nextPrayerTitle}>Next Prayer</Text>
            <Text style={dynamicStyles.nextPrayerName}>{nextPrayer.name}</Text>
            <Text style={dynamicStyles.nextPrayerTime}>{formatTime(nextPrayer.time)}</Text>
            <Text style={dynamicStyles.nextPrayerCountdown}>
              {nextPrayer.hoursLeft > 0 
                ? `${nextPrayer.hoursLeft}h ${nextPrayer.minutesLeft}m left`
                : `${nextPrayer.minutesLeft}m left`
              }
            </Text>
          </View>
        )}


        {prayerTimes && (
          <View style={dynamicStyles.prayerTimesContainer}>
            {renderPrayerTime('Fajr', prayerTimes.Fajr)}
            {renderPrayerTime('Sunrise', prayerTimes.Sunrise)}
            {renderPrayerTime('Dhuhr', prayerTimes.Dhuhr)}
            {renderPrayerTime('Asr', prayerTimes.Asr)}
            {renderPrayerTime('Maghrib', prayerTimes.Maghrib)}
            {renderPrayerTime('Isha', prayerTimes.Isha)}
          </View>
        )}

        <View style={dynamicStyles.content}>
          <Text style={dynamicStyles.subtitle}>
            Pull down to refresh prayer times
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};


export default HomeScreen; 
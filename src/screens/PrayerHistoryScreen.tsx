import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
  TextInput,
  Dimensions,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Location, PrayerTimeData } from '../types';
import { prayerHistoryService } from '../services/prayerHistoryService';
import { fetchPrayerTimesByDate, fetchPrayerTimesForMonth } from '../services/prayerTimesService';
import { getCurrentLocation, getLastKnownLocation } from '../services/locationService';
import { formatTime } from '../utils/formatTime';
import { themeService } from '../services/themeService';

const { width } = Dimensions.get('window');

const PrayerHistoryScreen: React.FC = () => {
  const [prayerTimes, setPrayerTimes] = useState<PrayerTimeData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCalculationPicker, setShowCalculationPicker] = useState(false);
  const [location, setLocation] = useState<Location | null>(null);
  const [calculationMethod, setCalculationMethod] = useState(2); // Default to method 2
  const theme = themeService.getCurrentTheme();

  const getDynamicStyles = () => {
    return StyleSheet.create({
      container: {
        flex: 1,
        backgroundColor: theme.background,
      },
      header: {
        backgroundColor: theme.card,
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: theme.border,
      },
      headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: theme.text,
        textAlign: 'center',
      },
      headerSubtitle: {
        fontSize: 16,
        color: theme.textSecondary,
        textAlign: 'center',
        marginTop: 4,
      },
      controls: {
        backgroundColor: theme.card,
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: theme.border,
      },
      controlsRow: {
        flexDirection: 'row',
        gap: 12,
        alignItems: 'center',
      },
      calculationButton: {
        backgroundColor: theme.surface,
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: theme.primary,
      },
      calculationButtonText: {
        color: theme.primary,
        fontSize: 16,
        fontWeight: '600',
      },
      content: {
        flex: 1,
        padding: 16,
      },
      cardsContainer: {
        gap: 12,
      },
      dateCard: {
        backgroundColor: theme.card,
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        shadowColor: theme.shadow,
        shadowOffset: {
          width: 0,
          height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
        elevation: 5,
      },
      dateHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
      },
      dateText: {
        fontSize: 18,
        fontWeight: '600',
        color: theme.text,
      },
      islamicDateText: {
        fontSize: 14,
        color: theme.textSecondary,
        fontStyle: 'italic',
      },
      prayerTimesContainer: {
        gap: 8,
      },
      prayerTimeRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 8,
        paddingHorizontal: 12,
        backgroundColor: theme.surface,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: theme.border,
      },
      prayerName: {
        fontSize: 16,
        fontWeight: '500',
        color: theme.text,
      },
      prayerTime: {
        fontSize: 16,
        fontWeight: '600',
        color: theme.primary,
      },
      loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
      },
      loadingText: {
        fontSize: 16,
        color: theme.textSecondary,
        marginTop: 12,
      },
      errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
      },
      errorTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: theme.error,
        marginBottom: 12,
        textAlign: 'center',
      },
      errorSubtext: {
        fontSize: 16,
        color: theme.textSecondary,
        textAlign: 'center',
        marginBottom: 24,
        lineHeight: 20,
      },
      retryButton: {
        backgroundColor: theme.primary,
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 20,
      },
      retryButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
      },
      modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
      },
      modalContent: {
        backgroundColor: 'white',
        borderRadius: 16,
        padding: 24,
        width: width * 0.9,
        maxWidth: 400,
        shadowColor: '#000',
        shadowOffset: {
          width: 0,
          height: 4,
        },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 10,
      },
      modalTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1A1A1A',
        marginBottom: 24,
        textAlign: 'center',
      },
      modalButtons: {
        flexDirection: 'row',
        gap: 12,
      },
      modalButton: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: 'center',
      },
      cancelButton: {
        backgroundColor: '#F5F5F5',
      },
      confirmButton: {
        backgroundColor: theme.primary,
      },
      cancelButtonText: {
        color: theme.text,
        fontSize: 16,
        fontWeight: '600',
      },
      confirmButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
      },
      methodsList: {
        maxHeight: 300,
        marginBottom: 20,
      },
      methodOption: {
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: theme.border,
      },
      methodOptionSelected: {
        backgroundColor: theme.primary + '20',
      },
      methodOptionText: {
        fontSize: 16,
        color: theme.text,
      },
      methodOptionTextSelected: {
        color: theme.primary,
        fontWeight: '600',
      },
      emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
      },
      emptyIcon: {
        fontSize: 48,
        marginBottom: 16,
      },
      emptyTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: theme.text,
        marginBottom: 8,
        textAlign: 'center',
      },
      emptyText: {
        fontSize: 16,
        color: theme.textSecondary,
        textAlign: 'center',
        lineHeight: 20,
      },
      todayBadge: {
        backgroundColor: theme.primary,
        color: 'white',
        fontSize: 12,
        fontWeight: '600',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        overflow: 'hidden',
      },
      islamicDateContainer: {
        marginTop: 4,
      },
      errorIcon: {
        fontSize: 48,
        marginBottom: 16,
      },
      errorText: {
        fontSize: 16,
        color: theme.textSecondary,
        textAlign: 'center',
        marginBottom: 8,
        lineHeight: 20,
      },
      prayerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 8,
        paddingHorizontal: 12,
        backgroundColor: theme.surface,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: theme.border,
        marginBottom: 4,
      },
      currentPrayerRow: {
        backgroundColor: theme.primary + '20',
        borderColor: theme.primary,
      },
      currentPrayerText: {
        color: theme.primary,
        fontWeight: '600',
      },
    });
  };

  useEffect(() => {
    loadLocation();
  }, []);

  useEffect(() => {
    if (location) {
      loadPrayerTimes();
    }
  }, [location, calculationMethod]);

  const loadLocation = async () => {
    try {
      let userLocation: Location | null = null;

      try {
        userLocation = await getCurrentLocation();
      } catch (error) {
        console.log('Current location failed, trying last known location');
        userLocation = await getLastKnownLocation();
      }

      if (!userLocation) {
        throw new Error('Unable to get location. Please enable location services.');
      }

      setLocation(userLocation);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get location';
      setError(errorMessage);
    }
  };

  const getCalculationMethodName = (methodId: number): string => {
    const methods = {
      1: 'Hanafi - University of Islamic Sciences, Karachi',
      2: 'Islamic Society of North America (ISNA)',
      3: 'Muslim World League (MWL)',
      4: 'Umm al-Qura, Makkah',
      5: 'Egyptian General Authority of Survey',
      8: 'Gulf Region',
      9: 'Kuwait',
      10: 'Qatar',
      11: 'Majlis Ugama Islam Singapura, Singapore',
      12: 'Union Organization Islamique de France (UOIF)',
      13: 'Diyanet İşleri Başkanlığı, Turkey',
      14: 'Spiritual Administration of Muslims of Russia',
      15: 'Moonsighting Committee Worldwide (MCW)',
      16: 'Dubai (unofficial)',
      18: 'Kementerian Agama Republik Indonesia',
      19: 'MABIMS (Malaysia, Brunei, Indonesia, Singapore)',
      21: 'JAKIM (Malaysia)',
      7: 'Institute of Geophysics, University of Tehran (Shia)',
      0: 'Shia Ithna-Ansari',
    };
    return methods[methodId as keyof typeof methods] || `Method ${methodId}`;
  };

  const loadPrayerTimes = async () => {
    if (!location) {
      setError('Location not available');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Load today + next 5 days
      const results: PrayerTimeData[] = [];
      const today = new Date();
      
      // Load prayer times for today and next 5 days
      for (let i = 0; i < 6; i++) {
        const currentDate = new Date(today);
        currentDate.setDate(today.getDate() + i);
        
        try {
          const dateString = currentDate.toISOString().split('T')[0];
          console.log(`Loading prayer times for ${dateString} with method ${calculationMethod}`);
          
          // Add 500ms delay between requests to avoid 429 errors
          if (i > 0) {
            await new Promise(resolve => setTimeout(resolve, 500));
          }
          
          const response = await fetchPrayerTimesByDate(currentDate, location, calculationMethod);
          if (response && response.data && response.data.timings) {
            const prayerData: PrayerTimeData = {
              date: dateString,
              timings: response.data.timings,
              location,
              calculationMethod,
              cachedAt: new Date(),
            };
            results.push(prayerData);
            console.log(`Successfully loaded prayer times for ${dateString}`);
          } else {
            console.warn(`No prayer times data for ${dateString}`);
          }
        } catch (dateError) {
          console.warn(`Could not load prayer times for ${currentDate.toISOString().split('T')[0]}:`, dateError);
          // Don't throw - continue loading other days
        }
      }
      
      if (results.length === 0) {
        throw new Error('No prayer times available');
      }
      
      console.log('Successfully loaded', results.length, 'days of prayer times');
      setPrayerTimes(results);
    } catch (err) {
      console.error('Error loading prayer times:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to load prayer times';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };


  const refreshData = () => {
    loadPrayerTimes();
  };



  const renderCalculationPicker = () => {
    const calculationMethods = [
      { id: 1, name: 'Hanafi - University of Islamic Sciences, Karachi' },
      { id: 2, name: 'Islamic Society of North America (ISNA)' },
      { id: 3, name: 'Muslim World League (MWL)' },
      { id: 4, name: 'Umm al-Qura, Makkah' },
      { id: 5, name: 'Egyptian General Authority of Survey' },
      { id: 8, name: 'Gulf Region' },
      { id: 9, name: 'Kuwait' },
      { id: 10, name: 'Qatar' },
      { id: 11, name: 'Majlis Ugama Islam Singapura, Singapore' },
      { id: 12, name: 'Union Organization Islamique de France (UOIF)' },
      { id: 13, name: 'Diyanet İşleri Başkanlığı, Turkey' },
      { id: 14, name: 'Spiritual Administration of Muslims of Russia' },
      { id: 15, name: 'Moonsighting Committee Worldwide (MCW)' },
      { id: 16, name: 'Dubai (unofficial)' },
      { id: 18, name: 'Kementerian Agama Republik Indonesia' },
      { id: 19, name: 'MABIMS (Malaysia, Brunei, Indonesia, Singapore)' },
      { id: 21, name: 'JAKIM (Malaysia)' },
      { id: 7, name: 'Institute of Geophysics, University of Tehran (Shia)' },
      { id: 0, name: 'Shia Ithna-Ansari' },
    ];

    return (
      <Modal
        animationType="slide"
        transparent={true}
        visible={showCalculationPicker}
        onRequestClose={() => setShowCalculationPicker(false)}
      >
        <View style={getDynamicStyles().modalOverlay}>
          <View style={getDynamicStyles().modalContent}>
            <Text style={getDynamicStyles().modalTitle}>Select Calculation Method</Text>
            
            <ScrollView style={getDynamicStyles().methodsList}>
              {calculationMethods.map((method) => (
                <TouchableOpacity
                  key={method.id}
                  style={[
                    getDynamicStyles().methodOption,
                    calculationMethod === method.id && getDynamicStyles().methodOptionSelected
                  ]}
                  onPress={() => {
                    setCalculationMethod(method.id);
                    setShowCalculationPicker(false);
                    loadPrayerTimes();
                  }}
                >
                  <Text style={[
                    getDynamicStyles().methodOptionText,
                    calculationMethod === method.id && getDynamicStyles().methodOptionTextSelected
                  ]}>
                    {method.id}. {method.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <View style={getDynamicStyles().modalButtons}>
              <TouchableOpacity
                style={[getDynamicStyles().modalButton, getDynamicStyles().cancelButton]}
                onPress={() => setShowCalculationPicker(false)}
              >
                <Text style={getDynamicStyles().cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    );
  };

  const renderPrayerTimeRow = (prayerName: string, time: string, isCurrent: boolean = false) => (
    <View key={prayerName} style={[getDynamicStyles().prayerRow, isCurrent && getDynamicStyles().currentPrayerRow]}>
      <Text style={[getDynamicStyles().prayerName, isCurrent && getDynamicStyles().currentPrayerText]}>
        {prayerName}
      </Text>
      <Text style={[getDynamicStyles().prayerTime, isCurrent && getDynamicStyles().currentPrayerText]}>
        {formatTime(time)}
      </Text>
    </View>
  );

  const renderDailyCards = () => {
    if (prayerTimes.length === 0) return null;

    const prayerNames = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];
    
    // Sort prayer times by date in chronological order (1st to 31st)
    const sortedPrayerTimes = [...prayerTimes].sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      return dateA.getTime() - dateB.getTime();
    });
    
    console.log('Sorted prayer times dates:', sortedPrayerTimes.map(p => p.date));
    
    return (
      <View style={getDynamicStyles().cardsContainer}>
        {sortedPrayerTimes.map((dayData, index) => {
          const dayNumber = new Date(dayData.date).getDate();
          const isToday = dayData.date === new Date().toISOString().split('T')[0];
          
          // Extract Islamic date from the API response
          const islamicDate = dayData.timings && (dayData.timings as any).hijri ? 
            (dayData.timings as any).hijri : null;
          
          return (
            <View key={index} style={getDynamicStyles().dateCard}>
              <View style={getDynamicStyles().dateHeader}>
                <Text style={getDynamicStyles().dateText}>
                  {new Date(dayData.date).toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    month: 'long', 
                    day: 'numeric', 
                    year: 'numeric' 
                  })}
                </Text>
                {isToday && <Text style={getDynamicStyles().todayBadge}>Today</Text>}
              </View>
              
              {islamicDate && (
                <View style={getDynamicStyles().islamicDateContainer}>
                  <Text style={getDynamicStyles().islamicDateText}>
                    📅 Islamic: {islamicDate.day}/{islamicDate.month}/{islamicDate.year}
                  </Text>
                </View>
              )}
              
              <View style={getDynamicStyles().prayerTimesContainer}>
                {prayerNames.map(prayer => 
                  renderPrayerTimeRow(prayer, dayData.timings[prayer as keyof typeof dayData.timings], isToday)
                )}
              </View>
            </View>
          );
        })}
      </View>
    );
  };

  const renderPrayerTimesForDate = (prayerData: PrayerTimeData) => {
    const prayerNames = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'] as const;
    const isToday = prayerData.date === new Date().toISOString().split('T')[0];

    return (
      <View key={prayerData.date} style={getDynamicStyles().dateCard}>
        <View style={getDynamicStyles().dateHeader}>
          <Text style={getDynamicStyles().dateText}>
            {new Date(prayerData.date).toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </Text>
          {isToday && <Text style={getDynamicStyles().todayBadge}>Today</Text>}
        </View>
        
        <View style={getDynamicStyles().prayerTimesContainer}>
          {prayerNames.map(prayer => 
            renderPrayerTimeRow(prayer, prayerData.timings[prayer], isToday)
          )}
        </View>
      </View>
    );
  };

  if (loading && prayerTimes.length === 0) {
    return (
      <SafeAreaView style={getDynamicStyles().container}>
        <View style={getDynamicStyles().loadingContainer}>
          <Text style={getDynamicStyles().loadingText}>Loading prayer times...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={getDynamicStyles().container}>
        <View style={getDynamicStyles().errorContainer}>
          <Text style={getDynamicStyles().errorIcon}>📅</Text>
          <Text style={getDynamicStyles().errorTitle}>Unable to Load Prayer Times</Text>
          <Text style={getDynamicStyles().errorText}>{error}</Text>
          <Text style={getDynamicStyles().errorSubtext}>
            Make sure you have an internet connection and location services are enabled.
          </Text>
          <TouchableOpacity style={getDynamicStyles().retryButton} onPress={refreshData}>
            <Text style={getDynamicStyles().retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={getDynamicStyles().container}>
      <View style={getDynamicStyles().header}>
        <Text style={getDynamicStyles().headerTitle}>Prayer Times</Text>
      </View>

      <View style={getDynamicStyles().controls}>
        <View style={getDynamicStyles().controlsRow}>
          <TouchableOpacity
            style={getDynamicStyles().calculationButton}
            onPress={() => setShowCalculationPicker(true)}
          >
            <Text style={getDynamicStyles().calculationButtonText}>
              {getCalculationMethodName(calculationMethod)}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={getDynamicStyles().content} showsVerticalScrollIndicator={false}>
        {prayerTimes.length === 0 ? (
          <View style={getDynamicStyles().emptyContainer}>
            <Text style={getDynamicStyles().emptyIcon}>📅</Text>
            <Text style={getDynamicStyles().emptyTitle}>No Prayer Times</Text>
            <Text style={getDynamicStyles().emptyText}>
              No prayer times available for the selected month
            </Text>
          </View>
        ) : (
          renderDailyCards()
        )}
      </ScrollView>

      {renderCalculationPicker()}
    </SafeAreaView>
  );
};

export default PrayerHistoryScreen;
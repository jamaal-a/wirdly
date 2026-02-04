import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  Linking,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import * as MediaLibrary from 'expo-media-library';
import * as Sharing from 'expo-sharing';
import { WirdReminder, RootTabParamList, PrayerTimes } from '../types';
import { reminderService } from '../services/reminderService';
import { themeService } from '../services/themeService';
import { notificationService } from '../services/notificationService';
import { settingsService } from '../services/settingsService';
import WirdSwipeViewer from '../components/WirdSwipeViewer';

const clampNumber = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const extractTimeComponents = (input?: string): { hours24: number; minutes: number } => {
  if (!input) {
    return { hours24: 9, minutes: 0 };
  }

  const trimmed = input.trim();
  if (!trimmed) {
    return { hours24: 9, minutes: 0 };
  }

  const upper = trimmed.toUpperCase();
  const hasMeridiem = upper.includes('AM') || upper.includes('PM');

  try {
    if (hasMeridiem) {
      const cleaned = upper.replace(/\s*(AM|PM)\s*/g, '');
      const [hourStr = '', minuteStr = ''] = cleaned.split(':');
      const hour12 = clampNumber(parseInt(hourStr, 10) || 9, 1, 12);
      const minutes = clampNumber(parseInt(minuteStr, 10) || 0, 0, 59);

      let hours24 = hour12 % 12;
      if (upper.includes('PM')) {
        hours24 += 12;
      }
      if (upper.includes('AM') && hour12 === 12) {
        hours24 = 0;
      }
      return { hours24, minutes };
    }

    const [hourStr = '', minuteStr = ''] = upper.split(':');
    const hours24 = clampNumber(parseInt(hourStr, 10) ?? 9, 0, 23);
    const minutes = clampNumber(parseInt(minuteStr, 10) ?? 0, 0, 59);
    return { hours24, minutes };
  } catch {
    return { hours24: 9, minutes: 0 };
  }
};

const formatComponentsToTimeString = (hours24: number, minutes: number): string => {
  const meridiem = hours24 >= 12 ? 'PM' : 'AM';
  const hours12 = hours24 % 12 === 0 ? 12 : hours24 % 12;
  const formattedHour = hours12.toString().padStart(2, '0');
  const formattedMinute = minutes.toString().padStart(2, '0');
  return `${formattedHour}:${formattedMinute} ${meridiem}`;
};

const normalizeTimeString = (input?: string): string => {
  const { hours24, minutes } = extractTimeComponents(input);
  return formatComponentsToTimeString(hours24, minutes);
};

const timeStringToDate = (input?: string): Date => {
  const { hours24, minutes } = extractTimeComponents(input);
  const date = new Date();
  date.setHours(hours24, minutes, 0, 0);
  return date;
};

type WirdsScreenRouteProp = RouteProp<RootTabParamList, 'Wirds'>;

const WirdsScreen: React.FC = () => {
  const route = useRoute<WirdsScreenRouteProp>();
  const navigation = useNavigation();
  const [reminders, setReminders] = useState<WirdReminder[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [viewModalVisible, setViewModalVisible] = useState(false);
  const [viewingReminder, setViewingReminder] = useState<WirdReminder | null>(null);
  const handledReminderIdRef = useRef<string | undefined>(undefined);
  const [editingReminder, setEditingReminder] = useState<WirdReminder | null>(null);
  const [themeKey, setThemeKey] = useState(0);
  const theme = themeService.getCurrentTheme();
  const themeMode = themeService.getThemeMode();
  const dynamicStyles = getDynamicStyles(theme, themeMode);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<any>(null);
  const [fullScreenImage, setFullScreenImage] = useState<string | null>(null);
  const [swipeViewerVisible, setSwipeViewerVisible] = useState(false);
  const [swipeViewerReminders, setSwipeViewerReminders] = useState<WirdReminder[]>([]);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [timePickerVisible, setTimePickerVisible] = useState(false);
  const [timePickerValue, setTimePickerValue] = useState<Date>(() => timeStringToDate('09:00 AM'));
  const [selectedPrayerFilter, setSelectedPrayerFilter] = useState<keyof PrayerTimes | 'all'>('all');
  const [scrollViewKey, setScrollViewKey] = useState(0);
  const [datePickerType, setDatePickerType] = useState<'gregorian' | 'hijri'>('gregorian');
  const [hijriMonth, setHijriMonth] = useState(1);
  const [hijriDay, setHijriDay] = useState(1);

  // Refresh scroll view when modal closes
  useEffect(() => {
    if (!modalVisible) {
      setScrollViewKey(prev => prev + 1);
    }
  }, [modalVisible]);

  // Listen for theme changes
  useEffect(() => {
    const interval = setInterval(() => {
      const currentSettings = settingsService.getAllSettings();
      const currentTheme = themeService.getCurrentTheme();
      const currentThemeMode = themeService.getThemeMode();
      // Force re-render if theme changed
      if (currentTheme.background !== theme.background || currentThemeMode !== themeMode) {
        setThemeKey(prev => prev + 1);
      }
    }, 500);
    return () => clearInterval(interval);
  }, [theme.background, themeMode]);

  const [newReminder, setNewReminder] = useState({
    title: '',
    description: '',
    category: 'other' as WirdReminder['category'],
    type: 'daily' as WirdReminder['type'],
    time: '09:00 AM',
    dayOfWeek: 0,
    dayOfMonth: 1,
    month: 1,
    prayerTime: 'Fajr' as keyof import('../types').PrayerTimes,
    selectedPrayers: [] as Array<keyof import('../types').PrayerTimes>,
    isActive: true,
    imageUrl: '',
    fileUrl: '',
    linkUrl: '',
    completedDates: [] as string[],
    streakCount: 0,
    totalCompletions: 0,
  });

  useEffect(() => {
    loadReminders();
    requestImagePickerPermission();
  }, []);

  useEffect(() => {
    // Only sync timePickerValue when modal opens, not on every time change
    // This prevents conflicts when user is actively using the picker
    if (modalVisible) {
      try {
        const timeValue = timeStringToDate(newReminder.time);
        setTimePickerValue(timeValue);
      } catch (error) {
        console.warn('Error syncing time picker value:', error);
      }
    } else {
      // Close time picker when main modal closes
      if (timePickerVisible) {
        console.log('Main modal closed, closing time picker');
        setTimePickerVisible(false);
      }
    }
  }, [modalVisible]);

  const formatDateToTimeString = (date: Date): string => {
    return formatComponentsToTimeString(date.getHours(), date.getMinutes());
  };

  const openTimePicker = () => {
    try {
      const timeValue = timeStringToDate(newReminder.time);
      console.log('Opening time picker with time:', newReminder.time, 'Date:', timeValue);
      console.log('Setting timePickerVisible to true');
      setTimePickerValue(timeValue);
      setTimePickerVisible(true);
      console.log('Time picker should now be visible');
    } catch (error) {
      console.error('Error opening time picker:', error);
      // Fallback to current time if parsing fails
      setTimePickerValue(new Date());
      setTimePickerVisible(true);
    }
  };

  const handleTimePickerChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      if (event.type === 'dismissed') {
        setTimePickerVisible(false);
        return;
      }
      if (event.type === 'set' && selectedDate) {
        const formatted = formatDateToTimeString(selectedDate);
        setNewReminder(prev => ({ ...prev, time: formatted }));
        setTimePickerVisible(false);
      }
    } else if (selectedDate) {
      setTimePickerValue(selectedDate);
    }
  };

  const handleTimePickerConfirmIOS = () => {
    const formatted = formatDateToTimeString(timePickerValue);
    setNewReminder(prev => ({ ...prev, time: formatted }));
    setTimePickerVisible(false);
  };

  const handleTimePickerCancelIOS = () => {
    setTimePickerVisible(false);
    setTimePickerValue(timeStringToDate(newReminder.time));
  };

  // Handle navigation from notification
  useEffect(() => {
    const reminderId = route.params?.reminderId;
    
    // Only handle if reminderId exists, reminders are loaded, and we haven't already handled this reminderId
    if (reminderId && reminders.length > 0 && handledReminderIdRef.current !== reminderId) {
      console.log('Opening reminder from notification:', reminderId);
      const reminder = reminders.find(r => r.id === reminderId);
      if (reminder) {
        console.log('Found reminder:', reminder.title);
        console.log('Reminder imageUrl:', reminder.imageUrl);
        console.log('Full reminder object:', JSON.stringify(reminder, null, 2));
        // Open in view mode instead of edit mode
        setViewingReminder(reminder);
        setViewModalVisible(true);
        
        // Mark as handled and clear the route params
        handledReminderIdRef.current = reminderId;
        navigation.setParams({ reminderId: undefined } as any);
      } else {
        console.log('Reminder not found with ID:', reminderId);
        console.log('Available reminders:', reminders.map(r => ({ id: r.id, title: r.title })));
        // Clear params even if reminder not found
        handledReminderIdRef.current = reminderId;
        navigation.setParams({ reminderId: undefined } as any);
      }
    }
    
    // Reset handled reminderId when route params change to a new reminderId
    if (!reminderId) {
      handledReminderIdRef.current = undefined;
    }
  }, [route.params?.reminderId, reminders.length]); // Only run when reminderId changes or reminders are loaded

  // Sync viewingReminder with latest reminder data when reminders change
  useEffect(() => {
    if (viewingReminder && viewModalVisible) {
      const updatedReminder = reminders.find(r => r.id === viewingReminder.id);
      if (updatedReminder && JSON.stringify(updatedReminder) !== JSON.stringify(viewingReminder)) {
        setViewingReminder(updatedReminder);
      }
    }
  }, [reminders, viewModalVisible]);

  const requestImagePickerPermission = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Sorry, we need camera roll permissions to select images!');
    }
  };

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        allowsEditing: false,
        quality: 1,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        setSelectedImage(asset.uri);
        setNewReminder({ ...newReminder, imageUrl: asset.uri });
      }
    } catch (error) {
      console.error('Image picker error:', error);
      Alert.alert('Error', 'Failed to pick image. Please try again.');
    }
  };

  const pickFile = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*',
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const file = result.assets[0];
        setSelectedFile(file);
        setNewReminder({ ...newReminder, fileUrl: file.uri });
      }
    } catch (error) {
      console.error('File picker error:', error);
      Alert.alert('Error', 'Failed to pick file. Please try again.');
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
    setNewReminder({ ...newReminder, imageUrl: '' });
  };

  const removeFile = () => {
    setSelectedFile(null);
    setNewReminder({ ...newReminder, fileUrl: '' });
  };

  const markAsCompleted = (reminderId: string, options: { forceComplete?: boolean } = {}) => {
    const { forceComplete = false } = options;
    const today = new Date().toISOString().split('T')[0];
    let updatedTarget: WirdReminder | undefined;

    const updatedReminders = reminders.map(reminder => {
      if (reminder.id === reminderId) {
        const completedDates = reminder.completedDates || [];
        const isAlreadyCompleted = completedDates.includes(today);

        let newCompletedDates = completedDates;
        let totalCompletions = reminder.totalCompletions || 0;

        if (forceComplete) {
          if (!isAlreadyCompleted) {
            newCompletedDates = [...completedDates, today];
            totalCompletions += 1;
          }
        } else if (!isAlreadyCompleted) {
          newCompletedDates = [...completedDates, today];
          totalCompletions += 1;
        } else {
          newCompletedDates = completedDates.filter(date => date !== today);
          totalCompletions = Math.max(totalCompletions - 1, 0);
        }

        const streakCount = calculateStreak(newCompletedDates);
        const updated = {
          ...reminder,
          completedDates: newCompletedDates,
          streakCount,
          totalCompletions,
        };
        updatedTarget = updated;
        return updated;
      }
      return reminder;
    });

    if (updatedTarget) {
      setReminders(updatedReminders);
      reminderService.updateReminder(
        reminderId,
        {
          completedDates: updatedTarget.completedDates,
          streakCount: updatedTarget.streakCount,
          totalCompletions: updatedTarget.totalCompletions,
        },
        { skipReschedule: true }
      );
    }
  };

  const calculateStreak = (completedDates: string[]): number => {
    if (completedDates.length === 0) return 0;
    
    const sortedDates = completedDates.sort().reverse();
    let streak = 0;
    const today = new Date();
    
    for (let i = 0; i < sortedDates.length; i++) {
      const date = new Date(sortedDates[i]);
      const expectedDate = new Date(today);
      expectedDate.setDate(today.getDate() - i);
      
      if (date.toISOString().split('T')[0] === expectedDate.toISOString().split('T')[0]) {
        streak++;
      } else {
        break;
      }
    }
    
    return streak;
  };

  const isCompletedToday = (reminder: WirdReminder): boolean => {
    const today = new Date().toISOString().split('T')[0];
    return (reminder.completedDates || []).includes(today);
  };

  const getCategoryLabel = (category: WirdReminder['category']): string => {
    const labels = {
      quran: '📖 Quran',
      dhikr: '📿 Dhikr',
      dua: '🤲 Dua',
      other: '📝 Other',
    };
    return labels[category] || '📝 Other';
  };

  const getCategoryColor = (category: WirdReminder['category']): string => {
    const colors = {
      quran: '#2ECC71',
      dhikr: '#E74C3C',
      dua: '#9B59B6',
      other: '#95A5A6',
    };
    return colors[category] || '#95A5A6';
  };

  const loadReminders = () => {
    const allReminders = reminderService.getAllReminders();
    setReminders(allReminders);
  };

  const createReminder = () => {
    if (!newReminder.title.trim()) {
      Alert.alert('Error', 'Please enter a title for the reminder');
      return;
    }

    // Ensure time input is applied before saving (for daily/weekly/monthly/yearly types)
    let reminderToSave = { ...newReminder };
    if (['daily', 'weekly', 'monthly', 'yearly'].includes(newReminder.type)) {
      reminderToSave = { ...reminderToSave, time: normalizeTimeString(newReminder.time) };
    }
    
    // Ensure imageUrl is set from selectedImage if available
    if (selectedImage) {
      reminderToSave = { ...reminderToSave, imageUrl: selectedImage };
    }

    try {
      if (editingReminder) {
        // Update existing reminder
        const updatedReminder = reminderService.updateReminder(editingReminder.id, reminderToSave);
        if (updatedReminder) {
          setReminders(reminders.map(r => r.id === editingReminder.id ? updatedReminder : r));
        }
        setEditingReminder(null);
        Alert.alert('Success', 'Reminder updated successfully!');
      } else {
        // Create new reminder(s)
        if (reminderToSave.type === 'prayer' && reminderToSave.selectedPrayers.length > 0) {
          // Create a separate reminder for each selected prayer
          const createdReminders: WirdReminder[] = [];
          for (const prayerTime of reminderToSave.selectedPrayers) {
            const reminder = reminderService.createReminder({
              ...reminderToSave,
              prayerTime,
            });
            createdReminders.push(reminder);
          }
          setReminders([...reminders, ...createdReminders]);
          Alert.alert('Success', `Created ${createdReminders.length} reminder(s) successfully!`);
        } else {
          // Single reminder for other types
          const reminder = reminderService.createReminder(reminderToSave);
          setReminders([...reminders, reminder]);
          Alert.alert('Success', 'Reminder created successfully!');
        }
      }
      setModalVisible(false);
      resetForm();
      // Force scroll refresh
      setScrollViewKey(prev => prev + 1);
    } catch (error) {
      Alert.alert('Error', 'Failed to save reminder');
    }
  };

  const editReminder = (reminder: WirdReminder) => {
    try {
      const normalizedTime = normalizeTimeString(reminder.time);
      console.log('Editing reminder - Original time:', reminder.time, 'Normalized:', normalizedTime);
      
      setEditingReminder(reminder);
      setSelectedImage(reminder.imageUrl || null);
      setSelectedFile(reminder.fileUrl ? { name: 'Selected File', uri: reminder.fileUrl } : null);
      
      const updatedReminder = {
        title: reminder.title,
        description: reminder.description || '',
        category: reminder.category || 'other',
        type: reminder.type,
        time: normalizedTime,
        dayOfWeek: reminder.dayOfWeek || 0,
        dayOfMonth: reminder.dayOfMonth || 1,
        month: reminder.month || 1,
        prayerTime: reminder.prayerTime || 'Fajr',
        selectedPrayers: reminder.prayerTime ? [reminder.prayerTime] : [],
        isActive: reminder.isActive,
        imageUrl: reminder.imageUrl || '',
        fileUrl: reminder.fileUrl || '',
        linkUrl: reminder.linkUrl || '',
        completedDates: reminder.completedDates || [],
        streakCount: reminder.streakCount || 0,
        totalCompletions: reminder.totalCompletions || 0,
      };
      
      setNewReminder(updatedReminder);
      
      // Update time picker value to match the reminder's time
      const timeValue = timeStringToDate(normalizedTime);
      console.log('Setting time picker value to:', timeValue);
      setTimePickerValue(timeValue);
      setModalVisible(true);
    } catch (error) {
      console.error('Error in editReminder:', error);
      Alert.alert('Error', 'Failed to load reminder for editing');
    }
  };

  const deleteReminder = (id: string) => {
    Alert.alert(
      'Delete Reminder',
      'Are you sure you want to delete this reminder?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            try {
              reminderService.deleteReminder(id);
              setReminders(reminders.filter(r => r.id !== id));
              Alert.alert('Success', 'Reminder deleted successfully!');
            } catch (error) {
              Alert.alert('Error', 'Failed to delete reminder');
            }
          },
        },
      ]
    );
  };

  const resetForm = () => {
    // Close time picker if open
    if (timePickerVisible) {
      setTimePickerVisible(false);
    }
    setEditingReminder(null);
    setSelectedImage(null);
    setSelectedFile(null);
    setNewReminder({
      title: '',
      description: '',
      category: 'other',
      type: 'daily',
      time: '09:00 AM',
      dayOfWeek: 0,
      dayOfMonth: 1,
      month: 1,
      prayerTime: 'Fajr',
      selectedPrayers: [],
      isActive: true,
      imageUrl: '',
      fileUrl: '',
      linkUrl: '',
      completedDates: [] as string[],
      streakCount: 0,
      totalCompletions: 0,
    });
  };

  const toggleReminder = (id: string) => {
    const updated = reminderService.toggleReminder(id);
    if (updated) {
      loadReminders();
    }
  };

  const renderReminderTypeLabel = (type: WirdReminder['type']) => {
    switch (type) {
      case 'prayer':
        return '🕌 Prayer Time';
      case 'daily':
        return '📅 Daily';
      case 'weekly':
        return '📆 Weekly';
      case 'monthly':
        return '📅 Monthly';
      case 'yearly':
        return '🎉 Yearly';
      case 'hourly':
        return '⏰ Every Hour';
      default:
        return type;
    }
  };

  // Example reminders definitions
  const getExampleReminders = () => [
    {
      title: 'Read 100 Astagfirullah/Salawat',
      description: 'Read 100 Astagfirullah or Salawat daily',
      category: 'dhikr' as WirdReminder['category'],
      type: 'daily' as WirdReminder['type'],
      time: '09:00',
    },
    {
      title: 'Remember Allah',
      description: 'Hourly reminder to remember Allah',
      category: 'dhikr' as WirdReminder['category'],
      type: 'hourly' as WirdReminder['type'],
    },
    {
      title: 'Read Quran for 15 mins',
      description: 'Daily reminder to read Quran for 15 minutes',
      category: 'quran' as WirdReminder['category'],
      type: 'daily' as WirdReminder['type'],
      time: '06:00',
    },
    {
      title: 'Morning Dhikr',
      description: 'Start your day with dhikr',
      category: 'dhikr' as WirdReminder['category'],
      type: 'daily' as WirdReminder['type'],
      time: '05:30',
    },
  ];

  const createExampleReminder = (example: any) => {
    const reminder = reminderService.createReminder({
      ...example,
      isActive: true,
    });
    setReminders([...reminders, reminder]);
    return reminder;
  };

  const createAllExampleReminders = () => {
    const examples = getExampleReminders();
    const created = examples.map(example => reminderService.createReminder({
      ...example,
      isActive: true,
    }));
    setReminders([...reminders, ...created]);
    loadReminders();
    Alert.alert('Success', `Created ${created.length} example reminder(s)!`);
  };

  const renderReminderSchedule = (reminder: WirdReminder) => {
    switch (reminder.type) {
      case 'prayer':
        return `At ${reminder.prayerTime} prayer time`;
      case 'daily':
        return `Daily at ${reminder.time}`;
      case 'weekly':
        const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        return `Weekly on ${weekdays[reminder.dayOfWeek || 0]}`;
      case 'monthly':
        return `Monthly on day ${reminder.dayOfMonth}`;
      case 'yearly':
        const months = [
          'January', 'February', 'March', 'April', 'May', 'June',
          'July', 'August', 'September', 'October', 'November', 'December'
        ];
        return `Yearly on ${months[(reminder.month || 1) - 1]} ${reminder.dayOfMonth}`;
      case 'hourly':
        return 'Every hour';
      default:
        return '';
    }
  };

  return (
    <>
    <SafeAreaView key={themeKey} style={dynamicStyles.container}>
      <ScrollView style={dynamicStyles.scrollView}>
        <View style={dynamicStyles.header}>
          <View style={dynamicStyles.headerGradient}>
            <View style={dynamicStyles.headerContent}>
              <Text style={dynamicStyles.title}>Wirds & Reminders</Text>
              <Text style={dynamicStyles.subtitle}>Manage your spiritual practices</Text>
            </View>
          </View>
        </View>

        <View style={dynamicStyles.content}>
          <TouchableOpacity
            style={dynamicStyles.addButton}
            onPress={() => setModalVisible(true)}
            activeOpacity={0.8}
          >
            <View style={dynamicStyles.addButtonGradient}>
              <Text style={dynamicStyles.addButtonIcon}>+</Text>
              <Text style={dynamicStyles.addButtonText}>Add New Reminder</Text>
            </View>
          </TouchableOpacity>

          {/* Example Reminders */}
          {reminders.length === 0 && (
            <View style={dynamicStyles.exampleSection}>
              <View style={dynamicStyles.exampleSectionHeader}>
                <View style={dynamicStyles.sectionTitleContainer}>
                  <Text style={dynamicStyles.sectionTitleIcon}>○</Text>
                  <Text style={dynamicStyles.sectionTitle}>Example Reminders</Text>
                </View>
                <TouchableOpacity
                  style={dynamicStyles.addAllButton}
                  onPress={createAllExampleReminders}
                  activeOpacity={0.7}
                >
                  <Text style={dynamicStyles.addAllButtonText}>Add All</Text>
                </TouchableOpacity>
              </View>
              <Text style={dynamicStyles.exampleSubtitle}>Tap to create these reminders</Text>
              
              {getExampleReminders().map((example, index) => {
                const categoryColors = {
                  dhikr: '#FFF5F5',
                  quran: '#F0F9FF',
                  dua: '#F5F0FF',
                  other: '#F5F5F5',
                };
                const categoryBorders = {
                  dhikr: '#FFE5E5',
                  quran: '#E0F2FE',
                  dua: '#E9D5FF',
                  other: '#E5E5E5',
                };
                const categoryIcons = {
                  dhikr: '○',
                  quran: '○',
                  dua: '○',
                  other: '○',
                };
                const cardBg = categoryColors[example.category] || categoryColors.other;
                const cardBorder = categoryBorders[example.category] || categoryBorders.other;
                const icon = categoryIcons[example.category] || '○';
                return (
                  <TouchableOpacity
                    key={index}
                    style={[
                      dynamicStyles.exampleCard,
                      { backgroundColor: cardBg, borderColor: cardBorder }
                    ]}
                    onPress={() => {
                      createExampleReminder(example);
                      Alert.alert('Success', 'Example reminder created!');
                    }}
                    activeOpacity={0.7}
                  >
                    <View style={dynamicStyles.exampleCardHeader}>
                      <View style={[dynamicStyles.exampleCardIconContainer, { borderColor: getCategoryColor(example.category) }]}>
                        <Text style={[dynamicStyles.exampleCardIcon, { color: getCategoryColor(example.category) }]}>{icon}</Text>
                      </View>
                      <View style={[dynamicStyles.categoryBadgeExample, { backgroundColor: getCategoryColor(example.category) }]}>
                        <Text style={dynamicStyles.categoryBadgeText}>{getCategoryLabel(example.category)}</Text>
                      </View>
                    </View>
                    <Text style={dynamicStyles.exampleCardTitle}>{example.title}</Text>
                    <Text style={dynamicStyles.exampleCardDesc}>{example.description}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}

          {/* Prayer Time Filter */}
          {reminders.some(r => r.type === 'prayer') && (
            <View style={dynamicStyles.filterSection}>
              <Text style={dynamicStyles.sectionTitle}>🔍 Filter by Prayer Time</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={dynamicStyles.filterScroll}>
                <TouchableOpacity
                  style={[
                    dynamicStyles.filterButton,
                    selectedPrayerFilter === 'all' && dynamicStyles.filterButtonActive
                  ]}
                  onPress={() => setSelectedPrayerFilter('all')}
                >
                  <Text style={[
                    dynamicStyles.filterButtonText,
                    selectedPrayerFilter === 'all' && dynamicStyles.filterButtonTextActive
                  ]}>
                    All ({reminders.filter(r => r.type === 'prayer').length})
                  </Text>
                </TouchableOpacity>
                {(['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'] as Array<keyof PrayerTimes>).map((prayerName) => {
                  const count = reminders.filter(
                    r => r.type === 'prayer' && r.prayerTime === prayerName
                  ).length;
                  if (count === 0) return null;

                  return (
                    <TouchableOpacity
                      key={prayerName}
                      style={[
                        dynamicStyles.filterButton,
                        selectedPrayerFilter === prayerName && dynamicStyles.filterButtonActive
                      ]}
                      onPress={() => setSelectedPrayerFilter(prayerName)}
                    >
                      <Text style={[
                        dynamicStyles.filterButtonText,
                        selectedPrayerFilter === prayerName && dynamicStyles.filterButtonTextActive
                      ]}>
                        {prayerName} ({count})
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>
          )}

          {/* Prayer Time Wird Sessions (Swipe Viewer) */}
          {reminders.some(r => r.type === 'prayer') && selectedPrayerFilter === 'all' && (
            <View style={dynamicStyles.sessionSection}>
              <Text style={dynamicStyles.sectionTitle}>📿 Wird Sessions by Prayer</Text>
              {(['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'] as Array<keyof PrayerTimes>).map((prayerName) => {
                const prayerReminders = reminders.filter(
                  r => r.type === 'prayer' && r.prayerTime === prayerName && r.isActive
                );
                if (prayerReminders.length === 0) return null;

                return (
                  <TouchableOpacity
                    key={prayerName}
                    style={dynamicStyles.sessionButton}
                    onPress={() => {
                      setSwipeViewerReminders(prayerReminders);
                      setSwipeViewerVisible(true);
                    }}
                  >
                    <Text style={dynamicStyles.sessionButtonText}>
                      {prayerName} - {prayerReminders.length} wird{prayerReminders.length > 1 ? 's' : ''}
                    </Text>
                    <Text style={dynamicStyles.sessionButtonArrow}>→</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}

          {(() => {
            // Filter reminders based on selected prayer filter
            const filteredReminders = selectedPrayerFilter === 'all' 
              ? reminders 
              : reminders.filter(r => r.type === 'prayer' && r.prayerTime === selectedPrayerFilter);
            
            return filteredReminders.length === 0 ? (
              <View style={dynamicStyles.placeholderCard}>
                <View style={dynamicStyles.placeholderIconContainer}>
                  <Text style={dynamicStyles.placeholderIcon}>○</Text>
                </View>
                <Text style={dynamicStyles.placeholderTitle}>
                  {selectedPrayerFilter === 'all' ? 'No Reminders Yet' : `No ${selectedPrayerFilter} Wirds`}
                </Text>
                <Text style={dynamicStyles.placeholderText}>
                  {selectedPrayerFilter === 'all' 
                    ? 'Start your spiritual journey by creating your first wird reminder.'
                    : `Create a wird reminder for ${selectedPrayerFilter} to see it here.`
                  }
                </Text>
                {selectedPrayerFilter === 'all' && (
                  <TouchableOpacity
                    style={dynamicStyles.placeholderCTA}
                    onPress={() => setModalVisible(true)}
                    activeOpacity={0.8}
                  >
                    <Text style={dynamicStyles.placeholderCTAText}>Create Your First Reminder</Text>
                  </TouchableOpacity>
                )}
              </View>
            ) : (
            <View style={dynamicStyles.remindersContainer}>
              {selectedPrayerFilter !== 'all' && (
                <View style={dynamicStyles.filterHeader}>
                  <Text style={dynamicStyles.filterHeaderText}>
                    📿 {selectedPrayerFilter} Wirds ({filteredReminders.length})
                  </Text>
                  <TouchableOpacity
                    style={dynamicStyles.clearFilterButton}
                    onPress={() => setSelectedPrayerFilter('all')}
                  >
                    <Text style={dynamicStyles.clearFilterButtonText}>Show All</Text>
                  </TouchableOpacity>
                </View>
              )}
              {filteredReminders.map((reminder) => (
                <View key={reminder.id} style={dynamicStyles.reminderCard}>
                  <View style={dynamicStyles.reminderHeader}>
                    <Text style={dynamicStyles.reminderType}>
                      {renderReminderTypeLabel(reminder.type)}
                    </Text>
                    <TouchableOpacity
                      style={[dynamicStyles.statusToggle, reminder.isActive && dynamicStyles.statusActive]}
                      onPress={() => toggleReminder(reminder.id)}
                    >
                      <Text style={dynamicStyles.statusText}>
                        {reminder.isActive ? 'ON' : 'OFF'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                  
                  <View style={dynamicStyles.reminderHeader}>
                    <Text style={dynamicStyles.reminderTitle}>{reminder.title}</Text>
                    <View style={[dynamicStyles.categoryBadge, { backgroundColor: getCategoryColor(reminder.category) }]}>
                      <Text style={dynamicStyles.categoryBadgeText}>{getCategoryLabel(reminder.category)}</Text>
                    </View>
                  </View>
                  
                  {reminder.description && (
                    <Text style={dynamicStyles.reminderDescription}>{reminder.description}</Text>
                  )}
                  
                  <Text style={dynamicStyles.reminderSchedule}>
                    {renderReminderSchedule(reminder)}
                  </Text>

                  {/* Progress Tracking */}
                  <View style={dynamicStyles.progressContainer}>
                    <View style={dynamicStyles.progressRow}>
                      <Text style={dynamicStyles.progressLabel}>Streak: {reminder.streakCount || 0} days</Text>
                      <Text style={dynamicStyles.progressLabel}>Total: {reminder.totalCompletions || 0}</Text>
                    </View>
                    <TouchableOpacity
                      style={[
                        dynamicStyles.completeButton,
                        isCompletedToday(reminder) && dynamicStyles.completeButtonCompleted
                      ]}
                      onPress={() => markAsCompleted(reminder.id)}
                    >
                      <Text style={[
                        dynamicStyles.completeButtonText,
                        isCompletedToday(reminder) && dynamicStyles.completeButtonTextCompleted
                      ]}>
                        {isCompletedToday(reminder) ? '✓ Completed Today' : 'Mark Complete'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                  
                  <View style={dynamicStyles.reminderActions}>
                    <TouchableOpacity
                      style={dynamicStyles.editButton}
                      onPress={() => editReminder(reminder)}
                    >
                      <Text style={dynamicStyles.editButtonText}>Edit</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={dynamicStyles.deleteButton}
                      onPress={() => deleteReminder(reminder.id)}
                    >
                      <Text style={dynamicStyles.deleteButtonText}>Delete</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
            )
          })()}
        </View>
      </ScrollView>

      {/* Add Reminder Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(false);
          resetForm();
          // Force scroll refresh
          setScrollViewKey(prev => prev + 1);
        }}
      >
        <KeyboardAvoidingView 
          style={dynamicStyles.modalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <View style={dynamicStyles.modalContent}>
            {/* Time Picker - Fixed at bottom of modal, outside ScrollView */}
            {timePickerVisible && Platform.OS === 'ios' && (
              <View style={dynamicStyles.timePickerOverlay}>
                <TouchableOpacity
                  style={{ flex: 1 }}
                  activeOpacity={1}
                  onPress={handleTimePickerCancelIOS}
                />
                <View style={dynamicStyles.timePickerWrapper}>
                  <View style={dynamicStyles.iosPickerHeader}>
                    <TouchableOpacity onPress={handleTimePickerCancelIOS}>
                      <Text style={dynamicStyles.iosPickerButton}>Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={handleTimePickerConfirmIOS}>
                      <Text style={[dynamicStyles.iosPickerButton, dynamicStyles.iosPickerButtonPrimary]}>
                        Done
                      </Text>
                    </TouchableOpacity>
                  </View>
                  <View style={dynamicStyles.customTimePickerContainer}>
                    {/* Hour Picker */}
                    <ScrollView
                      style={dynamicStyles.timePickerColumn}
                      showsVerticalScrollIndicator={false}
                      snapToInterval={44}
                      decelerationRate="fast"
                    >
                      {Array.from({ length: 12 }, (_, i) => i + 1).map((hour) => {
                        const isSelected = timePickerValue.getHours() % 12 === (hour % 12);
                        return (
                          <TouchableOpacity
                            key={hour}
                            style={[
                              dynamicStyles.timePickerOption,
                              isSelected && dynamicStyles.timePickerOptionSelected
                            ]}
                            onPress={() => {
                              const newDate = new Date(timePickerValue);
                              const currentHours = timePickerValue.getHours();
                              const isPM = currentHours >= 12;
                              newDate.setHours(isPM ? hour + 12 : hour, timePickerValue.getMinutes());
                              setTimePickerValue(newDate);
                            }}
                          >
                            <Text style={[
                              dynamicStyles.timePickerOptionText,
                              isSelected && dynamicStyles.timePickerOptionTextSelected
                            ]}>
                              {hour.toString().padStart(2, '0')}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </ScrollView>
                    
                    <Text style={dynamicStyles.timePickerSeparator}>:</Text>
                    
                    {/* Minute Picker */}
                    <ScrollView
                      style={dynamicStyles.timePickerColumn}
                      showsVerticalScrollIndicator={false}
                      snapToInterval={44}
                      decelerationRate="fast"
                    >
                      {Array.from({ length: 60 }, (_, i) => i).map((minute) => {
                        const isSelected = timePickerValue.getMinutes() === minute;
                        return (
                          <TouchableOpacity
                            key={minute}
                            style={[
                              dynamicStyles.timePickerOption,
                              isSelected && dynamicStyles.timePickerOptionSelected
                            ]}
                            onPress={() => {
                              const newDate = new Date(timePickerValue);
                              newDate.setMinutes(minute);
                              setTimePickerValue(newDate);
                            }}
                          >
                            <Text style={[
                              dynamicStyles.timePickerOptionText,
                              isSelected && dynamicStyles.timePickerOptionTextSelected
                            ]}>
                              {minute.toString().padStart(2, '0')}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </ScrollView>
                    
                    {/* AM/PM Picker */}
                    <ScrollView
                      style={dynamicStyles.timePickerColumn}
                      showsVerticalScrollIndicator={false}
                      snapToInterval={44}
                      decelerationRate="fast"
                    >
                      {['AM', 'PM'].map((meridiem) => {
                        const isSelected = (timePickerValue.getHours() >= 12) === (meridiem === 'PM');
                        return (
                          <TouchableOpacity
                            key={meridiem}
                            style={[
                              dynamicStyles.timePickerOption,
                              isSelected && dynamicStyles.timePickerOptionSelected
                            ]}
                            onPress={() => {
                              const newDate = new Date(timePickerValue);
                              const currentHours = newDate.getHours();
                              const hours12 = currentHours % 12 || 12;
                              if (meridiem === 'PM') {
                                newDate.setHours(hours12 === 12 ? 12 : hours12 + 12, newDate.getMinutes());
                              } else {
                                newDate.setHours(hours12 === 12 ? 0 : hours12, newDate.getMinutes());
                              }
                              setTimePickerValue(newDate);
                            }}
                          >
                            <Text style={[
                              dynamicStyles.timePickerOptionText,
                              isSelected && dynamicStyles.timePickerOptionTextSelected
                            ]}>
                              {meridiem}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </ScrollView>
                  </View>
                </View>
              </View>
            )}
            
            <ScrollView 
              style={dynamicStyles.modalScrollView}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
            <View style={dynamicStyles.modalHeader}>
              <Text style={dynamicStyles.modalTitle}>
                {editingReminder ? 'Edit Reminder' : 'Create New Reminder'}
              </Text>
              <TouchableOpacity
                style={dynamicStyles.closeButton}
                onPress={() => {
                  setModalVisible(false);
                  resetForm();
                }}
              >
                <Text style={dynamicStyles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>
            
            <TextInput
              style={dynamicStyles.input}
              placeholder="Reminder Title"
              placeholderTextColor={theme.textSecondary}
              value={newReminder.title}
              onChangeText={(text) => setNewReminder({ ...newReminder, title: text })}
            />
            
            <TextInput
              style={dynamicStyles.input}
              placeholder="Description (optional)"
              placeholderTextColor={theme.textSecondary}
              value={newReminder.description}
              onChangeText={(text) => setNewReminder({ ...newReminder, description: text })}
              multiline
            />

            {/* Category Selection */}
            <View style={dynamicStyles.categorySection}>
              <Text style={dynamicStyles.sectionLabel}>Category</Text>
              <View style={dynamicStyles.categoryOptions}>
                {[
                  { key: 'quran', label: '📖 Quran', color: '#2ECC71' },
                  { key: 'dhikr', label: '📿 Dhikr', color: '#E74C3C' },
                  { key: 'dua', label: '🤲 Dua', color: '#9B59B6' },
                  { key: 'other', label: '📝 Other', color: '#95A5A6' },
                ].map((category) => (
                  <TouchableOpacity
                    key={category.key}
                    style={[
                      dynamicStyles.categoryOption,
                      newReminder.category === category.key && dynamicStyles.categoryOptionSelected,
                      { borderColor: category.color }
                    ]}
                    onPress={() => setNewReminder({ ...newReminder, category: category.key as WirdReminder['category'] })}
                  >
                    <Text style={[
                      dynamicStyles.categoryOptionText,
                      newReminder.category === category.key && dynamicStyles.categoryOptionTextSelected
                    ]}>
                      {category.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Image Picker Section */}
            <View style={dynamicStyles.imageSection}>
              <Text style={dynamicStyles.sectionLabel}>Image</Text>
              {selectedImage ? (
                <View style={dynamicStyles.imagePreview}>
                  <Image source={{ uri: selectedImage }} style={dynamicStyles.previewImage} />
                  <View style={dynamicStyles.imageActions}>
                    <TouchableOpacity style={dynamicStyles.imageButton} onPress={pickImage}>
                      <Text style={dynamicStyles.imageButtonText}>Change Image</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[dynamicStyles.imageButton, dynamicStyles.removeButton]} onPress={removeImage}>
                      <Text style={dynamicStyles.imageButtonText}>Remove</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ) : (
                <TouchableOpacity style={dynamicStyles.imagePickerButton} onPress={pickImage}>
                  <Text style={dynamicStyles.imagePickerText}>📷 Select from Gallery</Text>
                </TouchableOpacity>
              )}
            </View>

            <TextInput
              style={dynamicStyles.input}
              placeholder="Image URL (alternative to gallery)"
              placeholderTextColor={theme.textSecondary}
              value={newReminder.imageUrl}
              onChangeText={(text) => {
                setNewReminder({ ...newReminder, imageUrl: text });
                // Also update selectedImage if URL is provided
                if (text) {
                  setSelectedImage(text);
                } else if (!selectedImage || selectedImage === newReminder.imageUrl) {
                  // Clear selectedImage if URL is cleared
                  setSelectedImage(null);
                }
              }}
            />

            {/* File Picker Section */}
            <View style={dynamicStyles.fileSection}>
              <Text style={dynamicStyles.sectionLabel}>File</Text>
              {selectedFile ? (
                <View style={dynamicStyles.filePreview}>
                  <Text style={dynamicStyles.fileName}>📄 {selectedFile.name}</Text>
                  <View style={dynamicStyles.fileActions}>
                    <TouchableOpacity style={dynamicStyles.fileButton} onPress={pickFile}>
                      <Text style={dynamicStyles.fileButtonText}>Change File</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[dynamicStyles.fileButton, dynamicStyles.removeButton]} onPress={removeFile}>
                      <Text style={dynamicStyles.fileButtonText}>Remove</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ) : (
                <TouchableOpacity style={dynamicStyles.filePickerButton} onPress={pickFile}>
                  <Text style={dynamicStyles.filePickerText}>📁 Select File</Text>
                </TouchableOpacity>
              )}
            </View>

            <TextInput
              style={dynamicStyles.input}
              placeholder="File URL (alternative to file picker)"
              placeholderTextColor={theme.textSecondary}
              value={newReminder.fileUrl}
              onChangeText={(text) => setNewReminder({ ...newReminder, fileUrl: text })}
            />

            <TextInput
              style={dynamicStyles.input}
              placeholder="Link URL (optional)"
              placeholderTextColor={theme.textSecondary}
              value={newReminder.linkUrl}
              onChangeText={(text) => setNewReminder({ ...newReminder, linkUrl: text })}
            />

            <View style={dynamicStyles.typeSelector}>
              <Text style={dynamicStyles.label}>Reminder Type:</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {(['prayer', 'daily', 'weekly', 'monthly', 'yearly', 'hourly'] as const).map((type) => (
                  <TouchableOpacity
                    key={type}
                    style={[
                      dynamicStyles.typeOption,
                      newReminder.type === type && dynamicStyles.typeOptionSelected
                    ]}
                    onPress={() => setNewReminder({ ...newReminder, type })}
                  >
                    <Text style={[
                      dynamicStyles.typeOptionText,
                      newReminder.type === type && dynamicStyles.typeOptionTextSelected
                    ]}>
                      {renderReminderTypeLabel(type)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* Conditional fields based on type */}
            {newReminder.type === 'prayer' && (
              <View style={dynamicStyles.fieldGroup}>
                <Text style={dynamicStyles.label}>Prayer Times (Select one or more):</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {(['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'] as const).map((prayer) => {
                    const isSelected = newReminder.selectedPrayers.includes(prayer);
                    return (
                      <TouchableOpacity
                        key={prayer}
                        style={[
                          dynamicStyles.prayerOption,
                          isSelected && dynamicStyles.prayerOptionSelected
                        ]}
                        onPress={() => {
                          const selected = newReminder.selectedPrayers;
                          if (isSelected) {
                            setNewReminder({ 
                              ...newReminder, 
                              selectedPrayers: selected.filter(p => p !== prayer),
                              prayerTime: prayer // Keep last selected as primary
                            });
                          } else {
                            setNewReminder({ 
                              ...newReminder, 
                              selectedPrayers: [...selected, prayer],
                              prayerTime: prayer
                            });
                          }
                        }}
                      >
                        <Text style={[
                          dynamicStyles.prayerOptionText,
                          isSelected && dynamicStyles.prayerOptionTextSelected
                        ]}>
                          {prayer} {isSelected && '✓'}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              </View>
            )}

            {newReminder.type === 'daily' && (
              <View style={dynamicStyles.fieldGroup}>
                <Text style={dynamicStyles.label}>Time:</Text>
                <TouchableOpacity
                  style={[dynamicStyles.input, dynamicStyles.timePickerInput]}
                  activeOpacity={0.7}
                  onPress={() => {
                    console.log('Time picker button pressed. Current time:', newReminder.time);
                    openTimePicker();
                  }}
                >
                  <Text style={dynamicStyles.timePickerText}>{normalizeTimeString(newReminder.time)}</Text>
                </TouchableOpacity>
              </View>
            )}

            {newReminder.type === 'weekly' && (
              <View style={dynamicStyles.fieldGroup}>
                <Text style={dynamicStyles.label}>Day of Week:</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, index) => (
                    <TouchableOpacity
                      key={day}
                      style={[
                        dynamicStyles.dayOption,
                        newReminder.dayOfWeek === index && dynamicStyles.dayOptionSelected
                      ]}
                      onPress={() => setNewReminder({ ...newReminder, dayOfWeek: index })}
                    >
                      <Text style={[
                        dynamicStyles.dayOptionText,
                        newReminder.dayOfWeek === index && dynamicStyles.dayOptionTextSelected
                      ]}>
                        {day}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}

            {(newReminder.type === 'weekly' || newReminder.type === 'monthly' || newReminder.type === 'yearly') && (
              <View style={dynamicStyles.fieldGroup}>
                <Text style={dynamicStyles.label}>Time:</Text>
                <TouchableOpacity
                  style={[dynamicStyles.input, dynamicStyles.timePickerInput]}
                  activeOpacity={0.7}
                  onPress={() => {
                    console.log('Time picker button pressed. Current time:', newReminder.time);
                    openTimePicker();
                  }}
                >
                  <Text style={dynamicStyles.timePickerText}>{normalizeTimeString(newReminder.time)}</Text>
                </TouchableOpacity>
              </View>
            )}

            {newReminder.type === 'monthly' && (
              <View style={dynamicStyles.fieldGroup}>
                <Text style={dynamicStyles.label}>Day of Month:</Text>
                <TouchableOpacity
                  style={dynamicStyles.timeButton}
                  onPress={() => setShowDatePicker(true)}
                >
                  <Text style={dynamicStyles.timeButtonText}>
                    Day {newReminder.dayOfMonth}
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            {newReminder.type === 'yearly' && (
              <View style={dynamicStyles.fieldGroup}>
                <Text style={dynamicStyles.label}>Day & Month:</Text>
                <TouchableOpacity
                  style={dynamicStyles.timeButton}
                  onPress={() => setShowDatePicker(true)}
                >
                  <Text style={dynamicStyles.timeButtonText}>
                    {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][newReminder.month - 1]} {newReminder.dayOfMonth}
                  </Text>
                </TouchableOpacity>
              </View>
            )}


            </ScrollView>

            {/* Date Picker - Bottom Overlay (similar to time picker) */}
            {showDatePicker && (
              <View style={dynamicStyles.timePickerOverlay}>
                <TouchableOpacity
                  style={{ flex: 1 }}
                  activeOpacity={1}
                  onPress={() => setShowDatePicker(false)}
                />
                <View style={dynamicStyles.timePickerWrapper}>
                  <View style={dynamicStyles.iosPickerHeader}>
                    <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                      <Text style={dynamicStyles.iosPickerButton}>Cancel</Text>
                    </TouchableOpacity>
                    <Text style={dynamicStyles.iosPickerTitle}>
                      {newReminder.type === 'monthly' ? 'Select Day of Month' : 'Select Date'}
                    </Text>
                    <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                      <Text style={[dynamicStyles.iosPickerButton, dynamicStyles.iosPickerButtonPrimary]}>
                        Done
                      </Text>
                    </TouchableOpacity>
                  </View>
                  
                  <View style={{ padding: 20, maxHeight: 400 }}>
                    {newReminder.type === 'monthly' ? (
                      /* Month Picker - just day 1-31 */
                      <>
                        <Text style={[dynamicStyles.datePickerSectionTitle, { marginBottom: 20, textAlign: 'center' }]}>
                          Reminds on this day every month
                        </Text>
                        <ScrollView 
                          horizontal 
                          showsHorizontalScrollIndicator={false}
                          contentContainerStyle={{ paddingHorizontal: 10 }}
                        >
                          {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
                            <TouchableOpacity
                              key={day}
                              style={[
                                dynamicStyles.dateOption,
                                newReminder.dayOfMonth === day && dynamicStyles.dateOptionSelected,
                              ]}
                              onPress={() => {
                                setNewReminder({ ...newReminder, dayOfMonth: day });
                                setShowDatePicker(false);
                              }}
                            >
                              <Text style={[
                                dynamicStyles.dateOptionText,
                                newReminder.dayOfMonth === day && dynamicStyles.dateOptionTextSelected,
                              ]}>
                                {day}
                              </Text>
                            </TouchableOpacity>
                          ))}
                        </ScrollView>
                      </>
                    ) : (
                      /* Yearly Picker - month + day with hijri option */
                      <ScrollView showsVerticalScrollIndicator={false}>
                        {/* Date Type Toggle */}
                        <View style={{ flexDirection: 'row', marginBottom: 20, gap: 10 }}>
                          <TouchableOpacity
                            style={[
                              dynamicStyles.dateTypeButton,
                              datePickerType === 'gregorian' && dynamicStyles.dateTypeButtonSelected,
                            ]}
                            onPress={() => setDatePickerType('gregorian')}
                          >
                            <Text style={[
                              dynamicStyles.dateTypeButtonText,
                              datePickerType === 'gregorian' && dynamicStyles.dateTypeButtonTextSelected,
                            ]}>
                              Gregorian
                            </Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={[
                              dynamicStyles.dateTypeButton,
                              datePickerType === 'hijri' && dynamicStyles.dateTypeButtonSelected,
                            ]}
                            onPress={() => setDatePickerType('hijri')}
                          >
                            <Text style={[
                              dynamicStyles.dateTypeButtonText,
                              datePickerType === 'hijri' && dynamicStyles.dateTypeButtonTextSelected,
                            ]}>
                              Hijri
                            </Text>
                          </TouchableOpacity>
                        </View>

                        {datePickerType === 'gregorian' ? (
                          <>
                            <Text style={dynamicStyles.datePickerSectionTitle}>
                              Select Month
                            </Text>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 30 }}>
                              {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map((month, index) => (
                                <TouchableOpacity
                                  key={month}
                                  style={[
                                    dynamicStyles.dateOption,
                                    newReminder.month === index + 1 && dynamicStyles.dateOptionSelected,
                                  ]}
                                  onPress={() => setNewReminder({ ...newReminder, month: index + 1 })}
                                >
                                  <Text style={[
                                    dynamicStyles.dateOptionText,
                                    newReminder.month === index + 1 && dynamicStyles.dateOptionTextSelected,
                                  ]}>
                                    {month}
                                  </Text>
                                </TouchableOpacity>
                              ))}
                            </ScrollView>
                            
                            <Text style={dynamicStyles.datePickerSectionTitle}>
                              Select Day
                            </Text>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                              {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
                                <TouchableOpacity
                                  key={day}
                                  style={[
                                    dynamicStyles.dateOption,
                                    newReminder.dayOfMonth === day && dynamicStyles.dateOptionSelected,
                                  ]}
                                  onPress={() => {
                                    setNewReminder({ ...newReminder, dayOfMonth: day });
                                    setShowDatePicker(false);
                                  }}
                                >
                                  <Text style={[
                                    dynamicStyles.dateOptionText,
                                    newReminder.dayOfMonth === day && dynamicStyles.dateOptionTextSelected,
                                  ]}>
                                    {day}
                                  </Text>
                                </TouchableOpacity>
                              ))}
                            </ScrollView>
                          </>
                        ) : (
                          <>
                            <Text style={dynamicStyles.datePickerSectionTitle}>
                              Select Hijri Month
                            </Text>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 30 }}>
                              {['Muharram', 'Safar', 'Rabi al-Awwal', 'Rabi al-Thani', 'Jumada al-Awwal', 'Jumada al-Thani', 'Rajab', 'Shaban', 'Ramadan', 'Shawwal', 'Dhu al-Qadah', 'Dhu al-Hijjah'].map((month, index) => (
                                <TouchableOpacity
                                  key={month}
                                  style={[
                                    dynamicStyles.dateOption,
                                    hijriMonth === index + 1 && dynamicStyles.dateOptionSelected,
                                  ]}
                                  onPress={() => setHijriMonth(index + 1)}
                                >
                                  <Text style={[
                                    dynamicStyles.dateOptionText,
                                    hijriMonth === index + 1 && dynamicStyles.dateOptionTextSelected,
                                  ]}>
                                    {month}
                                  </Text>
                                </TouchableOpacity>
                              ))}
                            </ScrollView>
                            
                            <Text style={dynamicStyles.datePickerSectionTitle}>
                              Select Hijri Day
                            </Text>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                              {Array.from({ length: 30 }, (_, i) => i + 1).map((day) => (
                                <TouchableOpacity
                                  key={day}
                                  style={[
                                    dynamicStyles.dateOption,
                                    hijriDay === day && dynamicStyles.dateOptionSelected,
                                  ]}
                                  onPress={() => {
                                    setHijriDay(day);
                                    setNewReminder({ ...newReminder, dayOfMonth: day, month: hijriMonth });
                                    setShowDatePicker(false);
                                  }}
                                >
                                  <Text style={[
                                    dynamicStyles.dateOptionText,
                                    hijriDay === day && dynamicStyles.dateOptionTextSelected,
                                  ]}>
                                    {day}
                                  </Text>
                                </TouchableOpacity>
                              ))}
                            </ScrollView>
                          </>
                        )}
                      </ScrollView>
                    )}
                  </View>
                </View>
              </View>
            )}
            
            <View style={dynamicStyles.modalActions}>
              <TouchableOpacity
                style={dynamicStyles.cancelButton}
                onPress={() => {
                  // Close time picker first if open
                  if (timePickerVisible) {
                    setTimePickerVisible(false);
                  }
                  setModalVisible(false);
                  resetForm();
                }}
              >
                <Text style={dynamicStyles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={dynamicStyles.createButton}
                onPress={() => {
                  // Close time picker first if open
                  if (timePickerVisible) {
                    setTimePickerVisible(false);
                  }
                  createReminder();
                }}
              >
                <Text style={dynamicStyles.createButtonText}>
                  {editingReminder ? 'Update' : 'Create'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Time Picker */}
      {timePickerVisible && Platform.OS === 'android' && (
        <DateTimePicker
          value={timePickerValue}
          mode="time"
          display="default"
          is24Hour={false}
          onChange={handleTimePickerChange}
        />
      )}

      {/* iOS time picker is now rendered inside the main modal above */}

      {/* Beautiful Notification Detail Modal */}
      <Modal
        visible={viewModalVisible}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setViewModalVisible(false)}
      >
        <TouchableOpacity
          style={dynamicStyles.notificationModalOverlay}
          activeOpacity={1}
          onPress={() => setViewModalVisible(false)}
        >
          <TouchableOpacity activeOpacity={1} onPress={(e) => e.stopPropagation()}>
            <View style={dynamicStyles.notificationModalContent}>
              {viewingReminder && (
                <>
                  {/* Header with Close Button */}
                  <View style={dynamicStyles.notificationHeader}>
                    <TouchableOpacity
                      onPress={() => setViewModalVisible(false)}
                      style={dynamicStyles.notificationCloseButton}
                    >
                      <Text style={dynamicStyles.notificationCloseButtonText}>✕</Text>
                    </TouchableOpacity>
                  </View>

                  {/* Image Section - Large and Beautiful */}
                  {viewingReminder.imageUrl ? (
                    <TouchableOpacity
                      activeOpacity={0.9}
                      onPress={() => {
                        if (viewingReminder.imageUrl) {
                          setFullScreenImage(viewingReminder.imageUrl);
                        }
                      }}
                      style={dynamicStyles.notificationImageContainer}
                    >
                      <Image
                        source={{ uri: viewingReminder.imageUrl }}
                        style={dynamicStyles.notificationImage}
                        resizeMode="cover"
                        onError={(error) => {
                          console.error('❌ Error loading notification image:', error?.nativeEvent?.error ?? error);
                          console.error('❌ Image URL:', viewingReminder.imageUrl);
                          console.error('❌ Image URL type:', typeof viewingReminder.imageUrl);
                          console.error('❌ Image URL length:', viewingReminder.imageUrl?.length);
                          console.error('❌ Full reminder object:', JSON.stringify(viewingReminder, null, 2));
                        }}
                        onLoadStart={() => {
                          console.log('🔄 Starting to load notification image:', viewingReminder.imageUrl);
                        }}
                        onLoad={() => {
                          console.log('✅ Notification image loaded successfully:', viewingReminder.imageUrl);
                        }}
                        onLoadEnd={() => {
                          console.log('🏁 Image load ended:', viewingReminder.imageUrl);
                        }}
                      />
                    </TouchableOpacity>
                  ) : null}

                  <ScrollView 
                    style={dynamicStyles.notificationScrollContent}
                    showsVerticalScrollIndicator={false}
                  >
                    {/* Title - Large and Prominent */}
                    <Text style={dynamicStyles.notificationTitle}>{viewingReminder.title}</Text>

                    {/* Time - Beautifully Formatted */}
                    {viewingReminder.time && (
                      <View style={dynamicStyles.notificationTimeContainer}>
                        <Text style={dynamicStyles.notificationTimeIcon}>🕐</Text>
                        <Text style={dynamicStyles.notificationTime}>{viewingReminder.time}</Text>
                      </View>
                    )}

                    {/* Description */}
                    {viewingReminder.description && (
                      <Text style={dynamicStyles.notificationDescription}>
                        {viewingReminder.description}
                      </Text>
                    )}

                    {/* Link Section */}
                    {viewingReminder.linkUrl && (
                      <TouchableOpacity
                        style={dynamicStyles.notificationLinkButton}
                        onPress={async () => {
                          if (viewingReminder.linkUrl) {
                            const canOpen = await Linking.canOpenURL(viewingReminder.linkUrl);
                            if (canOpen) {
                              await Linking.openURL(viewingReminder.linkUrl);
                            } else {
                              Alert.alert('Cannot Open Link', viewingReminder.linkUrl);
                            }
                          }
                        }}
                      >
                        <Text style={dynamicStyles.notificationLinkIcon}>🔗</Text>
                        <Text style={dynamicStyles.notificationLinkText}>Open Link</Text>
                      </TouchableOpacity>
                    )}

                    {/* File Section */}
                    {viewingReminder.fileUrl && (
                      <TouchableOpacity
                        style={dynamicStyles.notificationLinkButton}
                        onPress={async () => {
                          if (viewingReminder.fileUrl) {
                            const canOpen = await Linking.canOpenURL(viewingReminder.fileUrl);
                            if (canOpen) {
                              await Linking.openURL(viewingReminder.fileUrl);
                            } else {
                              Alert.alert('Cannot Open File', viewingReminder.fileUrl);
                            }
                          }
                        }}
                      >
                        <Text style={dynamicStyles.notificationLinkIcon}>📄</Text>
                        <Text style={dynamicStyles.notificationLinkText}>Open File</Text>
                      </TouchableOpacity>
                    )}
                  </ScrollView>

                  {/* Done Button */}
                  <View style={dynamicStyles.notificationActionsContainer}>
                    <TouchableOpacity
                      style={dynamicStyles.notificationDoneButton}
                      onPress={() => {
                        markAsCompleted(viewingReminder.id, { forceComplete: true });
                        reminderService.markTriggered(viewingReminder.id);
                        setViewModalVisible(false);
                      }}
                    >
                      <Text style={dynamicStyles.notificationDoneButtonText}>Mark as Done</Text>
                    </TouchableOpacity>
                  </View>
                </>
              )}
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      {/* Full Screen Image Modal */}
      <Modal
        visible={fullScreenImage !== null}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setFullScreenImage(null)}
      >
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.95)', justifyContent: 'center', alignItems: 'center' }}>
          <TouchableOpacity
            style={{ position: 'absolute', top: 50, right: 20, zIndex: 10 }}
            onPress={() => setFullScreenImage(null)}
          >
            <Text style={{ color: 'white', fontSize: 32, fontWeight: 'bold' }}>✕</Text>
          </TouchableOpacity>
          
          {fullScreenImage && (
            <Image
              source={{ uri: fullScreenImage }}
              style={{ width: Dimensions.get('window').width, height: Dimensions.get('window').height }}
              resizeMode="contain"
            />
          )}
        </View>
      </Modal>

      {/* Wird Swipe Viewer */}
      <WirdSwipeViewer
        visible={swipeViewerVisible}
        reminders={swipeViewerReminders}
        onClose={() => setSwipeViewerVisible(false)}
        onComplete={(id) => {
          markAsCompleted(id);
        }}
      />



    </SafeAreaView>

      {/* Manual time picker modal removed in favor of inline inputs */}
  </>
  );
};

const getDynamicStyles = (theme: any, themeMode: 'original' | 'dark' | 'calm' = 'original') => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: themeMode === 'original' ? '#F9F7F4' : theme.background,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    overflow: 'hidden',
  },
  headerGradient: {
    backgroundColor: theme.primary,
    paddingTop: 20,
    paddingBottom: 32,
    paddingHorizontal: 20,
    borderBottomWidth: 0,
  },
  headerContent: {
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: 'white',
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.95)',
    fontWeight: '400',
    letterSpacing: 0.3,
  },
  content: {
    padding: 24,
    paddingTop: 20,
  },
  addButton: {
    borderRadius: 16,
    marginBottom: 24,
    shadowColor: '#6C5CE7',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    overflow: 'hidden',
  },
  addButtonGradient: {
    backgroundColor: '#6C5CE7',
    paddingVertical: 18,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 0,
  },
  addButtonIcon: {
    color: 'white',
    fontSize: 24,
    fontWeight: '300',
    marginRight: 8,
  },
  addButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  placeholderCard: {
    backgroundColor: theme.card,
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 20,
    shadowColor: theme.shadow,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 1,
    borderColor: themeMode === 'original' ? '#F0EDE8' : theme.border,
  },
  placeholderIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: themeMode === 'original' ? '#FFF5E6' : theme.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    borderWidth: 2,
    borderColor: themeMode === 'original' ? '#FFE5B4' : theme.border,
  },
  placeholderIcon: {
    fontSize: 48,
    color: theme.primary,
    fontWeight: '300',
  },
  placeholderTitle: {
    fontSize: 26,
    fontWeight: '700',
    color: theme.text,
    marginBottom: 12,
    textAlign: 'center',
    letterSpacing: 0.3,
  },
  placeholderText: {
    fontSize: 16,
    color: theme.textSecondary,
    textAlign: 'center',
    lineHeight: 26,
    marginBottom: 24,
    paddingHorizontal: 8,
    fontWeight: '400',
  },
  placeholderCTA: {
    backgroundColor: theme.primary,
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 12,
    shadowColor: theme.primary,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  placeholderCTAText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  remindersContainer: {
    gap: 16,
  },
  reminderCard: {
    backgroundColor: theme.card,
    borderRadius: 16,
    padding: 18,
    marginBottom: 16,
    shadowColor: theme.shadow,
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 6,
    borderWidth: 1,
    borderColor: themeMode === 'original' ? '#F0EDE8' : theme.border,
  },
  reminderType: {
    fontSize: 14,
    color: '#6C5CE7',
    fontWeight: '600',
  },
  statusToggle: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#E0E0E0',
  },
  statusActive: {
    backgroundColor: '#4CAF50',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.textSecondary,
  },
  reminderTitle: {
    fontSize: 19,
    fontWeight: '700',
    letterSpacing: 0.2,
    color: theme.text,
    marginBottom: 8,
  },
  reminderDescription: {
    fontSize: 15,
    color: theme.text,
    marginBottom: 10,
    lineHeight: 22,
    fontWeight: '400',
  },
  reminderSchedule: {
    fontSize: 14,
    color: '#6C5CE7',
    fontWeight: '500',
    marginBottom: 12,
  },
  reminderActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
  },
  editButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#4A90E2',
    borderRadius: 8,
  },
  editButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  deleteButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#FF6B6B',
    borderRadius: 8,
  },
  deleteButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: theme.card,
    borderRadius: 16,
    width: '90%',
    maxHeight: '80%',
    position: 'relative',
    overflow: 'hidden',
  },
  modalScrollView: {
    maxHeight: '70%',
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.text,
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 16,
    color: theme.text,
    backgroundColor: theme.surface,
  },
  timeButton: {
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: 8,
    padding: 16,
    backgroundColor: theme.surface,
    marginBottom: 16,
    alignItems: 'center',
  },
  timeButtonText: {
    fontSize: 24,
    fontWeight: '600',
    color: '#007AFF',
    marginBottom: 4,
  },
  timeButtonSubtext: {
    fontSize: 14,
    color: '#8E8E93',
    fontWeight: '400',
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.text,
    marginBottom: 8,
  },
  typeSelector: {
    marginBottom: 16,
  },
  typeOption: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F0F0F0',
    marginRight: 8,
  },
  typeOptionSelected: {
    backgroundColor: '#6C5CE7',
  },
  typeOptionText: {
    fontSize: 14,
    color: '#2A2A2A',
  },
  typeOptionTextSelected: {
    color: 'white',
  },
  fieldGroup: {
    marginBottom: 16,
  },
  prayerOption: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F0F0F0',
    marginRight: 8,
  },
  prayerOptionSelected: {
    backgroundColor: '#6C5CE7',
  },
  prayerOptionText: {
    fontSize: 14,
    color: '#2A2A2A',
  },
  prayerOptionTextSelected: {
    color: 'white',
  },
  dayOption: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F0F0F0',
    marginRight: 8,
    minWidth: 50,
    alignItems: 'center',
  },
  dayOptionSelected: {
    backgroundColor: '#6C5CE7',
  },
  dayOptionText: {
    fontSize: 14,
    color: '#2A2A2A',
  },
  dayOptionTextSelected: {
    color: 'white',
  },
  monthOption: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F0F0F0',
    marginRight: 8,
    minWidth: 50,
    alignItems: 'center',
  },
  monthOptionSelected: {
    backgroundColor: '#6C5CE7',
  },
  monthOptionText: {
    fontSize: 14,
    color: '#2A2A2A',
  },
  monthOptionTextSelected: {
    color: 'white',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingBottom: 24,
    paddingTop: 16,
  },
  cancelButton: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    backgroundColor: '#E0E0E0',
    marginRight: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: theme.textSecondary,
    fontSize: 16,
    fontWeight: '600',
  },
  createButton: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    backgroundColor: '#6C5CE7',
    marginLeft: 8,
    alignItems: 'center',
  },
  createButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  closeButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 18,
    color: theme.textSecondary,
    fontWeight: 'bold',
  },
  imageSection: {
    marginBottom: 16,
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.text,
    marginBottom: 8,
  },
  imagePreview: {
    alignItems: 'center',
  },
  previewImage: {
    width: 200,
    height: 150,
    borderRadius: 8,
    marginBottom: 8,
  },
  imageActions: {
    flexDirection: 'row',
    gap: 8,
  },
  imageButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#4A90E2',
    borderRadius: 6,
  },
  removeButton: {
    backgroundColor: '#E74C3C',
  },
  imageButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  imagePickerButton: {
    padding: 16,
    borderWidth: 2,
    borderColor: '#4A90E2',
    borderStyle: 'dashed',
    borderRadius: 8,
    alignItems: 'center',
  },
  imagePickerText: {
    color: '#4A90E2',
    fontSize: 14,
    fontWeight: '500',
  },
  fileSection: {
    marginBottom: 16,
  },
  filePreview: {
    alignItems: 'center',
  },
  fileName: {
    fontSize: 14,
    color: theme.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  fileActions: {
    flexDirection: 'row',
    gap: 8,
  },
  fileButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#4A90E2',
    borderRadius: 6,
  },
  fileButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  filePickerButton: {
    padding: 16,
    borderWidth: 2,
    borderColor: '#4A90E2',
    borderStyle: 'dashed',
    borderRadius: 8,
    alignItems: 'center',
  },
  filePickerText: {
    color: '#4A90E2',
    fontSize: 14,
    fontWeight: '500',
  },
  categorySection: {
    marginBottom: 16,
  },
  categoryOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryOption: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 2,
    backgroundColor: 'white',
  },
  categoryOptionSelected: {
    backgroundColor: '#4A90E2',
  },
  categoryOptionText: {
    fontSize: 12,
    fontWeight: '500',
    color: theme.text,
  },
  categoryOptionTextSelected: {
    color: 'white',
  },
  reminderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  categoryBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: 'white',
  },
  progressContainer: {
    marginTop: 12,
    padding: 12,
    backgroundColor: themeMode === 'dark' ? theme.surface : themeMode === 'calm' ? theme.surface : '#f8f9fa',
    borderRadius: 8,
  },
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 12,
    color: themeMode === 'dark' ? theme.text : theme.textSecondary,
    fontWeight: '500',
  },
  completeButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    backgroundColor: themeMode === 'dark' ? theme.surface : '#4A90E2',
    alignItems: 'center',
  },
  completeButtonCompleted: {
    backgroundColor: themeMode === 'dark' ? theme.surface : '#27AE60',
  },
  completeButtonText: {
    color: themeMode === 'dark' ? theme.text : 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  completeButtonTextCompleted: {
    color: themeMode === 'dark' ? theme.text : 'white',
  },
  viewText: {
    fontSize: 16,
    color: theme.text,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: theme.cardBackground,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.border,
  },
  viewImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginTop: 8,
    marginBottom: 16,
  },
  linkButton: {
    backgroundColor: '#4A90E2',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 16,
  },
  linkButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  sessionSection: {
    width: '100%',
    marginVertical: 20,
  },
  sessionButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#4A90E2',
    padding: 18,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#4A90E2',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  sessionButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '700',
  },
  sessionButtonArrow: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  exampleSection: {
    width: '100%',
    marginVertical: 24,
  },
  exampleSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionTitleIcon: {
    fontSize: 20,
    color: theme.textSecondary,
    fontWeight: '300',
  },
  exampleSubtitle: {
    fontSize: 15,
    color: theme.textSecondary,
    marginBottom: 20,
    paddingHorizontal: 4,
    fontWeight: '400',
    lineHeight: 22,
  },
  exampleCard: {
    borderRadius: 16,
    padding: 18,
    marginBottom: 14,
    shadowColor: theme.shadow,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 6,
    borderWidth: 1.5,
  },
  exampleCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  exampleCardIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
  },
  exampleCardIcon: {
    fontSize: 20,
    fontWeight: '300',
  },
  categoryBadgeExample: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  exampleCardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.text,
    marginBottom: 6,
    letterSpacing: 0.2,
  },
  exampleCardDesc: {
    fontSize: 14,
    color: theme.textSecondary,
    lineHeight: 22,
    fontWeight: '400',
  },
  addAllButton: {
    backgroundColor: '#6C5CE7',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 10,
    shadowColor: '#6C5CE7',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 4,
  },
  addAllButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.text,
    letterSpacing: 0.3,
  },
  filterSection: {
    width: '100%',
    marginVertical: 20,
  },
  filterScroll: {
    marginTop: 8,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#F0F0F0',
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  filterButtonActive: {
    backgroundColor: '#6C5CE7',
    borderColor: '#6C5CE7',
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  filterButtonTextActive: {
    color: 'white',
  },
  filterHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  filterHeaderText: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.text,
  },
  clearFilterButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#E0E0E0',
  },
  clearFilterButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  timePickerBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  timePickerContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    minHeight: 320,
    paddingBottom: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  timePickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 0.5,
    borderBottomColor: '#E5E5EA',
    backgroundColor: '#F9F9FA',
  },
  timePickerButton: {
    minWidth: 60,
    paddingVertical: 4,
  },
  timePickerCancel: {
    fontSize: 17,
    color: '#FF3B30',
    fontWeight: '400',
  },
  timePickerTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#000000',
  },
  timePickerDone: {
    fontSize: 17,
    color: '#007AFF',
    fontWeight: '600',
  },
  timePickerContent: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 20,
    alignItems: 'center',
  },
  timePickerInput: {
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: theme.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timePickerText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.text,
  },
  timePickerOverlay: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
    zIndex: 1000,
    elevation: 10,
  },
  timePickerWrapper: {
    backgroundColor: theme.card,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 20,
    paddingTop: 8,
    width: '100%',
    minHeight: 280,
  },
  customTimePickerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    height: 216,
    width: '100%',
    backgroundColor: theme.card,
    paddingVertical: 20,
  },
  timePickerColumn: {
    flex: 1,
    maxHeight: 216,
  },
  timePickerOption: {
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 8,
  },
  timePickerOptionSelected: {
    backgroundColor: theme.primary + '20',
  },
  timePickerOptionText: {
    fontSize: 20,
    color: theme.textSecondary,
    fontWeight: '400',
  },
  timePickerOptionTextSelected: {
    fontSize: 24,
    color: theme.primary,
    fontWeight: '600',
  },
  timePickerSeparator: {
    fontSize: 24,
    color: theme.text,
    fontWeight: '600',
    marginHorizontal: 8,
  },
  dateOption: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    marginRight: 12,
    marginBottom: 12,
    backgroundColor: themeMode === 'dark' ? theme.surface : '#F0F0F0',
    minWidth: 50,
    alignItems: 'center',
  },
  dateOptionSelected: {
    backgroundColor: theme.primary,
  },
  dateOptionText: {
    fontSize: 16,
    color: themeMode === 'dark' ? theme.text : '#333',
    fontWeight: '600',
  },
  dateOptionTextSelected: {
    color: 'white',
  },
  dateTypeButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: theme.surface,
    borderWidth: 1,
    borderColor: theme.border,
    alignItems: 'center',
  },
  dateTypeButtonSelected: {
    backgroundColor: theme.primary,
    borderColor: theme.primary,
  },
  dateTypeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.text,
  },
  dateTypeButtonTextSelected: {
    color: 'white',
  },
  datePickerSectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    color: theme.text,
  },
  iosPickerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'flex-end',
  },
  iosPickerContainer: {
    backgroundColor: theme.card,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 16,
  },
  iosPickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
  },
  iosPickerButton: {
    fontSize: 16,
    color: theme.textSecondary,
  },
  iosPickerButtonPrimary: {
    color: theme.primary,
    fontWeight: '600',
  },
  iosPickerTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: theme.text,
  },
  // Beautiful Notification Modal Styles
  notificationModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  notificationModalContent: {
    backgroundColor: theme.card,
    borderRadius: 24,
    width: '100%',
    maxWidth: 500,
    maxHeight: '90%',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  notificationHeader: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    padding: 16,
    paddingBottom: 8,
  },
  notificationCloseButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationCloseButtonText: {
    fontSize: 20,
    color: theme.text,
    fontWeight: '600',
  },
  notificationImageContainer: {
    width: '100%',
    height: 250,
    backgroundColor: '#f0f0f0',
    overflow: 'hidden',
    borderRadius: 12,
    marginBottom: 16,
  },
  notificationImage: {
    width: '100%',
    height: 250,
    backgroundColor: '#e0e0e0',
  },
  notificationImagePlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationImagePlaceholderText: {
    fontSize: 48,
    color: '#999',
    marginBottom: 8,
  },
  notificationActionsContainer: {
    padding: 24,
    paddingTop: 0,
    borderTopWidth: 1,
    borderTopColor: theme.border,
  },
  notificationDoneButton: {
    backgroundColor: theme.primary,
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: theme.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  notificationDoneButtonCompleted: {
    backgroundColor: '#27AE60',
  },
  notificationDoneButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: 'white',
  },
  notificationScrollContent: {
    padding: 24,
  },
  notificationTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: theme.text,
    marginBottom: 16,
    textAlign: 'center',
  },
  notificationTimeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    paddingVertical: 12,
    paddingHorizontal: 20,
    backgroundColor: 'rgba(46, 125, 50, 0.1)', // Light green with 10% opacity
    borderRadius: 16,
    alignSelf: 'center',
  },
  notificationTimeIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  notificationTime: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.primary,
  },
  notificationDescription: {
    fontSize: 16,
    lineHeight: 24,
    color: theme.textSecondary,
    marginBottom: 24,
    textAlign: 'center',
  },
  notificationLinkButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.primary,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: theme.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  notificationLinkIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  notificationLinkText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
});


export default WirdsScreen; 
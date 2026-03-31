import React, { useEffect, useRef } from 'react';
import { Alert, AppState } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import * as Notifications from 'expo-notifications';
import TabNavigator from './src/navigation/TabNavigator';
import { notificationService } from './src/services/notificationService';
import { reminderService } from './src/services/reminderService';
import { settingsService } from './src/services/settingsService';
import { RootTabParamList } from './src/types';

export default function App() {
  const navigationRef = useRef<any>(null);

  useEffect(() => {
    // Initialize data persistence
    const initializeData = async () => {
      console.log('🚀 Initializing app data...');
      await Promise.all([
        reminderService.initialize(),
        settingsService.initialize(),
      ]);
      console.log('✅ App data initialized');
    };
    
    initializeData().then(async () => {
      await notificationService.rescheduleAllReminders(() => reminderService.getAllReminders());
    }).catch(err => console.error('Error initializing app data:', err));
    
    // Handle app state changes to reschedule reminders when app comes to foreground
    const subscription = AppState.addEventListener('change', async (nextAppState) => {
      if (nextAppState === 'active') {
        console.log('📱 App came to foreground, rescheduling all reminders...');
        await notificationService.rescheduleAllReminders(() => reminderService.getAllReminders());
      }
    });

    // Set up notification received handler (fires when notification appears)
    const notificationReceivedListener = Notifications.addNotificationReceivedListener(notification => {
      console.log('🔔 Notification received:', notification.request.content.title);
      console.log('Notification trigger:', JSON.stringify(notification.request.trigger));
      console.log('Notification data:', notification.request.content.data);
      // Do not markTriggered here — same notification also triggers response listener on tap and would double-count.
    });

    // Set up notification response handler (fires when notification is tapped)
    const notificationListener = Notifications.addNotificationResponseReceivedListener(response => {
      const data = response.notification.request.content.data;
      
      console.log('Notification tapped:', response.notification.request.content.title);
      console.log('Notification data:', data);
      
      if (data?.type === 'wird_reminder') {
        console.log('Wird reminder notification tapped:', data);
        
        if (typeof data.reminderId === 'string') {
          reminderService.markTriggered(data.reminderId);
        }
        
        // Store pending reminderId for when Wirds screen loads (handles cold start race)
        (global as any).__pendingNotificationReminderId = data.reminderId;
        // Store attachment URLs as fallback if reminder from storage fails to load image
        (global as any).__pendingNotificationImageUrl = data.reminderImageUrl;
        (global as any).__pendingNotificationFileUrl = data.reminderFileUrl;
        (global as any).__pendingNotificationLinkUrl = data.reminderLinkUrl;
        
        // Navigate to Wirds screen with reminder ID (retry if nav not ready)
        const tryNavigate = (attempt = 0) => {
          if (navigationRef.current) {
            console.log('Navigating to Wirds screen with reminder ID:', data.reminderId);
            navigationRef.current.navigate('Wirds', { reminderId: data.reminderId });
          } else if (attempt < 10) {
            setTimeout(() => tryNavigate(attempt + 1), 200);
          }
        };
        tryNavigate();
        
        // Log reminder details for debugging
        console.log('Reminder details:', {
          id: data.reminderId,
          title: data.reminderTitle,
          description: data.reminderDescription,
          category: data.reminderCategory,
          imageUrl: data.reminderImageUrl,
          fileUrl: data.reminderFileUrl,
          linkUrl: data.reminderLinkUrl,
        });
      } else if (data?.type === 'test') {
        console.log('Test notification tapped');
        Alert.alert('Test Notification', 'Test notification was tapped successfully!');
      }
    });

    // Don't call initializeNotifications - it cancels all notifications
    // initializeNotifications();

    // Cleanup listeners on unmount
    return () => {
      notificationReceivedListener.remove();
      notificationListener.remove();
      subscription.remove();
    };
  }, []);

  return (
    <SafeAreaProvider>
      <NavigationContainer ref={navigationRef}>
        <StatusBar style="auto" />
        <TabNavigator />
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

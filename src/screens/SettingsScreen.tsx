import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  Modal,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppSettings } from '../types';
import { settingsService } from '../services/settingsService';
import { themeService } from '../services/themeService';

const SettingsScreen: React.FC = () => {
  const theme = themeService.getCurrentTheme();
  const [settings, setSettings] = useState<AppSettings>(settingsService.getAllSettings());
  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState<string>('');
  const [modalValue, setModalValue] = useState<string>('');
  const [showGuide, setShowGuide] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  // Reload when theme changes
  useEffect(() => {
    const interval = setInterval(() => {
      const currentSettings = settingsService.getAllSettings();
      if (currentSettings.theme !== settings.theme) {
        loadSettings();
      }
    }, 500);
    return () => clearInterval(interval);
  }, [settings.theme]);

  const loadSettings = () => {
    setSettings(settingsService.getAllSettings());
  };

  const updateSetting = <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => {
    const updatedSettings = settingsService.updateSetting(key, value);
    setSettings(updatedSettings);
  };

  const showCalculationMethodModal = () => {
    setModalType('calculationMethod');
    setModalValue(settings.calculationMethod.toString());
    setModalVisible(true);
  };

  const showLocationModal = () => {
    setModalType('location');
    setModalValue(settings.locationMethod);
    setModalVisible(true);
  };

  // Commented out - may use in the future
  // const showLanguageModal = () => {
  //   setModalType('language');
  //   setModalValue(settings.language);
  //   setModalVisible(true);
  // };

  // const showTimeFormatModal = () => {
  //   setModalType('timeFormat');
  //   setModalValue(settings.timeFormat);
  //   setModalVisible(true);
  // };

  // const showBackupFrequencyModal = () => {
  //   setModalType('backupFrequency');
  //   setModalValue(settings.backupFrequency);
  //   setModalVisible(true);
  // };

  const showThemeModal = () => {
    setModalType('theme');
    setModalValue(settings.theme);
    setModalVisible(true);
  };

  const handleModalSave = () => {
    switch (modalType) {
      case 'calculationMethod':
        updateSetting('calculationMethod', parseInt(modalValue) || 2);
        break;
      case 'location':
        updateSetting('locationMethod', modalValue as 'gps' | 'manual');
        break;
      // Commented out - may use in the future
      // case 'language':
      //   updateSetting('language', modalValue);
      //   break;
      // case 'timeFormat':
      //   updateSetting('timeFormat', modalValue as '12h' | '24h');
      //   break;
      // case 'backupFrequency':
      //   updateSetting('backupFrequency', modalValue as 'daily' | 'weekly' | 'monthly');
      //   break;
      case 'theme':
        updateSetting('theme', modalValue as 'original' | 'dark' | 'calm');
        // Update theme service
        themeService.setThemeMode(modalValue as 'original' | 'dark' | 'calm');
        // Force re-render by reloading settings
        loadSettings();
        break;
    }
    setModalVisible(false);
  };

  const resetSettings = () => {
    Alert.alert(
      'Reset Settings',
      'Are you sure you want to reset all settings to default?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: () => {
            const defaultSettings = settingsService.resetToDefaults();
            setSettings(defaultSettings);
          },
        },
      ]
    );
  };

  const getDynamicStyles = () => {
    return StyleSheet.create({
      container: {
        flex: 1,
        backgroundColor: theme.background,
      },
      scrollView: {
        flex: 1,
      },
      header: {
        backgroundColor: theme.primary,
        padding: 20,
        alignItems: 'center',
      },
      title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#FFFFFF',
        marginBottom: 4,
      },
      subtitle: {
        fontSize: 14,
        color: '#FFFFFF',
        opacity: 0.9,
      },
      content: {
        padding: 16,
      },
      section: {
        marginBottom: 24,
      },
      sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: theme.text,
        marginBottom: 12,
        paddingHorizontal: 4,
      },
      settingItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.card,
        padding: 16,
        borderRadius: 12,
        marginBottom: 8,
        shadowColor: theme.shadow,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
      },
      settingIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: theme.surface,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
      },
      iconText: {
        fontSize: 20,
      },
      settingContent: {
        flex: 1,
      },
      settingTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: theme.text,
        marginBottom: 2,
      },
      settingSubtitle: {
        fontSize: 13,
        color: theme.textSecondary,
      },
      settingValue: {
        fontSize: 14,
        color: theme.primary,
        fontWeight: '500',
      },
    });
  };

  const dynamicStyles = getDynamicStyles();

  const renderSettingItem = (
    title: string, 
    subtitle: string, 
    icon: string, 
    onPress?: () => void,
    rightElement?: React.ReactNode
  ) => {
    return (
      <TouchableOpacity
        style={dynamicStyles.settingItem}
        onPress={onPress}
        disabled={!onPress}
      >
        <View style={dynamicStyles.settingIcon}>
          <Text style={dynamicStyles.iconText}>{icon}</Text>
        </View>
        <View style={dynamicStyles.settingContent}>
          <Text style={dynamicStyles.settingTitle}>{title}</Text>
          <Text style={dynamicStyles.settingSubtitle}>{subtitle}</Text>
        </View>
        {rightElement || (onPress && <Text style={dynamicStyles.settingValue}>›</Text>)}
      </TouchableOpacity>
    );
  };

  const renderSwitchItem = (
    title: string,
    subtitle: string,
    icon: string,
    value: boolean,
    onValueChange: (value: boolean) => void
  ) => {
    return (
      <View style={dynamicStyles.settingItem}>
        <View style={dynamicStyles.settingIcon}>
          <Text style={dynamicStyles.iconText}>{icon}</Text>
        </View>
        <View style={dynamicStyles.settingContent}>
          <Text style={dynamicStyles.settingTitle}>{title}</Text>
          <Text style={dynamicStyles.settingSubtitle}>{subtitle}</Text>
        </View>
        <Switch
          value={value}
          onValueChange={onValueChange}
          trackColor={{ false: theme.border, true: theme.primary }}
          thumbColor={value ? '#FFFFFF' : '#F4F3F4'}
        />
      </View>
    );
  };

  const renderSliderItem = (
    title: string,
    subtitle: string,
    icon: string,
    value: number,
    onValueChange: (value: number) => void,
    min: number,
    max: number
  ) => {
    return (
      <TouchableOpacity
        style={dynamicStyles.settingItem}
        onPress={() => {
          setModalType('slider');
          setModalValue(value.toString());
          setModalVisible(true);
        }}
      >
        <View style={dynamicStyles.settingIcon}>
          <Text style={dynamicStyles.iconText}>{icon}</Text>
        </View>
        <View style={dynamicStyles.settingContent}>
          <Text style={dynamicStyles.settingTitle}>{title}</Text>
          <Text style={dynamicStyles.settingSubtitle}>{subtitle}</Text>
        </View>
        <Text style={dynamicStyles.settingValue}>{value}</Text>
      </TouchableOpacity>
    );
  };

  const renderSelectItem = (
    title: string,
    subtitle: string,
    icon: string,
    value: string,
    onValueChange: (value: string) => void,
    options: { value: string; label: string }[]
  ) => {
    return (
      <TouchableOpacity
        style={dynamicStyles.settingItem}
        onPress={() => {
          setModalType('select');
          setModalValue(value);
          setModalVisible(true);
        }}
      >
        <View style={dynamicStyles.settingIcon}>
          <Text style={dynamicStyles.iconText}>{icon}</Text>
        </View>
        <View style={dynamicStyles.settingContent}>
          <Text style={dynamicStyles.settingTitle}>{title}</Text>
          <Text style={dynamicStyles.settingSubtitle}>{subtitle}</Text>
        </View>
        <Text style={dynamicStyles.settingValue}>
          {options.find(opt => opt.value === value)?.label || value}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={dynamicStyles.container}>
      <ScrollView style={dynamicStyles.scrollView}>
        <View style={dynamicStyles.header}>
          <Text style={dynamicStyles.title}>Settings</Text>
          <Text style={dynamicStyles.subtitle}>App preferences and configuration</Text>
        </View>

        <View style={dynamicStyles.content}>
          {/* Prayer Times Section */}
          <View style={dynamicStyles.section}>
            <Text style={dynamicStyles.sectionTitle}>Prayer Times</Text>
            {renderSettingItem(
              'Calculation Method',
              settingsService.getCalculationMethodName(settings.calculationMethod),
              '🕌',
              showCalculationMethodModal
            )}
            {renderSettingItem(
              'Location',
              settings.locationMethod === 'gps' ? 'Use device GPS' : 'Manual location',
              '📍',
              showLocationModal
            )}
            {renderSwitchItem(
              'Prayer Notifications',
              'Get notified at prayer times',
              '🔔',
              settings.prayerNotifications,
              (value) => updateSetting('prayerNotifications', value)
            )}
            {renderSwitchItem(
              'Reminder Notifications',
              'Get notified for wird reminders',
              '📿',
              settings.reminderNotifications,
              (value) => updateSetting('reminderNotifications', value)
            )}
          </View>

          {/* Notifications Section */}
          <View style={dynamicStyles.section}>
            <Text style={dynamicStyles.sectionTitle}>Notifications</Text>
            {renderSwitchItem(
              'Notification Sound',
              'Play sound for notifications',
              '🔊',
              settings.notificationSound,
              (value) => updateSetting('notificationSound', value)
            )}
            {renderSwitchItem(
              'Notification Vibration',
              'Vibrate for notifications',
              '📳',
              settings.notificationVibration,
              (value) => updateSetting('notificationVibration', value)
            )}
          </View>

          {/* Tasbeeh Section */}
          <View style={dynamicStyles.section}>
            <Text style={dynamicStyles.sectionTitle}>Tasbeeh Counter</Text>
            {renderSwitchItem(
              'Counter Vibration',
              'Vibrate when counting tasbeeh',
              '📳',
              settings.tasbeehVibration,
              (value) => updateSetting('tasbeehVibration', value)
            )}
          </View>

          {/* Notification Settings */}
          <View style={dynamicStyles.section}>
            <Text style={dynamicStyles.sectionTitle}>Notifications</Text>
            {renderSwitchItem(
              'Prayer Notifications',
              'Get notified before prayer times',
              '🕌',
              settings.prayerNotifications,
              (value) => updateSetting('prayerNotifications', value)
            )}
            {renderSwitchItem(
              'Wird Reminders',
              'Get reminded about your wirds',
              '📿',
              settings.reminderNotifications,
              (value) => updateSetting('reminderNotifications', value)
            )}
            {renderSwitchItem(
              'Notification Sound',
              'Play sound for notifications',
              '🔊',
              settings.notificationSound,
              (value) => updateSetting('notificationSound', value)
            )}
            {renderSwitchItem(
              'Notification Vibration',
              'Vibrate for notifications',
              '📳',
              settings.notificationVibration,
              (value) => updateSetting('notificationVibration', value)
            )}
            {renderSliderItem(
              'Prayer Alert Time',
              'Minutes before prayer to notify',
              '⏰',
              settings.prayerNotificationTime,
              (value) => updateSetting('prayerNotificationTime', value),
              1,
              30
            )}
          </View>

          {/* Offline Settings */}
          <View style={dynamicStyles.section}>
            <Text style={dynamicStyles.sectionTitle}>Offline Mode</Text>
            {renderSwitchItem(
              'Offline Mode',
              'Enable offline functionality',
              '📶',
              settings.offlineMode,
              (value) => updateSetting('offlineMode', value)
            )}
            {renderSliderItem(
              'Cache Days',
              'Days to cache prayer times',
              '💾',
              settings.cacheDays,
              (value) => updateSetting('cacheDays', value),
              1,
              30
            )}
          </View>


          {/* App Settings Section - Commented out, may use in the future */}
          {/* <View style={styles.section}>
            <Text style={styles.sectionTitle}>App</Text>
            {renderSettingItem(
              'Language',
              settingsService.getLanguageName(settings.language),
              '🌐',
              showLanguageModal
            )}
            {renderSettingItem(
              'Time Format',
              settings.timeFormat === '12h' ? '12-hour (AM/PM)' : '24-hour',
              '⏰',
              showTimeFormatModal
            )}
            {renderSettingItem(
              'About',
              'Version 1.0.0',
              'ℹ️',
              () => Alert.alert('About Wirdly', 'Version 1.0.0\n\nA beautiful prayer times and spiritual practice app.')
            )}
          </View> */}

          {/* Privacy Section - Commented out, may use in the future */}
          {/* <View style={styles.section}>
            <Text style={styles.sectionTitle}>Privacy</Text>
            {renderSwitchItem(
              'Data Collection',
              'Allow data collection for app improvement',
              '📊',
              settings.dataCollection,
              (value) => updateSetting('dataCollection', value)
            )}
            {renderSwitchItem(
              'Analytics',
              'Share anonymous usage analytics',
              '📈',
              settings.analytics,
              (value) => updateSetting('analytics', value)
            )}
            {renderSwitchItem(
              'Crash Reporting',
              'Send crash reports to help improve the app',
              '🐛',
              settings.crashReporting,
              (value) => updateSetting('crashReporting', value)
            )}
          </View> */}

          {/* Backup Section - Commented out, may use in the future */}
          {/* <View style={styles.section}>
            <Text style={styles.sectionTitle}>Backup & Sync</Text>
            {renderSwitchItem(
              'Auto Backup',
              'Automatically backup your data',
              '☁️',
              settings.autoBackup,
              (value) => updateSetting('autoBackup', value)
            )}
            {renderSettingItem(
              'Backup Frequency',
              settings.backupFrequency === 'daily' ? 'Daily' : 
              settings.backupFrequency === 'weekly' ? 'Weekly' : 'Monthly',
              '📅',
              showBackupFrequencyModal
            )}
            {renderSwitchItem(
              'Cloud Sync',
              'Sync data across devices',
              '🔄',
              settings.cloudSync,
              (value) => updateSetting('cloudSync', value)
            )}
          </View> */}

          {/* Theme Section */}
          <View style={dynamicStyles.section}>
            <Text style={dynamicStyles.sectionTitle}>Appearance</Text>
            {renderSettingItem(
              'Theme',
              settings.theme === 'original' ? 'Original' : 
              settings.theme === 'dark' ? 'Dark Mode' : 'Calm Mode',
              '🎨',
              showThemeModal
            )}
          </View>

          {/* How to Use Guide */}
          <View style={dynamicStyles.section}>
            <Text style={dynamicStyles.sectionTitle}>Help</Text>
            {renderSettingItem(
              'How to Use Wirdly',
              showGuide ? 'Tap to close guide' : 'Learn how to use the app',
              '📖',
              () => setShowGuide(!showGuide)
            )}
            {showGuide && (
              <View style={styles.guideContainer}>
                <Text style={styles.guideText}>
                  Wirdly is not a standard dua or dhikr app with pre-built content. It's your personal wird reminder system - you set up the specific awraad, duas, and adhkar that YOU want to practice, and the app reminds you at the right times.
                </Text>

                <Text style={styles.guideSubtitle}>Getting Started</Text>
                <Text style={styles.guideBullet}>1. Go to the Wirds tab and tap "Add New Reminder"</Text>
                <Text style={styles.guideBullet}>2. Give your wird a title (e.g. "Morning Adhkar", "Ayat al-Kursi")</Text>
                <Text style={styles.guideBullet}>3. Attach an image of the dua/dhikr, a link, or a file</Text>
                <Text style={styles.guideBullet}>4. Choose when to be reminded: at prayer times, daily, weekly, monthly, or yearly</Text>
                <Text style={styles.guideBullet}>5. For prayer-based reminders, select which prayers (e.g. Fajr and Maghrib)</Text>

                <Text style={styles.guideSubtitle}>Features</Text>
                <Text style={styles.guideBullet}>- Attach images of your wird pages so you can read directly from the app</Text>
                <Text style={styles.guideBullet}>- Set reminders for multiple prayer times in one go</Text>
                <Text style={styles.guideBullet}>- Track your completion streaks and progress</Text>
                <Text style={styles.guideBullet}>- Use the Wird Sessions feature to swipe through all wirds for a prayer time</Text>
                <Text style={styles.guideBullet}>- Filter reminders by type, category, or prayer time</Text>
                <Text style={styles.guideBullet}>- Use the Tasbeeh counter for your daily dhikr counts</Text>

                <Text style={styles.guideSubtitle}>Prayer Times</Text>
                <Text style={styles.guideBullet}>- The Salah tab shows today's prayer times with a live countdown</Text>
                <Text style={styles.guideBullet}>- Expand "Upcoming Days" to see the next 5 days</Text>
                <Text style={styles.guideBullet}>- Change calculation method to match your local mosque</Text>
              </View>
            )}
          </View>

          {/* Reset Section */}
          <View style={dynamicStyles.section}>
            <Text style={dynamicStyles.sectionTitle}>Reset</Text>
            {renderSettingItem(
              'Reset All Settings',
              'Reset to default settings',
              '🔄',
              resetSettings
            )}
          </View>

          {/* About Section */}
          <View style={dynamicStyles.section}>
            <Text style={dynamicStyles.sectionTitle}>About</Text>
            <View style={styles.aboutCard}>
              <Text style={styles.aboutTitle}>Wirdly</Text>
              <Text style={styles.aboutSubtitle}>Your Spiritual Companion</Text>
              <Text style={styles.aboutVersion}>Version 1.4.0</Text>
              <Text style={styles.aboutDescription}>
                Wirdly is a smart Islamic reminder app that prompts you to read the specific awraad or dua you've personally set, automatically timed to your local salah or any other time so you never miss a wird again.
              </Text>
            </View>
            <View style={styles.footerContainer}>
              <Text style={styles.footerText}>Made with ❤️ for the Muslim community</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Settings Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {modalType === 'calculationMethod' && 'Calculation Method'}
              {modalType === 'location' && 'Location Method'}
              {/* Commented out - may use in the future */}
              {/* {modalType === 'language' && 'Language'} */}
              {/* {modalType === 'timeFormat' && 'Time Format'} */}
              {/* {modalType === 'backupFrequency' && 'Backup Frequency'} */}
            </Text>
            
            <ScrollView style={styles.optionsList}>
              {modalType === 'calculationMethod' && (
                <>
                  {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15].map((method) => (
                    <TouchableOpacity
                      key={method}
                      style={[
                        styles.optionItem,
                        settings.calculationMethod === method && styles.optionItemSelected
                      ]}
                      onPress={() => setModalValue(method.toString())}
                    >
                      <Text style={[
                        styles.optionText,
                        settings.calculationMethod === method && styles.optionTextSelected
                      ]}>
                        {settingsService.getCalculationMethodName(method)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </>
              )}

              {modalType === 'location' && (
                <>
                  <TouchableOpacity
                    style={[
                      styles.optionItem,
                      settings.locationMethod === 'gps' && styles.optionItemSelected
                    ]}
                    onPress={() => setModalValue('gps')}
                  >
                    <Text style={[
                      styles.optionText,
                      settings.locationMethod === 'gps' && styles.optionTextSelected
                    ]}>
                      Use device GPS
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.optionItem,
                      settings.locationMethod === 'manual' && styles.optionItemSelected
                    ]}
                    onPress={() => setModalValue('manual')}
                  >
                    <Text style={[
                      styles.optionText,
                      settings.locationMethod === 'manual' && styles.optionTextSelected
                    ]}>
                      Manual location
                    </Text>
                  </TouchableOpacity>
                </>
              )}

              {modalType === 'theme' && (
                <>
                  <TouchableOpacity
                    style={[
                      styles.optionItem,
                      modalValue === 'original' && styles.optionItemSelected
                    ]}
                    onPress={() => setModalValue('original')}
                  >
                    <Text style={[
                      styles.optionText,
                      modalValue === 'original' && styles.optionTextSelected
                    ]}>
                      Original
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.optionItem,
                      modalValue === 'dark' && styles.optionItemSelected
                    ]}
                    onPress={() => setModalValue('dark')}
                  >
                    <Text style={[
                      styles.optionText,
                      modalValue === 'dark' && styles.optionTextSelected
                    ]}>
                      Dark Mode
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.optionItem,
                      modalValue === 'calm' && styles.optionItemSelected
                    ]}
                    onPress={() => setModalValue('calm')}
                  >
                    <Text style={[
                      styles.optionText,
                      modalValue === 'calm' && styles.optionTextSelected
                    ]}>
                      Calm Mode
                    </Text>
                  </TouchableOpacity>
                </>
              )}

              {/* Commented out - may use in the future */}
              {/* {modalType === 'language' && (
                <>
                  {settingsService.getAvailableLanguages().map((language) => (
                    <TouchableOpacity
                      key={language.code}
                      style={[
                        styles.optionItem,
                        settings.language === language.code && styles.optionItemSelected
                      ]}
                      onPress={() => setModalValue(language.code)}
                    >
                      <Text style={[
                        styles.optionText,
                        settings.language === language.code && styles.optionTextSelected
                      ]}>
                        {language.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </>
              )}

              {modalType === 'timeFormat' && (
                <>
                  <TouchableOpacity
                    style={[
                      styles.optionItem,
                      settings.timeFormat === '12h' && styles.optionItemSelected
                    ]}
                    onPress={() => setModalValue('12h')}
                  >
                    <Text style={[
                      styles.optionText,
                      settings.timeFormat === '12h' && styles.optionTextSelected
                    ]}>
                      12-hour (AM/PM)
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.optionItem,
                      settings.timeFormat === '24h' && styles.optionItemSelected
                    ]}
                    onPress={() => setModalValue('24h')}
                  >
                    <Text style={[
                      styles.optionText,
                      settings.timeFormat === '24h' && styles.optionTextSelected
                    ]}>
                      24-hour
                    </Text>
                  </TouchableOpacity>
                </>
              )}

              {modalType === 'backupFrequency' && (
                <>
                  <TouchableOpacity
                    style={[
                      styles.optionItem,
                      settings.backupFrequency === 'daily' && styles.optionItemSelected
                    ]}
                    onPress={() => setModalValue('daily')}
                  >
                    <Text style={[
                      styles.optionText,
                      settings.backupFrequency === 'daily' && styles.optionTextSelected
                    ]}>
                      Daily
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.optionItem,
                      settings.backupFrequency === 'weekly' && styles.optionItemSelected
                    ]}
                    onPress={() => setModalValue('weekly')}
                  >
                    <Text style={[
                      styles.optionText,
                      settings.backupFrequency === 'weekly' && styles.optionTextSelected
                    ]}>
                      Weekly
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.optionItem,
                      settings.backupFrequency === 'monthly' && styles.optionItemSelected
                    ]}
                    onPress={() => setModalValue('monthly')}
                  >
                    <Text style={[
                      styles.optionText,
                      settings.backupFrequency === 'monthly' && styles.optionTextSelected
                    ]}>
                      Monthly
                    </Text>
                  </TouchableOpacity>
                </>
              )} */}
            </ScrollView>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.saveButton}
                onPress={handleModalSave}
              >
                <Text style={styles.saveButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    backgroundColor: '#00B894',
    padding: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  content: {
    padding: 20,
  },
  section: {
    backgroundColor: 'white',
    borderRadius: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    padding: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  iconText: {
    fontSize: 20,
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  settingSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  settingArrow: {
    fontSize: 18,
    color: '#999',
    fontWeight: 'bold',
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
    width: '90%',
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  optionsList: {
    maxHeight: 300,
    marginBottom: 20,
  },
  optionItem: {
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: '#F8F9FA',
  },
  optionItemSelected: {
    backgroundColor: '#4A90E2',
  },
  optionText: {
    fontSize: 16,
    color: '#333',
  },
  optionTextSelected: {
    color: 'white',
    fontWeight: '600',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
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
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
  saveButton: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    backgroundColor: '#4A90E2',
    marginLeft: 8,
    alignItems: 'center',
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  settingValue: {
    fontSize: 16,
    color: '#666',
    marginRight: 8,
  },
  settingValueText: {
    fontSize: 16,
    color: '#666',
    marginRight: 8,
  },
  guideContainer: {
    padding: 20,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    marginTop: 8,
    marginHorizontal: 16,
    marginBottom: 16,
  },
  guideSubtitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4A90E2',
    marginTop: 16,
    marginBottom: 8,
  },
  guideText: {
    fontSize: 14,
    color: '#555',
    lineHeight: 22,
    marginBottom: 8,
  },
  guideBullet: {
    fontSize: 14,
    color: '#555',
    lineHeight: 24,
    paddingLeft: 8,
  },
  aboutCard: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    marginBottom: 16,
  },
  aboutTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#4CAF50',
    marginBottom: 4,
  },
  aboutSubtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 12,
    fontWeight: '500',
  },
  aboutVersion: {
    fontSize: 14,
    color: '#999',
    marginBottom: 16,
    fontWeight: '600',
  },
  aboutDescription: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
  footerContainer: {
    alignItems: 'center',
    paddingVertical: 20,
    paddingBottom: 40,
  },
  footerText: {
    fontSize: 12,
    color: '#999',
    marginBottom: 4,
    textAlign: 'center',
  },
});

export default SettingsScreen; 
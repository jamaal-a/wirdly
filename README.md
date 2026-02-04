# Wirdly - Complete Islamic Prayer Times & Spiritual Companion

A comprehensive React Native app built with Expo and TypeScript for Muslims to track prayer times, manage spiritual practices (wirds), and maintain their daily Islamic routine with advanced features and offline support.

## ✨ Complete Feature Set

### 🕌 Prayer Times & Qibla
- **Real-time Prayer Times**: Accurate prayer times based on your location
- **Multiple Calculation Methods**: Support for various Islamic calculation methods (ISNA, MWL, UOIF, etc.)
- **Location Services**: Automatic GPS-based prayer times or manual location entry
- **Islamic Calendar**: Display Hijri dates alongside Gregorian dates
- **Special Islamic Days**: Highlight important Islamic occasions and holidays
- **Qibla Direction**: Interactive compass showing direction to Mecca
- **Prayer History**: View past and future prayer times with calendar export
- **Next Prayer Countdown**: Real-time countdown to the next prayer time

### 📿 Advanced Wird Management
- **Wird Reminders**: Set up personalized spiritual practice reminders
- **Flexible Scheduling**: Daily, weekly, monthly, or yearly reminder options
- **Prayer Time Integration**: Set reminders to coincide with prayer times
- **Progress Tracking**: Monitor your spiritual journey and consistency
- **Wird Categories**: Organize wirds by type (dhikr, dua, etc.)
- **Wird Templates**: Pre-made wird collections for easy setup

### 🔢 Enhanced Tasbeeh Counter
- **Simple Counter**: Tap anywhere on screen to count your dhikr
- **Visual Feedback**: Smooth animations and progress indicators
- **Target Setting**: Set daily goals for your spiritual practices
- **Vibration Feedback**: Optional haptic feedback for counting (configurable in settings)
- **Progress Tracking**: Monitor your counting sessions and streaks

### 🔔 Smart Notifications
- **Prayer Time Alerts**: Get notified before each prayer time
- **Wird Reminders**: Receive notifications for scheduled wird reminders
- **Adhan Sounds**: Multiple reciter options for prayer notifications
- **Customizable Timing**: Set how many minutes before prayer to notify
- **Background Sync**: Keep prayer times updated even when app is closed

### 📶 Offline Support
- **Cached Prayer Times**: Store prayer times for offline access
- **Last Known Location**: Use cached location when GPS is unavailable
- **Offline Mode Indicator**: Show when app is working offline
- **Smart Caching**: Configurable cache duration (1-30 days)

### ⚙️ Comprehensive Settings
- **Prayer Times Configuration**: Choose calculation methods and location preferences
- **Notification Management**: Customize prayer and reminder notifications
- **App Preferences**: Theme, language, time format, and more
- **Privacy Controls**: Manage data collection and analytics preferences
- **Backup & Sync**: Automatic data backup and cloud synchronization
- **Accessibility**: VoiceOver support, large text, and high contrast options

### 🎨 Theme & Accessibility
- **Dark Mode**: Complete dark theme implementation
- **System Theme**: Follow device's dark/light mode preference
- **High Contrast**: Enhanced visibility options
- **Large Text**: Accessibility text size support
- **VoiceOver**: Full screen reader compatibility

## 🚀 Technical Features

- **TypeScript**: Full type safety and better development experience
- **Firebase Integration**: Ready for authentication and cloud data storage
- **Offline Support**: Works without internet connection using cached data
- **Responsive Design**: Optimized for all screen sizes
- **Performance**: Optimized for smooth user experience
- **Push Notifications**: Real-time prayer time and reminder alerts
- **Data Persistence**: Local storage with AsyncStorage
- **Network Detection**: Smart offline/online mode switching

## 📱 Screens & Navigation

### Bottom Tab Navigation
- **Home** 🏠: Prayer times, Islamic date, next prayer countdown, Qibla direction
- **Wirds** 📿: Manage spiritual practice reminders and progress
- **Tasbeeh** 🔢: Simple dhikr counter with vibration feedback
- **Qibla** 🧭: Interactive compass showing direction to Mecca
- **History** 📅: View prayer times for any month with export options
- **Settings** ⚙️: Comprehensive app configuration and preferences

## 🛠️ Getting Started

### Prerequisites
- Node.js (v16 or higher)
- Expo CLI
- iOS Simulator or Android Emulator (for testing)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd wirdly
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure Firebase**
   - Update `src/services/firebaseConfig.ts` with your Firebase project credentials
   - Enable Authentication and Firestore in your Firebase console

4. **Start the development server**
   ```bash
   npm start
   ```

5. **Run on device/simulator**
   ```bash
   # iOS
   npm run ios
   
   # Android
   npm run android
   
   # Web
   npm run web
   ```

## 📁 Enhanced Project Structure

```
src/
├── components/          # Reusable UI components
├── navigation/          # Navigation configuration
├── screens/            # Main app screens
│   ├── HomeScreen.tsx
│   ├── WirdsScreen.tsx
│   ├── TasbeehScreen.tsx
│   ├── QiblaScreen.tsx
│   ├── PrayerHistoryScreen.tsx
│   └── SettingsScreen.tsx
├── services/           # Business logic and API services
│   ├── firebaseConfig.ts
│   ├── prayerTimesService.ts
│   ├── prayerHistoryService.ts
│   ├── locationService.ts
│   ├── reminderService.ts
│   ├── settingsService.ts
│   ├── notificationService.ts
│   ├── offlineService.ts
│   ├── qiblaService.ts
│   └── themeService.ts
├── types/              # TypeScript type definitions
│   └── index.ts
└── utils/              # Utility functions
    ├── formatTime.ts
    └── islamicDate.ts
```

## 🔌 API Integration

### Aladhan API
- **Endpoint**: `http://api.aladhan.com/v1/timings`
- **Parameters**: latitude, longitude, method (calculation method)
- **Features**: Real-time prayer times, Islamic calendar, special days

### Firebase Services
- **Authentication**: User login and registration
- **Firestore**: Data storage and synchronization
- **Cloud Functions**: Server-side logic (future enhancement)

### Expo Services
- **Notifications**: Push notifications for prayer times and reminders
- **Location**: GPS and location services
- **AsyncStorage**: Local data persistence
- **NetInfo**: Network connectivity detection

## ⚙️ Configuration

### Prayer Times Settings
- **Calculation Method**: Choose from various Islamic calculation methods
- **Location Method**: GPS or manual location entry
- **Time Format**: 12-hour or 24-hour format
- **Notifications**: Customize prayer time alerts and adhan sounds

### Notification Settings
- **Prayer Notifications**: Enable/disable prayer time alerts
- **Wird Reminders**: Manage spiritual practice reminders
- **Sound & Vibration**: Customize notification feedback
- **Adhan Reciter**: Choose from multiple reciter options
- **Alert Timing**: Set minutes before prayer to notify

### Offline Settings
- **Offline Mode**: Enable offline functionality
- **Cache Duration**: Configure how long to cache prayer times
- **Last Known Location**: Use cached location when GPS unavailable

### Accessibility Settings
- **Large Text**: Use larger text sizes for better readability
- **High Contrast**: Enhanced visibility options
- **VoiceOver**: Screen reader compatibility
- **Theme**: Light, dark, or auto (system preference)

## 🧪 Development

### Code Style
- **TypeScript**: Strict type checking enabled
- **ESLint**: Code quality and consistency
- **Prettier**: Code formatting
- **Conventional Commits**: Standardized commit messages

### Testing
- **Unit Tests**: Component and service testing
- **Integration Tests**: API and navigation testing
- **E2E Tests**: Full user journey testing

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support, email support@wirdly.app or join our community discussions.

## 🗺️ Roadmap

### Completed Features ✅
- [x] **Prayer Times**: Real-time prayer times with multiple calculation methods
- [x] **Qibla Direction**: Interactive compass showing direction to Mecca
- [x] **Prayer History**: View past and future prayer times with calendar export
- [x] **Wird Management**: Complete spiritual practice reminder system
- [x] **Tasbeeh Counter**: Simple dhikr counter with vibration feedback
- [x] **Offline Support**: Cached prayer times and offline functionality
- [x] **Push Notifications**: Prayer time and reminder alerts
- [x] **Dark Mode**: Complete theme system with accessibility options
- [x] **Comprehensive Settings**: Full app configuration and preferences

### Future Enhancements 🚀
- [ ] **Widgets**: Home screen and lock screen widgets
- [ ] **Apple Watch Support**: Prayer times on your wrist
- [ ] **Community Features**: Share wirds and spiritual practices
- [ ] **Advanced Analytics**: Detailed spiritual progress tracking
- [ ] **Web App**: Full web version for desktop use
- [ ] **AI-Powered Suggestions**: Smart wird recommendations
- [ ] **Gamification**: Achievements and spiritual streaks
- [ ] **Multi-language**: Full internationalization support

## 🎯 Key Features Summary

- **6 Main Screens**: Home, Wirds, Tasbeeh, Qibla, History, Settings
- **Offline Support**: Works without internet connection
- **Push Notifications**: Real-time prayer time alerts
- **Qibla Direction**: Interactive compass to Mecca
- **Prayer History**: Calendar view with export functionality
- **Dark Mode**: Complete theme system
- **Accessibility**: VoiceOver and high contrast support
- **Comprehensive Settings**: 20+ configurable options
- **TypeScript**: Full type safety
- **Firebase Ready**: Authentication and cloud storage

---

**Wirdly** - Your complete spiritual companion for a meaningful Islamic journey. 🌙

*Built with ❤️ for the Muslim community*
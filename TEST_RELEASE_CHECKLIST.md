# Wirdly Test Release Checklist

## 🔴 Critical Issues (Must Fix Before Release)

### 1. Data Persistence ⚠️ CRITICAL
- **Issue**: Reminders and settings are stored in-memory only
- **Impact**: All user data is lost when app is closed/restarted
- **Files to update**:
  - `src/services/reminderService.ts` - Add AsyncStorage for reminders
  - `src/services/settingsService.ts` - Add AsyncStorage for settings
  - `src/services/offlineService.ts` - Add AsyncStorage for prayer time cache
- **Action**: Implement AsyncStorage persistence for all user data

### 2. App Configuration
- [ ] Verify all app icons are in place (`assets/icon.png`, `assets/adaptive-icon.png`, `assets/splash-icon.png`)
- [ ] Test splash screen appears correctly
- [ ] Verify bundle identifier is correct (`com.jamaal1.wirdly`)
- [ ] Consider version bump to `0.1.0` or `0.0.1` for test release (currently `1.0.0`)

### 3. Privacy & Legal
- [ ] Add Privacy Policy URL to `app.json` (required for App Store)
- [ ] Create Privacy Policy document (even if basic)
- [ ] Verify all permission descriptions in `app.json` are clear and appropriate
- [ ] Ensure compliance with data collection practices

## 🟡 Important (Should Fix)

### 4. Error Handling & Edge Cases
- [ ] Test location permission denied flow
- [ ] Test notification permission denied flow
- [ ] Test offline mode (no internet connection)
- [ ] Test with invalid location data
- [ ] Test API failures (rate limiting, network errors)
- [ ] Add loading states for all async operations
- [ ] Add empty states for all screens

### 5. User Experience
- [ ] Test hourly reminder notifications actually fire
- [ ] Verify prayer time calculations are accurate
- [ ] Test Qibla compass accuracy
- [ ] Verify all reminder types work (daily, weekly, monthly, yearly, hourly, prayer)
- [ ] Test image/file picker on both iOS and Android
- [ ] Test swipeable wird viewer functionality
- [ ] Verify manual time entry works correctly

### 6. Testing Across Devices
- [ ] Test on iPhone (multiple iOS versions: iOS 15, 16, 17+)
- [ ] Test on iPad (if supportsTablet is true)
- [ ] Test on different screen sizes (iPhone SE, iPhone 14 Pro Max)
- [ ] Test on Android devices (if applicable)
- [ ] Test with different time zones
- [ ] Test with different calculation methods

### 7. Performance & Stability
- [ ] Monitor app crash reports (if crash reporting is enabled)
- [ ] Check for memory leaks (especially in Qibla compass with sensor subscriptions)
- [ ] Verify proper cleanup on unmount (sensor subscriptions, timers)
- [ ] Test app performance with many reminders (50+)
- [ ] Test app startup time

## 🟢 Nice to Have (Can Add Later)

### 8. Onboarding & First Run
- [ ] Consider adding a welcome screen/onboarding flow
- [ ] Guide users through permission requests
- [ ] Explain key features on first launch

### 9. Analytics & Monitoring
- [ ] Set up crash reporting (Firebase Crashlytics or similar)
- [ ] Add basic analytics (which features are used most)
- [ ] Monitor notification delivery rates
- [ ] Track user engagement metrics

### 10. Documentation
- [ ] Update README with current features
- [ ] Add changelog/release notes
- [ ] Document known issues/limitations for testers

### 11. App Store Preparation
- [ ] Prepare app screenshots (required for TestFlight/App Store)
- [ ] Write app description
- [ ] Prepare keywords for App Store optimization
- [ ] Create app preview video (optional)
- [ ] Prepare marketing materials

## 📝 Pre-Release Testing Checklist

### Functionality Tests
- [ ] Create a daily reminder → verify it appears → verify notification fires
- [ ] Create an hourly reminder → verify notification fires at top of hour
- [ ] Create a prayer-based reminder → verify it triggers at prayer time
- [ ] Edit a reminder → verify changes are saved
- [ ] Delete a reminder → verify it's removed
- [ ] Test "Add All" example reminders → verify all are created
- [ ] Mark reminder as completed → verify streak updates
- [ ] Test Qibla compass → verify direction is accurate
- [ ] View prayer history → verify times load correctly
- [ ] Change calculation method → verify prayer times update
- [ ] Test tasbeeh counter → verify counts persist

### Permission Tests
- [ ] Deny location permission → verify graceful error handling
- [ ] Deny notification permission → verify app still works
- [ ] Grant permissions mid-flow → verify app adapts
- [ ] Test notification permission prompts

### Edge Case Tests
- [ ] Create reminder with no internet → should work with cached data
- [ ] Create reminder with invalid time → should show error
- [ ] Test with no reminders → verify empty states show
- [ ] Test with many reminders → verify app doesn't lag
- [ ] Force close app → verify data persists on reopen (after AsyncStorage implementation)
- [ ] Test across midnight → verify daily reminders reset correctly

## 🚀 Release Steps

1. **Fix Critical Issues** (especially data persistence)
2. **Complete Important Items**
3. **Run through Pre-Release Testing Checklist**
4. **Build TestFlight build**: `eas build --platform ios --profile preview`
5. **Upload to TestFlight** via EAS
6. **Invite testers** (max 10,000 for TestFlight)
7. **Monitor feedback** and crash reports
8. **Iterate** based on tester feedback

## 📋 Notes

- Current version: `1.0.0` - consider bumping to `0.1.0` for test release
- App uses EAS Build (project ID: `e7d3a7c1-efb3-4474-8e5a-d92dc709f584`)
- TestFlight requires Apple Developer Program membership (which you have)
- Data persistence is the most critical blocker - everything else can be improved iteratively

---

**Priority Order:**
1. 🔴 **Data Persistence** - Must fix before release
2. 🟡 **Error Handling & Permissions** - Should fix for good UX
3. 🟡 **Testing Across Devices** - Important for quality
4. 🟢 **Nice to Haves** - Can add in updates


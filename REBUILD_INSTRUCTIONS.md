# How to Rebuild Your App

## 🚀 Quick Rebuild (Development Build)

### For iOS:
```bash
# Stop any running Metro bundler (Ctrl+C if running)
# Then run:
npx expo run:ios
```

### For Android:
```bash
# Stop any running Metro bundler (Ctrl+C if running)
# Then run:
npx expo run:android
```

## 📱 Step-by-Step Process:

### 1. **Stop Metro Bundler** (if running)
- Press `Ctrl+C` in the terminal where Metro is running

### 2. **Clear Cache** (optional but recommended)
```bash
npx expo start -c
# Press Ctrl+C after it starts, then rebuild
```

### 3. **Rebuild the App**

**For iOS Simulator:**
```bash
npx expo run:ios
```

**For iOS Physical Device:**
```bash
npx expo run:ios --device
```

**For Android Emulator:**
```bash
npx expo run:android
```

**For Android Physical Device:**
```bash
npx expo run:android --device
```

## ⚠️ Important Notes:

1. **First Time Setup:**
   - iOS: Make sure Xcode is installed
   - Android: Make sure Android Studio and Android SDK are installed

2. **After Rebuild:**
   - **Delete the old app** from your device/simulator
   - Install the newly built app
   - The new icon will appear!

3. **If Using Expo Go:**
   - Custom icons **won't work** in Expo Go
   - You **must** use a development build (`npx expo run:ios/android`)
   - Or create a production build with EAS

## 🔄 Alternative: EAS Build (For Production/TestFlight)

If you want to build for App Store/Play Store:

```bash
# Install EAS CLI
npm install -g eas-cli

# Login
eas login

# Build for iOS
eas build --platform ios

# Build for Android
eas build --platform android
```

## 🐛 Troubleshooting:

**If build fails:**
```bash
# Clean and rebuild
npx expo prebuild --clean
npx expo run:ios  # or run:android
```

**If icon still doesn't update:**
1. Delete the app completely from device
2. Clear Xcode/Android Studio cache
3. Rebuild again


## 🚀 Quick Rebuild (Development Build)

### For iOS:
```bash
# Stop any running Metro bundler (Ctrl+C if running)
# Then run:
npx expo run:ios
```

### For Android:
```bash
# Stop any running Metro bundler (Ctrl+C if running)
# Then run:
npx expo run:android
```

## 📱 Step-by-Step Process:

### 1. **Stop Metro Bundler** (if running)
- Press `Ctrl+C` in the terminal where Metro is running

### 2. **Clear Cache** (optional but recommended)
```bash
npx expo start -c
# Press Ctrl+C after it starts, then rebuild
```

### 3. **Rebuild the App**

**For iOS Simulator:**
```bash
npx expo run:ios
```

**For iOS Physical Device:**
```bash
npx expo run:ios --device
```

**For Android Emulator:**
```bash
npx expo run:android
```

**For Android Physical Device:**
```bash
npx expo run:android --device
```

## ⚠️ Important Notes:

1. **First Time Setup:**
   - iOS: Make sure Xcode is installed
   - Android: Make sure Android Studio and Android SDK are installed

2. **After Rebuild:**
   - **Delete the old app** from your device/simulator
   - Install the newly built app
   - The new icon will appear!

3. **If Using Expo Go:**
   - Custom icons **won't work** in Expo Go
   - You **must** use a development build (`npx expo run:ios/android`)
   - Or create a production build with EAS

## 🔄 Alternative: EAS Build (For Production/TestFlight)

If you want to build for App Store/Play Store:

```bash
# Install EAS CLI
npm install -g eas-cli

# Login
eas login

# Build for iOS
eas build --platform ios

# Build for Android
eas build --platform android
```

## 🐛 Troubleshooting:

**If build fails:**
```bash
# Clean and rebuild
npx expo prebuild --clean
npx expo run:ios  # or run:android
```

**If icon still doesn't update:**
1. Delete the app completely from device
2. Clear Xcode/Android Studio cache
3. Rebuild again


## 🚀 Quick Rebuild (Development Build)

### For iOS:
```bash
# Stop any running Metro bundler (Ctrl+C if running)
# Then run:
npx expo run:ios
```

### For Android:
```bash
# Stop any running Metro bundler (Ctrl+C if running)
# Then run:
npx expo run:android
```

## 📱 Step-by-Step Process:

### 1. **Stop Metro Bundler** (if running)
- Press `Ctrl+C` in the terminal where Metro is running

### 2. **Clear Cache** (optional but recommended)
```bash
npx expo start -c
# Press Ctrl+C after it starts, then rebuild
```

### 3. **Rebuild the App**

**For iOS Simulator:**
```bash
npx expo run:ios
```

**For iOS Physical Device:**
```bash
npx expo run:ios --device
```

**For Android Emulator:**
```bash
npx expo run:android
```

**For Android Physical Device:**
```bash
npx expo run:android --device
```

## ⚠️ Important Notes:

1. **First Time Setup:**
   - iOS: Make sure Xcode is installed
   - Android: Make sure Android Studio and Android SDK are installed

2. **After Rebuild:**
   - **Delete the old app** from your device/simulator
   - Install the newly built app
   - The new icon will appear!

3. **If Using Expo Go:**
   - Custom icons **won't work** in Expo Go
   - You **must** use a development build (`npx expo run:ios/android`)
   - Or create a production build with EAS

## 🔄 Alternative: EAS Build (For Production/TestFlight)

If you want to build for App Store/Play Store:

```bash
# Install EAS CLI
npm install -g eas-cli

# Login
eas login

# Build for iOS
eas build --platform ios

# Build for Android
eas build --platform android
```

## 🐛 Troubleshooting:

**If build fails:**
```bash
# Clean and rebuild
npx expo prebuild --clean
npx expo run:ios  # or run:android
```

**If icon still doesn't update:**
1. Delete the app completely from device
2. Clear Xcode/Android Studio cache
3. Rebuild again


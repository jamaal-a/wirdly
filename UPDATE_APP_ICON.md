# How to Update Your App Icon

## ✅ Your icon file is already in place:
- `./assets/icon.png` (728KB, updated Dec 23)

## 🔄 To see the new icon, you need to rebuild:

### Option 1: Quick Rebuild (Recommended)
```bash
# Clear cache and rebuild
npx expo prebuild --clean
npx expo run:ios
# or for Android:
npx expo run:android
```

### Option 2: If using Expo Go
**Note**: Expo Go uses a default icon and won't show your custom icon. You need a development build or production build to see custom icons.

### Option 3: EAS Build (For Production)
```bash
# Install EAS CLI if not already
npm install -g eas-cli

# Build for iOS
eas build --platform ios

# Build for Android  
eas build --platform android
```

## 📐 Icon Requirements:
- **Size**: 1024x1024 pixels
- **Format**: PNG
- **Background**: Should be transparent or solid color
- **No rounded corners**: iOS/Android will add them automatically

## 🎨 Additional Icons Needed:
1. **icon.png** (1024x1024) - Main app icon ✅
2. **adaptive-icon.png** (1024x1024) - Android adaptive icon (foreground)
3. **splash-icon.png** (1284x2778) - Splash screen
4. **favicon.png** (48x48) - Web favicon

## 💡 Quick Check:
Your current icon.png is 728KB which suggests it might be high resolution. Make sure it's exactly 1024x1024px for best results.

## 🔍 After Rebuild:
1. **Delete the old app** from your device/simulator
2. **Install the newly built app**
3. The new icon should appear!


## ✅ Your icon file is already in place:
- `./assets/icon.png` (728KB, updated Dec 23)

## 🔄 To see the new icon, you need to rebuild:

### Option 1: Quick Rebuild (Recommended)
```bash
# Clear cache and rebuild
npx expo prebuild --clean
npx expo run:ios
# or for Android:
npx expo run:android
```

### Option 2: If using Expo Go
**Note**: Expo Go uses a default icon and won't show your custom icon. You need a development build or production build to see custom icons.

### Option 3: EAS Build (For Production)
```bash
# Install EAS CLI if not already
npm install -g eas-cli

# Build for iOS
eas build --platform ios

# Build for Android  
eas build --platform android
```

## 📐 Icon Requirements:
- **Size**: 1024x1024 pixels
- **Format**: PNG
- **Background**: Should be transparent or solid color
- **No rounded corners**: iOS/Android will add them automatically

## 🎨 Additional Icons Needed:
1. **icon.png** (1024x1024) - Main app icon ✅
2. **adaptive-icon.png** (1024x1024) - Android adaptive icon (foreground)
3. **splash-icon.png** (1284x2778) - Splash screen
4. **favicon.png** (48x48) - Web favicon

## 💡 Quick Check:
Your current icon.png is 728KB which suggests it might be high resolution. Make sure it's exactly 1024x1024px for best results.

## 🔍 After Rebuild:
1. **Delete the old app** from your device/simulator
2. **Install the newly built app**
3. The new icon should appear!


## ✅ Your icon file is already in place:
- `./assets/icon.png` (728KB, updated Dec 23)

## 🔄 To see the new icon, you need to rebuild:

### Option 1: Quick Rebuild (Recommended)
```bash
# Clear cache and rebuild
npx expo prebuild --clean
npx expo run:ios
# or for Android:
npx expo run:android
```

### Option 2: If using Expo Go
**Note**: Expo Go uses a default icon and won't show your custom icon. You need a development build or production build to see custom icons.

### Option 3: EAS Build (For Production)
```bash
# Install EAS CLI if not already
npm install -g eas-cli

# Build for iOS
eas build --platform ios

# Build for Android  
eas build --platform android
```

## 📐 Icon Requirements:
- **Size**: 1024x1024 pixels
- **Format**: PNG
- **Background**: Should be transparent or solid color
- **No rounded corners**: iOS/Android will add them automatically

## 🎨 Additional Icons Needed:
1. **icon.png** (1024x1024) - Main app icon ✅
2. **adaptive-icon.png** (1024x1024) - Android adaptive icon (foreground)
3. **splash-icon.png** (1284x2778) - Splash screen
4. **favicon.png** (48x48) - Web favicon

## 💡 Quick Check:
Your current icon.png is 728KB which suggests it might be high resolution. Make sure it's exactly 1024x1024px for best results.

## 🔍 After Rebuild:
1. **Delete the old app** from your device/simulator
2. **Install the newly built app**
3. The new icon should appear!


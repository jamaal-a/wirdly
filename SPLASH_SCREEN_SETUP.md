# Splash Screen Setup Guide

## ✅ Current Configuration

Your splash screen is already configured in `app.json`:
```json
"splash": {
  "image": "./assets/splash-icon.png",
  "resizeMode": "contain",
  "backgroundColor": "#ffffff"
}
```

---

## 🚀 How to Make It Work

### Step 1: Ensure Splash Image Exists

Check if your splash image file exists:
```bash
ls -lh assets/splash-icon.png
```

If it doesn't exist or you want to replace it:
- Create/replace `./assets/splash-icon.png`
- Recommended size: **1284x2778 pixels** (or similar large size)
- Format: PNG
- Background: White or transparent

---

### Step 2: Rebuild the App

The splash screen is baked into the app bundle, so you need to rebuild:

**For iOS:**
```bash
eas build --platform ios --profile preview
```

**For Android:**
```bash
eas build --platform android --profile preview
```

**Important:** The splash screen won't update in Expo Go or development builds without rebuilding!

---

### Step 3: Test It

1. **Install the newly built app**
2. **Close the app completely** (swipe it away from recent apps)
3. **Open the app again**
4. **You should see the splash screen** for 1-2 seconds before the app loads

---

## 🔧 Troubleshooting

### Splash Screen Not Showing?

**Problem:** Splash screen doesn't appear

**Solutions:**
1. **Make sure the file exists:**
   ```bash
   ls assets/splash-icon.png
   ```

2. **Check file size:**
   - Should be a reasonable size (not too large, not too small)
   - Recommended: 1284x2778 pixels

3. **Rebuild the app:**
   - Splash screen only updates with a new build
   - Development builds don't always show splash screens properly

4. **Check app.json:**
   - Make sure `splash.image` points to the correct file
   - Make sure `splash.backgroundColor` is set

---

### Splash Screen Shows Too Long?

**Problem:** Splash screen stays visible too long

**Solution:** This usually means your app is taking time to load. The splash screen automatically hides when:
- App finishes loading
- JavaScript bundle loads
- App is ready to display

**To speed up:**
- Optimize your app's initialization code
- Reduce bundle size
- Use lazy loading

---

### Splash Screen Shows Wrong Image?

**Problem:** Old splash screen still showing

**Solutions:**
1. **Delete old build:**
   - Uninstall the app from your device
   - Rebuild and reinstall

2. **Clear cache:**
   ```bash
   npx expo prebuild --clean
   ```

3. **Verify file:**
   - Make sure `assets/splash-icon.png` is the correct image
   - Check file size and format

---

## 📐 Splash Screen Requirements

### Image Specifications:
- **Format:** PNG
- **Size:** 1284x2778 pixels (recommended)
  - Or any large size that scales well
  - iOS will resize automatically
  - Android will resize automatically
- **Background:** White (#ffffff) or transparent
- **Content:** Your app logo or branding

### Design Tips:
- Keep it simple and clean
- Use your app logo
- Match your app's color scheme
- Ensure it looks good on different screen sizes

---

## 🎨 Example Splash Screen

A good splash screen typically shows:
- Your app logo (centered)
- App name (optional)
- Simple, clean design
- White or light background

---

## 🔍 Current Setup Check

Let me verify your current setup:

1. **File exists?** ✅ Check with: `ls assets/splash-icon.png`
2. **Configured in app.json?** ✅ Already set up
3. **Rebuilt app?** ⚠️ Need to rebuild to see changes

---

## 💡 Quick Fix

If splash screen isn't working:

1. **Verify the file:**
   ```bash
   ls -lh assets/splash-icon.png
   ```

2. **Rebuild:**
   ```bash
   eas build --platform ios --profile preview
   # or
   eas build --platform android --profile preview
   ```

3. **Reinstall the app** on your device

4. **Test:** Close and reopen the app

---

## ✅ Summary

**To make splash screen work:**
1. ✅ Ensure `assets/splash-icon.png` exists (1284x2778 pixels)
2. ✅ Already configured in `app.json`
3. ⚠️ **Rebuild the app** (required!)
4. ✅ Test by closing and reopening the app

**Note:** Splash screen only works in production/preview builds, not in Expo Go!


## ✅ Current Configuration

Your splash screen is already configured in `app.json`:
```json
"splash": {
  "image": "./assets/splash-icon.png",
  "resizeMode": "contain",
  "backgroundColor": "#ffffff"
}
```

---

## 🚀 How to Make It Work

### Step 1: Ensure Splash Image Exists

Check if your splash image file exists:
```bash
ls -lh assets/splash-icon.png
```

If it doesn't exist or you want to replace it:
- Create/replace `./assets/splash-icon.png`
- Recommended size: **1284x2778 pixels** (or similar large size)
- Format: PNG
- Background: White or transparent

---

### Step 2: Rebuild the App

The splash screen is baked into the app bundle, so you need to rebuild:

**For iOS:**
```bash
eas build --platform ios --profile preview
```

**For Android:**
```bash
eas build --platform android --profile preview
```

**Important:** The splash screen won't update in Expo Go or development builds without rebuilding!

---

### Step 3: Test It

1. **Install the newly built app**
2. **Close the app completely** (swipe it away from recent apps)
3. **Open the app again**
4. **You should see the splash screen** for 1-2 seconds before the app loads

---

## 🔧 Troubleshooting

### Splash Screen Not Showing?

**Problem:** Splash screen doesn't appear

**Solutions:**
1. **Make sure the file exists:**
   ```bash
   ls assets/splash-icon.png
   ```

2. **Check file size:**
   - Should be a reasonable size (not too large, not too small)
   - Recommended: 1284x2778 pixels

3. **Rebuild the app:**
   - Splash screen only updates with a new build
   - Development builds don't always show splash screens properly

4. **Check app.json:**
   - Make sure `splash.image` points to the correct file
   - Make sure `splash.backgroundColor` is set

---

### Splash Screen Shows Too Long?

**Problem:** Splash screen stays visible too long

**Solution:** This usually means your app is taking time to load. The splash screen automatically hides when:
- App finishes loading
- JavaScript bundle loads
- App is ready to display

**To speed up:**
- Optimize your app's initialization code
- Reduce bundle size
- Use lazy loading

---

### Splash Screen Shows Wrong Image?

**Problem:** Old splash screen still showing

**Solutions:**
1. **Delete old build:**
   - Uninstall the app from your device
   - Rebuild and reinstall

2. **Clear cache:**
   ```bash
   npx expo prebuild --clean
   ```

3. **Verify file:**
   - Make sure `assets/splash-icon.png` is the correct image
   - Check file size and format

---

## 📐 Splash Screen Requirements

### Image Specifications:
- **Format:** PNG
- **Size:** 1284x2778 pixels (recommended)
  - Or any large size that scales well
  - iOS will resize automatically
  - Android will resize automatically
- **Background:** White (#ffffff) or transparent
- **Content:** Your app logo or branding

### Design Tips:
- Keep it simple and clean
- Use your app logo
- Match your app's color scheme
- Ensure it looks good on different screen sizes

---

## 🎨 Example Splash Screen

A good splash screen typically shows:
- Your app logo (centered)
- App name (optional)
- Simple, clean design
- White or light background

---

## 🔍 Current Setup Check

Let me verify your current setup:

1. **File exists?** ✅ Check with: `ls assets/splash-icon.png`
2. **Configured in app.json?** ✅ Already set up
3. **Rebuilt app?** ⚠️ Need to rebuild to see changes

---

## 💡 Quick Fix

If splash screen isn't working:

1. **Verify the file:**
   ```bash
   ls -lh assets/splash-icon.png
   ```

2. **Rebuild:**
   ```bash
   eas build --platform ios --profile preview
   # or
   eas build --platform android --profile preview
   ```

3. **Reinstall the app** on your device

4. **Test:** Close and reopen the app

---

## ✅ Summary

**To make splash screen work:**
1. ✅ Ensure `assets/splash-icon.png` exists (1284x2778 pixels)
2. ✅ Already configured in `app.json`
3. ⚠️ **Rebuild the app** (required!)
4. ✅ Test by closing and reopening the app

**Note:** Splash screen only works in production/preview builds, not in Expo Go!


## ✅ Current Configuration

Your splash screen is already configured in `app.json`:
```json
"splash": {
  "image": "./assets/splash-icon.png",
  "resizeMode": "contain",
  "backgroundColor": "#ffffff"
}
```

---

## 🚀 How to Make It Work

### Step 1: Ensure Splash Image Exists

Check if your splash image file exists:
```bash
ls -lh assets/splash-icon.png
```

If it doesn't exist or you want to replace it:
- Create/replace `./assets/splash-icon.png`
- Recommended size: **1284x2778 pixels** (or similar large size)
- Format: PNG
- Background: White or transparent

---

### Step 2: Rebuild the App

The splash screen is baked into the app bundle, so you need to rebuild:

**For iOS:**
```bash
eas build --platform ios --profile preview
```

**For Android:**
```bash
eas build --platform android --profile preview
```

**Important:** The splash screen won't update in Expo Go or development builds without rebuilding!

---

### Step 3: Test It

1. **Install the newly built app**
2. **Close the app completely** (swipe it away from recent apps)
3. **Open the app again**
4. **You should see the splash screen** for 1-2 seconds before the app loads

---

## 🔧 Troubleshooting

### Splash Screen Not Showing?

**Problem:** Splash screen doesn't appear

**Solutions:**
1. **Make sure the file exists:**
   ```bash
   ls assets/splash-icon.png
   ```

2. **Check file size:**
   - Should be a reasonable size (not too large, not too small)
   - Recommended: 1284x2778 pixels

3. **Rebuild the app:**
   - Splash screen only updates with a new build
   - Development builds don't always show splash screens properly

4. **Check app.json:**
   - Make sure `splash.image` points to the correct file
   - Make sure `splash.backgroundColor` is set

---

### Splash Screen Shows Too Long?

**Problem:** Splash screen stays visible too long

**Solution:** This usually means your app is taking time to load. The splash screen automatically hides when:
- App finishes loading
- JavaScript bundle loads
- App is ready to display

**To speed up:**
- Optimize your app's initialization code
- Reduce bundle size
- Use lazy loading

---

### Splash Screen Shows Wrong Image?

**Problem:** Old splash screen still showing

**Solutions:**
1. **Delete old build:**
   - Uninstall the app from your device
   - Rebuild and reinstall

2. **Clear cache:**
   ```bash
   npx expo prebuild --clean
   ```

3. **Verify file:**
   - Make sure `assets/splash-icon.png` is the correct image
   - Check file size and format

---

## 📐 Splash Screen Requirements

### Image Specifications:
- **Format:** PNG
- **Size:** 1284x2778 pixels (recommended)
  - Or any large size that scales well
  - iOS will resize automatically
  - Android will resize automatically
- **Background:** White (#ffffff) or transparent
- **Content:** Your app logo or branding

### Design Tips:
- Keep it simple and clean
- Use your app logo
- Match your app's color scheme
- Ensure it looks good on different screen sizes

---

## 🎨 Example Splash Screen

A good splash screen typically shows:
- Your app logo (centered)
- App name (optional)
- Simple, clean design
- White or light background

---

## 🔍 Current Setup Check

Let me verify your current setup:

1. **File exists?** ✅ Check with: `ls assets/splash-icon.png`
2. **Configured in app.json?** ✅ Already set up
3. **Rebuilt app?** ⚠️ Need to rebuild to see changes

---

## 💡 Quick Fix

If splash screen isn't working:

1. **Verify the file:**
   ```bash
   ls -lh assets/splash-icon.png
   ```

2. **Rebuild:**
   ```bash
   eas build --platform ios --profile preview
   # or
   eas build --platform android --profile preview
   ```

3. **Reinstall the app** on your device

4. **Test:** Close and reopen the app

---

## ✅ Summary

**To make splash screen work:**
1. ✅ Ensure `assets/splash-icon.png` exists (1284x2778 pixels)
2. ✅ Already configured in `app.json`
3. ⚠️ **Rebuild the app** (required!)
4. ✅ Test by closing and reopening the app

**Note:** Splash screen only works in production/preview builds, not in Expo Go!


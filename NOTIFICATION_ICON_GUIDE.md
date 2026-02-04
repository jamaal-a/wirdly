# Notification Icon Guide

## 📱 What Image to Edit

The notification pop-up uses your **app icon** automatically. You need to edit:

### For iOS:
- **File:** `./assets/icon.png`
- **Size:** 1024x1024 pixels
- **Format:** PNG

### For Android:
- **File:** `./assets/adaptive-icon.png` (foreground)
- **Size:** 1024x1024 pixels
- **Format:** PNG
- **Background:** Set in `app.json` under `android.adaptiveIcon.backgroundColor`

---

## 🎯 Quick Answer

**Edit these files:**
1. **`./assets/icon.png`** - Main app icon (used for iOS notifications and as fallback)
2. **`./assets/adaptive-icon.png`** - Android adaptive icon foreground (used for Android notifications)

Both should be **1024x1024 pixels** PNG files.

---

## 📝 Current Configuration

In your `app.json`:
```json
{
  "icon": "./assets/icon.png",  // iOS and general app icon
  "android": {
    "adaptiveIcon": {
      "foregroundImage": "./assets/adaptive-icon.png",  // Android notification icon
      "backgroundColor": "#ffffff"
    }
  }
}
```

---

## 🔧 How to Update

1. **Edit the icon files:**
   - Replace `./assets/icon.png` with your new icon (1024x1024)
   - Replace `./assets/adaptive-icon.png` with your new icon (1024x1024)

2. **Rebuild the app:**
   ```bash
   # For iOS
   eas build --platform ios --profile preview
   
   # For Android
   eas build --platform android --profile preview
   ```

3. **Test notifications:**
   - Create a test reminder
   - Wait for notification
   - Check if new icon appears ✅

---

## 📐 Icon Requirements

### iOS (`icon.png`):
- **Size:** 1024x1024 pixels
- **Format:** PNG
- **Background:** Can be transparent or solid
- **No rounded corners:** iOS adds them automatically

### Android (`adaptive-icon.png`):
- **Size:** 1024x1024 pixels
- **Format:** PNG
- **Safe zone:** Keep important content in center 512x512 area
- **Background:** Set separately in `app.json`

---

## 💡 Pro Tips

1. **Use the same icon** for both iOS and Android for consistency
2. **Keep important elements centered** (especially for Android adaptive icon)
3. **Test on both platforms** - icons may render slightly differently
4. **After updating icons, rebuild the app** - icons are baked into the app bundle

---

## 🔍 Where Icons Appear

- **Notification pop-up** (lock screen, notification center)
- **App icon** (home screen)
- **App switcher** (recent apps)
- **Settings** (app settings page)

All use the same icon files, so editing them updates everywhere!

---

## ✅ Summary

**To change the notification icon:**
1. Edit `./assets/icon.png` (1024x1024)
2. Edit `./assets/adaptive-icon.png` (1024x1024)
3. Rebuild the app
4. Test notifications

That's it! The notification will automatically use your new icon.


# How to Make Splash Screen Work

## ✅ Good News: It's Already Configured!

Your splash screen is already set up in `app.json`:
```json
"splash": {
  "image": "./assets/splash-icon.png",
  "resizeMode": "contain",
  "backgroundColor": "#ffffff"
}
```

And your splash image file exists: `assets/splash-icon.png` (439KB)

---

## 🚀 How to Make It Work

### Step 1: Rebuild the App

**The splash screen is baked into the native app bundle**, so you MUST rebuild:

```bash
# For iOS
eas build --platform ios --profile preview

# For Android
eas build --platform android --profile preview
```

**Important:** 
- ❌ Won't work in Expo Go
- ❌ Won't update in development builds without rebuilding
- ✅ Only works in production/preview builds

---

### Step 2: Test It

1. **Install the newly built app** on your device
2. **Close the app completely** (swipe it away from recent apps)
3. **Open the app again**
4. **You should see the splash screen** (`splash-icon.png`) for 1-2 seconds
5. **Then the app loads**

---

## 🔍 Why It Might Not Be Working

### Problem 1: Using Expo Go
**Solution:** Splash screens don't work in Expo Go. You need a built app.

### Problem 2: Haven't Rebuilt
**Solution:** Rebuild the app - splash screen is part of the native bundle.

### Problem 3: App Loads Too Fast
**Solution:** This is actually good! The splash screen shows while the app initializes, then disappears when ready.

### Problem 4: Wrong Image Not Showing
**Solution:** 
- Check `assets/splash-icon.png` exists
- Verify it's the image you want
- Rebuild after changing it

---

## 📐 Image Requirements

Your splash image should be:
- **Format:** PNG
- **Size:** 1284x2778 pixels (recommended) or any large size
- **Background:** White (#ffffff) or transparent
- **Content:** Your app logo/branding

---

## ✅ Quick Checklist

- [x] Splash configured in `app.json` ✅
- [x] `splash-icon.png` file exists ✅
- [ ] **Rebuilt the app** ⚠️ (You need to do this!)
- [ ] Tested by closing and reopening app

---

## 🎯 Summary

**To make splash screen work:**
1. ✅ Already configured in `app.json`
2. ✅ Image file exists
3. ⚠️ **Rebuild the app** (required!)
4. ✅ Test by closing and reopening

**The splash screen will automatically:**
- Show when app launches
- Display your `splash-icon.png` image
- Hide when app is ready (usually 1-2 seconds)

---

## 💡 Pro Tip

If you want to control when the splash screen hides (keep it visible longer), you can install `expo-splash-screen`:

```bash
npx expo install expo-splash-screen
```

Then in `App.tsx`, you can keep it visible until your app is ready. But for most cases, the automatic splash screen works fine!


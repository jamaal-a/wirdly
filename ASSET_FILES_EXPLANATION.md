# Asset Files Explanation

## 📱 What Each Image File Is For

### 1. `icon.png` (Main App Icon)
- **What it is:** Your app's main icon
- **Where it appears:**
  - Home screen (iOS & Android)
  - App Store / Play Store listing
  - Notification pop-ups (iOS)
  - App switcher
  - Settings pages
- **Size:** 1024x1024 pixels
- **Format:** PNG
- **Location:** `./assets/icon.png`

---

### 2. `adaptive-icon.png
**What it is:** Android adaptive icon foreground
- **Where it appears:**
  - Android home screen
  - Android notification pop-ups
  - Android app switcher
- **Size:** 1024x1024 pixels
- **Format:** PNG
- **Location:** `./assets/adaptive-icon.png`
- **Note:** Android uses this with a background color (set in `app.json`)

---

### 3. `splash-icon.png` (Splash Screen)
- **What it is:** The image shown when your app is launching/loading
- **Where it appears:**
  - First screen users see when opening the app
  - Shows while the app is loading
  - Disappears once the app is ready
- **Size:** Recommended 1284x2778 pixels (or similar large size)
- **Format:** PNG
- **Location:** `./assets/splash-icon.png`
- **Background:** White (set in `app.json` as `backgroundColor: "#ffffff"`)

**Example:** When you tap your app icon, you see the splash screen for 1-2 seconds before the app loads.

---

### 4. `favicon.png` (Web Icon)
- **What it is:** Icon for web version of your app
- **Where it appears:**
  - Browser tab (when app is open in browser)
  - Browser bookmarks
  - Web app shortcuts
- **Size:** 48x48 pixels (or 32x32)
- **Format:** PNG
- **Location:** `./assets/favicon.png`
- **Note:** Only used if you deploy a web version of your app

---

## 📋 Summary Table

| File | Size | Used For | Platform |
|------|------|----------|----------|
| `icon.png` | 1024x1024 | App icon, iOS notifications | iOS, General |
| `adaptive-icon.png` | 1024x1024 | Android app icon, Android notifications | Android |
| `splash-icon.png` | 1284x2778 | Loading screen when app opens | iOS, Android |
| `favicon.png` | 48x48 | Browser tab icon (web version) | Web |

---

## 🎯 Which Ones Do You Need?

### For Mobile App (iOS & Android):
- ✅ **`icon.png`** - Required (main app icon)
- ✅ **`adaptive-icon.png`** - Required (Android icon)
- ✅ **`splash-icon.png`** - Required (loading screen)

### For Web Version:
- ✅ **`favicon.png`** - Only if you deploy a web version

---

## 💡 Quick Tips

1. **Splash Screen:** Usually shows your app logo or name
   - Keep it simple and clean
   - Matches your app's branding
   - Should load quickly

2. **Favicon:** Only needed if you plan to have a web version
   - Small icon that appears in browser tabs
   - Can be a simplified version of your app icon

3. **Icons:** Should be recognizable at small sizes
   - Test how they look at different sizes
   - Keep important elements centered

---

## 🔍 Current Configuration

In your `app.json`:
```json
{
  "icon": "./assets/icon.png",              // Main app icon
  "splash": {
    "image": "./assets/splash-icon.png",    // Loading screen
    "backgroundColor": "#ffffff"            // White background
  },
  "android": {
    "adaptiveIcon": {
      "foregroundImage": "./assets/adaptive-icon.png",  // Android icon
      "backgroundColor": "#ffffff"
    }
  },
  "web": {
    "favicon": "./assets/favicon.png"       // Web browser icon
  }
}
```

---

## ✅ What You Should Focus On

**Most Important:**
1. **`icon.png`** - Your main app icon (appears everywhere)
2. **`adaptive-icon.png`** - Android version of your icon
3. **`splash-icon.png`** - First impression when users open your app

**Optional:**
- **`favicon.png`** - Only if you're making a web version

---

## 🎨 Design Tips

**Splash Screen:**
- Use your app logo
- Keep it simple
- White background works well
- Should match your app's style

**Favicon:**
- Simplified version of your icon
- Should be readable at 16x16 pixels
- Usually just your logo or first letter


## 📱 What Each Image File Is For

### 1. `icon.png` (Main App Icon)
- **What it is:** Your app's main icon
- **Where it appears:**
  - Home screen (iOS & Android)
  - App Store / Play Store listing
  - Notification pop-ups (iOS)
  - App switcher
  - Settings pages
- **Size:** 1024x1024 pixels
- **Format:** PNG
- **Location:** `./assets/icon.png`

---

### 2. `adaptive-icon.png
**What it is:** Android adaptive icon foreground
- **Where it appears:**
  - Android home screen
  - Android notification pop-ups
  - Android app switcher
- **Size:** 1024x1024 pixels
- **Format:** PNG
- **Location:** `./assets/adaptive-icon.png`
- **Note:** Android uses this with a background color (set in `app.json`)

---

### 3. `splash-icon.png` (Splash Screen)
- **What it is:** The image shown when your app is launching/loading
- **Where it appears:**
  - First screen users see when opening the app
  - Shows while the app is loading
  - Disappears once the app is ready
- **Size:** Recommended 1284x2778 pixels (or similar large size)
- **Format:** PNG
- **Location:** `./assets/splash-icon.png`
- **Background:** White (set in `app.json` as `backgroundColor: "#ffffff"`)

**Example:** When you tap your app icon, you see the splash screen for 1-2 seconds before the app loads.

---

### 4. `favicon.png` (Web Icon)
- **What it is:** Icon for web version of your app
- **Where it appears:**
  - Browser tab (when app is open in browser)
  - Browser bookmarks
  - Web app shortcuts
- **Size:** 48x48 pixels (or 32x32)
- **Format:** PNG
- **Location:** `./assets/favicon.png`
- **Note:** Only used if you deploy a web version of your app

---

## 📋 Summary Table

| File | Size | Used For | Platform |
|------|------|----------|----------|
| `icon.png` | 1024x1024 | App icon, iOS notifications | iOS, General |
| `adaptive-icon.png` | 1024x1024 | Android app icon, Android notifications | Android |
| `splash-icon.png` | 1284x2778 | Loading screen when app opens | iOS, Android |
| `favicon.png` | 48x48 | Browser tab icon (web version) | Web |

---

## 🎯 Which Ones Do You Need?

### For Mobile App (iOS & Android):
- ✅ **`icon.png`** - Required (main app icon)
- ✅ **`adaptive-icon.png`** - Required (Android icon)
- ✅ **`splash-icon.png`** - Required (loading screen)

### For Web Version:
- ✅ **`favicon.png`** - Only if you deploy a web version

---

## 💡 Quick Tips

1. **Splash Screen:** Usually shows your app logo or name
   - Keep it simple and clean
   - Matches your app's branding
   - Should load quickly

2. **Favicon:** Only needed if you plan to have a web version
   - Small icon that appears in browser tabs
   - Can be a simplified version of your app icon

3. **Icons:** Should be recognizable at small sizes
   - Test how they look at different sizes
   - Keep important elements centered

---

## 🔍 Current Configuration

In your `app.json`:
```json
{
  "icon": "./assets/icon.png",              // Main app icon
  "splash": {
    "image": "./assets/splash-icon.png",    // Loading screen
    "backgroundColor": "#ffffff"            // White background
  },
  "android": {
    "adaptiveIcon": {
      "foregroundImage": "./assets/adaptive-icon.png",  // Android icon
      "backgroundColor": "#ffffff"
    }
  },
  "web": {
    "favicon": "./assets/favicon.png"       // Web browser icon
  }
}
```

---

## ✅ What You Should Focus On

**Most Important:**
1. **`icon.png`** - Your main app icon (appears everywhere)
2. **`adaptive-icon.png`** - Android version of your icon
3. **`splash-icon.png`** - First impression when users open your app

**Optional:**
- **`favicon.png`** - Only if you're making a web version

---

## 🎨 Design Tips

**Splash Screen:**
- Use your app logo
- Keep it simple
- White background works well
- Should match your app's style

**Favicon:**
- Simplified version of your icon
- Should be readable at 16x16 pixels
- Usually just your logo or first letter


## 📱 What Each Image File Is For

### 1. `icon.png` (Main App Icon)
- **What it is:** Your app's main icon
- **Where it appears:**
  - Home screen (iOS & Android)
  - App Store / Play Store listing
  - Notification pop-ups (iOS)
  - App switcher
  - Settings pages
- **Size:** 1024x1024 pixels
- **Format:** PNG
- **Location:** `./assets/icon.png`

---

### 2. `adaptive-icon.png
**What it is:** Android adaptive icon foreground
- **Where it appears:**
  - Android home screen
  - Android notification pop-ups
  - Android app switcher
- **Size:** 1024x1024 pixels
- **Format:** PNG
- **Location:** `./assets/adaptive-icon.png`
- **Note:** Android uses this with a background color (set in `app.json`)

---

### 3. `splash-icon.png` (Splash Screen)
- **What it is:** The image shown when your app is launching/loading
- **Where it appears:**
  - First screen users see when opening the app
  - Shows while the app is loading
  - Disappears once the app is ready
- **Size:** Recommended 1284x2778 pixels (or similar large size)
- **Format:** PNG
- **Location:** `./assets/splash-icon.png`
- **Background:** White (set in `app.json` as `backgroundColor: "#ffffff"`)

**Example:** When you tap your app icon, you see the splash screen for 1-2 seconds before the app loads.

---

### 4. `favicon.png` (Web Icon)
- **What it is:** Icon for web version of your app
- **Where it appears:**
  - Browser tab (when app is open in browser)
  - Browser bookmarks
  - Web app shortcuts
- **Size:** 48x48 pixels (or 32x32)
- **Format:** PNG
- **Location:** `./assets/favicon.png`
- **Note:** Only used if you deploy a web version of your app

---

## 📋 Summary Table

| File | Size | Used For | Platform |
|------|------|----------|----------|
| `icon.png` | 1024x1024 | App icon, iOS notifications | iOS, General |
| `adaptive-icon.png` | 1024x1024 | Android app icon, Android notifications | Android |
| `splash-icon.png` | 1284x2778 | Loading screen when app opens | iOS, Android |
| `favicon.png` | 48x48 | Browser tab icon (web version) | Web |

---

## 🎯 Which Ones Do You Need?

### For Mobile App (iOS & Android):
- ✅ **`icon.png`** - Required (main app icon)
- ✅ **`adaptive-icon.png`** - Required (Android icon)
- ✅ **`splash-icon.png`** - Required (loading screen)

### For Web Version:
- ✅ **`favicon.png`** - Only if you deploy a web version

---

## 💡 Quick Tips

1. **Splash Screen:** Usually shows your app logo or name
   - Keep it simple and clean
   - Matches your app's branding
   - Should load quickly

2. **Favicon:** Only needed if you plan to have a web version
   - Small icon that appears in browser tabs
   - Can be a simplified version of your app icon

3. **Icons:** Should be recognizable at small sizes
   - Test how they look at different sizes
   - Keep important elements centered

---

## 🔍 Current Configuration

In your `app.json`:
```json
{
  "icon": "./assets/icon.png",              // Main app icon
  "splash": {
    "image": "./assets/splash-icon.png",    // Loading screen
    "backgroundColor": "#ffffff"            // White background
  },
  "android": {
    "adaptiveIcon": {
      "foregroundImage": "./assets/adaptive-icon.png",  // Android icon
      "backgroundColor": "#ffffff"
    }
  },
  "web": {
    "favicon": "./assets/favicon.png"       // Web browser icon
  }
}
```

---

## ✅ What You Should Focus On

**Most Important:**
1. **`icon.png`** - Your main app icon (appears everywhere)
2. **`adaptive-icon.png`** - Android version of your icon
3. **`splash-icon.png`** - First impression when users open your app

**Optional:**
- **`favicon.png`** - Only if you're making a web version

---

## 🎨 Design Tips

**Splash Screen:**
- Use your app logo
- Keep it simple
- White background works well
- Should match your app's style

**Favicon:**
- Simplified version of your icon
- Should be readable at 16x16 pixels
- Usually just your logo or first letter


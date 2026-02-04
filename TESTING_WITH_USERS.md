# Testing with Select Users

## 🧪 Option 1: TestFlight (Recommended for iOS)

TestFlight is Apple's official beta testing platform. It's free and allows you to invite up to 10,000 testers.

### Setup Steps:

1. **Build for TestFlight:**
   ```bash
   eas build --platform ios --profile production
   ```

2. **Submit to App Store Connect:**
   ```bash
   eas submit --platform ios
   ```

3. **Add Testers in App Store Connect:**
   - Go to [appstoreconnect.apple.com](https://appstoreconnect.apple.com)
   - Navigate to your app → TestFlight
   - Click "Internal Testing" or "External Testing"
   - Add tester emails (they'll receive an invite)
   - Testers install TestFlight app, then your app

### Benefits:
- ✅ Official Apple platform
- ✅ Easy to manage testers
- ✅ Automatic updates
- ✅ Up to 10,000 testers
- ✅ Feedback collection built-in

---

## 📱 Option 2: EAS Build Internal Distribution

Share a direct download link with testers (no App Store needed).

### Setup Steps:

1. **Build for Internal Distribution:**
   ```bash
   eas build --platform ios --profile preview
   ```

2. **Get Download Link:**
   - After build completes, you'll get a URL
   - Share this URL with your testers

3. **Testers Install:**
   - Open link on iPhone
   - Tap "Install"
   - Go to Settings > General > VPN & Device Management
   - Trust the developer certificate
   - App installs

### Benefits:
- ✅ No App Store review needed
- ✅ Quick distribution
- ✅ Works immediately
- ⚠️ Limited to 100 devices per year (free Apple Developer account)

---

## 🔗 Option 3: Ad Hoc Distribution

For a small group of specific devices.

### Setup Steps:

1. **Get Device UDIDs:**
   - Ask testers to send their device UDID
   - They can find it in Settings > General > About > Identifier (UDID)

2. **Register Devices:**
   ```bash
   # EAS will prompt you to add devices during build
   eas build --platform ios --profile development
   ```

3. **Share Build:**
   - Download link is provided after build
   - Share with registered testers only

### Benefits:
- ✅ Works without App Store
- ✅ No review process
- ⚠️ Limited to 100 devices per year

---

## 📊 Comparison

| Method | Max Testers | App Store | Setup Time | Best For |
|-------|-------------|-----------|------------|----------|
| TestFlight | 10,000 | Yes | 30 min | Large groups |
| Internal Distribution | 100 | No | 5 min | Quick testing |
| Ad Hoc | 100 | No | 10 min | Specific devices |

---

## 🚀 Quick Start (Recommended: TestFlight)

```bash
# 1. Build for production
eas build --platform ios --profile production

# 2. Submit to App Store Connect
eas submit --platform ios

# 3. Add testers in App Store Connect dashboard
# 4. Testers receive email invite
# 5. They install TestFlight and your app
```

---

## 📝 Notes:

- **TestFlight** requires App Store Connect account (free with Apple Developer account)
- **Internal Distribution** works immediately but limited to 100 devices
- **Ad Hoc** requires device UDIDs upfront
- All methods preserve your new app icon ✅

---

## 🤖 For Android Testing:

### Option 1: Google Play Internal Testing (Recommended)

**Best for:** Official distribution, automatic updates, up to 20,000 testers

#### Setup Steps:

1. **Build for Production:**
   ```bash
   eas build --platform android --profile production
   ```

2. **Submit to Google Play:**
   ```bash
   eas submit --platform android
   ```

3. **Add Testers in Google Play Console:**
   - Go to [play.google.com/console](https://play.google.com/console)
   - Select your app → Testing → Internal testing
   - Click "Create release"
   - Upload the APK/AAB from EAS build
   - Add tester emails or create a testing link
   - Testers get an email invite or can join via link

#### Benefits:
- ✅ Official Google platform
- ✅ Automatic updates
- ✅ Up to 20,000 testers
- ✅ Easy feedback collection
- ✅ No manual installation needed

---

### Option 2: EAS Build Internal Distribution (Quick Testing)

**Best for:** Quick testing without Google Play setup

#### Setup Steps:

1. **Build for Internal Distribution:**
   ```bash
   eas build --platform android --profile preview
   ```

2. **Get Download Link:**
   - After build completes, you'll get a URL
   - Share this URL with your testers

3. **Testers Install:**
   - Open link on Android device
   - Tap "Download" or "Install"
   - May need to enable "Install from unknown sources" in Settings
   - Install the APK

#### Benefits:
- ✅ No Google Play account needed
- ✅ Works immediately
- ✅ Quick distribution
- ⚠️ Testers need to enable "Unknown sources"

---

### Option 3: Firebase App Distribution

**Best for:** Advanced testing with crash reports and analytics

#### Setup Steps:

1. **Install Firebase CLI:**
   ```bash
   npm install -g firebase-tools
   ```

2. **Login to Firebase:**
   ```bash
   firebase login
   ```

3. **Build Android App:**
   ```bash
   eas build --platform android --profile preview
   ```

4. **Upload to Firebase:**
   ```bash
   firebase appdistribution:distribute <path-to-apk> \
     --app <your-firebase-app-id> \
     --groups "testers"
   ```

5. **Add Testers:**
   - Go to Firebase Console → App Distribution
   - Add tester emails
   - They'll receive download links

#### Benefits:
- ✅ Crash reports
- ✅ Analytics
- ✅ Easy tester management
- ✅ Automatic notifications

---

### Option 4: Direct APK Sharing

**Best for:** Small group, one-time testing

#### Setup Steps:

1. **Build APK:**
   ```bash
   eas build --platform android --profile preview
   ```

2. **Download APK:**
   - Download the APK from EAS build page
   - Share via email, Google Drive, Dropbox, etc.

3. **Testers Install:**
   - Download APK on Android device
   - Enable "Install from unknown sources"
   - Tap the APK file to install

---

## 📊 Android vs iOS Testing Comparison

| Method | Platform | Max Testers | Setup Time | Best For |
|-------|----------|-------------|------------|----------|
| Google Play Internal | Android | 20,000 | 30 min | Large groups |
| EAS Internal | Android | Unlimited | 5 min | Quick testing |
| Firebase Distribution | Android | Unlimited | 20 min | Advanced features |
| Direct APK | Android | Unlimited | 2 min | Small groups |
| TestFlight | iOS | 10,000 | 30 min | Large groups |

---

## 🚀 Quick Start for Android (Recommended: Google Play Internal)

```bash
# 1. Build for production
eas build --platform android --profile production

# 2. Submit to Google Play
eas submit --platform android

# 3. Add testers in Google Play Console → Internal Testing
# 4. Testers receive email invite
# 5. They install from Google Play
```

---

## 📝 Notes:

- **Google Play Internal Testing** requires Google Play Developer account ($25 one-time fee)
- **EAS Internal Distribution** works immediately, no account needed
- **Firebase App Distribution** is free but requires Firebase project
- **Direct APK** sharing works but testers need to enable "Unknown sources"
- All methods preserve your new app icon ✅

---

## 🔧 Troubleshooting Android Installation:

**"Install blocked" error:**
- Go to Settings → Security → Enable "Install from unknown sources"
- Or Settings → Apps → Special access → Install unknown apps

**"App not installed" error:**
- Uninstall any previous version first
- Check if device architecture matches (ARM64, x86, etc.)
- Try downloading APK again

**Build fails:**
- Check `eas.json` has Android configuration
- Verify `app.json` has Android package name
- Check build logs in EAS dashboard


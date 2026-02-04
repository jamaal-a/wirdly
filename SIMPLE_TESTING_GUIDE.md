# Simple Guide: Testing with Select Users

## 🎯 Quick Answer

**Easiest way:** Build the app, get a download link, share it with testers. They install it on their phones.

---

## 📱 For iPhone Users

### Method 1: Direct Download (Easiest - No App Store)

**Step 1: Build the app**
```bash
eas build --platform ios --profile preview
```

**Step 2: Wait for build** (10-20 minutes)
- You'll get a link like: `https://expo.dev/artifacts/...`

**Step 3: Share the link**
- Send the link to your testers via email, WhatsApp, etc.

**Step 4: Testers install**
- They open the link on their iPhone
- Tap "Install"
- Go to **Settings > General > VPN & Device Management**
- Tap on the developer profile
- Tap **"Trust"**
- App installs! ✅

**Limitations:**
- Works for up to 100 devices per year (free Apple Developer account)
- Testers need to trust the developer certificate (one-time)

---

### Method 2: TestFlight (Best for Many Testers)

**Step 1: Build for production**
```bash
eas build --platform ios --profile production
```

**Step 2: Submit to App Store**
```bash
eas submit --platform ios
```
(You'll need to provide your Apple ID when prompted)

**Step 3: Add testers**
- Go to [appstoreconnect.apple.com](https://appstoreconnect.apple.com)
- Select your app → **TestFlight** tab
- Click **"Internal Testing"** or **"External Testing"**
- Add tester email addresses
- They'll receive an email invite

**Step 4: Testers install**
- They install **TestFlight** app from App Store (free)
- Open the email invite
- Tap "View in TestFlight"
- Install your app ✅

**Benefits:**
- Up to 10,000 testers
- Automatic updates
- Easy to manage
- Official Apple platform

---

## 🤖 For Android Users

### Method 1: Direct Download (Easiest)

**Step 1: Build the app**
```bash
eas build --platform android --profile preview
```

**Step 2: Wait for build** (10-20 minutes)
- You'll get a download link

**Step 3: Share the link**
- Send to testers via email, WhatsApp, etc.

**Step 4: Testers install**
- They open the link on their Android phone
- Tap "Download" or "Install"
- If prompted, enable **"Install from unknown sources"**:
  - Go to **Settings > Security** (or **Apps > Special access**)
  - Enable **"Install unknown apps"** for their browser
- Tap the downloaded APK file
- Install ✅

**No device limit!** Works for unlimited testers.

---

### Method 2: Google Play Internal Testing (Best for Many Testers)

**Step 1: Build for production**
```bash
eas build --platform android --profile production
```

**Step 2: Submit to Google Play**
```bash
eas submit --platform android
```

**Step 3: Add testers**
- Go to [play.google.com/console](https://play.google.com/console)
- Select your app → **Testing** → **Internal testing**
- Click **"Create release"**
- Upload the APK/AAB
- Add tester emails or create a testing link

**Step 4: Testers install**
- They get an email invite OR use the testing link
- Install from Google Play ✅

**Benefits:**
- Up to 20,000 testers
- Automatic updates
- Official Google platform

---

## 🚀 Quick Start (Recommended)

### For iPhone (Quick Testing):
```bash
# 1. Build
eas build --platform ios --profile preview

# 2. Share the download link with testers
# 3. They install and trust the certificate
```

### For Android (Quick Testing):
```bash
# 1. Build
eas build --platform android --profile preview

# 2. Share the download link with testers
# 3. They enable "Install from unknown sources" and install
```

### For Both (Official Testing):
```bash
# iOS
eas build --platform ios --profile production
eas submit --platform ios
# Then add testers in App Store Connect → TestFlight

# Android
eas build --platform android --profile production
eas submit --platform android
# Then add testers in Google Play Console → Internal Testing
```

---

## 📋 What You Need

### For Direct Download (Preview):
- ✅ Expo account (free)
- ✅ EAS CLI installed (`npm install -g eas-cli`)
- ✅ Logged in (`eas login`)

### For TestFlight/Google Play:
- ✅ Apple Developer account ($99/year) OR Google Play Developer account ($25 one-time)
- ✅ Expo account
- ✅ EAS CLI

---

## ⚠️ Important Notes

**iPhone:**
- Direct download works for up to 100 devices per year (free account)
- TestFlight requires paid Apple Developer account ($99/year)
- Testers need to trust the developer certificate (one-time per device)

**Android:**
- Direct download works for unlimited devices
- Google Play Internal Testing requires Google Play Developer account ($25 one-time)
- Testers may need to enable "Install from unknown sources"

---

## 🎯 Which Method Should I Use?

| Situation | Recommended Method |
|-----------|-------------------|
| Testing with 1-5 people | Direct download (preview) |
| Testing with 10-100 people | TestFlight (iOS) or Google Play Internal (Android) |
| Testing with 100+ people | TestFlight (iOS) or Google Play Internal (Android) |
| Quick testing, no setup | Direct download (preview) |
| Official beta program | TestFlight (iOS) or Google Play Internal (Android) |

---

## 💡 Pro Tips

1. **Start with preview builds** - Quick and easy, no accounts needed
2. **Use TestFlight/Google Play** - When you have many testers or want automatic updates
3. **Share build links** - Via email, WhatsApp, or a shared document
4. **Test on both platforms** - Build for both iOS and Android separately

---

## ❓ Common Questions

**Q: Do testers need to pay anything?**  
A: No, testing is free for them.

**Q: How long does a build take?**  
A: First build: 10-20 minutes. Subsequent builds: 5-10 minutes.

**Q: Can I update the app for testers?**  
A: Yes! Build a new version and share the new link, or use TestFlight/Google Play for automatic updates.

**Q: Do testers need special apps?**  
A: Only for TestFlight (they need the TestFlight app). Direct download works with just a browser.

---

## 🎬 Example Workflow

1. **You build:** `eas build --platform ios --profile preview`
2. **Wait 15 minutes** (grab coffee ☕)
3. **Copy the download link** from EAS dashboard
4. **Send to testers:** "Hey! Here's the test version: [link]"
5. **Testers install** on their phones
6. **They test and give feedback** ✅

That's it! Simple and straightforward.


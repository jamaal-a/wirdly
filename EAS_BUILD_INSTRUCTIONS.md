# Build and Install on iPhone Without USB

## 🚀 Quick Method: EAS Build

### Step 1: Run the build command
```bash
eas build --platform ios --profile development
```

### Step 2: When prompted for Apple credentials:
- Enter your **Apple ID email** (the one you use for App Store)
- Enter your **Apple ID password**
- If you have 2FA enabled, you'll get a code to enter

**Why it needs this:**
- To sign the app so it can run on your iPhone
- EAS securely stores credentials (doesn't share them)

### Step 3: Wait for build (10-20 minutes)
- Build happens in the cloud
- You'll get a QR code and download link

### Step 4: Install on your iPhone
1. Open the download link on your iPhone (from the build output)
2. Tap "Install"
3. Go to **Settings > General > VPN & Device Management**
4. Tap on the developer profile
5. Tap **"Trust"**
6. The app will install with your new icon!

## 🔒 Alternative: Use Preview Profile (No Apple ID needed, but limited)

If you don't want to provide Apple credentials, you can use the preview profile, but it has limitations:

```bash
eas build --platform ios --profile preview
```

**Note:** Preview builds may have restrictions and might not work on all devices.

## 📱 What You'll Get:

After the build completes, you'll see:
- A QR code (scan with iPhone camera)
- A direct download link
- Instructions to install

**No USB connection needed!** Just download and install wirelessly.

## ⚠️ Important:

- The first build takes 10-20 minutes
- You need an Expo account (you're already logged in as "jamaal1")
- Apple credentials are only used for code signing (secure)


# Development Client Setup

## 🔧 Current Situation:
You built with `--profile development`, which creates a **development client**. This is like Expo Go but for your custom app - it needs to connect to a Metro bundler to run.

## ✅ Solution 1: Start Metro Bundler (What I Just Did)

I've started the Metro bundler. Now:

1. **Open your app** on your iPhone
2. **Shake your device** or use the dev menu
3. **Select "Enter URL manually"** or scan the QR code
4. Enter the Metro URL (usually shown in terminal)

Or the app should automatically connect if you're on the same network.

## 🚀 Solution 2: Build with Bundled App (No Dev Server Needed)

If you want the app to work standalone (no dev server), rebuild with the **preview** profile:

```bash
eas build --platform ios --profile preview
```

This bundles your app code into the build, so it works without a dev server.

## 📱 Solution 3: Use Tunnel Mode

If you're not on the same network:

1. In Metro, press `s` to open settings
2. Select **"Tunnel"** connection mode
3. Scan the new QR code with your iPhone

## 🔍 Quick Check:

**If you see "No dev servers":**
- Make sure Metro is running (I started it for you)
- Make sure your iPhone and Mac are on the same Wi-Fi network
- Or use Tunnel mode in Metro

**To see Metro URL:**
- Check the terminal where Metro is running
- Look for a URL like `exp://192.168.x.x:8081` or `exp://u.expo.dev/...`


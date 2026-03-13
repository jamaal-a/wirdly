# How to Connect Your iPhone 16 Pro Max for Building

## 📱 Steps to Connect Your iPhone:

### 1. **Connect via USB Cable**
- Plug your iPhone 16 Pro Max into your Mac with a USB-C or Lightning cable

### 2. **Trust Your Computer**
- On your iPhone, you'll see a popup: "Trust This Computer?"
- Tap **"Trust"**
- Enter your iPhone passcode if prompted

### 3. **Enable Developer Mode** (iOS 16+)
- Go to **Settings** > **Privacy & Security**
- Scroll down to **Developer Mode**
- Toggle it **ON**
- Your iPhone will restart

### 4. **Verify Connection**
Run this command to check if your device is detected:
```bash
xcrun xctrace list devices
```
You should see your iPhone listed under "== Devices =="

### 5. **Build for Your Device**
Once connected and trusted:
```bash
npx expo run:ios --device
```

## 🔧 If Device Still Doesn't Show:

### Check Xcode:
1. Open **Xcode**
2. Go to **Window** > **Devices and Simulators** (or press `Cmd+Shift+2`)
3. Your iPhone should appear in the left sidebar
4. If it shows "This device is not registered", you may need to:
   - Sign in with your Apple ID in Xcode
   - Or register the device manually

### Alternative: Use Simulator
If you just want to see the icon quickly, you can use a simulator:
```bash
# Boot a simulator first
xcrun simctl boot "iPhone 17 Pro Max"

# Then build
npx expo run:ios -d "iPhone 17 Pro Max"
```

## ✅ Benefits of Building on Physical Device:
- See the actual app icon on your home screen
- Test performance on real hardware
- Test features that don't work in simulator (camera, notifications, etc.)


## 📱 Steps to Connect Your iPhone:

### 1. **Connect via USB Cable**
- Plug your iPhone 16 Pro Max into your Mac with a USB-C or Lightning cable

### 2. **Trust Your Computer**
- On your iPhone, you'll see a popup: "Trust This Computer?"
- Tap **"Trust"**
- Enter your iPhone passcode if prompted

### 3. **Enable Developer Mode** (iOS 16+)
- Go to **Settings** > **Privacy & Security**
- Scroll down to **Developer Mode**
- Toggle it **ON**
- Your iPhone will restart

### 4. **Verify Connection**
Run this command to check if your device is detected:
```bash
xcrun xctrace list devices
```
You should see your iPhone listed under "== Devices =="

### 5. **Build for Your Device**
Once connected and trusted:
```bash
npx expo run:ios --device
```

## 🔧 If Device Still Doesn't Show:

### Check Xcode:
1. Open **Xcode**
2. Go to **Window** > **Devices and Simulators** (or press `Cmd+Shift+2`)
3. Your iPhone should appear in the left sidebar
4. If it shows "This device is not registered", you may need to:
   - Sign in with your Apple ID in Xcode
   - Or register the device manually

### Alternative: Use Simulator
If you just want to see the icon quickly, you can use a simulator:
```bash
# Boot a simulator first
xcrun simctl boot "iPhone 17 Pro Max"

# Then build
npx expo run:ios -d "iPhone 17 Pro Max"
```

## ✅ Benefits of Building on Physical Device:
- See the actual app icon on your home screen
- Test performance on real hardware
- Test features that don't work in simulator (camera, notifications, etc.)


## 📱 Steps to Connect Your iPhone:

### 1. **Connect via USB Cable**
- Plug your iPhone 16 Pro Max into your Mac with a USB-C or Lightning cable

### 2. **Trust Your Computer**
- On your iPhone, you'll see a popup: "Trust This Computer?"
- Tap **"Trust"**
- Enter your iPhone passcode if prompted

### 3. **Enable Developer Mode** (iOS 16+)
- Go to **Settings** > **Privacy & Security**
- Scroll down to **Developer Mode**
- Toggle it **ON**
- Your iPhone will restart

### 4. **Verify Connection**
Run this command to check if your device is detected:
```bash
xcrun xctrace list devices
```
You should see your iPhone listed under "== Devices =="

### 5. **Build for Your Device**
Once connected and trusted:
```bash
npx expo run:ios --device
```

## 🔧 If Device Still Doesn't Show:

### Check Xcode:
1. Open **Xcode**
2. Go to **Window** > **Devices and Simulators** (or press `Cmd+Shift+2`)
3. Your iPhone should appear in the left sidebar
4. If it shows "This device is not registered", you may need to:
   - Sign in with your Apple ID in Xcode
   - Or register the device manually

### Alternative: Use Simulator
If you just want to see the icon quickly, you can use a simulator:
```bash
# Boot a simulator first
xcrun simctl boot "iPhone 17 Pro Max"

# Then build
npx expo run:ios -d "iPhone 17 Pro Max"
```

## ✅ Benefits of Building on Physical Device:
- See the actual app icon on your home screen
- Test performance on real hardware
- Test features that don't work in simulator (camera, notifications, etc.)


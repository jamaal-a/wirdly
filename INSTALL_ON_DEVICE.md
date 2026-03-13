# Install App on iPhone Without USB Connection

## 🚀 Option 1: EAS Build (Recommended - No USB Needed)

This creates a build you can download and install directly on your iPhone via a link.

### Step 1: Install EAS CLI
```bash
npm install -g eas-cli
```

### Step 2: Login to Expo
```bash
eas login
```
(Use your Expo account, or create one at expo.dev)

### Step 3: Configure EAS Build
```bash
eas build:configure
```
This creates an `eas.json` file.

### Step 4: Build for iOS
```bash
eas build --platform ios --profile development
```

This will:
- Build your app in the cloud (takes 10-20 minutes)
- Give you a download link
- You can install it directly on your iPhone by:
  1. Opening the link on your iPhone
  2. Tapping "Install"
  3. Going to Settings > General > VPN & Device Management
  4. Trusting the developer certificate

### Step 5: Download and Install
- You'll get a link like: `https://expo.dev/artifacts/...`
- Open this link on your iPhone
- Tap "Install" 
- Trust the developer in Settings if needed

## 📱 Option 2: TestFlight (For Distribution)

If you want to use TestFlight (Apple's beta testing platform):

```bash
# Build for TestFlight
eas build --platform ios --profile production

# Submit to TestFlight
eas submit --platform ios
```

Then install TestFlight app from App Store and add your app.

## 🔧 Option 3: Wireless Debugging (One-time USB setup)

If you want wireless debugging (still requires one-time USB connection):

1. **First time only**: Connect via USB and enable wireless debugging
2. **After that**: Build wirelessly

But EAS Build is easier and doesn't require any USB connection at all!

## ✅ Quick Start (EAS Build):

```bash
# 1. Install EAS CLI
npm install -g eas-cli

# 2. Login
eas login

# 3. Configure (creates eas.json)
eas build:configure

# 4. Build
eas build --platform ios --profile development

# 5. Wait for build to complete, then open the download link on your iPhone
```

The build will take 10-20 minutes, but you can install it wirelessly on your iPhone!


## 🚀 Option 1: EAS Build (Recommended - No USB Needed)

This creates a build you can download and install directly on your iPhone via a link.

### Step 1: Install EAS CLI
```bash
npm install -g eas-cli
```

### Step 2: Login to Expo
```bash
eas login
```
(Use your Expo account, or create one at expo.dev)

### Step 3: Configure EAS Build
```bash
eas build:configure
```
This creates an `eas.json` file.

### Step 4: Build for iOS
```bash
eas build --platform ios --profile development
```

This will:
- Build your app in the cloud (takes 10-20 minutes)
- Give you a download link
- You can install it directly on your iPhone by:
  1. Opening the link on your iPhone
  2. Tapping "Install"
  3. Going to Settings > General > VPN & Device Management
  4. Trusting the developer certificate

### Step 5: Download and Install
- You'll get a link like: `https://expo.dev/artifacts/...`
- Open this link on your iPhone
- Tap "Install" 
- Trust the developer in Settings if needed

## 📱 Option 2: TestFlight (For Distribution)

If you want to use TestFlight (Apple's beta testing platform):

```bash
# Build for TestFlight
eas build --platform ios --profile production

# Submit to TestFlight
eas submit --platform ios
```

Then install TestFlight app from App Store and add your app.

## 🔧 Option 3: Wireless Debugging (One-time USB setup)

If you want wireless debugging (still requires one-time USB connection):

1. **First time only**: Connect via USB and enable wireless debugging
2. **After that**: Build wirelessly

But EAS Build is easier and doesn't require any USB connection at all!

## ✅ Quick Start (EAS Build):

```bash
# 1. Install EAS CLI
npm install -g eas-cli

# 2. Login
eas login

# 3. Configure (creates eas.json)
eas build:configure

# 4. Build
eas build --platform ios --profile development

# 5. Wait for build to complete, then open the download link on your iPhone
```

The build will take 10-20 minutes, but you can install it wirelessly on your iPhone!


## 🚀 Option 1: EAS Build (Recommended - No USB Needed)

This creates a build you can download and install directly on your iPhone via a link.

### Step 1: Install EAS CLI
```bash
npm install -g eas-cli
```

### Step 2: Login to Expo
```bash
eas login
```
(Use your Expo account, or create one at expo.dev)

### Step 3: Configure EAS Build
```bash
eas build:configure
```
This creates an `eas.json` file.

### Step 4: Build for iOS
```bash
eas build --platform ios --profile development
```

This will:
- Build your app in the cloud (takes 10-20 minutes)
- Give you a download link
- You can install it directly on your iPhone by:
  1. Opening the link on your iPhone
  2. Tapping "Install"
  3. Going to Settings > General > VPN & Device Management
  4. Trusting the developer certificate

### Step 5: Download and Install
- You'll get a link like: `https://expo.dev/artifacts/...`
- Open this link on your iPhone
- Tap "Install" 
- Trust the developer in Settings if needed

## 📱 Option 2: TestFlight (For Distribution)

If you want to use TestFlight (Apple's beta testing platform):

```bash
# Build for TestFlight
eas build --platform ios --profile production

# Submit to TestFlight
eas submit --platform ios
```

Then install TestFlight app from App Store and add your app.

## 🔧 Option 3: Wireless Debugging (One-time USB setup)

If you want wireless debugging (still requires one-time USB connection):

1. **First time only**: Connect via USB and enable wireless debugging
2. **After that**: Build wirelessly

But EAS Build is easier and doesn't require any USB connection at all!

## ✅ Quick Start (EAS Build):

```bash
# 1. Install EAS CLI
npm install -g eas-cli

# 2. Login
eas login

# 3. Configure (creates eas.json)
eas build:configure

# 4. Build
eas build --platform ios --profile development

# 5. Wait for build to complete, then open the download link on your iPhone
```

The build will take 10-20 minutes, but you can install it wirelessly on your iPhone!


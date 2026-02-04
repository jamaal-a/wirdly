#!/bin/bash
set -e

echo "🚀 Checking iOS Simulator setup..."

# Try to open the simulator
open -a Simulator || echo "⚠️  Couldn't open Simulator app manually. Check Xcode installation."

# Wait a few seconds to let it open
sleep 3

# Check if an iPhone 15 Pro simulator exists
DEVICE_NAME="iPhone 15 Pro"
DEVICE_EXISTS=$(xcrun simctl list devices | grep "$DEVICE_NAME")

if [ -z "$DEVICE_EXISTS" ]; then
  echo "📱 Creating new $DEVICE_NAME simulator..."
  OS_VERSION=$(xcrun simctl list runtimes | grep "iOS" | tail -1 | awk '{print $2}' | tr -d '()')
  xcrun simctl create "$DEVICE_NAME" "com.apple.CoreSimulator.SimDeviceType.iPhone-15-Pro" "com.apple.CoreSimulator.SimRuntime.iOS-$OS_VERSION"
fi

# Boot the simulator
echo "🔌 Booting $DEVICE_NAME..."
xcrun simctl boot "$DEVICE_NAME" || echo "Simulator already booted."

# Wait a bit for the simulator to be ready
sleep 5

# Run Expo
echo "🏗️  Running Expo app on iOS simulator..."
npx expo run:ios --device "$DEVICE_NAME"


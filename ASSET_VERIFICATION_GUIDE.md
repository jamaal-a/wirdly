# Asset Verification Guide

## ✅ Assets Present
All required assets are in the `assets/` folder:
- `icon.png` - App icon
- `adaptive-icon.png` - Android adaptive icon foreground
- `splash-icon.png` - Splash screen icon
- `favicon.png` - Web favicon

## How to Verify Assets

### 1. **Check Files Exist** ✅
All assets exist in the `assets/` folder.

### 2. **Verify Asset Sizes & Specifications**

#### For iOS (`icon.png`):
- **Required sizes**: 
  - 1024x1024px (App Store)
  - 512x512px (minimum)
- **Format**: PNG
- **No transparency** (solid background)
- **No rounded corners** (iOS adds them automatically)

#### For Android (`adaptive-icon.png`):
- **Required size**: 1024x1024px
- **Format**: PNG
- **Transparency allowed** for foreground layer
- **Safe zone**: Keep important content within center 512x512px (safe zone)

#### For Splash Screen (`splash-icon.png`):
- **Recommended size**: 1024x1024px
- **Format**: PNG
- **Background**: Should match `app.json` splash backgroundColor (`#ffffff`)

#### For Web (`favicon.png`):
- **Required size**: 48x48px minimum (larger is better)
- **Format**: PNG or ICO
- **Recommended**: 512x512px for best quality

### 3. **Visual Verification Steps**

#### Option A: Check in File Explorer/Finder
1. Navigate to `/Users/jamaal/wirdly/assets/`
2. Open each file and check:
   - Image displays correctly
   - No distortion or blurriness
   - Colors are accurate
   - Text/logo is readable

#### Option B: Check Image Dimensions
You can verify dimensions using:
```bash
# macOS (if ImageMagick is installed)
identify assets/icon.png

# Or open in Preview and check Tools > Show Inspector
```

#### Option C: Test in App
1. Run the app: `npx expo start`
2. Check:
   - **App Icon**: Look at the app icon on your device home screen
   - **Splash Screen**: Should appear when app launches
   - **Web Favicon**: Check if you run `npx expo start --web`

### 4. **Quick Verification Commands**

```bash
# Check if files exist
ls -lh assets/

# Check file sizes (should be reasonable, not 0 bytes)
du -h assets/*.png

# Verify they're valid images (macOS)
file assets/*.png
```

### 5. **Common Issues to Check**

- ❌ **File is 0 bytes** → File is corrupted or empty
- ❌ **Image won't open** → File is corrupted or wrong format
- ❌ **Icon looks pixelated** → Image resolution too low (should be 1024x1024 or higher)
- ❌ **Transparent background** → OK for adaptive-icon, but icon.png should have solid background
- ❌ **Wrong aspect ratio** → Should be square (1:1)

### 6. **Recommended Asset Specifications**

For best results, create:
- **icon.png**: 1024x1024px, PNG, solid background, high quality
- **adaptive-icon.png**: 1024x1024px, PNG, important content in center 512x512px safe zone
- **splash-icon.png**: 1024x1024px, PNG, matches splash background color
- **favicon.png**: 512x512px (or 48x48px), PNG or ICO

### 7. **Testing Checklist**

- [ ] All 4 asset files exist in `assets/` folder
- [ ] All files are valid PNG images (open without errors)
- [ ] Icon displays correctly on device home screen
- [ ] Splash screen appears correctly on app launch
- [ ] No console errors about missing assets
- [ ] Images are high quality (not pixelated)

### 8. **If Assets Need Updating**

If you need to update assets:
1. Create new images with correct dimensions
2. Replace files in `assets/` folder
3. Clear app cache:
   ```bash
   # iOS
   npx expo start -c
   # Then reinstall app on device
   ```
4. For production builds, assets are embedded during build

### 9. **Build-Time Verification**

When building for production:
- EAS Build will verify assets during build
- If assets are missing or invalid, build will fail with clear error
- Check EAS build logs for asset validation messages

---

**Current Status**: ✅ All required assets are present in `assets/` folder

**Next Step**: Visually verify each asset opens correctly and looks good!


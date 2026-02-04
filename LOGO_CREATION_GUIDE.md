# Logo & Icon Creation Guide for Wirdly

## Overview

You need to create 4 main assets:
1. **App Icon** (`icon.png`) - Main app icon (1024x1024px)
2. **Adaptive Icon** (`adaptive-icon.png`) - Android foreground layer (1024x1024px)
3. **Splash Icon** (`splash-icon.png`) - Launch screen (1024x1024px)
4. **Favicon** (`favicon.png`) - Web icon (512x512px or 48x48px)

## Tools & Services

### Free Online Tools

1. **Canva** (https://www.canva.com/)
   - Free account available
   - Templates for app icons
   - Export as PNG
   - **Steps**:
     - Sign up for free account
     - Search "app icon" templates
     - Customize with your design
     - Export as PNG (1024x1024px)

2. **Figma** (https://www.figma.com/)
   - Free for individuals
   - Professional design tool
   - **Steps**:
     - Create account (free)
     - Create new file
     - Set frame to 1024x1024px
     - Design your icon
     - Export as PNG

3. **GIMP** (https://www.gimp.org/) - Free desktop software
   - Full-featured image editor
   - Similar to Photoshop but free

4. **Photopea** (https://www.photopea.com/)
   - Browser-based Photoshop alternative
   - Free, no installation needed

### Paid Services (If Budget Allows)

1. **99designs** - Hire a designer ($299+)
2. **Fiverr** - Logo design services ($5-$100)
3. **Upwork** - Freelance designers ($50-$500)

## Design Specifications

### App Icon (`icon.png`)
- **Size**: 1024x1024 pixels
- **Format**: PNG
- **Background**: Solid color (no transparency)
- **Content**: 
  - Keep important content in center 512x512px (safe zone)
  - iOS will add rounded corners automatically
  - Don't add your own rounded corners or shadows
- **Design Tips**:
  - Simple, recognizable design
  - Works well at small sizes
  - High contrast for visibility
  - Avoid thin lines or small text

### Adaptive Icon (`adaptive-icon.png`)
- **Size**: 1024x1024 pixels
- **Format**: PNG
- **Background**: Transparent or solid
- **Safe Zone**: Keep important content in center 512x512px
- **Content**: Foreground layer only (Android adds background)

### Splash Icon (`splash-icon.png`)
- **Size**: 1024x1024 pixels
- **Format**: PNG
- **Background**: Transparent (white background is set in app.json)
- **Content**: Your app logo centered

### Favicon (`favicon.png`)
- **Size**: 512x512px (or 48x48px minimum)
- **Format**: PNG or ICO
- **Background**: Transparent or solid

## Design Ideas for Wirdly

### Theme Suggestions
- **Islamic Elements**: Crescent moon, prayer beads (tasbih), mosque silhouette
- **Typography**: Arabic calligraphy or modern Arabic-inspired fonts
- **Colors**: 
  - Traditional: Green (#006B3C), Gold (#D4AF37)
  - Modern: Purple (#6C5CE7), Teal (#00D4AA)
- **Symbols**: Prayer mat, Kaaba silhouette, compass rose

### Design Concepts

1. **Simple Crescent + Text**
   - Crescent moon + "W" or "Wirdly" text
   - Clean, modern look

2. **Prayer Beads**
   - Tasbih beads forming a circle
   - Minimalist design

3. **Compass + Crescent**
   - Qibla compass with crescent moon
   - Represents both prayer times and direction

4. **Geometric Islamic Pattern**
   - Modern geometric pattern
   - Islamic-inspired but contemporary

## Step-by-Step: Create in Canva

1. **Go to Canva.com** and sign up (free)

2. **Create Design**:
   - Click "Create a design"
   - Choose "Custom size"
   - Set to 1024px x 1024px
   - Click "Create new design"

3. **Design Your Icon**:
   - Search for "crescent moon" or "islamic" elements
   - Add your text "Wirdly" or "W"
   - Choose colors (green, gold, purple, etc.)
   - Keep design simple and centered

4. **Export**:
   - Click "Download"
   - Choose "PNG"
   - Select "High quality"
   - Download

5. **Repeat for All Icons**:
   - App Icon: Full design with solid background
   - Adaptive Icon: Foreground only (remove background)
   - Splash Icon: Same as app icon but transparent background
   - Favicon: Simplified version at 512x512px

## Quick Design Tips

✅ **Do**:
- Keep it simple
- Use high contrast
- Test at small sizes (appears on home screen)
- Center important elements
- Use solid backgrounds for app icon

❌ **Don't**:
- Add rounded corners (iOS does this automatically)
- Use thin lines or small text
- Crowd the design
- Use too many colors
- Make it too complex

## Testing Your Icons

### Before Finalizing:
1. **Preview at Small Size**:
   - Resize your 1024x1024 icon to 60x60px
   - Can you still recognize it? If yes, it's good!

2. **Test in App**:
   ```bash
   # After creating icons, replace files in assets/
   # Then test:
   npx expo start
   # Check icon on device home screen
   ```

3. **Test on Different Backgrounds**:
   - App icons appear on various backgrounds
   - Make sure it's visible on light and dark backgrounds

## Where to Place Icons

After creating your icons:

1. **Save them with these exact names**:
   - `icon.png` (App icon)
   - `adaptive-icon.png` (Android adaptive icon)
   - `splash-icon.png` (Splash screen)
   - `favicon.png` (Web favicon)

2. **Place in `/Users/jamaal/wirdly/assets/`**:
   - Replace existing files if needed

3. **Verify**:
   ```bash
   ls -lh assets/*.png
   # Should show your new files with correct sizes
   ```

## Resources

### Free Islamic Icons/Graphics
- **Freepik** (free account): https://www.freepik.com/search?format=search&query=islamic+icon
- **Flaticon**: https://www.flaticon.com/search?word=islamic
- **Icons8**: https://icons8.com/icons (free with attribution)

### Fonts
- **Google Fonts** - Arabic fonts available
- **Font Squirrel** - Free fonts including Arabic

### Color Palettes
- **Coolors.co** - Generate color palettes
- Islamic color inspiration: Green (#006B3C), Gold (#D4AF37), Deep Blue (#003366)

## Professional Help Options

If you want professional design:

1. **Fiverr** ($5-$50):
   - Search "app icon design"
   - Read reviews
   - Look for quick turnaround

2. **99designs Contest** ($299+):
   - Multiple designers compete
   - You choose best design

3. **Upwork** ($50-$200):
   - Hire freelance designer
   - Direct communication

## Next Steps

1. ✅ Choose a design tool (Canva recommended for beginners)
2. ✅ Create your app icon design
3. ✅ Export at 1024x1024px
4. ✅ Create all 4 versions (icon, adaptive, splash, favicon)
5. ✅ Replace files in `assets/` folder
6. ✅ Test in app
7. ✅ Verify on device

---

**Recommendation**: Start with Canva - it's free, easy to use, and has templates perfect for app icons!


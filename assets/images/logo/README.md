# 🎨 CookSmart Logo Assets

Place your chef's hat logo files in this directory with these exact names:

## Required Files

### App Icons (System Integration)
- **icon.png** (1024x1024px) - Main app icon, replaces current `../icon.png`
- **adaptive-icon.png** (1024x1024px) - Android adaptive icon, replaces current `../adaptive-icon.png`
- **splash-icon.png** (400x400px) - Splash screen logo, replaces current `../splash-icon.png`
- **favicon.png** (48x48px) - Web favicon, replaces current `../favicon.png`

### In-App Logo Variations
- **logo-light.png** (200x200px) - Main logo for light theme backgrounds
- **logo-dark.png** (200x200px) - Main logo for dark theme backgrounds
- **logo-light-monochrome.png** (200x200px) - Single color version using orange (#FF6B35)
- **logo-dark-monochrome.png** (200x200px) - Single color version using green (#4CAF50)

### Different Sizes
- **logo-small.png** (120x120px) - For small headers and navigation
- **logo-medium.png** (200x200px) - For modals and cards
- **logo-large.png** (400x400px) - For about pages and splash screens

## Design Guidelines

### Color Coordination
Your logo's blue and pink colors will beautifully complement the app's existing palette:
- **Logo Blue**: Pairs with app's Material Blue (#2196F3)
- **Logo Pink**: Adds a fresh new accent color
- **Maintains** the warm feeling with existing orange (#FF6B35)

### Background Compatibility
- **Light versions**: Should work on warm backgrounds (#FFF5E6, #FFF8F0)
- **Dark versions**: Should work on dark backgrounds (#121212, #1E1E1E)
- **Monochrome versions**: Single color variations for minimal display

### File Requirements
- **Format**: PNG with transparency
- **Quality**: High resolution, optimized for mobile
- **Transparency**: Clean edges, no artifacts
- **Accessibility**: High contrast, readable at all sizes

## After Adding Files

Once you've added your logo files:
1. The app will automatically use them in headers
2. System icons will need to be updated in app.json
3. Run `expo prebuild` to update native code
4. Test on both light and dark themes

Your chef's hat logo will make CookSmart look professional and appetizing! 🍳✨ 
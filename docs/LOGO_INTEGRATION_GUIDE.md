# 🎨 CookSmart Logo Integration Guide

## Logo File Requirements

Your chef's hat logo needs to be prepared in these formats and sizes:

### App Icons (Required)
- **icon.png**: 1024x1024px (main app icon)
- **adaptive-icon.png**: 1024x1024px (Android adaptive icon - should work with circular masks)
- **splash-icon.png**: 400x400px (splash screen logo)
- **favicon.png**: 48x48px (web favicon)

### Additional Sizes (Recommended)
- **logo-small.png**: 120x120px (for headers)
- **logo-medium.png**: 200x200px (for splash/loading)
- **logo-large.png**: 400x400px (for about/settings)

## Color Variations Needed

Based on your app's themes, create these variations:

### Light Theme Compatible
- **logo-light.png**: Main logo for light backgrounds
- **logo-light-monochrome.png**: Single color version using #FF6B35 (your primary orange)

### Dark Theme Compatible  
- **logo-dark.png**: Main logo for dark backgrounds
- **logo-dark-monochrome.png**: Single color version using #4CAF50 (your primary green)

## Integration Points

### 1. App Icons & System Integration
- [x] Main app icon
- [x] Android adaptive icon
- [x] iOS app icon
- [x] Splash screen
- [x] Web favicon

### 2. In-App Header Integration
- [ ] Home screen header (replace/supplement "CookSmart" text)
- [ ] Navigation headers
- [ ] Loading screens

### 3. Branding Elements
- [ ] About/Settings screens
- [ ] Welcome screens
- [ ] Error states

### 4. Accessibility
- [ ] Alt text descriptions
- [ ] High contrast versions
- [ ] Scalable vector versions (SVG)

## File Naming Convention
```
assets/images/logo/
├── icon.png (1024x1024 - main app icon)
├── adaptive-icon.png (1024x1024 - Android)
├── splash-icon.png (400x400 - splash screen)
├── favicon.png (48x48 - web)
├── logo-small.png (120x120 - headers)
├── logo-medium.png (200x200 - modals)
├── logo-large.png (400x400 - about)
├── logo-light.png (theme variation)
├── logo-dark.png (theme variation)
└── logo.svg (vector version)
```

## Color Integration
Your logo's blue and pink colors complement the existing palette:
- Logo Blue: Works well with app's #2196F3
- Logo Pink: Adds a new accent color to the palette
- Maintains warmth with existing orange (#FF6B35) 
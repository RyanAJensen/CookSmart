# 🍳 CookSmart - Smart Recipe Generator

<div align="center">

**Your personal pantry assistant powered by AI**

[![React Native](https://img.shields.io/badge/React%20Native-0.79.3-blue.svg)](https://reactnative.dev/)
[![Expo](https://img.shields.io/badge/Expo-53.0.0-blue.svg)](https://expo.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.1.3-blue.svg)](https://www.typescriptlang.org/)

*A React Native/Expo app that helps you create delicious recipes from ingredients in your pantry*

</div>

---

## 🚀 Features

### ✨ Current Features
- **📱 Cross-Platform**: Works seamlessly on iOS and Android
- **📊 Pantry Management**: Track ingredients with barcode scanning and manual entry
- **🔍 Recipe Search**: Find recipes using all or some of your ingredients
- **📈 Nutrition Tracking**: Get detailed nutrition information for recipes
- **💾 Recipe Saving**: Save your favorite recipes for later
- **🌙 Dark/Light Theme**: Beautiful theme system with smooth transitions
- **📱 Modern UI**: Material Design 3 components with custom theming

### 🤖 AI Features (Coming Soon)
- **🧠 Smart Ingredient Analysis**: AI will analyze your pantry ingredients and suggest complementary items
- **👤 Personalized Recipes**: Create recipes based on your cooking preferences and dietary restrictions
- **📊 Nutrition Estimation**: Provide accurate nutrition information
- **📝 Step-by-Step Instructions**: Generate clear, actionable cooking steps
- **🎯 Confidence Scoring**: Show how well the recipe matches your available ingredients

---

## 🛠️ Technology Stack

### Core Technologies
- **React Native 0.79.3** - Cross-platform mobile development
- **Expo SDK 53** - Development platform and tools
- **TypeScript 5.1.3** - Type-safe JavaScript
- **React Native Paper** - Material Design 3 components

### Key Libraries
- **Expo Router** - File-based navigation
- **Expo SQLite** - Local database storage
- **Expo Camera** - Barcode scanning functionality
- **React Native Reanimated** - Smooth animations
- **Axios** - HTTP client for API calls

### External APIs
- **Open Food Facts** - Product database for barcode scanning
- **AI Integration** - Coming soon!

---

## 🎨 Design & UX

### Theme System
- **Light Theme**: Warm orange primary color (#FF6B35) with warm backgrounds
- **Dark Theme**: Green primary color (#4CAF50) with dark surfaces
- **Smooth Transitions**: Animated theme switching with overlay effects
- **System Integration**: Respects device theme preferences

### User Experience
- **Intuitive Navigation**: File-based routing with Expo Router
- **Responsive Design**: Works on phones and tablets
- **Loading States**: Proper loading indicators throughout
- **Error Handling**: Graceful error handling with user-friendly messages
- **Accessibility**: Built with accessibility in mind

---

## 📱 Screenshots

<div align="center">

| Home Screen | Pantry Management | Recipe Search |
|-------------|------------------|---------------|
| ![Home](screenshots/home.png) | ![Pantry](screenshots/pantry.png) | ![Recipes](screenshots/recipes.png) |

| Recipe Details | Barcode Scanner | Settings |
|----------------|-----------------|----------|
| ![Details](screenshots/recipe-detail.png) | ![Scanner](screenshots/scanner.png) | ![Settings](screenshots/settings.png) |

</div>

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Expo CLI
- iOS Simulator (for iOS development) or Android Studio (for Android development)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/RyanAJensen/CookSmart.git
   cd cooksmart
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npx expo start
   ```

4. **Run on your device**
   - Scan the QR code with the Expo Go app
   - Or press `i` for iOS simulator or `a` for Android emulator

### Development Commands
```bash
npm start          # Start Expo development server
npm run android    # Run on Android
npm run ios        # Run on iOS
npm run web        # Run on web
npm run lint       # Run ESLint
npm run type-check # Run TypeScript type checking
```

---

## 🏗️ Project Structure

```
CookSmart/
├── app/                    # Main application screens (Expo Router)
│   ├── (tabs)/            # Tab-based navigation
│   │   ├── index.tsx      # Home screen
│   │   └── pantry.tsx     # Pantry management
│   ├── (modals)/          # Modal screens
│   │   ├── scan.tsx       # Barcode scanner
│   │   ├── food-details.tsx # Product details
│   │   └── type-ingredient.tsx # Manual ingredient entry
│   ├── recipes.tsx        # Recipe search
│   ├── saved-recipes.tsx  # Saved recipes
│   └── ai-recipe-settings.tsx # AI preferences
├── components/            # Reusable UI components
├── services/             # Business logic and API calls
├── contexts/             # React Context providers
├── hooks/                # Custom React hooks
├── types/                # TypeScript type definitions
├── utils/                # Helper functions
└── assets/               # Images and static assets
```

---

## 🙏 Acknowledgments

This project was developed with assistance from AI tools:

- **🤖 ChatGPT** - Used for code generation, debugging, and architectural decisions
- **💻 Cursor** - Primary IDE with AI-powered code completion and refactoring

---

<div align="center">

**Made with ❤️ and 🤖 AI assistance**

*Built for food lovers, by a food lover*

</div> 
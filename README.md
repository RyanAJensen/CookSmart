# CookSmart

A comprehensive mobile application built with React Native and Expo that empowers users to manage their kitchen pantry, track nutritional intake, and discover recipes based on ingredients they already own. This project blends intuitive user experience with intelligent food data handling to promote sustainability, healthier eating, and efficient meal planning.

---

## 🚀 Core Purpose

This app is designed for home cooks, nutrition-conscious users, and anyone looking to reduce food waste. It provides an all-in-one solution for:
- Organizing pantry inventory
- Calculating and visualizing nutritional content
- Discovering new recipes based on current ingredients

---

## ✨ Key Features

### 🗂️ 1. Pantry Management System
- **Ingredient Tracking**: Add items with full nutritional info — calories, protein, carbs, fat
- **Quantity Handling**: Manage both unit serving size and actual owned quantity
- **Smart Nutrition Display**: Toggle between per-unit and total nutrition values
- **Inline Editing**: Edit ingredient quantities directly in-place, with scroll and auto-focus
- **Categorization**: Automatically grouped by type (Meat, Dairy, Vegetables, etc.)

### ➕ 2. Multiple Ingredient Input Methods
- **Barcode Scanning**: Fetch nutrition data via barcode using Open Food Facts
- **Database Search**: Search from a curated database of 400+ prefilled ingredients
- **Manual Entry**: Add custom ingredients with full nutritional breakdown
- **Unified Schema**: All entries (scanned, searched, or manual) stored with the same structure

### 🍽️ 3. Recipe Discovery Engine
- **Pantry-Based Matching**:
  - **Strict Mode**: All required ingredients present
  - **Partial Mode**: Some ingredients matched
- **Recipe Metadata**: Time, servings, nutrition, ingredients, instructions
- **Smart Suggestions**: Discover meals you can make *now* based on your inventory

### 🔍 4. Advanced Search & UI Experience
- **Real-Time Search**: Live filtering and matching across name and alternate names
- **Keyboard-Aware UI**: Seamless navigation without dismissing the keyboard
- **Modal Navigation**: Smooth transitions between pantry, search, and detail views
- **Auto-Focus & Scroll**: Intelligently brings focus to inputs or edited items

### 🧮 5. Nutritional Intelligence
- **Flexible Basis Handling**: Supports per 100g, per serving, per 100ml, etc.
- **Unit Conversions**: Automatically adjusts between serving sizes and units
- **Macronutrient Breakdown**: Tracks calories, protein, carbs, and fat
- **Clean Visualization**: Nutritional values displayed clearly with visual hierarchy

---

## ⚙️ Technical Stack

| Layer            | Technology                  |
|------------------|-----------------------------|
| 📱 Mobile         | React Native + Expo         |
| 🗄️ Local Storage   | SQLite (via `expo-sqlite`)  |
| 🔎 Scanning/API   | Open Food Facts API         |
| ⛑️ Language        | TypeScript                  |
| 🎨 UI Framework   | React Native Paper          |
| 🧭 Navigation     | `expo-router`               |

---

## 🎯 End Goal & Vision

The application aims to:
- 🥕 **Reduce food waste** by promoting smarter use of existing ingredients
- 🥗 **Promote healthier eating** through accessible nutrition tracking
- 🍳 **Simplify meal planning** by connecting pantry items to real recipes
- 📦 **Digitize the pantry** with structured, accurate, and interactive inventory management
- 🌍 **Support sustainability** through better food habits

This app bridges the gap between traditional pantry tracking and modern tech, replacing guesswork with intelligent, data-driven cooking assistance.

---

## 👥 Target Users

- 🧑‍🍳 Home cooks seeking better organization
- 🧘‍♀️ Health-conscious individuals tracking macros
- 💰 Budget-minded shoppers avoiding duplicate purchases
- 🧠 Recipe tinkerers using what they already have
- 📱 Anyone wanting a digital pantry in their pocket

---

## 📦 Project Structure Overview

---

## 🤖 AI Acknowledgment

This project was developed entirely with the assistance of AI tools, including Cursor and ChatGPT.

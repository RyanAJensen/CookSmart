# CookSmart

A React Native app for managing your pantry and finding recipes based on available ingredients.

## Features

- **Pantry Management**: Add, edit, and organize your ingredients
- **Recipe Search**: Find recipes based on ingredients in your pantry
- **Recipe Download**: Search and download recipes from the internet
- **Nutrition Tracking**: Track calories, protein, carbs, and fat
- **Offline Support**: Store recipes locally for offline access

## Recipe Sources

The app searches for recipes from multiple sources:

1. **Spoonacular API** - Professional recipe database
2. **Edamam API** - Nutrition-focused recipe database  
3. **AllRecipes** - Popular recipe website
4. **Food Network** - Professional cooking website

## API Keys Setup

To enable full recipe searching functionality, you'll need to get free API keys:

### Spoonacular API
1. Go to [Spoonacular](https://spoonacular.com/food-api)
2. Sign up for a free account
3. Get your API key
4. Add to your environment: `SPOONACULAR_API_KEY=your_key_here`

### Edamam API
1. Go to [Edamam](https://developer.edamam.com/)
2. Sign up for a free account
3. Create an application to get App ID and App Key
4. Add to your environment: `EDAMAM_APP_ID=your_app_id` and `EDAMAM_APP_KEY=your_app_key`

## Installation

```bash
npm install
```

## Running the App

```bash
npm start
```

## How It Works

1. **Add ingredients** to your pantry
2. **Search recipes** - the app finds recipes that use your ingredients
3. **Search & Download** - find recipes from the internet based on your ingredients
4. **Bulk Download** - download many recipes at once for offline use

The app prioritizes recipes that best match your available ingredients and shows match percentages to help you choose the best recipes.

## Setup for AI Recipe Generation

To use the AI recipe generation feature:

1. **Get a Hugging Face API key** from [https://huggingface.co/settings/tokens](https://huggingface.co/settings/tokens)
2. **Run the setup script**: `./scripts/setup-env.sh`
3. **Add your API key** to the generated `.env` file
4. **Restart the app**: `npx expo start --clear`

Or manually create a `.env` file in the project root:
```bash
EXPO_PUBLIC_HUGGINGFACE_API_KEY=your_api_key_here
```

See [SETUP_API_KEYS.md](SETUP_API_KEYS.md) for detailed instructions. 
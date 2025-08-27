# Recipe Download System

The CookSmart app now includes a comprehensive recipe download system that can fetch recipes from multiple sources and store them locally in the app's database.

## Features

### 🔄 Multiple Data Sources
- **Spoonacular API** - Popular recipe API with comprehensive data
- **Edamam API** - Nutrition-focused recipe database
- **Sample Recipes** - Built-in recipe collection for testing
- **Future**: Web scraping from popular recipe websites

### 📊 Rich Recipe Data
Each downloaded recipe includes:
- Title, description, and cooking time
- Nutritional information (calories, protein, carbs, fat)
- Complete ingredient lists with amounts and units
- Step-by-step cooking instructions
- Recipe tags and categories
- Serving sizes and preparation time

### 🎯 Smart Filtering
- **Categories**: chicken, pasta, salad, soup, dessert, breakfast, etc.
- **Cuisines**: Italian, Mexican, Asian, Mediterranean, American, etc.
- **Dietary Preferences**: vegetarian, vegan, gluten-free, keto, etc.
- **Custom Search**: Search by specific ingredients or keywords

### 💾 Local Storage
- Recipes are stored locally in SQLite database
- No internet required after download
- Fast search and filtering
- Offline recipe access

## How to Use

### 1. Access the Download Manager
- Navigate to the Recipes screen
- Tap the download icon in the top-right corner
- Or tap "Download Recipes" button when no recipes are available

### 2. Configure Download Options
- **Basic Options**:
  - Set maximum number of recipes to download
  - Choose whether to clear existing recipes
- **Advanced Options**:
  - Select specific categories (chicken, pasta, etc.)
  - Choose cuisines (Italian, Mexican, etc.)
  - Filter by dietary preferences (vegetarian, vegan, etc.)

### 3. Start Download
- Tap "Download Recipes" to begin
- Monitor progress with real-time updates
- Wait for completion notification

### 4. Use Downloaded Recipes
- Recipes are automatically available in the app
- Search by ingredients in your pantry
- Browse by categories and cuisines
- Save favorites for quick access

## API Configuration

### Spoonacular API
To use the Spoonacular API:
1. Sign up at [spoonacular.com/food-api](https://spoonacular.com/food-api)
2. Get your API key
3. Update `services/recipeFetcher.ts`:
   ```typescript
   const SPOONACULAR_API_KEY = 'your_actual_api_key';
   ```

### Edamam API
To use the Edamam API:
1. Sign up at [developer.edamam.com](https://developer.edamam.com/)
2. Get your App ID and App Key
3. Update `services/recipeFetcher.ts`:
   ```typescript
   const EDAMAM_APP_ID = 'your_actual_app_id';
   const EDAMAM_APP_KEY = 'your_actual_app_key';
   ```

## Sample Recipes

When no API keys are configured, the system automatically downloads a comprehensive collection of sample recipes including:

- **Classic Chicken Stir Fry** - Quick Asian dish
- **Creamy Pasta Carbonara** - Italian comfort food
- **Greek Salad** - Healthy Mediterranean option
- **Chocolate Chip Cookies** - Classic dessert
- **Vegetarian Buddha Bowl** - Nutritious plant-based meal
- **Spicy Thai Curry** - Flavorful curry dish
- **Breakfast Smoothie Bowl** - Quick morning meal
- **Grilled Salmon with Vegetables** - Healthy protein option

## Technical Details

### Database Schema
Recipes are stored in two tables:
- `recipes` - Main recipe data
- `recipe_categories` - Category associations for filtering

### Performance Features
- **Duplicate Detection**: Automatically removes duplicate recipes
- **Batch Processing**: Efficient bulk downloads
- **Progress Tracking**: Real-time download progress
- **Error Handling**: Graceful failure recovery
- **Rate Limiting**: Respects API rate limits

### File Structure
```
services/
├── recipeFetcher.ts      # API integration
├── recipeStorage.ts      # Database operations
└── recipeDownloader.ts   # Download orchestration

components/
└── RecipeDownloadManager.tsx  # UI component

app/
└── recipe-download.tsx   # Download screen
```

## Troubleshooting

### Common Issues

1. **No recipes downloading**
   - Check internet connection
   - Verify API keys are configured
   - Try downloading sample recipes first

2. **Slow download speed**
   - Reduce maximum recipe count
   - Check API rate limits
   - Try downloading during off-peak hours

3. **Duplicate recipes**
   - System automatically removes duplicates
   - Check recipe titles for similarity
   - Clear existing recipes before new download

### Error Messages

- **"Download already in progress"** - Wait for current download to complete
- **"API key invalid"** - Check API key configuration
- **"Network error"** - Check internet connection
- **"Database error"** - Restart the app

## Future Enhancements

- **Web Scraping**: Direct recipe extraction from popular websites
- **Recipe Ratings**: User ratings and reviews
- **Recipe Sharing**: Export/import recipe collections
- **Advanced Filtering**: More sophisticated search options
- **Recipe Recommendations**: AI-powered suggestions
- **Nutritional Analysis**: Detailed nutritional breakdowns
- **Recipe Scaling**: Adjust serving sizes automatically
- **Shopping Lists**: Generate shopping lists from recipes

## Support

For issues or questions about the recipe download system:
1. Check this documentation
2. Review the console logs for error details
3. Test with sample recipes first
4. Verify API configurations
5. Contact the development team 
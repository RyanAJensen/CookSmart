# AI Recipe Caching - Ingredient Addition Based

## How It Works

The AI recipe generation system uses an intelligent caching mechanism with **persistent storage** that only regenerates recipes when ingredients are **deliberately added** to the pantry.

### Key Principles

1. **Recipes persist across navigation** - Users can switch tabs and return without losing generated recipes
2. **Recipes persist across app sessions** - Cache survives app restarts and navigation
3. **New ingredients trigger regeneration** - Adding an ingredient automatically generates fresh recipes
4. **Manual regeneration available** - Users can still force new recipes with "Generate New Recipes" button
5. **No redundant API calls** - Prevents unnecessary generation when just browsing

## Implementation Details

### Cache Manager (`services/aiRecipeCache.ts`)
- Global state manager with AsyncStorage persistence
- Tracks when ingredients are added with persistent invalidation flags
- Provides subscription system for components to listen for cache invalidation
- Stores actual recipe data persistently across app sessions

### Integration Points

1. **Food Details Modal** (`app/(modals)/food-details.tsx`)
   - Calls `aiRecipeCacheManager.invalidateCache()` when ingredient is added
   - Triggers cache invalidation immediately after successful ingredient addition

2. **Recipes Screen** (`app/recipes.tsx`)
   - Initializes cache manager on mount
   - Subscribes to cache invalidation events
   - Checks cache status before generating recipes
   - Uses persistent cached recipes when no new ingredients detected

### User Experience Flow

1. **First Visit to AI Recipes**
   - No cache exists → Generates new recipes
   - Caches recipes for future use

2. **Navigation Away and Back**
   - Uses cached recipes → No API call
   - Shows "📋 Using existing recipes (add ingredients for new recipes)"

3. **Adding New Ingredient**
   - Cache invalidated automatically
   - Next visit to AI Recipes → Generates fresh recipes
   - Shows "🆕 New ingredient detected! Generating fresh AI recipes..."

4. **Manual Regeneration**
   - "Generate New Recipes" button bypasses cache
   - Forces new generation regardless of cache state

## Status Messages

- `🤖 Generating AI recipes from your pantry...` - Initial generation
- `🆕 New ingredient detected! Generating fresh AI recipes...` - New ingredient added
- `📋 Using existing recipes (add ingredients for new recipes)` - Using cache
- `✨ AI recipes generated successfully!` - Generation completed

## Benefits

- **Reduced API Usage**: No redundant calls when pantry unchanged
- **Better UX**: Instant recipe display on return visits and app restarts
- **Intuitive Behavior**: New recipes only when pantry changes
- **Persistent Cache**: Recipes survive app sessions and navigation
- **Flexible**: Manual regeneration still available

## Testing

1. Generate AI recipes with some ingredients
2. Navigate away and back → Should use cached recipes
3. Add new ingredient → Should automatically generate fresh recipes
4. Use "Generate New Recipes" → Should bypass cache 
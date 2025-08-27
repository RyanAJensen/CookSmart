# AI Recipe Persistence Test

## How It Should Work Now

The AI recipes are now persistently cached using AsyncStorage and should survive:
- Navigation between tabs
- App restarts
- Component remounting
- Any other navigation within the app

## Test Steps

### Test 1: Navigation Persistence
1. **Generate AI recipes** using the "Generate AI Recipes" button
2. **Note the recipe titles** that appear
3. **Navigate to another tab** (Home, Pantry, etc.)
4. **Return to AI Recipes tab**
5. **Expected**: Same recipes should appear immediately, button should say "Regenerate with Current Ingredients"

### Test 2: App Restart Persistence
1. **Generate AI recipes** and note the titles
2. **Close the app completely**
3. **Reopen the app**
4. **Navigate to AI Recipes tab**
5. **Expected**: Same recipes should appear immediately

### Test 3: Regeneration Replaces Cache
1. **With existing cached recipes displayed**
2. **Click "Regenerate with Current Ingredients"**
3. **Wait for new recipes to generate**
4. **Expected**: New different recipes should appear and be cached

### Test 4: Cache Clears When No Ingredients
1. **With cached recipes displayed**
2. **Go to Pantry and delete ALL ingredients**
3. **Return to AI Recipes**
4. **Expected**: Cache should be cleared, empty state should show

## Console Logs to Watch

### On App Start:
```
📱 Loaded X cached AI recipes from storage
```

### On Recipe Generation:
```
💾 Saved X AI recipes to persistent storage
```

### On Navigation Back to AI Recipes:
```
✅ Using cached AI recipes: X recipes
Cached recipe titles: ["Recipe 1", "Recipe 2", ...]
```

### When Clearing Cache:
```
🗑️ Cleared cached AI recipes from storage
```

## Expected Behavior

- **Recipes persist** across all navigation
- **Only regenerate** when button is clicked
- **Clear cache** only when no ingredients
- **Always show cached recipes** when available
- **Button text changes** based on cache state 
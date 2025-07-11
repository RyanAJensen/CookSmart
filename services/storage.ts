import { getDatabase } from './database';
import { Ingredient, Recipe, UserPreferences } from '../types';

let isInitialized = false;

async function initializeTables(): Promise<void> {
  if (isInitialized) {
    return;
  }

  const database = await getDatabase();
  
  // Enable WAL mode for better performance
  await database.execAsync('PRAGMA journal_mode = WAL');
  
  // Create ingredients table
  await database.execAsync(`
    CREATE TABLE IF NOT EXISTS ingredients (
      id TEXT PRIMARY KEY NOT NULL,
      name TEXT NOT NULL,
      category TEXT,
      calories INTEGER,
      protein REAL,
      carbs REAL,
      fat REAL,
      serving_size REAL,
      serving_unit TEXT,
      common_names TEXT,
      added_at TEXT,
      count INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Create preferences table
  await database.execAsync(`
    CREATE TABLE IF NOT EXISTS preferences (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      diet TEXT,
      measurementSystem TEXT DEFAULT 'metric'
    );
  `);

  // Create saved recipes table
  await database.execAsync(`
    CREATE TABLE IF NOT EXISTS saved_recipes (
      id TEXT PRIMARY KEY NOT NULL,
      data TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  isInitialized = true;
}

export async function saveIngredients(ingredients: Ingredient[]): Promise<void> {
  try {
    await initializeTables();
    const database = await getDatabase();
    await database.withTransactionAsync(async () => {
      // Insert or update ingredients
      for (const ingredient of ingredients) {
        await database.runAsync(
          `INSERT OR REPLACE INTO ingredients (
            id, name, category, calories, protein, carbs, fat,
            serving_size, serving_unit, common_names, added_at, count
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            ingredient.id,
            ingredient.name,
            ingredient.category,
            ingredient.calories,
            ingredient.protein,
            ingredient.carbs,
            ingredient.fat,
            ingredient.serving_size,
            ingredient.serving_unit,
            ingredient.common_names || '',
            ingredient.added_at,
            ingredient.count || 1
          ]
        );
      }
    });
    console.log('Successfully saved ingredients');
  } catch (error) {
    console.error('Error saving ingredients:', error);
    throw error;
  }
}

export async function getIngredients(): Promise<Ingredient[]> {
  try {
    await initializeTables();
    const database = await getDatabase();
    const result = await database.getAllAsync<Ingredient>('SELECT * FROM ingredients ORDER BY created_at DESC');
    return result;
  } catch (error) {
    console.error('Error getting ingredients:', error);
    return [];
  }
}

export async function addIngredient(ingredient: Ingredient): Promise<void> {
  try {
    await initializeTables();
    console.log('Adding ingredient:', ingredient);
    const ingredients = await getIngredients();
    console.log('Current ingredients:', ingredients);
    // Check if a matching ingredient exists (by name, category, serving size/unit)
    const matchIndex = ingredients.findIndex(ing =>
      ing.name === ingredient.name &&
      ing.category === ingredient.category &&
      ing.serving_size === ingredient.serving_size &&
      ing.serving_unit === ingredient.serving_unit
    );
    if (matchIndex !== -1) {
      // Increment count and update fields
      const updated = [...ingredients];
      const existing = updated[matchIndex];
      updated[matchIndex] = {
        ...existing,
        name: ingredient.name,
        category: ingredient.category,
        common_names: ingredient.common_names,
        calories: ingredient.calories,
        protein: ingredient.protein,
        carbs: ingredient.carbs,
        fat: ingredient.fat,
        serving_size: ingredient.serving_size,
        serving_unit: ingredient.serving_unit,
        count: (existing.count || 1) + 1,
      };
      await saveIngredients(updated);
      console.log('Incremented count and updated fields for existing ingredient');
      return;
    }
    // Add as new with count = 1
    ingredient.count = 1;
    ingredients.push(ingredient);
    await saveIngredients(ingredients);
    console.log('Successfully added new ingredient');
  } catch (error) {
    console.error('Error adding ingredient:', error);
    throw error;
  }
}

export async function removeIngredient(id: string): Promise<void> {
  try {
    await initializeTables();
    const database = await getDatabase();
    await database.runAsync('DELETE FROM ingredients WHERE id = ?', [id]);
    console.log('Successfully removed ingredient');
  } catch (error) {
    console.error('Error removing ingredient:', error);
    throw error;
  }
}

export async function clearIngredients(): Promise<void> {
  try {
    await initializeTables();
    const database = await getDatabase();
    await database.runAsync('DELETE FROM ingredients');
    console.log('Successfully cleared all ingredients');
  } catch (error) {
    console.error('Error clearing ingredients:', error);
    throw error;
  }
}

export async function savePreferences(preferences: UserPreferences): Promise<void> {
  try {
    await initializeTables();
    const database = await getDatabase();
    await database.runAsync(
      'INSERT OR REPLACE INTO preferences (id, diet, measurementSystem) VALUES (1, ?, ?)',
      [JSON.stringify(preferences.diet), preferences.measurementSystem]
    );
  } catch (error) {
    console.error('Error saving preferences:', error);
    throw error;
  }
}

export async function getPreferences(): Promise<UserPreferences> {
  try {
    await initializeTables();
    const database = await getDatabase();
    const result = await database.getFirstAsync<{ diet: string; measurementSystem: 'metric' | 'imperial' }>(
      'SELECT diet, measurementSystem FROM preferences WHERE id = 1'
    );
    return result ? {
      diet: JSON.parse(result.diet),
      measurementSystem: result.measurementSystem,
    } : {
      diet: [],
      measurementSystem: 'metric',
    };
  } catch (error) {
    console.error('Error getting preferences:', error);
    return {
      diet: [],
      measurementSystem: 'metric',
    };
  }
}

export async function saveSavedRecipes(recipes: Recipe[]): Promise<void> {
  try {
    await initializeTables();
    const database = await getDatabase();
    await database.withTransactionAsync(async () => {
      // Clear existing saved recipes
      await database.runAsync('DELETE FROM saved_recipes');
      
      // Insert new saved recipes
      for (const recipe of recipes) {
        await database.runAsync(
          'INSERT INTO saved_recipes (id, data) VALUES (?, ?)',
          [recipe.id, JSON.stringify(recipe)]
        );
      }
    });
  } catch (error) {
    console.error('Error saving recipes:', error);
    throw error;
  }
}

export async function getSavedRecipes(): Promise<Recipe[]> {
  try {
    await initializeTables();
    const database = await getDatabase();
    const result = await database.getAllAsync<{ data: string }>('SELECT data FROM saved_recipes ORDER BY created_at DESC');
    return result.map(row => JSON.parse(row.data) as Recipe);
  } catch (error) {
    console.error('Error getting saved recipes:', error);
    return [];
  }
}

export async function saveRecipe(recipe: Recipe): Promise<void> {
  try {
    await initializeTables();
    const database = await getDatabase();
    await database.runAsync(
      'INSERT OR REPLACE INTO saved_recipes (id, data) VALUES (?, ?)',
      [recipe.id, JSON.stringify(recipe)]
    );
  } catch (error) {
    console.error('Error saving recipe:', error);
    throw error;
  }
}

// Initialize tables when this module is imported
initializeTables().catch(console.error); 
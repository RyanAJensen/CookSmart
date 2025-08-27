import { getDatabase } from './database';
import { Recipe } from '../types';

let isInitialized = false;

async function initializeRecipeTables(): Promise<void> {
  if (isInitialized) {
    return;
  }

  const database = await getDatabase();
  
  // Create recipes table
  await database.execAsync(`
    CREATE TABLE IF NOT EXISTS recipes (
      id TEXT PRIMARY KEY NOT NULL,
      title TEXT NOT NULL,
      image TEXT,
      readyInMinutes INTEGER,
      servings INTEGER,
      calories INTEGER,
      protein REAL,
      carbs REAL,
      fat REAL,
      ingredients TEXT NOT NULL,
      instructions TEXT NOT NULL,
      tags TEXT,
      source TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Create recipe categories table for better organization
  await database.execAsync(`
    CREATE TABLE IF NOT EXISTS recipe_categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      recipe_id TEXT NOT NULL,
      category TEXT NOT NULL,
      FOREIGN KEY (recipe_id) REFERENCES recipes (id) ON DELETE CASCADE
    );
  `);

  // Create indexes for better performance
  await database.execAsync(`
    CREATE INDEX IF NOT EXISTS idx_recipes_title ON recipes (title);
    CREATE INDEX IF NOT EXISTS idx_recipes_calories ON recipes (calories);
    CREATE INDEX IF NOT EXISTS idx_recipes_readyInMinutes ON recipes (readyInMinutes);
    CREATE INDEX IF NOT EXISTS idx_recipe_categories_category ON recipe_categories (category);
  `);

  isInitialized = true;
}

export async function saveRecipes(recipes: Recipe[]): Promise<void> {
  try {
    await initializeRecipeTables();
    const database = await getDatabase();
    
    await database.withTransactionAsync(async () => {
      for (const recipe of recipes) {
        // Check if recipe already exists
        const existing = await database.getFirstAsync<{ id: string }>(
          'SELECT id FROM recipes WHERE id = ?',
          [recipe.id]
        );

        if (existing) {
          // Update existing recipe
          await database.runAsync(`
            UPDATE recipes SET 
              title = ?, image = ?, readyInMinutes = ?, servings = ?,
              calories = ?, protein = ?, carbs = ?, fat = ?,
              ingredients = ?, instructions = ?, tags = ?, updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
          `, [
            recipe.title,
            recipe.image,
            recipe.readyInMinutes,
            recipe.servings,
            recipe.calories,
            recipe.protein,
            recipe.carbs,
            recipe.fat,
            JSON.stringify(recipe.ingredients),
            JSON.stringify(recipe.instructions),
            JSON.stringify(recipe.tags),
            recipe.id
          ]);
        } else {
          // Insert new recipe
          await database.runAsync(`
            INSERT INTO recipes (
              id, title, image, readyInMinutes, servings,
              calories, protein, carbs, fat, ingredients, instructions, tags, source
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `, [
            recipe.id,
            recipe.title,
            recipe.image,
            recipe.readyInMinutes,
            recipe.servings,
            recipe.calories,
            recipe.protein,
            recipe.carbs,
            recipe.fat,
            JSON.stringify(recipe.ingredients),
            JSON.stringify(recipe.instructions),
            JSON.stringify(recipe.tags),
            recipe.id.split('_')[0] // Extract source from ID (spoonacular, edamam, etc.)
          ]);
        }

        // Save categories
        if (recipe.tags && recipe.tags.length > 0) {
          // Remove existing categories for this recipe
          await database.runAsync(
            'DELETE FROM recipe_categories WHERE recipe_id = ?',
            [recipe.id]
          );

          // Insert new categories
          for (const tag of recipe.tags) {
            await database.runAsync(
              'INSERT INTO recipe_categories (recipe_id, category) VALUES (?, ?)',
              [recipe.id, tag.toLowerCase()]
            );
          }
        }
      }
    });

    console.log(`Successfully saved ${recipes.length} recipes to database`);
  } catch (error) {
    console.error('Error saving recipes:', error);
    throw error;
  }
}

export async function getAllRecipes(): Promise<Recipe[]> {
  try {
    await initializeRecipeTables();
    const database = await getDatabase();
    
    const result = await database.getAllAsync<{
      id: string;
      title: string;
      image: string;
      readyInMinutes: number;
      servings: number;
      calories: number;
      protein: number;
      carbs: number;
      fat: number;
      ingredients: string;
      instructions: string;
      tags: string;
    }>('SELECT * FROM recipes ORDER BY created_at DESC');

    return result.map(row => ({
      id: row.id,
      title: row.title,
      image: row.image,
      readyInMinutes: row.readyInMinutes,
      servings: row.servings,
      calories: row.calories,
      protein: row.protein,
      carbs: row.carbs,
      fat: row.fat,
      ingredients: JSON.parse(row.ingredients),
      instructions: JSON.parse(row.instructions),
      tags: JSON.parse(row.tags || '[]')
    }));
  } catch (error) {
    console.error('Error getting all recipes:', error);
    return [];
  }
}

export async function searchRecipes(query: string, limit: number = 50): Promise<Recipe[]> {
  try {
    await initializeRecipeTables();
    const database = await getDatabase();
    
    const result = await database.getAllAsync<{
      id: string;
      title: string;
      image: string;
      readyInMinutes: number;
      servings: number;
      calories: number;
      protein: number;
      carbs: number;
      fat: number;
      ingredients: string;
      instructions: string;
      tags: string;
    }>(
      `SELECT * FROM recipes 
       WHERE title LIKE ? OR tags LIKE ? OR ingredients LIKE ?
       ORDER BY created_at DESC
       LIMIT ?`,
      [`%${query}%`, `%${query}%`, `%${query}%`, limit]
    );

    return result.map(row => ({
      id: row.id,
      title: row.title,
      image: row.image,
      readyInMinutes: row.readyInMinutes,
      servings: row.servings,
      calories: row.calories,
      protein: row.protein,
      carbs: row.carbs,
      fat: row.fat,
      ingredients: JSON.parse(row.ingredients),
      instructions: JSON.parse(row.instructions),
      tags: JSON.parse(row.tags || '[]')
    }));
  } catch (error) {
    console.error('Error searching recipes:', error);
    return [];
  }
}

// New function to search recipes by multiple ingredients
export async function searchRecipesByIngredients(ingredients: string[], limit: number = 50): Promise<Recipe[]> {
  try {
    await initializeRecipeTables();
    const database = await getDatabase();
    
    if (ingredients.length === 0) {
      return [];
    }
    
    // Create LIKE conditions for each ingredient
    const likeConditions = ingredients.map(() => 'ingredients LIKE ?').join(' OR ');
    const likeParams = ingredients.map(ingredient => `%${ingredient.toLowerCase()}%`);
    
    const result = await database.getAllAsync<{
      id: string;
      title: string;
      image: string;
      readyInMinutes: number;
      servings: number;
      calories: number;
      protein: number;
      carbs: number;
      fat: number;
      ingredients: string;
      instructions: string;
      tags: string;
    }>(
      `SELECT * FROM recipes 
       WHERE ${likeConditions}
       ORDER BY created_at DESC
       LIMIT ?`,
      [...likeParams, limit]
    );

    return result.map(row => ({
      id: row.id,
      title: row.title,
      image: row.image,
      readyInMinutes: row.readyInMinutes,
      servings: row.servings,
      calories: row.calories,
      protein: row.protein,
      carbs: row.carbs,
      fat: row.fat,
      ingredients: JSON.parse(row.ingredients),
      instructions: JSON.parse(row.instructions),
      tags: JSON.parse(row.tags || '[]')
    }));
  } catch (error) {
    console.error('Error searching recipes by ingredients:', error);
    return [];
  }
}

// Function to clean up old generated/fallback tags from sample recipes
export async function cleanupOldRecipeTags(): Promise<void> {
  try {
    await initializeRecipeTables();
    const database = await getDatabase();
    
    // Get all sample recipes
    const sampleRecipes = await database.getAllAsync<{
      id: string;
      tags: string;
    }>(`SELECT id, tags FROM recipes WHERE id LIKE 'sample_%'`);
    
    for (const recipe of sampleRecipes) {
      const tags = JSON.parse(recipe.tags || '[]');
      const cleanedTags = tags.filter((tag: string) => 
        tag !== 'generated' && tag !== 'fallback'
      );
      
      // Update only if tags were changed
      if (cleanedTags.length !== tags.length) {
        await database.runAsync(
          `UPDATE recipes SET tags = ? WHERE id = ?`,
          [JSON.stringify(cleanedTags), recipe.id]
        );
        console.log(`Cleaned tags for recipe ${recipe.id}`);
      }
    }
    
    console.log('Recipe tag cleanup completed');
  } catch (error) {
    console.error('Error cleaning up recipe tags:', error);
  }
}

export async function getRecipesByCategory(category: string, limit: number = 50): Promise<Recipe[]> {
  try {
    await initializeRecipeTables();
    const database = await getDatabase();
    
    const result = await database.getAllAsync<{
      id: string;
      title: string;
      image: string;
      readyInMinutes: number;
      servings: number;
      calories: number;
      protein: number;
      carbs: number;
      fat: number;
      ingredients: string;
      instructions: string;
      tags: string;
    }>(
      `SELECT r.* FROM recipes r
       JOIN recipe_categories rc ON r.id = rc.recipe_id
       WHERE rc.category = ?
       ORDER BY r.created_at DESC
       LIMIT ?`,
      [category.toLowerCase(), limit]
    );

    return result.map(row => ({
      id: row.id,
      title: row.title,
      image: row.image,
      readyInMinutes: row.readyInMinutes,
      servings: row.servings,
      calories: row.calories,
      protein: row.protein,
      carbs: row.carbs,
      fat: row.fat,
      ingredients: JSON.parse(row.ingredients),
      instructions: JSON.parse(row.instructions),
      tags: JSON.parse(row.tags || '[]')
    }));
  } catch (error) {
    console.error('Error getting recipes by category:', error);
    return [];
  }
}

export async function getRecipeById(id: string): Promise<Recipe | null> {
  try {
    await initializeRecipeTables();
    const database = await getDatabase();
    
    const result = await database.getFirstAsync<{
      id: string;
      title: string;
      image: string;
      readyInMinutes: number;
      servings: number;
      calories: number;
      protein: number;
      carbs: number;
      fat: number;
      ingredients: string;
      instructions: string;
      tags: string;
    }>('SELECT * FROM recipes WHERE id = ?', [id]);

    if (!result) return null;

    return {
      id: result.id,
      title: result.title,
      image: result.image,
      readyInMinutes: result.readyInMinutes,
      servings: result.servings,
      calories: result.calories,
      protein: result.protein,
      carbs: result.carbs,
      fat: result.fat,
      ingredients: JSON.parse(result.ingredients),
      instructions: JSON.parse(result.instructions),
      tags: JSON.parse(result.tags || '[]')
    };
  } catch (error) {
    console.error('Error getting recipe by ID:', error);
    return null;
  }
}

export async function getRecipeCount(): Promise<number> {
  try {
    await initializeRecipeTables();
    const database = await getDatabase();
    
    const result = await database.getFirstAsync<{ count: number }>(
      'SELECT COUNT(*) as count FROM recipes'
    );
    
    return result?.count || 0;
  } catch (error) {
    console.error('Error getting recipe count:', error);
    return 0;
  }
}

export async function getAvailableCategories(): Promise<string[]> {
  try {
    await initializeRecipeTables();
    const database = await getDatabase();
    
    const result = await database.getAllAsync<{ category: string }>(
      'SELECT DISTINCT category FROM recipe_categories ORDER BY category'
    );
    
    return result.map(row => row.category);
  } catch (error) {
    console.error('Error getting available categories:', error);
    return [];
  }
}

export async function deleteRecipe(id: string): Promise<void> {
  try {
    await initializeRecipeTables();
    const database = await getDatabase();
    
    await database.withTransactionAsync(async () => {
      await database.runAsync('DELETE FROM recipe_categories WHERE recipe_id = ?', [id]);
      await database.runAsync('DELETE FROM recipes WHERE id = ?', [id]);
    });
  } catch (error) {
    console.error('Error deleting recipe:', error);
    throw error;
  }
}

export async function clearAllRecipes(): Promise<void> {
  try {
    await initializeRecipeTables();
    const database = await getDatabase();
    
    await database.withTransactionAsync(async () => {
      await database.runAsync('DELETE FROM recipe_categories');
      await database.runAsync('DELETE FROM recipes');
    });
    
    console.log('All recipes cleared from database');
  } catch (error) {
    console.error('Error clearing recipes:', error);
    throw error;
  }
} 
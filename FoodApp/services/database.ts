import { openDatabaseAsync, SQLiteDatabase } from 'expo-sqlite';
import { Ingredient } from '../types';

let db: SQLiteDatabase | null = null;
let isInitializing = false;
let initializationError: Error | null = null;

export const initDatabase = async (): Promise<void> => {
  if (isInitializing) {
    // Wait for initialization to complete
    return new Promise((resolve, reject) => {
      const checkInterval = setInterval(() => {
        if (!isInitializing) {
          clearInterval(checkInterval);
          if (initializationError) {
            reject(initializationError);
          } else {
            resolve();
          }
        }
      }, 100);
    });
  }

  if (db) {
    return Promise.resolve();
  }

  isInitializing = true;
  initializationError = null;

  try {
    db = await openDatabaseAsync('foodapp.db');
    
    // Drop and recreate table to ensure clean schema
    await db.execAsync('DROP TABLE IF EXISTS ingredients;');
    
    // Create table with correct schema
    await db.execAsync(`
      CREATE TABLE ingredients (
        id TEXT PRIMARY KEY,
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
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Add migration to add common_names column if it doesn't exist
    try {
      await db.execAsync('ALTER TABLE ingredients ADD COLUMN common_names TEXT;');
    } catch (e) {
      // Ignore error if column already exists
    }

    // Add migration to add added_at column if it doesn't exist
    try {
      await db.execAsync('ALTER TABLE ingredients ADD COLUMN added_at TEXT;');
    } catch (e) {
      // Ignore error if column already exists
    }

    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
    initializationError = error as Error;
    throw error;
  } finally {
    isInitializing = false;
  }
};

export const getDatabase = (): SQLiteDatabase => {
  if (!db) {
    throw new Error('Database not initialized. Call initDatabase() first.');
  }
  return db;
};

export const addIngredient = async (ingredient: Ingredient): Promise<void> => {
  const database = getDatabase();
  await database.runAsync(
    `INSERT INTO ingredients (
      id, name, category, calories, protein, carbs, fat, 
      serving_size, serving_unit, common_names, added_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
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
      ingredient.added_at
    ]
  );
  console.log('Ingredient added successfully');
};

export const getIngredients = async (): Promise<Ingredient[]> => {
  const database = getDatabase();
  return await database.getAllAsync<Ingredient>(
    'SELECT * FROM ingredients ORDER BY created_at DESC'
  );
};

export const removeIngredient = async (id: string): Promise<void> => {
  const database = getDatabase();
  await database.runAsync(
    'DELETE FROM ingredients WHERE id = ?',
    [id]
  );
  console.log('Ingredient removed successfully');
};

export const insertIngredient = async (ingredient: Ingredient): Promise<void> => {
  const database = getDatabase();
  await database.runAsync(
    `INSERT OR REPLACE INTO ingredients (
      id, name, category, common_names, calories, protein, carbs, fat, 
      serving_size, serving_unit, added_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      ingredient.id,
      ingredient.name,
      ingredient.category,
      ingredient.common_names || '',
      ingredient.calories,
      ingredient.protein,
      ingredient.carbs,
      ingredient.fat,
      ingredient.serving_size,
      ingredient.serving_unit,
      ingredient.added_at
    ]
  );
};

export const searchIngredients = async (query: string): Promise<Ingredient[]> => {
  const database = getDatabase();
  return await database.getAllAsync<Ingredient>(
    `SELECT * FROM ingredients 
     WHERE name LIKE ? OR common_names LIKE ?
     ORDER BY name ASC`,
    [`%${query}%`, `%${query}%`]
  );
};

export const getIngredientById = async (id: string): Promise<Ingredient | null> => {
  const database = getDatabase();
  return await database.getFirstAsync<Ingredient>(
    'SELECT * FROM ingredients WHERE id = ?',
    [id]
  );
};

export const getAllIngredients = async (): Promise<Ingredient[]> => {
  const database = getDatabase();
  return await database.getAllAsync<Ingredient>(
    'SELECT * FROM ingredients ORDER BY name ASC'
  );
};

export const clearIngredients = async (): Promise<void> => {
  const database = getDatabase();
  await database.runAsync('DELETE FROM ingredients');
}; 
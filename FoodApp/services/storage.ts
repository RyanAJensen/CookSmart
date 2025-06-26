import * as SecureStore from 'expo-secure-store';
import { Ingredient, UserPreferences } from '../types';

const STORAGE_KEYS = {
  INGREDIENTS: 'ingredients',
  PREFERENCES: 'preferences',
  SAVED_RECIPES: 'saved_recipes',
};

export async function saveIngredients(ingredients: Ingredient[]): Promise<void> {
  try {
    const jsonValue = JSON.stringify(ingredients);
    console.log('Saving ingredients:', jsonValue);
    await SecureStore.setItemAsync(STORAGE_KEYS.INGREDIENTS, jsonValue);
    // Verify the save was successful
    const savedData = await SecureStore.getItemAsync(STORAGE_KEYS.INGREDIENTS);
    if (!savedData) {
      throw new Error('Failed to verify saved ingredients');
    }
    console.log('Successfully saved and verified ingredients');
  } catch (error) {
    console.error('Error saving ingredients:', error);
    throw error;
  }
}

export async function getIngredients(): Promise<Ingredient[]> {
  try {
    const data = await SecureStore.getItemAsync(STORAGE_KEYS.INGREDIENTS);
    console.log('Retrieved ingredients data:', data);
    if (!data) {
      console.log('No ingredients found in storage');
      return [];
    }
    const ingredients = JSON.parse(data);
    console.log('Parsed ingredients:', ingredients);
    return ingredients;
  } catch (error) {
    console.error('Error getting ingredients:', error);
    return [];
  }
}

export async function addIngredient(ingredient: Ingredient): Promise<void> {
  try {
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
    const ingredients = await getIngredients();
    const filtered = ingredients.filter(ing => ing.id !== id);
    await saveIngredients(filtered);
  } catch (error) {
    console.error('Error removing ingredient:', error);
    throw error;
  }
}

export async function savePreferences(preferences: UserPreferences): Promise<void> {
  try {
    await SecureStore.setItemAsync(STORAGE_KEYS.PREFERENCES, JSON.stringify(preferences));
  } catch (error) {
    console.error('Error saving preferences:', error);
    throw error;
  }
}

export async function getPreferences(): Promise<UserPreferences> {
  try {
    const data = await SecureStore.getItemAsync(STORAGE_KEYS.PREFERENCES);
    return data ? JSON.parse(data) : {
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
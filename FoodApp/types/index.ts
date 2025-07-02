export interface Ingredient {
  id: string;
  name: string;
  category: string;
  common_names?: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  serving_size: number;
  serving_unit: string;
  added_at: string;
  count?: number;
}

export interface IngredientItem {
  name: string;
  amount: number;
  unit: string;
  inPantry: boolean;
}

export interface Recipe {
  id: string;
  title: string;
  image: string;
  readyInMinutes: number;
  servings: number;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  ingredients: IngredientItem[];
  instructions: string[];
  tags: string[];
}

export interface UserPreferences {
  diet: string[];
  measurementSystem: 'metric' | 'imperial';
  defaultCookTime?: number;
} 
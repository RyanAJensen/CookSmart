import { Ingredient } from '../types';
import { initDatabase, insertIngredient, searchIngredients, getIngredientById, getAllIngredients } from './database';

interface Nutrition {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  servingSize: number;
  servingUnit: string;
}

interface CommonIngredient {
  id: string;
  name: string;
  category: string;
  common_names: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  serving_size: number;
  serving_unit: string;
  added_at: string;
}

export const commonIngredients: CommonIngredient[] = [
  {
    id: 'chicken-breast',
    name: 'Chicken Breast',
    common_names: 'chicken breast,chicken fillet,chicken meat',
    category: 'Meat',
    added_at: new Date().toISOString(),
    calories: 165,
    protein: 31,
    carbs: 0,
    fat: 3.6,
    serving_size: 100,
    serving_unit: 'g'
  },
  {
    id: 'brown-rice',
    name: 'Brown Rice',
    common_names: 'brown rice,whole grain rice',
    category: 'Grains',
    added_at: new Date().toISOString(),
    calories: 112,
    protein: 2.6,
    carbs: 23.5,
    fat: 0.9,
    serving_size: 100,
    serving_unit: 'g'
  },
  {
    id: 'broccoli',
    name: 'Broccoli',
    common_names: 'broccoli,broccoli florets',
    category: 'Vegetables',
    added_at: new Date().toISOString(),
    calories: 34,
    protein: 2.8,
    carbs: 6.6,
    fat: 0.4,
    serving_size: 100,
    serving_unit: 'g'
  },
  {
    id: 'salmon',
    name: 'Salmon',
    common_names: 'salmon,salmon fillet,atlantic salmon',
    category: 'Fish',
    added_at: new Date().toISOString(),
    calories: 208,
    protein: 22,
    carbs: 0,
    fat: 13,
    serving_size: 100,
    serving_unit: 'g'
  },
  {
    id: 'sweet-potato',
    name: 'Sweet Potato',
    common_names: 'sweet potato,yam,sweet yam',
    category: 'Vegetables',
    added_at: new Date().toISOString(),
    calories: 86,
    protein: 1.6,
    carbs: 20,
    fat: 0.1,
    serving_size: 100,
    serving_unit: 'g'
  },
  {
    id: 'quinoa',
    name: 'Quinoa',
    common_names: 'quinoa,quinoa grain',
    category: 'Grains',
    added_at: new Date().toISOString(),
    calories: 120,
    protein: 4.4,
    carbs: 21.3,
    fat: 1.9,
    serving_size: 100,
    serving_unit: 'g'
  },
  {
    id: 'spinach',
    name: 'Spinach',
    common_names: 'spinach,baby spinach,spinach leaves',
    category: 'Vegetables',
    added_at: new Date().toISOString(),
    calories: 23,
    protein: 2.9,
    carbs: 3.6,
    fat: 0.4,
    serving_size: 100,
    serving_unit: 'g'
  },
  {
    id: 'greek-yogurt',
    name: 'Greek Yogurt',
    common_names: 'greek yogurt,strained yogurt',
    category: 'Dairy',
    added_at: new Date().toISOString(),
    calories: 59,
    protein: 10.3,
    carbs: 3.6,
    fat: 0.4,
    serving_size: 100,
    serving_unit: 'g'
  },
  {
    id: 'almonds',
    name: 'Almonds',
    common_names: 'almonds,almond nuts',
    category: 'Nuts',
    added_at: new Date().toISOString(),
    calories: 579,
    protein: 21.2,
    carbs: 21.7,
    fat: 49.9,
    serving_size: 100,
    serving_unit: 'g'
  },
  {
    id: 'banana',
    name: 'Banana',
    common_names: 'banana,bananas',
    category: 'Fruits',
    added_at: new Date().toISOString(),
    calories: 89,
    protein: 1.1,
    carbs: 22.8,
    fat: 0.3,
    serving_size: 100,
    serving_unit: 'g'
  }
];

// Initialize database with common ingredients
export const initializeCommonIngredients = async () => {
  try {
    await initDatabase();
    
    // Add initial common ingredients if they don't exist
    const initialIngredients: Ingredient[] = [
      {
        id: 'chicken-breast',
        name: 'Chicken Breast',
        common_names: 'chicken breast,chicken fillet,chicken meat',
        category: 'Meat',
        added_at: new Date().toISOString(),
        calories: 165,
        protein: 31,
        carbs: 0,
        fat: 3.6,
        serving_size: 100,
        serving_unit: 'g'
      },
      {
        id: 'brown-rice',
        name: 'Brown Rice',
        common_names: 'brown rice,whole grain rice',
        category: 'Grains',
        added_at: new Date().toISOString(),
        calories: 112,
        protein: 2.6,
        carbs: 23.5,
        fat: 0.9,
        serving_size: 100,
        serving_unit: 'g'
      }
    ];

    for (const ingredient of initialIngredients) {
      await insertIngredient(ingredient);
    }
  } catch (error) {
    console.error('Error initializing common ingredients:', error);
  }
};

export const searchCommonIngredients = async (query: string): Promise<Ingredient[]> => {
  try {
    return await searchIngredients(query);
  } catch (error) {
    console.error('Error searching ingredients:', error);
    return [];
  }
};

export const getCommonIngredientById = async (id: string): Promise<Ingredient | undefined> => {
  try {
    const ingredient = await getIngredientById(id);
    return ingredient || undefined;
  } catch (error) {
    console.error('Error getting ingredient by ID:', error);
    return undefined;
  }
};

export const getAllCommonIngredients = async (): Promise<Ingredient[]> => {
  try {
    return await getAllIngredients();
  } catch (error) {
    console.error('Error getting all ingredients:', error);
    return [];
  }
}; 
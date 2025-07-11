import { Ingredient } from '../types';
import { AIRecipePreferences } from '../types';

interface ComingSoonRecipe {
  id: string;
  title: string;
  image: string;
  readyInMinutes: number;
  servings: number;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  ingredients: any[];
  instructions: string[];
  tags: string[];
  confidenceScore?: number;
  missingIngredients?: any[];
  isComingSoon?: boolean;
}

// Coming Soon placeholder for AI recipe generation
export async function generateAIRecipesFromPantry(
  ingredients: Ingredient[], 
  count: number = 3,
  preferences?: AIRecipePreferences
): Promise<ComingSoonRecipe[]> {
  console.log(`🍳 AI Recipe Generation - Coming Soon!`);
  
  // Return a single "coming soon" recipe
  return [{
    id: 'coming-soon-ai',
    title: 'AI Recipe Generation - Coming Soon!',
    image: '',
    readyInMinutes: 0,
    servings: 0,
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
    ingredients: [],
    instructions: [
      '🤖 AI-powered recipe generation is coming soon!',
      'We\'re working hard to bring you intelligent recipe suggestions.',
      'For now, try searching recipes with your pantry ingredients using the "Find Recipes" option.',
      'Stay tuned for updates!'
    ],
    tags: ['coming-soon', 'ai', 'placeholder'],
    confidenceScore: 100,
    missingIngredients: [],
    isComingSoon: true
  }];
}

// Test function for debugging - now just returns the coming soon message
export async function testRecipeGeneration(): Promise<void> {
  const testIngredients: Ingredient[] = [
    {
      id: 'test-1',
      name: 'Chicken Breast',
      category: 'Protein',
      calories: 165,
      protein: 31,
      carbs: 0,
      fat: 3.6,
      serving_size: 100,
      serving_unit: 'g',
      common_names: '',
      added_at: new Date().toISOString(),
      count: 1,
    }
  ];
  
  const recipes = await generateAIRecipesFromPantry(testIngredients, 1);
  console.log('Coming soon message:', recipes[0].title);
}
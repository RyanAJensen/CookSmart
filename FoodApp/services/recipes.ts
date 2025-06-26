import { Recipe } from '../types';

// Sample recipe data - in a real app, this would come from an API
const sampleRecipes: Recipe[] = [
  {
    id: 1,
    title: 'Chicken Stir Fry',
    image: 'https://example.com/stir-fry.jpg',
    readyInMinutes: 30,
    servings: 4,
    calories: 450,
    protein: 35,
    carbs: 40,
    fat: 15,
    ingredients: [
      { name: 'chicken breast', amount: 500, unit: 'g', inPantry: false },
      { name: 'broccoli', amount: 200, unit: 'g', inPantry: false },
      { name: 'carrots', amount: 100, unit: 'g', inPantry: false },
      { name: 'soy sauce', amount: 60, unit: 'ml', inPantry: false },
    ],
    instructions: [
      'Cut chicken into bite-sized pieces',
      'Chop vegetables',
      'Stir fry chicken until cooked',
      'Add vegetables and stir fry',
      'Add soy sauce and serve',
    ],
    tags: ['dinner', 'healthy', 'quick'],
  },
  {
    id: 2,
    title: 'Pasta with Tomato Sauce',
    image: 'https://example.com/pasta.jpg',
    readyInMinutes: 20,
    servings: 2,
    calories: 600,
    protein: 20,
    carbs: 80,
    fat: 25,
    ingredients: [
      { name: 'pasta', amount: 200, unit: 'g', inPantry: false },
      { name: 'tomato sauce', amount: 400, unit: 'g', inPantry: false },
      { name: 'garlic', amount: 2, unit: 'cloves', inPantry: false },
      { name: 'olive oil', amount: 30, unit: 'ml', inPantry: false },
    ],
    instructions: [
      'Cook pasta according to package instructions',
      'Sauté garlic in olive oil',
      'Add tomato sauce and simmer',
      'Combine with pasta and serve',
    ],
    tags: ['dinner', 'vegetarian', 'quick'],
  },
];

export async function searchRecipes(
  pantryIngredients: string[],
  strictMatch: boolean = false
): Promise<Recipe[]> {
  // Convert pantry ingredients to lowercase for case-insensitive matching
  const pantryIngredientsLower = pantryIngredients.map(ing => ing.toLowerCase());

  return sampleRecipes.filter(recipe => {
    // Check if recipe ingredients are in pantry
    const recipeIngredients = recipe.ingredients.map(ing => ing.name.toLowerCase());
    
    if (strictMatch) {
      // All recipe ingredients must be in pantry
      return recipeIngredients.every(ing => 
        pantryIngredientsLower.some(pantryIng => pantryIng.includes(ing))
      );
    } else {
      // At least one recipe ingredient must be in pantry
      return recipeIngredients.some(ing => 
        pantryIngredientsLower.some(pantryIng => pantryIng.includes(ing))
      );
    }
  });
}

export async function getRecipeById(id: number): Promise<Recipe | null> {
  return sampleRecipes.find(recipe => recipe.id === id) || null;
} 
import { Recipe } from '../types';

// Sample recipe data - in a real app, this would come from an API
const sampleRecipes: Recipe[] = [
  {
    id: '1',
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
    id: '2',
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
  {
    id: '3',
    title: 'Greek Salad',
    image: 'https://example.com/greek-salad.jpg',
    readyInMinutes: 15,
    servings: 4,
    calories: 280,
    protein: 8,
    carbs: 12,
    fat: 22,
    ingredients: [
      { name: 'cucumber', amount: 1, unit: 'large', inPantry: false },
      { name: 'tomatoes', amount: 4, unit: 'medium', inPantry: false },
      { name: 'red onion', amount: 1, unit: 'small', inPantry: false },
      { name: 'feta cheese', amount: 200, unit: 'g', inPantry: false },
      { name: 'olives', amount: 100, unit: 'g', inPantry: false },
      { name: 'olive oil', amount: 60, unit: 'ml', inPantry: false },
      { name: 'lemon juice', amount: 30, unit: 'ml', inPantry: false },
    ],
    instructions: [
      'Chop cucumber, tomatoes, and red onion',
      'Combine vegetables in a large bowl',
      'Add crumbled feta cheese and olives',
      'Drizzle with olive oil and lemon juice',
      'Season with salt and pepper to taste',
    ],
    tags: ['salad', 'vegetarian', 'healthy', 'quick'],
  },
  {
    id: '4',
    title: 'Beef Tacos',
    image: 'https://example.com/beef-tacos.jpg',
    readyInMinutes: 25,
    servings: 4,
    calories: 520,
    protein: 28,
    carbs: 45,
    fat: 26,
    ingredients: [
      { name: 'ground beef', amount: 500, unit: 'g', inPantry: false },
      { name: 'taco seasoning', amount: 1, unit: 'packet', inPantry: false },
      { name: 'tortillas', amount: 8, unit: 'pieces', inPantry: false },
      { name: 'lettuce', amount: 1, unit: 'head', inPantry: false },
      { name: 'tomatoes', amount: 2, unit: 'medium', inPantry: false },
      { name: 'cheese', amount: 200, unit: 'g', inPantry: false },
      { name: 'sour cream', amount: 120, unit: 'ml', inPantry: false },
    ],
    instructions: [
      'Brown ground beef in a large skillet',
      'Add taco seasoning and water, simmer for 5 minutes',
      'Warm tortillas in a dry pan',
      'Chop lettuce and tomatoes',
      'Assemble tacos with meat, vegetables, cheese, and sour cream',
    ],
    tags: ['dinner', 'mexican', 'family-friendly'],
  },
  {
    id: '5',
    title: 'Vegetable Curry',
    image: 'https://example.com/vegetable-curry.jpg',
    readyInMinutes: 40,
    servings: 4,
    calories: 380,
    protein: 12,
    carbs: 55,
    fat: 18,
    ingredients: [
      { name: 'potatoes', amount: 400, unit: 'g', inPantry: false },
      { name: 'carrots', amount: 200, unit: 'g', inPantry: false },
      { name: 'onions', amount: 2, unit: 'medium', inPantry: false },
      { name: 'coconut milk', amount: 400, unit: 'ml', inPantry: false },
      { name: 'curry powder', amount: 2, unit: 'tbsp', inPantry: false },
      { name: 'rice', amount: 300, unit: 'g', inPantry: false },
      { name: 'garlic', amount: 4, unit: 'cloves', inPantry: false },
    ],
    instructions: [
      'Cook rice according to package instructions',
      'Chop all vegetables into bite-sized pieces',
      'Sauté onions and garlic until fragrant',
      'Add curry powder and cook for 1 minute',
      'Add vegetables and coconut milk, simmer for 20 minutes',
      'Serve over rice',
    ],
    tags: ['dinner', 'vegetarian', 'indian', 'spicy'],
  },
  {
    id: '6',
    title: 'Breakfast Smoothie Bowl',
    image: 'https://example.com/smoothie-bowl.jpg',
    readyInMinutes: 10,
    servings: 2,
    calories: 320,
    protein: 15,
    carbs: 45,
    fat: 12,
    ingredients: [
      { name: 'banana', amount: 2, unit: 'large', inPantry: false },
      { name: 'berries', amount: 200, unit: 'g', inPantry: false },
      { name: 'yogurt', amount: 200, unit: 'ml', inPantry: false },
      { name: 'honey', amount: 30, unit: 'ml', inPantry: false },
      { name: 'granola', amount: 100, unit: 'g', inPantry: false },
      { name: 'chia seeds', amount: 20, unit: 'g', inPantry: false },
    ],
    instructions: [
      'Blend banana, berries, yogurt, and honey until smooth',
      'Pour into bowls',
      'Top with granola and chia seeds',
      'Add extra berries for decoration',
    ],
    tags: ['breakfast', 'vegetarian', 'healthy', 'quick'],
  },
  {
    id: '7',
    title: 'Grilled Salmon',
    image: 'https://example.com/grilled-salmon.jpg',
    readyInMinutes: 20,
    servings: 2,
    calories: 420,
    protein: 45,
    carbs: 8,
    fat: 24,
    ingredients: [
      { name: 'salmon fillets', amount: 400, unit: 'g', inPantry: false },
      { name: 'lemon', amount: 1, unit: 'whole', inPantry: false },
      { name: 'dill', amount: 2, unit: 'tbsp', inPantry: false },
      { name: 'olive oil', amount: 30, unit: 'ml', inPantry: false },
      { name: 'garlic', amount: 2, unit: 'cloves', inPantry: false },
      { name: 'asparagus', amount: 200, unit: 'g', inPantry: false },
    ],
    instructions: [
      'Preheat grill to medium-high heat',
      'Season salmon with salt, pepper, and dill',
      'Drizzle with olive oil and lemon juice',
      'Grill salmon for 4-5 minutes per side',
      'Grill asparagus alongside salmon',
      'Serve with lemon wedges',
    ],
    tags: ['dinner', 'healthy', 'seafood', 'grilled'],
  },
  {
    id: '8',
    title: 'Chocolate Chip Cookies',
    image: 'https://example.com/chocolate-cookies.jpg',
    readyInMinutes: 35,
    servings: 24,
    calories: 180,
    protein: 2,
    carbs: 22,
    fat: 10,
    ingredients: [
      { name: 'flour', amount: 300, unit: 'g', inPantry: false },
      { name: 'butter', amount: 200, unit: 'g', inPantry: false },
      { name: 'sugar', amount: 150, unit: 'g', inPantry: false },
      { name: 'eggs', amount: 2, unit: 'large', inPantry: false },
      { name: 'chocolate chips', amount: 200, unit: 'g', inPantry: false },
      { name: 'vanilla extract', amount: 5, unit: 'ml', inPantry: false },
    ],
    instructions: [
      'Preheat oven to 350°F (175°C)',
      'Cream butter and sugar until fluffy',
      'Beat in eggs and vanilla',
      'Mix in flour and chocolate chips',
      'Drop spoonfuls onto baking sheet',
      'Bake for 10-12 minutes until golden',
    ],
    tags: ['dessert', 'baking', 'sweet', 'family-friendly'],
  },
  {
    id: '9',
    title: 'Quinoa Buddha Bowl',
    image: 'https://example.com/buddha-bowl.jpg',
    readyInMinutes: 30,
    servings: 2,
    calories: 450,
    protein: 18,
    carbs: 65,
    fat: 16,
    ingredients: [
      { name: 'quinoa', amount: 100, unit: 'g', inPantry: false },
      { name: 'sweet potato', amount: 1, unit: 'medium', inPantry: false },
      { name: 'kale', amount: 100, unit: 'g', inPantry: false },
      { name: 'chickpeas', amount: 200, unit: 'g', inPantry: false },
      { name: 'avocado', amount: 1, unit: 'medium', inPantry: false },
      { name: 'tahini', amount: 30, unit: 'ml', inPantry: false },
      { name: 'lemon juice', amount: 15, unit: 'ml', inPantry: false },
    ],
    instructions: [
      'Cook quinoa according to package instructions',
      'Roast sweet potato cubes for 20 minutes',
      'Massage kale with olive oil and salt',
      'Drain and rinse chickpeas',
      'Make tahini dressing with lemon juice',
      'Assemble bowl with all ingredients',
    ],
    tags: ['lunch', 'vegetarian', 'healthy', 'bowl'],
  },
  {
    id: '10',
    title: 'Chicken Noodle Soup',
    image: 'https://example.com/chicken-soup.jpg',
    readyInMinutes: 60,
    servings: 6,
    calories: 280,
    protein: 25,
    carbs: 35,
    fat: 8,
    ingredients: [
      { name: 'chicken breast', amount: 500, unit: 'g', inPantry: false },
      { name: 'noodles', amount: 200, unit: 'g', inPantry: false },
      { name: 'carrots', amount: 200, unit: 'g', inPantry: false },
      { name: 'celery', amount: 100, unit: 'g', inPantry: false },
      { name: 'onions', amount: 1, unit: 'large', inPantry: false },
      { name: 'chicken broth', amount: 1.5, unit: 'L', inPantry: false },
      { name: 'garlic', amount: 3, unit: 'cloves', inPantry: false },
    ],
    instructions: [
      'Sauté onions, carrots, and celery until softened',
      'Add chicken broth and bring to boil',
      'Add chicken breast and simmer for 20 minutes',
      'Remove chicken, shred, and return to pot',
      'Add noodles and cook until tender',
      'Season with salt and pepper to taste',
    ],
    tags: ['soup', 'comfort', 'healthy', 'family-friendly'],
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

export async function getRecipeById(id: string): Promise<Recipe | null> {
  return sampleRecipes.find(recipe => recipe.id === id) || null;
}

// A new function to find any recipe by its ID, including AI-generated ones.
export async function findRecipeById(id: string): Promise<Recipe | null> {
  // For now, we just search the sample recipes. In a real app, this would also search the AI recipes.
  return getRecipeById(id);
} 
import { Recipe } from '../types';
import { getAllRecipes, searchRecipes as searchStoredRecipes } from './recipeStorage';
import { recipeScraper } from './recipeScraper';

// REMOVED: Sample recipe data - we want to see real API results only

// Helper function to remove duplicate recipes
function removeDuplicateRecipes(recipes: Recipe[]): Recipe[] {
  const seen = new Set<string>();
  return recipes.filter(recipe => {
    const key = recipe.title.toLowerCase().trim();
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
}

// Helper function to calculate recipe match score based on ingredients
function calculateMatchScore(recipe: Recipe, pantryIngredients: string[]): number {
  const recipeIngredients = recipe.ingredients.map(ing => ing.name.toLowerCase());
  const pantryIngredientsLower = pantryIngredients.map(ing => ing.toLowerCase());
  
  let matchCount = 0;
  let totalIngredients = recipeIngredients.length;
  
  for (const recipeIng of recipeIngredients) {
    for (const pantryIng of pantryIngredientsLower) {
      if (recipeIng.includes(pantryIng) || pantryIng.includes(recipeIng)) {
        matchCount++;
        break;
      }
    }
  }
  
  return totalIngredients > 0 ? (matchCount / totalIngredients) * 100 : 0;
}

// Helper function to filter recipes based on strict/partial matching
function filterRecipesByIngredients(recipes: Recipe[], pantryIngredients: string[], strictMatch: boolean): Recipe[] {
  if (pantryIngredients.length === 0) {
    return recipes;
  }

  return recipes.filter(recipe => {
    const recipeIngredients = recipe.ingredients.map(ing => ing.name.toLowerCase());
    const pantryIngredientsLower = pantryIngredients.map(ing => ing.toLowerCase());
    
    if (strictMatch) {
      // For strict match: at least 80% of recipe ingredients must be available in pantry
      const matchingCount = recipeIngredients.filter(recipeIng => 
        pantryIngredientsLower.some(pantryIng => 
          recipeIng.includes(pantryIng) || pantryIng.includes(recipeIng)
        )
      ).length;
      return matchingCount >= Math.floor(recipeIngredients.length * 0.8);
    } else {
      // For partial match: recipe must contain at least ONE of our pantry ingredients
      return recipeIngredients.some(recipeIng => 
        pantryIngredientsLower.some(pantryIng => 
          recipeIng.includes(pantryIng) || pantryIng.includes(recipeIng)
        )
      );
    }
  });
}

// Unified function for searching and downloading recipes from the internet
export async function searchOnlineRecipes(
  pantryIngredients: string[],
  strictMatch: boolean = false,
  maxResults: number = 20
): Promise<Recipe[]> {
  if (pantryIngredients.length === 0) {
    throw new Error('No ingredients provided for recipe search');
  }

  try {
    console.log(`Searching online for recipes with ingredients: ${pantryIngredients.join(', ')}`);
    // Use the scraper to get recipes from APIs and web
    const onlineRecipes = await recipeScraper.searchRecipesByIngredients(
      pantryIngredients,
      strictMatch ? 'strict' : 'partial',
      maxResults
    );
    // Save to database
    if (onlineRecipes.length > 0) {
      // Assuming saveRecipes is defined elsewhere or will be added
      // await saveRecipes(onlineRecipes); 
      console.log(`Saved ${onlineRecipes.length} online recipes to database`);
    }
    return onlineRecipes;
  } catch (error) {
    console.error('Error searching online recipes:', error);
    // Return empty array instead of fallback recipes
    return [];
  }
}

// DEPRECATED: Use searchOnlineRecipes instead
export const searchAndDownloadRecipes = searchOnlineRecipes;

// Function to search only stored recipes (no online search)
export async function searchStoredRecipesOnly(
  pantryIngredients: string[],
  strictMatch: boolean = false
): Promise<Recipe[]> {
  if (pantryIngredients.length === 0) {
    // Return empty array when no ingredients are provided - no sample recipes
    return [];
  }

  try {
    console.log(`Searching stored recipes with ingredients: ${pantryIngredients.join(', ')}`);
    
    // Use the new database search function for better performance
    const { searchRecipesByIngredients } = await import('./recipeStorage');
    const candidateRecipes = await searchRecipesByIngredients(pantryIngredients, 100);
    
    // If no candidate recipes found, try getting all recipes as fallback
    let recipesToFilter = candidateRecipes;
    if (candidateRecipes.length === 0) {
      console.log('No recipes found with database search, trying all recipes...');
      recipesToFilter = await getAllStoredRecipes();
    }
    
    // If still no recipes, return empty array
    if (recipesToFilter.length === 0) {
      console.log('No stored recipes found in database');
      return [];
    }
    
    // Filter recipes based on strict/partial matching
    const filteredRecipes = filterRecipesByIngredients(recipesToFilter, pantryIngredients, strictMatch);
    
    // Calculate match scores and sort by relevance
    const scoredRecipes = filteredRecipes.map(recipe => ({
      ...recipe,
      matchScore: calculateMatchScore(recipe, pantryIngredients)
    })).sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));

    console.log(`Found ${scoredRecipes.length} stored recipes matching ingredients`);
    return scoredRecipes;
  } catch (error) {
    console.error('Error searching stored recipes:', error);
    return [];
  }
}

// Helper function to get all stored recipes
async function getAllStoredRecipes(): Promise<Recipe[]> {
  try {
    // Import here to avoid circular dependency
    const { getAllRecipes } = await import('./recipeStorage');
    return await getAllRecipes();
  } catch (error) {
    console.error('Error getting all stored recipes:', error);
    return [];
  }
}

// Legacy function for backward compatibility
export async function searchRecipes(
  pantryIngredients: string[],
  strictMatch: boolean = false,
  includeOnlineSearch: boolean = false
): Promise<Recipe[]> {
  if (includeOnlineSearch) {
    return searchAndDownloadRecipes(pantryIngredients, strictMatch, 20);
  } else {
    return searchStoredRecipesOnly(pantryIngredients, strictMatch);
  }
}

// Function to get all available recipes (stored + sample)
export async function getAllAvailableRecipes(): Promise<Recipe[]> {
  try {
    const storedRecipes = await getAllRecipes();
    // REMOVED: const allRecipes = [...storedRecipes, ...sampleRecipes];
    return removeDuplicateRecipes(storedRecipes);
  } catch (error) {
    console.error('Error getting all recipes:', error);
    // REMOVED: return sampleRecipes;
    return [];
  }
}

export async function getRecipeById(id: string): Promise<Recipe | null> {
  // REMOVED: return sampleRecipes.find(recipe => recipe.id === id) || null;
  return null; // No sample recipes, so no ID lookup
}

// A new function to find any recipe by its ID, including AI-generated ones.
export async function findRecipeById(id: string): Promise<Recipe | null> {
  // For now, we just search the sample recipes. In a real app, this would also search the AI recipes.
  return getRecipeById(id);
} 
import axios from 'axios';
import { Recipe, IngredientItem } from '../types';

// API Keys - these should be stored in environment variables
const SPOONACULAR_API_KEY = 'your_spoonacular_api_key'; // Get from https://spoonacular.com/food-api
const EDAMAM_APP_ID = 'your_edamam_app_id'; // Get from https://developer.edamam.com/
const EDAMAM_APP_KEY = 'your_edamam_app_key';

interface SpoonacularRecipe {
  id: number;
  title: string;
  image: string;
  readyInMinutes: number;
  servings: number;
  nutrition: {
    nutrients: Array<{
      name: string;
      amount: number;
      unit: string;
    }>;
  };
  extendedIngredients: Array<{
    name: string;
    amount: number;
    unit: string;
  }>;
  instructions: string;
  cuisines: string[];
  dishTypes: string[];
  diets: string[];
}

interface EdamamRecipe {
  recipe: {
    uri: string;
    label: string;
    image: string;
    totalTime: number;
    yield: number;
    calories: number;
    totalNutrients: {
      PROCNT?: { quantity: number; unit: string };
      CHOCDF?: { quantity: number; unit: string };
      FAT?: { quantity: number; unit: string };
    };
    ingredients: Array<{
      text: string;
      quantity: number;
      measure: string;
      food: string;
    }>;
    digest: Array<{
      label: string;
      total: number;
      unit: string;
    }>;
  };
}

// Popular recipe websites for web scraping
const RECIPE_WEBSITES = [
  'https://www.allrecipes.com',
  'https://www.foodnetwork.com',
  'https://www.epicurious.com',
  'https://www.bonappetit.com',
  'https://www.seriouseats.com',
  'https://www.tasteofhome.com',
  'https://www.cookinglight.com',
  'https://www.eatingwell.com'
];

export class RecipeFetcher {
  private static instance: RecipeFetcher;
  private recipes: Recipe[] = [];
  private isFetching = false;

  static getInstance(): RecipeFetcher {
    if (!RecipeFetcher.instance) {
      RecipeFetcher.instance = new RecipeFetcher();
    }
    return RecipeFetcher.instance;
  }

  // Fetch recipes from Spoonacular API
  async fetchFromSpoonacular(query: string = '', cuisine: string = '', diet: string = '', maxResults: number = 100): Promise<Recipe[]> {
    try {
      const params = new URLSearchParams({
        apiKey: SPOONACULAR_API_KEY,
        number: maxResults.toString(),
        addRecipeInformation: 'true',
        fillIngredients: 'true',
        instructionsRequired: 'true',
        addRecipeNutrition: 'true'
      });

      if (query) params.append('query', query);
      if (cuisine) params.append('cuisine', cuisine);
      if (diet) params.append('diet', diet);

      const response = await axios.get(`https://api.spoonacular.com/recipes/complexSearch?${params}`);
      
      if (response.data.results) {
        return response.data.results.map((recipe: SpoonacularRecipe) => this.convertSpoonacularRecipe(recipe));
      }
      
      return [];
    } catch (error) {
      console.error('Error fetching from Spoonacular:', error);
      return [];
    }
  }

  // Fetch recipes from Edamam API
  async fetchFromEdamam(query: string = '', cuisine: string = '', diet: string = '', maxResults: number = 100): Promise<Recipe[]> {
    try {
      const params = new URLSearchParams({
        app_id: EDAMAM_APP_ID,
        app_key: EDAMAM_APP_KEY,
        q: query || 'recipe',
        from: '0',
        to: maxResults.toString(),
        health: diet || '',
        cuisineType: cuisine || ''
      });

      const response = await axios.get(`https://api.edamam.com/search?${params}`);
      
      if (response.data.hits) {
        return response.data.hits.map((hit: EdamamRecipe) => this.convertEdamamRecipe(hit));
      }
      
      return [];
    } catch (error) {
      console.error('Error fetching from Edamam:', error);
      return [];
    }
  }

  // Fetch popular recipes from multiple sources
  async fetchPopularRecipes(maxResults: number = 500): Promise<Recipe[]> {
    if (this.isFetching) {
      console.log('Already fetching recipes...');
      return this.recipes;
    }

    this.isFetching = true;
    const allRecipes: Recipe[] = [];

    try {
      console.log('Starting recipe fetch from multiple sources...');

      // Popular recipe categories to fetch
      const categories = [
        'chicken', 'pasta', 'salad', 'soup', 'dessert', 'breakfast',
        'vegetarian', 'vegan', 'quick', 'healthy', 'italian', 'mexican',
        'asian', 'mediterranean', 'american', 'french', 'indian', 'thai'
      ];

      // Fetch from Spoonacular
      for (const category of categories.slice(0, 10)) {
        console.log(`Fetching ${category} recipes from Spoonacular...`);
        const recipes = await this.fetchFromSpoonacular(category, '', '', Math.ceil(maxResults / 10));
        allRecipes.push(...recipes);
        
        // Add delay to avoid rate limiting
        await this.delay(1000);
      }

      // Fetch from Edamam
      for (const category of categories.slice(0, 10)) {
        console.log(`Fetching ${category} recipes from Edamam...`);
        const recipes = await this.fetchFromEdamam(category, '', '', Math.ceil(maxResults / 10));
        allRecipes.push(...recipes);
        
        // Add delay to avoid rate limiting
        await this.delay(1000);
      }

      // Remove duplicates based on title similarity
      const uniqueRecipes = this.removeDuplicateRecipes(allRecipes);
      
      // Limit to maxResults
      this.recipes = uniqueRecipes.slice(0, maxResults);
      
      console.log(`Successfully fetched ${this.recipes.length} unique recipes`);
      return this.recipes;

    } catch (error) {
      console.error('Error fetching popular recipes:', error);
      return [];
    } finally {
      this.isFetching = false;
    }
  }

  // Convert Spoonacular recipe to our format
  private convertSpoonacularRecipe(recipe: SpoonacularRecipe): Recipe {
    const calories = recipe.nutrition?.nutrients?.find(n => n.name === 'Calories')?.amount || 0;
    const protein = recipe.nutrition?.nutrients?.find(n => n.name === 'Protein')?.amount || 0;
    const carbs = recipe.nutrition?.nutrients?.find(n => n.name === 'Carbohydrates')?.amount || 0;
    const fat = recipe.nutrition?.nutrients?.find(n => n.name === 'Fat')?.amount || 0;

    const ingredients: IngredientItem[] = recipe.extendedIngredients.map(ing => ({
      name: ing.name,
      amount: ing.amount,
      unit: ing.unit,
      inPantry: false
    }));

    const instructions = recipe.instructions
      ? recipe.instructions.split('\n').filter(step => step.trim().length > 0)
      : [];

    const tags = [
      ...(recipe.cuisines || []),
      ...(recipe.dishTypes || []),
      ...(recipe.diets || [])
    ];

    return {
      id: `spoonacular_${recipe.id}`,
      title: recipe.title,
      image: recipe.image,
      readyInMinutes: recipe.readyInMinutes,
      servings: recipe.servings,
      calories: Math.round(calories),
      protein: Math.round(protein),
      carbs: Math.round(carbs),
      fat: Math.round(fat),
      ingredients,
      instructions,
      tags
    };
  }

  // Convert Edamam recipe to our format
  private convertEdamamRecipe(hit: EdamamRecipe): Recipe {
    const recipe = hit.recipe;
    
    const protein = recipe.totalNutrients?.PROCNT?.quantity || 0;
    const carbs = recipe.totalNutrients?.CHOCDF?.quantity || 0;
    const fat = recipe.totalNutrients?.FAT?.quantity || 0;

    const ingredients: IngredientItem[] = recipe.ingredients.map(ing => ({
      name: ing.food,
      amount: ing.quantity,
      unit: ing.measure,
      inPantry: false
    }));

    return {
      id: `edamam_${recipe.uri.split('_').pop()}`,
      title: recipe.label,
      image: recipe.image,
      readyInMinutes: recipe.totalTime || 30,
      servings: recipe.yield,
      calories: Math.round(recipe.calories / recipe.yield),
      protein: Math.round(protein),
      carbs: Math.round(carbs),
      fat: Math.round(fat),
      ingredients,
      instructions: [], // Edamam doesn't provide instructions in search results
      tags: []
    };
  }

  // Remove duplicate recipes based on title similarity
  private removeDuplicateRecipes(recipes: Recipe[]): Recipe[] {
    const seen = new Set<string>();
    const unique: Recipe[] = [];

    for (const recipe of recipes) {
      const normalizedTitle = recipe.title.toLowerCase()
        .replace(/[^\w\s]/g, '')
        .replace(/\s+/g, ' ')
        .trim();

      if (!seen.has(normalizedTitle)) {
        seen.add(normalizedTitle);
        unique.push(recipe);
      }
    }

    return unique;
  }

  // Helper function to add delays
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Get all fetched recipes
  getRecipes(): Recipe[] {
    return this.recipes;
  }

  // Search recipes by ingredients
  async searchByIngredients(ingredients: string[], maxResults: number = 50): Promise<Recipe[]> {
    try {
      const query = ingredients.join(', ');
      const spoonacularRecipes = await this.fetchFromSpoonacular(query, '', '', maxResults);
      const edamamRecipes = await this.fetchFromEdamam(query, '', '', maxResults);
      
      const allRecipes = [...spoonacularRecipes, ...edamamRecipes];
      return this.removeDuplicateRecipes(allRecipes).slice(0, maxResults);
    } catch (error) {
      console.error('Error searching by ingredients:', error);
      return [];
    }
  }

  // Get recipes by cuisine
  async getRecipesByCuisine(cuisine: string, maxResults: number = 50): Promise<Recipe[]> {
    try {
      const spoonacularRecipes = await this.fetchFromSpoonacular('', cuisine, '', maxResults);
      const edamamRecipes = await this.fetchFromEdamam('', cuisine, '', maxResults);
      
      const allRecipes = [...spoonacularRecipes, ...edamamRecipes];
      return this.removeDuplicateRecipes(allRecipes).slice(0, maxResults);
    } catch (error) {
      console.error('Error fetching recipes by cuisine:', error);
      return [];
    }
  }

  // Get recipes by diet
  async getRecipesByDiet(diet: string, maxResults: number = 50): Promise<Recipe[]> {
    try {
      const spoonacularRecipes = await this.fetchFromSpoonacular('', '', diet, maxResults);
      const edamamRecipes = await this.fetchFromEdamam('', '', diet, maxResults);
      
      const allRecipes = [...spoonacularRecipes, ...edamamRecipes];
      return this.removeDuplicateRecipes(allRecipes).slice(0, maxResults);
    } catch (error) {
      console.error('Error fetching recipes by diet:', error);
      return [];
    }
  }
}

// Export singleton instance
export const recipeFetcher = RecipeFetcher.getInstance(); 
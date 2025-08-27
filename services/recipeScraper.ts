import axios from 'axios';
import { Recipe, IngredientItem } from '../types';
import { saveRecipes } from './recipeStorage';

interface ScrapedRecipe {
  title: string;
  ingredients: string[];
  instructions: string[];
  image?: string;
  readyInMinutes?: number;
  servings?: number;
}

export class RecipeScraper {
  private static instance: RecipeScraper;
  private isScraping = false;

  static getInstance(): RecipeScraper {
    if (!RecipeScraper.instance) {
      RecipeScraper.instance = new RecipeScraper();
    }
    return RecipeScraper.instance;
  }

  async searchRecipesByIngredients(
    ingredients: string[],
    mode: 'strict' | 'partial' = 'partial',
    maxResults: number = 20
  ): Promise<Recipe[]> {
    if (this.isScraping) {
      throw new Error('Recipe search already in progress');
    }

    this.isScraping = true;
    const recipes: Recipe[] = [];

    try {
      console.log(`=== RECIPE SEARCH DEBUG ===`);
      console.log(`Searching for recipes with ingredients: ${ingredients.join(', ')}`);
      console.log(`Mode: ${mode}, Max Results: ${maxResults}`);
      
      // Process ingredients to extract simple ingredient names
      const processedIngredients = this.processIngredients(ingredients);
      console.log(`Processed ingredients: ${processedIngredients.join(', ')}`);
      
      // Use only Spoonacular API for now (Edamam has 401 errors)
      const searchPromises = [
        this.searchSpoonacularAPI(processedIngredients, mode, maxResults)
        // Temporarily disabled Edamam due to 401 errors
        // this.searchEdamamAPI(processedIngredients, mode, Math.ceil(maxResults / 2))
      ];

      console.log('Starting API searches...');
      const results = await Promise.allSettled(searchPromises);
      
      console.log('API search results:');
      results.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          console.log(`API ${index + 1} returned ${result.value.length} recipes`);
          recipes.push(...result.value);
        } else {
          console.log(`API ${index + 1} failed:`, result.reason);
        }
      });

      console.log(`Total recipes found from APIs: ${recipes.length}`);

      // Remove duplicates and limit results
      const uniqueRecipes = this.removeDuplicateRecipes(recipes);
      console.log(`After removing duplicates: ${uniqueRecipes.length} recipes`);
      
      const finalRecipes = uniqueRecipes.slice(0, maxResults);
      console.log(`Final recipes to return: ${finalRecipes.length}`);

      // Save to database
      if (finalRecipes.length > 0) {
        await saveRecipes(finalRecipes);
        console.log(`Saved ${finalRecipes.length} recipes to database`);
      } else {
        console.log('No recipes to save to database');
      }

      console.log(`=== END RECIPE SEARCH DEBUG ===`);
      return finalRecipes;

    } catch (error) {
      console.error('Error searching recipes:', error);
      console.error('Recipe search error details:', JSON.stringify(error, null, 2));
      // Return empty array instead of fallback recipes
      return [];
    } finally {
      this.isScraping = false;
    }
  }

  // Search using Spoonacular API (free tier available)
  private async searchSpoonacularAPI(ingredients: string[], mode: 'strict' | 'partial', maxResults: number): Promise<Recipe[]> {
    try {
      console.log('Searching Spoonacular API...');
      // TEMPORARY: Hardcoded API key for immediate testing
      const apiKey = process.env.EXPO_PUBLIC_SPOONACULAR_API_KEY || '13819165c0f845b8b62831855cbb2057';
      
      console.log('Spoonacular API Key:', apiKey ? 'Present' : 'Missing');
      console.log('Spoonacular API Key value:', apiKey);
      
      if (!apiKey || apiKey === 'your-spoonacular-api-key-here') {
        console.log('Spoonacular API: Using demo key, skipping API call');
        return [];
      }

      const query = ingredients.slice(0, 3).join(',');
      const url = `https://api.spoonacular.com/recipes/complexSearch?apiKey=${apiKey}&query=${encodeURIComponent(query)}&number=${maxResults}&addRecipeInformation=true&fillIngredients=true`;
      
      console.log('Spoonacular API URL:', url);
      console.log('Spoonacular API Query:', query);

      const response = await axios.get(url);
      
      console.log('Spoonacular API Response status:', response.status);
      console.log('Spoonacular API Response data:', JSON.stringify(response.data, null, 2));
      
      if (response.data && response.data.results) {
        const recipes: Recipe[] = response.data.results.map((recipe: any) => ({
          id: `spoonacular_${recipe.id}`,
          title: recipe.title,
          image: recipe.image,
          readyInMinutes: recipe.readyInMinutes || 30,
          servings: recipe.servings || 4,
          calories: recipe.nutrition?.nutrients?.find((n: any) => n.name === 'Calories')?.amount || 300,
          protein: recipe.nutrition?.nutrients?.find((n: any) => n.name === 'Protein')?.amount || 15,
          carbs: recipe.nutrition?.nutrients?.find((n: any) => n.name === 'Carbohydrates')?.amount || 25,
          fat: recipe.nutrition?.nutrients?.find((n: any) => n.name === 'Fat')?.amount || 10,
          ingredients: recipe.extendedIngredients?.map((ing: any) => ({
            name: ing.name,
            amount: ing.amount,
            unit: ing.unit,
            inPantry: ingredients.some(ingredient => 
              ing.name.toLowerCase().includes(ingredient.toLowerCase())
            )
          })) || [],
          instructions: recipe.analyzedInstructions?.[0]?.steps?.map((step: any) => step.step) || [
            'Follow the recipe instructions from Spoonacular',
            'Enjoy your meal!'
          ],
          tags: ['spoonacular', 'api', 'online'],
          matchScore: this.calculateMatchScore(recipe, ingredients)
        }));

        console.log(`Found ${recipes.length} recipes from Spoonacular API`);
        return recipes;
      }

      return [];
    } catch (error) {
      console.error('Error searching Spoonacular API:', error);
      console.error('Spoonacular API Error details:', JSON.stringify(error, null, 2));
      return [];
    }
  }

  // Search using Edamam API (free tier available)
  private async searchEdamamAPI(ingredients: string[], mode: 'strict' | 'partial', maxResults: number): Promise<Recipe[]> {
    try {
      console.log('Searching Edamam API...');
      const appId = process.env.EXPO_PUBLIC_EDAMAM_APP_ID;
      const appKey = process.env.EXPO_PUBLIC_EDAMAM_APP_KEY;
      
      console.log('Edamam App ID:', appId ? 'Present' : 'Missing');
      console.log('Edamam App Key:', appKey ? 'Present' : 'Missing');
      console.log('Edamam App ID value:', appId);
      console.log('Edamam App Key value:', appKey);
      
      if (!appId || !appKey || appId === 'your-edamam-app-id' || appKey === 'your-edamam-app-key') {
        console.log('Edamam API: Using demo keys, skipping API call');
        return [];
      }

      const query = ingredients.slice(0, 3).join(' ');
      const url = `https://api.edamam.com/api/recipes/v2?type=public&q=${encodeURIComponent(query)}&app_id=${appId}&app_key=${appKey}&from=0&to=${maxResults}`;

      console.log('Edamam API URL:', url);
      console.log('Edamam API Query:', query);

      const response = await axios.get(url);
      
      console.log('Edamam API Response status:', response.status);
      console.log('Edamam API Response data:', JSON.stringify(response.data, null, 2));
      
      if (response.data && response.data.hits) {
        const recipes: Recipe[] = response.data.hits.map((hit: any) => {
          const recipe = hit.recipe;
          return {
            id: `edamam_${recipe.uri.split('#recipe_')[1]}`,
            title: recipe.label,
            image: recipe.image,
            readyInMinutes: recipe.totalTime || 30,
            servings: recipe.yield || 4,
            calories: recipe.calories || 300,
            protein: recipe.totalNutrients?.PROCNT?.quantity || 15,
            carbs: recipe.totalNutrients?.CHOCDF?.quantity || 25,
            fat: recipe.totalNutrients?.FAT?.quantity || 10,
            ingredients: recipe.ingredients?.map((ing: any) => ({
              name: ing.food,
              amount: ing.quantity,
              unit: ing.measure,
              inPantry: ingredients.some(ingredient => 
                ing.food.toLowerCase().includes(ingredient.toLowerCase())
              )
            })) || [],
            instructions: recipe.ingredientLines || [
              'Follow the recipe instructions from Edamam',
              'Enjoy your meal!'
            ],
            tags: ['edamam', 'api', 'online'],
            matchScore: this.calculateMatchScore(recipe, ingredients)
          };
        });

        console.log(`Found ${recipes.length} recipes from Edamam API`);
        return recipes;
      }

      return [];
    } catch (error) {
      console.error('Error searching Edamam API:', error);
      console.error('Edamam API Error details:', JSON.stringify(error, null, 2));
      return [];
    }
  }

  private calculateMatchScore(recipe: any, ingredients: string[]): number {
    const recipeIngredients = recipe.ingredients || recipe.extendedIngredients || [];
    const recipeIngredientNames = recipeIngredients.map((ing: any) => 
      (ing.name || ing.food || '').toLowerCase()
    );
    
    const matchingIngredients = ingredients.filter(ingredient =>
      recipeIngredientNames.some((recipeIngredient: string) =>
        recipeIngredient.includes(ingredient.toLowerCase()) ||
        ingredient.toLowerCase().includes(recipeIngredient)
      )
    );
    
    return Math.round((matchingIngredients.length / ingredients.length) * 100);
  }

  // Search Food Network website
  private async searchFoodNetwork(ingredients: string[], mode: 'strict' | 'partial', maxResults: number): Promise<Recipe[]> {
    try {
      const query = ingredients.slice(0, 2).join(' ');
      const searchUrl = `https://www.foodnetwork.com/search/${encodeURIComponent(query)}`;
      
      const response = await axios.get(searchUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
          'Accept-Encoding': 'gzip, deflate, br',
          'Connection': 'keep-alive',
          'Upgrade-Insecure-Requests': '1',
        },
        timeout: 10000
      });

      if (response.status !== 200) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const recipes: Recipe[] = [];
      const html = response.data;
      
      // Extract recipe links from search results
      const recipeLinks = this.extractFoodNetworkLinks(html);
      
      for (const link of recipeLinks.slice(0, Math.min(3, maxResults))) {
        try {
          const recipe = await this.scrapeFoodNetworkRecipe(link);
          if (recipe && this.matchesIngredients(recipe, ingredients, mode)) {
            recipes.push(recipe);
          }
          await this.delay(2000); // Rate limiting
        } catch (error) {
          console.error(`Error scraping recipe from ${link}:`, error);
        }
      }

      return recipes;
    } catch (error) {
      console.error('Error searching Food Network:', error);
      return [];
    }
  }

  private extractRecipeLinks(html: string): string[] {
    const links: string[] = [];
    const regex = /href="(\/recipe\/[^"]+)"/g;
    let match;
    
    while ((match = regex.exec(html)) !== null) {
      const link = `https://www.allrecipes.com${match[1]}`;
      if (!links.includes(link)) {
        links.push(link);
      }
    }
    
    return links;
  }

  private extractFoodNetworkLinks(html: string): string[] {
    const links: string[] = [];
    const regex = /href="(\/recipes\/[^"]+)"/g;
    let match;
    
    while ((match = regex.exec(html)) !== null) {
      const link = `https://www.foodnetwork.com${match[1]}`;
      if (!links.includes(link)) {
        links.push(link);
      }
    }
    
    return links;
  }

  private async scrapeAllRecipesRecipe(url: string): Promise<Recipe | null> {
    try {
      const response = await axios.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
      });

      const html = response.data;
      
      // Extract title
      const titleMatch = html.match(/<h1[^>]*>([^<]+)<\/h1>/);
      const title = titleMatch ? titleMatch[1].trim() : 'Unknown Recipe';
      
      // Extract ingredients
      const ingredients: IngredientItem[] = [];
      const ingredientRegex = /<span[^>]*class="[^"]*ingredients-item-name[^"]*"[^>]*>([^<]+)<\/span>/g;
      let ingredientMatch;
      
      while ((ingredientMatch = ingredientRegex.exec(html)) !== null) {
        const ingredientText = ingredientMatch[1].trim();
        const parsed = this.parseIngredient(ingredientText);
        ingredients.push({
          name: parsed.name,
          amount: parsed.amount,
          unit: parsed.unit,
          inPantry: false
        });
      }
      
      // Extract instructions
      const instructions: string[] = [];
      const instructionRegex = /<div[^>]*class="[^"]*paragraph[^"]*"[^>]*>([^<]+)<\/div>/g;
      let instructionMatch;
      
      while ((instructionMatch = instructionRegex.exec(html)) !== null) {
        const instruction = instructionMatch[1].trim();
        if (instruction.length > 10) {
          instructions.push(instruction);
        }
      }
      
      // Extract image
      const imageMatch = html.match(/<img[^>]*class="[^"]*lead-media[^"]*"[^>]*src="([^"]+)"/);
      const image = imageMatch ? imageMatch[1] : '';
      
      // Extract nutrition info
      const nutrition = this.extractNutritionFromHTML(html);
      
      if (ingredients.length === 0 || instructions.length === 0) {
        return null;
      }

      return {
        id: `scraped_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        title,
        image,
        readyInMinutes: 30, // Default
        servings: 4, // Default
        calories: nutrition.calories || 0,
        protein: nutrition.protein || 0,
        carbs: nutrition.carbs || 0,
        fat: nutrition.fat || 0,
        ingredients,
        instructions,
        tags: ['scraped', 'online']
      };
    } catch (error) {
      console.error(`Error scraping recipe from ${url}:`, error);
      return null;
    }
  }

  private async scrapeFoodNetworkRecipe(url: string): Promise<Recipe | null> {
    try {
      const response = await axios.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
      });

      const html = response.data;
      
      // Extract title
      const titleMatch = html.match(/<h1[^>]*>([^<]+)<\/h1>/);
      const title = titleMatch ? titleMatch[1].trim() : 'Unknown Recipe';
      
      // Extract ingredients
      const ingredients: IngredientItem[] = [];
      const ingredientRegex = /<li[^>]*class="[^"]*ingredient[^"]*"[^>]*>([^<]+)<\/li>/g;
      let ingredientMatch;
      
      while ((ingredientMatch = ingredientRegex.exec(html)) !== null) {
        const ingredientText = ingredientMatch[1].trim();
        const parsed = this.parseIngredient(ingredientText);
        ingredients.push({
          name: parsed.name,
          amount: parsed.amount,
          unit: parsed.unit,
          inPantry: false
        });
      }
      
      // Extract instructions
      const instructions: string[] = [];
      const instructionRegex = /<li[^>]*class="[^"]*direction[^"]*"[^>]*>([^<]+)<\/li>/g;
      let instructionMatch;
      
      while ((instructionMatch = instructionRegex.exec(html)) !== null) {
        const instruction = instructionMatch[1].trim();
        if (instruction.length > 10) {
          instructions.push(instruction);
        }
      }
      
      if (ingredients.length === 0 || instructions.length === 0) {
        return null;
      }

      return {
        id: `scraped_fn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        title,
        image: '',
        readyInMinutes: 30,
        servings: 4,
        calories: 0,
        protein: 0,
        carbs: 0,
        fat: 0,
        ingredients,
        instructions,
        tags: ['scraped', 'food-network']
      };
    } catch (error) {
      console.error(`Error scraping Food Network recipe from ${url}:`, error);
      return null;
    }
  }

  private parseIngredient(ingredientText: string): { name: string; amount: number; unit: string } {
    // Simple ingredient parsing - can be enhanced
    const parts = ingredientText.split(' ');
    let amount = 1;
    let unit = '';
    let name = ingredientText;

    if (parts.length > 1) {
      const firstPart = parts[0];
      const secondPart = parts[1];
      
      // Try to parse amount
      const amountMatch = firstPart.match(/^(\d+(?:\.\d+)?)/);
      if (amountMatch) {
        amount = parseFloat(amountMatch[1]);
        
        // Try to parse unit
        if (secondPart && /^(cup|tablespoon|teaspoon|ounce|pound|gram|ml|g|tbsp|tsp|oz|lb)$/i.test(secondPart)) {
          unit = secondPart.toLowerCase();
          name = parts.slice(2).join(' ');
        } else {
          name = parts.slice(1).join(' ');
        }
      }
    }

    return { name: name.trim(), amount, unit };
  }

  private extractNutritionFromHTML(html: string): { calories: number; protein: number; carbs: number; fat: number } {
    // Extract nutrition information from HTML
    const nutrition = { calories: 0, protein: 0, carbs: 0, fat: 0 };
    
    // Look for nutrition data in various formats
    const calorieMatch = html.match(/(\d+)\s*calories?/i);
    if (calorieMatch) {
      nutrition.calories = parseInt(calorieMatch[1]);
    }
    
    const proteinMatch = html.match(/(\d+(?:\.\d+)?)\s*g\s*protein/i);
    if (proteinMatch) {
      nutrition.protein = parseFloat(proteinMatch[1]);
    }
    
    const carbMatch = html.match(/(\d+(?:\.\d+)?)\s*g\s*carbohydrates?/i);
    if (carbMatch) {
      nutrition.carbs = parseFloat(carbMatch[1]);
    }
    
    const fatMatch = html.match(/(\d+(?:\.\d+)?)\s*g\s*fat/i);
    if (fatMatch) {
      nutrition.fat = parseFloat(fatMatch[1]);
    }
    
    return nutrition;
  }

  // Helper method to check if a recipe matches ingredients
  private matchesIngredients(recipe: any, availableIngredients: string[], mode: 'strict' | 'partial'): boolean {
    const recipeIngredients = this.extractIngredientsFromRecipe(recipe);
    const available = availableIngredients.map(ing => ing.toLowerCase());
    
    if (mode === 'strict') {
      // At least 70% of recipe ingredients must be available
      const matchingIngredients = available.filter(ing => 
        recipeIngredients.some(recipeIng => 
          recipeIng.includes(ing) || ing.includes(recipeIng)
        )
      );
      return matchingIngredients.length >= Math.floor(recipeIngredients.length * 0.7);
    } else {
      // At least some ingredients must be available
      const matchingIngredients = available.filter(ing => 
        recipeIngredients.some(recipeIng => 
          recipeIng.includes(ing) || ing.includes(recipeIng)
        )
      );
      return matchingIngredients.length >= Math.max(1, Math.floor(available.length * 0.3));
    }
  }

  // Extract ingredients from different recipe formats
  private extractIngredientsFromRecipe(recipe: any): string[] {
    if (recipe.extendedIngredients) {
      return recipe.extendedIngredients.map((ing: any) => ing.name.toLowerCase());
    } else if (recipe.ingredients) {
      return recipe.ingredients.map((ing: any) => 
        typeof ing === 'string' ? ing.toLowerCase() : ing.food?.toLowerCase() || ing.name?.toLowerCase()
      );
    } else if (recipe.ingredientLines) {
      return recipe.ingredientLines.map((ing: string) => ing.toLowerCase());
    }
    return [];
  }

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

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Generate recipes based on ingredients when scraping fails
  private generateRecipesFromIngredients(ingredients: string[], mode: 'strict' | 'partial', maxResults: number): Recipe[] {
    // REMOVED: No longer generating fallback recipes
    return [];
  }

  // Generate fallback recipes when scraper is disabled
  private generateFallbackRecipes(ingredients: string[], mode: 'strict' | 'partial', maxResults: number): Recipe[] {
    // REMOVED: No longer generating fallback recipes
    return [];
  }

  // Process ingredients to extract simple ingredient names
  private processIngredients(ingredients: string[]): string[] {
    const processed: string[] = [];
    
    for (const ingredient of ingredients) {
      // Extract the main ingredient name (first word or common ingredient)
      const words = ingredient.toLowerCase().split(' ');
      
      // Look for common ingredients
      const commonIngredients = [
        'chicken', 'beef', 'pork', 'fish', 'salmon', 'tuna', 'shrimp',
        'rice', 'pasta', 'bread', 'potato', 'tomato', 'onion', 'garlic',
        'carrot', 'broccoli', 'spinach', 'lettuce', 'cucumber', 'pepper',
        'mushroom', 'egg', 'milk', 'cheese', 'yogurt', 'butter', 'oil',
        'flour', 'sugar', 'salt', 'pepper', 'lemon', 'lime', 'apple',
        'banana', 'orange', 'strawberry', 'blueberry', 'raspberry',
        'chocolate', 'vanilla', 'cinnamon', 'nutmeg', 'oregano', 'basil'
      ];
      
      // Check if any word matches a common ingredient
      for (const word of words) {
        if (commonIngredients.includes(word)) {
          processed.push(word);
          break;
        }
      }
      
      // If no common ingredient found, use the first word (if it's not a brand name)
      if (processed.length === 0 || processed[processed.length - 1] !== words[0]) {
        const firstWord = words[0];
        // Skip brand names and common non-ingredient words
        const skipWords = ['hi', 'chew', 'morinaga', 'drizzilicious', 'swirl', 'bites'];
        if (!skipWords.includes(firstWord) && firstWord.length > 2) {
          processed.push(firstWord);
        }
      }
    }
    
    // Remove duplicates and limit to top 3
    const unique = [...new Set(processed)];
    return unique.slice(0, 3);
  }
}

// Export singleton instance
export const recipeScraper = RecipeScraper.getInstance(); 
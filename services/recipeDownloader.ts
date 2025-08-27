import { recipeFetcher } from './recipeFetcher';
import { saveRecipes, getRecipeCount, clearAllRecipes } from './recipeStorage';
import { Recipe } from '../types';

export interface DownloadProgress {
  total: number;
  current: number;
  source: string;
  status: 'downloading' | 'processing' | 'saving' | 'complete' | 'error';
  message: string;
}

export interface DownloadOptions {
  maxRecipes?: number;
  categories?: string[];
  cuisines?: string[];
  diets?: string[];
  clearExisting?: boolean;
  onProgress?: (progress: DownloadProgress) => void;
}

export class RecipeDownloader {
  private static instance: RecipeDownloader;
  private isDownloading = false;

  static getInstance(): RecipeDownloader {
    if (!RecipeDownloader.instance) {
      RecipeDownloader.instance = new RecipeDownloader();
    }
    return RecipeDownloader.instance;
  }

  async downloadRecipes(options: DownloadOptions = {}): Promise<Recipe[]> {
    if (this.isDownloading) {
      throw new Error('Download already in progress');
    }

    this.isDownloading = true;
    const {
      maxRecipes = 1000,
      categories = [],
      cuisines = [],
      diets = [],
      clearExisting = false,
      onProgress
    } = options;

    try {
      // Report initial progress
      this.reportProgress(onProgress, {
        total: maxRecipes,
        current: 0,
        source: 'initializing',
        status: 'downloading',
        message: 'Initializing recipe download...'
      });

      // Clear existing recipes if requested
      if (clearExisting) {
        this.reportProgress(onProgress, {
          total: maxRecipes,
          current: 0,
          source: 'database',
          status: 'processing',
          message: 'Clearing existing recipes...'
        });
        await clearAllRecipes();
      }

      const allRecipes: Recipe[] = [];
      let currentCount = 0;

      // Download from Spoonacular API
      if (this.hasValidApiKeys()) {
        try {
          this.reportProgress(onProgress, {
            total: maxRecipes,
            current: currentCount,
            source: 'Spoonacular',
            status: 'downloading',
            message: 'Fetching recipes from Spoonacular...'
          });

          const spoonacularRecipes = await this.downloadFromSpoonacular(
            maxRecipes / 2,
            categories,
            cuisines,
            diets,
            onProgress
          );
          allRecipes.push(...spoonacularRecipes);
          currentCount += spoonacularRecipes.length;

          this.reportProgress(onProgress, {
            total: maxRecipes,
            current: currentCount,
            source: 'Spoonacular',
            status: 'complete',
            message: `Downloaded ${spoonacularRecipes.length} recipes from Spoonacular`
          });
        } catch (error) {
          console.error('Error downloading from Spoonacular:', error);
          this.reportProgress(onProgress, {
            total: maxRecipes,
            current: currentCount,
            source: 'Spoonacular',
            status: 'error',
            message: 'Failed to download from Spoonacular'
          });
        }
      }

      // Download from Edamam API
      if (this.hasValidEdamamKeys()) {
        try {
          this.reportProgress(onProgress, {
            total: maxRecipes,
            current: currentCount,
            source: 'Edamam',
            status: 'downloading',
            message: 'Fetching recipes from Edamam...'
          });

          const edamamRecipes = await this.downloadFromEdamam(
            maxRecipes / 2,
            categories,
            cuisines,
            diets,
            onProgress
          );
          allRecipes.push(...edamamRecipes);
          currentCount += edamamRecipes.length;

          this.reportProgress(onProgress, {
            total: maxRecipes,
            current: currentCount,
            source: 'Edamam',
            status: 'complete',
            message: `Downloaded ${edamamRecipes.length} recipes from Edamam`
          });
        } catch (error) {
          console.error('Error downloading from Edamam:', error);
          this.reportProgress(onProgress, {
            total: maxRecipes,
            current: currentCount,
            source: 'Edamam',
            status: 'error',
            message: 'Failed to download from Edamam'
          });
        }
      }

      // Download sample recipes if no API keys are available
      if (allRecipes.length === 0) {
        this.reportProgress(onProgress, {
          total: maxRecipes,
          current: currentCount,
          source: 'Sample',
          status: 'downloading',
          message: 'Downloading sample recipes...'
        });

        const sampleRecipes = await this.downloadSampleRecipes(maxRecipes);
        allRecipes.push(...sampleRecipes);
        currentCount += sampleRecipes.length;

        this.reportProgress(onProgress, {
          total: maxRecipes,
          current: currentCount,
          source: 'Sample',
          status: 'complete',
          message: `Downloaded ${sampleRecipes.length} sample recipes`
        });
      }

      // Remove duplicates
      this.reportProgress(onProgress, {
        total: maxRecipes,
        current: currentCount,
        source: 'processing',
        status: 'processing',
        message: 'Removing duplicate recipes...'
      });

      const uniqueRecipes = this.removeDuplicates(allRecipes);
      const finalRecipes = uniqueRecipes.slice(0, maxRecipes);

      // Save to database
      this.reportProgress(onProgress, {
        total: maxRecipes,
        current: finalRecipes.length,
        source: 'database',
        status: 'saving',
        message: 'Saving recipes to database...'
      });

      await saveRecipes(finalRecipes);

      this.reportProgress(onProgress, {
        total: maxRecipes,
        current: finalRecipes.length,
        source: 'complete',
        status: 'complete',
        message: `Successfully downloaded and saved ${finalRecipes.length} recipes`
      });

      return finalRecipes;

    } catch (error) {
      console.error('Error downloading recipes:', error);
      this.reportProgress(onProgress, {
        total: maxRecipes,
        current: 0,
        source: 'error',
        status: 'error',
        message: `Download failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
      throw error;
    } finally {
      this.isDownloading = false;
    }
  }

  public async downloadFromSpoonacular(
    maxRecipes: number,
    categories: string[],
    cuisines: string[],
    diets: string[],
    onProgress?: (progress: DownloadProgress) => void
  ): Promise<Recipe[]> {
    const recipes: Recipe[] = [];
    const recipesPerCategory = Math.ceil(maxRecipes / Math.max(categories.length || 1, 1));

    const searchTerms = categories.length > 0 ? categories : [
      'chicken', 'pasta', 'salad', 'soup', 'dessert', 'breakfast',
      'vegetarian', 'vegan', 'quick', 'healthy', 'italian', 'mexican'
    ];

    for (const term of searchTerms) {
      if (recipes.length >= maxRecipes) break;

      try {
        const categoryRecipes = await recipeFetcher.fetchFromSpoonacular(
          term,
          cuisines[0] || '',
          diets[0] || '',
          recipesPerCategory
        );
        recipes.push(...categoryRecipes);

        // Add delay to avoid rate limiting
        await this.delay(1000);
      } catch (error) {
        console.error(`Error fetching ${term} recipes from Spoonacular:`, error);
      }
    }

    return recipes;
  }

  public async downloadFromEdamam(
    maxRecipes: number,
    categories: string[],
    cuisines: string[],
    diets: string[],
    onProgress?: (progress: DownloadProgress) => void
  ): Promise<Recipe[]> {
    const recipes: Recipe[] = [];
    const recipesPerCategory = Math.ceil(maxRecipes / Math.max(categories.length || 1, 1));

    const searchTerms = categories.length > 0 ? categories : [
      'chicken', 'pasta', 'salad', 'soup', 'dessert', 'breakfast',
      'vegetarian', 'vegan', 'quick', 'healthy', 'italian', 'mexican'
    ];

    for (const term of searchTerms) {
      if (recipes.length >= maxRecipes) break;

      try {
        const categoryRecipes = await recipeFetcher.fetchFromEdamam(
          term,
          cuisines[0] || '',
          diets[0] || '',
          recipesPerCategory
        );
        recipes.push(...categoryRecipes);

        // Add delay to avoid rate limiting
        await this.delay(1000);
      } catch (error) {
        console.error(`Error fetching ${term} recipes from Edamam:`, error);
      }
    }

    return recipes;
  }

  public async downloadSampleRecipes(maxRecipes: number): Promise<Recipe[]> {
    // Comprehensive sample recipe database
    const sampleRecipes: Recipe[] = [
      {
        id: 'sample_1',
        title: 'Classic Chicken Stir Fry',
        image: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=400',
        readyInMinutes: 25,
        servings: 4,
        calories: 350,
        protein: 28,
        carbs: 15,
        fat: 12,
        ingredients: [
          { name: 'chicken breast', amount: 500, unit: 'g', inPantry: false },
          { name: 'broccoli', amount: 200, unit: 'g', inPantry: false },
          { name: 'carrots', amount: 100, unit: 'g', inPantry: false },
          { name: 'soy sauce', amount: 60, unit: 'ml', inPantry: false },
          { name: 'garlic', amount: 3, unit: 'cloves', inPantry: false },
          { name: 'ginger', amount: 1, unit: 'tbsp', inPantry: false }
        ],
        instructions: [
          'Cut chicken into bite-sized pieces',
          'Chop vegetables into similar-sized pieces',
          'Heat oil in a large wok or pan over high heat',
          'Stir fry chicken until cooked through, about 5-7 minutes',
          'Add vegetables and stir fry for 3-4 minutes',
          'Add soy sauce, garlic, and ginger',
          'Cook for 1-2 minutes more and serve hot'
        ],
        tags: ['dinner', 'healthy', 'quick', 'asian', 'chicken']
      },
      {
        id: 'sample_2',
        title: 'Creamy Pasta Carbonara',
        image: 'https://images.unsplash.com/photo-1621996346565-e3dbc353d2e5?w=400',
        readyInMinutes: 20,
        servings: 2,
        calories: 650,
        protein: 25,
        carbs: 75,
        fat: 30,
        ingredients: [
          { name: 'spaghetti', amount: 200, unit: 'g', inPantry: false },
          { name: 'eggs', amount: 2, unit: 'large', inPantry: false },
          { name: 'parmesan cheese', amount: 50, unit: 'g', inPantry: false },
          { name: 'bacon', amount: 100, unit: 'g', inPantry: false },
          { name: 'black pepper', amount: 1, unit: 'tsp', inPantry: false },
          { name: 'salt', amount: 1, unit: 'tsp', inPantry: false }
        ],
        instructions: [
          'Cook pasta according to package instructions',
          'Meanwhile, cook bacon until crispy',
          'Beat eggs with grated parmesan and black pepper',
          'Drain pasta, reserving 1 cup of pasta water',
          'Add hot pasta to egg mixture, stirring quickly',
          'Add bacon and enough pasta water to create a creamy sauce',
          'Serve immediately with extra parmesan'
        ],
        tags: ['dinner', 'italian', 'pasta', 'quick']
      },
      {
        id: 'sample_3',
        title: 'Greek Salad',
        image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400',
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
          { name: 'feta cheese', amount: 100, unit: 'g', inPantry: false },
          { name: 'kalamata olives', amount: 50, unit: 'g', inPantry: false },
          { name: 'olive oil', amount: 60, unit: 'ml', inPantry: false },
          { name: 'lemon juice', amount: 30, unit: 'ml', inPantry: false },
          { name: 'oregano', amount: 1, unit: 'tsp', inPantry: false }
        ],
        instructions: [
          'Chop cucumber, tomatoes, and red onion into chunks',
          'Combine vegetables in a large bowl',
          'Add crumbled feta cheese and olives',
          'Whisk together olive oil, lemon juice, and oregano',
          'Pour dressing over salad and toss gently',
          'Let sit for 10 minutes before serving'
        ],
        tags: ['salad', 'vegetarian', 'healthy', 'mediterranean', 'quick']
      },
      {
        id: 'sample_4',
        title: 'Chocolate Chip Cookies',
        image: 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=400',
        readyInMinutes: 45,
        servings: 24,
        calories: 180,
        protein: 2,
        carbs: 25,
        fat: 8,
        ingredients: [
          { name: 'flour', amount: 300, unit: 'g', inPantry: false },
          { name: 'butter', amount: 200, unit: 'g', inPantry: false },
          { name: 'brown sugar', amount: 150, unit: 'g', inPantry: false },
          { name: 'white sugar', amount: 100, unit: 'g', inPantry: false },
          { name: 'eggs', amount: 2, unit: 'large', inPantry: false },
          { name: 'vanilla extract', amount: 2, unit: 'tsp', inPantry: false },
          { name: 'baking soda', amount: 1, unit: 'tsp', inPantry: false },
          { name: 'chocolate chips', amount: 200, unit: 'g', inPantry: false }
        ],
        instructions: [
          'Preheat oven to 375°F (190°C)',
          'Cream together butter and both sugars',
          'Beat in eggs and vanilla extract',
          'Mix in flour and baking soda until just combined',
          'Fold in chocolate chips',
          'Drop spoonfuls onto baking sheet',
          'Bake for 9-11 minutes until golden brown',
          'Cool on baking sheet for 5 minutes before transferring'
        ],
        tags: ['dessert', 'baking', 'sweet', 'chocolate']
      },
      {
        id: 'sample_5',
        title: 'Vegetarian Buddha Bowl',
        image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400',
        readyInMinutes: 35,
        servings: 2,
        calories: 420,
        protein: 15,
        carbs: 65,
        fat: 12,
        ingredients: [
          { name: 'quinoa', amount: 100, unit: 'g', inPantry: false },
          { name: 'sweet potato', amount: 200, unit: 'g', inPantry: false },
          { name: 'chickpeas', amount: 200, unit: 'g', inPantry: false },
          { name: 'kale', amount: 100, unit: 'g', inPantry: false },
          { name: 'avocado', amount: 1, unit: 'medium', inPantry: false },
          { name: 'tahini', amount: 30, unit: 'ml', inPantry: false },
          { name: 'lemon juice', amount: 15, unit: 'ml', inPantry: false },
          { name: 'olive oil', amount: 30, unit: 'ml', inPantry: false }
        ],
        instructions: [
          'Cook quinoa according to package instructions',
          'Roast sweet potato and chickpeas with olive oil at 400°F for 25 minutes',
          'Massage kale with olive oil and lemon juice',
          'Make tahini dressing by mixing tahini, lemon juice, and water',
          'Assemble bowls with quinoa, roasted vegetables, kale, and avocado',
          'Drizzle with tahini dressing and serve'
        ],
        tags: ['vegetarian', 'vegan', 'healthy', 'bowl', 'mediterranean']
      },
      // NEW BREAKFAST RECIPES
      {
        id: 'sample_6',
        title: 'Fluffy Pancakes',
        image: 'https://images.unsplash.com/photo-1506084868230-bb9d95c24759?w=400',
        readyInMinutes: 20,
        servings: 4,
        calories: 320,
        protein: 8,
        carbs: 45,
        fat: 12,
        ingredients: [
          { name: 'flour', amount: 200, unit: 'g', inPantry: false },
          { name: 'milk', amount: 300, unit: 'ml', inPantry: false },
          { name: 'eggs', amount: 2, unit: 'large', inPantry: false },
          { name: 'baking powder', amount: 2, unit: 'tsp', inPantry: false },
          { name: 'sugar', amount: 30, unit: 'g', inPantry: false },
          { name: 'butter', amount: 50, unit: 'g', inPantry: false },
          { name: 'vanilla extract', amount: 1, unit: 'tsp', inPantry: false },
          { name: 'salt', amount: 0.5, unit: 'tsp', inPantry: false }
        ],
        instructions: [
          'Mix dry ingredients in a large bowl',
          'Whisk together milk, eggs, melted butter, and vanilla',
          'Pour wet ingredients into dry ingredients and mix until just combined',
          'Heat griddle or pan over medium heat',
          'Pour 1/4 cup batter for each pancake',
          'Cook until bubbles form on surface, then flip',
          'Cook 1-2 minutes more until golden brown',
          'Serve hot with syrup and butter'
        ],
        tags: ['breakfast', 'sweet', 'classic', 'family']
      },
      {
        id: 'sample_7',
        title: 'Avocado Toast with Poached Egg',
        image: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=400',
        readyInMinutes: 15,
        servings: 2,
        calories: 380,
        protein: 16,
        carbs: 30,
        fat: 22,
        ingredients: [
          { name: 'sourdough bread', amount: 2, unit: 'slices', inPantry: false },
          { name: 'avocado', amount: 1, unit: 'large', inPantry: false },
          { name: 'eggs', amount: 2, unit: 'large', inPantry: false },
          { name: 'lemon juice', amount: 1, unit: 'tbsp', inPantry: false },
          { name: 'red pepper flakes', amount: 0.5, unit: 'tsp', inPantry: false },
          { name: 'salt', amount: 0.5, unit: 'tsp', inPantry: false },
          { name: 'black pepper', amount: 0.25, unit: 'tsp', inPantry: false }
        ],
        instructions: [
          'Toast bread slices until golden brown',
          'Bring water to boil, add vinegar, create whirlpool',
          'Crack eggs into cups and gently lower into water',
          'Poach for 3-4 minutes until whites are set',
          'Mash avocado with lemon juice, salt, and pepper',
          'Spread avocado mixture on toast',
          'Top with poached egg and red pepper flakes'
        ],
        tags: ['breakfast', 'healthy', 'quick', 'trendy', 'vegetarian']
      },
      // NEW MEXICAN CUISINE
      {
        id: 'sample_8',
        title: 'Chicken Tacos with Cilantro Lime Rice',
        image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400',
        readyInMinutes: 30,
        servings: 4,
        calories: 420,
        protein: 32,
        carbs: 45,
        fat: 14,
        ingredients: [
          { name: 'chicken thighs', amount: 600, unit: 'g', inPantry: false },
          { name: 'corn tortillas', amount: 8, unit: 'pieces', inPantry: false },
          { name: 'rice', amount: 200, unit: 'g', inPantry: false },
          { name: 'lime', amount: 2, unit: 'medium', inPantry: false },
          { name: 'cilantro', amount: 50, unit: 'g', inPantry: false },
          { name: 'cumin', amount: 1, unit: 'tsp', inPantry: false },
          { name: 'chili powder', amount: 1, unit: 'tsp', inPantry: false },
          { name: 'onion', amount: 1, unit: 'medium', inPantry: false },
          { name: 'avocado', amount: 1, unit: 'large', inPantry: false }
        ],
        instructions: [
          'Season chicken with cumin, chili powder, salt, and pepper',
          'Cook rice according to package instructions',
          'Cook chicken in skillet until internal temperature reaches 165°F',
          'Let chicken rest 5 minutes, then shred',
          'Mix rice with lime juice and chopped cilantro',
          'Warm tortillas in dry pan or microwave',
          'Fill tortillas with chicken, rice, diced onion, and avocado',
          'Serve with lime wedges and extra cilantro'
        ],
        tags: ['mexican', 'dinner', 'chicken', 'rice', 'fresh']
      },
      {
        id: 'sample_9',
        title: 'Black Bean Quesadillas',
        image: 'https://images.unsplash.com/photo-1599974579688-8dbdd335c77f?w=400',
        readyInMinutes: 15,
        servings: 2,
        calories: 520,
        protein: 22,
        carbs: 58,
        fat: 22,
        ingredients: [
          { name: 'flour tortillas', amount: 4, unit: 'large', inPantry: false },
          { name: 'black beans', amount: 400, unit: 'g', inPantry: false },
          { name: 'cheddar cheese', amount: 150, unit: 'g', inPantry: false },
          { name: 'bell pepper', amount: 1, unit: 'medium', inPantry: false },
          { name: 'red onion', amount: 0.5, unit: 'medium', inPantry: false },
          { name: 'cumin', amount: 1, unit: 'tsp', inPantry: false },
          { name: 'paprika', amount: 0.5, unit: 'tsp', inPantry: false },
          { name: 'sour cream', amount: 60, unit: 'ml', inPantry: false }
        ],
        instructions: [
          'Drain and rinse black beans, mash lightly with spices',
          'Dice bell pepper and red onion',
          'Spread bean mixture on half of each tortilla',
          'Add cheese, vegetables, and fold tortillas',
          'Cook in dry skillet 2-3 minutes per side until golden',
          'Cut into wedges and serve with sour cream'
        ],
        tags: ['mexican', 'vegetarian', 'quick', 'lunch', 'cheese']
      },
      // NEW INDIAN CUISINE
      {
        id: 'sample_10',
        title: 'Butter Chicken (Murgh Makhani)',
        image: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=400',
        readyInMinutes: 45,
        servings: 4,
        calories: 480,
        protein: 35,
        carbs: 12,
        fat: 32,
        ingredients: [
          { name: 'chicken breast', amount: 600, unit: 'g', inPantry: false },
          { name: 'tomato sauce', amount: 400, unit: 'ml', inPantry: false },
          { name: 'heavy cream', amount: 200, unit: 'ml', inPantry: false },
          { name: 'butter', amount: 50, unit: 'g', inPantry: false },
          { name: 'garam masala', amount: 2, unit: 'tsp', inPantry: false },
          { name: 'ginger garlic paste', amount: 2, unit: 'tbsp', inPantry: false },
          { name: 'onion', amount: 1, unit: 'large', inPantry: false },
          { name: 'yogurt', amount: 100, unit: 'ml', inPantry: false }
        ],
        instructions: [
          'Marinate chicken in yogurt, garam masala, and half the ginger-garlic paste for 30 minutes',
          'Cook marinated chicken in butter until golden, set aside',
          'Sauté onions until golden, add remaining ginger-garlic paste',
          'Add tomato sauce and simmer 10 minutes',
          'Blend mixture until smooth, return to pan',
          'Add cream, cooked chicken, and simmer 10 minutes',
          'Adjust seasoning and serve with rice or naan'
        ],
        tags: ['indian', 'curry', 'dinner', 'chicken', 'creamy']
      },
      {
        id: 'sample_11',
        title: 'Vegetable Biryani',
        image: 'https://images.unsplash.com/photo-1563379091239-07c06f95b667?w=400',
        readyInMinutes: 60,
        servings: 6,
        calories: 380,
        protein: 12,
        carbs: 75,
        fat: 8,
        ingredients: [
          { name: 'basmati rice', amount: 300, unit: 'g', inPantry: false },
          { name: 'mixed vegetables', amount: 400, unit: 'g', inPantry: false },
          { name: 'onions', amount: 2, unit: 'large', inPantry: false },
          { name: 'yogurt', amount: 150, unit: 'ml', inPantry: false },
          { name: 'biryani masala', amount: 3, unit: 'tsp', inPantry: false },
          { name: 'saffron', amount: 1, unit: 'pinch', inPantry: false },
          { name: 'ghee', amount: 60, unit: 'ml', inPantry: false },
          { name: 'mint leaves', amount: 20, unit: 'g', inPantry: false }
        ],
        instructions: [
          'Soak rice for 30 minutes, drain',
          'Fry sliced onions until golden brown, set aside',
          'Cook vegetables with biryani masala until tender',
          'Partially cook rice with whole spices until 70% done',
          'Layer rice and vegetables in heavy-bottomed pot',
          'Top with fried onions, mint, saffron soaked in warm milk',
          'Cover and cook on high heat for 3 minutes, then low heat for 45 minutes',
          'Let rest 10 minutes before serving'
        ],
        tags: ['indian', 'vegetarian', 'rice', 'aromatic', 'festive']
      },
      // NEW ASIAN CUISINE
      {
        id: 'sample_12',
        title: 'Pad Thai',
        image: 'https://images.unsplash.com/photo-1559847844-d5f8b8b0c8c8?w=400',
        readyInMinutes: 25,
        servings: 3,
        calories: 410,
        protein: 18,
        carbs: 52,
        fat: 16,
        ingredients: [
          { name: 'rice noodles', amount: 250, unit: 'g', inPantry: false },
          { name: 'shrimp', amount: 200, unit: 'g', inPantry: false },
          { name: 'eggs', amount: 2, unit: 'large', inPantry: false },
          { name: 'bean sprouts', amount: 150, unit: 'g', inPantry: false },
          { name: 'fish sauce', amount: 3, unit: 'tbsp', inPantry: false },
          { name: 'tamarind paste', amount: 2, unit: 'tbsp', inPantry: false },
          { name: 'palm sugar', amount: 2, unit: 'tbsp', inPantry: false },
          { name: 'peanuts', amount: 50, unit: 'g', inPantry: false },
          { name: 'lime', amount: 1, unit: 'medium', inPantry: false }
        ],
        instructions: [
          'Soak rice noodles in warm water until soft',
          'Mix fish sauce, tamarind paste, and palm sugar for sauce',
          'Heat oil in wok, scramble eggs and set aside',
          'Stir-fry shrimp until pink',
          'Add drained noodles and sauce, toss to combine',
          'Add bean sprouts and eggs, stir-fry 2 minutes',
          'Garnish with peanuts and lime wedges'
        ],
        tags: ['thai', 'asian', 'noodles', 'seafood', 'street food']
      },
      {
        id: 'sample_13',
        title: 'Japanese Chicken Teriyaki Bowl',
        image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400',
        readyInMinutes: 30,
        servings: 3,
        calories: 450,
        protein: 38,
        carbs: 55,
        fat: 8,
        ingredients: [
          { name: 'chicken thighs', amount: 500, unit: 'g', inPantry: false },
          { name: 'jasmine rice', amount: 200, unit: 'g', inPantry: false },
          { name: 'soy sauce', amount: 60, unit: 'ml', inPantry: false },
          { name: 'mirin', amount: 30, unit: 'ml', inPantry: false },
          { name: 'brown sugar', amount: 2, unit: 'tbsp', inPantry: false },
          { name: 'ginger', amount: 1, unit: 'tbsp', inPantry: false },
          { name: 'garlic', amount: 2, unit: 'cloves', inPantry: false },
          { name: 'sesame seeds', amount: 1, unit: 'tbsp', inPantry: false },
          { name: 'green onions', amount: 2, unit: 'stalks', inPantry: false }
        ],
        instructions: [
          'Cook rice according to package instructions',
          'Mix soy sauce, mirin, brown sugar, ginger, and garlic for teriyaki sauce',
          'Season chicken with salt and pepper',
          'Pan-fry chicken until golden brown and cooked through',
          'Remove chicken, add teriyaki sauce to pan and reduce',
          'Slice chicken and return to pan to glaze',
          'Serve over rice with sesame seeds and green onions'
        ],
        tags: ['japanese', 'asian', 'chicken', 'rice', 'sweet']
      },
      // NEW MEDITERRANEAN CUISINE
      {
        id: 'sample_14',
        title: 'Mediterranean Stuffed Peppers',
        image: 'https://images.unsplash.com/photo-1606756790138-261d2769ac46?w=400',
        readyInMinutes: 45,
        servings: 4,
        calories: 320,
        protein: 15,
        carbs: 42,
        fat: 12,
        ingredients: [
          { name: 'bell peppers', amount: 4, unit: 'large', inPantry: false },
          { name: 'ground turkey', amount: 300, unit: 'g', inPantry: false },
          { name: 'quinoa', amount: 150, unit: 'g', inPantry: false },
          { name: 'diced tomatoes', amount: 400, unit: 'g', inPantry: false },
          { name: 'feta cheese', amount: 100, unit: 'g', inPantry: false },
          { name: 'olives', amount: 50, unit: 'g', inPantry: false },
          { name: 'oregano', amount: 1, unit: 'tsp', inPantry: false },
          { name: 'pine nuts', amount: 30, unit: 'g', inPantry: false }
        ],
        instructions: [
          'Preheat oven to 375°F (190°C)',
          'Cut tops off peppers and remove seeds',
          'Cook quinoa according to package instructions',
          'Brown ground turkey with oregano and garlic',
          'Mix cooked quinoa, turkey, diced tomatoes, olives, and pine nuts',
          'Stuff peppers with mixture and top with feta',
          'Bake for 30-35 minutes until peppers are tender'
        ],
        tags: ['mediterranean', 'stuffed', 'healthy', 'dinner', 'protein']
      },
      // NEW SEAFOOD
      {
        id: 'sample_15',
        title: 'Lemon Garlic Shrimp Pasta',
        image: 'https://images.unsplash.com/photo-1621996346565-e3dbc353d2e5?w=400',
        readyInMinutes: 20,
        servings: 3,
        calories: 420,
        protein: 28,
        carbs: 48,
        fat: 14,
        ingredients: [
          { name: 'linguine pasta', amount: 250, unit: 'g', inPantry: false },
          { name: 'large shrimp', amount: 400, unit: 'g', inPantry: false },
          { name: 'garlic', amount: 4, unit: 'cloves', inPantry: false },
          { name: 'lemon', amount: 1, unit: 'large', inPantry: false },
          { name: 'white wine', amount: 120, unit: 'ml', inPantry: false },
          { name: 'butter', amount: 40, unit: 'g', inPantry: false },
          { name: 'parsley', amount: 30, unit: 'g', inPantry: false },
          { name: 'olive oil', amount: 30, unit: 'ml', inPantry: false }
        ],
        instructions: [
          'Cook pasta according to package instructions',
          'Season shrimp with salt and pepper',
          'Heat olive oil in large skillet, cook shrimp 2 minutes per side',
          'Remove shrimp, add garlic to pan and sauté 1 minute',
          'Add white wine and lemon juice, simmer 2 minutes',
          'Return shrimp to pan with butter and parsley',
          'Toss with drained pasta and serve immediately'
        ],
        tags: ['seafood', 'pasta', 'quick', 'garlic', 'lemon']
      },
      // NEW VEGAN RECIPES
      {
        id: 'sample_16',
        title: 'Vegan Lentil Curry',
        image: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=400',
        readyInMinutes: 35,
        servings: 4,
        calories: 280,
        protein: 18,
        carbs: 45,
        fat: 6,
        ingredients: [
          { name: 'red lentils', amount: 200, unit: 'g', inPantry: false },
          { name: 'coconut milk', amount: 400, unit: 'ml', inPantry: false },
          { name: 'diced tomatoes', amount: 400, unit: 'g', inPantry: false },
          { name: 'onion', amount: 1, unit: 'large', inPantry: false },
          { name: 'curry powder', amount: 2, unit: 'tbsp', inPantry: false },
          { name: 'turmeric', amount: 1, unit: 'tsp', inPantry: false },
          { name: 'ginger', amount: 1, unit: 'tbsp', inPantry: false },
          { name: 'spinach', amount: 150, unit: 'g', inPantry: false }
        ],
        instructions: [
          'Rinse lentils until water runs clear',
          'Sauté diced onion until translucent',
          'Add ginger, curry powder, and turmeric, cook 1 minute',
          'Add lentils, diced tomatoes, and coconut milk',
          'Simmer 20-25 minutes until lentils are tender',
          'Stir in spinach until wilted',
          'Season with salt and serve with rice'
        ],
        tags: ['vegan', 'curry', 'lentils', 'healthy', 'protein']
      },
      {
        id: 'sample_17',
        title: 'Quinoa Black Bean Burger',
        image: 'https://images.unsplash.com/photo-1551782450-17144efb9c50?w=400',
        readyInMinutes: 25,
        servings: 4,
        calories: 340,
        protein: 16,
        carbs: 52,
        fat: 8,
        ingredients: [
          { name: 'quinoa', amount: 100, unit: 'g', inPantry: false },
          { name: 'black beans', amount: 400, unit: 'g', inPantry: false },
          { name: 'oats', amount: 60, unit: 'g', inPantry: false },
          { name: 'onion', amount: 1, unit: 'small', inPantry: false },
          { name: 'garlic', amount: 2, unit: 'cloves', inPantry: false },
          { name: 'cumin', amount: 1, unit: 'tsp', inPantry: false },
          { name: 'paprika', amount: 1, unit: 'tsp', inPantry: false },
          { name: 'burger buns', amount: 4, unit: 'pieces', inPantry: false }
        ],
        instructions: [
          'Cook quinoa according to package instructions, cool',
          'Mash black beans, leaving some chunks',
          'Pulse oats in food processor until coarse',
          'Mix quinoa, beans, oats, diced onion, garlic, and spices',
          'Form into 4 patties, chill 15 minutes',
          'Cook patties in oiled pan 4-5 minutes per side',
          'Serve on buns with your favorite toppings'
        ],
        tags: ['vegan', 'burger', 'quinoa', 'protein', 'healthy']
      },
      // NEW SOUP RECIPES
      {
        id: 'sample_18',
        title: 'Classic Chicken Noodle Soup',
        image: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=400',
        readyInMinutes: 40,
        servings: 6,
        calories: 280,
        protein: 22,
        carbs: 32,
        fat: 8,
        ingredients: [
          { name: 'chicken breast', amount: 400, unit: 'g', inPantry: false },
          { name: 'egg noodles', amount: 200, unit: 'g', inPantry: false },
          { name: 'carrots', amount: 2, unit: 'large', inPantry: false },
          { name: 'celery', amount: 3, unit: 'stalks', inPantry: false },
          { name: 'onion', amount: 1, unit: 'medium', inPantry: false },
          { name: 'chicken broth', amount: 1500, unit: 'ml', inPantry: false },
          { name: 'thyme', amount: 1, unit: 'tsp', inPantry: false },
          { name: 'bay leaves', amount: 2, unit: 'pieces', inPantry: false }
        ],
        instructions: [
          'Bring chicken broth to boil, add chicken and herbs',
          'Simmer 20 minutes until chicken is cooked through',
          'Remove chicken, shred when cool enough to handle',
          'Add diced carrots, celery, and onion to broth',
          'Simmer 10 minutes until vegetables are tender',
          'Add egg noodles and cook according to package directions',
          'Return shredded chicken to pot',
          'Season with salt and pepper, remove bay leaves before serving'
        ],
        tags: ['soup', 'comfort', 'chicken', 'noodles', 'classic']
      },
      // NEW BREAKFAST ITEMS
      {
        id: 'sample_19',
        title: 'Overnight Oats with Berries',
        image: 'https://images.unsplash.com/photo-1571091655789-405eb7a3a3a8?w=400',
        readyInMinutes: 10,
        servings: 2,
        calories: 320,
        protein: 12,
        carbs: 52,
        fat: 8,
        ingredients: [
          { name: 'rolled oats', amount: 100, unit: 'g', inPantry: false },
          { name: 'milk', amount: 300, unit: 'ml', inPantry: false },
          { name: 'greek yogurt', amount: 100, unit: 'g', inPantry: false },
          { name: 'honey', amount: 2, unit: 'tbsp', inPantry: false },
          { name: 'vanilla extract', amount: 1, unit: 'tsp', inPantry: false },
          { name: 'mixed berries', amount: 150, unit: 'g', inPantry: false },
          { name: 'chia seeds', amount: 1, unit: 'tbsp', inPantry: false }
        ],
        instructions: [
          'Mix oats, milk, yogurt, honey, and vanilla in a bowl',
          'Stir in chia seeds',
          'Divide between 2 jars or bowls',
          'Cover and refrigerate overnight',
          'In the morning, top with mixed berries',
          'Add extra milk if desired consistency is thinner',
          'Enjoy cold'
        ],
        tags: ['breakfast', 'overnight', 'healthy', 'no-cook', 'berries']
      },
      // NEW DESSERTS
      {
        id: 'sample_20',
        title: 'Classic Tiramisu',
        image: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=400',
        readyInMinutes: 30,
        servings: 8,
        calories: 420,
        protein: 8,
        carbs: 38,
        fat: 26,
        ingredients: [
          { name: 'ladyfinger cookies', amount: 200, unit: 'g', inPantry: false },
          { name: 'mascarpone cheese', amount: 500, unit: 'g', inPantry: false },
          { name: 'eggs', amount: 4, unit: 'large', inPantry: false },
          { name: 'sugar', amount: 100, unit: 'g', inPantry: false },
          { name: 'strong coffee', amount: 300, unit: 'ml', inPantry: false },
          { name: 'cocoa powder', amount: 30, unit: 'g', inPantry: false },
          { name: 'marsala wine', amount: 60, unit: 'ml', inPantry: false }
        ],
        instructions: [
          'Separate eggs, beat yolks with sugar until pale',
          'Mix in mascarpone until smooth',
          'Whip egg whites to soft peaks, fold into mascarpone mixture',
          'Combine coffee and marsala in shallow dish',
          'Quickly dip each ladyfinger in coffee mixture',
          'Layer coffee-soaked cookies in dish',
          'Spread half the mascarpone mixture over cookies',
          'Repeat layers, refrigerate 4 hours or overnight',
          'Dust with cocoa powder before serving'
        ],
        tags: ['dessert', 'italian', 'coffee', 'elegant', 'make-ahead']
      }
    ];

    // Add more sample recipes to reach maxRecipes
    const additionalRecipes = this.generateAdditionalSampleRecipes(maxRecipes - sampleRecipes.length);
    return [...sampleRecipes, ...additionalRecipes];
  }

  private generateAdditionalSampleRecipes(count: number): Recipe[] {
    const recipeTemplates = [
      // AMERICAN CUISINE
      {
        title: 'Classic BBQ Pulled Pork',
        image: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=400',
        readyInMinutes: 480,
        servings: 8,
        calories: 420,
        protein: 35,
        carbs: 25,
        fat: 22,
        tags: ['american', 'bbq', 'pork', 'slow-cooked', 'dinner'],
        ingredients: [
          { name: 'pork shoulder', amount: 1500, unit: 'g', inPantry: false },
          { name: 'bbq sauce', amount: 200, unit: 'ml', inPantry: false },
          { name: 'brown sugar', amount: 60, unit: 'g', inPantry: false },
          { name: 'paprika', amount: 2, unit: 'tbsp', inPantry: false },
          { name: 'garlic powder', amount: 1, unit: 'tbsp', inPantry: false },
          { name: 'onion powder', amount: 1, unit: 'tbsp', inPantry: false },
          { name: 'hamburger buns', amount: 8, unit: 'pieces', inPantry: false }
        ],
        instructions: [
          'Rub pork with brown sugar, paprika, garlic powder, and onion powder',
          'Slow cook on low for 6-8 hours until tender',
          'Shred meat with two forks',
          'Mix with BBQ sauce',
          'Serve on hamburger buns with coleslaw'
        ]
      },
      // FRENCH CUISINE
      {
        title: 'Coq au Vin',
        image: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=400',
        readyInMinutes: 90,
        servings: 4,
        calories: 520,
        protein: 42,
        carbs: 15,
        fat: 28,
        tags: ['french', 'chicken', 'wine', 'elegant', 'dinner'],
        ingredients: [
          { name: 'chicken pieces', amount: 800, unit: 'g', inPantry: false },
          { name: 'red wine', amount: 500, unit: 'ml', inPantry: false },
          { name: 'bacon', amount: 150, unit: 'g', inPantry: false },
          { name: 'pearl onions', amount: 200, unit: 'g', inPantry: false },
          { name: 'mushrooms', amount: 250, unit: 'g', inPantry: false },
          { name: 'chicken stock', amount: 300, unit: 'ml', inPantry: false },
          { name: 'thyme', amount: 2, unit: 'tsp', inPantry: false }
        ],
        instructions: [
          'Brown bacon and chicken pieces in heavy pot',
          'Remove chicken, sauté onions and mushrooms',
          'Add wine and stock, return chicken',
          'Add thyme and simmer covered for 1 hour',
          'Serve with crusty bread or mashed potatoes'
        ]
      },
      // MIDDLE EASTERN CUISINE
      {
        title: 'Shakshuka',
        image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400',
        readyInMinutes: 25,
        servings: 3,
        calories: 280,
        protein: 15,
        carbs: 20,
        fat: 18,
        tags: ['middle-eastern', 'eggs', 'vegetarian', 'breakfast', 'brunch'],
        ingredients: [
          { name: 'canned tomatoes', amount: 400, unit: 'g', inPantry: false },
          { name: 'eggs', amount: 4, unit: 'large', inPantry: false },
          { name: 'bell pepper', amount: 1, unit: 'large', inPantry: false },
          { name: 'onion', amount: 1, unit: 'medium', inPantry: false },
          { name: 'garlic', amount: 3, unit: 'cloves', inPantry: false },
          { name: 'paprika', amount: 1, unit: 'tsp', inPantry: false },
          { name: 'cumin', amount: 1, unit: 'tsp', inPantry: false },
          { name: 'feta cheese', amount: 100, unit: 'g', inPantry: false }
        ],
        instructions: [
          'Sauté onion and bell pepper until soft',
          'Add garlic, paprika, and cumin, cook 1 minute',
          'Add tomatoes and simmer 10 minutes',
          'Make wells in sauce and crack eggs into them',
          'Cover and cook until egg whites are set',
          'Top with crumbled feta and serve with bread'
        ]
      },
      // KOREAN CUISINE
      {
        title: 'Korean Bibimbap',
        image: 'https://images.unsplash.com/photo-1498654896293-37aacf113fd9?w=400',
        readyInMinutes: 45,
        servings: 4,
        calories: 450,
        protein: 25,
        carbs: 65,
        fat: 12,
        tags: ['korean', 'rice', 'vegetables', 'healthy', 'colorful'],
        ingredients: [
          { name: 'short grain rice', amount: 300, unit: 'g', inPantry: false },
          { name: 'ground beef', amount: 300, unit: 'g', inPantry: false },
          { name: 'spinach', amount: 200, unit: 'g', inPantry: false },
          { name: 'carrots', amount: 2, unit: 'medium', inPantry: false },
          { name: 'mushrooms', amount: 150, unit: 'g', inPantry: false },
          { name: 'eggs', amount: 4, unit: 'large', inPantry: false },
          { name: 'sesame oil', amount: 30, unit: 'ml', inPantry: false },
          { name: 'soy sauce', amount: 60, unit: 'ml', inPantry: false },
          { name: 'gochujang', amount: 2, unit: 'tbsp', inPantry: false }
        ],
        instructions: [
          'Cook rice according to package instructions',
          'Blanch spinach, sauté carrots and mushrooms separately',
          'Season each vegetable with sesame oil and soy sauce',
          'Brown ground beef with soy sauce and garlic',
          'Fry eggs sunny-side up',
          'Arrange rice in bowls, top with vegetables, beef, and egg',
          'Serve with gochujang on the side'
        ]
      },
      // MOROCCAN CUISINE
      {
        title: 'Moroccan Lamb Tagine',
        image: 'https://images.unsplash.com/photo-1544552866-d3ed42536cfd?w=400',
        readyInMinutes: 120,
        servings: 6,
        calories: 520,
        protein: 38,
        carbs: 35,
        fat: 24,
        tags: ['moroccan', 'lamb', 'stew', 'aromatic', 'dinner'],
        ingredients: [
          { name: 'lamb shoulder', amount: 800, unit: 'g', inPantry: false },
          { name: 'dried apricots', amount: 100, unit: 'g', inPantry: false },
          { name: 'chickpeas', amount: 400, unit: 'g', inPantry: false },
          { name: 'onions', amount: 2, unit: 'large', inPantry: false },
          { name: 'cinnamon', amount: 1, unit: 'tsp', inPantry: false },
          { name: 'ginger', amount: 1, unit: 'tsp', inPantry: false },
          { name: 'saffron', amount: 1, unit: 'pinch', inPantry: false },
          { name: 'almonds', amount: 50, unit: 'g', inPantry: false }
        ],
        instructions: [
          'Brown lamb pieces in tagine or heavy pot',
          'Add onions, spices, and enough water to cover',
          'Simmer covered for 1 hour',
          'Add chickpeas and apricots, cook 30 minutes more',
          'Garnish with toasted almonds',
          'Serve with couscous or flatbread'
        ]
      },
      // RUSSIAN CUISINE
      {
        title: 'Beef Stroganoff',
        image: 'https://images.unsplash.com/photo-1567620832903-9fc6debc209f?w=400',
        readyInMinutes: 35,
        servings: 4,
        calories: 580,
        protein: 35,
        carbs: 45,
        fat: 28,
        tags: ['russian', 'beef', 'creamy', 'pasta', 'comfort'],
        ingredients: [
          { name: 'beef tenderloin', amount: 500, unit: 'g', inPantry: false },
          { name: 'egg noodles', amount: 300, unit: 'g', inPantry: false },
          { name: 'mushrooms', amount: 250, unit: 'g', inPantry: false },
          { name: 'sour cream', amount: 200, unit: 'ml', inPantry: false },
          { name: 'onion', amount: 1, unit: 'large', inPantry: false },
          { name: 'beef broth', amount: 300, unit: 'ml', inPantry: false },
          { name: 'dijon mustard', amount: 1, unit: 'tbsp', inPantry: false }
        ],
        instructions: [
          'Cut beef into strips and brown quickly',
          'Remove beef, sauté onions and mushrooms',
          'Add broth and mustard, simmer 5 minutes',
          'Return beef to pan, stir in sour cream',
          'Cook egg noodles according to package directions',
          'Serve stroganoff over noodles'
        ]
      },
      // SPANISH CUISINE
      {
        title: 'Seafood Paella',
        image: 'https://images.unsplash.com/photo-1534080564583-6be75777b70a?w=400',
        readyInMinutes: 45,
        servings: 6,
        calories: 420,
        protein: 28,
        carbs: 55,
        fat: 10,
        tags: ['spanish', 'seafood', 'rice', 'saffron', 'dinner'],
        ingredients: [
          { name: 'bomba rice', amount: 400, unit: 'g', inPantry: false },
          { name: 'mixed seafood', amount: 600, unit: 'g', inPantry: false },
          { name: 'chicken stock', amount: 1000, unit: 'ml', inPantry: false },
          { name: 'saffron', amount: 1, unit: 'pinch', inPantry: false },
          { name: 'tomatoes', amount: 2, unit: 'medium', inPantry: false },
          { name: 'garlic', amount: 4, unit: 'cloves', inPantry: false },
          { name: 'bell peppers', amount: 2, unit: 'medium', inPantry: false }
        ],
        instructions: [
          'Heat paella pan, sauté garlic and tomatoes',
          'Add rice and toast for 2 minutes',
          'Add hot stock infused with saffron',
          'Arrange seafood and peppers on top',
          'Simmer without stirring for 20 minutes',
          'Rest for 5 minutes before serving'
        ]
      },
      // GERMAN CUISINE
      {
        title: 'Sauerbraten with Red Cabbage',
        image: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=400',
        readyInMinutes: 180,
        servings: 6,
        calories: 480,
        protein: 40,
        carbs: 25,
        fat: 24,
        tags: ['german', 'beef', 'marinated', 'traditional', 'dinner'],
        ingredients: [
          { name: 'beef roast', amount: 1200, unit: 'g', inPantry: false },
          { name: 'red wine vinegar', amount: 300, unit: 'ml', inPantry: false },
          { name: 'red cabbage', amount: 500, unit: 'g', inPantry: false },
          { name: 'onions', amount: 2, unit: 'large', inPantry: false },
          { name: 'bay leaves', amount: 3, unit: 'pieces', inPantry: false },
          { name: 'gingersnaps', amount: 6, unit: 'pieces', inPantry: false },
          { name: 'sour cream', amount: 150, unit: 'ml', inPantry: false }
        ],
        instructions: [
          'Marinate beef in vinegar and spices for 24 hours',
          'Brown marinated beef in heavy pot',
          'Add marinade and simmer covered for 2.5 hours',
          'Sauté red cabbage with onions and seasonings',
          'Thicken pan juices with crushed gingersnaps',
          'Serve sliced beef with sauce and red cabbage'
        ]
      },
      // BRAZILIAN CUISINE
      {
        title: 'Feijoada (Brazilian Black Bean Stew)',
        image: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=400',
        readyInMinutes: 180,
        servings: 8,
        calories: 520,
        protein: 28,
        carbs: 45,
        fat: 22,
        tags: ['brazilian', 'black beans', 'pork', 'stew', 'traditional'],
        ingredients: [
          { name: 'black beans', amount: 500, unit: 'g', inPantry: false },
          { name: 'pork shoulder', amount: 400, unit: 'g', inPantry: false },
          { name: 'brazilian sausage', amount: 300, unit: 'g', inPantry: false },
          { name: 'bacon', amount: 150, unit: 'g', inPantry: false },
          { name: 'onions', amount: 2, unit: 'large', inPantry: false },
          { name: 'garlic', amount: 6, unit: 'cloves', inPantry: false },
          { name: 'bay leaves', amount: 3, unit: 'pieces', inPantry: false },
          { name: 'orange zest', amount: 2, unit: 'tbsp', inPantry: false }
        ],
        instructions: [
          'Soak black beans overnight, then cook until tender',
          'Brown all meats in large pot',
          'Add beans, onions, garlic, and bay leaves',
          'Simmer for 2 hours, stirring occasionally',
          'Add orange zest in last 30 minutes',
          'Serve with rice, collard greens, and orange slices'
        ]
      },
      // LEBANESE CUISINE
      {
        title: 'Lebanese Kibbeh',
        image: 'https://images.unsplash.com/photo-1562059390-a761a084768e?w=400',
        readyInMinutes: 60,
        servings: 6,
        calories: 380,
        protein: 22,
        carbs: 35,
        fat: 18,
        tags: ['lebanese', 'bulgur', 'lamb', 'traditional', 'fried'],
        ingredients: [
          { name: 'fine bulgur', amount: 200, unit: 'g', inPantry: false },
          { name: 'ground lamb', amount: 300, unit: 'g', inPantry: false },
          { name: 'onions', amount: 2, unit: 'medium', inPantry: false },
          { name: 'pine nuts', amount: 50, unit: 'g', inPantry: false },
          { name: 'allspice', amount: 1, unit: 'tsp', inPantry: false },
          { name: 'cinnamon', amount: 0.5, unit: 'tsp', inPantry: false },
          { name: 'vegetable oil', amount: 200, unit: 'ml', inPantry: false }
        ],
        instructions: [
          'Soak bulgur in water for 30 minutes, drain well',
          'Mix bulgur with half the lamb, onion, and spices',
          'Prepare filling with remaining lamb, onions, and pine nuts',
          'Form kibbeh shells and stuff with filling',
          'Deep fry until golden brown and crispy',
          'Serve hot with yogurt sauce'
        ]
      },
      // PERUVIAN CUISINE
      {
        title: 'Peruvian Ceviche',
        image: 'https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=400',
        readyInMinutes: 30,
        servings: 4,
        calories: 180,
        protein: 25,
        carbs: 12,
        fat: 4,
        tags: ['peruvian', 'seafood', 'fresh', 'citrus', 'light'],
        ingredients: [
          { name: 'white fish fillets', amount: 500, unit: 'g', inPantry: false },
          { name: 'lime juice', amount: 120, unit: 'ml', inPantry: false },
          { name: 'red onion', amount: 1, unit: 'medium', inPantry: false },
          { name: 'aji amarillo peppers', amount: 2, unit: 'pieces', inPantry: false },
          { name: 'sweet potato', amount: 200, unit: 'g', inPantry: false },
          { name: 'corn kernels', amount: 100, unit: 'g', inPantry: false },
          { name: 'cilantro', amount: 30, unit: 'g', inPantry: false }
        ],
        instructions: [
          'Cut fish into small cubes',
          'Marinate fish in lime juice for 15 minutes',
          'Slice red onion very thinly',
          'Boil sweet potato and corn until tender',
          'Mix fish with onions, peppers, and cilantro',
          'Serve with sweet potato and corn on the side'
        ]
      },
      // ETHIOPIAN CUISINE
      {
        title: 'Doro Wat (Ethiopian Chicken Stew)',
        image: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=400',
        readyInMinutes: 90,
        servings: 6,
        calories: 450,
        protein: 35,
        carbs: 15,
        fat: 28,
        tags: ['ethiopian', 'chicken', 'spicy', 'berbere', 'stew'],
        ingredients: [
          { name: 'chicken pieces', amount: 800, unit: 'g', inPantry: false },
          { name: 'berbere spice', amount: 3, unit: 'tbsp', inPantry: false },
          { name: 'red onions', amount: 3, unit: 'large', inPantry: false },
          { name: 'garlic', amount: 6, unit: 'cloves', inPantry: false },
          { name: 'ginger', amount: 2, unit: 'tbsp', inPantry: false },
          { name: 'clarified butter', amount: 100, unit: 'ml', inPantry: false },
          { name: 'hard-boiled eggs', amount: 6, unit: 'pieces', inPantry: false }
        ],
        instructions: [
          'Slowly cook sliced onions until deep brown',
          'Add garlic, ginger, and berbere spice',
          'Add chicken pieces and clarified butter',
          'Simmer covered for 45 minutes',
          'Add hard-boiled eggs in last 15 minutes',
          'Serve with injera bread'
        ]
      }
    ];

    const recipes: Recipe[] = [];
    for (let i = 0; i < count; i++) {
      const template = recipeTemplates[i % recipeTemplates.length];
      recipes.push({
        id: `sample_${21 + i}`,
        title: template.title,
        image: template.image,
        readyInMinutes: template.readyInMinutes,
        servings: template.servings,
        calories: template.calories,
        protein: template.protein,
        carbs: template.carbs,
        fat: template.fat,
        ingredients: template.ingredients,
        instructions: template.instructions,
        tags: template.tags
      });
    }

    return recipes;
  }

  public removeDuplicates(recipes: Recipe[]): Recipe[] {
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

  public hasValidApiKeys(): boolean {
    // Check if API keys are configured (not placeholder values)
    // For now, always return false to use sample recipes
    return false; // Set to true when you have actual API keys
  }

  public hasValidEdamamKeys(): boolean {
    // Check if Edamam API keys are configured
    // For now, always return false to use sample recipes
    return false; // Set to true when you have actual API keys
  }

  private reportProgress(
    onProgress: ((progress: DownloadProgress) => void) | undefined,
    progress: DownloadProgress
  ): void {
    if (onProgress) {
      onProgress(progress);
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async getDownloadStatus(): Promise<{ isDownloading: boolean; recipeCount: number }> {
    const recipeCount = await getRecipeCount();
    return {
      isDownloading: this.isDownloading,
      recipeCount
    };
  }
}

// Export singleton instance
export const recipeDownloader = RecipeDownloader.getInstance();

// Bulk populate the database with common recipes for offline use
export async function populateCommonRecipes(maxRecipes: number = 500): Promise<Recipe[]> {
  const allRecipes: Recipe[] = [];
  // Try Spoonacular first
  if (RecipeDownloader.getInstance().hasValidApiKeys()) {
    try {
      const spoonacularRecipes = await RecipeDownloader.getInstance().downloadFromSpoonacular(
        maxRecipes,
        [], [], [], undefined
      );
      allRecipes.push(...spoonacularRecipes);
    } catch (e) { console.error('Spoonacular bulk download failed', e); }
  }
  // Try Edamam
  if (RecipeDownloader.getInstance().hasValidEdamamKeys()) {
    try {
      const edamamRecipes = await RecipeDownloader.getInstance().downloadFromEdamam(
        maxRecipes,
        [], [], [], undefined
      );
      allRecipes.push(...edamamRecipes);
    } catch (e) { console.error('Edamam bulk download failed', e); }
  }
  // Fallback to sample recipes if needed
  if (allRecipes.length === 0) {
    const sampleRecipes = await RecipeDownloader.getInstance().downloadSampleRecipes(maxRecipes);
    allRecipes.push(...sampleRecipes);
  }
  // Remove duplicates
  const uniqueRecipes = RecipeDownloader.getInstance().removeDuplicates(allRecipes);
  // Save to database, skipping already existing recipes
  await saveRecipes(uniqueRecipes);
  return uniqueRecipes;
} 
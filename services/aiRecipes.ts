import { Ingredient, Recipe } from '../types';
import { AIRecipePreferences } from '../types';
import { HfInference } from '@huggingface/inference';
import { DEFAULT_AI_CONFIG, DEFAULT_RECIPE_PREFERENCES, validateAIConfig, logSetupInstructions, AIServiceConfig } from './aiConfig';

// Track if setup instructions have been shown
let hasShownSetupInstructions = false;

// Initialize HuggingFace inference client
const getHfClient = (config: AIServiceConfig) => {
  if (config.apiKey) {
    return new HfInference(config.apiKey);
  }
  // Use free tier if no API key provided
  return new HfInference();
};

// Enhanced AI recipe generation using OpenAI gpt-oss-120b
export async function generateAIRecipesFromPantry(
  ingredients: Ingredient[], 
  count?: number,
  preferences?: AIRecipePreferences,
  customConfig?: Partial<AIServiceConfig>
): Promise<Recipe[]> {
  const finalConfig = { ...DEFAULT_AI_CONFIG, ...customConfig };
  const finalCount = count || finalConfig.defaultRecipeCount;
  const finalPreferences: AIRecipePreferences = { 
    ...DEFAULT_RECIPE_PREFERENCES,
    ...preferences 
  } as AIRecipePreferences;
  
  console.log(`🍳 Generating ${finalCount} AI recipes from ${ingredients.length} pantry ingredients...`);
  
  // Show setup instructions on first run
  if (!hasShownSetupInstructions) {
    logSetupInstructions();
    hasShownSetupInstructions = true;
  }
  
  // Validate configuration and show warnings
  const validation = validateAIConfig(finalConfig);
  if (validation.warnings.length > 0) {
    console.warn('⚠️ AI Configuration Warnings:', validation.warnings);
  }
  if (validation.recommendations.length > 0) {
    console.info('💡 AI Configuration Recommendations:', validation.recommendations);
  }
  
  try {
    // Prepare ingredient list for the prompt
    const ingredientList = ingredients.map(ing => 
      `${ing.name} (${ing.count || 1} ${ing.serving_unit || 'unit'})`
    ).join(', ');
    
    // Create the prompt with structured format instructions
    const prompt = createRecipePrompt(ingredientList, finalCount, finalPreferences, finalConfig.reasoningLevel);
    
    console.log('Generated prompt for AI model:', prompt.substring(0, 200) + '...');
    
    // Generate recipes using the model
    const recipes = await generateRecipesWithModel(prompt, finalConfig, finalCount);
    
    console.log(`✅ Successfully generated ${recipes.length} AI recipes`);
    return recipes;
    
  } catch (error) {
    console.error('❌ Error generating AI recipes:', error);
    
    // Return a helpful error recipe instead of crashing
    return [{
      id: `ai-error-${Date.now()}`,
      title: 'AI Recipe Generation Error',
      image: '',
      readyInMinutes: 0,
      servings: 0,
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
      ingredients: [],
      instructions: [
        '🚧 Unable to generate AI recipes at this time.',
        `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        '',
        '💡 Troubleshooting tips:',
        '• Check your internet connection',
        '• Verify your HuggingFace API key in services/aiConfig.ts',
        '• Try again in a few moments',
        '• Consider using the "Find Recipes" option as an alternative'
      ],
      tags: ['error', 'ai'],
      confidenceScore: 0
    }];
  }
}

// Create a comprehensive prompt for recipe generation
function createRecipePrompt(
  ingredientList: string, 
  count: number, 
  preferences?: AIRecipePreferences,
  reasoningLevel: 'low' | 'medium' | 'high' = 'medium'
): string {
  const dietaryInfo = preferences?.dietaryRestrictions?.length 
    ? `Dietary restrictions: ${preferences.dietaryRestrictions.join(', ')}. ` 
    : '';
  
  const cuisineInfo = preferences?.preferredCuisines?.length 
    ? `Preferred cuisines: ${preferences.preferredCuisines.join(', ')}. ` 
    : '';
  
  const cookingTimeInfo = preferences?.maxCookingTime 
    ? `Maximum cooking time: ${preferences.maxCookingTime} minutes. ` 
    : '';
  
  const skillInfo = preferences?.skillLevel 
    ? `Skill level: ${preferences.skillLevel}. ` 
    : '';
  
  const nutritionInfo = preferences?.nutritionFocus && preferences.nutritionFocus !== 'none'
    ? `Nutrition focus: ${preferences.nutritionFocus}. ` 
    : '';
  
  const avoidInfo = preferences?.avoidIngredients?.length 
    ? `Avoid these ingredients: ${preferences.avoidIngredients.join(', ')}. ` 
    : '';

  return `Create ${count} delicious recipes using these pantry ingredients: ${ingredientList}

${dietaryInfo}${cuisineInfo}${cookingTimeInfo}${skillInfo}${nutritionInfo}${avoidInfo}

CRITICAL: You must respond with ONLY a valid JSON array. No other text, explanations, or markdown. Start with [ and end with ].

Example format:
[
  {
    "title": "Chicken Fried Rice",
    "readyInMinutes": 25,
    "servings": 4,
    "ingredients": [
      {"name": "chicken breast", "amount": 2, "unit": "pieces", "inPantry": true},
      {"name": "rice", "amount": 1, "unit": "cup", "inPantry": true}
    ],
    "instructions": [
      "Cook rice according to package directions",
      "Cut chicken into small pieces and cook in a pan"
    ],
    "calories": 350,
    "protein": 25,
    "carbs": 35,
    "fat": 8,
    "tags": ["easy", "asian", "dinner"]
  }
]

Generate ${count} unique recipes now. JSON only:`;
}

// Generate recipes using the AI model with improved handling
async function generateRecipesWithModel(
  prompt: string, 
  config: AIServiceConfig, 
  expectedCount: number
): Promise<Recipe[]> {
  try {
    const hf = getHfClient(config);
    
    // Use structured response format to ensure JSON output
    const response = await hf.chatCompletion({
      model: config.model,
      messages: [
        {
          role: "system",
          content: "You are a recipe generator. Always respond with valid JSON arrays only. Never include explanations or markdown formatting. Always complete the JSON array properly with closing brackets."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: config.maxTokens,
      temperature: config.temperature,
    });
    
    console.log('Raw AI response received, parsing...');
    
    // Parse the AI response from the chat completion
    const aiResponseText = response.choices[0]?.message?.content || '';
    console.log('AI Response Length:', aiResponseText.length);
    console.log('AI Response Preview:', aiResponseText.substring(0, 200));
    
    const recipes = parseAIResponse(aiResponseText, expectedCount);
    
    return recipes;
  } catch (error) {
    console.error('Model generation error:', error);
    throw new Error(`AI model error: ${error instanceof Error ? error.message : 'Unknown error'}. Please check your internet connection and try again.`);
  }
}

// Improved parsing with better error handling
function parseAIResponse(response: string, expectedCount: number): Recipe[] {
  try {
    // Clean up the response text
    let cleanedResponse = response.trim();
    
    // Remove any markdown formatting
    cleanedResponse = cleanedResponse.replace(/```json\s*|\s*```/g, '');
    cleanedResponse = cleanedResponse.replace(/```\s*|\s*```/g, '');
    
    // Try to fix common JSON truncation issues
    // If response ends with incomplete object, try to complete it
    if (cleanedResponse.includes('[') && !cleanedResponse.endsWith(']')) {
      // Count open vs closed braces to see if we can fix it
      const openBraces = (cleanedResponse.match(/\{/g) || []).length;
      const closeBraces = (cleanedResponse.match(/\}/g) || []).length;
      
      if (openBraces > closeBraces) {
        // Add missing closing braces
        const missingBraces = openBraces - closeBraces;
        cleanedResponse += '}'. repeat(missingBraces);
      }
      
      // Add closing array bracket if missing
      if (!cleanedResponse.endsWith(']')) {
        cleanedResponse += ']';
      }
    }
    
    // Try to find JSON array
    let jsonMatch = cleanedResponse.match(/\[[\s\S]*\]/);
    
    if (!jsonMatch) {
      // Try to find individual complete objects and wrap them
      const objectMatches = cleanedResponse.match(/\{[\s\S]*?\}(?=\s*(?:,\s*\{|$))/g);
      if (objectMatches && objectMatches.length > 0) {
        cleanedResponse = '[' + objectMatches.join(',') + ']';
        jsonMatch = [cleanedResponse];
      }
    }
    
    if (!jsonMatch) {
      // Last resort: try to parse the entire response as JSON
      try {
        const parsed = JSON.parse(cleanedResponse);
        if (Array.isArray(parsed)) {
          jsonMatch = [cleanedResponse];
        }
      } catch (e) {
        throw new Error('No valid JSON found in AI response');
      }
    }
    
    if (!jsonMatch) {
      throw new Error('No valid JSON found in AI response');
    }
    
    const parsedRecipes = JSON.parse(jsonMatch[0]);
    
    if (!Array.isArray(parsedRecipes)) {
      throw new Error('Response is not an array');
    }
    
    // Convert to Recipe objects and add missing fields
    const recipes: Recipe[] = parsedRecipes.map((recipe: any, index: number) => ({
      id: `ai-recipe-${Date.now()}-${index}`,
      title: recipe.title || `AI Generated Recipe ${index + 1}`,
      image: '', // Will be populated by image search if needed
      readyInMinutes: parseInt(recipe.readyInMinutes) || 30,
      servings: parseInt(recipe.servings) || 4,
      calories: parseInt(recipe.calories) || 0,
      protein: parseFloat(recipe.protein) || 0,
      carbs: parseFloat(recipe.carbs) || 0,
      fat: parseFloat(recipe.fat) || 0,
      ingredients: Array.isArray(recipe.ingredients) ? recipe.ingredients.map((ing: any) => ({
        name: ing.name || 'Unknown ingredient',
        amount: parseFloat(ing.amount) || 1,
        unit: ing.unit || 'unit',
        inPantry: Boolean(ing.inPantry)
      })) : [],
      instructions: Array.isArray(recipe.instructions) ? recipe.instructions : ['No instructions provided'],
      tags: Array.isArray(recipe.tags) ? recipe.tags : ['ai-generated'],
      confidenceScore: 85 + (index * 2) // Slight variation for ranking
    }));
    
    console.log(`📝 Parsed ${recipes.length} recipes from AI response`);
    return recipes.slice(0, expectedCount);
    
  } catch (error) {
    console.error('Error parsing AI response:', error);
    console.log('Full response for debugging:', response);
    
    // Return a fallback recipe with the raw response for debugging
    return [{
      id: `ai-fallback-${Date.now()}`,
      title: 'AI Recipe (Parsing Error)',
      image: '',
      readyInMinutes: 30,
      servings: 4,
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
      ingredients: [],
      instructions: [
        '🤖 AI generated a recipe but there was a formatting issue.',
        '',
        'Raw AI Response:',
        response.substring(0, 500) + (response.length > 500 ? '...' : '')
      ],
      tags: ['ai-generated', 'parsing-error'],
      confidenceScore: 50
    }];
  }
}

// Test function for debugging - now uses real AI generation
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
      count: 2,
    },
    {
      id: 'test-2',
      name: 'Rice',
      category: 'Grains',
      calories: 130,
      protein: 2.7,
      carbs: 28,
      fat: 0.3,
      serving_size: 100,
      serving_unit: 'g',
      common_names: '',
      added_at: new Date().toISOString(),
      count: 1,
    },
    {
      id: 'test-3',
      name: 'Onion',
      category: 'Vegetables',
      calories: 40,
      protein: 1.1,
      carbs: 9.3,
      fat: 0.1,
      serving_size: 100,
      serving_unit: 'g',
      common_names: '',
      added_at: new Date().toISOString(),
      count: 1,
    }
  ];
  
  const testPreferences: AIRecipePreferences = {
    dietaryRestrictions: [],
    cookingStyles: ['healthy'],
    maxCookingTime: 45,
    skillLevel: 'intermediate',
    servingSize: 4,
    avoidIngredients: [],
    preferredCuisines: ['mediterranean'],
    nutritionFocus: 'balanced'
  };
  
  console.log('🧪 Testing AI recipe generation...');
  const recipes = await generateAIRecipesFromPantry(testIngredients, 2, testPreferences);
  console.log(`Generated ${recipes.length} test recipes:`, recipes.map(r => r.title));
}

// Helper function to estimate cooking difficulty based on ingredients and steps
export function estimateDifficulty(recipe: Recipe): 'easy' | 'medium' | 'hard' {
  const ingredientCount = recipe.ingredients.length;
  const stepCount = recipe.instructions.length;
  const cookingTime = recipe.readyInMinutes;
  
  const complexityScore = (ingredientCount * 0.5) + (stepCount * 1) + (cookingTime * 0.1);
  
  if (complexityScore < 10) return 'easy';
  if (complexityScore < 20) return 'medium';
  return 'hard';
}

// Helper function to get missing ingredients for a recipe
export function getMissingIngredients(recipe: Recipe): string[] {
  return recipe.ingredients
    .filter(ing => !ing.inPantry)
    .map(ing => ing.name);
}

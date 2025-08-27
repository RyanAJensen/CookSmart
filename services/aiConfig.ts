import { AIRecipePreferences } from '../types';

// AI Configuration Interface
export interface AIServiceConfig {
  model: string;
  apiKey?: string;
  baseUrl?: string;
  reasoningLevel: 'low' | 'medium' | 'high';
  maxTokens: number;
  temperature: number;
  defaultRecipeCount: number;
}

// Default AI Configuration
// Users can modify these settings as needed
export const DEFAULT_AI_CONFIG: AIServiceConfig = {
  // OpenAI gpt-oss-120b model from HuggingFace
  model: 'openai/gpt-oss-120b',
  
  // HuggingFace API Key - set this for better rate limits and performance
  // Get your free API key at: https://huggingface.co/settings/tokens
  // Leave empty to use the free tier (limited requests)
  apiKey: process.env.EXPO_PUBLIC_HUGGINGFACE_API_KEY || '',
  
  // Custom endpoint URL (optional) - leave empty to use HuggingFace
  // You can set this to a local vLLM server if you're running the model locally
  baseUrl: '',
  
  // Reasoning level for the model ('low', 'medium', 'high')
  // Higher levels provide more detailed thinking but take longer
  reasoningLevel: 'medium',
  
  // Maximum tokens for the AI response
  maxTokens: 4096,
  
  // Temperature for creativity (0.0 = deterministic, 1.0 = very creative)
  temperature: 0.7,
  
  // Default number of recipes to generate
  defaultRecipeCount: 2
};

// Default recipe preferences for first-time users
export const DEFAULT_RECIPE_PREFERENCES: Partial<AIRecipePreferences> = {
  dietaryRestrictions: [],
  cookingStyles: ['healthy', 'quick'],
  maxCookingTime: 45,
  skillLevel: 'intermediate',
  servingSize: 4,
  avoidIngredients: [],
  preferredCuisines: [],
  nutritionFocus: 'balanced'
};

// Helper function to validate API configuration
export function validateAIConfig(config: Partial<AIServiceConfig>): {
  isValid: boolean;
  warnings: string[];
  recommendations: string[];
} {
  const warnings: string[] = [];
  const recommendations: string[] = [];
  
  if (!config.apiKey) {
    warnings.push('No HuggingFace API key provided - using free tier with limited requests');
    recommendations.push('Get a free API key at https://huggingface.co/settings/tokens for better performance');
  }
  
  if (config.temperature && (config.temperature < 0 || config.temperature > 1)) {
    warnings.push('Temperature should be between 0.0 and 1.0');
  }
  
  if (config.maxTokens && config.maxTokens > 4096) {
    warnings.push('Very high token limit may cause slow responses');
  }
  
  if (config.reasoningLevel === 'high') {
    recommendations.push('High reasoning level provides better results but slower responses');
  }
  
  return {
    isValid: warnings.filter(w => w.includes('should be')).length === 0,
    warnings,
    recommendations
  };
}

// Instructions for setup (displayed in console on first run)
export const SETUP_INSTRUCTIONS = `
🤖 AI Recipe Generation Setup Instructions:

1. GET A FREE HUGGINGFACE API KEY (Recommended):
   • Visit: https://huggingface.co/settings/tokens
   • Create a new token with "Read" permissions
   • Copy the token and paste it in services/aiConfig.ts as the apiKey value

2. CONFIGURE INFERENCE PROVIDERS (Optional):
   • Visit: https://hf.co/settings/inference-providers
   • Reorder providers to prioritize those that support gpt-oss models
   • Recommended providers: HF Inference, Together, Fireworks, Groq

3. ALTERNATIVE: LOCAL MODEL SETUP (Advanced):
   • Install vLLM: pip install vllm
   • Run: vllm serve openai/gpt-oss-120b
   • Set baseUrl in aiConfig.ts to your local server URL

4. QUICK START:
   • The app works out-of-the-box with free tier (limited requests)
   • Add ingredients to your pantry
   • Navigate to Recipes → AI Recipe (Pantry Fusion)

5. CUSTOMIZATION:
   • Modify reasoning level, temperature, and other settings in aiConfig.ts
   • Adjust default preferences to match your cooking style

6. TROUBLESHOOTING:
   • If you see "provider not supported" errors, get an API key (step 1)
   • Check your internet connection
   • Try again in a few minutes if servers are busy

Enjoy your AI-powered cooking assistant! 🍳✨
`;

// Function to log setup instructions on first run
export function logSetupInstructions() {
  console.log(SETUP_INSTRUCTIONS);
} 
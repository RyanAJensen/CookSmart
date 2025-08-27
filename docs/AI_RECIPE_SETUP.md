# 🤖 AI Recipe Generation Setup Guide

Your CookSmart app now includes powerful AI recipe generation using OpenAI's gpt-oss-120b model! This guide will help you get started.

## 🚀 Quick Start

The AI functionality works out-of-the-box with basic features:

1. **Add Ingredients**: Go to the Pantry tab and add your available ingredients
2. **Generate Recipes**: Navigate to Recipes → "AI Recipe (Pantry Fusion)"
3. **Enjoy**: Get creative, personalized recipes based on what you have!

## 🔧 Enhanced Setup (Recommended)

For better performance and unlimited usage, set up a free HuggingFace API key:

### Step 1: Get a Free HuggingFace API Key
1. Visit [HuggingFace Settings](https://huggingface.co/settings/tokens)
2. Create a new token with "Read" permissions
3. Copy the token

### Step 2: Configure the App
1. Open `services/aiConfig.ts` in your project
2. Replace the empty `apiKey: ''` with your token:
   ```typescript
   apiKey: 'hf_your_token_here',
   ```
3. Save the file and restart the app

## 🎛️ Customization Options

You can customize the AI behavior in `services/aiConfig.ts`:

### Model Settings
- **reasoningLevel**: `'low'` | `'medium'` | `'high'` - Controls thinking depth
- **temperature**: `0.0` (consistent) to `1.0` (creative) - Controls creativity
- **maxTokens**: Maximum response length
- **defaultRecipeCount**: How many recipes to generate

### Recipe Preferences
Modify `DEFAULT_RECIPE_PREFERENCES` to set your default cooking style:
- **skillLevel**: `'beginner'` | `'intermediate'` | `'advanced'`
- **maxCookingTime**: Maximum minutes you want to spend cooking
- **nutritionFocus**: `'balanced'` | `'low-calorie'` | `'high-protein'` | `'low-carb'`
- **preferredCuisines**: Array of cuisine types you enjoy

## 🖥️ Advanced: Local Model Setup

For maximum performance and privacy, run the model locally:

### Requirements
- Python 3.8+
- NVIDIA GPU with 24GB+ VRAM (for gpt-oss-120b)
- OR CPU with 64GB+ RAM

### Setup Steps
1. Install vLLM:
   ```bash
   pip install vllm
   ```

2. Start the model server:
   ```bash
   vllm serve openai/gpt-oss-120b
   ```

3. Update `services/aiConfig.ts`:
   ```typescript
   baseUrl: 'http://localhost:8000',
   apiKey: 'local', // Any value for local setup
   ```

## 🎯 Tips for Best Results

### For Better Recipes:
- Be specific with ingredient amounts in your pantry
- Include basic pantry staples (salt, pepper, oil, etc.)
- Try different reasoning levels for various complexity needs

### For Faster Generation:
- Use `reasoningLevel: 'low'` for quick suggestions
- Reduce `maxTokens` if you want shorter recipes
- Set up a local model if you generate recipes frequently

## 🔍 Troubleshooting

### Common Issues:

**"No AI recipes generated"**
- Check your internet connection
- Verify your API key is correct
- Try with fewer ingredients initially

**"Rate limit exceeded"**
- Get a HuggingFace API key for higher limits
- Wait a few minutes between requests on free tier

**"Model error"**
- The HuggingFace servers might be busy - try again later
- Check the HuggingFace status page

### Getting Help:
- Check the browser/app console for detailed error messages
- Verify your configuration in `services/aiConfig.ts`
- Try the test function: `testRecipeGeneration()` in the console

## 🌟 Features

### What the AI Can Do:
- ✅ Generate creative recipes from your pantry ingredients
- ✅ Respect dietary restrictions and preferences
- ✅ Provide nutritional information estimates
- ✅ Suggest additional ingredients if needed
- ✅ Create recipes for different skill levels
- ✅ Generate cuisine-specific dishes

### Model Capabilities:
- **Reasoning**: Full chain-of-thought thinking process
- **Function Calling**: Can suggest cooking techniques and tools
- **Structured Output**: Returns properly formatted recipe data
- **Multilingual**: Can generate recipes in different languages

## 🔮 Future Enhancements

Coming soon:
- Recipe image generation
- Meal planning with AI
- Nutritional goal optimization
- Shopping list generation
- Voice-activated recipe generation

---

## 📚 About the Model

This integration uses [OpenAI's gpt-oss-120b](https://huggingface.co/openai/gpt-oss-120b), a powerful open-weight model designed for reasoning and agentic tasks. It features:

- 117B parameters with 5.1B active parameters
- Native MXFP4 quantization for efficiency
- Apache 2.0 license for commercial use
- Configurable reasoning levels
- Advanced function calling capabilities

Enjoy your AI-powered cooking assistant! 🍳✨ 
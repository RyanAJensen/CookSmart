# API Key Setup Instructions

## Required for AI Recipe Generation

To use the AI recipe generation feature, you need to set up a Hugging Face API key.

### Step 1: Get Your Hugging Face API Key

1. Go to [Hugging Face Settings](https://huggingface.co/settings/tokens)
2. Click "New token"
3. Give it a name (e.g., "CookSmart App")
4. Select "Read" permissions
5. Click "Generate a token"
6. Copy the token (starts with `hf_`)

### Step 2: Create Environment File

Create a `.env` file in the project root with:

```bash
# Hugging Face API Key for AI recipe generation
EXPO_PUBLIC_HUGGINGFACE_API_KEY=your_hugging_face_token_here
```

Replace `your_hugging_face_token_here` with your actual token.

### Step 3: Restart the App

After adding the API key:
1. Stop the development server
2. Run `npx expo start --clear` to restart with new environment variables

## Security Notes

- The `.env` file is ignored by git and won't be committed
- Never commit API keys to version control
- The `EXPO_PUBLIC_` prefix makes the key available in the app
- Keep your API keys secure and don't share them

## Alternative: Free Tier

If you don't want to set up an API key, the app will use Hugging Face's free tier with limited requests.

## Getting Started

1. Follow the steps above to get your own Hugging Face API key
2. Add it to your `.env` file
3. Restart the development server

The AI recipe generation will work once you have a valid API key configured. 
#!/bin/bash

# Setup Environment Variables for CookSmart
echo "Setting up environment variables for CookSmart..."

# Check if .env already exists
if [ -f ".env" ]; then
    echo "⚠️  .env file already exists!"
    read -p "Do you want to overwrite it? (y/n): " -n 1 -r
    echo
    if [[ ! $REPO_REPLY =~ ^[Yy]$ ]]; then
        echo "Setup cancelled."
        exit 1
    fi
fi

# Create .env file
cat > .env << EOL
# Hugging Face API Key for AI recipe generation
# Get your free API key at: https://huggingface.co/settings/tokens
EXPO_PUBLIC_HUGGINGFACE_API_KEY=

# Other API keys (uncomment and add if needed)
# EXPO_PUBLIC_OPENAI_API_KEY=
# EXPO_PUBLIC_SPOONACULAR_API_KEY=
# EXPO_PUBLIC_EDAMAM_APP_ID=
# EXPO_PUBLIC_EDAMAM_APP_KEY=
EOL

echo "✅ Created .env file!"
echo ""
echo "📝 Next steps:"
echo "1. Get your Hugging Face API key from: https://huggingface.co/settings/tokens"
echo "2. Edit .env file and add your API key"
echo "3. Run 'npx expo start --clear' to restart with new environment variables"
echo ""
echo "🔒 The .env file is ignored by git for security." 
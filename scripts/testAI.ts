import { testRecipeGeneration } from '../services/aiRecipes';

// Simple test script for AI recipe generation
async function runAITest() {
  console.log('🧪 Testing AI Recipe Generation...');
  console.log('=====================================');
  
  try {
    await testRecipeGeneration();
    console.log('✅ AI Recipe Generation test completed successfully!');
  } catch (error) {
    console.error('❌ AI Recipe Generation test failed:', error);
  }
}

// Only run if this file is executed directly
if (require.main === module) {
  runAITest();
}

export { runAITest }; 
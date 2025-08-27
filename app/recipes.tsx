import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, RefreshControl } from 'react-native';
import { Text, Card, Button, IconButton, ActivityIndicator, useTheme } from 'react-native-paper';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { searchStoredRecipesOnly, searchOnlineRecipes } from '../services/recipes';
import { getAllRecipes, getRecipeCount } from '../services/recipeStorage';
import { getIngredients } from '../services/storage';
import { generateAIRecipesFromPantry } from '../services/aiRecipes';
import { Recipe } from '../types';
import { useFocusEffect } from '@react-navigation/native';
import CookSmartLogo from '../components/CookSmartLogo';
import AsyncStorage from '@react-native-async-storage/async-storage';

function safeParseJSON(data: any) {
  if (typeof data === 'string') {
    try {
      return JSON.parse(data);
    } catch (e) {
      return [];
    }
  }
  return data || [];
}

function renderField(field: any, styles: any) {
  if (!field || field.length === 0) {
    return (
      <Text variant="bodyMedium" style={[styles.emptyFieldText, { color: styles.theme.colors.onSurfaceVariant }]}>
        No information available
      </Text>
    );
  }

  return field.map((item: any, index: number) => (
    <Text key={index} variant="bodyMedium" style={[styles.fieldText, { color: styles.theme.colors.onSurface }]}>
      • {typeof item === 'string' ? item : `${item.name || item}${item.amount ? `: ${item.amount}` : ''}${item.unit ? ` ${item.unit}` : ''}`}
    </Text>
  ));
}

export default function RecipesScreen() {
  const router = useRouter();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [ingredients, setIngredients] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generationStatus, setGenerationStatus] = useState('');
  const [isScraping, setIsScraping] = useState(false);
  const [recipeCount, setRecipeCount] = useState(0);
  const [showSearchPrompt, setShowSearchPrompt] = useState(false);
  
  // Simple AI Recipe caching - user controlled with persistence
  const [cachedAIRecipes, setCachedAIRecipes] = useState<Recipe[]>([]);
  
  // Load cached AI recipes from storage on mount
  useEffect(() => {
    loadCachedAIRecipes();
  }, []);
  
  const loadCachedAIRecipes = async () => {
    try {
      const cachedData = await AsyncStorage.getItem('cached_ai_recipes');
      if (cachedData) {
        const recipes = JSON.parse(cachedData);
        console.log('📱 Loaded', recipes.length, 'cached AI recipes from storage');
        setCachedAIRecipes(recipes);
      }
    } catch (error) {
      console.error('Error loading cached AI recipes:', error);
    }
  };
  
  const saveCachedAIRecipes = async (recipes: Recipe[]) => {
    try {
      await AsyncStorage.setItem('cached_ai_recipes', JSON.stringify(recipes));
      console.log('💾 Saved', recipes.length, 'AI recipes to persistent storage');
      setCachedAIRecipes(recipes);
    } catch (error) {
      console.error('Error saving cached AI recipes:', error);
      setCachedAIRecipes(recipes); // Still set in memory even if storage fails
    }
  };
  
  const clearCachedAIRecipes = async () => {
    try {
      await AsyncStorage.removeItem('cached_ai_recipes');
      console.log('🗑️ Cleared cached AI recipes from storage');
      setCachedAIRecipes([]);
    } catch (error) {
      console.error('Error clearing cached AI recipes:', error);
      setCachedAIRecipes([]); // Still clear in memory
    }
  };
  const { mode: rawMode } = useLocalSearchParams<{ mode: string }>();
  const mode = (rawMode as string) || 'partial';
  const isAIMode = mode === 'ai';
  const isStrictMode = mode === 'strict';
  const theme = useTheme();

  useFocusEffect(
    React.useCallback(() => {
      loadRecipes();
    }, [mode])
  );

  const loadRecipes = async () => {
    try {
      console.log('Loading recipes...');
      console.log('Current cached AI recipes count:', cachedAIRecipes.length);
      console.log('Is AI mode:', isAIMode);
      setIsLoading(true);
      setError(null);
      setGenerationStatus('');
      setShowSearchPrompt(false);
      
      // Load recipe count
      const count = await getRecipeCount();
      setRecipeCount(count);
      
      let savedIngredients = await getIngredients();
      console.log('DEBUG: savedIngredients directly from getIngredients():', savedIngredients);

      // Ensure savedIngredients is always an array
      if (!Array.isArray(savedIngredients)) {
        console.log('DEBUG: savedIngredients is not an array, converting to empty array.');
        savedIngredients = [];
      }
      console.log('DEBUG: savedIngredients after array check:', savedIngredients);
      setIngredients(savedIngredients);

      if (isAIMode) {
        // AI mode - show cached recipes or empty state
        if (savedIngredients.length > 0) {
          if (cachedAIRecipes.length > 0) {
            // Show cached recipes
            console.log('✅ Using cached AI recipes:', cachedAIRecipes.length, 'recipes');
            console.log('Cached recipe titles:', cachedAIRecipes.map(r => r.title));
            setRecipes(cachedAIRecipes);
            setGenerationStatus('📋 AI recipes from your pantry ingredients');
            // Clear status after 2 seconds
            setTimeout(() => setGenerationStatus(''), 2000);
          } else {
            // No cached recipes - show empty state with generate button
            console.log('❌ No cached AI recipes found, showing empty state');
            setRecipes([]);
            setGenerationStatus('Ready to generate AI recipes from your pantry ingredients!');
          }
        } else {
          // No ingredients - clear cache
          console.log('🗑️ No ingredients found, clearing AI recipe cache');
          await clearCachedAIRecipes();
          setRecipes([]);
          setGenerationStatus('Add ingredients to your pantry to generate AI recipes!');
        }
      } else if (savedIngredients.length > 0) {
        const ingredientNames = savedIngredients.map((ing: any) => ing.name);
        console.log('Searching recipes with ingredients:', ingredientNames);
        
        // Only search stored recipes by default (no online search)
        const foundRecipes = await searchStoredRecipesOnly(ingredientNames, isStrictMode);
        console.log('Found recipes:', foundRecipes);
        setRecipes(foundRecipes);
        
        // Show search prompt if we have few recipes
        if (foundRecipes.length < 3) {
          setShowSearchPrompt(true);
        }
      } else {
        // If no ingredients, show all available recipes
        const allRecipes = await getAllRecipes();
        if (allRecipes.length > 0) {
          setRecipes(allRecipes.slice(0, 20)); // Show first 20 recipes
        } else {
          // If no recipes in database, show sample recipes
          const sampleRecipes = await searchStoredRecipesOnly([], false);
          setRecipes(sampleRecipes);
        }
      }
    } catch (error) {
      console.error('Error loading recipes:', error);
      setError('Failed to load recipes. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setIsRefreshing(true);
    await loadRecipes();
    setIsRefreshing(false);
  };

  const handleSearchWebRecipes = async () => {
    if (ingredients.length === 0) {
      setError('Add ingredients to your pantry first to search for recipes.');
      return;
    }

    try {
      setIsScraping(true);
      setGenerationStatus('Searching the web for recipes...');
      setError(null);
      
      const ingredientNames = ingredients.map((ing: any) => ing.name);
      
      // Search the web for recipes based on ingredients
      const webRecipes = await searchOnlineRecipes(ingredientNames, isStrictMode, 30);
      
      setRecipes(webRecipes);
      setIsScraping(false);
      setGenerationStatus('');
      setShowSearchPrompt(false);
      
    } catch (error) {
      console.error('Error searching web recipes:', error);
      setError('Failed to search web recipes. Please try again.');
      setIsScraping(false);
      setGenerationStatus('');
    }
  };

  const handleGenerateAIRecipes = async () => {
    if (ingredients.length === 0) {
      setError('Add ingredients to your pantry first to generate AI recipes.');
      return;
    }

    try {
      setIsScraping(true);
      setGenerationStatus('🤖 Generating AI recipes from your pantry...');
      setError(null);
      
      console.log('Generating AI recipes with ingredients:', ingredients);
      const aiRecipes = await generateAIRecipesFromPantry(ingredients, 3);
      console.log('AI recipes generated:', aiRecipes);
      
      // Cache the recipes persistently
      console.log('💾 Caching', aiRecipes.length, 'AI recipes');
      await saveCachedAIRecipes(aiRecipes);
      
      setRecipes(aiRecipes);
      setIsScraping(false);
      setGenerationStatus('✨ AI recipes generated successfully!');
      setShowSearchPrompt(false);
      // Clear success status after 2 seconds
      setTimeout(() => setGenerationStatus(''), 2000);
      
    } catch (error) {
      console.error('Error generating AI recipes:', error);
      setError('Failed to generate AI recipes. Please check your internet connection and try again.');
      setIsScraping(false);
      setGenerationStatus('');
    }
  };

  const renderRecipe = (recipe: Recipe) => {
    const ingredients = safeParseJSON(recipe.ingredients);
    const instructions = safeParseJSON(recipe.instructions);
    
    // Check if this is the coming soon recipe
    const isComingSoon = (recipe as any).isComingSoon;
    
    // Only mark as fallback/generated if it's NOT a built-in sample recipe
    const isBuiltInSample = recipe.id.startsWith('sample_');
    const isFallback = !isBuiltInSample && recipe.tags && recipe.tags.includes('fallback');
    const isGenerated = !isBuiltInSample && recipe.tags && recipe.tags.includes('generated');
    const isScraped = recipe.tags && recipe.tags.includes('scraped');
    const isAIGenerated = recipe.tags && recipe.tags.includes('ai-generated');

    return (
      <Card 
        key={recipe.id} 
        style={[
          styles.recipeCard, 
          { backgroundColor: theme.colors.surface },
          isComingSoon && styles.comingSoonCard,
          (isFallback || isGenerated) && styles.fallbackCard
        ]} 
        mode="outlined" 
        onPress={() => router.push({ pathname: '/recipe-detail', params: { recipe: JSON.stringify(recipe) } })}
      >
        <Card.Content>
          <View style={styles.recipeHeader}>
            <Text variant="titleMedium" style={[
              styles.recipeTitle, 
              { color: theme.colors.onSurface },
              isComingSoon && styles.comingSoonTitle
            ]}>
              {recipe.title}
            </Text>
            {recipe.matchScore !== undefined && !isComingSoon && (
              <View style={[styles.confidenceContainer, { backgroundColor: theme.colors.primary }]}>
                <Text style={[styles.confidenceText, { color: theme.colors.onPrimary }]}>
                  Match: {Math.round(recipe.matchScore)}%
                </Text>
              </View>
            )}
            {(recipe as any).confidenceScore !== undefined && isAIGenerated && (
              <View style={[styles.confidenceContainer, { backgroundColor: theme.colors.primary }]}>
                <Text style={[styles.confidenceText, { color: theme.colors.onPrimary }]}>
                  AI Score: {Math.round((recipe as any).confidenceScore)}%
                </Text>
              </View>
            )}
            {isScraped && (
              <View style={[styles.confidenceContainer, { backgroundColor: theme.colors.secondary }]}>
                <Text style={[styles.confidenceText, { color: theme.colors.onPrimary }]}>
                  Found Online
                </Text>
              </View>
            )}
            {isAIGenerated && (
              <View style={[styles.confidenceContainer, { backgroundColor: '#9C27B0' }]}>
                <Text style={[styles.confidenceText, { color: '#FFFFFF' }]}>
                  🤖 AI Recipe
                </Text>
              </View>
            )}
            {(isFallback || isGenerated) && !isAIGenerated && (
              <View style={[styles.confidenceContainer, { backgroundColor: theme.colors.tertiary }]}>
                <Text style={[styles.confidenceText, { color: theme.colors.onPrimary }]}>
                  Generated
                </Text>
              </View>
            )}
          </View>
          
          {!isComingSoon && (
            <>
              <View style={styles.recipeInfo}>
                <Text variant="bodyMedium" style={[styles.recipeDetail, { color: theme.colors.onSurfaceVariant }]}>
                  {recipe.readyInMinutes} mins
                </Text>
                <Text variant="bodyMedium" style={[styles.recipeDetail, { color: theme.colors.onSurfaceVariant }]}>
                  {recipe.servings} servings
                </Text>
              </View>
              {recipe.calories && (
                <View style={[styles.recipeNutrition, { backgroundColor: theme.colors.surfaceVariant }]}>
                  <Text variant="bodyMedium" style={[styles.nutritionText, { color: theme.colors.onSurfaceVariant }]}>
                    Calories: {recipe.calories}
                  </Text>
                  <Text variant="bodyMedium" style={[styles.nutritionText, { color: theme.colors.onSurfaceVariant }]}>
                    Protein: {recipe.protein || 0}g
                  </Text>
                  <Text variant="bodyMedium" style={[styles.nutritionText, { color: theme.colors.onSurfaceVariant }]}>
                    Carbs: {recipe.carbs || 0}g
                  </Text>
                  <Text variant="bodyMedium" style={[styles.nutritionText, { color: theme.colors.onSurfaceVariant }]}>
                    Fat: {recipe.fat || 0}g
                  </Text>
                </View>
              )}
              <View style={styles.recipeIngredients}>
                <Text variant="bodyMedium" style={[styles.ingredientsTitle, { color: theme.colors.onSurface }]}>
                  Ingredients:
                </Text>
                {renderField(ingredients, { ...styles, theme })}
              </View>
            </>
          )}
          
          <View style={[styles.viewRecipeContainer, { borderTopColor: theme.colors.outline }]}>
            <Text variant="bodyMedium" style={[styles.viewRecipeText, { color: theme.colors.primary }]}>
              {isComingSoon ? 'Tap to learn more' : 'Tap to view full recipe'}
            </Text>
            <IconButton
              icon="chevron-right"
              size={16}
              iconColor={theme.colors.primary}
              style={styles.viewRecipeIcon}
            />
          </View>
          
          {!isComingSoon && (
            <>
              <View style={{ marginTop: 12 }}>
                <Text variant="bodyMedium" style={[styles.ingredientsTitle, { color: theme.colors.onSurface }]}>
                  Instructions:
                </Text>
                {renderField(instructions, { ...styles, theme })}
              </View>
              {recipe.missingIngredients && recipe.missingIngredients.length > 0 && (
                <View style={[styles.missingIngredientsContainer, { borderTopColor: theme.colors.outline }]}>
                  <Text variant="bodyMedium" style={[styles.missingIngredientsTitle, { color: theme.colors.error }]}>
                    Missing Ingredients:
                  </Text>
                  {recipe.missingIngredients.map((item, idx) => (
                    <Text key={idx} variant="bodyMedium" style={[styles.missingIngredientText, { color: theme.colors.error }]}>
                      • {item.name}{item.amount ? `: ${item.amount}` : ''}{item.unit ? ` ${item.unit}` : ''}
                    </Text>
                  ))}
                </View>
              )}
            </>
          )}
        </Card.Content>
      </Card>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={[styles.header, { backgroundColor: theme.colors.surface }]}>
        <View style={styles.backButtonContainer}>
          <IconButton
            icon="arrow-left"
            size={24}
            iconColor={theme.colors.onSurface}
            onPress={() => router.back()}
            style={styles.backButton}
          />
        </View>
        <View style={styles.titleContainer}>
          <CookSmartLogo size="small" variant="icon" style={styles.headerLogo} />
          <Text 
            variant="titleLarge" 
            style={[styles.centeredTitle, { color: theme.colors.onSurface }]}
          >
            {isStrictMode
              ? 'All Ingredients'
              : isAIMode
              ? 'AI Recipes'
              : 'Some Ingredients'}
          </Text>
        </View>
        {isAIMode && (
          <View style={styles.rightButtonContainer}>
            <IconButton
              icon="refresh"
              size={24}
              iconColor={theme.colors.onSurface}
              onPress={onRefresh}
              style={styles.refreshButton}
            />
          </View>
        )}
      </View>

      <ScrollView 
        style={[styles.content, { backgroundColor: theme.colors.background }]}
        contentContainerStyle={styles.contentContainer}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            colors={[theme.colors.primary]}
            tintColor={theme.colors.primary}
          />
        }
      >
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
            <Text variant="bodyLarge" style={[styles.loadingText, { color: theme.colors.onSurface }]}>
              Loading recipes...
            </Text>
          </View>
        ) : isScraping ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
            <Text variant="bodyLarge" style={[styles.loadingText, { color: theme.colors.onSurface }]}>
              {generationStatus || 'Searching the web...'}
            </Text>
          </View>
        ) : error ? (
          <View style={styles.emptyState}>
            <Text variant="bodyLarge" style={[styles.errorText, { color: theme.colors.error }]}>
              {error}
            </Text>
            <Button
              mode="contained"
              onPress={loadRecipes}
              style={styles.retryButton}
            >
              Try Again
            </Button>
          </View>
        ) : recipes.length > 0 ? (
          <>
            {generationStatus && (
              <View style={[styles.statusContainer, { backgroundColor: theme.colors.surfaceVariant }]}>
                <Text variant="bodyMedium" style={[styles.statusText, { color: theme.colors.onSurfaceVariant }]}>
                  {generationStatus}
                </Text>
              </View>
            )}
            
            {/* AI Recipe Generation Button */}
            {isAIMode && ingredients.length > 0 && (
              <View style={[styles.generateButtonContainer, { backgroundColor: theme.colors.surface }]}>
                <Button
                  mode="contained"
                  onPress={handleGenerateAIRecipes}
                  style={[styles.generateButton, { backgroundColor: theme.colors.primary }]}
                  icon="robot"
                  loading={isScraping}
                  disabled={isScraping}
                >
                  {cachedAIRecipes.length > 0 ? 'Regenerate with Current Ingredients' : 'Generate AI Recipes'}
                </Button>
              </View>
            )}
            
            {recipes.map(renderRecipe)}
            
            {/* Search prompt when few recipes found */}
            {showSearchPrompt && (
              <Card style={[styles.searchPromptCard, { backgroundColor: theme.colors.surfaceVariant }]}>
                <Card.Content>
                  <Text variant="titleMedium" style={[styles.searchPromptTitle, { color: theme.colors.onSurfaceVariant }]}>
                    {isAIMode ? 'Want different recipes?' : 'Want more recipes?'}
                  </Text>
                  <Text variant="bodyMedium" style={[styles.searchPromptText, { color: theme.colors.onSurfaceVariant }]}>
                    {isAIMode 
                      ? `We generated ${recipes.length} AI recipes with your pantry ingredients. Generate new creative recipes using the same ingredients.`
                      : `We found ${recipes.length} recipes with your ingredients. Search the web for more recipes based on your pantry ingredients.`
                    }
                  </Text>
                  <Button
                    mode="contained"
                    onPress={isAIMode ? handleGenerateAIRecipes : handleSearchWebRecipes}
                    style={styles.searchPromptButton}
                    icon={isAIMode ? "robot" : "search-web"}
                  >
                    {isAIMode ? 'Generate AI Recipes' : 'Search Web'}
                  </Button>
                </Card.Content>
              </Card>
            )}
          </>
        ) : (
          <View style={styles.emptyState}>
            <Text 
              variant="bodyLarge" 
              style={[styles.emptyStateText, { color: theme.colors.onSurface }]}
            >
              {ingredients.length === 0 ? 'No recipes available' : (isAIMode ? 'No AI recipes generated' : 'No recipes found')}
            </Text>
            <Text 
              variant="bodyMedium" 
              style={[styles.emptyStateSubtext, { color: theme.colors.onSurfaceVariant }]}
            >
              {ingredients.length === 0 
                ? 'Add ingredients to your pantry to find matching recipes'
                : (isAIMode 
                  ? 'Generate AI-powered recipes using your pantry ingredients'
                  : 'Search the web for recipes based on your ingredients'
                )
              }
            </Text>
            {ingredients.length > 0 && (
              <Button
                mode="contained"
                onPress={isAIMode ? handleGenerateAIRecipes : handleSearchWebRecipes}
                style={styles.emptyStateButton}
                icon={isAIMode ? "robot" : "search-web"}
              >
                {isAIMode ? 'Generate AI Recipes' : 'Search Web'}
              </Button>
            )}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    paddingTop: 60,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    minHeight: 100,
    position: 'relative',
  },
  backButtonContainer: {
    position: 'absolute',
    left: 16,
    top: 60,
    zIndex: 1,
  },
  backButton: {
    margin: 0,
    backgroundColor: 'transparent',
  },
  title: {
    flex: 1,
    textAlign: 'center',
    fontWeight: '700',
    paddingLeft: 80,
    paddingRight: 20,
  },
  titleContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  headerLogo: {
    marginRight: 4,
  },
  centeredTitle: {
    textAlign: 'center',
    fontWeight: '700',
  },
  rightButtonContainer: {
    position: 'absolute',
    right: 8,
    top: 60,
    zIndex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  refreshButton: {
    marginLeft: 8,
    backgroundColor: 'transparent',
  },
  settingsButton: {
    marginRight: 4,
    backgroundColor: 'transparent',
  },
  aiTestButton: {
    marginRight: 8,
    backgroundColor: 'transparent',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
  },
  recipeCard: {
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    transform: [{ scale: 1 }],
  },
  comingSoonCard: {
    borderColor: '#1976D2',
    borderWidth: 2,
  },
  fallbackCard: {
    borderColor: '#FF9800',
    borderWidth: 2,
  },
  recipeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  recipeTitle: {
    flex: 1,
    fontWeight: '600',
    marginRight: 8,
  },
  comingSoonTitle: {
    fontWeight: '700',
  },
  confidenceContainer: {
    borderRadius: 12,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  confidenceText: {
    fontWeight: 'bold',
    fontSize: 12,
  },
  recipeInfo: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  recipeDetail: {
    marginRight: 16,
  },
  recipeNutrition: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  nutritionText: {
  },
  recipeIngredients: {
    marginTop: 8,
  },
  ingredientsTitle: {
    fontWeight: '600',
    marginBottom: 8,
  },
  ingredientText: {
    marginBottom: 4,
  },
  ingredientInPantry: {
    fontWeight: '500',
  },
  missingIngredientsContainer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
  },
  missingIngredientsTitle: {
    fontWeight: '600',
    marginBottom: 8,
  },
  missingIngredientText: {
    marginBottom: 4,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  emptyStateText: {
    marginBottom: 8,
    textAlign: 'center',
    fontWeight: '600',
  },
  emptyStateSubtext: {
    textAlign: 'center',
    fontWeight: '500',
    marginBottom: 16,
  },
  emptyStateButtons: {
    flexDirection: 'row',
    gap: 12,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  emptyStateButton: {
    minWidth: 140,
  },
  aiIconContainer: {
    marginBottom: 24,
  },
  aiIcon: {
    borderRadius: 50,
  },
  viewRecipeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
  },
  viewRecipeText: {
    fontWeight: '500',
  },
  viewRecipeIcon: {
    margin: 0,
    backgroundColor: 'transparent',
  },
  downloadButton: {
    marginTop: 16,
  },
  downloadPromptCard: {
    marginTop: 16,
    marginBottom: 8,
  },
  downloadPromptTitle: {
    fontWeight: '600',
    marginBottom: 8,
  },
  downloadPromptText: {
    marginBottom: 16,
    lineHeight: 20,
  },
  downloadPromptButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  downloadPromptButton: {
    flex: 1,
  },
  searchPromptCard: {
    marginTop: 16,
    marginBottom: 8,
  },
  searchPromptTitle: {
    fontWeight: '600',
    marginBottom: 8,
  },
  searchPromptText: {
    marginBottom: 16,
    lineHeight: 20,
  },
  searchPromptButton: {
    width: '100%',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  loadingText: {
    marginTop: 16,
  },
  errorText: {
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    width: '100%',
  },
  statusContainer: {
    backgroundColor: '#f0f0f0',
    padding: 12,
    marginBottom: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  statusText: {
    textAlign: 'center',
    fontWeight: '500',
  },
  generateButtonContainer: {
    padding: 16,
    marginBottom: 12,
    borderRadius: 8,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  generateButton: {
    borderRadius: 8,
  },
}); 
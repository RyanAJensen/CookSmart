import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { Text, Card, IconButton, useTheme } from 'react-native-paper';
import { getIngredients } from '../services/storage';
import { searchRecipes } from '../services/recipes';
import { Ingredient, Recipe } from '../types';
import { router, useLocalSearchParams } from 'expo-router';
import { generateAIRecipesFromPantry } from '../services/aiRecipes';
import { useFocusEffect } from '@react-navigation/native';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorDisplay from '../components/ErrorDisplay';

function safeParseJSON(data: any) {
  if (typeof data === 'string') {
    try {
      const parsed = JSON.parse(data);
      return parsed;
    } catch {
      return data;
    }
  }
  return data;
}

function renderField(field: any, styles: any) {
  if (Array.isArray(field) && field.length > 0) {
    return field.map((item, idx) => {
      if (typeof item === 'object' && item !== null && 'name' in item) {
        // Nicely format ingredient objects
        return (
          <Text key={idx} variant="bodyMedium" style={styles.ingredientText}>
            • {item.name}{item.amount ? `: ${item.amount}` : ''}{item.unit ? ` ${item.unit}` : ''}
          </Text>
        );
      }
      return (
        <Text key={idx} variant="bodyMedium" style={styles.ingredientText}>
          {typeof item === 'object' ? JSON.stringify(item) : String(item)}
        </Text>
      );
    });
  } else if (typeof field === 'object' && field !== null) {
    return (
      <Text variant="bodyMedium" style={styles.ingredientText}>
        {JSON.stringify(field)}
      </Text>
    );
  } else if (typeof field === 'string') {
    return (
      <Text variant="bodyMedium" style={styles.ingredientText}>
        {field}
      </Text>
    );
  } else {
    return null;
  }
}

export default function RecipesScreen() {
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generationStatus, setGenerationStatus] = useState<string>('');
  const { mode } = useLocalSearchParams<{ mode: 'strict' | 'partial' | 'ai' }>();
  const theme = useTheme();

  useFocusEffect(
    React.useCallback(() => {
      loadRecipes();
    }, [mode])
  );

  const loadRecipes = async () => {
    try {
      console.log('Loading recipes...');
      setIsLoading(true);
      setError(null);
      setGenerationStatus('');
      
      let savedIngredients = await getIngredients();
      console.log('DEBUG: savedIngredients directly from getIngredients():', savedIngredients);

      // Ensure savedIngredients is always an array
      if (!Array.isArray(savedIngredients)) {
        console.log('DEBUG: savedIngredients is not an array, converting to empty array.');
        savedIngredients = [];
      }
      console.log('DEBUG: savedIngredients after array check:', savedIngredients);
      setIngredients(savedIngredients);

      if (mode === 'ai') {
        // For AI mode, show a placeholder instead of trying to generate recipes
        setRecipes([]);
        setGenerationStatus('');
      } else if (savedIngredients.length > 0) {
        const ingredientNames = savedIngredients.map(ing => ing.name);
        console.log('Searching recipes with ingredients:', ingredientNames);
        const foundRecipes = await searchRecipes(ingredientNames, mode === 'strict');
        console.log('Found recipes:', foundRecipes);
        setRecipes(foundRecipes);
      } else {
        setRecipes([]);
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

  const renderRecipe = (recipe: Recipe) => {
    const ingredients = safeParseJSON(recipe.ingredients);
    const instructions = safeParseJSON(recipe.instructions);
    
    // Check if this is the coming soon recipe
    const isComingSoon = (recipe as any).isComingSoon;

    return (
      <Card key={recipe.id} style={[styles.recipeCard, isComingSoon && styles.comingSoonCard]} mode="outlined" onPress={() => router.push({ pathname: '/recipe-detail', params: { recipe: JSON.stringify(recipe) } })}>
        <Card.Content>
          <View style={styles.recipeHeader}>
            <Text variant="titleMedium" style={[styles.recipeTitle, isComingSoon && styles.comingSoonTitle]}>{recipe.title}</Text>
            {recipe.confidenceScore !== undefined && !isComingSoon && (
              <View style={styles.confidenceContainer}>
                <Text style={styles.confidenceText}>AI Confidence: {recipe.confidenceScore}/100</Text>
              </View>
            )}
          </View>
          
          {!isComingSoon && (
            <>
              <View style={styles.recipeInfo}>
                <Text variant="bodyMedium" style={styles.recipeDetail}>{recipe.readyInMinutes} mins</Text>
                <Text variant="bodyMedium" style={styles.recipeDetail}>{recipe.servings} servings</Text>
              </View>
              {recipe.calories && (
                <View style={styles.recipeNutrition}>
                  <Text variant="bodyMedium" style={styles.nutritionText}>
                    Calories: {recipe.calories}
                  </Text>
                  <Text variant="bodyMedium" style={styles.nutritionText}>
                    Protein: {recipe.protein || 0}g
                  </Text>
                  <Text variant="bodyMedium" style={styles.nutritionText}>
                    Carbs: {recipe.carbs || 0}g
                  </Text>
                  <Text variant="bodyMedium" style={styles.nutritionText}>
                    Fat: {recipe.fat || 0}g
                  </Text>
                </View>
              )}
              <View style={styles.recipeIngredients}>
                <Text variant="bodyMedium" style={styles.ingredientsTitle}>Ingredients:</Text>
                {renderField(ingredients, styles)}
              </View>
            </>
          )}
          
          <View style={styles.viewRecipeContainer}>
            <Text variant="bodyMedium" style={styles.viewRecipeText}>
              {isComingSoon ? 'Tap to learn more' : 'Tap to view full recipe'}
            </Text>
            <IconButton
              icon="chevron-right"
              size={16}
              iconColor="#1976D2"
              style={styles.viewRecipeIcon}
            />
          </View>
          
          {!isComingSoon && (
            <>
              <View style={{ marginTop: 12 }}>
                <Text variant="bodyMedium" style={styles.ingredientsTitle}>Instructions:</Text>
                {renderField(instructions, styles)}
              </View>
              {recipe.missingIngredients && recipe.missingIngredients.length > 0 && (
                <View style={styles.missingIngredientsContainer}>
                  <Text variant="bodyMedium" style={styles.missingIngredientsTitle}>Missing Ingredients:</Text>
                  {recipe.missingIngredients.map((item, idx) => (
                    <Text key={idx} variant="bodyMedium" style={styles.missingIngredientText}>
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
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.backButtonContainer}>
          <IconButton
            icon="arrow-left"
            size={24}
            iconColor="#000000"
            onPress={() => router.back()}
            style={styles.backButton}
          />
        </View>
        <Text 
          variant="headlineMedium" 
          style={styles.centeredTitle}
        >
          {mode === 'strict'
            ? 'Recipes with All Ingredients'
            : mode === 'partial'
            ? 'Recipes with Some Ingredients'
            : 'AI Recipe Generation'}
        </Text>
        {mode !== 'ai' && (
          <View style={styles.rightButtonContainer}>
            <IconButton
              icon="cog"
              size={24}
              iconColor="#000000"
              onPress={() => router.push('/ai-recipe-settings')}
              style={styles.settingsButton}
            />
          </View>
        )}
      </View>

      <ScrollView 
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />
        }
      >
        {isLoading ? (
          <LoadingSpinner />
        ) : error ? (
          <ErrorDisplay message={error} />
        ) : mode === 'ai' ? (
          <View style={styles.emptyState}>
            <View style={styles.aiIconContainer}>
              <IconButton 
                icon="robot" 
                size={64} 
                iconColor="#1976D2"
                style={styles.aiIcon}
              />
            </View>
            <Text 
              variant="headlineSmall" 
              style={styles.comingSoonTitle}
            >
              Coming Soon!
            </Text>
            <Text 
              variant="bodyLarge" 
              style={styles.emptyStateText}
            >
              AI Recipe Generation
            </Text>
            <Text 
              variant="bodyMedium" 
              style={styles.emptyStateSubtext}
            >
              We're working hard to bring you intelligent recipe suggestions powered by artificial intelligence.
            </Text>
            <Text 
              variant="bodyMedium" 
              style={styles.emptyStateSubtext}
            >
              For now, try searching recipes with your pantry ingredients using the "Find Recipes" option.
            </Text>
          </View>
        ) : recipes.length > 0 ? (
          recipes.map(renderRecipe)
        ) : (
          <View style={styles.emptyState}>
            <Text 
              variant="bodyLarge" 
              style={styles.emptyStateText}
            >
              No recipes found
            </Text>
            <Text 
              variant="bodyMedium" 
              style={styles.emptyStateSubtext}
            >
              Try adding more ingredients to your pantry
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    paddingTop: 60,
    backgroundColor: '#FFFFFF',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    minHeight: 100,
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
    color: '#000000',
    fontWeight: '700',
    paddingLeft: 80, // Padding only on left to prevent overlap with back button
    paddingRight: 20, // Minimal padding on right
  },
  centeredTitle: {
    flex: 1,
    textAlign: 'center',
    color: '#000000',
    fontWeight: '700',
    paddingLeft: 0, // No left padding for centered title
    paddingRight: 0, // No right padding for centered title
  },
  rightButtonContainer: {
    position: 'absolute',
    right: 16,
    top: 60,
    zIndex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  refreshButton: {
    marginLeft: 8,
    backgroundColor: 'transparent',
  },
  settingsButton: {
    marginRight: 8,
    backgroundColor: 'transparent',
  },
  aiTestButton: {
    marginRight: 8,
    backgroundColor: 'transparent',
  },
  content: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  contentContainer: {
    padding: 16,
  },
  recipeCard: {
    marginBottom: 12,
    backgroundColor: '#FFFFFF',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    // Add hover effect for better UX
    transform: [{ scale: 1 }],
  },
  comingSoonCard: {
    backgroundColor: '#F8F9FA',
    borderColor: '#1976D2',
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
    color: '#000000',
    fontWeight: '600',
    marginRight: 8, // Add some space between title and confidence
  },
  comingSoonTitle: {
    color: '#1976D2',
    fontWeight: '700',
  },
  confidenceContainer: {
    backgroundColor: '#1976D2',
    borderRadius: 12,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  confidenceText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 12,
  },
  recipeInfo: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  recipeDetail: {
    color: '#333333',
    marginRight: 16,
  },
  recipeNutrition: {
    backgroundColor: '#F0F0F0',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  nutritionText: {
    color: '#333333',
  },
  recipeIngredients: {
    marginTop: 8,
  },
  ingredientsTitle: {
    color: '#000000',
    fontWeight: '600',
    marginBottom: 8,
  },
  ingredientText: {
    color: '#333333',
    marginBottom: 4,
  },
  ingredientInPantry: {
    color: '#4CAF50',
    fontWeight: '500',
  },
  missingIngredientsContainer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  missingIngredientsTitle: {
    color: '#FF5722',
    fontWeight: '600',
    marginBottom: 8,
  },
  missingIngredientText: {
    color: '#FF5722',
    marginBottom: 4,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  emptyStateText: {
    color: '#000000',
    marginBottom: 8,
    textAlign: 'center',
    fontWeight: '600',
  },
  emptyStateSubtext: {
    color: '#333333',
    textAlign: 'center',
    fontWeight: '500',
  },
  aiIconContainer: {
    marginBottom: 24,
  },
  aiIcon: {
    backgroundColor: '#F0F8FF',
    borderRadius: 50,
  },
  viewRecipeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  viewRecipeText: {
    color: '#1976D2',
    fontWeight: '500',
  },
  viewRecipeIcon: {
    margin: 0,
    backgroundColor: 'transparent',
  },
}); 
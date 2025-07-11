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
  const theme = styles.theme;
  if (Array.isArray(field) && field.length > 0) {
    return field.map((item, idx) => {
      if (typeof item === 'object' && item !== null && 'name' in item) {
        // Nicely format ingredient objects
        return (
          <Text key={idx} variant="bodyMedium" style={[styles.ingredientText, { color: theme.colors.onSurfaceVariant }]}>
            • {item.name}{item.amount ? `: ${item.amount}` : ''}{item.unit ? ` ${item.unit}` : ''}
          </Text>
        );
      }
      return (
        <Text key={idx} variant="bodyMedium" style={[styles.ingredientText, { color: theme.colors.onSurfaceVariant }]}>
          {typeof item === 'object' ? JSON.stringify(item) : String(item)}
        </Text>
      );
    });
  } else if (typeof field === 'object' && field !== null) {
    return (
      <Text variant="bodyMedium" style={[styles.ingredientText, { color: theme.colors.onSurfaceVariant }]}>
        {JSON.stringify(field)}
      </Text>
    );
  } else if (typeof field === 'string') {
    return (
      <Text variant="bodyMedium" style={[styles.ingredientText, { color: theme.colors.onSurfaceVariant }]}>
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
      <Card 
        key={recipe.id} 
        style={[
          styles.recipeCard, 
          { backgroundColor: theme.colors.surface },
          isComingSoon && styles.comingSoonCard
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
            {recipe.confidenceScore !== undefined && !isComingSoon && (
              <View style={[styles.confidenceContainer, { backgroundColor: theme.colors.primary }]}>
                <Text style={[styles.confidenceText, { color: theme.colors.onPrimary }]}>
                  AI Confidence: {recipe.confidenceScore}/100
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
        <Text 
          variant="headlineMedium" 
          style={[styles.centeredTitle, { color: theme.colors.onSurface }]}
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
              iconColor={theme.colors.onSurface}
              onPress={() => router.push('/ai-recipe-settings')}
              style={styles.settingsButton}
            />
          </View>
        )}
      </View>

      <ScrollView 
        style={[styles.content, { backgroundColor: theme.colors.background }]}
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
                iconColor={theme.colors.primary}
                style={[styles.aiIcon, { backgroundColor: theme.colors.primaryContainer }]}
              />
            </View>
            <Text 
              variant="headlineSmall" 
              style={[styles.comingSoonTitle, { color: theme.colors.primary }]}
            >
              Coming Soon!
            </Text>
            <Text 
              variant="bodyLarge" 
              style={[styles.emptyStateText, { color: theme.colors.onSurface }]}
            >
              AI Recipe Generation
            </Text>
            <Text 
              variant="bodyMedium" 
              style={[styles.emptyStateSubtext, { color: theme.colors.onSurfaceVariant }]}
            >
              We're working hard to bring you intelligent recipe suggestions powered by artificial intelligence.
            </Text>
            <Text 
              variant="bodyMedium" 
              style={[styles.emptyStateSubtext, { color: theme.colors.onSurfaceVariant }]}
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
              style={[styles.emptyStateText, { color: theme.colors.onSurface }]}
            >
              No recipes found
            </Text>
            <Text 
              variant="bodyMedium" 
              style={[styles.emptyStateSubtext, { color: theme.colors.onSurfaceVariant }]}
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
  centeredTitle: {
    flex: 1,
    textAlign: 'center',
    fontWeight: '700',
    paddingLeft: 0,
    paddingRight: 0,
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
}); 
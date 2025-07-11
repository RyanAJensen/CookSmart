import React, { useCallback, useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Card, IconButton, useTheme } from 'react-native-paper';
import { useFocusEffect } from '@react-navigation/native';
import { router } from 'expo-router';
import { getSavedRecipes } from '../services/storage';
import { Recipe } from '../types';

// Utility functions for consistent rendering
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

export default function SavedRecipesScreen() {
  const [savedRecipes, setSavedRecipes] = useState<Recipe[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const theme = useTheme();

  useFocusEffect(
    useCallback(() => {
      let isActive = true;
      const loadSavedRecipes = async () => {
        try {
          const recipes = await getSavedRecipes();
          if (isActive) {
            setSavedRecipes(recipes);
          }
        } catch (error) {
          console.error('Error loading saved recipes:', error);
        } finally {
          if (isActive) {
            setIsLoading(false);
          }
        }
      };
      loadSavedRecipes();
      return () => { isActive = false; };
    }, [])
  );

  const renderRecipe = (recipe: Recipe) => {
    const ingredients = safeParseJSON(recipe.ingredients);
    const instructions = safeParseJSON(recipe.instructions);

    return (
      <Card 
        key={recipe.id} 
        style={[styles.recipeCard, { backgroundColor: theme.colors.surface }]} 
        mode="outlined" 
        onPress={() => router.push({ pathname: '/recipe-detail', params: { recipe: JSON.stringify(recipe) } })}
      >
        <Card.Content>
          <View style={styles.recipeHeader}>
            <Text variant="titleMedium" style={[styles.recipeTitle, { color: theme.colors.onSurface }]}>
              {recipe.title}
            </Text>
            {recipe.confidenceScore !== undefined && (
              <View style={[styles.confidenceContainer, { backgroundColor: theme.colors.primary }]}>
                <Text style={[styles.confidenceText, { color: theme.colors.onPrimary }]}>
                  AI Confidence: {recipe.confidenceScore}/100
                </Text>
              </View>
            )}
          </View>
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
          <View style={[styles.viewRecipeContainer, { borderTopColor: theme.colors.outline }]}>
            <Text variant="bodyMedium" style={[styles.viewRecipeText, { color: theme.colors.primary }]}>
              Tap to view full recipe
            </Text>
            <IconButton
              icon="chevron-right"
              size={16}
              iconColor={theme.colors.primary}
              style={styles.viewRecipeIcon}
            />
          </View>
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
          style={[styles.title, { color: theme.colors.onSurface }]}
        >
          Saved Recipes
        </Text>
        <View style={styles.rightButtonContainer}>
          <IconButton
            icon="cog"
            size={24}
            iconColor={theme.colors.onSurface}
            onPress={() => router.push('/ai-recipe-settings')}
            style={styles.settingsButton}
          />
        </View>
      </View>

      <ScrollView 
        style={[styles.content, { backgroundColor: theme.colors.background }]}
        contentContainerStyle={styles.contentContainer}
      >
        {isLoading ? (
          <View style={styles.emptyState}>
            <Text 
              variant="bodyLarge" 
              style={[styles.emptyStateText, { color: theme.colors.onSurface }]}
            >
              Loading saved recipes...
            </Text>
          </View>
        ) : savedRecipes.length > 0 ? (
          savedRecipes.map(renderRecipe)
        ) : (
          <View style={styles.emptyState}>
            <Text 
              variant="bodyLarge" 
              style={[styles.emptyStateText, { color: theme.colors.onSurface }]}
            >
              No saved recipes
            </Text>
            <Text 
              variant="bodyMedium" 
              style={[styles.emptyStateSubtext, { color: theme.colors.onSurfaceVariant }]}
            >
              Save your favorite recipes to view them here
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
    paddingRight: 80,
  },
  rightButtonContainer: {
    position: 'absolute',
    right: 16,
    top: 60,
    zIndex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingsButton: {
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
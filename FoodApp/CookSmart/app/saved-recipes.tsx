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
  if (Array.isArray(field) && field.length > 0) {
    return field.map((item, idx) => {
      if (typeof item === 'object' && item !== null && 'name' in item) {
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
      <Card key={recipe.id} style={styles.recipeCard} mode="outlined" onPress={() => router.push({ pathname: '/recipe-detail', params: { recipe: JSON.stringify(recipe) } })}>
        <Card.Content>
          <View style={styles.recipeHeader}>
            <Text variant="titleMedium" style={styles.recipeTitle}>{recipe.title}</Text>
            {recipe.confidenceScore !== undefined && (
              <View style={styles.confidenceContainer}>
                <Text style={styles.confidenceText}>AI Confidence: {recipe.confidenceScore}/100</Text>
              </View>
            )}
          </View>
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
          <View style={styles.viewRecipeContainer}>
            <Text variant="bodyMedium" style={styles.viewRecipeText}>
              Tap to view full recipe
            </Text>
            <IconButton
              icon="chevron-right"
              size={16}
              iconColor="#1976D2"
              style={styles.viewRecipeIcon}
            />
          </View>
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
          style={styles.title}
        >
          Saved Recipes
        </Text>
        <View style={styles.rightButtonContainer}>
          <IconButton
            icon="cog"
            size={24}
            iconColor="#000000"
            onPress={() => router.push('/ai-recipe-settings')}
            style={styles.settingsButton}
          />
        </View>
      </View>

      <ScrollView 
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
      >
        {isLoading ? (
          <View style={styles.emptyState}>
            <Text 
              variant="bodyLarge" 
              style={styles.emptyStateText}
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
              style={styles.emptyStateText}
            >
              No saved recipes yet.
            </Text>
            <Text 
              variant="bodyMedium" 
              style={styles.emptyStateSubtext}
            >
              Save your favorite AI-generated recipes from the detail screen!
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
    marginRight: 8,
  },
  recipeInfo: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  recipeDetail: {
    color: '#333333',
    marginRight: 16,
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
  rightButtonContainer: {
    position: 'absolute',
    right: 16,
    top: 60,
    zIndex: 1,
  },
  settingsButton: {
    margin: 0,
    backgroundColor: 'transparent',
  },
  aiTestButton: {
    margin: 0,
    backgroundColor: 'transparent',
  },
}); 
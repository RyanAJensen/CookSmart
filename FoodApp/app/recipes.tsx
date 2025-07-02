import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Card, IconButton, useTheme } from 'react-native-paper';
import { getIngredients } from '../services/storage';
import { searchRecipes } from '../services/recipes';
import { Ingredient, Recipe } from '../types';
import { router, useLocalSearchParams } from 'expo-router';

export default function RecipesScreen() {
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { mode } = useLocalSearchParams<{ mode: 'strict' | 'partial' }>();
  const theme = useTheme();

  useEffect(() => {
    loadRecipes();
  }, [mode]);

  const loadRecipes = async () => {
    try {
      console.log('Loading recipes...');
      setIsLoading(true);
      const savedIngredients = await getIngredients();
      console.log('Loaded ingredients:', savedIngredients);
      setIngredients(savedIngredients);
      
      if (savedIngredients.length > 0) {
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
    } finally {
      setIsLoading(false);
    }
  };

  const renderRecipe = (recipe: Recipe) => (
    <Card 
      key={recipe.id} 
      style={styles.recipeCard}
      mode="outlined"
      onPress={() => router.push(`/recipe-detail?id=${recipe.id}`)}
    >
      <Card.Content>
        <Text variant="titleMedium" style={styles.recipeTitle}>
          {recipe.title}
        </Text>
        <View style={styles.recipeInfo}>
          <Text variant="bodyMedium" style={styles.recipeDetail}>
            {recipe.readyInMinutes} mins
          </Text>
          <Text variant="bodyMedium" style={styles.recipeDetail}>
            {recipe.servings} servings
          </Text>
        </View>
        {recipe.calories && (
          <View style={styles.recipeNutrition}>
            <Text variant="bodyMedium" style={styles.nutritionText}>
              Calories: {recipe.calories}
            </Text>
            {recipe.protein && (
              <Text variant="bodyMedium" style={styles.nutritionText}>
                Protein: {recipe.protein}g
              </Text>
            )}
            {recipe.carbs && (
              <Text variant="bodyMedium" style={styles.nutritionText}>
                Carbs: {recipe.carbs}g
              </Text>
            )}
            {recipe.fat && (
              <Text variant="bodyMedium" style={styles.nutritionText}>
                Fat: {recipe.fat}g
              </Text>
            )}
          </View>
        )}
        <View style={styles.recipeIngredients}>
          <Text variant="bodyMedium" style={styles.ingredientsTitle}>
            Ingredients:
          </Text>
          {recipe.ingredients.map((ingredient, index) => (
            <Text 
              key={index} 
              variant="bodyMedium" 
              style={[
                styles.ingredientText,
                ingredient.inPantry && styles.ingredientInPantry
              ]}
            >
              • {ingredient.amount} {ingredient.unit} {ingredient.name}
            </Text>
          ))}
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
      </Card.Content>
    </Card>
  );

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
          {mode === 'strict' ? 'Recipes with All Ingredients' : 'Recipes with Some Ingredients'}
        </Text>
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
              Loading recipes...
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
    // Add hover effect for better UX
    transform: [{ scale: 1 }],
  },
  recipeTitle: {
    color: '#000000',
    fontWeight: '600',
    marginBottom: 8,
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
}); 
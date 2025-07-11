import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, Image } from 'react-native';
import { Text, Card, IconButton, useTheme, Chip, Divider } from 'react-native-paper';
import { getRecipeById } from '../services/recipes';
import { saveRecipe } from '../services/storage';
import { Recipe } from '../types';
import { router, useLocalSearchParams, Stack } from 'expo-router';

export default function RecipeDetailScreen() {
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { recipe: recipeString } = useLocalSearchParams<{ recipe: string }>();
  const theme = useTheme();

  useEffect(() => {
    if (recipeString) {
      try {
        const parsedRecipe = JSON.parse(recipeString);
        setRecipe(parsedRecipe);
      } catch (error) {
        console.error('Error parsing recipe:', error);
      }
    }
    setIsLoading(false);
  }, [recipeString]);

  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <Stack.Screen options={{ headerShown: false }} />
        <ScrollView style={[styles.content, { backgroundColor: theme.colors.background }]} contentContainerStyle={styles.contentContainer}>
          <IconButton
            icon="arrow-left"
            size={24}
            iconColor={theme.colors.onSurface}
            onPress={() => router.back()}
            style={styles.backButton}
          />
          <View style={styles.loadingContainer}>
            <Text variant="bodyLarge" style={{ color: theme.colors.onSurface }}>Loading recipe details...</Text>
          </View>
        </ScrollView>
      </View>
    );
  }

  if (!recipe) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <Stack.Screen options={{ headerShown: false }} />
        <ScrollView style={[styles.content, { backgroundColor: theme.colors.background }]} contentContainerStyle={styles.contentContainer}>
          <IconButton
            icon="arrow-left"
            size={24}
            iconColor={theme.colors.onSurface}
            onPress={() => router.back()}
            style={styles.backButton}
          />
          <View style={styles.errorContainer}>
            <Text variant="bodyLarge" style={{ color: theme.colors.onSurface }}>Recipe not found</Text>
          </View>
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollView style={[styles.content, { backgroundColor: theme.colors.background }]} contentContainerStyle={styles.contentContainer}>
        {/* Header with Back Button and Settings */}
        <View style={styles.headerContainer}>
          <IconButton
            icon="arrow-left"
            size={24}
            iconColor={theme.colors.onSurface}
            onPress={() => router.back()}
            style={styles.backButton}
          />
          <IconButton
            icon="cog"
            size={24}
            iconColor={theme.colors.onSurface}
            onPress={() => router.push('/ai-recipe-settings')}
            style={styles.settingsButton}
          />
        </View>



        {/* Recipe Title and Basic Info */}
        <Card style={[styles.infoCard, { backgroundColor: theme.colors.surface }]}>
          <Card.Content>
            <Text variant="headlineSmall" style={[styles.recipeTitle, { color: theme.colors.onSurface }]}>
              {recipe.title}
            </Text>
            {recipe.confidenceScore && (
              <IconButton
                icon="content-save"
                size={24}
                iconColor={theme.colors.primary}
                onPress={async () => {
                  if (recipe) {
                    await saveRecipe(recipe);
                    alert('Recipe saved!');
                  }
                }}
                style={styles.saveButton}
              />
            )}
            
            <View style={styles.basicInfo}>
              <View style={styles.infoItem}>
                <Text variant="bodyMedium" style={[styles.infoLabel, { color: theme.colors.onSurfaceVariant }]}>Prep Time</Text>
                <Text variant="titleMedium" style={[styles.infoValue, { color: theme.colors.onSurface }]}>
                  {recipe.readyInMinutes} min
                </Text>
              </View>
              <View style={styles.infoItem}>
                <Text variant="bodyMedium" style={[styles.infoLabel, { color: theme.colors.onSurfaceVariant }]}>Servings</Text>
                <Text variant="titleMedium" style={[styles.infoValue, { color: theme.colors.onSurface }]}>
                  {recipe.servings}
                </Text>
              </View>
            </View>

            {/* Tags */}
            <View style={styles.tagsContainer}>
              {recipe.tags.map((tag, index) => (
                <Chip key={index} style={[styles.tag, { backgroundColor: theme.colors.primaryContainer }]} textStyle={[styles.tagText, { color: theme.colors.onPrimaryContainer }]}>
                  {tag}
                </Chip>
              ))}
            </View>

            {recipe.confidenceScore && (
              <View style={styles.confidenceSection}>
                <Text style={[styles.confidenceLabel, { color: theme.colors.onSurfaceVariant }]}>AI Confidence</Text>
                <Text style={[styles.confidenceValue, { color: theme.colors.primary }]}>{recipe.confidenceScore}/100</Text>
              </View>
            )}
          </Card.Content>
        </Card>

        {/* Nutrition Information */}
        <Card style={[styles.nutritionCard, { backgroundColor: theme.colors.surface }]}>
          <Card.Content>
            <Text variant="titleMedium" style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
              Nutrition Facts
            </Text>
            <View style={styles.nutritionGrid}>
              <View style={styles.nutritionItem}>
                <Text variant="bodyMedium" style={[styles.nutritionLabel, { color: theme.colors.onSurfaceVariant }]}>Calories</Text>
                <Text variant="titleMedium" style={[styles.nutritionValue, { color: theme.colors.onSurface }]}>
                  {recipe.calories}
                </Text>
              </View>
              <View style={styles.nutritionItem}>
                <Text variant="bodyMedium" style={[styles.nutritionLabel, { color: theme.colors.onSurfaceVariant }]}>Protein</Text>
                <Text variant="titleMedium" style={[styles.nutritionValue, { color: theme.colors.onSurface }]}>
                  {recipe.protein || 0}g
                </Text>
              </View>
              <View style={styles.nutritionItem}>
                <Text variant="bodyMedium" style={[styles.nutritionLabel, { color: theme.colors.onSurfaceVariant }]}>Carbs</Text>
                <Text variant="titleMedium" style={[styles.nutritionValue, { color: theme.colors.onSurface }]}>
                  {recipe.carbs || 0}g
                </Text>
              </View>
              <View style={styles.nutritionItem}>
                <Text variant="bodyMedium" style={[styles.nutritionLabel, { color: theme.colors.onSurfaceVariant }]}>Fat</Text>
                <Text variant="titleMedium" style={[styles.nutritionValue, { color: theme.colors.onSurface }]}>
                  {recipe.fat || 0}g
                </Text>
              </View>
            </View>
          </Card.Content>
        </Card>

        {/* Ingredients */}
        <Card style={[styles.ingredientsCard, { backgroundColor: theme.colors.surface }]}>
          <Card.Content>
            <Text variant="titleMedium" style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
              Ingredients
            </Text>
            {recipe.ingredients.map((ingredient, index) => (
              <View key={index} style={styles.ingredientItem}>
                <Text variant="bodyLarge" style={[styles.ingredientText, { color: theme.colors.onSurface }]}>
                  • {ingredient.amount} {ingredient.unit} {ingredient.name}
                </Text>
              </View>
            ))}
          </Card.Content>
        </Card>

        {/* Instructions */}
        <Card style={[styles.instructionsCard, { backgroundColor: theme.colors.surface }]}>
          <Card.Content>
            <Text variant="titleMedium" style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
              Instructions
            </Text>
            {recipe.instructions.map((instruction, index) => (
              <View key={index} style={styles.instructionItem}>
                <View style={[styles.stepNumber, { backgroundColor: theme.colors.primary }]}>
                  <Text variant="titleMedium" style={[styles.stepNumberText, { color: theme.colors.onPrimary }]}>
                    {index + 1}
                  </Text>
                </View>
                <Text variant="bodyLarge" style={[styles.instructionText, { color: theme.colors.onSurface }]}>
                  {instruction}
                </Text>
              </View>
            ))}
          </Card.Content>
        </Card>

        {recipe.missingIngredients && recipe.missingIngredients.length > 0 && (
          <Card style={[styles.missingIngredientsCard, { backgroundColor: theme.colors.surface }]}>
            <Card.Content>
              <Text variant="titleMedium" style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
                Missing Ingredients
              </Text>
              {recipe.missingIngredients.map((item, idx) => (
                <View key={idx} style={styles.ingredientItem}>
                  <Text variant="bodyLarge" style={[styles.missingIngredientText, { color: theme.colors.error }]}>
                    • {item.name}{item.amount ? `: ${item.amount}` : ''}{item.unit ? ` ${item.unit}` : ''}
                  </Text>
                </View>
              ))}
            </Card.Content>
          </Card>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backButton: {
    margin: 0,
    backgroundColor: 'transparent',
    alignSelf: 'flex-start',
    marginBottom: 16,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingTop: 60,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  settingsButton: {
    margin: 0,
    backgroundColor: 'transparent',
    alignSelf: 'flex-end',
  },

  infoCard: {
    marginBottom: 16,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  recipeTitle: {
    fontWeight: '700',
    marginBottom: 16,
    textAlign: 'center',
  },
  saveButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    zIndex: 1,
  },
  basicInfo: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  infoItem: {
    alignItems: 'center',
  },
  infoLabel: {
    marginBottom: 4,
  },
  infoValue: {
    fontWeight: '600',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    marginRight: 8,
    marginBottom: 8,
  },
  tagText: {
    fontWeight: '500',
  },
  confidenceSection: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    alignItems: 'center',
  },
  confidenceLabel: {
    marginBottom: 4,
  },
  confidenceValue: {
    fontWeight: 'bold',
    fontSize: 20,
  },
  nutritionCard: {
    marginBottom: 16,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  sectionTitle: {
    fontWeight: '600',
    marginBottom: 16,
  },
  nutritionGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  nutritionItem: {
    alignItems: 'center',
    flex: 1,
  },
  nutritionLabel: {
    marginBottom: 4,
  },
  nutritionValue: {
    fontWeight: '600',
  },
  ingredientsCard: {
    marginBottom: 16,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  ingredientItem: {
    marginBottom: 8,
  },
  ingredientText: {
    lineHeight: 24,
  },
  instructionsCard: {
    marginBottom: 16,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  instructionItem: {
    flexDirection: 'row',
    marginBottom: 16,
    alignItems: 'flex-start',
  },
  stepNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    marginTop: 2,
  },
  stepNumberText: {
    fontWeight: '600',
    fontSize: 16,
  },
  instructionText: {
    flex: 1,
    lineHeight: 24,
  },
  missingIngredientsCard: {
    marginBottom: 16,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  missingIngredientText: {
    lineHeight: 24,
  },
}); 
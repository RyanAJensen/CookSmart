import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, Image } from 'react-native';
import { Text, Card, IconButton, useTheme, Chip, Divider } from 'react-native-paper';
import { getRecipeById } from '../services/recipes';
import { Recipe } from '../types';
import { router, useLocalSearchParams, Stack } from 'expo-router';

export default function RecipeDetailScreen() {
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { id } = useLocalSearchParams<{ id: string }>();
  const theme = useTheme();

  useEffect(() => {
    loadRecipe();
  }, [id]);

  const loadRecipe = async () => {
    try {
      setIsLoading(true);
      if (id) {
        const recipeData = await getRecipeById(id);
        setRecipe(recipeData);
      }
    } catch (error) {
      console.error('Error loading recipe:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <Stack.Screen options={{ headerShown: false }} />
        <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
          <IconButton
            icon="arrow-left"
            size={24}
            iconColor="#000000"
            onPress={() => router.back()}
            style={styles.backButton}
          />
          <View style={styles.loadingContainer}>
            <Text variant="bodyLarge">Loading recipe details...</Text>
          </View>
        </ScrollView>
      </View>
    );
  }

  if (!recipe) {
    return (
      <View style={styles.container}>
        <Stack.Screen options={{ headerShown: false }} />
        <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
          <IconButton
            icon="arrow-left"
            size={24}
            iconColor="#000000"
            onPress={() => router.back()}
            style={styles.backButton}
          />
          <View style={styles.errorContainer}>
            <Text variant="bodyLarge">Recipe not found</Text>
          </View>
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        {/* Back Button */}
        <IconButton
          icon="arrow-left"
          size={24}
          iconColor="#000000"
          onPress={() => router.back()}
          style={styles.backButton}
        />



        {/* Recipe Title and Basic Info */}
        <Card style={styles.infoCard}>
          <Card.Content>
            <Text variant="headlineSmall" style={styles.recipeTitle}>
              {recipe.title}
            </Text>
            
            <View style={styles.basicInfo}>
              <View style={styles.infoItem}>
                <Text variant="bodyMedium" style={styles.infoLabel}>Prep Time</Text>
                <Text variant="titleMedium" style={styles.infoValue}>
                  {recipe.readyInMinutes} min
                </Text>
              </View>
              <View style={styles.infoItem}>
                <Text variant="bodyMedium" style={styles.infoLabel}>Servings</Text>
                <Text variant="titleMedium" style={styles.infoValue}>
                  {recipe.servings}
                </Text>
              </View>
            </View>

            {/* Tags */}
            <View style={styles.tagsContainer}>
              {recipe.tags.map((tag, index) => (
                <Chip key={index} style={styles.tag} textStyle={styles.tagText}>
                  {tag}
                </Chip>
              ))}
            </View>
          </Card.Content>
        </Card>

        {/* Nutrition Information */}
        <Card style={styles.nutritionCard}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Nutrition Facts
            </Text>
            <View style={styles.nutritionGrid}>
              <View style={styles.nutritionItem}>
                <Text variant="bodyMedium" style={styles.nutritionLabel}>Calories</Text>
                <Text variant="titleMedium" style={styles.nutritionValue}>
                  {recipe.calories}
                </Text>
              </View>
              <View style={styles.nutritionItem}>
                <Text variant="bodyMedium" style={styles.nutritionLabel}>Protein</Text>
                <Text variant="titleMedium" style={styles.nutritionValue}>
                  {recipe.protein}g
                </Text>
              </View>
              <View style={styles.nutritionItem}>
                <Text variant="bodyMedium" style={styles.nutritionLabel}>Carbs</Text>
                <Text variant="titleMedium" style={styles.nutritionValue}>
                  {recipe.carbs}g
                </Text>
              </View>
              <View style={styles.nutritionItem}>
                <Text variant="bodyMedium" style={styles.nutritionLabel}>Fat</Text>
                <Text variant="titleMedium" style={styles.nutritionValue}>
                  {recipe.fat}g
                </Text>
              </View>
            </View>
          </Card.Content>
        </Card>

        {/* Ingredients */}
        <Card style={styles.ingredientsCard}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Ingredients
            </Text>
            {recipe.ingredients.map((ingredient, index) => (
              <View key={index} style={styles.ingredientItem}>
                <Text variant="bodyLarge" style={styles.ingredientText}>
                  • {ingredient.amount} {ingredient.unit} {ingredient.name}
                </Text>
              </View>
            ))}
          </Card.Content>
        </Card>

        {/* Instructions */}
        <Card style={styles.instructionsCard}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Instructions
            </Text>
            {recipe.instructions.map((instruction, index) => (
              <View key={index} style={styles.instructionItem}>
                <View style={styles.stepNumber}>
                  <Text variant="titleMedium" style={styles.stepNumberText}>
                    {index + 1}
                  </Text>
                </View>
                <Text variant="bodyLarge" style={styles.instructionText}>
                  {instruction}
                </Text>
              </View>
            ))}
          </Card.Content>
        </Card>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  backButton: {
    margin: 0,
    backgroundColor: 'transparent',
    alignSelf: 'flex-start',
    marginBottom: 16,
  },
  content: {
    flex: 1,
    backgroundColor: '#F8F9FA',
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

  infoCard: {
    marginBottom: 16,
    backgroundColor: '#FFFFFF',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  recipeTitle: {
    color: '#000000',
    fontWeight: '700',
    marginBottom: 16,
    textAlign: 'center',
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
    color: '#666666',
    marginBottom: 4,
  },
  infoValue: {
    color: '#000000',
    fontWeight: '600',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    backgroundColor: '#E3F2FD',
    marginRight: 8,
    marginBottom: 8,
  },
  tagText: {
    color: '#1976D2',
    fontWeight: '500',
  },
  nutritionCard: {
    marginBottom: 16,
    backgroundColor: '#FFFFFF',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  sectionTitle: {
    color: '#000000',
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
    color: '#666666',
    marginBottom: 4,
  },
  nutritionValue: {
    color: '#000000',
    fontWeight: '600',
  },
  ingredientsCard: {
    marginBottom: 16,
    backgroundColor: '#FFFFFF',
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
    color: '#333333',
    lineHeight: 24,
  },
  instructionsCard: {
    marginBottom: 16,
    backgroundColor: '#FFFFFF',
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
    backgroundColor: '#1976D2',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    marginTop: 2,
  },
  stepNumberText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
  },
  instructionText: {
    color: '#333333',
    flex: 1,
    lineHeight: 24,
  },
}); 
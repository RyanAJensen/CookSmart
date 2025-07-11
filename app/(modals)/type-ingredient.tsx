import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, TouchableWithoutFeedback, Keyboard, KeyboardAvoidingView, Platform, ScrollView, Alert } from 'react-native';
import { TextInput, Button, Text, Card, IconButton, useTheme } from 'react-native-paper';
import { router, useRouter, useLocalSearchParams } from 'expo-router';
import { commonIngredients } from '../../services/commonIngredients';
import { addIngredient } from '../../services/storage';
import { Ingredient } from '../../types';
import AddCustomIngredient from '../../components/AddCustomIngredient';
import { BarCodeScanner } from 'expo-barcode-scanner';
import { TextInput as RNTextInput } from 'react-native';
import { formatCategory } from '../../utils/categoryFormatter';

export default function TypeIngredientScreen() {
  const [ingredientName, setIngredientName] = useState('');
  const [searchResults, setSearchResults] = useState<Ingredient[]>([]);
  const [showCustomModal, setShowCustomModal] = useState(false);
  const theme = useTheme();
  const router = useRouter();
  const params = useLocalSearchParams();
  const returnTo = params.returnTo as string;
  const textInputRef = useRef<RNTextInput>(null);

  const handleSearch = (text: string) => {
    setIngredientName(text);
    if (text.trim()) {
      const lower = text.toLowerCase();
      const results = commonIngredients.filter(ing =>
        ing.name.toLowerCase().includes(lower) ||
        (ing.common_names && ing.common_names.toLowerCase().includes(lower))
      );
      const uniqueResults = Array.from(new Map(results.map(ing => [ing.id, ing])).values());
      setSearchResults(uniqueResults);
    } else {
      setSearchResults([]);
    }
  };

  const handleSelectIngredient = async (ingredient: Ingredient) => {
    try {
      const formattedIngredient: Ingredient = {
        ...ingredient,
        id: `${ingredient.id}-${Date.now()}`,
        count: 1,
        added_at: new Date().toISOString()
      };
      await addIngredient(formattedIngredient);
      router.back();
    } catch (error) {
      console.error('Error adding ingredient:', error);
    }
  };

  const handleBack = () => {
    if (returnTo) {
      router.replace(returnTo as any);
    } else {
      router.back();
    }
  };

  const renderIngredient = (ingredient: Ingredient) => (
    <Card 
      key={ingredient.id} 
      style={[styles.card, { backgroundColor: theme.colors.surface }]}
      mode="outlined"
      onPress={() => {
        textInputRef.current?.blur();
        router.push({
          pathname: '/(modals)/food-details',
          params: { ingredient: JSON.stringify(ingredient) }
        });
      }}
    >
      <Card.Content>
        <View style={styles.ingredientHeader}>
          <View style={styles.ingredientInfo}>
            <Text variant="titleMedium" style={[styles.ingredientName, { color: theme.colors.onSurface }]}>
              {ingredient.name}
            </Text>
            <Text variant="bodyMedium" style={[styles.category, { color: theme.colors.onSurfaceVariant }]}>
              {formatCategory(ingredient.category)} • {ingredient.serving_size} {ingredient.serving_unit} • {ingredient.calories} kcal
            </Text>
          </View>
        </View>
        <View style={[styles.nutritionInfo, { backgroundColor: theme.colors.surfaceVariant }]}>
          <Text variant="bodyMedium" style={[styles.nutritionText, { color: theme.colors.onSurfaceVariant }]}>
            Calories: {ingredient.calories}
          </Text>
          <Text variant="bodyMedium" style={[styles.nutritionText, { color: theme.colors.onSurfaceVariant }]}>
            Protein: {ingredient.protein}g
          </Text>
          <Text variant="bodyMedium" style={[styles.nutritionText, { color: theme.colors.onSurfaceVariant }]}>
            Carbs: {ingredient.carbs}g
          </Text>
          <Text variant="bodyMedium" style={[styles.nutritionText, { color: theme.colors.onSurfaceVariant }]}>
            Fat: {ingredient.fat}g
          </Text>
        </View>
      </Card.Content>
    </Card>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={[styles.header, { backgroundColor: theme.colors.surface }]}>
        <IconButton
          icon="arrow-left"
          size={24}
          onPress={handleBack}
          style={styles.backButton}
        />
        <Text 
          variant="headlineMedium" 
          style={[styles.title, { color: theme.colors.onSurface }]}
        >
          Add Ingredient
        </Text>
      </View>
      
      <View style={[styles.searchContainer, { backgroundColor: theme.colors.surface, borderBottomColor: theme.colors.outline }]}>
        <TextInput
          mode="outlined"
          label="Search ingredients"
          value={ingredientName}
          onChangeText={handleSearch}
          style={styles.searchInput}
          autoFocus
          ref={textInputRef}
        />
      </View>

      <ScrollView 
        style={[styles.content, { backgroundColor: theme.colors.background }]}
        contentContainerStyle={styles.contentContainer}
        keyboardShouldPersistTaps="handled"
      >
        {searchResults.length > 0 ? (
          searchResults.map(renderIngredient)
        ) : ingredientName ? (
          <View style={styles.emptyState}>
            <Text 
              variant="bodyLarge" 
              style={[styles.emptyStateText, { color: theme.colors.onSurface }]}
            >
              No ingredients found
            </Text>
            <Text 
              variant="bodyMedium" 
              style={[styles.emptyStateSubtext, { color: theme.colors.onSurfaceVariant }]}
            >
              Try a different search term
            </Text>
          </View>
        ) : (
          <View style={styles.emptyState}>
            <Text 
              variant="bodyLarge" 
              style={[styles.emptyStateText, { color: theme.colors.onSurface }]}
            >
              Search for ingredients
            </Text>
            <Text 
              variant="bodyMedium" 
              style={[styles.emptyStateSubtext, { color: theme.colors.onSurfaceVariant }]}
            >
              Type to see matching ingredients
            </Text>
          </View>
        )}
      </ScrollView>
      <AddCustomIngredient
        visible={showCustomModal}
        onDismiss={() => setShowCustomModal(false)}
        initialName={ingredientName}
      />
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
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  backButton: {
    margin: 0,
    marginRight: 8,
  },
  title: {
    flex: 1,
    textAlign: 'center',
    fontWeight: '700',
  },
  searchContainer: {
    padding: 16,
    borderBottomWidth: 1,
  },
  searchInput: {
    // Background handled by theme
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
  },
  card: {
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  ingredientHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  ingredientInfo: {
    flex: 1,
    marginRight: 8,
  },
  ingredientName: {
    fontWeight: '600',
  },
  category: {
    marginTop: 4,
    fontWeight: '500',
  },
  nutritionInfo: {
    marginTop: 8,
    padding: 12,
    borderRadius: 8,
  },
  nutritionText: {
    // Color handled by theme
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  emptyStateText: {
    marginBottom: 8,
  },
  emptyStateSubtext: {
    // Color handled by theme
  },
}); 
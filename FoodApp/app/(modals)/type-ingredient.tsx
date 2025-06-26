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
      style={styles.card}
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
            <Text variant="titleMedium" style={styles.ingredientName}>
              {ingredient.name}
            </Text>
            {ingredient.category && (
              <Text variant="bodyMedium" style={styles.category}>
                {ingredient.category}
              </Text>
            )}
          </View>
        </View>
        <View style={styles.nutritionInfo}>
          <Text variant="bodyMedium" style={styles.nutritionText}>
            Calories: {ingredient.calories}
          </Text>
          <Text variant="bodyMedium" style={styles.nutritionText}>
            Protein: {ingredient.protein}g
          </Text>
          <Text variant="bodyMedium" style={styles.nutritionText}>
            Carbs: {ingredient.carbs}g
          </Text>
          <Text variant="bodyMedium" style={styles.nutritionText}>
            Fat: {ingredient.fat}g
          </Text>
        </View>
      </Card.Content>
    </Card>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <IconButton
          icon="arrow-left"
          size={24}
          onPress={handleBack}
          style={styles.backButton}
        />
        <Text 
          variant="headlineMedium" 
          style={styles.title}
        >
          Add Ingredient
        </Text>
      </View>
      
      <View style={styles.searchContainer}>
        <TextInput
          mode="outlined"
          label="Search ingredients"
          value={ingredientName}
          onChangeText={handleSearch}
          style={[styles.searchInput, { color: '#111' }]}
          autoFocus
          ref={textInputRef}
          render={props => <RNTextInput {...props} ref={textInputRef} style={[props.style, { color: '#111' }]} />}
        />
      </View>

      <ScrollView 
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        keyboardShouldPersistTaps="handled"
      >
        {searchResults.length > 0 ? (
          searchResults.map(renderIngredient)
        ) : ingredientName ? (
          <View style={styles.emptyState}>
            <Text 
              variant="bodyLarge" 
              style={styles.emptyStateText}
            >
              No ingredients found
            </Text>
            <Text 
              variant="bodyMedium" 
              style={styles.emptyStateSubtext}
            >
              Try a different search term
            </Text>
          </View>
        ) : (
          <View style={styles.emptyState}>
            <Text 
              variant="bodyLarge" 
              style={styles.emptyStateText}
            >
              Search for ingredients
            </Text>
            <Text 
              variant="bodyMedium" 
              style={styles.emptyStateSubtext}
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
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFFFFF',
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
    color: '#000000',
    fontWeight: '700',
  },
  searchContainer: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  searchInput: {
    backgroundColor: '#FFFFFF',
  },
  content: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  contentContainer: {
    padding: 16,
  },
  card: {
    marginBottom: 12,
    backgroundColor: '#FFFFFF',
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
    color: '#000000',
    fontWeight: '600',
  },
  category: {
    color: '#333333',
    marginTop: 4,
    fontWeight: '500',
  },
  nutritionInfo: {
    marginTop: 8,
    backgroundColor: '#F0F0F0',
    padding: 12,
    borderRadius: 8,
  },
  nutritionText: {
    color: '#333333',
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
  },
  emptyStateSubtext: {
    color: '#666666',
  },
}); 
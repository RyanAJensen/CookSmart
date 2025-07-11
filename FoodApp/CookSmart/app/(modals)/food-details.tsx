import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Image, ScrollView, StyleSheet, View } from 'react-native';
import { Button, IconButton, Text, Card, Divider, useTheme } from 'react-native-paper';
import { getProductByBarcode, normalizeIngredientName, formatNutritionalInfo } from '../../services/openFoodFacts';
import { addIngredient } from '../../services/storage';
import { Ingredient } from '../../types';
import { formatCategory } from '../../utils/categoryFormatter';

// Helper to parse serving size string
function parseServingSize(servingSize: string | undefined): { amount: number, unit: string } {
  if (!servingSize) return { amount: 100, unit: 'g' };
  // Try to match a number followed by a unit (e.g., "30 g", "1 piece", "2 slices")
  const match = servingSize.match(/([\d.]+)\s*([a-zA-Z]+)/);
  if (match) {
    let amount = parseFloat(match[1]);
    let unit = match[2].toLowerCase();
    if ((unit === 'g' || unit === 'ml') && amount === 1) {
      amount = 100;
    }
    return { amount, unit };
  }
  // If no match, but string contains a number (e.g., "3 PIECES"), use that
  const numMatch = servingSize.match(/([\d.]+)/);
  if (numMatch) {
    let amount = parseFloat(numMatch[1]);
    let unit = servingSize.replace(numMatch[1], '').trim().toLowerCase() || 'g';
    if ((unit === 'g' || unit === 'ml') && amount === 1) {
      amount = 100;
    }
    return { amount, unit };
  }
  // Fallback: use 100 as amount and 'g' as unit for grams/milliliters, else 1 and the string
  const fallbackUnit = servingSize.trim().toLowerCase() || 'g';
  if (fallbackUnit === 'g' || fallbackUnit === 'ml') {
    return { amount: 100, unit: fallbackUnit };
  }
  return { amount: 1, unit: fallbackUnit };
}

export default function FoodDetailsScreen() {
  const params = useLocalSearchParams();
  const barcode = params.barcode as string;
  const router = useRouter();
  const theme = useTheme();
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    let ingredientStr: string | undefined = undefined;
    if (params.ingredient) {
      if (Array.isArray(params.ingredient)) {
        ingredientStr = params.ingredient[0];
      } else {
        ingredientStr = params.ingredient;
      }
    }
    if (ingredientStr) {
      setProduct(JSON.parse(ingredientStr));
      setLoading(false);
    } else if (barcode) {
      setLoading(true);
      getProductByBarcode(barcode)
        .then((prod) => {
          setProduct(prod);
          setLoading(false);
        })
        .catch(() => {
          setError('Failed to fetch product info.');
          setLoading(false);
        });
    }
  }, [barcode, params.ingredient]);

  const handleBack = () => {
    if (params.returnTo) {
      router.replace(params.returnTo as any);
    } else {
      router.back();
    }
  };

  const handleAdd = async () => {
    if (!product) return;
    setAdding(true);
    let ingredientStr: string | undefined = undefined;
    if (params.ingredient) {
      if (Array.isArray(params.ingredient)) {
        ingredientStr = params.ingredient[0];
      } else {
        ingredientStr = params.ingredient;
      }
    }
    if (ingredientStr) {
      const ingredient: Ingredient = {
        ...product,
        id: `${product.id}-${Date.now()}`,
        count: 1,
        added_at: new Date().toISOString(),
      };
      await addIngredient(ingredient);
      setAdding(false);
      setAdded(true);
      setTimeout(() => {
        router.back();
      }, 1000);
      return;
    }
    // Nutrition helpers for numbers
    const nutriments = product.nutriments || {};
    // Determine nutrition basis and label
    let nutritionBasis = '';
    let servingSizeLabel = '';
    let servingAmount = 1;
    let servingUnit = '';
    if (nutriments['energy-kcal_serving'] != null) {
      nutritionBasis = 'serving';
      servingSizeLabel = product.serving_size || 'serving';
      // Try to parse serving size for storage
      const parsed = parseServingSize(product.serving_size);
      servingAmount = parsed.amount;
      servingUnit = parsed.unit;
    } else if (nutriments['energy-kcal_100g'] != null) {
      nutritionBasis = '100g';
      servingSizeLabel = '100 g';
      servingAmount = 100;
      servingUnit = 'g';
    } else if (nutriments['energy-kcal_100ml'] != null) {
      nutritionBasis = '100ml';
      servingSizeLabel = '100 ml';
      servingAmount = 100;
      servingUnit = 'ml';
    } else {
      // fallback to serving if available, else 100g
      if (product.serving_size) {
        nutritionBasis = 'serving';
        servingSizeLabel = product.serving_size;
        const parsed = parseServingSize(product.serving_size);
        servingAmount = parsed.amount;
        servingUnit = parsed.unit;
      } else {
        nutritionBasis = '100g';
        servingSizeLabel = '100 g';
        servingAmount = 100;
        servingUnit = 'g';
      }
    }
    // Calories (kcal)
    let calories = null;
    if (nutritionBasis === 'serving') {
      calories = Math.round(nutriments['energy-kcal_serving']);
    } else if (nutritionBasis === '100g') {
      calories = Math.round(nutriments['energy-kcal_100g']);
    } else if (nutritionBasis === '100ml') {
      calories = Math.round(nutriments['energy-kcal_100ml']);
    }
    // Protein
    let protein = null;
    if (nutritionBasis === 'serving') {
      protein = nutriments['proteins_serving'];
    } else if (nutritionBasis === '100g') {
      protein = nutriments['proteins_100g'];
    } else if (nutritionBasis === '100ml') {
      protein = nutriments['proteins_100ml'];
    }
    if (protein != null) protein = Math.round(protein * 10) / 10;
    // Carbs
    let carbs = null;
    if (nutritionBasis === 'serving') {
      carbs = nutriments['carbohydrates_serving'];
    } else if (nutritionBasis === '100g') {
      carbs = nutriments['carbohydrates_100g'];
    } else if (nutritionBasis === '100ml') {
      carbs = nutriments['carbohydrates_100ml'];
    }
    if (carbs != null) carbs = Math.round(carbs * 10) / 10;
    // Fat
    let fat = null;
    if (nutritionBasis === 'serving') {
      fat = nutriments['fat_serving'];
    } else if (nutritionBasis === '100g') {
      fat = nutriments['fat_100g'];
    } else if (nutritionBasis === '100ml') {
      fat = nutriments['fat_100ml'];
    }
    if (fat != null) fat = Math.round(fat * 10) / 10;
    const uniqueId = barcode ? `${barcode}-${Date.now()}` : `${Date.now()}`;
    const ingredient: Ingredient = {
      id: uniqueId,
      name: normalizeIngredientName(product),
      category: product.categories || '',
      common_names: product.generic_name || '',
      calories: calories ?? 0,
      protein: protein ?? 0,
      carbs: carbs ?? 0,
      fat: fat ?? 0,
      serving_size: servingAmount,
      serving_unit: servingUnit,
      added_at: new Date().toISOString(),
    };
    await addIngredient(ingredient);
    setAdding(false);
    setAdded(true);
    setTimeout(() => {
      router.back();
    }, 1000);
  };

  // Use the correct display values for searched (ingredientParam) vs scanned (barcode) items
  let displayCalories = 0, displayProtein = 0, displayCarbs = 0, displayFat = 0, displayServing = '', displayCategory = '', displayName = '', displayUnit = '';
  if (product) {
    if (params.ingredient) {
      // Searched ingredient: use fields directly
      displayCalories = product.calories;
      displayProtein = product.protein;
      displayCarbs = product.carbs;
      displayFat = product.fat;
      displayServing = product.serving_size;
      displayUnit = product.serving_unit;
      displayCategory = product.category;
      displayName = product.name;
    } else if (product.nutriments) {
      // Scanned product: derive from nutriments
      const nutriments = product.nutriments;
      if (nutriments['energy-kcal_serving'] != null) {
        displayCalories = Math.round(nutriments['energy-kcal_serving']);
      } else if (nutriments['energy-kcal_100g'] != null) {
        displayCalories = Math.round(nutriments['energy-kcal_100g']);
      } else if (nutriments['energy_serving'] != null) {
        displayCalories = Math.round(nutriments['energy_serving'] / 4.184);
      } else if (nutriments['energy_100g'] != null) {
        displayCalories = Math.round(nutriments['energy_100g'] / 4.184);
      }
      if (nutriments['proteins_serving'] != null) {
        displayProtein = Math.round(nutriments['proteins_serving'] * 10) / 10;
      } else if (nutriments['proteins_100g'] != null) {
        displayProtein = Math.round(nutriments['proteins_100g'] * 10) / 10;
      }
      if (nutriments['carbohydrates_serving'] != null) {
        displayCarbs = Math.round(nutriments['carbohydrates_serving'] * 10) / 10;
      } else if (nutriments['carbohydrates_100g'] != null) {
        displayCarbs = Math.round(nutriments['carbohydrates_100g'] * 10) / 10;
      }
      if (nutriments['fat_serving'] != null) {
        displayFat = Math.round(nutriments['fat_serving'] * 10) / 10;
      } else if (nutriments['fat_100g'] != null) {
        displayFat = Math.round(nutriments['fat_100g'] * 10) / 10;
      }
      displayServing = product.serving_size;
      displayUnit = product.serving_unit || '';
      displayCategory = product.categories || '';
      displayName = normalizeIngredientName(product);
    }
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={[styles.header, { backgroundColor: theme.colors.surface, borderBottomColor: theme.colors.outline }]}>
        <IconButton
          icon="arrow-left"
          size={24}
          onPress={handleBack}
          style={styles.backButton}
        />
        <Text variant="headlineMedium" style={[styles.title, { color: theme.colors.onSurface }]}>
          Food Details
        </Text>
      </View>
      <Divider />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {loading ? (
          <ActivityIndicator style={{ marginTop: 40 }} />
        ) : error ? (
          <Text style={{ color: theme.colors.error, margin: 24 }}>{error}</Text>
        ) : product ? (
          <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
            {product.image_url ? (
              <Image source={{ uri: product.image_url }} style={styles.image} resizeMode="contain" />
            ) : (
              <View style={[styles.image, styles.imagePlaceholder, { backgroundColor: theme.colors.surfaceVariant }]}>
                <Text style={{ color: theme.colors.onSurfaceVariant }}>No Image</Text>
              </View>
            )}
            <Card.Content>
              <Text variant="titleLarge" style={[styles.productName, { color: theme.colors.onSurface }]}>{displayName}</Text>
              <Text style={[styles.category, { color: theme.colors.onSurfaceVariant }]}>
                {formatCategory(displayCategory)} • {displayServing} {displayUnit} • {displayCalories} kcal
              </Text>
              <Divider style={{ marginVertical: 12 }} />
              <Text variant="titleMedium" style={[styles.nutritionTitle, { color: theme.colors.onSurface }]}>
                Nutrition {(displayServing && displayUnit) ? `(per ${displayServing} ${displayUnit})` : '(per serving)'}
              </Text>
              <View style={[styles.nutritionBox, { backgroundColor: theme.colors.surfaceVariant }]}>
                <View style={styles.nutritionRow}>
                  <Text style={[styles.nutritionLabel, { color: theme.colors.onSurfaceVariant }]}>Calories:</Text>
                  <Text style={[styles.nutritionValue, { color: theme.colors.primary }]}>
                    {displayCalories} kcal
                  </Text>
                </View>
                <View style={styles.nutritionRow}>
                  <Text style={[styles.nutritionLabel, { color: theme.colors.onSurfaceVariant }]}>Protein:</Text>
                  <Text style={[styles.nutritionValue, { color: theme.colors.primary }]}>
                    {displayProtein} g
                  </Text>
                </View>
                <View style={styles.nutritionRow}>
                  <Text style={[styles.nutritionLabel, { color: theme.colors.onSurfaceVariant }]}>Carbs:</Text>
                  <Text style={[styles.nutritionValue, { color: theme.colors.primary }]}>
                    {displayCarbs} g
                  </Text>
                </View>
                <View style={styles.nutritionRow}>
                  <Text style={[styles.nutritionLabel, { color: theme.colors.onSurfaceVariant }]}>Fat:</Text>
                  <Text style={[styles.nutritionValue, { color: theme.colors.primary }]}>
                    {displayFat} g
                  </Text>
                </View>
              </View>
              <Button
                mode="contained"
                onPress={handleAdd}
                loading={adding}
                disabled={adding || added}
                style={styles.addButton}
                labelStyle={{ fontSize: 18 }}
                contentStyle={{ paddingVertical: 8 }}
              >
                {added ? 'Added!' : 'Add to Pantry'}
              </Button>
            </Card.Content>
          </Card>
        ) : (
          <Text style={[styles.placeholder, { color: theme.colors.onSurfaceVariant }]}>No product info found for this barcode.</Text>
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
    borderBottomWidth: 1,
  },
  backButton: {
    marginRight: 16,
  },
  title: {
    flex: 1,
    fontWeight: 'bold',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  card: {
    width: 340,
    borderRadius: 18,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    marginTop: 24,
    marginBottom: 32,
    alignItems: 'center',
  },
  image: {
    width: 180,
    height: 180,
    borderRadius: 12,
    alignSelf: 'center',
    marginTop: 16,
    marginBottom: 8,
  },
  imagePlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  productName: {
    textAlign: 'center',
    fontWeight: 'bold',
    marginBottom: 4,
    fontSize: 22,
  },
  barcode: {
    textAlign: 'center',
    fontSize: 15,
    marginBottom: 2,
  },
  category: {
    textAlign: 'center',
    fontSize: 15,
    marginBottom: 8,
  },
  nutritionTitle: {
    marginBottom: 8,
    fontWeight: 'bold',
  },
  nutritionBox: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 18,
    marginTop: 2,
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
  },
  nutritionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  nutritionLabel: {
    fontWeight: '600',
    fontSize: 16,
  },
  nutritionValue: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  addButton: {
    marginTop: 10,
    borderRadius: 8,
    elevation: 2,
  },
  placeholder: {
    marginTop: 24,
    fontStyle: 'italic',
    textAlign: 'center',
  },
}); 
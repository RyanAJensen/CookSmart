import React, { useCallback, useState, useRef, useEffect } from 'react';
import { ScrollView, StyleSheet, View, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { Card, Text, Button, IconButton, Menu, useTheme } from 'react-native-paper';
import { TextInput as RNTextInput } from 'react-native';
import { getIngredients, saveIngredients, removeIngredient } from '../../services/storage';
import { Ingredient } from '../../types';
import { useFocusEffect } from '@react-navigation/native';
import { router } from 'expo-router';
import { useSQLite } from '../../components/SQLiteProvider';
import { formatCategory } from '../../utils/categoryFormatter';

const AI_SERVER_URL = 'http://192.168.1.159:8000/v1/completions';

export default function PantryScreen() {
  const theme = useTheme();
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<string>('');
  // Toggle state for nutrition display per ingredient
  const [nutritionMode, setNutritionMode] = useState<{ [id: string]: 'perUnit' | 'total' }>({});
  const scrollViewRef = useRef<ScrollView>(null);
  const cardPositions = useRef<Record<string, number>>({});
  const textInputRef = useRef<RNTextInput>(null);
  const [menuVisible, setMenuVisible] = useState(false);
  const { isReady, error } = useSQLite();

  // Load ingredients once database is ready
  useEffect(() => {
    if (isReady) {
      const init = async () => {
        try {
          // Load existing ingredients instead of clearing them
          const pantryIngredients = await getIngredients();
          setIngredients(pantryIngredients);
        } catch (error) {
          console.error('Error loading ingredients:', error);
        } finally {
          setIsLoading(false);
        }
      };
      init();
    }
  }, [isReady]);

  // Reload ingredients every time the screen is focused
  useFocusEffect(
    useCallback(() => {
      if (isReady && !isLoading) {
        const loadIngredients = async () => {
          try {
            const pantryIngredients = await getIngredients();
            setIngredients(pantryIngredients);
          } catch (error) {
            console.error('Error loading ingredients:', error);
          }
        };
        loadIngredients();
      }
      return () => {};
    }, [isReady, isLoading])
  );

  // Scroll to the card being edited when editingId changes
  useEffect(() => {
    if (editingId && scrollViewRef.current && cardPositions.current[editingId] !== undefined) {
      scrollViewRef.current.scrollTo({ 
        y: Math.max(cardPositions.current[editingId] - 40, 0), 
        animated: true 
      });
      // Auto-focus the textbox after a short delay to ensure scroll completes
      setTimeout(() => {
        textInputRef.current?.focus();
      }, 100);
    }
  }, [editingId]);

  const handleEdit = (ingredient: Ingredient) => {
    setEditingId(ingredient.id);
    setEditValue((ingredient.count || 1).toString());
  };

  const handleSaveEdit = async (ingredient: Ingredient) => {
    const newCount = parseFloat(editValue);
    if (isNaN(newCount) || newCount <= 0) {
      Alert.alert("Invalid Amount", "Amount must be greater than 0.");
      return;
    }
    // Only update count, not serving_size
    const updated = ingredients.map(ing =>
      ing.id === ingredient.id ? { ...ing, count: newCount } : ing
    );
    setIngredients(updated);
    await saveIngredients(updated);
    setEditingId(null);
  };

  const handleDelete = async (id: string) => {
    await removeIngredient(id);
    setIngredients(ingredients.filter(ing => ing.id !== id));
  };

  const renderIngredient = (ingredient: Ingredient) => {
    const totalAmount = (ingredient.serving_size || 0) * (ingredient.count || 1);
    const mode = nutritionMode[ingredient.id] || 'perUnit';
    // Calculate nutrition values
    const getValue = (val: number | undefined) => val ?? 0;
    const calories = getValue(ingredient.calories);
    const protein = getValue(ingredient.protein);
    const carbs = getValue(ingredient.carbs);
    const fat = getValue(ingredient.fat);
    // Only multiply by count for total mode
    const multiplier = mode === 'total' ? (ingredient.count || 1) : 1;
    return (
      <View 
        key={ingredient.id} 
        onLayout={e => {
          cardPositions.current[ingredient.id] = e.nativeEvent.layout.y;
        }}
      >
        <Card mode="outlined" style={[styles.ingredientCard, { backgroundColor: theme.colors.surface }]}>
          <Card.Content>
            <View style={styles.nameRow}>
              <Text variant="titleMedium" style={[styles.ingredientName, { color: theme.colors.onSurface }]}>{ingredient.name || 'Unnamed Ingredient'}</Text>
            </View>
            <View style={styles.row}>
              <Text variant="bodySmall" style={[styles.ingredientCategory, { color: theme.colors.onSurfaceVariant }]}>
                {formatCategory(ingredient.category)} • {ingredient.serving_size} {ingredient.serving_unit} • {ingredient.calories} kcal
              </Text>
            </View>
            <View style={[styles.nutritionBox, { backgroundColor: theme.colors.surfaceVariant }]}>
              <View style={styles.showTotalButtonRow}>
                <Text style={[styles.nutritionTitle, { color: theme.colors.onSurfaceVariant }]}>
                  Nutrition ({mode === 'perUnit' ? `per ${ingredient.serving_size} ${ingredient.serving_unit}` : `total (${totalAmount} ${ingredient.serving_unit})`}):
                </Text>
                <Button
                  mode="outlined"
                  compact
                  style={[styles.showTotalButton]}
                  labelStyle={styles.showTotalButtonLabel}
                  onPress={() => setNutritionMode(m => ({ ...m, [ingredient.id]: mode === 'perUnit' ? 'total' : 'perUnit' }))}
                >
                  {mode === 'perUnit' ? 'Show Total' : 'Show Unit'}
                </Button>
              </View>
              <View style={styles.nutritionRow}><Text style={[styles.nutritionLabel, { color: theme.colors.onSurfaceVariant }]}>Calories:</Text><Text style={[styles.nutritionValue, { color: theme.colors.primary }]}>{calories ? `${(mode === 'total' ? (calories * (ingredient.count || 1)).toFixed(0) : calories.toFixed(0))} kcal` : 'N/A'}</Text></View>
              <View style={styles.nutritionRow}><Text style={[styles.nutritionLabel, { color: theme.colors.onSurfaceVariant }]}>Protein:</Text><Text style={[styles.nutritionValue, { color: theme.colors.primary }]}>{protein ? `${(mode === 'total' ? (protein * (ingredient.count || 1)).toFixed(1) : protein.toFixed(1))}g` : 'N/A'}</Text></View>
              <View style={styles.nutritionRow}><Text style={[styles.nutritionLabel, { color: theme.colors.onSurfaceVariant }]}>Carbs:</Text><Text style={[styles.nutritionValue, { color: theme.colors.primary }]}>{carbs ? `${(mode === 'total' ? (carbs * (ingredient.count || 1)).toFixed(1) : carbs.toFixed(1))}g` : 'N/A'}</Text></View>
              <View style={styles.nutritionRow}><Text style={[styles.nutritionLabel, { color: theme.colors.onSurfaceVariant }]}>Fat:</Text><Text style={[styles.nutritionValue, { color: theme.colors.primary }]}>{fat ? `${(mode === 'total' ? (fat * (ingredient.count || 1)).toFixed(1) : fat.toFixed(1))}g` : 'N/A'}</Text></View>
            </View>
            <View style={styles.amountRow}>
              <Text style={[styles.amountLabel, { color: theme.colors.onSurfaceVariant }]}>Amount:</Text>
              {editingId === ingredient.id ? (
                <>
                  <View style={styles.amountEditRow}>
                    <View style={styles.amountInputColumnWithCancel}>
                      <RNTextInput
                        ref={textInputRef}
                        value={editValue}
                        onChangeText={setEditValue}
                        keyboardType="numeric"
                        style={styles.amountInputShort}
                        placeholder="0"
                        underlineColorAndroid="transparent"
                        textAlign="center"
                      />
                    </View>
                    <Text style={styles.amountUnitPadded}>
                      {ingredient.serving_size && ingredient.serving_size !== 1 ? `${ingredient.serving_size} ` : ''}{ingredient.serving_unit}
                    </Text>
                    <Button
                      mode="outlined"
                      compact
                      onPress={() => handleSaveEdit(ingredient)}
                      style={styles.editSaveButton}
                      labelStyle={styles.editSaveButtonLabel}
                    >
                      Save
                    </Button>
                    <View style={styles.deleteButtonContainer}>
                      <IconButton icon="delete" onPress={() => handleDelete(ingredient.id)} style={styles.deleteButton} />
                    </View>
                  </View>
                </>
              ) : (
                <View style={styles.amountEditRow}>
                  <View style={styles.amountInputColumnWithCancel}>
                    <Text style={[styles.amountValue, styles.amountValueShifted, { color: theme.colors.onSurface }]}>{ingredient.count || 1}</Text>
                  </View>
                  <Text style={[styles.amountUnitPadded, { color: theme.colors.onSurfaceVariant }]}>
                    {ingredient.serving_size && ingredient.serving_size !== 1 ? `${ingredient.serving_size} ` : ''}{ingredient.serving_unit}
                  </Text>
                  <Button
                    mode="outlined"
                    compact
                    onPress={() => handleEdit(ingredient)}
                    style={styles.editSaveButton}
                    labelStyle={styles.editSaveButtonLabel}
                  >
                    Edit
                  </Button>
                  <View style={styles.deleteButtonContainer}>
                    <IconButton icon="delete" onPress={() => handleDelete(ingredient.id)} style={styles.deleteButton} />
                  </View>
                </View>
              )}
            </View>
          </Card.Content>
        </Card>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView 
      style={[styles.container, { backgroundColor: theme.colors.background }]} 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={0}
    >
      <View style={[styles.header, { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: theme.colors.surface }]}> 
        <Text variant="headlineMedium" style={[styles.title, { color: theme.colors.onSurface }]}>
          My Pantry
        </Text>
        <Menu
          visible={menuVisible}
          onDismiss={() => setMenuVisible(false)}
          anchor={
            <Button
              mode="contained"
              icon="chef-hat"
              onPress={() => setMenuVisible(true)}
              style={{ borderRadius: 8 }}
            >
              Find Recipes
            </Button>
          }
        >
          <Menu.Item
            onPress={() => {
              setMenuVisible(false);
              router.push('/recipes?mode=strict');
            }}
            title="Strict (All Ingredients)"
          />
          <Menu.Item
            onPress={() => {
              setMenuVisible(false);
              router.push('/recipes?mode=partial');
            }}
            title="Partial (Some Ingredients)"
          />
          <Menu.Item
            onPress={() => {
              setMenuVisible(false);
              router.push('/recipes?mode=ai');
            }}
            title="AI Recipe (Pantry Fusion)"
          />
          <Menu.Item
            onPress={() => {
              setMenuVisible(false);
              router.push('/saved-recipes');
            }}
            title="Saved Recipes"
          />
        </Menu>
      </View>

      <ScrollView 
        ref={scrollViewRef}
        style={[styles.content, { backgroundColor: theme.colors.background }]}
        contentContainerStyle={styles.contentContainer}
        keyboardShouldPersistTaps="handled"
      >
        {isLoading ? (
          <View style={styles.emptyState}>
            <Text variant="bodyLarge" style={[styles.emptyStateText, { color: theme.colors.onSurface }]}>
              Loading ingredients...
            </Text>
          </View>
        ) : ingredients.length > 0 ? (
          ingredients.map(renderIngredient)
        ) : (
          <View style={styles.emptyState}>
            <Text variant="bodyLarge" style={[styles.emptyStateText, { color: theme.colors.onSurface }]}>
              Your pantry is empty
            </Text>
            <Text variant="bodyMedium" style={[styles.emptyStateSubtext, { color: theme.colors.onSurfaceVariant }]}>
              Add ingredients to get started
            </Text>
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 16,
    paddingTop: 60,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  title: {
    fontWeight: '700',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
  },
  ingredientCard: {
    marginBottom: 12,
    borderWidth: 1,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
  },
  ingredientName: {
    fontWeight: '600',
    marginBottom: 4,
  },
  ingredientAmount: {
    // Color handled by theme
  },
  ingredientCategory: {
    marginTop: 4,
  },
  nutritionBox: {
    borderRadius: 12,
    padding: 12,
    marginTop: 8,
    marginBottom: 20,
  },
  nutritionTitle: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  nutritionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  nutritionLabel: {
    fontWeight: '600',
  },
  nutritionValue: {
    fontWeight: 'bold',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  amountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    justifyContent: 'flex-start',
  },
  amountLabel: {
    fontWeight: '600',
    marginRight: 8,
  },
  amountValue: {
    fontWeight: 'bold',
    marginRight: 8,
  },
  amountInput: {
    width: 48,
    minWidth: 40,
    maxWidth: 60,
    marginRight: 8,
    backgroundColor: '#fff',
    paddingHorizontal: 4,
    fontSize: 14,
    height: 36,
    lineHeight: 18,
  },
  amountUnit: {
    color: '#555',
    marginRight: 8,
    fontSize: 14,
  },
  editButton: {
    marginLeft: 4,
    minWidth: 56,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 0,
    paddingHorizontal: 8,
  },
  editButtonLabel: {
    fontSize: 14,
    lineHeight: 18,
    paddingVertical: 0,
    paddingHorizontal: 0,
  },
  cancelButtonFixed: {
    alignSelf: 'flex-start',
    marginTop: 6,
    marginLeft: 0,
    minHeight: 28,
    height: 28,
    paddingVertical: 0,
    paddingHorizontal: 0,
  },
  cancelButtonLabelFixed: {
    fontSize: 13,
    lineHeight: 16,
    paddingVertical: 0,
    paddingHorizontal: 0,
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
  ingredientCount: {
    color: '#007AFF',
    fontWeight: 'bold',
    marginLeft: 8,
    fontSize: 16,
  },
  nameRow: {
    marginBottom: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  deleteButtonContainer: {
    flex: 1,
    alignItems: 'flex-end',
    justifyContent: 'flex-end',
  },
  deleteButton: {
    marginLeft: 0,
    alignSelf: 'flex-end',
  },
  amountEditRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    minHeight: 40,
  },
  amountInputColumn: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'flex-start',
    minWidth: 32,
    marginRight: 4,
  },
  amountInputShort: {
    width: 24,
    minWidth: 20,
    maxWidth: 28,
    height: 28,
    fontSize: 13,
    paddingVertical: 0,
    paddingHorizontal: 0,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
    backgroundColor: '#fff',
    textAlign: 'center',
    verticalAlign: 'middle',
  },
  editSaveButton: {
    minWidth: 56,
    width: 70,
    height: 40,
    marginLeft: 4,
    marginRight: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  editSaveButtonLabel: {
    fontSize: 14,
    textAlign: 'center',
  },
  cancelButton: {
    marginTop: 1,
    minHeight: 18,
    height: 18,
    alignSelf: 'center',
    paddingVertical: 0,
    paddingHorizontal: 0,
  },
  cancelButtonLabel: {
    fontSize: 12,
    lineHeight: 16,
    paddingVertical: 0,
    paddingHorizontal: 0,
  },
  amountInputColumnWithCancel: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 4,
    paddingVertical: 0,
    paddingHorizontal: 0,
  },
  amountUnitPadded: {
    color: '#555',
    marginRight: 8,
    fontSize: 14,
    minWidth: 60,
    textAlign: 'left',
    paddingVertical: 2,
    paddingHorizontal: 2,
  },
  amountValueShifted: {
    marginLeft: 9,
  },
  showTotalButton: {
    height: 40,
    marginLeft: 8,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 0,
  },
  showTotalButtonLabel: {
    fontSize: 14,
    margin: 0,
    padding: 0,
    textAlign: 'center',
  },
  showTotalButtonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 18,
  },
}); 
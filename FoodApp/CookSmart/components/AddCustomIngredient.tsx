import { router } from 'expo-router';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Button, Modal, Portal, SegmentedButtons, Text, TextInput, useTheme } from 'react-native-paper';
import { addIngredient } from '../services/storage';

interface AddCustomIngredientProps {
  visible: boolean;
  onDismiss: () => void;
  initialName?: string;
}

export default function AddCustomIngredient({ visible, onDismiss, initialName = '' }: AddCustomIngredientProps) {
  const theme = useTheme();
  const [name, setName] = useState(initialName);
  const [category, setCategory] = useState('');
  const [inputMethod, setInputMethod] = useState('manual');
  const [nutrition, setNutrition] = useState({
    calories: '',
    protein: '',
    carbs: '',
    fat: '',
    servingSize: '',
    servingUnit: 'g'
  });

  const handleSave = async () => {
    if (name.trim()) {
      const ingredient = {
        id: Date.now().toString(),
        name: name.trim(),
        category: category.trim(),
        calories: parseFloat(nutrition.calories) || 0,
        protein: parseFloat(nutrition.protein) || 0,
        carbs: parseFloat(nutrition.carbs) || 0,
        fat: parseFloat(nutrition.fat) || 0,
        serving_size: parseFloat(nutrition.servingSize) || 100,
        serving_unit: nutrition.servingUnit,
        added_at: new Date().toISOString(),
        count: 1
      };
      
      await addIngredient(ingredient);
      onDismiss();
      router.back();
    }
  };

  const handleScanNutrition = () => {
    router.push('/(modals)/scan');
  };

  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={onDismiss}
        contentContainerStyle={[styles.modal, { backgroundColor: theme.colors.surface }]}
      >
        <ScrollView>
          <Text variant="headlineSmall" style={[styles.title, { color: theme.colors.onSurface }]}>Add Custom Ingredient</Text>
          
          <TextInput
            label="Ingredient Name"
            value={name}
            onChangeText={setName}
            style={styles.input}
          />
          
          <TextInput
            label="Category (e.g., Meat, Vegetables, Dairy)"
            value={category}
            onChangeText={setCategory}
            style={styles.input}
          />

          <Text variant="titleMedium" style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>Nutrition Information</Text>
          
          <SegmentedButtons
            value={inputMethod}
            onValueChange={setInputMethod}
            buttons={[
              { value: 'manual', label: 'Manual Input' },
              { value: 'scan', label: 'Scan Label' }
            ]}
            style={styles.segmentedButtons}
          />

          {inputMethod === 'manual' ? (
            <View style={styles.nutritionInputs}>
              <TextInput
                label="Calories"
                value={nutrition.calories}
                onChangeText={(text) => setNutrition({ ...nutrition, calories: text })}
                keyboardType="numeric"
                style={styles.input}
              />
              <TextInput
                label="Protein (g)"
                value={nutrition.protein}
                onChangeText={(text) => setNutrition({ ...nutrition, protein: text })}
                keyboardType="numeric"
                style={styles.input}
              />
              <TextInput
                label="Carbs (g)"
                value={nutrition.carbs}
                onChangeText={(text) => setNutrition({ ...nutrition, carbs: text })}
                keyboardType="numeric"
                style={styles.input}
              />
              <TextInput
                label="Fat (g)"
                value={nutrition.fat}
                onChangeText={(text) => setNutrition({ ...nutrition, fat: text })}
                keyboardType="numeric"
                style={styles.input}
              />
              <View style={styles.servingSizeContainer}>
                <TextInput
                  label="Serving Size"
                  value={nutrition.servingSize}
                  onChangeText={(text) => setNutrition({ ...nutrition, servingSize: text })}
                  keyboardType="numeric"
                  style={[styles.input, styles.servingSizeInput]}
                />
                <TextInput
                  label="Unit"
                  value={nutrition.servingUnit}
                  onChangeText={(text) => setNutrition({ ...nutrition, servingUnit: text })}
                  style={[styles.input, styles.unitInput]}
                />
              </View>
            </View>
          ) : (
            <View style={styles.scanContainer}>
              <Text style={[styles.scanText, { color: theme.colors.onSurfaceVariant }]}>
                Scan the nutrition label to automatically fill in the nutritional information.
              </Text>
              <Button
                mode="contained"
                onPress={handleScanNutrition}
                style={styles.scanButton}
              >
                Scan Nutrition Label
              </Button>
            </View>
          )}

          <View style={styles.buttonContainer}>
            <Button
              mode="outlined"
              onPress={onDismiss}
              style={styles.button}
            >
              Cancel
            </Button>
            <Button
              mode="contained"
              onPress={handleSave}
              style={styles.button}
              disabled={!name.trim()}
            >
              Save Ingredient
            </Button>
          </View>
        </ScrollView>
      </Modal>
    </Portal>
  );
}

const styles = StyleSheet.create({
  modal: {
    margin: 20,
    borderRadius: 8,
    maxHeight: '80%',
  },
  title: {
    textAlign: 'center',
    marginVertical: 16,
  },
  sectionTitle: {
    marginTop: 16,
    marginBottom: 8,
  },
  input: {
    marginBottom: 12,
  },
  segmentedButtons: {
    marginBottom: 16,
  },
  nutritionInputs: {
    marginBottom: 16,
  },
  servingSizeContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  servingSizeInput: {
    flex: 2,
  },
  unitInput: {
    flex: 1,
  },
  scanContainer: {
    padding: 16,
    alignItems: 'center',
  },
  scanText: {
    textAlign: 'center',
    marginBottom: 16,
  },
  scanButton: {
    width: '100%',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
    marginBottom: 24,
    gap: 12,
  },
  button: {
    flex: 1,
  },
}); 
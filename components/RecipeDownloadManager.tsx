import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import {
  Button,
  Card,
  ProgressBar,
  Chip,
  TextInput,
  Switch,
  Divider,
  List,
  IconButton,
} from 'react-native-paper';
import { recipeDownloader, DownloadProgress, DownloadOptions } from '../services/recipeDownloader';
import { getRecipeCount, getAllRecipes, clearAllRecipes } from '../services/recipeStorage';
import { Recipe } from '../types';

interface RecipeDownloadManagerProps {
  onRecipesUpdated?: (recipes: Recipe[]) => void;
}

export default function RecipeDownloadManager({ onRecipesUpdated }: RecipeDownloadManagerProps) {
  const [isDownloading, setIsDownloading] = useState(false);
  const [progress, setProgress] = useState<DownloadProgress | null>(null);
  const [recipeCount, setRecipeCount] = useState(0);
  const [downloadedRecipes, setDownloadedRecipes] = useState<Recipe[]>([]);
  const [showAdvanced, setShowAdvanced] = useState(false);
  
  // Download options
  const [maxRecipes, setMaxRecipes] = useState('500');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedCuisines, setSelectedCuisines] = useState<string[]>([]);
  const [selectedDiets, setSelectedDiets] = useState<string[]>([]);
  const [clearExisting, setClearExisting] = useState(false);

  // Available options
  const availableCategories = [
    'chicken', 'pasta', 'salad', 'soup', 'dessert', 'breakfast',
    'vegetarian', 'vegan', 'quick', 'healthy', 'italian', 'mexican',
    'asian', 'mediterranean', 'american', 'french', 'indian', 'thai'
  ];

  const availableCuisines = [
    'italian', 'mexican', 'asian', 'mediterranean', 'american',
    'french', 'indian', 'thai', 'japanese', 'chinese', 'korean',
    'greek', 'spanish', 'middle eastern', 'african'
  ];

  const availableDiets = [
    'vegetarian', 'vegan', 'gluten-free', 'dairy-free', 'low-carb',
    'keto', 'paleo', 'pescatarian', 'mediterranean', 'dash'
  ];

  useEffect(() => {
    loadRecipeCount();
    loadDownloadedRecipes();
  }, []);

  const loadRecipeCount = async () => {
    try {
      const count = await getRecipeCount();
      setRecipeCount(count);
    } catch (error) {
      console.error('Error loading recipe count:', error);
    }
  };

  const loadDownloadedRecipes = async () => {
    try {
      const recipes = await getAllRecipes();
      setDownloadedRecipes(recipes.slice(0, 10)); // Show first 10
      onRecipesUpdated?.(recipes);
    } catch (error) {
      console.error('Error loading recipes:', error);
    }
  };

  const handleDownload = async () => {
    if (isDownloading) return;

    const options: DownloadOptions = {
      maxRecipes: parseInt(maxRecipes) || 500,
      categories: selectedCategories,
      cuisines: selectedCuisines,
      diets: selectedDiets,
      clearExisting,
      onProgress: (progress) => {
        setProgress(progress);
        if (progress.status === 'complete') {
          setIsDownloading(false);
          loadRecipeCount();
          loadDownloadedRecipes();
        }
      }
    };

    try {
      setIsDownloading(true);
      setProgress(null);
      
      const recipes = await recipeDownloader.downloadRecipes(options);
      
      Alert.alert(
        'Download Complete',
        `Successfully downloaded ${recipes.length} recipes!`,
        [{ text: 'OK' }]
      );
    } catch (error) {
      console.error('Download error:', error);
      Alert.alert(
        'Download Failed',
        error instanceof Error ? error.message : 'An error occurred during download',
        [{ text: 'OK' }]
      );
    } finally {
      setIsDownloading(false);
    }
  };

  const handleClearRecipes = async () => {
    Alert.alert(
      'Clear All Recipes',
      'Are you sure you want to delete all downloaded recipes? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            try {
              await clearAllRecipes();
              setRecipeCount(0);
              setDownloadedRecipes([]);
              onRecipesUpdated?.([]);
              Alert.alert('Success', 'All recipes have been cleared.');
            } catch (error) {
              console.error('Error clearing recipes:', error);
              Alert.alert('Error', 'Failed to clear recipes.');
            }
          }
        }
      ]
    );
  };

  const toggleCategory = (category: string) => {
    setSelectedCategories(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const toggleCuisine = (cuisine: string) => {
    setSelectedCuisines(prev =>
      prev.includes(cuisine)
        ? prev.filter(c => c !== cuisine)
        : [...prev, cuisine]
    );
  };

  const toggleDiet = (diet: string) => {
    setSelectedDiets(prev =>
      prev.includes(diet)
        ? prev.filter(d => d !== diet)
        : [...prev, diet]
    );
  };

  const getProgressPercentage = () => {
    if (!progress) return 0;
    return progress.total > 0 ? (progress.current / progress.total) * 100 : 0;
  };

  const getStatusColor = () => {
    if (!progress) return '#666';
    switch (progress.status) {
      case 'downloading': return '#2196F3';
      case 'processing': return '#FF9800';
      case 'saving': return '#4CAF50';
      case 'complete': return '#4CAF50';
      case 'error': return '#F44336';
      default: return '#666';
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.card}>
        <Card.Title title="Recipe Download Manager" />
        <Card.Content>
          <Text style={styles.description}>
            Download recipes in bulk from popular recipe websites and APIs. This will add recipes to your local database for offline use. Currently stored: {recipeCount} recipes
          </Text>

          {/* Basic Options */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Download Options</Text>
            <TextInput
              label="Maximum Recipes"
              value={maxRecipes}
              onChangeText={setMaxRecipes}
              keyboardType="numeric"
              style={styles.input}
            />
            <View style={styles.switchRow}>
              <Text>Clear existing recipes before download</Text>
              <Switch
                value={clearExisting}
                onValueChange={setClearExisting}
              />
            </View>
          </View>

          {/* Advanced Options Toggle */}
          <Button
            mode="text"
            onPress={() => setShowAdvanced(!showAdvanced)}
            icon={showAdvanced ? 'chevron-up' : 'chevron-down'}
          >
            {showAdvanced ? 'Hide' : 'Show'} Advanced Options
          </Button>

          {/* Advanced Options */}
          {showAdvanced && (
            <>
              {/* Categories */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Categories</Text>
                <View style={styles.chipContainer}>
                  {availableCategories.map(category => (
                    <Chip
                      key={category}
                      selected={selectedCategories.includes(category)}
                      onPress={() => toggleCategory(category)}
                      style={styles.chip}
                      mode="outlined"
                    >
                      {category}
                    </Chip>
                  ))}
                </View>
              </View>

              {/* Cuisines */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Cuisines</Text>
                <View style={styles.chipContainer}>
                  {availableCuisines.map(cuisine => (
                    <Chip
                      key={cuisine}
                      selected={selectedCuisines.includes(cuisine)}
                      onPress={() => toggleCuisine(cuisine)}
                      style={styles.chip}
                      mode="outlined"
                    >
                      {cuisine}
                    </Chip>
                  ))}
                </View>
              </View>

              {/* Diets */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Dietary Preferences</Text>
                <View style={styles.chipContainer}>
                  {availableDiets.map(diet => (
                    <Chip
                      key={diet}
                      selected={selectedDiets.includes(diet)}
                      onPress={() => toggleDiet(diet)}
                      style={styles.chip}
                      mode="outlined"
                    >
                      {diet}
                    </Chip>
                  ))}
                </View>
              </View>
            </>
          )}

          {/* Progress Display */}
          {progress && (
            <View style={styles.progressSection}>
              <Text style={styles.sectionTitle}>Download Progress</Text>
              <View style={styles.progressInfo}>
                <Text style={[styles.statusText, { color: getStatusColor() }]}>
                  {progress.status.toUpperCase()}
                </Text>
                <Text style={styles.sourceText}>{progress.source}</Text>
              </View>
              <ProgressBar
                progress={getProgressPercentage() / 100}
                color={getStatusColor()}
                style={styles.progressBar}
              />
              <Text style={styles.progressText}>
                {progress.current} / {progress.total} recipes
              </Text>
              <Text style={styles.messageText}>{progress.message}</Text>
            </View>
          )}

          {/* Action Buttons */}
          <View style={styles.buttonContainer}>
            <Button
              mode="contained"
              onPress={handleDownload}
              disabled={isDownloading}
              loading={isDownloading}
              style={styles.downloadButton}
              icon="download"
            >
              {isDownloading ? 'Downloading...' : 'Download Recipes'}
            </Button>

            <Button
              mode="outlined"
              onPress={handleClearRecipes}
              disabled={isDownloading || recipeCount === 0}
              style={styles.clearButton}
              icon="delete"
            >
              Clear All Recipes
            </Button>
          </View>
        </Card.Content>
      </Card>

      {/* Downloaded Recipes Preview */}
      {downloadedRecipes.length > 0 && (
        <Card style={styles.card}>
          <Card.Title title="Recently Downloaded Recipes" />
          <Card.Content>
            {downloadedRecipes.map((recipe, index) => (
              <List.Item
                key={recipe.id}
                title={recipe.title}
                description={`${recipe.readyInMinutes} min • ${recipe.servings} servings • ${recipe.calories} cal`}
                left={props => <List.Icon {...props} icon="food" />}
                right={props => (
                  <View style={styles.recipeTags}>
                    {recipe.tags.slice(0, 2).map(tag => (
                      <Chip key={tag} compact style={styles.smallChip}>
                        {tag}
                      </Chip>
                    ))}
                  </View>
                )}
              />
            ))}
            {recipeCount > 10 && (
              <Text style={styles.moreText}>
                ... and {recipeCount - 10} more recipes
              </Text>
            )}
          </Card.Content>
        </Card>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  card: {
    marginBottom: 16,
  },
  description: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  input: {
    marginBottom: 12,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    marginBottom: 8,
  },
  smallChip: {
    marginLeft: 4,
  },
  progressSection: {
    marginBottom: 20,
    padding: 16,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
  },
  progressInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusText: {
    fontWeight: 'bold',
    fontSize: 14,
  },
  sourceText: {
    fontSize: 12,
    color: '#666',
  },
  progressBar: {
    marginBottom: 8,
  },
  progressText: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  messageText: {
    fontSize: 12,
    color: '#666',
  },
  buttonContainer: {
    gap: 12,
  },
  downloadButton: {
    marginBottom: 8,
  },
  clearButton: {
    marginBottom: 8,
  },
  recipeTags: {
    flexDirection: 'row',
    gap: 4,
  },
  moreText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginTop: 8,
  },
}); 
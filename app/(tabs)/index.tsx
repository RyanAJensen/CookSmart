import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, useTheme as usePaperTheme, Button, Card, IconButton } from 'react-native-paper';
import { router } from 'expo-router';
import { getIngredients } from '../../services/storage';
import { Ingredient } from '../../types';
import { useFocusEffect } from '@react-navigation/native';
import { useTheme } from '../../contexts/ThemeContext';
import AnimatedThemeToggle from '../../components/AnimatedThemeToggle';

export default function Page() {
  const paperTheme = usePaperTheme();
  const { themeMode, setThemeMode, isDark } = useTheme();
  const [ingredientCount, setIngredientCount] = useState(0);
  const [totalCalories, setTotalCalories] = useState(0);
  const [totalProtein, setTotalProtein] = useState(0);
  const [totalCarbs, setTotalCarbs] = useState(0);
  const [totalFat, setTotalFat] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadPantryStats();
  }, []);

  // Refresh stats when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      loadPantryStats();
    }, [])
  );

  const loadPantryStats = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const ingredients = await getIngredients();
      setIngredientCount(ingredients.length);
      
      const totals = ingredients.reduce((sum, ing) => {
        const count = ing.count || 1;
        return {
          calories: sum.calories + ((ing.calories || 0) * count),
          protein: sum.protein + ((ing.protein || 0) * count),
          carbs: sum.carbs + ((ing.carbs || 0) * count),
          fat: sum.fat + ((ing.fat || 0) * count),
        };
      }, { calories: 0, protein: 0, carbs: 0, fat: 0 });
      
      setTotalCalories(Math.round(totals.calories));
      setTotalProtein(Math.round(totals.protein * 10) / 10);
      setTotalCarbs(Math.round(totals.carbs * 10) / 10);
      setTotalFat(Math.round(totals.fat * 10) / 10);
    } catch (error) {
      console.error('Error loading pantry stats:', error);
      setError('Failed to load pantry information');
    } finally {
      setIsLoading(false);
    }
  };

  const QuickActionButton = ({ 
    title, 
    subtitle, 
    icon, 
    onPress, 
    color = paperTheme.colors.primary 
  }: {
    title: string;
    subtitle: string;
    icon: string;
    onPress: () => void;
    color?: string;
    }) => (
    <Card 
      mode="outlined"
      onPress={onPress}
      style={[styles.quickActionCard, { backgroundColor: paperTheme.colors.surface }]}
    >
      <Card.Content style={styles.quickActionContent}>
        <IconButton
          icon={icon}
          size={32}
          iconColor={color}
          style={styles.quickActionIcon}
        />
        <View style={styles.quickActionText}>
          <Text variant="titleMedium" style={[styles.quickActionTitle, { color }]}>
            {title}
          </Text>
          <Text variant="bodySmall" style={[styles.quickActionSubtitle, { color: paperTheme.colors.onSurface }]}>
            {subtitle}
          </Text>
        </View>
        <IconButton
          icon="chevron-right"
          size={20}
          iconColor={paperTheme.colors.onSurface}
        />
              </Card.Content>
      </Card>
    );

  return (
    <ScrollView style={[styles.container, { backgroundColor: paperTheme.colors.background }]}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text variant="displaySmall" style={[styles.title, { color: paperTheme.colors.primary }]}>
            CookSmart
          </Text>
          <Text variant="bodyLarge" style={[styles.subtitle, { color: paperTheme.colors.onSurface }]}>
            Your personal pantry assistant
          </Text>
        </View>
        <AnimatedThemeToggle size={24} style={styles.themeToggle} />
      </View>

      {/* Pantry Stats */}
      <View style={styles.statsContainer}>
        <Card style={[styles.statsCard, { backgroundColor: paperTheme.colors.surface }]} mode="outlined">
          <Card.Content style={styles.statsContent}>
            <View style={styles.statItem}>
              <Text variant="headlineMedium" style={[styles.statNumber, { color: paperTheme.colors.primary }]}>
                {isLoading ? '...' : error ? '0' : ingredientCount}
              </Text>
              <Text variant="bodySmall" style={[styles.statLabel, { color: paperTheme.colors.onSurface }]}>
                Ingredients
              </Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text variant="headlineMedium" style={[styles.statNumber, { color: paperTheme.colors.primary }]}>
                {isLoading ? '...' : error ? '0' : totalCalories}
              </Text>
              <Text variant="bodySmall" style={[styles.statLabel, { color: paperTheme.colors.onSurface }]}>
                Total Calories
              </Text>
            </View>
          </Card.Content>
        </Card>
        
        {/* Nutrition Stats */}
        <Card style={[styles.nutritionCard, { backgroundColor: paperTheme.colors.surface }]} mode="outlined">
          <Card.Content style={styles.nutritionContent}>
            <View style={styles.nutritionItem}>
              <Text variant="bodyMedium" style={[styles.nutritionValue, { color: isDark ? '#FF6B6B' : '#E57373' }]}>
                {isLoading ? '...' : error ? '0' : totalProtein}g
              </Text>
              <Text variant="bodySmall" style={[styles.nutritionLabel, { color: paperTheme.colors.onSurface }]}>
                Protein
              </Text>
            </View>
            <View style={styles.nutritionItem}>
              <Text variant="bodyMedium" style={[styles.nutritionValue, { color: isDark ? '#4ECDC4' : '#81C784' }]}>
                {isLoading ? '...' : error ? '0' : totalCarbs}g
              </Text>
              <Text variant="bodySmall" style={[styles.nutritionLabel, { color: paperTheme.colors.onSurface }]}>
                Carbs
              </Text>
            </View>
            <View style={styles.nutritionItem}>
              <Text variant="bodyMedium" style={[styles.nutritionValue, { color: isDark ? '#FFD93D' : '#FFB74D' }]}>
                {isLoading ? '...' : error ? '0' : totalFat}g
              </Text>
              <Text variant="bodySmall" style={[styles.nutritionLabel, { color: paperTheme.colors.onSurface }]}>
                Fat
              </Text>
            </View>
          </Card.Content>
        </Card>
        
        {error && (
          <Text variant="bodySmall" style={[styles.errorText, { color: paperTheme.colors.error }]}>
            {error}
          </Text>
        )}
      </View>

      {/* Quick Actions */}
      <View style={styles.quickActionsContainer}>
        <Text variant="titleMedium" style={[styles.sectionTitle, { color: paperTheme.colors.onSurface }]}>
          Quick Actions
        </Text>
        
        <QuickActionButton
          title="Scan Barcode"
          subtitle="Add ingredient by scanning"
          icon="barcode-scan"
          onPress={() => router.push('/(modals)/scan')}
          color="#4CAF50"
        />
        
        <QuickActionButton
          title="Add Manually"
          subtitle="Type ingredient details"
          icon="plus-circle"
          onPress={() => router.push('/(modals)/type-ingredient')}
          color="#2196F3"
        />
        
        <QuickActionButton
          title="AI Recipes (Coming Soon)"
          subtitle="AI-powered recipes from your pantry"
          icon="chef-hat"
          onPress={() => router.push('/recipes?mode=ai')}
          color="#FF6B35"
        />
        
        <QuickActionButton
          title="View Pantry"
          subtitle="Manage your ingredients"
          icon="fridge"
          onPress={() => router.push('/pantry')}
          color="#4ECDC4"
        />
        
        <QuickActionButton
          title="Saved Recipes"
          subtitle="Your favorite recipes"
          icon="bookmark"
          onPress={() => router.push('/saved-recipes')}
          color="#45B7D1"
        />
      </View>

      {/* Features */}
      <View style={styles.featuresContainer}>
        <Text variant="titleMedium" style={[styles.sectionTitle, { color: paperTheme.colors.onSurface }]}>
          Features
        </Text>
        
        <View style={styles.featuresGrid}>
          <View style={[styles.feature, { backgroundColor: paperTheme.colors.surface }]}>
            <IconButton icon="barcode-scan" size={24} iconColor={paperTheme.colors.primary} />
            <Text variant="bodyMedium" style={[styles.featureText, { color: paperTheme.colors.onSurface }]}>
              Instant barcode scanning
            </Text>
          </View>
          
          <View style={[styles.feature, { backgroundColor: paperTheme.colors.surface }]}>
            <IconButton icon="brain" size={24} iconColor={paperTheme.colors.primary} />
            <Text variant="bodyMedium" style={[styles.featureText, { color: paperTheme.colors.onSurface }]}>
              AI recipe generation (coming soon)
            </Text>
          </View>
          
          <View style={[styles.feature, { backgroundColor: paperTheme.colors.surface }]}>
            <IconButton icon="nutrition" size={24} iconColor={paperTheme.colors.primary} />
            <Text variant="bodyMedium" style={[styles.featureText, { color: paperTheme.colors.onSurface }]}>
              Nutrition tracking
            </Text>
          </View>
          
          <View style={[styles.feature, { backgroundColor: paperTheme.colors.surface }]}>
            <IconButton icon="cog" size={24} iconColor={paperTheme.colors.primary} />
            <Text variant="bodyMedium" style={[styles.featureText, { color: paperTheme.colors.onSurface }]}>
              Customizable preferences
            </Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 24,
    paddingTop: 80,
  },
  headerContent: {
    flex: 1,
    alignItems: 'center',
  },
  themeToggle: {
    position: 'absolute',
    right: 24,
    top: 80,
  },
  title: {
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    textAlign: 'center',
    opacity: 0.8,
  },
  statsContainer: {
    padding: 24,
    alignItems: 'center',
  },
  statsCard: {
    width: '100%',
    borderRadius: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statsContent: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 16,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    opacity: 0.7,
  },
  statDivider: {
    width: 1,
    height: '80%',
    backgroundColor: '#E0E0E0',
    marginVertical: 8,
  },
  nutritionCard: {
    width: '100%',
    borderRadius: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    marginTop: 16,
  },
  nutritionContent: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 16,
  },
  nutritionItem: {
    alignItems: 'center',
  },
  nutritionValue: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  nutritionLabel: {
    opacity: 0.7,
  },
  quickActionsContainer: {
    padding: 24,
    gap: 16,
  },
  sectionTitle: {
    fontWeight: '600',
    marginBottom: 16,
  },
  featuresContainer: {
    padding: 24,
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 16,
  },
  feature: {
    width: '45%', // Two features per row with some margin
    padding: 16,
    borderRadius: 12,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    alignItems: 'center',
  },
  featureText: {
    marginTop: 8,
    textAlign: 'center',
    opacity: 0.8,
  },
  quickActionCard: {
    borderRadius: 12,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  quickActionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  quickActionIcon: {
    marginRight: 12,
  },
  quickActionText: {
    flex: 1,
  },
  quickActionTitle: {
    fontWeight: '600',
  },
  quickActionSubtitle: {
    opacity: 0.7,
  },
  errorText: {
    marginTop: 16,
    textAlign: 'center',
  },
});
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, IconButton, useTheme } from 'react-native-paper';
import { router } from 'expo-router';
import RecipeDownloadManager from '../components/RecipeDownloadManager';

export default function RecipeDownloadScreen() {
  const theme = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={[styles.header, { backgroundColor: theme.colors.surface }]}>
        <View style={styles.backButtonContainer}>
          <IconButton
            icon="arrow-left"
            size={24}
            iconColor={theme.colors.onSurface}
            onPress={() => router.back()}
            style={styles.backButton}
          />
        </View>
        <Text 
          variant="headlineMedium" 
          style={[styles.centeredTitle, { color: theme.colors.onSurface }]}
        >
          Recipe Download Manager
        </Text>
      </View>
      
      <RecipeDownloadManager 
        onRecipesUpdated={(recipes) => {
          // Optionally handle recipe updates
          console.log('Recipes updated:', recipes.length);
        }}
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
    paddingTop: 60,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    minHeight: 100,
    position: 'relative',
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
  centeredTitle: {
    flex: 1,
    textAlign: 'center',
    fontWeight: '700',
    paddingLeft: 60,
    paddingRight: 60,
  },
}); 
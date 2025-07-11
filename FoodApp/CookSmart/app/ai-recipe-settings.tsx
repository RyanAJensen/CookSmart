import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Card, IconButton, Button, useTheme } from 'react-native-paper';
import { router } from 'expo-router';

export default function AIRecipeSettingsScreen() {
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
          style={[styles.title, { color: theme.colors.onSurface }]}
        >
          AI Recipe Settings
        </Text>
      </View>

      <ScrollView 
        style={[styles.content, { backgroundColor: theme.colors.background }]}
        contentContainerStyle={styles.contentContainer}
      >
        <Card style={[styles.comingSoonCard, { backgroundColor: theme.colors.surface }]} mode="outlined">
          <Card.Content style={styles.comingSoonContent}>
            <View style={styles.iconContainer}>
              <IconButton 
                icon="robot" 
                size={64} 
                iconColor={theme.colors.primary}
                style={[styles.aiIcon, { backgroundColor: theme.colors.primaryContainer }]}
              />
            </View>
            
            <Text variant="headlineSmall" style={[styles.comingSoonTitle, { color: theme.colors.primary }]}>
              Coming Soon!
            </Text>
            
            <Text variant="bodyLarge" style={[styles.comingSoonSubtitle, { color: theme.colors.onSurface }]}>
              AI Recipe Generation
            </Text>
            
            <Text variant="bodyMedium" style={[styles.comingSoonDescription, { color: theme.colors.onSurfaceVariant }]}>
              We're working hard to bring you intelligent recipe suggestions powered by artificial intelligence. 
              Soon you'll be able to customize your AI recipe preferences including:
            </Text>
            
            <View style={styles.featuresList}>
              <Text variant="bodyMedium" style={[styles.featureItem, { color: theme.colors.onSurface }]}>
                • Dietary restrictions and preferences
              </Text>
              <Text variant="bodyMedium" style={[styles.featureItem, { color: theme.colors.onSurface }]}>
                • Cooking style and skill level
              </Text>
              <Text variant="bodyMedium" style={[styles.featureItem, { color: theme.colors.onSurface }]}>
                • Maximum cooking time
              </Text>
              <Text variant="bodyMedium" style={[styles.featureItem, { color: theme.colors.onSurface }]}>
                • Serving size and nutrition focus
              </Text>
              <Text variant="bodyMedium" style={[styles.featureItem, { color: theme.colors.onSurface }]}>
                • Preferred cuisines and ingredients to avoid
              </Text>
            </View>
            
            <Text variant="bodyMedium" style={[styles.comingSoonDescription, { color: theme.colors.onSurfaceVariant }]}>
              For now, you can still search for recipes using your pantry ingredients with the "Find Recipes" feature.
            </Text>
            
            <Button 
              mode="contained" 
              onPress={() => router.back()}
              style={styles.goBackButton}
            >
              Go Back
            </Button>
          </Card.Content>
        </Card>
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
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    minHeight: 100,
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
  title: {
    flex: 1,
    textAlign: 'center',
    fontWeight: '700',
    paddingLeft: 80,
    paddingRight: 20,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 24,
  },
  comingSoonCard: {
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  comingSoonContent: {
    alignItems: 'center',
    padding: 24,
  },
  iconContainer: {
    marginBottom: 24,
  },
  aiIcon: {
    borderRadius: 50,
  },
  comingSoonTitle: {
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  comingSoonSubtitle: {
    fontWeight: '600',
    marginBottom: 24,
    textAlign: 'center',
  },
  comingSoonDescription: {
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  featuresList: {
    alignSelf: 'stretch',
    marginBottom: 24,
  },
  featureItem: {
    marginBottom: 8,
    paddingLeft: 8,
  },
  goBackButton: {
    marginTop: 16,
    paddingHorizontal: 32,
  },
}); 
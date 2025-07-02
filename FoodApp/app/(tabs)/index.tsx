import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, useTheme } from 'react-native-paper';

export default function Page() {
  const theme = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <Text variant="displaySmall" style={[styles.title, { color: theme.colors.primary }]}>
          CookSmart
        </Text>
        <Text variant="bodyLarge" style={[styles.subtitle, { color: theme.colors.onSurface }]}>
          Your personal pantry assistant
        </Text>
      </View>

      <View style={styles.content}>
        <View style={[styles.decorativeCircle, { backgroundColor: theme.colors.primary }]} />
        <View style={[styles.decorativeCircle, styles.circle2, { backgroundColor: theme.colors.secondary }]} />
        <View style={[styles.decorativeCircle, styles.circle3, { backgroundColor: theme.colors.primary }]} />
        
        <View style={styles.featureContainer}>
          <View style={[styles.feature, { backgroundColor: theme.colors.surface }]}>
            <Text variant="titleMedium" style={[styles.featureTitle, { color: theme.colors.primary }]}>
              Smart Pantry
            </Text>
            <Text variant="bodyMedium" style={[styles.featureText, { color: theme.colors.onSurface }]}>
              Keep track of your ingredients with ease
            </Text>
          </View>

          <View style={[styles.feature, { backgroundColor: theme.colors.surface }]}>
            <Text variant="titleMedium" style={[styles.featureTitle, { color: theme.colors.primary }]}>
              Instant Scan
            </Text>
            <Text variant="bodyMedium" style={[styles.featureText, { color: theme.colors.onSurface }]}>
              Add ingredients with a quick barcode scan
            </Text>
          </View>

          <View style={[styles.feature, { backgroundColor: theme.colors.surface }]}>
            <Text variant="titleMedium" style={[styles.featureTitle, { color: theme.colors.primary }]}>
              Nutrition Info
            </Text>
            <Text variant="bodyMedium" style={[styles.featureText, { color: theme.colors.onSurface }]}>
              Access detailed nutritional information
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    padding: 24,
    paddingTop: 80,
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
  content: {
    flex: 1,
    position: 'relative',
    padding: 24,
  },
  decorativeCircle: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    opacity: 0.1,
  },
  circle2: {
    top: '30%',
    right: -100,
    width: 300,
    height: 300,
    borderRadius: 150,
  },
  circle3: {
    bottom: -50,
    left: -50,
    width: 250,
    height: 250,
    borderRadius: 125,
  },
  featureContainer: {
    flex: 1,
    justifyContent: 'center',
    gap: 24,
  },
  feature: {
    padding: 24,
    borderRadius: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  featureTitle: {
    fontWeight: '600',
    marginBottom: 8,
  },
  featureText: {
    opacity: 0.8,
    lineHeight: 20,
  },
});
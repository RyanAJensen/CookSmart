import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Button, useTheme } from 'react-native-paper';

interface ErrorDisplayProps {
  message: string;
  onRetry?: () => void;
  showRetry?: boolean;
}

export default function ErrorDisplay({ 
  message, 
  onRetry, 
  showRetry = true 
}: ErrorDisplayProps) {
  const theme = useTheme();

  return (
    <View style={styles.container}>
      <Text 
        variant="headlineSmall" 
        style={[styles.title, { color: theme.colors.error }]}
      >
        Oops!
      </Text>
      <Text 
        variant="bodyMedium" 
        style={[styles.message, { color: theme.colors.onSurface }]}
      >
        {message}
      </Text>
      {showRetry && onRetry && (
        <Button
          mode="outlined"
          onPress={onRetry}
          style={styles.retryButton}
          textColor={theme.colors.primary}
        >
          Try Again
        </Button>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  title: {
    fontWeight: 'bold',
    marginBottom: 16,
  },
  message: {
    textAlign: 'center',
    marginBottom: 24,
    opacity: 0.8,
    lineHeight: 20,
  },
  retryButton: {
    marginTop: 8,
  },
}); 
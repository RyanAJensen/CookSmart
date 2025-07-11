import React from 'react';
import { View, StyleSheet } from 'react-native';
import { ActivityIndicator, Text, useTheme } from 'react-native-paper';

interface LoadingSpinnerProps {
  message?: string;
  size?: 'small' | 'large';
}

export default function LoadingSpinner({ 
  message = 'Loading...', 
  size = 'large' 
}: LoadingSpinnerProps) {
  const theme = useTheme();

  return (
    <View style={styles.container}>
      <ActivityIndicator 
        size={size} 
        color={theme.colors.primary} 
      />
      <Text 
        variant="bodyMedium" 
        style={[styles.message, { color: theme.colors.onSurface }]}
      >
        {message}
      </Text>
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
  message: {
    marginTop: 16,
    textAlign: 'center',
    opacity: 0.7,
  },
}); 
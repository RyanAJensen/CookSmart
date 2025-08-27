import React from 'react';
import { View, StyleSheet } from 'react-native';
import { ActivityIndicator, Text, useTheme } from 'react-native-paper';
import CookSmartLogo from './CookSmartLogo';

interface LoadingScreenProps {
  message?: string;
  showLogo?: boolean;
}

export default function LoadingScreen({ 
  message = "Loading...", 
  showLogo = true 
}: LoadingScreenProps) {
  const theme = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {showLogo && (
        <CookSmartLogo 
          size="large" 
          variant="full" 
          style={styles.logo}
        />
      )}
      
      <ActivityIndicator 
        size="large" 
        color={theme.colors.primary}
        style={styles.spinner}
      />
      
      <Text 
        variant="bodyLarge" 
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
  logo: {
    marginBottom: 32,
  },
  spinner: {
    marginBottom: 16,
  },
  message: {
    textAlign: 'center',
    opacity: 0.8,
  },
}); 
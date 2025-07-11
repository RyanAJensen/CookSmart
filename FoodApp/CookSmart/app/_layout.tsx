import { Stack } from 'expo-router';
import { View, Animated } from 'react-native';
import { MD3DarkTheme, MD3LightTheme, PaperProvider } from 'react-native-paper';
import { SQLiteProvider } from '../components/SQLiteProvider';
import CustomTabBar from '../components/CustomTabBar';
import { ThemeProvider, useTheme } from '../contexts/ThemeContext';
import ThemeOverlay from '../components/ThemeOverlay';
import { useCascadeFade } from '../hooks/useCascadeFade';

const lightTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: '#FF6B35', // Warm orange - appetizing and welcoming
    secondary: '#FF8A65', // Lighter orange
    error: '#E57373', // Softer red
    surface: '#FFF8F0', // Warm off-white
    background: '#FFF5E6', // Very light warm background
    onSurface: '#5D4037', // Warm brown text
    onBackground: '#5D4037', // Warm brown text
    surfaceVariant: '#FFE0B2', // Light orange surface variant
    onSurfaceVariant: '#8D6E63', // Medium brown for surface variant text
  },
};

const darkTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: '#4CAF50', // Keep the green for dark mode
    secondary: '#81C784', // Lighter green
    error: '#EF5350', // Bright red for dark mode
    surface: '#1E1E1E', // Dark surface
    background: '#121212', // Very dark background
    onSurface: '#FFFFFF', // White text
    onBackground: '#FFFFFF', // White text
    surfaceVariant: '#2E2E2E', // Slightly lighter dark surface
    onSurfaceVariant: '#BDBDBD', // Light gray for surface variant text
  },
};

function AppContent() {
  const { isDark, isTransitioning, isLoading } = useTheme();
  const theme = isDark ? darkTheme : lightTheme;
  const { opacity, translateY } = useCascadeFade(0);

  // Don't render until theme is loaded
  if (isLoading) {
    return null;
  }

  return (
    <PaperProvider theme={theme}>
      <Animated.View 
        style={{ 
          flex: 1,
          backgroundColor: theme.colors.background,
          opacity: isTransitioning ? opacity : 1, // Only apply cascade during transitions
          transform: [
            { translateY: isTransitioning ? translateY : 0 }, // Only apply cascade during transitions
          ],
        }}
      >
        <View style={{ flex: 1 }}>
          <Stack>
            <Stack.Screen 
              name="(tabs)" 
              options={{ 
                headerShown: false,
                animation: 'none'
              }} 
            />
            <Stack.Screen 
              name="(modals)" 
              options={{ 
                presentation: 'modal',
                headerShown: false
              }} 
            />
            <Stack.Screen 
              name="recipes" 
              options={{ 
                headerShown: false
              }} 
            />
            <Stack.Screen 
              name="saved-recipes" 
              options={{ 
                headerShown: false
              }} 
            />
            <Stack.Screen 
              name="ai-recipe-settings" 
              options={{ 
                headerShown: false
              }} 
            />
          </Stack>
        </View>
        <CustomTabBar />
        <ThemeOverlay />
      </Animated.View>
    </PaperProvider>
  );
}

export default function RootLayout() {
  return (
    <SQLiteProvider>
      <ThemeProvider>
        <AppContent />
      </ThemeProvider>
    </SQLiteProvider>
  );
}

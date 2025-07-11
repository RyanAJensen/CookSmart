import { Animated } from 'react-native';

// Light theme colors
const lightColors = {
  primary: '#FF6B35',
  secondary: '#FF8A65',
  error: '#E57373',
  surface: '#FFF8F0',
  background: '#FFF5E6',
  onSurface: '#5D4037',
  onBackground: '#5D4037',
  surfaceVariant: '#FFE0B2',
  onSurfaceVariant: '#8D6E63',
  outline: '#E0E0E0',
};

// Dark theme colors
const darkColors = {
  primary: '#4CAF50',
  secondary: '#81C784',
  error: '#EF5350',
  surface: '#1E1E1E',
  background: '#121212',
  onSurface: '#FFFFFF',
  onBackground: '#FFFFFF',
  surfaceVariant: '#2E2E2E',
  onSurfaceVariant: '#BDBDBD',
  outline: '#424242',
};

export function createDynamicTheme(
  animation: Animated.Value,
  isDark: boolean,
  isTransitioning: boolean,
  targetThemeMode?: 'light' | 'dark' | 'system' | null
) {
  // Determine target theme
  const targetIsDark = targetThemeMode === 'system' 
    ? false // We'll need to get system color scheme here
    : targetThemeMode === 'dark';

  if (!isTransitioning && !targetThemeMode) {
    // Return static theme based on current state
    return {
      colors: isDark ? darkColors : lightColors,
    };
  }

  // Create interpolated colors during transition
  // Interpolate from current theme to target theme

  return {
    colors: {
      primary: animation.interpolate({ 
        inputRange: [0, 1], 
        outputRange: [isDark ? darkColors.primary : lightColors.primary, targetIsDark ? darkColors.primary : lightColors.primary] 
      }),
      secondary: animation.interpolate({ 
        inputRange: [0, 1], 
        outputRange: [isDark ? darkColors.secondary : lightColors.secondary, targetIsDark ? darkColors.secondary : lightColors.secondary] 
      }),
      error: animation.interpolate({ 
        inputRange: [0, 1], 
        outputRange: [isDark ? darkColors.error : lightColors.error, targetIsDark ? darkColors.error : lightColors.error] 
      }),
      surface: animation.interpolate({ 
        inputRange: [0, 1], 
        outputRange: [isDark ? darkColors.surface : lightColors.surface, targetIsDark ? darkColors.surface : lightColors.surface] 
      }),
      background: animation.interpolate({ 
        inputRange: [0, 1], 
        outputRange: [isDark ? darkColors.background : lightColors.background, targetIsDark ? darkColors.background : lightColors.background] 
      }),
      onSurface: animation.interpolate({ 
        inputRange: [0, 1], 
        outputRange: [isDark ? darkColors.onSurface : lightColors.onSurface, targetIsDark ? darkColors.onSurface : lightColors.onSurface] 
      }),
      onBackground: animation.interpolate({ 
        inputRange: [0, 1], 
        outputRange: [isDark ? darkColors.onBackground : lightColors.onBackground, targetIsDark ? darkColors.onBackground : lightColors.onBackground] 
      }),
      surfaceVariant: animation.interpolate({ 
        inputRange: [0, 1], 
        outputRange: [isDark ? darkColors.surfaceVariant : lightColors.surfaceVariant, targetIsDark ? darkColors.surfaceVariant : lightColors.surfaceVariant] 
      }),
      onSurfaceVariant: animation.interpolate({ 
        inputRange: [0, 1], 
        outputRange: [isDark ? darkColors.onSurfaceVariant : lightColors.onSurfaceVariant, targetIsDark ? darkColors.onSurfaceVariant : lightColors.onSurfaceVariant] 
      }),
      outline: animation.interpolate({ 
        inputRange: [0, 1], 
        outputRange: [isDark ? darkColors.outline : lightColors.outline, targetIsDark ? darkColors.outline : lightColors.outline] 
      }),
    },
  };
} 
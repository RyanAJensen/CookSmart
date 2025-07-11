import { Animated } from 'react-native';

// Color interpolation utility
export function interpolateColor(
  animation: Animated.Value,
  lightColor: string,
  darkColor: string
): Animated.AnimatedInterpolation<string> {
  return animation.interpolate({
    inputRange: [0, 1],
    outputRange: [lightColor, darkColor],
  });
}

// Helper to convert hex to RGB
export function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : { r: 0, g: 0, b: 0 };
}

// Helper to convert RGB to hex
export function rgbToHex(r: number, g: number, b: number): string {
  return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}

// Create smooth color interpolation with intermediate steps
export function createSmoothColorInterpolation(
  animation: Animated.Value,
  lightColor: string,
  darkColor: string,
  steps: number = 10
): Animated.AnimatedInterpolation<string> {
  const lightRgb = hexToRgb(lightColor);
  const darkRgb = hexToRgb(darkColor);
  
  const inputRange: number[] = [];
  const outputRange: string[] = [];
  
  for (let i = 0; i <= steps; i++) {
    const progress = i / steps;
    inputRange.push(progress);
    
    const r = Math.round(lightRgb.r + (darkRgb.r - lightRgb.r) * progress);
    const g = Math.round(lightRgb.g + (darkRgb.g - lightRgb.g) * progress);
    const b = Math.round(lightRgb.b + (darkRgb.b - lightRgb.b) * progress);
    
    outputRange.push(rgbToHex(r, g, b));
  }
  
  return animation.interpolate({
    inputRange,
    outputRange,
  });
}

// Theme color pairs for smooth transitions
export const themeColors = {
  background: {
    light: '#FFF8F0',
    dark: '#121212'
  },
  surface: {
    light: '#FFFFFF',
    dark: '#1E1E1E'
  },
  primary: {
    light: '#FF6B35',
    dark: '#4CAF50'
  },
  onSurface: {
    light: '#5D4037',
    dark: '#FFFFFF'
  },
  onSurfaceVariant: {
    light: '#8D6E63',
    dark: '#BDBDBD'
  },
  outline: {
    light: '#E0E0E0',
    dark: '#424242'
  },
  error: {
    light: '#D32F2F',
    dark: '#EF5350'
  }
}; 
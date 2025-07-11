import React from 'react';
import { Animated, View, ViewStyle } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { createSmoothColorInterpolation, themeColors } from '../utils/colorInterpolation';

interface SmoothColorViewProps {
  children?: React.ReactNode;
  style?: ViewStyle;
  colorType?: 'background' | 'surface' | 'primary' | 'onSurface' | 'onSurfaceVariant' | 'outline' | 'error';
  customLightColor?: string;
  customDarkColor?: string;
}

export default function SmoothColorView({
  children,
  style,
  colorType = 'background',
  customLightColor,
  customDarkColor,
}: SmoothColorViewProps) {
  const { themeAnimation, isTransitioning } = useTheme();

  // Use custom colors or theme colors
  const lightColor = customLightColor || themeColors[colorType].light;
  const darkColor = customDarkColor || themeColors[colorType].dark;

  const animatedBackgroundColor = isTransitioning
    ? createSmoothColorInterpolation(themeAnimation, lightColor, darkColor)
    : undefined;

  return (
    <Animated.View
      style={[
        style,
        {
          backgroundColor: animatedBackgroundColor,
        },
      ]}
    >
      {children}
    </Animated.View>
  );
} 
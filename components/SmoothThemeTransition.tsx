import React, { useEffect, useRef } from 'react';
import { Animated, View, ViewStyle } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';

interface SmoothThemeTransitionProps {
  children: React.ReactNode;
  style?: ViewStyle;
  backgroundColor?: string;
  color?: string;
  borderColor?: string;
}

export default function SmoothThemeTransition({ 
  children, 
  style, 
  backgroundColor,
  color,
  borderColor 
}: SmoothThemeTransitionProps) {
  const { themeAnimation } = useTheme();
  const animatedStyle = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Sync with theme animation
    const listener = themeAnimation.addListener(({ value }) => {
      animatedStyle.setValue(value);
    });

    return () => {
      themeAnimation.removeListener(listener);
    };
  }, [themeAnimation, animatedStyle]);

  const animatedBackgroundColor = backgroundColor 
    ? animatedStyle.interpolate({
        inputRange: [0, 1],
        outputRange: [backgroundColor, backgroundColor], // Same color for smooth transition
      })
    : undefined;

  const animatedColor = color
    ? animatedStyle.interpolate({
        inputRange: [0, 1],
        outputRange: [color, color], // Same color for smooth transition
      })
    : undefined;

  const animatedBorderColor = borderColor
    ? animatedStyle.interpolate({
        inputRange: [0, 1],
        outputRange: [borderColor, borderColor], // Same color for smooth transition
      })
    : undefined;

  return (
    <Animated.View
      style={[
        style,
        {
          backgroundColor: animatedBackgroundColor,
          borderColor: animatedBorderColor,
        },
      ]}
    >
      {children}
    </Animated.View>
  );
} 
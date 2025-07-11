import React, { useRef } from 'react';
import { Animated, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';

interface AnimatedThemeToggleProps {
  size?: number;
  style?: any;
}

export default function AnimatedThemeToggle({ size = 24, style }: AnimatedThemeToggleProps) {
  const { isDark, setThemeMode, setOnTransitionComplete } = useTheme();
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const triggerIconAnimation = () => {
    // Trigger animation when transition is complete
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.8,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start(() => {
      rotateAnim.setValue(0);
    });
  };

  const handlePress = () => {
    // Set the callback to trigger icon animation after transition
    setOnTransitionComplete(triggerIconAnimation);
    
    // Start the theme transition
    setThemeMode(isDark ? 'light' : 'dark');
  };

  // Create different rotation animations for sun and moon
  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  // Use weather-night but adjust the rotation to compensate for icon orientation
  const iconName = isDark ? 'weather-sunny' : 'weather-night';

  return (
    <TouchableOpacity
      onPress={handlePress}
      style={[styles.container, style]}
      activeOpacity={0.7}
    >
      <Animated.View
        style={[
          styles.iconContainer,
          {
            transform: [
              { rotate },
              { scale: scaleAnim },
              // No extra rotation needed with 360-degree animation
            ],
          },
        ]}
      >
        <MaterialCommunityIcons
          name={iconName}
          size={size}
          color={isDark ? '#FFD700' : '#4A90E2'}
        />
      </Animated.View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 8,
    borderRadius: 20,
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
}); 
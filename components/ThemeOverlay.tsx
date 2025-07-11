import React, { useEffect, useRef, useState } from 'react';
import { Animated, View, StyleSheet } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';

// Fixed colors for each overlay
const lightToDarkColors = {
  start: '#FFF5E6', // Light theme background
  end: '#121212',   // Dark theme background
};

const darkToLightColors = {
  start: '#121212', // Dark theme background
  end: '#FFF5E6',   // Light theme background
};

export default function ThemeOverlay() {
  const { isDark, overlayColorAnimation, wiggleAnimation, isTransitioning, targetThemeMode } = useTheme();
  const opacityAnimation = useRef(new Animated.Value(0)).current;
  const [activeOverlay, setActiveOverlay] = useState<'lightToDark' | 'darkToLight' | null>(null);
  const [transitionDirection, setTransitionDirection] = useState<'lightToDark' | 'darkToLight' | null>(null);
  const [shouldFadeOut, setShouldFadeOut] = useState(false);
  const [colorTransitionComplete, setColorTransitionComplete] = useState(false);

  useEffect(() => {
    if (isTransitioning && targetThemeMode && !transitionDirection) {
      // Determine transition direction ONLY ONCE at the start
      const targetIsDark = targetThemeMode === 'dark';
      const direction = isDark ? 'darkToLight' : 'lightToDark';
      setTransitionDirection(direction);
      setActiveOverlay(direction);
      setColorTransitionComplete(false);
      
      // Stage 1: Fade in overlay with start color
      Animated.timing(opacityAnimation, {
        toValue: 1,
        duration: 200, // Match theme context timing
        useNativeDriver: false,
      }).start();
    } else if (!isTransitioning && activeOverlay && !shouldFadeOut) {
      // Signal that we should start fading out
      setShouldFadeOut(true);
    } else if (!isTransitioning && activeOverlay && shouldFadeOut) {
      // Stage 4: Fade out overlay to reveal new theme
      Animated.timing(opacityAnimation, {
        toValue: 0,
        duration: 200, // Match theme context timing
        useNativeDriver: false,
      }).start(() => {
        // Wait a tiny amount of time to ensure overlay is completely faded
        setTimeout(() => {
          // Reset everything when transition is complete and overlay is invisible
          setActiveOverlay(null);
          setTransitionDirection(null);
          setShouldFadeOut(false);
          setColorTransitionComplete(false);
        }, 100); // Small delay to ensure complete fade
      });
    }
  }, [isTransitioning, targetThemeMode, opacityAnimation, isDark, transitionDirection, activeOverlay, shouldFadeOut]);

  // Detect when color transition is complete
  useEffect(() => {
    if (overlayColorAnimation && activeOverlay) {
      const listener = overlayColorAnimation.addListener(({ value }) => {
        if (value >= 1) {
          setColorTransitionComplete(true);
        }
      });
      
      return () => overlayColorAnimation.removeListener(listener);
    }
  }, [overlayColorAnimation, activeOverlay]);

  if (!activeOverlay) {
    return null; // No overlay when not active
  }

  // Get the fixed colors for the active overlay
  const colors = activeOverlay === 'lightToDark' ? lightToDarkColors : darkToLightColors;

  // Overlay smoothly transitions from fixed start color to fixed end color
  // This is completely independent of the theme underneath
  const animatedBackgroundColor = overlayColorAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [colors.start, colors.end],
  });

  // Use end color if transition is complete, otherwise use animated color
  const finalBackgroundColor = colorTransitionComplete ? colors.end : animatedBackgroundColor;

  return (
    <Animated.View
      style={[
        styles.overlay,
        {
          backgroundColor: finalBackgroundColor,
          opacity: opacityAnimation,
        },
      ]}
      pointerEvents="none" // Allow touches to pass through
    >
      {/* This overlay covers the entire app during theme transitions */}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 9999, // Very high z-index to cover everything
  },
}); 
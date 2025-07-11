import { useRef, useEffect } from 'react';
import { Animated } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';

export const useCascadeFade = (delay: number = 0) => {
  const { cascadeAnimation, isTransitioning } = useTheme();
  const opacity = useRef(new Animated.Value(1)).current; // Start visible
  const translateY = useRef(new Animated.Value(0)).current; // Start at normal position

  useEffect(() => {
    const listener = cascadeAnimation.addListener(({ value }: { value: number }) => {
      if (value > 0 && isTransitioning) {
        // Calculate when this element should start fading in
        const startTime = delay / 1000; // Convert to seconds
        const duration = 0.3; // 300ms for each element
        
        if (value >= startTime && value <= startTime + duration) {
          const progress = (value - startTime) / duration;
          opacity.setValue(progress);
          translateY.setValue(20 * (1 - progress));
        } else if (value > startTime + duration) {
          opacity.setValue(1);
          translateY.setValue(0);
        }
      } else if (value === 0 && !isTransitioning) {
        // Reset to normal state when not transitioning
        opacity.setValue(1);
        translateY.setValue(0);
      }
    });

    return () => cascadeAnimation.removeListener(listener);
  }, [cascadeAnimation, opacity, translateY, delay, isTransitioning]);

  return {
    opacity,
    translateY,
  };
}; 
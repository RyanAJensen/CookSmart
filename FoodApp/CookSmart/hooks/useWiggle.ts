import { useRef, useEffect } from 'react';
import { Animated } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';

export const useWiggle = () => {
  const { wiggleAnimation } = useTheme();
  const translateX = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(0)).current;
  const rotate = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const listener = wiggleAnimation.addListener(({ value }) => {
      if (value > 0) {
        // Create wiggle effect
        const wiggleIntensity = 3;
        const rotationIntensity = 0.02;
        
        translateX.setValue(Math.sin(value * Math.PI * 4) * wiggleIntensity);
        translateY.setValue(Math.cos(value * Math.PI * 4) * wiggleIntensity);
        rotate.setValue(Math.sin(value * Math.PI * 2) * rotationIntensity);
      } else {
        // Reset to normal position
        translateX.setValue(0);
        translateY.setValue(0);
        rotate.setValue(0);
      }
    });

    return () => wiggleAnimation.removeListener(listener);
  }, [wiggleAnimation, translateX, translateY, rotate]);

  return {
    translateX,
    translateY,
    rotate,
  };
}; 
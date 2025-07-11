import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { useColorScheme, Animated } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeContextType {
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
  isDark: boolean;
  themeAnimation: Animated.Value;
  overlayColorAnimation: Animated.Value;
  wiggleAnimation: Animated.Value;
  cascadeAnimation: Animated.Value;
  isTransitioning: boolean;
  targetThemeMode: ThemeMode | null;
  isLoading: boolean;
  onTransitionComplete: (() => void) | null;
  setOnTransitionComplete: (callback: (() => void) | null) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

interface ThemeProviderProps {
  children: React.ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const systemColorScheme = useColorScheme();
  const [themeMode, setThemeModeState] = useState<ThemeMode>('system');
  const [isLoading, setIsLoading] = useState(true);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [pendingThemeMode, setPendingThemeMode] = useState<ThemeMode | null>(null);
  const [targetThemeMode, setTargetThemeMode] = useState<ThemeMode | null>(null);
  const [onTransitionComplete, setOnTransitionComplete] = useState<(() => void) | null>(null);
  const themeAnimation = useRef(new Animated.Value(0)).current;
  const overlayColorAnimation = useRef(new Animated.Value(0)).current;
  const wiggleAnimation = useRef(new Animated.Value(0)).current;
  const cascadeAnimation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Load saved theme preference
    loadThemePreference();
  }, []);

  const loadThemePreference = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem('themeMode');
      if (savedTheme && ['light', 'dark', 'system'].includes(savedTheme)) {
        setThemeModeState(savedTheme as ThemeMode);
      }
      setIsLoading(false);
    } catch (error) {
      console.error('Error loading theme preference:', error);
      setIsLoading(false);
    }
  };

  const setThemeMode = async (mode: ThemeMode) => {
    try {
      setIsTransitioning(true);
      setTargetThemeMode(mode);
      
      // Stage 1: Fade in overlay with current theme color (200ms)
      setTimeout(async () => {
        // Stage 2: Theme switch happens instantly underneath (doesn't affect overlay)
        await AsyncStorage.setItem('themeMode', mode);
        setThemeModeState(mode);
        
        // Stage 3: Overlay smoothly transitions to target color (independent animation)
        Animated.timing(overlayColorAnimation, {
          toValue: 1,
          duration: 250, // Smooth color transition
          useNativeDriver: false,
        }).start(() => {
          // Color transition is complete - overlay should maintain end color
          setTargetThemeMode(null);
          
          // Stage 4: Signal fade out immediately and trigger cascade
          setTimeout(() => {
            // Trigger cascade animation
            Animated.timing(cascadeAnimation, {
              toValue: 1,
              duration: 800, // Total cascade duration
              useNativeDriver: false,
            }).start(() => {
              cascadeAnimation.setValue(0); // Reset for next transition
            });
            
            setIsTransitioning(false);
            overlayColorAnimation.setValue(0); // Reset for next transition
            
            // Stage 5: Trigger the completion callback (for icon animation)
            if (onTransitionComplete) {
              onTransitionComplete();
              setOnTransitionComplete(null); // Clear the callback
            }
          }, 25); // Minimal delay to ensure color transition is complete
        });
      }, 200); // Wait for fade in to complete
    } catch (error) {
      console.error('Error saving theme preference:', error);
      setIsTransitioning(false);
      setTargetThemeMode(null);
    }
  };

  // Determine if dark mode should be used
  const isDark = themeMode === 'system' 
    ? systemColorScheme === 'dark'
    : themeMode === 'dark';

  const value: ThemeContextType = {
    themeMode,
    setThemeMode,
    isDark,
    themeAnimation,
    overlayColorAnimation,
    wiggleAnimation,
    cascadeAnimation,
    isTransitioning,
    targetThemeMode,
    isLoading,
    onTransitionComplete,
    setOnTransitionComplete,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}; 
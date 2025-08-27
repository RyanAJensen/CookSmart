import React from 'react';
import { View, Image, StyleSheet, ViewStyle, ImageStyle } from 'react-native';
import { useTheme, Text } from 'react-native-paper';

interface CookSmartLogoProps {
  size?: 'small' | 'medium' | 'large' | number;
  variant?: 'full' | 'icon' | 'monochrome';
  style?: ViewStyle;
  testID?: string;
}

export default function CookSmartLogo({ 
  size = 'medium', 
  variant = 'full',
  style,
  testID = 'cooksmart-logo'
}: CookSmartLogoProps) {
  const theme = useTheme();
  const isDark = theme.dark;

  // Size mapping
  const getSize = () => {
    if (typeof size === 'number') return size;
    switch (size) {
      case 'small': return 40;
      case 'medium': return 80;
      case 'large': return 120;
      default: return 80;
    }
  };

  // Get logo source based on variant and theme
  const getLogoSource = () => {
    // React Native requires static analysis of require() statements
    // We can't use try/catch with require(), so we'll use direct paths
    
    switch (variant) {
      case 'full':
        return isDark 
          ? require('../assets/images/logo/logo-dark.png')
          : require('../assets/images/logo/logo-light.png');
      
      case 'icon':
        return require('../assets/images/logo/icon.png');
      
      case 'monochrome':
        return isDark
          ? require('../assets/images/logo/logo-dark-monochrome.png')
          : require('../assets/images/logo/logo-light-monochrome.png');
      
      default:
        return require('../assets/images/icon.png'); // Fallback to main icon
    }
  };

  const logoSize = getSize();

  return (
    <View 
      style={[styles.container, { width: logoSize, height: logoSize }, style]}
      testID={testID}
    >
      <Image
        source={getLogoSource()}
        style={[
          styles.logo,
          {
            width: logoSize,
            height: logoSize,
          }
        ]}
        resizeMode="contain"
        accessibilityLabel="CookSmart Logo - Your personal pantry assistant"
      />
    </View>
  );
}

// Alternative component for text + logo combination
interface CookSmartBrandProps {
  showText?: boolean;
  size?: 'small' | 'medium' | 'large';
  variant?: 'horizontal' | 'vertical';
  style?: ViewStyle;
}

export function CookSmartBrand({ 
  showText = true, 
  size = 'medium',
  variant = 'horizontal',
  style 
}: CookSmartBrandProps) {
  const theme = useTheme();
  
  const logoSize = size === 'small' ? 32 : size === 'large' ? 56 : 40;
  const isHorizontal = variant === 'horizontal';

  return (
    <View 
      style={[
        styles.brandContainer,
        isHorizontal ? styles.horizontal : styles.vertical,
        style
      ]}
    >
      <CookSmartLogo size={logoSize} variant="full" />
      {showText && (
        <Text 
          variant={size === 'large' ? 'headlineMedium' : size === 'small' ? 'titleMedium' : 'titleLarge'}
          style={[
            styles.brandText,
            { 
              color: theme.colors.primary,
              marginLeft: isHorizontal ? 12 : 0,
              marginTop: isHorizontal ? 0 : 8,
            }
          ]}
        >
          CookSmart
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    // Additional styling if needed
  },
  brandContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  horizontal: {
    flexDirection: 'row',
  },
  vertical: {
    flexDirection: 'column',
  },
  brandText: {
    fontWeight: 'bold',
  },
}); 
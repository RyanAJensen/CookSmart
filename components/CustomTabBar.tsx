import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Button, Menu, useTheme as usePaperTheme } from 'react-native-paper';
import { usePathname, router } from 'expo-router';
import { useTheme } from '../contexts/ThemeContext';

const ICON_SIZE = 26;
const BUTTON_FONT_SIZE = 13;

export default function CustomTabBar() {
  const pathname = usePathname();
  const paperTheme = usePaperTheme();
  const { isDark } = useTheme();
  const [menuVisible, setMenuVisible] = useState(false);

  const isActive = (route: string) => {
    if (route === '/pantry') {
      return pathname.startsWith('/pantry');
    }
    if (route === '/') {
      return pathname === '/' || pathname === '/index';
    }
    return pathname.startsWith(route);
  };

  return (
    <View 
      style={[
        styles.container, 
        { 
          backgroundColor: paperTheme.colors.surface, 
          borderTopColor: paperTheme.colors.outline,
        }
      ]}
    >
      <Button
        icon={({ color }) => (
          <MaterialIcons name="home" size={ICON_SIZE} color={color} />
        )}
        mode="text"
        onPress={() => router.push('/')}
        style={styles.button}
        labelStyle={[
          isActive('/') ? [styles.activeLabel, { color: paperTheme.colors.primary }] : [styles.label, { color: paperTheme.colors.onSurfaceVariant }], 
          styles.buttonLabel
        ]}
      >
        Home
      </Button>
      <Menu
        visible={menuVisible}
        onDismiss={() => setMenuVisible(false)}
        anchor={
          <Button
            icon={({ color }) => (
              <MaterialIcons name="add-circle" size={ICON_SIZE} color={color} />
            )}
            mode="text"
            onPress={() => setMenuVisible(true)}
            style={styles.button}
            labelStyle={[styles.label, styles.buttonLabel, { color: paperTheme.colors.onSurfaceVariant }]}
          >
            Add
          </Button>
        }
        contentStyle={[styles.menuContent, { backgroundColor: paperTheme.colors.surface }]}
      >
        <Menu.Item
          onPress={() => {
            setMenuVisible(false);
            router.push('/(modals)/scan');
          }}
          title="Scan Barcode"
          leadingIcon="barcode-scan"
          titleStyle={[styles.menuItemTitle, { color: paperTheme.colors.onSurface }]}
        />
        <Menu.Item
          onPress={() => {
            setMenuVisible(false);
            router.push('/(modals)/type-ingredient');
          }}
          title="Add Manually"
          leadingIcon="plus-circle"
          titleStyle={[styles.menuItemTitle, { color: paperTheme.colors.onSurface }]}
        />
      </Menu>
      <Button
        icon={({ color }) => (
          <MaterialIcons name="kitchen" size={ICON_SIZE} color={color} />
        )}
        mode="text"
        onPress={() => router.push('/pantry')}
        style={styles.button}
        labelStyle={[
          isActive('/pantry') ? [styles.activeLabel, { color: paperTheme.colors.primary }] : [styles.label, { color: paperTheme.colors.onSurfaceVariant }], 
          styles.buttonLabel
        ]}
      >
        Pantry
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 14,
    minHeight: 56,
    borderTopWidth: 1,
    elevation: 8,
  },
  button: {
    flex: 1,
    marginHorizontal: 2,
    borderRadius: 0,
    backgroundColor: 'transparent',
  },
  label: {
    fontSize: BUTTON_FONT_SIZE,
  },
  activeLabel: {
    fontSize: BUTTON_FONT_SIZE,
  },
  buttonLabel: {
    fontSize: BUTTON_FONT_SIZE,
    paddingVertical: 2,
  },
  menuContent: {
    borderRadius: 12,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  menuItemTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
}); 
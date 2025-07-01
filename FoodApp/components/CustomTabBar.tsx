import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Button, Menu } from 'react-native-paper';
import { usePathname, router } from 'expo-router';

const ICON_SIZE = 26;
const BUTTON_FONT_SIZE = 13;

export default function CustomTabBar() {
  const pathname = usePathname();
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
    <View style={styles.container}>
      <Button
        icon={({ color }) => (
          <MaterialIcons name="home" size={ICON_SIZE} color={color} />
        )}
        mode="text"
        onPress={() => router.push('/')}
        style={styles.button}
        labelStyle={[isActive('/') ? styles.activeLabel : styles.label, styles.buttonLabel]}
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
            labelStyle={[styles.label, styles.buttonLabel]}
          >
            Add
          </Button>
        }
      >
        <Menu.Item
          onPress={() => {
            setMenuVisible(false);
            router.push('/(modals)/scan');
          }}
          title="Scan Ingredient"
          leadingIcon="barcode-scan"
        />
        <Menu.Item
          onPress={() => {
            setMenuVisible(false);
            router.push('/(modals)/type-ingredient');
          }}
          title="Type Ingredient"
          leadingIcon="keyboard"
        />
      </Menu>
      <Button
        icon={({ color }) => (
          <MaterialIcons name="kitchen" size={ICON_SIZE} color={color} />
        )}
        mode="text"
        onPress={() => router.push('/pantry')}
        style={styles.button}
        labelStyle={[isActive('/pantry') ? styles.activeLabel : styles.label, styles.buttonLabel]}
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
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#eee',
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
    color: '#888',
  },
  activeLabel: {
    color: '#007AFF',
  },
  buttonLabel: {
    fontSize: BUTTON_FONT_SIZE,
    paddingVertical: 2,
  },
}); 
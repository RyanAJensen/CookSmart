import { MaterialIcons } from '@expo/vector-icons';
import { Stack, Tabs, router } from 'expo-router';
import React, { useState } from 'react';
import { Animated, StyleSheet, TouchableWithoutFeedback, View } from 'react-native';
import { FAB, Portal } from 'react-native-paper';

export default function TabLayout() {
  const [menuVisible, setMenuVisible] = useState(false);
  const [animation] = useState(new Animated.Value(0));

  const handleAddPress = () => {
    if (menuVisible) {
      setMenuVisible(false);
      Animated.spring(animation, {
        toValue: 0,
        useNativeDriver: true,
        tension: 50,
        friction: 7,
      }).start();
    } else {
      setMenuVisible(true);
      Animated.spring(animation, {
        toValue: 1,
        useNativeDriver: true,
        tension: 50,
        friction: 7,
      }).start();
    }
  };

  const handleMenuDismiss = () => {
    setMenuVisible(false);
    Animated.spring(animation, {
      toValue: 0,
      useNativeDriver: true,
      tension: 50,
      friction: 7,
    }).start();
  };

  const handleScanPress = () => {
    handleMenuDismiss();
    router.push('/(modals)/scan');
  };

  const handleTypePress = () => {
    handleMenuDismiss();
    router.push('/(modals)/type-ingredient');
  };

  const scanButtonStyle = {
    transform: [
      {
        translateY: animation.interpolate({
          inputRange: [0, 1],
          outputRange: [0, -80],
        }),
      },
    ],
    opacity: animation,
  };

  const typeButtonStyle = {
    transform: [
      {
        translateY: animation.interpolate({
          inputRange: [0, 1],
          outputRange: [0, -140],
        }),
      },
    ],
    opacity: animation,
  };

  return (
    <View style={styles.container}>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: '#007AFF',
          tabBarInactiveTintColor: '#8E8E93',
          headerShown: false,
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'Home',
            tabBarIcon: ({ color }) => <MaterialIcons name="home" size={24} color={color} />,
          }}
        />
        <Tabs.Screen
          name="pantry"
          options={{
            title: 'Pantry',
            tabBarIcon: ({ color }) => <MaterialIcons name="kitchen" size={24} color={color} />,
          }}
        />
      </Tabs>

      <Portal>
        {menuVisible && (
          <TouchableWithoutFeedback onPress={handleMenuDismiss}>
            <View style={styles.overlay} />
          </TouchableWithoutFeedback>
        )}
        <View style={styles.fabContainer}>
          <Animated.View style={[styles.popupButton, typeButtonStyle]}>
            <FAB
              icon="keyboard"
              style={styles.popupFab}
              onPress={handleTypePress}
              size="small"
            />
          </Animated.View>
          <Animated.View style={[styles.popupButton, scanButtonStyle]}>
            <FAB
              icon="barcode-scan"
              style={styles.popupFab}
              onPress={handleScanPress}
              size="small"
            />
          </Animated.View>
          <FAB
            icon={menuVisible ? "close" : "plus"}
            style={styles.fab}
            onPress={handleAddPress}
            size="medium"
          />
        </View>
      </Portal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'transparent',
  },
  fabContainer: {
    position: 'absolute',
    right: '50%',
    bottom: 30,
    transform: [{ translateX: 25 }],
    alignItems: 'center',
  },
  fab: {
    backgroundColor: '#4CAF50',
    zIndex: 1000,
  },
  popupButton: {
    position: 'absolute',
    bottom: 0,
    padding: 20,
  },
  popupFab: {
    backgroundColor: '#4CAF50',
    marginBottom: 8,
  },
});

export function ModalLayout() {
  return (
    <Stack
      screenOptions={{
        presentation: 'modal',
        headerShown: false,
        animation: 'slide_from_bottom',
      }}
    />
  );
} 
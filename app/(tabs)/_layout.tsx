// app/(tabs)/_layout.jsx

import React from 'react';

import { Tabs } from 'expo-router';

import {
  Ionicons,
  MaterialIcons,
} from '@expo/vector-icons';

import { BlurView } from 'expo-blur';

import {
  Platform,
  StyleSheet,
  View,
} from 'react-native';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,

        tabBarShowLabel: false,

        tabBarHideOnKeyboard: true,

        tabBarActiveTintColor: '#FFFFFF',

        tabBarInactiveTintColor: '#7C8592',

        tabBarStyle: styles.tabBar,

        tabBarBackground: () => (
          <View style={styles.backgroundWrapper}>
            <BlurView
              intensity={45}
              tint="dark"
              style={styles.blur}
            />
          </View>
        ),
      }}
    >
      {/* HOME */}
      <Tabs.Screen
        name="home"
        options={{
          tabBarIcon: ({
            color,
            focused,
          }) => (
            <Ionicons
              name={
                focused
                  ? 'home'
                  : 'home-outline'
              }
              size={24}
              color={color}
              style={
                focused &&
                styles.activeIcon
              }
            />
          ),
        }}
      />

      {/* SEARCH */}
      <Tabs.Screen
        name="search"
        options={{
          tabBarIcon: ({
            color,
            focused,
          }) => (
            <Ionicons
              name={
                focused
                  ? 'search'
                  : 'search-outline'
              }
              size={24}
              color={color}
              style={
                focused &&
                styles.activeIcon
              }
            />
          ),
        }}
      />

      {/* DOWNLOADS */}
      <Tabs.Screen
        name="downloads"
        options={{
          tabBarIcon: ({
            color,
            focused,
          }) => (
            <Ionicons
              name={
                focused
                  ? 'download'
                  : 'download-outline'
              }
              size={24}
              color={color}
              style={
                focused &&
                styles.activeIcon
              }
            />
          ),
        }}
      />

      {/* WISHLIST */}
      <Tabs.Screen
        name="wishlist"
        options={{
          tabBarIcon: ({
            color,
            focused,
          }) => (
            <Ionicons
              name={
                focused
                  ? 'heart'
                  : 'heart-outline'
              }
              size={24}
              color={color}
              style={
                focused &&
                styles.activeIcon
              }
            />
          ),
        }}
      />

      {/* SETTINGS */}
      <Tabs.Screen
        name="settings"
        options={{
          tabBarIcon: ({
            color,
            focused,
          }) => (
            <MaterialIcons
              name="settings"
              size={24}
              color={color}
              style={
                focused &&
                styles.activeIcon
              }
            />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    position: 'absolute',

    bottom: 14,

    left: 14,

    right: 14,

    height:
      Platform.OS === 'ios'
        ? 72
        : 62,

    borderRadius: 30,

    backgroundColor:
      'rgba(15,18,25,0.88)',

    borderTopWidth: 0,

    elevation: 0,

    overflow: 'hidden',

    paddingTop: 6,

    paddingBottom:
      Platform.OS === 'ios'
        ? 16
        : 8,

    shadowColor: '#000',

    shadowOffset: {
      width: 0,
      height: 10,
    },

    shadowOpacity: 0.22,

    shadowRadius: 20,
  },

  backgroundWrapper: {
    flex: 1,

    borderRadius: 30,

    overflow: 'hidden',
  },

  blur: {
    flex: 1,
  },

  activeIcon: {
    transform: [{ scale: 1.08 }],
  },
});
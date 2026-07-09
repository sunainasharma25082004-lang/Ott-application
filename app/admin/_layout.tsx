import React from 'react';
import { Platform, View, Text, StyleSheet } from 'react-native';
import { Stack } from 'expo-router';

// Admin group: web-only. index.tsx handles auth/login; dashboard.tsx is protected by it.
export default function AdminLayout() {
  if (Platform.OS !== 'web') {
    return (
      <View style={s.block}>
        <Text style={s.text}>Admin panel is only available on the web.</Text>
      </View>
    );
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: '#040611' },
      }}
    />
  );
}

const s = StyleSheet.create({
  block: { flex: 1, backgroundColor: '#040611', alignItems: 'center', justifyContent: 'center' },
  text: { color: '#9CA3AF', fontSize: 16 },
});

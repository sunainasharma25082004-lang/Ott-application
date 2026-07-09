import React from 'react';
import { Stack } from 'expo-router';

export default function PlayerLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        presentation: 'fullScreenModal',
        animation: 'slide_from_bottom',
      }}
    />
  );
}

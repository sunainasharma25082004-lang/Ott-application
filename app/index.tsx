import React, { useEffect } from 'react';
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';
import { Redirect, useRouter } from 'expo-router';
import { useAuth } from '../src/context/AuthContext';

export default function Index() {
  const { isAuthenticated, isLoading, user } = useAuth();
  const router = useRouter();

  // While we are restoring token / checking /me, show a nice loading screen
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#F4B840" />
        <Text style={styles.loadingText}>Loading your session...</Text>
      </View>
    );
  }

  // Once we know the auth state, redirect accordingly.
  // If logged in → send to Admin Dashboard if role is admin, else ChooseProfile
  // Else → auth login screen (which contains both Sign In + Register + OTP)
  if (isAuthenticated) {
    if (user?.role === 'admin') {
      return <Redirect href="/admin/dashboard" />;
    }
    return <Redirect href="/ChooseProfile" />;
  }

  return <Redirect href="/(auth)/login" />;
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: '#0B0B0B',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#888',
    marginTop: 16,
    fontSize: 14,
  },
});

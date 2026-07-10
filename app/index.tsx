import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions } from 'react-native';
import { Redirect } from 'expo-router';
import { useAuth } from '../src/context/AuthContext';

const { width } = Dimensions.get('window');

export default function Index() {
  const { isAuthenticated, isLoading, user } = useAuth();
  const [animationFinished, setAnimationFinished] = useState(false);

  // Animation values
  const logoScale = useRef(new Animated.Value(0.4)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const logoRotate = useRef(new Animated.Value(0)).current;
  const sloganOpacity = useRef(new Animated.Value(0)).current;
  const containerOpacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // 1. Spring scale up, rotate, and fade in the logo
    Animated.parallel([
      Animated.timing(logoOpacity, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(logoScale, {
        toValue: 1.0,
        friction: 5,
        tension: 40,
        useNativeDriver: true,
      }),
      Animated.timing(logoRotate, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      })
    ]).start(() => {
      // 2. Fade in the slogan tagline text
      Animated.timing(sloganOpacity, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start(() => {
        // 3. Hold for 600ms, then trigger the Netflix-style zoom outro
        setTimeout(() => {
          Animated.parallel([
            Animated.timing(logoScale, {
              toValue: 3.5,
              duration: 700,
              useNativeDriver: true,
            }),
            Animated.timing(containerOpacity, {
              toValue: 0,
              duration: 600,
              useNativeDriver: true,
            })
          ]).start(() => {
            setAnimationFinished(true);
          });
        }, 650);
      });
    });
  }, []);

  const spin = logoRotate.interpolate({
    inputRange: [0, 1],
    outputRange: ['-15deg', '0deg']
  });

  // Keep the splash animation active while auth is loading OR the intro animation is running
  if (isLoading || !animationFinished) {
    return (
      <Animated.View style={[styles.container, { opacity: containerOpacity }]}>
        <View style={styles.content}>
          <Animated.Image
            source={require('../assets/icon.png')}
            style={[
              styles.logo,
              {
                opacity: logoOpacity,
                transform: [{ scale: logoScale }, { rotate: spin }],
              },
            ]}
            resizeMode="contain"
          />
          <Animated.Text style={[styles.slogan, { opacity: sloganOpacity }]}>
            VIZ TV
          </Animated.Text>
          <Animated.Text style={[styles.subSlogan, { opacity: sloganOpacity }]}>
            Premium Discovery & Streaming
          </Animated.Text>
        </View>
      </Animated.View>
    );
  }

  // Once animation completes and auth state is loaded, redirect to appropriate screen
  if (isAuthenticated) {
    if (user?.role === 'admin') {
      return <Redirect href="/admin/dashboard" />;
    }
    return <Redirect href="/ChooseProfile" />;
  }

  return <Redirect href="/(auth)/login" />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#050505', // Cinematic deep black background
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: width * 0.45,
    height: width * 0.45,
    borderRadius: width * 0.225,
    marginBottom: 20,
  },
  slogan: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: '800',
    letterSpacing: 2,
    marginTop: 10,
    textShadowColor: 'rgba(255, 255, 255, 0.2)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 10,
  },
  subSlogan: {
    color: '#FFB800', // Matches gold theme color
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 3,
    marginTop: 8,
    textTransform: 'uppercase',
  },
});

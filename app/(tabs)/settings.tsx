
// app/(tabs)/profile.jsx

import React from 'react';

import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  StatusBar,
  Platform,
  Switch,
  Alert,
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';

import {
  Ionicons,
  MaterialIcons,
  Feather,
} from '@expo/vector-icons';

import { router } from 'expo-router';
import { useAuth } from '../../src/context/AuthContext';

const profileMenus = [
  {
    id: 1,
    icon: 'person-outline',
    title: 'Personal Details',
    route: '/profile-details',
  },

  {
    id: 4,
    icon: 'notifications-outline',
    title: 'Notifications',
    route: '/notifications',
  },

  {
    id: 2,
    icon: 'card-outline',
    title: 'Payment Methods',
  },

  {
    id: 3,
    icon: 'download-outline',
    title: 'Download Controls',
  },
];

const settingsMenus = [
  {
    id: 1,
    icon: 'notifications-outline',
    title: 'Push Notifications',
  },

  {
    id: 2,
    icon: 'shield-checkmark-outline',
    title: 'Privacy Policy',
  },

  {
    id: 3,
    icon: 'help-circle-outline',
    title: 'Help & Support',
  },
];

export default function ProfileScreen() {
  const { signOut, user, isAuthenticated, selectedProfile } = useAuth();

  const displayedProfileMenus = user?.role === 'admin' ? [
    ...profileMenus,
    {
      id: 99,
      icon: 'shield-checkmark-outline',
      title: 'Admin Console',
      route: '/admin/dashboard',
    }
  ] : profileMenus;

  const doLogout = async () => {
    try {
      await signOut();
      console.log('[Settings] Signed out successfully');
    } catch (err) {
      console.log('[Settings] Sign out error (ignored):', err);
    }
    // Navigate to root — index.tsx will check isAuthenticated=false and redirect to login
    router.replace('/');
  };

  const handleLogout = () => {
    if (Platform.OS === 'web') {
      const confirmed = window.confirm('Are you sure you want to sign out?');
      if (confirmed) {
        doLogout();
      }
    } else {
      Alert.alert(
        'Log Out',
        'Are you sure you want to sign out?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Log Out',
            style: 'destructive',
            onPress: doLogout,
          },
        ]
      );
    }
  };

  return (
    <SafeAreaView
      style={styles.container}
      edges={['top']}
    >
      <StatusBar
        translucent={false}
        backgroundColor="#090D16"
        barStyle="light-content"
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={
          styles.scrollContent
        }
      >
        {/* HEADER */}

        <Text style={styles.headerTitle}>
          Settings
        </Text>

        {/* PROFILE CARD */}

        <View style={styles.profileCard}>
          <View style={styles.profileRow}>
            <Image
              source={{
                uri: isAuthenticated ? (selectedProfile?.image || user?.avatar || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330') : 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde',
              }}
              style={styles.avatar}
            />

            <View style={styles.profileInfo}>
              <Text style={styles.name}>
                {isAuthenticated ? (selectedProfile?.name || user?.name || 'User') : 'Guest User'}
              </Text>

              <Text style={styles.email}>
                {isAuthenticated ? (user?.email || 'No email') : 'Sign in to access premium features'}
              </Text>
            </View>

            {!isAuthenticated ? (
              <TouchableOpacity
                style={[styles.editButton, { backgroundColor: '#F4B840' }]}
                activeOpacity={0.8}
                onPress={() => router.replace('/(auth)/login')}
              >
                <Text style={[styles.editText, { color: '#000', fontWeight: '700' }]}>
                  Sign In
                </Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={styles.editButton}
                activeOpacity={0.8}
                onPress={() => router.push('/profile-details')}
              >
                <Text style={styles.editText}>
                  Edit Profile
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {/* AVATAR COLORS */}

          <Text style={styles.sectionLabel}>
            APP ACCENT COLOR
          </Text>

          <View style={styles.colorRow}>
            <View
              style={[
                styles.colorCircle,
                {
                  backgroundColor:
                    '#FFD166',
                },
              ]}
            />

            <View
              style={[
                styles.colorCircle,
                {
                  backgroundColor:
                    '#8B5CF6',
                },
              ]}
            />

            <View
              style={[
                styles.colorCircle,
                {
                  backgroundColor:
                    '#38BDF8',
                },
              ]}
            />

            <View
              style={[
                styles.colorCircle,
                {
                  backgroundColor:
                    '#F87171',
                },
              ]}
            />

            <View
              style={[
                styles.colorCircle,
                {
                  backgroundColor:
                    '#E5E7EB',
                },
              ]}
            />
          </View>
        </View>

        {/* ACCOUNT */}

        <Text style={styles.menuTitle}>
          ACCOUNT
        </Text>

        <View style={styles.menuCard}>
          {displayedProfileMenus.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.menuItem}
              activeOpacity={0.8}
              onPress={() => {
                if ('route' in item && item.route) {
                  router.push(item.route as any);
                }
              }}
            >
              <View style={styles.leftRow}>
                <View
                  style={styles.iconBox}
                >
                  <Ionicons
                    name={item.icon as any}
                    size={18}
                    color="#FFD166"
                  />
                </View>

                <Text
                  style={styles.menuText}
                >
                  {item.title}
                </Text>
              </View>

              <Ionicons
                name="chevron-forward"
                size={18}
                color="#8A94A6"
              />
            </TouchableOpacity>
          ))}
        </View>

        {/* PREFERENCES */}

        <Text style={styles.menuTitle}>
          PREFERENCES
        </Text>

        <View style={styles.menuCard}>
          <View style={styles.menuItem}>
            <View style={styles.leftRow}>
              <View
                style={styles.iconBox}
              >
                <Feather
                  name="moon"
                  size={18}
                  color="#FFD166"
                />
              </View>

              <Text style={styles.menuText}>
                AutoPlay Next Episode
              </Text>
            </View>

            <Switch
              value={true}
              thumbColor="#FFD166"
              trackColor={{
                false: '#333',
                true: '#665200',
              }}
            />
          </View>

          <View style={styles.menuItem}>
            <View style={styles.leftRow}>
              <View
                style={styles.iconBox}
              >
                <MaterialIcons
                  name="high-quality"
                  size={18}
                  color="#FFD166"
                />
              </View>

              <Text style={styles.menuText}>
                Streaming Quality
              </Text>
            </View>

            <Text style={styles.valueText}>
              Ultra HD
            </Text>
          </View>

          <View style={styles.menuItem}>
            <View style={styles.leftRow}>
              <View
                style={styles.iconBox}
              >
                <Ionicons
                  name="language-outline"
                  size={18}
                  color="#FFD166"
                />
              </View>

              <Text style={styles.menuText}>
                Language
              </Text>
            </View>

            <Text style={styles.valueText}>
              English
            </Text>
          </View>
        </View>

        {/* MORE */}

        <Text style={styles.menuTitle}>
          MORE
        </Text>

        <View style={styles.menuCard}>
          {settingsMenus.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.menuItem}
              activeOpacity={0.8}
            >
              <View style={styles.leftRow}>
                <View
                  style={styles.iconBox}
                >
                  <Ionicons
                    name={item.icon as any}
                    size={18}
                    color="#FFD166"
                  />
                </View>

                <Text
                  style={styles.menuText}
                >
                  {item.title}
                </Text>
              </View>

              <Ionicons
                name="chevron-forward"
                size={18}
                color="#8A94A6"
              />
            </TouchableOpacity>
          ))}
        </View>

        {/* LOGOUT */}

        <TouchableOpacity
          activeOpacity={0.85}
          style={styles.logoutButton}
          onPress={isAuthenticated ? handleLogout : () => router.replace('/(auth)/login')}
        >
          <Ionicons
            name={isAuthenticated ? "log-out-outline" : "log-in-outline"}
            size={20}
            color={isAuthenticated ? "#FF6B6B" : "#F4B840"}
          />

          <Text style={[styles.logoutText, !isAuthenticated && { color: "#F4B840" }]}>
            {isAuthenticated ? "Log Out" : "Sign In / Register"}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,

    backgroundColor: '#090D16',
  },

  scrollContent: {
    paddingHorizontal: 16,

    paddingBottom: 120,
  },

  headerTitle: {
    color: '#fff',

    fontSize: 30,

    fontWeight: '700',

    marginTop:
      Platform.OS === 'android'
        ? 10
        : 0,

    marginBottom: 20,
  },

  profileCard: {
    backgroundColor:
      'rgba(255,255,255,0.05)',

    borderRadius: 24,

    padding: 16,

    marginBottom: 22,
  },

  profileRow: {
    flexDirection: 'row',

    alignItems: 'center',
  },

  avatar: {
    width: 58,

    height: 58,

    borderRadius: 29,
  },

  profileInfo: {
    flex: 1,

    marginLeft: 12,
  },

  name: {
    color: '#fff',

    fontSize: 16,

    fontWeight: '700',
  },

  email: {
    color: '#8D96A8',

    fontSize: 12,

    marginTop: 4,
  },

  editButton: {
    backgroundColor:
      'rgba(255,209,102,0.15)',

    paddingHorizontal: 14,

    paddingVertical: 8,

    borderRadius: 12,
  },

  editText: {
    color: '#FFD166',

    fontSize: 12,

    fontWeight: '600',
  },

  sectionLabel: {
    color: '#8D96A8',

    fontSize: 11,

    marginTop: 20,

    marginBottom: 12,
  },

  colorRow: {
    flexDirection: 'row',
  },

  colorCircle: {
    width: 26,

    height: 26,

    borderRadius: 13,

    marginRight: 10,

    borderWidth: 2,

    borderColor:
      'rgba(255,255,255,0.1)',
  },

  menuTitle: {
    color: '#8D96A8',

    fontSize: 11,

    marginBottom: 12,

    marginLeft: 2,
  },

  menuCard: {
    backgroundColor:
      'rgba(255,255,255,0.05)',

    borderRadius: 22,

    marginBottom: 22,

    overflow: 'hidden',
  },

  menuItem: {
    flexDirection: 'row',

    justifyContent:
      'space-between',

    alignItems: 'center',

    paddingHorizontal: 16,

    paddingVertical: 18,

    borderBottomWidth: 1,

    borderBottomColor:
      'rgba(255,255,255,0.05)',
  },

  leftRow: {
    flexDirection: 'row',

    alignItems: 'center',
  },

  iconBox: {
    width: 34,

    height: 34,

    borderRadius: 12,

    backgroundColor:
      'rgba(255,209,102,0.1)',

    alignItems: 'center',

    justifyContent: 'center',

    marginRight: 12,
  },

  menuText: {
    color: '#fff',

    fontSize: 14,

    fontWeight: '500',
  },

  valueText: {
    color: '#FFD166',

    fontSize: 13,

    fontWeight: '600',
  },

  logoutButton: {
    height: 56,

    borderRadius: 18,

    backgroundColor:
      'rgba(255,107,107,0.08)',

    borderWidth: 1,

    borderColor:
      'rgba(255,107,107,0.15)',

    flexDirection: 'row',

    alignItems: 'center',

    justifyContent: 'center',

    marginBottom: 20,
  },

  logoutText: {
    color: '#FF6B6B',

    fontSize: 15,

    fontWeight: '700',

    marginLeft: 8,
  },
});


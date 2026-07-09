import React, { useEffect, useState, useCallback } from 'react';

import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  FlatList,
  StatusBar,
  Dimensions,
  Platform,
  ScrollView,
  Modal,
  TextInput,
  ActivityIndicator,
  Alert,
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';

import { LinearGradient } from 'expo-linear-gradient';

import {
  Ionicons,
  Feather,
} from '@expo/vector-icons';

import { router } from 'expo-router';

import { apiClient } from '../src/lib/api';
import { useAuth } from '../src/context/AuthContext';

const { width } = Dimensions.get('window');

const PROFILE_SIZE = width * 0.22;

const AVATAR_OPTIONS = [
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=400',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=400',
  'https://images.unsplash.com/photo-1503023345310-bd7c1de61c7d?q=80&w=400',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=400',
  'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=400',
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=400',
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=400',
  'https://images.unsplash.com/photo-1527980965255-d3b416303d12?q=80&w=400',
];

export default function ChooseProfile() {
  const { user, isAuthenticated, isLoading: authLoading, selectProfile } = useAuth();

  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newProfileName, setNewProfileName] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState(AVATAR_OPTIONS[0]);
  const [isKids, setIsKids] = useState(false);
  const [saving, setSaving] = useState(false);

  // Only logged-in users can access profile selection
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace('/(auth)/login');
    }
  }, [authLoading, isAuthenticated]);

  const loadProfiles = useCallback(async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/profiles');
      if (res?.profiles) {
        const mapped = res.profiles.map(p => ({
          id: p._id || p.id,
          name: p.name,
          image: p.avatar || p.image || 'https://i.pravatar.cc/300',
          isKids: p.isKids,
        }));
        setProfiles(mapped);
      }
    } catch (e) {
      console.log('Could not load profiles from backend:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      loadProfiles();
    }
  }, [isAuthenticated, loadProfiles]);

  const openPlatform = (profile) => {
    if (profile && typeof selectProfile === 'function') {
      selectProfile(profile);
    }
    router.push('/ChoosePlatform');
  };

  const handleAddProfile = async () => {
    if (!newProfileName.trim()) {
      const msg = 'Please enter a profile name';
      if (Platform.OS === 'web') {
        window.alert(msg);
      } else {
        Alert.alert('Error', msg);
      }
      return;
    }

    setSaving(true);
    try {
      await apiClient.post('/profiles', {
        name: newProfileName.trim(),
        avatar: selectedAvatar,
        isKids,
      });

      // Reset form and close modal
      setNewProfileName('');
      setSelectedAvatar(AVATAR_OPTIONS[0]);
      setIsKids(false);
      setShowAddModal(false);

      // Reload profiles from database
      await loadProfiles();
    } catch (e) {
      const msg = e?.message || 'Could not create profile. Max 5 profiles allowed.';
      if (Platform.OS === 'web') {
        window.alert(msg);
      } else {
        Alert.alert('Error', msg);
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteProfile = (profileId, profileName) => {
    const doDelete = async () => {
      try {
        await apiClient.delete(`/profiles/${profileId}`);
        await loadProfiles();
      } catch (e) {
        const msg = 'Could not delete profile';
        if (Platform.OS === 'web') {
          window.alert(msg);
        } else {
          Alert.alert('Error', msg);
        }
      }
    };

    if (Platform.OS === 'web') {
      if (window.confirm(`Delete profile "${profileName}"?`)) {
        doDelete();
      }
    } else {
      Alert.alert('Delete Profile', `Are you sure you want to delete "${profileName}"?`, [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: doDelete },
      ]);
    }
  };

  const renderProfile = ({ item }) => {
    if (!item) return null;
    return (
      <TouchableOpacity
        activeOpacity={0.88}
        style={styles.profileCard}
        onPress={() => openPlatform(item)}
        onLongPress={() => handleDeleteProfile(item.id, item.name)}
      >
        <LinearGradient
          colors={[
            'rgba(255,255,255,0.08)',
            'rgba(255,255,255,0.02)',
          ]}
          style={styles.profileGradient}
        >
          <View style={styles.imageContainer}>
            <Image
              source={{
                uri: item.image || 'https://i.pravatar.cc/300',
              }}
              style={styles.profileImage}
            />

            {item.isKids && (
              <View style={styles.kidsBadge}>
                <Text style={styles.kidsBadgeText}>Kids</Text>
              </View>
            )}
          </View>

          <Text style={styles.profileName}>
            {item.name || 'Profile'}
          </Text>
        </LinearGradient>
      </TouchableOpacity>
    );
  };

  // Show loading while fetching profiles
  if (loading && profiles.length === 0) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#F7D49B" />
          <Text style={{ color: '#9CA3AF', marginTop: 16 }}>Loading profiles...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="light-content"
      />

      {/* BACKGROUND */}

      <LinearGradient
        colors={[
          '#040611',
          '#070B1A',
          '#040611',
        ]}
        style={StyleSheet.absoluteFillObject}
      />

      {/* GLOW EFFECTS */}

      <View style={styles.blueGlow} />

      <View style={styles.orangeGlow} />

      {/* SCROLL */}

      <ScrollView
        showsVerticalScrollIndicator={false}
        style={styles.scrollView}
        contentContainerStyle={
          styles.scrollContent
        }
      >
        <View style={styles.container}>
          {/* HEADER */}

          <View style={styles.header}>
            <Text style={styles.title}>
              Who's Watching?
            </Text>

            <Text style={styles.subtitle}>
              Choose your profile
            </Text>
          </View>

          {/* MAIN PROFILE (first one) */}

          {profiles.length > 0 && (
            <TouchableOpacity
              activeOpacity={0.92}
              style={styles.mainProfileWrapper}
              onPress={() => openPlatform(profiles[0])}
            >
              <LinearGradient
                colors={[
                  'rgba(255,255,255,0.10)',
                  'rgba(255,255,255,0.03)',
                ]}
                style={styles.mainProfileCard}
              >
                <Image
                  source={{
                    uri: profiles[0]?.image || 'https://i.pravatar.cc/300',
                  }}
                  style={styles.mainProfileImage}
                />

                <Text style={styles.mainName}>
                  {profiles[0]?.name || 'User'}
                </Text>

                <TouchableOpacity
                  activeOpacity={0.9}
                  style={styles.continueBtn}
                  onPress={() => openPlatform(profiles[0])}
                >
                  <LinearGradient
                    colors={[
                      '#F7D49B',
                      '#D9A45F',
                    ]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={
                      styles.continueGradient
                    }
                  >
                    <Text
                      style={
                        styles.continueText
                      }
                    >
                      Continue
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>
              </LinearGradient>
            </TouchableOpacity>
          )}

          {/* NO PROFILES YET */}
          {profiles.length === 0 && (
            <View style={styles.emptyState}>
              <Ionicons name="person-add-outline" size={48} color="#F7D49B" />
              <Text style={styles.emptyText}>No profiles yet</Text>
              <Text style={styles.emptySubtext}>Add a profile to get started</Text>
            </View>
          )}

          {/* OTHER PROFILES */}

          {profiles.length > 1 && (
            <FlatList
              data={profiles.slice(1)}
              keyExtractor={(item) => String(item?.id || Math.random())}
              numColumns={2}
              scrollEnabled={false}
              contentContainerStyle={
                styles.profileList
              }
              columnWrapperStyle={
                styles.columnWrapper
              }
              renderItem={renderProfile}
            />
          )}

          {/* ADD PROFILE */}

          <TouchableOpacity
            activeOpacity={0.88}
            style={styles.addProfileCard}
            onPress={() => setShowAddModal(true)}
          >
            <LinearGradient
              colors={[
                'rgba(255,255,255,0.06)',
                'rgba(255,255,255,0.02)',
              ]}
              style={styles.addGradient}
            >
              <View
                style={styles.plusCircle}
              >
                <Feather
                  name="plus"
                  size={26}
                  color="#F7D49B"
                />
              </View>

              <Text style={styles.addText}>
                Add Profile
              </Text>
            </LinearGradient>
          </TouchableOpacity>

          {/* MANAGE */}

          <TouchableOpacity
            activeOpacity={0.88}
            style={styles.manageBtn}
          >
            <LinearGradient
              colors={[
                'rgba(255,255,255,0.07)',
                'rgba(255,255,255,0.03)',
              ]}
              style={
                styles.manageGradient
              }
            >
              <Feather
                name="edit-2"
                size={14}
                color="#F7D49B"
              />

              <Text
                style={styles.manageText}
              >
                Manage Profiles
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* ADD PROFILE MODAL */}
      <Modal
        visible={showAddModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowAddModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {/* Close Button */}
            <TouchableOpacity
              style={styles.modalClose}
              onPress={() => setShowAddModal(false)}
            >
              <Ionicons name="close" size={24} color="#fff" />
            </TouchableOpacity>

            <Text style={styles.modalTitle}>Add New Profile</Text>
            <Text style={styles.modalSubtitle}>Create a profile for another person watching</Text>

            {/* Name Input */}
            <TextInput
              style={styles.nameInput}
              placeholder="Profile Name"
              placeholderTextColor="#666"
              value={newProfileName}
              onChangeText={setNewProfileName}
              maxLength={20}
            />

            {/* Avatar Selection */}
            <Text style={styles.avatarLabel}>Choose Avatar</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.avatarScroll}
              contentContainerStyle={styles.avatarScrollContent}
            >
              {AVATAR_OPTIONS.map((avatarUri, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => setSelectedAvatar(avatarUri)}
                  style={[
                    styles.avatarOption,
                    selectedAvatar === avatarUri && styles.avatarSelected,
                  ]}
                >
                  <Image source={{ uri: avatarUri }} style={styles.avatarImage} />
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Kids Toggle */}
            <TouchableOpacity
              style={styles.kidsToggle}
              onPress={() => setIsKids(!isKids)}
            >
              <View style={[styles.checkbox, isKids && styles.checkboxChecked]}>
                {isKids && <Ionicons name="checkmark" size={16} color="#111" />}
              </View>
              <Text style={styles.kidsLabel}>Kids Profile</Text>
            </TouchableOpacity>

            {/* Save Button */}
            <TouchableOpacity
              activeOpacity={0.9}
              style={styles.saveBtn}
              onPress={handleAddProfile}
              disabled={saving}
            >
              <LinearGradient
                colors={['#F7D49B', '#D9A45F']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.saveGradient}
              >
                {saving ? (
                  <ActivityIndicator size="small" color="#111" />
                ) : (
                  <Text style={styles.saveText}>Create Profile</Text>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#040611',
  },

  scrollView: {
    flex: 1,
    backgroundColor: '#040611',
  },

  scrollContent: {
    flexGrow: 1,
    paddingBottom: 50,
  },

  container: {
    flex: 1,
    paddingHorizontal: 24,
    alignItems: 'center',
    paddingTop:
      Platform.OS === 'android'
        ? 20
        : 10,
    paddingBottom: 40,
  },

  /* GLOW */

  blueGlow: {
    position: 'absolute',
    top: -120,
    left: -100,
    width: 260,
    height: 260,
    borderRadius: 260,
    backgroundColor:
      'rgba(59,130,246,0.15)',
  },

  orangeGlow: {
    position: 'absolute',
    bottom: -120,
    right: -100,
    width: 240,
    height: 240,
    borderRadius: 240,
    backgroundColor:
      'rgba(245,158,11,0.12)',
  },

  /* HEADER */

  header: {
    alignItems: 'center',
    marginTop: 20,
  },

  title: {
    color: '#fff',
    fontSize: 34,
    fontWeight: '900',
    letterSpacing: 0.5,
  },

  subtitle: {
    color: '#9CA3AF',
    fontSize: 14,
    marginTop: 10,
    letterSpacing: 0.4,
  },

  /* EMPTY STATE */

  emptyState: {
    alignItems: 'center',
    marginTop: 60,
    marginBottom: 20,
  },

  emptyText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
    marginTop: 16,
  },

  emptySubtext: {
    color: '#9CA3AF',
    fontSize: 14,
    marginTop: 8,
  },

  /* MAIN PROFILE */

  mainProfileWrapper: {
    width: '100%',
    alignItems: 'center',
    marginTop: 34,
  },

  mainProfileCard: {
    width: width * 0.72,
    borderRadius: 34,
    paddingVertical: 30,
    alignItems: 'center',
    borderWidth: 1,
    borderColor:
      'rgba(255,255,255,0.08)',
  },

  mainProfileImage: {
    width: 124,
    height: 124,
    borderRadius: 62,
    borderWidth: 3,
    borderColor: '#F7D49B',
  },

  mainName: {
    color: '#fff',
    fontSize: 23,
    fontWeight: '800',
    marginTop: 18,
  },

  continueBtn: {
    width: '82%',
    marginTop: 24,
    borderRadius: 18,
    overflow: 'hidden',
  },

  continueGradient: {
    paddingVertical: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },

  continueText: {
    color: '#111',
    fontSize: 15,
    fontWeight: '800',
  },

  /* GRID */

  profileList: {
    width: '100%',
    marginTop: 34,
  },

  columnWrapper: {
    justifyContent: 'space-between',
    marginBottom: 18,
  },

  profileCard: {
    width: '47%',
  },

  profileGradient: {
    borderRadius: 28,
    paddingVertical: 22,
    alignItems: 'center',
    borderWidth: 1,
    borderColor:
      'rgba(255,255,255,0.05)',
  },

  imageContainer: {
    position: 'relative',
  },

  profileImage: {
    width: PROFILE_SIZE,
    height: PROFILE_SIZE,
    borderRadius: PROFILE_SIZE / 2,
  },

  kidsBadge: {
    position: 'absolute',
    right: -8,
    bottom: -4,
    backgroundColor: '#F7D49B',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#040611',
  },

  kidsBadgeText: {
    color: '#111',
    fontSize: 10,
    fontWeight: '800',
  },

  profileName: {
    color: '#fff',
    marginTop: 14,
    fontSize: 15,
    fontWeight: '700',
  },

  /* ADD PROFILE */

  addProfileCard: {
    width: 160,
    marginTop: 10,
    borderRadius: 26,
    overflow: 'hidden',
  },

  addGradient: {
    paddingVertical: 22,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor:
      'rgba(255,255,255,0.05)',
  },

  plusCircle: {
    width: 62,
    height: 62,
    borderRadius: 31,
    backgroundColor:
      'rgba(255,255,255,0.05)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  addText: {
    color: '#fff',
    marginTop: 14,
    fontSize: 14,
    fontWeight: '700',
  },

  /* MANAGE */

  manageBtn: {
    marginTop: 24,
    borderRadius: 30,
    overflow: 'hidden',
    marginBottom: 30,
  },

  manageGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor:
      'rgba(255,255,255,0.06)',
  },

  manageText: {
    color: '#F7D49B',
    marginLeft: 10,
    fontWeight: '700',
    fontSize: 13,
  },

  /* MODAL */

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },

  modalContent: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: '#111827',
    borderRadius: 28,
    padding: 28,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },

  modalClose: {
    position: 'absolute',
    top: 16,
    right: 16,
    zIndex: 10,
    padding: 4,
  },

  modalTitle: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 6,
  },

  modalSubtitle: {
    color: '#9CA3AF',
    fontSize: 13,
    marginBottom: 24,
  },

  nameInput: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 14,
    paddingHorizontal: 18,
    paddingVertical: 14,
    color: '#fff',
    fontSize: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    marginBottom: 20,
  },

  avatarLabel: {
    color: '#9CA3AF',
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 12,
  },

  avatarScroll: {
    marginBottom: 20,
  },

  avatarScrollContent: {
    gap: 10,
  },

  avatarOption: {
    width: 56,
    height: 56,
    borderRadius: 28,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'transparent',
  },

  avatarSelected: {
    borderColor: '#F7D49B',
  },

  avatarImage: {
    width: '100%',
    height: '100%',
  },

  kidsToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },

  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },

  checkboxChecked: {
    backgroundColor: '#F7D49B',
    borderColor: '#F7D49B',
  },

  kidsLabel: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },

  saveBtn: {
    borderRadius: 18,
    overflow: 'hidden',
  },

  saveGradient: {
    paddingVertical: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },

  saveText: {
    color: '#111',
    fontSize: 15,
    fontWeight: '800',
  },
});
import React from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useAuth } from '../src/context/AuthContext';

const formatDate = (d?: string) => {
  if (!d) return 'N/A';
  try {
    return new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  } catch {
    return 'N/A';
  }
};

const InfoRow = ({ icon, label, value }: { icon: any; label: string; value: string }) => (
  <View style={styles.infoRow}>
    <View style={styles.infoIconBox}>
      <Ionicons name={icon} size={18} color="#FFD166" />
    </View>
    <View style={{ flex: 1 }}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  </View>
);

export default function ProfileDetails() {
  const { user, selectedProfile, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.center}>
          <Ionicons name="person-circle-outline" size={64} color="#556" />
          <Text style={styles.emptyText}>Please sign in to view your profile.</Text>
          <TouchableOpacity style={styles.signInBtn} onPress={() => router.replace('/(auth)/login')}>
            <Text style={styles.signInText}>Sign In</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor="#090D16" />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Profile</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.avatarSection}>
          <Image source={{ uri: user?.avatar || 'https://i.pravatar.cc/300' }} style={styles.avatar} />
          <Text style={styles.name}>{user?.name || 'User'}</Text>

          <View style={styles.badgeRow}>
            {user?.role === 'admin' && (
              <View style={[styles.badge, { backgroundColor: 'rgba(255,184,0,0.15)', borderColor: '#FFB800' }]}>
                <Ionicons name="shield-checkmark" size={12} color="#FFB800" />
                <Text style={[styles.badgeText, { color: '#FFB800' }]}>Admin</Text>
              </View>
            )}
            <View
              style={[
                styles.badge,
                user?.isVerified
                  ? { backgroundColor: 'rgba(0,196,140,0.15)', borderColor: '#00C48C' }
                  : { backgroundColor: 'rgba(255,90,90,0.15)', borderColor: '#FF5A5A' },
              ]}
            >
              <Ionicons name={user?.isVerified ? 'checkmark-circle' : 'alert-circle'} size={12} color={user?.isVerified ? '#00C48C' : '#FF5A5A'} />
              <Text style={[styles.badgeText, { color: user?.isVerified ? '#00C48C' : '#FF5A5A' }]}>
                {user?.isVerified ? 'Verified' : 'Not Verified'}
              </Text>
            </View>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Account Information</Text>
        <View style={styles.card}>
          <InfoRow icon="mail-outline" label="Email" value={user?.email || 'N/A'} />
          <InfoRow icon="call-outline" label="Phone" value={user?.phone || 'Not added'} />
          <InfoRow icon="person-outline" label="Role" value={user?.role === 'admin' ? 'Administrator' : 'Standard User'} />
          <InfoRow icon="calendar-outline" label="Member Since" value={formatDate(user?.createdAt)} />
        </View>

        {selectedProfile && (
          <>
            <Text style={styles.sectionTitle}>Active Profile</Text>
            <View style={styles.card}>
              <View style={styles.profilePreviewRow}>
                <Image source={{ uri: selectedProfile.image }} style={styles.profileAvatar} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.profileName}>{selectedProfile.name}</Text>
                  <Text style={styles.profileMeta}>{selectedProfile.isKids ? 'Kids Profile' : 'Standard Profile'}</Text>
                </View>
                <TouchableOpacity onPress={() => router.push('/ChooseProfile')}>
                  <Text style={styles.switchText}>Switch</Text>
                </TouchableOpacity>
              </View>
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#090D16' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 30 },
  emptyText: { color: '#8D96A8', fontSize: 14, marginTop: 14, textAlign: 'center' },
  signInBtn: { marginTop: 20, backgroundColor: '#F4B840', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 14 },
  signInText: { color: '#000', fontWeight: '700', fontSize: 14 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backBtn: { width: 36, height: 36, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { color: '#fff', fontSize: 18, fontWeight: '800' },
  scrollContent: { paddingHorizontal: 16, paddingBottom: 60 },
  avatarSection: { alignItems: 'center', marginTop: 10, marginBottom: 28 },
  avatar: { width: 96, height: 96, borderRadius: 48, borderWidth: 3, borderColor: 'rgba(255,209,102,0.3)' },
  name: { color: '#fff', fontSize: 20, fontWeight: '800', marginTop: 14 },
  badgeRow: { flexDirection: 'row', gap: 8, marginTop: 10 },
  badge: { flexDirection: 'row', alignItems: 'center', gap: 4, borderWidth: 1, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20 },
  badgeText: { fontSize: 11, fontWeight: '700' },
  sectionTitle: { color: '#8D96A8', fontSize: 11, marginBottom: 12, marginLeft: 2, letterSpacing: 0.5 },
  card: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 20,
    marginBottom: 24,
    overflow: 'hidden',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  infoIconBox: {
    width: 34,
    height: 34,
    borderRadius: 12,
    backgroundColor: 'rgba(255,209,102,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  infoLabel: { color: '#8D96A8', fontSize: 11, marginBottom: 3 },
  infoValue: { color: '#fff', fontSize: 14, fontWeight: '600' },
  profilePreviewRow: { flexDirection: 'row', alignItems: 'center', padding: 16, gap: 12 },
  profileAvatar: { width: 48, height: 48, borderRadius: 12, backgroundColor: '#222' },
  profileName: { color: '#fff', fontSize: 15, fontWeight: '700' },
  profileMeta: { color: '#8D96A8', fontSize: 12, marginTop: 2 },
  switchText: { color: '#FFD166', fontSize: 13, fontWeight: '700' },
});

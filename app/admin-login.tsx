import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { apiClient } from '../src/lib/api';
import { useAuth } from '../src/context/AuthContext';

// Admin entry point: /admin-login
// The ONLY way to reach the admin panel. Web browser only.
// After a successful admin login it redirects to /admin/dashboard.

export default function AdminLogin() {
  const { user, isLoading, signIn } = useAuth();

  const [email, setEmail] = useState('admin@talenthunt.com');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Already-authenticated admin skips the form — hook stays above every early return.
  useEffect(() => {
    if (!isLoading && user?.role === 'admin') {
      router.replace('/admin/dashboard');
    }
  }, [isLoading, user]);

  // Web only — admin panel is not available on mobile.
  if (Platform.OS !== 'web') {
    return (
      <View style={s.block}>
        <Ionicons name="desktop-outline" size={48} color="#9CA3AF" />
        <Text style={s.blockText}>Admin panel is only available in a web browser.</Text>
        <Text style={s.blockSub}>Open http://localhost:8081/admin-login in Chrome or Firefox.</Text>
      </View>
    );
  }

  if (isLoading) {
    return (
      <View style={s.block}>
        <ActivityIndicator size="large" color="#FFB800" />
      </View>
    );
  }

  // Avoid form flicker while the redirect above is pending.
  if (user?.role === 'admin') return null;

  const handleLogin = async () => {
    const trimEmail = email.trim().toLowerCase();
    const trimPass = password.trim();

    if (!trimEmail || !trimPass) {
      setError('Email and password are required.');
      return;
    }

    setError('');
    setSubmitting(true);

    try {
      const res: any = await apiClient.post('/auth/login', {
        email: trimEmail,
        password: trimPass,
      });

      const token: string = res?.accessToken || '';
      const userData = res?.user || null;

      if (!token) {
        setError('Login failed — no token returned. Make sure the server is running.');
        return;
      }

      if (userData?.role !== 'admin') {
        setError('Access denied. This account does not have admin privileges.');
        return;
      }

      await signIn(token, userData);
      router.replace('/admin/dashboard');
    } catch (e: any) {
      setError(e?.message || 'Login failed. Check your credentials.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={s.root}>
      {/* Background gradient */}
      <LinearGradient colors={['#040611', '#080E24', '#040611']} style={StyleSheet.absoluteFillObject} />
      <View style={s.glow1} />
      <View style={s.glow2} />

      {/* Card */}
      <View style={s.card}>
        {/* Logo + title */}
        <View style={s.logoRow}>
          <View style={s.logoBox}>
            <Ionicons name="shield-checkmark" size={28} color="#FFB800" />
          </View>
          <View>
            <Text style={s.brand}>Talent Hunt</Text>
            <Text style={s.brandSub}>Admin Panel</Text>
          </View>
        </View>

        <Text style={s.heading}>Sign in to Admin</Text>
        <Text style={s.hint}>Use your admin credentials to access the control panel.</Text>

        {/* Email */}
        <View style={s.fieldGroup}>
          <Text style={s.label}>Email address</Text>
          <View style={s.inputRow}>
            <Ionicons name="mail-outline" size={18} color="#6B7280" style={s.inputIcon} />
            <TextInput
              style={s.input}
              value={email}
              onChangeText={setEmail}
              placeholder="admin@talenthunt.com"
              placeholderTextColor="#4B5563"
              autoCapitalize="none"
              keyboardType="email-address"
              autoComplete="email"
            />
          </View>
        </View>

        {/* Password */}
        <View style={s.fieldGroup}>
          <Text style={s.label}>Password</Text>
          <View style={s.inputRow}>
            <Ionicons name="lock-closed-outline" size={18} color="#6B7280" style={s.inputIcon} />
            <TextInput
              style={[s.input, { flex: 1 }]}
              value={password}
              onChangeText={setPassword}
              placeholder="••••••••"
              placeholderTextColor="#4B5563"
              secureTextEntry={!showPassword}
              autoComplete="current-password"
              onSubmitEditing={handleLogin}
            />
            <Pressable onPress={() => setShowPassword((v) => !v)} style={s.eyeBtn}>
              <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={18} color="#6B7280" />
            </Pressable>
          </View>
        </View>

        {/* Error */}
        {!!error && (
          <View style={s.errorBox}>
            <Ionicons name="alert-circle-outline" size={16} color="#FF5A5A" />
            <Text style={s.errorText}>{error}</Text>
          </View>
        )}

        {/* Login button */}
        <TouchableOpacity activeOpacity={0.88} style={s.loginBtn} onPress={handleLogin} disabled={submitting}>
          <LinearGradient
            colors={['#FFB800', '#FF8C00']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={s.loginGrad}
          >
            {submitting ? (
              <ActivityIndicator size="small" color="#111" />
            ) : (
              <>
                <Ionicons name="log-in-outline" size={20} color="#111" />
                <Text style={s.loginText}>Sign In</Text>
              </>
            )}
          </LinearGradient>
        </TouchableOpacity>

        {/* Credentials hint */}
        <View style={s.credHint}>
          <Ionicons name="information-circle-outline" size={14} color="#6B7280" />
          <Text style={s.credHintText}>
            Default: admin@talenthunt.com / Admin@123{'\n'}
            Run <Text style={s.codeText}>node seed.js</Text> in <Text style={s.codeText}>server/</Text> if the admin doesn't exist yet.
          </Text>
        </View>
      </View>

      <Text style={s.version}>Talent Hunt Admin • v1.0</Text>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#040611', alignItems: 'center', justifyContent: 'center', padding: 20 },
  block: { flex: 1, backgroundColor: '#040611', alignItems: 'center', justifyContent: 'center', gap: 12 },
  blockText: { color: '#9CA3AF', fontSize: 16, fontWeight: '600', textAlign: 'center', marginTop: 8 },
  blockSub: { color: '#6B7280', fontSize: 13, textAlign: 'center' },

  glow1: { position: 'absolute', top: -200, right: -150, width: 400, height: 400, borderRadius: 200, backgroundColor: 'rgba(245,158,11,0.07)' },
  glow2: { position: 'absolute', bottom: -200, left: -150, width: 380, height: 380, borderRadius: 190, backgroundColor: 'rgba(59,130,246,0.07)' },

  card: {
    width: '100%',
    maxWidth: 440,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
    borderRadius: 28,
    padding: 36,
  },

  logoRow: { flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 28 },
  logoBox: {
    width: 52, height: 52, borderRadius: 16,
    backgroundColor: 'rgba(255,184,0,0.12)', borderWidth: 1, borderColor: 'rgba(255,184,0,0.25)',
    alignItems: 'center', justifyContent: 'center',
  },
  brand: { color: '#fff', fontSize: 20, fontWeight: '900', letterSpacing: 0.3 },
  brandSub: { color: '#9CA3AF', fontSize: 12, fontWeight: '600', marginTop: 1 },

  heading: { color: '#fff', fontSize: 24, fontWeight: '800', marginBottom: 6 },
  hint: { color: '#6B7280', fontSize: 13, lineHeight: 20, marginBottom: 28 },

  fieldGroup: { marginBottom: 18 },
  label: { color: '#9CA3AF', fontSize: 12, fontWeight: '700', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.6 },
  inputRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
    borderRadius: 14, paddingHorizontal: 14,
  },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, paddingVertical: 14, color: '#fff', fontSize: 15, outlineStyle: 'none' } as any,
  eyeBtn: { padding: 4 },

  errorBox: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: 'rgba(255,90,90,0.08)', borderWidth: 1, borderColor: 'rgba(255,90,90,0.2)', borderRadius: 10, padding: 12, marginBottom: 16 },
  errorText: { color: '#FF8080', fontSize: 13, flex: 1, lineHeight: 18 },

  loginBtn: { borderRadius: 16, overflow: 'hidden', marginTop: 4 },
  loginGrad: { paddingVertical: 16, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 10 },
  loginText: { color: '#111', fontSize: 16, fontWeight: '800' },

  credHint: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, marginTop: 22, backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: 10, padding: 12 },
  credHintText: { color: '#6B7280', fontSize: 12, lineHeight: 19, flex: 1 },
  codeText: { color: '#9CA3AF', fontFamily: Platform.OS === 'web' ? 'monospace' : undefined },

  version: { position: 'absolute', bottom: 20, color: '#374151', fontSize: 12 },
});

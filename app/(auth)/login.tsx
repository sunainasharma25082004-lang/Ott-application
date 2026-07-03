  
// app/login.tsx

import React, { useRef, useState, memo, useEffect } from "react";

import { router } from "expo-router";

import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Animated,
  Dimensions,
  Platform,
  KeyboardAvoidingView,
  StatusBar,
  ActivityIndicator,
  Alert,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";

import {
  Feather,
  AntDesign,
  FontAwesome,
} from "@expo/vector-icons";

import { apiClient, API_BASE_URL } from "../../src/lib/api";
import { useAuth } from "../../src/context/AuthContext";

const { width, height } = Dimensions.get("window");

const HORIZONTAL_PADDING = 20;

const TAB_CONTAINER_WIDTH =
  width - HORIZONTAL_PADDING * 2 - 10;

const TAB_WIDTH = TAB_CONTAINER_WIDTH / 2;

/* =========================
   INPUT FIELD (controlled)
========================= */

const InputField = memo(
  ({
    icon,
    placeholder,
    secureTextEntry,
    rightIcon,
    onRightPress,
    value,
    onChangeText,
    keyboardType,
  }: any) => (
    <View style={styles.inputBox}>
      <Feather
        name={icon}
        size={18}
        color="#888"
      />

      <TextInput
        placeholder={placeholder}
        placeholderTextColor="#999"
        secureTextEntry={secureTextEntry}
        style={styles.input}
        autoCapitalize="none"
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType}
      />

      {rightIcon ? (
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={onRightPress}
        >
          <Feather
            name={rightIcon}
            size={18}
            color="#888"
          />
        </TouchableOpacity>
      ) : null}
    </View>
  )
);

/* =========================
   MAIN BUTTON
========================= */

const MainButton = memo(
  ({
    title,
    onPress,
    disabled,
  }: {
    title: string;
    onPress: () => void;
    disabled?: boolean;
  }) => (
    <TouchableOpacity
      activeOpacity={0.9}
      style={[styles.mainBtn, disabled && { opacity: 0.6 }]}
      onPress={onPress}
      disabled={disabled}
    >
      <Text style={styles.mainBtnText}>
        {title}
      </Text>
    </TouchableOpacity>
  )
);

/* =========================
   SOCIAL BUTTON
========================= */

const SocialButton = memo(
  ({
    icon,
    title,
  }: any) => (
    <TouchableOpacity
      activeOpacity={0.8}
      style={styles.socialBtn}
    >
      {icon}

      <Text style={styles.socialText}>
        {title}
      </Text>
    </TouchableOpacity>
  )
);

/* =========================
   SCREEN
========================= */

export default function LoginScreen() {
  const { signIn, isAuthenticated } = useAuth();

  // If we become authenticated while on this screen (e.g. from another tab), leave immediately
  useEffect(() => {
    if (isAuthenticated) {
      router.replace("/ChooseProfile");
    }
  }, [isAuthenticated]);

  const [activeTab, setActiveTab] =
    useState<
      "signin" | "register"
    >("signin");

  const [showPassword, setShowPassword] =
    useState(false);

  // Form state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [registeredUserId, setRegisteredUserId] = useState<string | null>(null);
  const [devOtp, setDevOtp] = useState<string | null>(null);

  const slideAnim = useRef(
    new Animated.Value(0)
  ).current;

  // switchTab is now defined above with reset logic

  /* =========================
     AUTH HANDLERS - WIRED TO BACKEND
  ========================= */

  const resetForm = () => {
    setName("");
    setEmail("");
    setPassword("");
    setOtp("");
    setError(null);
    setShowOtpInput(false);
    setRegisteredUserId(null);
    setDevOtp(null);
  };

  const switchTab = (tab: "signin" | "register") => {
    setActiveTab(tab);
    resetForm();

    Animated.spring(slideAnim, {
      toValue: tab === "signin" ? 0 : TAB_WIDTH,
      useNativeDriver: true,
      friction: 8,
      tension: 70,
    }).start();
  };

  const handleLogin = async () => {
    if (loading) return;
    if (!email || !password) {
      setError("Email and password are required");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res: any = await apiClient.post("/auth/login", { email, password });

      if (res.requiresVerification) {
        setRegisteredUserId(res.userId);
        setShowOtpInput(true);
        if (res.devOtp) setDevOtp(String(res.devOtp));
        setError("Account not verified. Please enter the OTP sent to your email.");
        return;
      }

      if (res.accessToken) {
        const userData = res.user || null;
        await signIn(res.accessToken, userData);
        Alert.alert("Success", "Logged in successfully!");
        router.replace("/ChooseProfile");
      }
    } catch (err: any) {
      let msg = err?.message || "Login failed. Please check your credentials.";

      if (err?.status === 422 && err?.errors && Array.isArray(err.errors)) {
        msg = err.errors.map((e: any) => `${e.field}: ${e.message}`).join('\n');
      }

      // Special handling for rate limit (429)
      if (err?.status === 429 || msg.includes('Too many') || msg.includes('Rate limit')) {
        msg = "Too many login attempts. Please wait a minute and try again (rate limit is relaxed in development).";
      }

      if (msg.includes('Network Error') || msg.includes('Cannot reach backend') || msg.includes('timeout')) {
        setError("Server tak pahunch nahi paa raha. Backend + Firewall check karo (Alert mein full guide hai).");
        Alert.alert('Network Error - Backend Connect Nahi Ho Raha', msg, [{ text: 'Samajh Gaya' }]);
      } else {
        setError(msg);
        if (err?.status === 422) {
          Alert.alert('Validation Failed', msg);
        } else if (err?.status === 429) {
          Alert.alert('Rate Limited', msg);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    if (loading) return;
    if (!name || !email || !password) {
      setError("Name, email and password are required");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res: any = await apiClient.post("/auth/register", {
        name,
        email,
        password,
      });

      // Backend returns userId after register
      setRegisteredUserId(res.userId || null);
      setShowOtpInput(true);
      if (res.devOtp) setDevOtp(String(res.devOtp));
      setError("Account created! Please check your email for the 6-digit OTP.");
      // In dev with no real email, user can check terminal logs for OTP
    } catch (err: any) {
      let msg = err?.message || "Registration failed. Try a different email.";

      // Special handling for validation errors (422)
      if (err?.status === 422 && err?.errors && Array.isArray(err.errors)) {
        msg = err.errors.map((e: any) => `${e.field}: ${e.message}`).join('\n');
      }

      if (msg.includes('Network Error') || msg.includes('Cannot reach backend') || msg.includes('timeout')) {
        setError("Server tak pahunch nahi paa raha. Backend + Firewall check karo (Alert mein full guide hai).");
        Alert.alert('Network Error - Backend Connect Nahi Ho Raha', msg, [{ text: 'Samajh Gaya' }]);
      } else {
        setError(msg);
        if (err?.status === 422) {
          Alert.alert('Validation Failed', msg);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (loading) return;
    if (!otp || otp.length !== 6) {
      setError("Please enter the 6-digit OTP");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const payload: any = { otp };
      if (registeredUserId) payload.userId = registeredUserId;
      else payload.email = email;

      const res: any = await apiClient.post("/auth/verify-otp", payload);

      if (res.accessToken) {
        const userData = res.user || null;
        await signIn(res.accessToken, userData);
        Alert.alert("Success", "Account verified! Welcome to Talent Hunt.");
        router.replace("/ChooseProfile");
      }
    } catch (err: any) {
      let msg = err?.message || "Invalid or expired OTP. Please try again.";

      if (err?.status === 422 && err?.errors && Array.isArray(err.errors)) {
        msg = err.errors.map((e: any) => `${e.field}: ${e.message}`).join('\n');
      }

      if (msg.includes('Network Error') || msg.includes('Cannot reach backend') || msg.includes('timeout')) {
        setError("Server tak pahunch nahi paa raha. Backend + Firewall check karo (Alert mein full guide hai).");
        Alert.alert('Network Error - Backend Connect Nahi Ho Raha', msg, [{ text: 'Samajh Gaya' }]);
      } else {
        setError(msg);
        if (err?.status === 422) {
          Alert.alert('Validation Failed', msg);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (loading) return;
    if (!registeredUserId && !email) {
      setError("Please register or enter email first");
      return;
    }

    setLoading(true);
    try {
      const res: any = await apiClient.post("/auth/resend-otp", {
        userId: registeredUserId,
        email,
      });
      if (res.devOtp) setDevOtp(String(res.devOtp));
      setError("New OTP sent. Check your email (or terminal in dev).");
    } catch (err: any) {
      let msg = err?.message || "Failed to resend OTP";
      if (err?.status === 422 && err?.errors && Array.isArray(err.errors)) {
        msg = err.errors.map((e: any) => `${e.field}: ${e.message}`).join('\n');
      }
      if (msg.includes('Network Error') || msg.includes('Cannot reach backend') || msg.includes('timeout')) {
        setError("Server tak pahunch nahi paa raha. Backend + Firewall check karo (Alert mein full guide hai).");
        Alert.alert('Network Error - Backend Connect Nahi Ho Raha', msg, [{ text: 'Samajh Gaya' }]);
      } else {
        setError(msg);
        if (err?.status === 422) {
          Alert.alert('Validation Failed', msg);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const skipToHome = () => {
    router.replace("/(tabs)/home");
  };

  // Dev helper: quick test if backend is reachable from the device/emulator
  const testBackendConnection = async () => {
    try {
      const res: any = await apiClient.get("/ping");
      Alert.alert(
        "✅ Backend Reachable!",
        `Ping success from ${Platform.OS}.\nResponse: ${JSON.stringify(res)}`
      );
    } catch (err: any) {
      const msg = err?.message || "Unknown error";
      const baseForTest = (API_BASE_URL || "http://10.0.2.2:5000/api").replace("/api", "");
      Alert.alert(
        "❌ Backend NOT reachable",
        `Tried: ${baseForTest}/api/ping\n\n${msg}\n\n` +
        `Check:\n` +
        `1. Backend chal raha? (cd server && npm run dev)\n` +
        `2. Emulator ke andar browser mein ye kholo:\n   ${baseForTest}/api/ping\n` +
        `3. Windows Firewall (Admin PowerShell):\n   New-NetFirewallRule -DisplayName "Node 5000" -Direction Inbound -LocalPort 5000 -Protocol TCP -Action Allow\n` +
        `4. App reload karo (r dabaao metro mein)`
      );
    }
  };

  // Auto clear error after some time
  useEffect(() => {
    if (error) {
      const t = setTimeout(() => setError(null), 6000);
      return () => clearTimeout(t);
    }
  }, [error]);

  return (
    <SafeAreaView
      edges={["top", "bottom"]}
      style={styles.safeArea}
    >
      <StatusBar
        translucent={false}
        backgroundColor="#0B0B0B"
        barStyle="light-content"
      />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={
          Platform.OS === "ios"
            ? "padding"
            : undefined
        }
      >
        <ScrollView
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={
            false
          }
          contentContainerStyle={
            styles.scrollContainer
          }
        >
          {/* ================= HEADER ================= */}

          <View style={styles.topContainer}>
            <View style={styles.headerRow}>
              {/* BACK BUTTON */}

              <TouchableOpacity
                activeOpacity={0.8}
                style={styles.backBtn}
                onPress={() =>
                  router.back()
                }
              >
                <Feather
                  name="arrow-left"
                  size={20}
                  color="#fff"
                />
              </TouchableOpacity>

              {/* SKIP BUTTON */}

              <TouchableOpacity
                activeOpacity={0.8}
                onPress={skipToHome}
              >
                <Text
                  style={styles.skipText}
                >
                  Skip
                </Text>
              </TouchableOpacity>
            </View>

            {/* LOGO */}

            <Text style={styles.logo}>
              TALENT HUNT ✨
            </Text>

            {/* HEADING */}

            <Text style={styles.heading}>
              Welcome back{"\n"}
              to premium.
            </Text>

            <Text
              style={styles.subHeading}
            >
              Sign in to continue
              enjoying exclusive web
              series and discovering
              new talent.
            </Text>
          </View>

          {/* ================= CARD ================= */}

          <View style={styles.card}>
            {/* TOGGLE */}

            <View
              style={styles.tabContainer}
            >
              <Animated.View
                style={[
                  styles.slider,
                  {
                    transform: [
                      {
                        translateX:
                          slideAnim,
                      },
                    ],
                  },
                ]}
              />

              <TouchableOpacity
                activeOpacity={0.9}
                style={styles.tabBtn}
                onPress={() =>
                  switchTab(
                    "signin"
                  )
                }
              >
                <Text
                  style={[
                    styles.tabText,

                    activeTab ===
                      "signin" &&
                      styles.activeTabText,
                  ]}
                >
                  Sign In
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.9}
                style={styles.tabBtn}
                onPress={() =>
                  switchTab(
                    "register"
                  )
                }
              >
                <Text
                  style={[
                    styles.tabText,

                    activeTab ===
                      "register" &&
                      styles.activeTabText,
                  ]}
                >
                  Register
                </Text>
              </TouchableOpacity>
            </View>

            {/* ================= SIGN IN / REGISTER FORM (hidden once OTP phase starts) ================= */}

            {!showOtpInput && (
              activeTab ===
              "signin" ? (
                <>
                  <InputField
                    icon="mail"
                    placeholder="Email"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                  />

                  <InputField
                    icon="lock"
                    placeholder="Password"
                    secureTextEntry={!showPassword}
                    value={password}
                    onChangeText={setPassword}
                    rightIcon={showPassword ? "eye-off" : "eye"}
                    onRightPress={() => setShowPassword(!showPassword)}
                  />

                  <View style={styles.row}>
                    <View style={styles.rememberRow}>
                      <View style={styles.checkbox} />
                      <Text style={styles.rememberText}>Remember me</Text>
                    </View>
                    <TouchableOpacity>
                      <Text style={styles.forgotText}>Forgot Password?</Text>
                    </TouchableOpacity>
                  </View>

                  {error && <Text style={styles.errorText}>{error}</Text>}

                  <MainButton
                    title={loading ? "Signing in..." : "Sign In"}
                    onPress={handleLogin}
                    disabled={loading}
                  />

                  {loading && <ActivityIndicator style={{ marginTop: 10 }} color="#000" />}
                </>
              ) : (
                <>
                  <InputField
                    icon="user"
                    placeholder="Full Name"
                    value={name}
                    onChangeText={setName}
                  />

                  <InputField
                    icon="mail"
                    placeholder="Email"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                  />

                  <InputField
                    icon="lock"
                    placeholder="Create Password"
                    secureTextEntry
                    value={password}
                    onChangeText={setPassword}
                  />

                  <Text style={styles.passwordHint}>
                    Password must have: 8+ chars, uppercase, lowercase, number, special (!@#$ etc)
                  </Text>

                  {error && <Text style={styles.errorText}>{error}</Text>}

                  <MainButton
                    title={loading ? "Creating..." : "Create Account"}
                    onPress={handleRegister}
                    disabled={loading}
                  />

                  {loading && <ActivityIndicator style={{ marginTop: 10 }} color="#000" />}
                </>
              )
            )}

            {/* ================= OTP VERIFICATION (shown after register/login needs verify) ================= */}
            {showOtpInput && (
              <View style={{ marginTop: 10, marginBottom: 20 }}>
                {error && (error.includes("created") || error.includes("Account")) && (
                  <Text style={{ fontSize: 13, color: '#2e7d32', marginBottom: 8, fontWeight: '500' }}>
                    {error}
                  </Text>
                )}
                {error && !(error.includes("created") || error.includes("Account")) && (
                  <Text style={{ fontSize: 12, color: '#c0392b', marginBottom: 8, fontWeight: '500' }}>
                    {error}
                  </Text>
                )}
                <Text style={{ fontSize: 15, fontWeight: '600', marginBottom: 8, color: '#333' }}>
                  Enter 6-digit OTP sent to your email
                </Text>

                {__DEV__ && devOtp && (
                  <View style={styles.devOtpBox}>
                    <Text style={styles.devOtpLabel}>Demo OTP (dev only)</Text>
                    <Text style={styles.devOtpCode}>{devOtp}</Text>
                    <TouchableOpacity
                      onPress={() => setOtp(devOtp)}
                      style={styles.devOtpFillBtn}
                      activeOpacity={0.8}
                    >
                      <Text style={styles.devOtpFillText}>Auto-fill OTP</Text>
                    </TouchableOpacity>
                  </View>
                )}

                <InputField
                  icon="key"
                  placeholder="123456"
                  value={otp}
                  onChangeText={setOtp}
                  keyboardType="number-pad"
                />

                <TouchableOpacity onPress={handleResendOtp} style={{ alignSelf: 'flex-end', marginBottom: 12 }} disabled={loading}>
                  <Text style={{ color: loading ? '#999' : '#D6A13A', fontWeight: '600' }}>Resend OTP</Text>
                </TouchableOpacity>

                <MainButton
                  title={loading ? "Verifying..." : "Verify OTP"}
                  onPress={handleVerifyOtp}
                  disabled={loading}
                />

                <TouchableOpacity onPress={resetForm} style={{ marginTop: 12, alignItems: 'center' }}>
                  <Text style={{ color: '#666' }}>Start over</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* ================= SOCIAL ================= */}

            {!showOtpInput && (
              <Text style={styles.orText}>
                Or continue with
              </Text>
            )}

            <View
              style={styles.socialRow}
            >
              <SocialButton
                icon={
                  <AntDesign
                    name="google"
                    size={18}
                    color="#000"
                  />
                }
                title="Google"
              />

              <SocialButton
                icon={
                  <FontAwesome
                    name="apple"
                    size={20}
                    color="#000"
                  />
                }
                title="Apple"
              />
            </View>

            {__DEV__ && !showOtpInput && activeTab === "signin" && (
              <View style={styles.demoBox}>
                <Text style={styles.demoTitle}>Quick demo login</Text>
                <Text style={styles.demoText}>Email: demo.manager@test.com</Text>
                <Text style={styles.demoText}>Password: Demo@1234</Text>
                <TouchableOpacity
                  onPress={() => {
                    setEmail("demo.manager@test.com");
                    setPassword("Demo@1234");
                  }}
                  style={styles.demoFillBtn}
                  activeOpacity={0.8}
                >
                  <Text style={styles.demoFillText}>Fill demo credentials</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Dev debug helper - shows only in development */}
            {__DEV__ && (
              <TouchableOpacity
                onPress={testBackendConnection}
                style={{ marginTop: 18, alignItems: "center" }}
                activeOpacity={0.7}
              >
                <Text style={{ color: "#888", fontSize: 12 }}>
                  Test Backend Connection (dev only)
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

/* =========================
   STYLES
========================= */

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },

  safeArea: {
    flex: 1,
    backgroundColor: "#0B0B0B",
  },

  scrollContainer: {
    flexGrow: 1,
  },

  topContainer: {
    paddingHorizontal:
      HORIZONTAL_PADDING,
    paddingTop:
      Platform.OS === "android"
        ? 10
        : 0,
    paddingBottom: 30,
  },

  headerRow: {
    flexDirection: "row",
    justifyContent:
      "space-between",
    alignItems: "center",
  },

  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#1D1D1D",
    justifyContent: "center",
    alignItems: "center",
  },

  skipText: {
    color: "#F4B840",
    fontSize: 15,
    fontWeight: "700",
  },

  logo: {
    color: "#F4B840",
    textAlign: "center",
    marginTop: 20,
    fontWeight: "700",
    letterSpacing: 2,
    fontSize: 15,
  },

  heading: {
    color: "#fff",
    fontSize: width * 0.09,
    fontWeight: "800",
    lineHeight: 48,
    marginTop: 30,
  },

  subHeading: {
    color: "#A0A0A0",
    fontSize: 15,
    lineHeight: 24,
    marginTop: 15,
  },

  card: {
    flex: 1,
    backgroundColor: "#fff",
    borderTopLeftRadius: 38,
    borderTopRightRadius: 38,
    padding: 20,
    minHeight: height * 0.65,
  },

  /* TABS */

  tabContainer: {
    width: "100%",
    height: 60,
    backgroundColor: "#F3F3F3",
    borderRadius: 18,
    flexDirection: "row",
    alignItems: "center",
    position: "relative",
    padding: 5,
    marginBottom: 30,
    overflow: "hidden",
  },

  slider: {
    position: "absolute",
    width: TAB_WIDTH,
    height: 50,
    backgroundColor: "#000",
    borderRadius: 15,
    top: 5,
    left: 5,
  },

  tabBtn: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 2,
  },

  tabText: {
    color: "#777",
    fontSize: 15,
    fontWeight: "600",
  },

  activeTabText: {
    color: "#fff",
  },

  /* INPUT */

  inputBox: {
    width: "100%",
    height: 58,
    borderWidth: 1,
    borderColor: "#E7E7E7",
    borderRadius: 18,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    marginBottom: 18,
  },

  input: {
    flex: 1,
    marginLeft: 12,
    fontSize: 15,
    color: "#000",
  },

  /* ROW */

  row: {
    flexDirection: "row",
    justifyContent:
      "space-between",
    alignItems: "center",
    marginBottom: 25,
  },

  rememberRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  checkbox: {
    width: 16,
    height: 16,
    borderWidth: 1,
    borderColor: "#CCC",
    borderRadius: 4,
  },

  rememberText: {
    marginLeft: 8,
    color: "#777",
    fontSize: 13,
  },

  forgotText: {
    color: "#D6A13A",
    fontSize: 13,
    fontWeight: "600",
  },

  /* BUTTON */

  mainBtn: {
    width: "100%",
    height: 58,
    backgroundColor: "#000",
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },

  mainBtnText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },

  /* SOCIAL */

  orText: {
    textAlign: "center",
    color: "#999",
    marginVertical: 25,
    fontSize: 13,
  },

  socialRow: {
    flexDirection: "row",
    justifyContent:
      "space-between",
    gap: 12,
  },

  socialBtn: {
    flex: 1,
    height: 56,
    borderWidth: 1,
    borderColor: "#E5E5E5",
    borderRadius: 16,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 10,
  },

  socialText: {
    color: "#000",
    fontWeight: "600",
    fontSize: 14,
  },

  errorText: {
    color: "#c0392b",
    fontSize: 12,
    textAlign: "left",
    marginBottom: 12,
    fontWeight: "500",
    lineHeight: 16,
  },

  passwordHint: {
    fontSize: 11,
    color: "#666",
    marginBottom: 12,
    marginLeft: 4,
    fontStyle: "italic",
  },

  devOtpBox: {
    backgroundColor: "#FFF8E7",
    borderWidth: 1,
    borderColor: "#F4B840",
    borderRadius: 14,
    padding: 14,
    marginBottom: 16,
    alignItems: "center",
  },

  devOtpLabel: {
    fontSize: 12,
    color: "#8B6914",
    fontWeight: "600",
    marginBottom: 6,
  },

  devOtpCode: {
    fontSize: 28,
    fontWeight: "800",
    color: "#000",
    letterSpacing: 6,
  },

  devOtpFillBtn: {
    marginTop: 10,
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: "#F4B840",
    borderRadius: 10,
  },

  devOtpFillText: {
    color: "#000",
    fontWeight: "700",
    fontSize: 13,
  },

  demoBox: {
    marginTop: 20,
    backgroundColor: "#F8F8F8",
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: "#E5E5E5",
  },

  demoTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#333",
    marginBottom: 8,
  },

  demoText: {
    fontSize: 12,
    color: "#555",
    marginBottom: 4,
  },

  demoFillBtn: {
    marginTop: 10,
    alignSelf: "flex-start",
    backgroundColor: "#000",
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 10,
  },

  demoFillText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
});


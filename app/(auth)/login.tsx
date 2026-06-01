  
// app/login.tsx

import React, { useRef, useState, memo } from "react";

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
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";

import {
  Feather,
  AntDesign,
  FontAwesome,
} from "@expo/vector-icons";

const { width, height } = Dimensions.get("window");

const HORIZONTAL_PADDING = 20;

const TAB_CONTAINER_WIDTH =
  width - HORIZONTAL_PADDING * 2 - 10;

const TAB_WIDTH = TAB_CONTAINER_WIDTH / 2;

/* =========================
   INPUT FIELD
========================= */

const InputField = memo(
  ({
    icon,
    placeholder,
    secureTextEntry,
    rightIcon,
    onRightPress,
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
        secureTextEntry={
          secureTextEntry
        }
        style={styles.input}
        autoCapitalize="none"
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
  }: {
    title: string;
    onPress: () => void;
  }) => (
    <TouchableOpacity
      activeOpacity={0.9}
      style={styles.mainBtn}
      onPress={onPress}
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
  const [activeTab, setActiveTab] =
    useState<
      "signin" | "register"
    >("signin");

  const [showPassword, setShowPassword] =
    useState(false);

  const slideAnim = useRef(
    new Animated.Value(0)
  ).current;

  const switchTab = (
    tab: "signin" | "register"
  ) => {
    setActiveTab(tab);

    Animated.spring(slideAnim, {
      toValue:
        tab === "signin"
          ? 0
          : TAB_WIDTH,
      useNativeDriver: true,
      friction: 8,
      tension: 70,
    }).start();
  };

  /* =========================
     OPEN PROFILE SCREEN
  ========================= */

  const openChooseProfile = () => {
    router.push("/ChooseProfile");
  };

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
                onPress={
                  openChooseProfile
                }
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

            {/* ================= SIGN IN ================= */}

            {activeTab ===
            "signin" ? (
              <>
                <InputField
                  icon="mail"
                  placeholder="Email"
                />

                <InputField
                  icon="lock"
                  placeholder="Password"
                  secureTextEntry={
                    !showPassword
                  }
                  rightIcon={
                    showPassword
                      ? "eye-off"
                      : "eye"
                  }
                  onRightPress={() =>
                    setShowPassword(
                      !showPassword
                    )
                  }
                />

                <View style={styles.row}>
                  <View
                    style={
                      styles.rememberRow
                    }
                  >
                    <View
                      style={
                        styles.checkbox
                      }
                    />

                    <Text
                      style={
                        styles.rememberText
                      }
                    >
                      Remember me
                    </Text>
                  </View>

                  <TouchableOpacity>
                    <Text
                      style={
                        styles.forgotText
                      }
                    >
                      Forgot
                      Password?
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* LOGIN BUTTON */}

                <MainButton
                  title="Sign In"
                  onPress={
                    openChooseProfile
                  }
                />
              </>
            ) : (
              <>
                <InputField
                  icon="user"
                  placeholder="Full Name"
                />

                <InputField
                  icon="mail"
                  placeholder="Email"
                />

                <InputField
                  icon="lock"
                  placeholder="Create Password"
                  secureTextEntry
                />

                {/* REGISTER BUTTON */}

                <MainButton
                  title="Create Account"
                  onPress={
                    openChooseProfile
                  }
                />
              </>
            )}

            {/* ================= SOCIAL ================= */}

            <Text style={styles.orText}>
              Or continue with
            </Text>

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
});


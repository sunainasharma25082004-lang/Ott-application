// app/talentform.jsx

import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StatusBar,
  Image,
  Alert,
  Platform,
  ActivityIndicator,
} from "react-native";

import * as ImagePicker from "expo-image-picker";

import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

import { apiClient } from "../src/lib/api";
import { useAuth } from "../src/context/AuthContext";
import {
  TALENT_CATEGORIES,
  UPLOAD_GUIDELINES,
} from "../src/constants/uploadGuidelines";

// Cross-platform alert helper
const notify = (title, message) => {
  if (Platform.OS === "web") window.alert(`${title}\n\n${message}`);
  else Alert.alert(title, message);
};

export default function talentForm() {
  const { isAuthenticated } = useAuth();

  const [fullName, setFullName] = useState("");
  const [age, setAge] = useState("");
  const [city, setCity] = useState("");
  const [phone, setPhone] = useState("");
  const [instagram, setInstagram] = useState("");
  const [category, setCategory] = useState("Actor");
  const [about, setAbout] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [video, setVideo] = useState(null);

  // PICK VIDEO
  const pickVideo = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      notify("Permission Required", "Please allow gallery access.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Videos,
      quality: 1,
    });

    if (!result.canceled) {
      setVideo(result.assets[0]);
    }
  };

  // Build the video part of the FormData (web vs native differ)
  const appendVideo = async (formData) => {
    const filename = video.fileName || `audition-${category}.mp4`;
    const mimeType = video.mimeType || "video/mp4";

    if (Platform.OS === "web") {
      // On web the picked uri is a blob: URL — fetch it into a real Blob/File
      const resp = await fetch(video.uri);
      const blob = await resp.blob();
      formData.append("auditionVideo", blob, filename);
    } else {
      formData.append("auditionVideo", {
        uri: video.uri,
        name: filename,
        type: mimeType,
      });
    }
  };

  // SUBMIT
  const handleSubmit = async () => {
    if (!isAuthenticated) {
      notify("Login Required", "Please login or register before uploading.");
      router.replace("/(auth)/login");
      return;
    }

    if (!fullName || !age || !city || !phone || !category || !about || !video) {
      notify("Missing Info", "Please fill all details and select a video.");
      return;
    }

    setSubmitting(true);
    try {
      // Fold extra contact/profile info into bio (backend Talent model has no
      // dedicated age/phone/instagram fields). Keep within the 500-char limit.
      const bioExtras = [
        `Age: ${age}`,
        `Phone: ${phone}`,
        instagram ? `Instagram: ${instagram}` : null,
      ]
        .filter(Boolean)
        .join(" • ");
      const bio = `${about}\n\n${bioExtras}`.slice(0, 500);

      const formData = new FormData();
      formData.append("name", fullName.trim());
      formData.append("category", category);
      formData.append("location", city.trim());
      formData.append("bio", bio);
      await appendVideo(formData);

      await apiClient.post("/talent", formData);

      notify(
        "Video Uploaded 🎉",
        "Our team will verify your video within 24 hours. You'll be notified once it's approved and live on the app."
      );
      router.back();
    } catch (e) {
      notify("Upload Failed", e?.message || "Could not upload your video.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#07090D" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* HEADER */}

        <View style={styles.header}>
          <Text style={styles.heading}>Upload Your Talent</Text>

          <Text style={styles.subHeading}>
            Get a chance to appear in movies, dramas & web series.
          </Text>
        </View>

        {/* UPLOAD GUIDELINES */}

        <View style={styles.guidelinesCard}>
          <View style={styles.guidelinesHeaderRow}>
            <Ionicons name="shield-checkmark-outline" size={20} color="#FFB800" />
            <Text style={styles.guidelinesTitle}>Before you upload</Text>
          </View>

          {UPLOAD_GUIDELINES.map((rule, i) => (
            <View key={i} style={styles.ruleRow}>
              <Ionicons
                name="checkmark-circle"
                size={16}
                color="#00C48C"
                style={{ marginTop: 2 }}
              />
              <Text style={styles.ruleText}>{rule}</Text>
            </View>
          ))}
        </View>

        {/* FORM */}

        <View style={styles.formContainer}>
          {/* NAME */}

          <View style={styles.inputBox}>
            <Text style={styles.label}>Full Name</Text>

            <TextInput
              placeholder="Enter your name"
              placeholderTextColor="#777"
              value={fullName}
              onChangeText={setFullName}
              style={styles.input}
            />
          </View>

          {/* AGE */}

          <View style={styles.inputBox}>
            <Text style={styles.label}>Age</Text>

            <TextInput
              placeholder="Enter your age"
              placeholderTextColor="#777"
              keyboardType="numeric"
              value={age}
              onChangeText={setAge}
              style={styles.input}
            />
          </View>

          {/* CITY */}

          <View style={styles.inputBox}>
            <Text style={styles.label}>City</Text>

            <TextInput
              placeholder="Enter your city"
              placeholderTextColor="#777"
              value={city}
              onChangeText={setCity}
              style={styles.input}
            />
          </View>

          {/* PHONE */}

          <View style={styles.inputBox}>
            <Text style={styles.label}>Phone Number</Text>

            <TextInput
              placeholder="Enter your phone number"
              placeholderTextColor="#777"
              keyboardType="phone-pad"
              value={phone}
              onChangeText={setPhone}
              style={styles.input}
            />
          </View>

          {/* INSTAGRAM */}

          <View style={styles.inputBox}>
            <Text style={styles.label}>Instagram ID</Text>

            <TextInput
              placeholder="@yourinstagram"
              placeholderTextColor="#777"
              value={instagram}
              onChangeText={setInstagram}
              style={styles.input}
            />
          </View>

          {/* CATEGORY */}

          <View style={styles.inputBox}>
            <Text style={styles.label}>Talent Category</Text>

            <View style={styles.categoryContainer}>
              {TALENT_CATEGORIES.map((cat) => {
                const isSelected = category === cat;
                return (
                  <TouchableOpacity
                    key={cat}
                    activeOpacity={0.85}
                    style={[
                      styles.categoryTag,
                      isSelected && styles.categoryTagActive,
                    ]}
                    onPress={() => setCategory(cat)}
                  >
                    <Text
                      style={[
                        styles.categoryText,
                        isSelected && styles.categoryTextActive,
                      ]}
                    >
                      {cat}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* ABOUT */}

          <View style={styles.inputBox}>
            <Text style={styles.label}>About Yourself</Text>

            <TextInput
              placeholder="Tell us about yourself..."
              placeholderTextColor="#777"
              multiline
              value={about}
              onChangeText={setAbout}
              style={[styles.input, styles.textArea]}
            />
          </View>

          {/* VIDEO PICKER */}

          <TouchableOpacity
            activeOpacity={0.8}
            style={styles.uploadCard}
            onPress={pickVideo}
          >
            <Ionicons name="cloud-upload-outline" size={34} color="#fff" />

            <Text style={styles.uploadText}>
              {video ? "Video Selected Successfully" : "Upload Audition Video"}
            </Text>

            <Text style={styles.uploadSubText}>MP4 / MOV / Reel Video</Text>
          </TouchableOpacity>

          {/* VIDEO PREVIEW */}

          {video && (
            <View style={styles.previewBox}>
              <Image
                source={{
                  uri: "https://cdn-icons-png.flaticon.com/512/727/727245.png",
                }}
                style={styles.videoIcon}
              />

              <Text numberOfLines={1} style={styles.videoName}>
                {video.fileName || "TalentVideo.mp4"}
              </Text>
            </View>
          )}

          {/* SUBMIT BUTTON */}

          <TouchableOpacity
            activeOpacity={0.9}
            style={[styles.submitButton, submitting && { opacity: 0.7 }]}
            onPress={handleSubmit}
            disabled={submitting}
          >
            {submitting ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.submitText}>Submit Talent</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#07090D",
  },

  scrollContent: {
    padding: 18,
    paddingBottom: 60,
  },

  header: {
    marginTop: 10,
    marginBottom: 20,
  },

  heading: {
    color: "#fff",
    fontSize: 32,
    fontWeight: "800",
  },

  subHeading: {
    color: "#8B93A1",
    fontSize: 14,
    marginTop: 10,
    lineHeight: 22,
  },

  guidelinesCard: {
    backgroundColor: "rgba(255,184,0,0.06)",
    borderWidth: 1,
    borderColor: "rgba(255,184,0,0.2)",
    borderRadius: 18,
    padding: 16,
    marginBottom: 24,
  },

  guidelinesHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },

  guidelinesTitle: {
    color: "#FFB800",
    fontSize: 15,
    fontWeight: "800",
  },

  ruleRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 8,
  },

  ruleText: {
    color: "#C4CAD4",
    fontSize: 13,
    lineHeight: 19,
    flex: 1,
  },

  formContainer: {
    gap: 18,
  },

  inputBox: {},

  label: {
    color: "#fff",
    marginBottom: 10,
    fontSize: 14,
    fontWeight: "600",
  },

  input: {
    backgroundColor: "#111827",
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 16,
    color: "#fff",
    fontSize: 15,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
  },

  textArea: {
    height: 120,
    textAlignVertical: "top",
  },

  categoryContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },

  categoryTag: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 14,
    backgroundColor: "#111827",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
  },

  categoryTagActive: {
    backgroundColor: "rgba(37,99,235,0.2)",
    borderColor: "#2563EB",
  },

  categoryText: {
    color: "#8B93A1",
    fontSize: 13,
    fontWeight: "600",
  },

  categoryTextActive: {
    color: "#fff",
  },

  uploadCard: {
    height: 180,
    borderRadius: 24,
    borderWidth: 1.5,
    borderStyle: "dashed",
    borderColor: "rgba(255,255,255,0.15)",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#0F172A",
  },

  uploadText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
    marginTop: 14,
  },

  uploadSubText: {
    color: "#8B93A1",
    marginTop: 8,
    fontSize: 13,
  },

  previewBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#111827",
    padding: 14,
    borderRadius: 18,
  },

  videoIcon: {
    width: 40,
    height: 40,
    marginRight: 12,
  },

  videoName: {
    color: "#fff",
    flex: 1,
  },

  submitButton: {
    height: 58,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#2563EB",
    marginTop: 10,
  },

  submitText: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "700",
  },
});

// app/talent-form.tsx

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
} from "react-native";

import * as ImagePicker from "expo-image-picker";

import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

export default function talentForm() {
  const [fullName, setFullName] = useState("");
  const [age, setAge] = useState("");
  const [city, setCity] = useState("");
  const [phone, setPhone] = useState("");
  const [instagram, setInstagram] = useState("");
  const [talent, setTalent] = useState("");
  const [about, setAbout] = useState("");

  const [video, setVideo] = useState(null);
  // PICK VIDEO
  const pickVideo = async () => {
    const permission =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert("Permission Required", "Please allow gallery access.");
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

  // SUBMIT
  const handleSubmit = () => {
    if (
      !fullName ||
      !age ||
      !city ||
      !phone ||
      !talent ||
      !about ||
      !video
    ) {
      Alert.alert("Missing Info", "Please fill all details.");
      return;
    }

    Alert.alert(
      "Talent Submitted 🎉",
      "Your profile & video uploaded successfully."
    );

    console.log({
      fullName,
      age,
      city,
      phone,
      instagram,
      talent,
      about,
      video,
    });
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

          {/* TALENT */}

          <View style={styles.inputBox}>
            <Text style={styles.label}>Talent Type</Text>

            <TextInput
              placeholder="Acting / Dancing / Singing"
              placeholderTextColor="#777"
              value={talent}
              onChangeText={setTalent}
              style={styles.input}
            />
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
            <Ionicons
              name="cloud-upload-outline"
              size={34}
              color="#fff"
            />

            <Text style={styles.uploadText}>
              {video
                ? "Video Selected Successfully"
                : "Upload Audition Video"}
            </Text>

            <Text style={styles.uploadSubText}>
              MP4 / MOV / Reel Video
            </Text>
          </TouchableOpacity>

          {/* VIDEO PREVIEW */}

          {video && (
            <View style={styles.previewBox}>
              <Image
                source={{
                  uri:
                    "https://cdn-icons-png.flaticon.com/512/727/727245.png",
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
            style={styles.submitButton}
            onPress={handleSubmit}
          >
            <Text style={styles.submitText}>Submit Talent</Text>
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
    marginBottom: 24,
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
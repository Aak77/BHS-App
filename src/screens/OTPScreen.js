import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useAuth } from "../context/AuthContext";
import { verifyOTP, DEV_MODE } from "../services/auth";
import { createUserProfile } from "../services/firestore";
import { uploadLicenseImage } from "../services/storage";

const OTPScreen = ({ route, navigation }) => {
  const { phone, userName, verificationId, role, licenseNumber, licenseImage } =
    route.params;
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const { setSession } = useAuth();

  const handleVerify = async () => {
    if (otp.length < 6) {
      alert("Please enter the 6-digit OTP");
      return;
    }

    setLoading(true);
    try {
      // 1. Verify OTP
      const user = await verifyOTP(verificationId, otp);
      const uid = user.uid;

      // 2. Build user profile data
      const profileData = {
        name: userName,
        phone: phone,
        role: role,
        createdAt: new Date().toISOString(),
      };

      // 3. Do Storage operations (License Upload) if NOT dev mode
      if (!DEV_MODE) {
        // Upload license for operators
        if (role === "Operator" && licenseImage) {
          try {
            const licenseURL = await uploadLicenseImage(uid, licenseImage);
            profileData.licenseNumber = licenseNumber;
            profileData.licenseImageURL = licenseURL;
            profileData.licenseVerified = false;
          } catch (uploadError) {
            console.log("License upload error (continuing):", uploadError);
            profileData.licenseNumber = licenseNumber;
            profileData.licenseImageURL = null;
            profileData.licenseVerified = false;
          }
        }
      } else {
        // Dev mode: just add license info to profile data locally, skipping image upload
        if (role === "Operator") {
          profileData.licenseNumber = licenseNumber || "";
          profileData.licenseImageURL = null;
          profileData.licenseVerified = false;
        }
        console.log("[DEV MODE] Skipping Storage for license image");
      }

      // Save profile to Firestore regardless of DEV_MODE so the user exists in DB
      await createUserProfile(uid, profileData);

      // 4. Set session in AuthContext (persists to AsyncStorage)
      await setSession(
        { uid, phoneNumber: phone },
        { id: uid, ...profileData }
      );

      // 5. Navigate to appropriate dashboard
      if (role === "Operator") {
        navigation.reset({
          index: 0,
          routes: [{ name: "OperatorDashboard", params: { userName } }],
        });
      } else {
        navigation.reset({
          index: 0,
          routes: [{ name: "FarmerBooking", params: { userName } }],
        });
      }
    } catch (error) {
      console.log("OTP Verification Error:", error);
      Alert.alert("Verification Failed", error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Verify Details</Text>
      <Text style={styles.subtitle}>OTP sent to +91 {phone}</Text>
      <Text style={styles.devHint}>Dev mode? Use code: 123456</Text>

      <TextInput
        style={styles.input}
        placeholder="Enter 6-digit OTP"
        keyboardType="number-pad"
        maxLength={6}
        value={otp}
        onChangeText={setOtp}
      />

      <TouchableOpacity
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={handleVerify}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Verify & Proceed</Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    justifyContent: "center",
    padding: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#2E7D32",
    marginBottom: 8,
  },
  subtitle: { fontSize: 16, color: "#666", marginBottom: 4 },
  devHint: {
    fontSize: 12,
    color: "#999",
    marginBottom: 32,
    fontStyle: "italic",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    height: 56,
    textAlign: "center",
    fontSize: 24,
    marginBottom: 24,
    letterSpacing: 8,
  },
  button: {
    backgroundColor: "#2E7D32",
    height: 56,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  buttonDisabled: {
    backgroundColor: "#A5D6A7",
  },
  buttonText: { color: "#fff", fontSize: 18, fontWeight: "bold" },
});

export default OTPScreen;

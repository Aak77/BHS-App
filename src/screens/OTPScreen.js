import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const OTPScreen = ({ route, navigation }) => {
  const { phone } = route.params; // Grabs the phone number from the previous screen
  const [otp, setOtp] = useState("");

  const handleVerify = () => {
    // In a real app, you'd verify the OTP here.
    // For now, let's just go to the Dashboard (we will create this next).
    navigation.navigate("Dashboard");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Verify Details</Text>
      <Text style={styles.subtitle}>OTP sent to +91 {phone}</Text>

      <TextInput
        style={styles.input}
        placeholder="Enter 4-digit OTP"
        keyboardType="number-pad"
        maxLength={4}
        value={otp}
        onChangeText={setOtp}
      />

      <TouchableOpacity style={styles.button} onPress={handleVerify}>
        <Text style={styles.buttonText}>Verify & Proceed</Text>
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
  subtitle: { fontSize: 16, color: "#666", marginBottom: 32 },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    height: 56,
    textAlign: "center",
    fontSize: 24,
    marginBottom: 24,
  },
  button: {
    backgroundColor: "#2E7D32",
    height: 56,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  buttonText: { color: "#fff", fontSize: 18, fontWeight: "bold" },
});

export default OTPScreen;

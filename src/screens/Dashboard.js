import { FontAwesome5, MaterialCommunityIcons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const Dashboard = ({ navigation }) => {
  const [name, setName] = useState("");
  const [selectedRole, setSelectedRole] = useState(null); // 'Farmer' or 'Operator'

  const handleContinue = () => {
    if (!name.trim()) {
      alert("Please enter your name");
      return;
    }
    if (!selectedRole) {
      alert("Please select a role");
      return;
    }

    // Pass the name as a parameter when navigating!
    if (selectedRole === "Farmer") {
      navigation.navigate("FarmerBooking", { userName: name });
    } else {
      navigation.navigate("OperatorLogin", { userName: name });
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
      >
        {/* Dark Green Header */}
        <View style={styles.header}>
          <Text style={styles.welcomeText}>Welcome to</Text>
          <Text style={styles.appName}>Bharat Seeder</Text>
          <Text style={styles.subText}>Tell us about yourself</Text>
        </View>

        {/* White Form Container */}
        <View style={styles.formContainer}>
          <Text style={styles.label}>Your Name</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. Gurpreet Singh"
            placeholderTextColor="#999"
            value={name}
            onChangeText={setName}
          />

          <Text style={styles.label}>Select Your Role</Text>

          {/* Farmer Selection Card */}
          <TouchableOpacity
            style={[
              styles.roleCard,
              selectedRole === "Farmer" && styles.selectedCard,
            ]}
            onPress={() => setSelectedRole("Farmer")}
            activeOpacity={0.8}
          >
            <View style={styles.iconContainer}>
              <FontAwesome5 name="tractor" size={24} color="#29563A" />
            </View>
            <View style={styles.roleTextContainer}>
              <Text style={styles.roleTitle}>Farmer</Text>
              <Text style={styles.roleDesc}>
                Book machinery for your fields
              </Text>
            </View>
            {selectedRole === "Farmer" && (
              <MaterialCommunityIcons
                name="check-circle"
                size={24}
                color="#29563A"
              />
            )}
          </TouchableOpacity>

          {/* Operator Selection Card */}
          <TouchableOpacity
            style={[
              styles.roleCard,
              selectedRole === "Operator" && styles.selectedCard,
            ]}
            onPress={() => setSelectedRole("Operator")}
            activeOpacity={0.8}
          >
            <View style={styles.iconContainer}>
              <MaterialCommunityIcons
                name="cog-transfer"
                size={28}
                color="#D68C45"
              />
            </View>
            <View style={styles.roleTextContainer}>
              <Text style={styles.roleTitle}>Operator</Text>
              <Text style={styles.roleDesc}>Offer your machine services</Text>
            </View>
            {selectedRole === "Operator" && (
              <MaterialCommunityIcons
                name="check-circle"
                size={24}
                color="#29563A"
              />
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.continueButton,
              (!name.trim() || !selectedRole) && styles.disabledButton,
            ]}
            onPress={handleContinue}
            disabled={!name.trim() || !selectedRole}
          >
            <Text style={styles.continueText}>Continue →</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#29563A" }, // Deep Forest Green
  container: { flex: 1 },
  header: { padding: 30, paddingTop: 40, paddingBottom: 40 },
  welcomeText: { color: "#A3C4A8", fontSize: 16, marginBottom: 4 },
  appName: {
    color: "#FFFFFF",
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 4,
  },
  subText: { color: "#E8F5E9", fontSize: 16 },
  formContainer: {
    flex: 1,
    backgroundColor: "#F2F6F0", // Earthy off-white/sage
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 24,
    paddingTop: 30,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 10,
    marginTop: 10,
  },
  input: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    marginBottom: 20,
    color: "#333",
  },
  roleCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderWidth: 1.5,
    borderColor: "#E0E0E0",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  selectedCard: {
    borderColor: "#29563A",
    backgroundColor: "#EBF3EC",
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#F5F5F5",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  roleTextContainer: { flex: 1 },
  roleTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  roleDesc: { fontSize: 14, color: "#666" },
  continueButton: {
    backgroundColor: "#29563A",
    padding: 18,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 20,
  },
  disabledButton: { backgroundColor: "#A3C4A8" },
  continueText: { color: "#FFFFFF", fontSize: 18, fontWeight: "bold" },
});

export default Dashboard;

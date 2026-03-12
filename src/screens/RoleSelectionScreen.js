import { FontAwesome5, MaterialCommunityIcons } from "@expo/vector-icons";
import { useState } from "react";
import {
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const RoleSelectionScreen = ({ navigation }) => {
  const [selectedRole, setSelectedRole] = useState(null);

  const handleContinue = () => {
    if (selectedRole === "Farmer") {
      navigation.navigate("Login");
    } else if (selectedRole === "Operator") {
      navigation.navigate("OperatorLogin");
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.welcomeText}>Welcome to</Text>
        <Text style={styles.appName}>Bharat Seeder</Text>
        <Text style={styles.subText}>How would you like to use the app?</Text>
      </View>

      {/* Role Cards */}
      <View style={styles.cardContainer}>
        {/* Farmer Card */}
        <TouchableOpacity
          style={[
            styles.roleCard,
            selectedRole === "Farmer" && styles.selectedCard,
          ]}
          onPress={() => setSelectedRole("Farmer")}
          activeOpacity={0.8}
        >
          <View
            style={[
              styles.iconCircle,
              selectedRole === "Farmer" && styles.iconCircleSelected,
            ]}
          >
            <FontAwesome5
              name="tractor"
              size={28}
              color={selectedRole === "Farmer" ? "#FFFFFF" : "#29563A"}
            />
          </View>
          <Text style={styles.roleTitle}>Farmer</Text>
          <Text style={styles.roleDesc}>
            Book machinery for your fields
          </Text>
          {selectedRole === "Farmer" && (
            <MaterialCommunityIcons
              name="check-circle"
              size={24}
              color="#29563A"
              style={styles.checkIcon}
            />
          )}
        </TouchableOpacity>

        {/* Operator Card */}
        <TouchableOpacity
          style={[
            styles.roleCard,
            selectedRole === "Operator" && styles.selectedCard,
          ]}
          onPress={() => setSelectedRole("Operator")}
          activeOpacity={0.8}
        >
          <View
            style={[
              styles.iconCircle,
              selectedRole === "Operator" && styles.iconCircleSelected,
            ]}
          >
            <MaterialCommunityIcons
              name="cog-transfer"
              size={32}
              color={selectedRole === "Operator" ? "#FFFFFF" : "#D68C45"}
            />
          </View>
          <Text style={styles.roleTitle}>Operator</Text>
          <Text style={styles.roleDesc}>
            Offer your machine services
          </Text>
          {selectedRole === "Operator" && (
            <MaterialCommunityIcons
              name="check-circle"
              size={24}
              color="#29563A"
              style={styles.checkIcon}
            />
          )}
        </TouchableOpacity>

        {/* Continue Button */}
        <TouchableOpacity
          style={[
            styles.continueButton,
            !selectedRole && styles.disabledButton,
          ]}
          onPress={handleContinue}
          disabled={!selectedRole}
          activeOpacity={0.8}
        >
          <Text style={styles.continueText}>Continue →</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#29563A",
  },
  header: {
    padding: 30,
    paddingTop: 50,
    paddingBottom: 40,
  },
  welcomeText: {
    color: "#A3C4A8",
    fontSize: 16,
    marginBottom: 4,
  },
  appName: {
    color: "#FFFFFF",
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 4,
  },
  subText: {
    color: "#E8F5E9",
    fontSize: 16,
  },
  cardContainer: {
    flex: 1,
    backgroundColor: "#F2F6F0",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 24,
    paddingTop: 32,
  },
  roleCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 24,
    marginBottom: 16,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#E0E0E0",
    position: "relative",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  selectedCard: {
    borderColor: "#29563A",
    backgroundColor: "#EBF3EC",
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "#F5F5F5",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 14,
  },
  iconCircleSelected: {
    backgroundColor: "#29563A",
  },
  roleTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 6,
  },
  roleDesc: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
  },
  checkIcon: {
    position: "absolute",
    top: 16,
    right: 16,
  },
  continueButton: {
    backgroundColor: "#29563A",
    padding: 18,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 16,
  },
  disabledButton: {
    backgroundColor: "#A3C4A8",
  },
  continueText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
  },
});

export default RoleSelectionScreen;

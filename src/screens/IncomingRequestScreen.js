import {
  FontAwesome5,
  Ionicons,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const IncomingRequestScreen = ({ navigation }) => {
  const [timeLeft, setTimeLeft] = useState(60);

  // Countdown Timer Logic
  useEffect(() => {
    if (timeLeft === 0) {
      navigation.goBack(); // Auto-reject if time runs out
      return;
    }
    const timerId = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    return () => clearInterval(timerId);
  }, [timeLeft, navigation]);

  const handleAccept = () => {
    navigation.navigate("JobInProgress");
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Pulsing Timer Circle */}
        <View style={styles.timerContainer}>
          <Text style={styles.timerText}>{timeLeft}s</Text>
        </View>
        <Text style={styles.urgentText}>New Job Request!</Text>

        {/* Job Details Card */}
        <View style={styles.card}>
          <View style={styles.farmerInfo}>
            <View style={styles.avatar}>
              <Ionicons name="person" size={24} color="#29563A" />
            </View>
            <View>
              <Text style={styles.farmerName}>Rajesh Kumar</Text>
              <Text style={styles.distance}>7.5 km away</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.jobSpecs}>
            <View style={styles.specItem}>
              <FontAwesome5 name="tractor" size={18} color="#666" />
              <Text style={styles.specText}>Happy Seeder</Text>
            </View>
            <View style={styles.specItem}>
              <MaterialCommunityIcons name="texture" size={18} color="#666" />
              <Text style={styles.specText}>5 Acres</Text>
            </View>
          </View>

          <View style={styles.earningsBox}>
            <Text style={styles.earningsLabel}>Estimated Earnings</Text>
            <Text style={styles.earningsAmount}>₹2,200</Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={[styles.actionBtn, styles.declineBtn]}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.declineText}>Decline</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionBtn, styles.acceptBtn]}
            onPress={handleAccept}
          >
            <Text style={styles.acceptText}>ACCEPT JOB</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#1E392A" }, // Very dark green for high contrast
  content: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
    alignItems: "center",
  },

  timerContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#D68C45",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 4,
    borderColor: "#FFF",
    marginBottom: 20,
  },
  timerText: { fontSize: 28, fontWeight: "bold", color: "#FFF" },
  urgentText: {
    fontSize: 22,
    color: "#A3C4A8",
    fontWeight: "bold",
    marginBottom: 40,
  },

  card: {
    backgroundColor: "#FFF",
    width: "100%",
    borderRadius: 24,
    padding: 24,
    elevation: 10,
  },
  farmerInfo: { flexDirection: "row", alignItems: "center" },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#E8F5E9",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  farmerName: { fontSize: 20, fontWeight: "bold", color: "#333" },
  distance: { fontSize: 14, color: "#777", marginTop: 2 },

  divider: { height: 1, backgroundColor: "#EEE", marginVertical: 20 },

  jobSpecs: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 20,
  },
  specItem: { alignItems: "center" },
  specText: { fontSize: 15, fontWeight: "600", color: "#444", marginTop: 8 },

  earningsBox: {
    backgroundColor: "#F2F6F0",
    padding: 16,
    borderRadius: 16,
    alignItems: "center",
  },
  earningsLabel: { color: "#666", fontSize: 14, marginBottom: 4 },
  earningsAmount: { color: "#29563A", fontSize: 28, fontWeight: "bold" },

  buttonRow: {
    flexDirection: "row",
    width: "100%",
    justifyContent: "space-between",
    marginTop: 30,
  },
  actionBtn: {
    flex: 0.48,
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: "center",
  },
  declineBtn: {
    backgroundColor: "transparent",
    borderWidth: 2,
    borderColor: "#A3C4A8",
  },
  declineText: { color: "#A3C4A8", fontSize: 16, fontWeight: "bold" },
  acceptBtn: { backgroundColor: "#D68C45" },
  acceptText: { color: "#FFF", fontSize: 16, fontWeight: "bold" },
});

export default IncomingRequestScreen;

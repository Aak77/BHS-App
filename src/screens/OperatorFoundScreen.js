import {
  FontAwesome5,
  Ionicons,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import React, { useState } from "react";
import {
  ActivityIndicator,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const OperatorFoundScreen = ({ navigation }) => {
  const [isBooking, setIsBooking] = useState(false);

  const handleBookOperator = () => {
    setIsBooking(true);

    // Simulate a 2-second network request to send the booking
    setTimeout(() => {
      setIsBooking(false);
      // This will navigate to the live tracking map we build next!
      navigation.navigate("JobTracking");
    }, 2000);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Header Text */}
        <Text style={styles.headerText}>1 operator found nearby</Text>

        {/* Operator Profile Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            {/* Operator Avatar */}
            <View style={styles.avatarContainer}>
              <FontAwesome5 name="user-tie" size={30} color="#D68C45" />
            </View>

            <View style={styles.operatorInfo}>
              <Text style={styles.operatorName}>Harjinder Kaur</Text>

              <View style={styles.ratingRow}>
                <Ionicons name="star" size={14} color="#D68C45" />
                <Text style={styles.ratingText}> 4.9 </Text>
                <Text style={styles.jobsText}>(120 jobs)</Text>
              </View>
            </View>

            {/* Available Status Pill */}
            <View style={styles.statusPill}>
              <Text style={styles.statusText}>Available</Text>
            </View>
          </View>

          {/* Machine Type */}
          <Text style={styles.machineTypeText}>Mulcher</Text>

          {/* Operator Details Row */}
          <View style={styles.detailsRow}>
            <View style={styles.detailItem}>
              <Ionicons name="location-outline" size={16} color="#666" />
              <Text style={styles.detailText}>7.5 km away</Text>
            </View>

            <View style={styles.detailItem}>
              <MaterialCommunityIcons
                name="clock-outline"
                size={16}
                color="#666"
              />
              <Text style={styles.detailText}>ETA 25 min</Text>
            </View>

            <View style={styles.detailItem}>
              <Ionicons name="call-outline" size={16} color="#666" />
              <Text style={styles.detailText}>9876502222</Text>
            </View>
          </View>

          {/* Booking Action Button */}
          <TouchableOpacity
            style={[styles.bookBtn, isBooking && styles.bookingActiveBtn]}
            onPress={handleBookOperator}
            disabled={isBooking}
          >
            {isBooking ? (
              <View style={styles.loadingRow}>
                <ActivityIndicator size="small" color="#29563A" />
                <Text style={styles.bookingText}> Sending Request...</Text>
              </View>
            ) : (
              <Text style={styles.bookBtnText}>Book This Operator</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#87A890" }, // Darker sage background to make the card pop
  container: { flex: 1, padding: 20, justifyContent: "center" },
  headerText: {
    fontSize: 16,
    color: "#FFFFFF",
    marginBottom: 15,
    fontWeight: "600",
    marginLeft: 5,
  },

  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 20,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  avatarContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#F5F5F5",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#D68C45",
  },
  operatorInfo: { flex: 1, marginLeft: 15 },
  operatorName: { fontSize: 18, fontWeight: "bold", color: "#333" },
  ratingRow: { flexDirection: "row", alignItems: "center", marginTop: 4 },
  ratingText: { fontSize: 14, fontWeight: "bold", color: "#333" },
  jobsText: { fontSize: 14, color: "#777" },

  statusPill: {
    backgroundColor: "#E8F5E9",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusText: { color: "#29563A", fontWeight: "bold", fontSize: 12 },

  machineTypeText: {
    textAlign: "right",
    color: "#666",
    fontSize: 14,
    marginTop: -15,
    marginBottom: 15,
    fontWeight: "500",
  },

  detailsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: "#F0F0F0",
    paddingVertical: 15,
    marginBottom: 20,
  },
  detailItem: { flexDirection: "row", alignItems: "center" },
  detailText: { marginLeft: 6, fontSize: 13, color: "#555", fontWeight: "500" },

  bookBtn: {
    backgroundColor: "#29563A",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  bookingActiveBtn: {
    backgroundColor: "#E8F5E9",
    borderWidth: 1,
    borderColor: "#29563A",
  },
  bookBtnText: { color: "#FFFFFF", fontSize: 16, fontWeight: "bold" },
  loadingRow: { flexDirection: "row", alignItems: "center" },
  bookingText: {
    color: "#29563A",
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 8,
  },
});

export default OperatorFoundScreen;

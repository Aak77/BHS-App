import {
  Feather,
  FontAwesome5,
  Ionicons,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import { useState } from "react";
import {
  Modal,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";

const MACHINE_TYPES = [
  "Happy Seeder",
  "Zero-Till Drill",
  "Rotavator",
  "Raised Bed Planter",
  "Broadcast Seeder",
  "Rice Transplanter",
  "Other",
];

const FarmerBookingScreen = ({ navigation, route }) => {
  const userName = route.params?.userName || "Guest";
  const [selectedMachine, setSelectedMachine] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleBookNow = () => {
    if (!selectedMachine) {
      alert("Please select a machine type first");
      return;
    }
    navigation.navigate("BookingConfig", { machineType: selectedMachine });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Header Section */}
        <View style={styles.header}>
          <View>
            <Text style={styles.userName}>{userName}</Text>
            <Text style={styles.userPhone}>+91 9876543210</Text>
          </View>
          <TouchableOpacity style={styles.profileIcon}>
            <Feather name="log-out" size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {/* Statistics Row */}
        <View style={styles.statsContainer}>
          <View style={styles.statBox}>
            <MaterialCommunityIcons name="sprout" size={24} color="#29563A" />
            <Text style={styles.statNumber}>3</Text>
            <Text style={styles.statLabel}>Bookings</Text>
          </View>

          <View style={styles.statBox}>
            <MaterialCommunityIcons name="texture" size={24} color="#29563A" />
            <Text style={styles.statNumber}>24</Text>
            <Text style={styles.statLabel}>Acres Done</Text>
          </View>
        </View>

        {/* Active Operator Tracking */}
        <View style={styles.trackingCard}>
          <View style={styles.trackingLeft}>
            <FontAwesome5 name="tractor" size={20} color="#D68C45" />
            <View style={styles.trackingText}>
              <Text style={styles.trackingTitle}>Operator on the way!</Text>
              <Text style={styles.trackingSub}>Baldev Kumar • 35 min</Text>
            </View>
          </View>
          <TouchableOpacity onPress={() => navigation.navigate("JobTracking")}>
            <Text style={styles.trackButton}>Track →</Text>
          </TouchableOpacity>
        </View>

        {/* Main Booking Card with Machine Dropdown */}
        <View style={styles.bookCard}>
          <View style={styles.bookHeader}>
            <View>
              <Text style={styles.bookTitle}>Book a Machine</Text>
              <Text style={styles.bookSub}>
                Select your machine type below
              </Text>
            </View>
            <MaterialCommunityIcons name="barley" size={40} color="#A3C4A8" />
          </View>

          {/* Machine Type Dropdown */}
          <Text style={styles.dropdownLabel}>Machine Type</Text>
          <TouchableOpacity
            style={styles.dropdownSelector}
            onPress={() => setDropdownOpen(true)}
            activeOpacity={0.8}
          >
            <MaterialCommunityIcons
              name="engine-outline"
              size={20}
              color={selectedMachine ? "#29563A" : "#999"}
              style={{ marginRight: 10 }}
            />
            <Text
              style={[
                styles.dropdownSelectorText,
                !selectedMachine && styles.dropdownPlaceholder,
              ]}
            >
              {selectedMachine || "Select type"}
            </Text>
            <MaterialCommunityIcons
              name={dropdownOpen ? "chevron-up" : "chevron-down"}
              size={22}
              color="#666"
            />
          </TouchableOpacity>

          {/* Dropdown Modal */}
          <Modal
            visible={dropdownOpen}
            transparent
            animationType="fade"
            onRequestClose={() => setDropdownOpen(false)}
          >
            <TouchableWithoutFeedback onPress={() => setDropdownOpen(false)}>
              <View style={styles.modalOverlay}>
                <TouchableWithoutFeedback>
                  <View style={styles.dropdownModal}>
                    <Text style={styles.dropdownModalTitle}>Select Machine Type</Text>
                    <View style={styles.dropdownDivider} />
                    <ScrollView
                      bounces={false}
                      showsVerticalScrollIndicator={false}
                    >
                      {MACHINE_TYPES.map((machine, index) => {
                        const isSelected = selectedMachine === machine;
                        const isLast = index === MACHINE_TYPES.length - 1;
                        return (
                          <TouchableOpacity
                            key={machine}
                            style={[
                              styles.dropdownItem,
                              isSelected && styles.dropdownItemSelected,
                              !isLast && styles.dropdownItemBorder,
                            ]}
                            onPress={() => {
                              setSelectedMachine(machine);
                              setDropdownOpen(false);
                            }}
                            activeOpacity={0.7}
                          >
                            <Text
                              style={[
                                styles.dropdownItemText,
                                isSelected && styles.dropdownItemTextSelected,
                              ]}
                            >
                              {machine}
                            </Text>
                            {isSelected && (
                              <MaterialCommunityIcons
                                name="check-circle"
                                size={20}
                                color="#FFFFFF"
                              />
                            )}
                          </TouchableOpacity>
                        );
                      })}
                    </ScrollView>
                  </View>
                </TouchableWithoutFeedback>
              </View>
            </TouchableWithoutFeedback>
          </Modal>

          <TouchableOpacity
            style={[
              styles.bookActionBtn,
              !selectedMachine && styles.bookActionBtnDisabled,
            ]}
            onPress={handleBookNow}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.bookActionText,
                !selectedMachine && styles.bookActionTextDisabled,
              ]}
            >
              Book Now
            </Text>
          </TouchableOpacity>
        </View>


      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#F2F6F0" },
  container: { flex: 1, paddingHorizontal: 20 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 20,
    marginBottom: 20,
  },
  userName: { fontSize: 24, fontWeight: "bold", color: "#29563A" },
  userPhone: { fontSize: 14, color: "#666", marginTop: 2 },
  profileIcon: { backgroundColor: "#29563A", padding: 10, borderRadius: 20 },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  statBox: {
    backgroundColor: "#FFFFFF",
    flex: 1,
    padding: 15,
    borderRadius: 16,
    alignItems: "center",
    marginHorizontal: 4,
    elevation: 2,
  },
  statNumber: { fontSize: 18, fontWeight: "bold", color: "#333", marginTop: 8 },
  statLabel: { fontSize: 12, color: "#777", marginTop: 2 },
  trackingCard: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    padding: 16,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  trackingLeft: { flexDirection: "row", alignItems: "center" },
  trackingText: { marginLeft: 12 },
  trackingTitle: { fontSize: 16, fontWeight: "bold", color: "#333" },
  trackingSub: { fontSize: 13, color: "#666", marginTop: 2 },
  trackButton: { color: "#29563A", fontWeight: "bold", fontSize: 14 },
  bookCard: {
    backgroundColor: "#29563A",
    padding: 20,
    borderRadius: 20,
    marginBottom: 24,
  },
  bookHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  bookTitle: { color: "#FFFFFF", fontSize: 22, fontWeight: "bold" },
  bookSub: { color: "#A3C4A8", fontSize: 14, marginTop: 4 },

  // Dropdown styles
  dropdownLabel: {
    color: "#E8F5E9",
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
  },
  dropdownSelector: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 14,
    marginBottom: 16,
  },
  dropdownSelectorText: {
    flex: 1,
    fontSize: 16,
    color: "#333",
    fontWeight: "500",
  },
  dropdownPlaceholder: {
    color: "#999",
    fontWeight: "400",
  },

  // Dropdown Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 30,
  },
  dropdownModal: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    width: "100%",
    maxHeight: 420,
    overflow: "hidden",
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
  },
  dropdownModalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 14,
  },
  dropdownDivider: {
    height: 1,
    backgroundColor: "#E8E8E8",
  },
  dropdownItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 15,
    paddingHorizontal: 20,
  },
  dropdownItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  dropdownItemSelected: {
    backgroundColor: "#29563A",
  },
  dropdownItemText: {
    fontSize: 16,
    color: "#333",
  },
  dropdownItemTextSelected: {
    color: "#FFFFFF",
    fontWeight: "600",
  },

  bookActionBtn: {
    backgroundColor: "#FFFFFF",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  bookActionBtnDisabled: {
    backgroundColor: "rgba(255,255,255,0.4)",
  },
  bookActionText: { color: "#29563A", fontSize: 16, fontWeight: "bold" },
  bookActionTextDisabled: { color: "rgba(41,86,58,0.5)" },

  sectionCard: {
    backgroundColor: "#FFFFFF",
    padding: 20,
    borderRadius: 20,
    marginBottom: 20,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 15,
  },
  priceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
    marginBottom: 10,
  },
  machineInfo: { flexDirection: "row", alignItems: "center" },
  machineName: {
    marginLeft: 10,
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  machinePrice: { fontSize: 16, fontWeight: "bold", color: "#333" },
});

export default FarmerBookingScreen;

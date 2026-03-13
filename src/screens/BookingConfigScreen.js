import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useAuth } from "../context/AuthContext";
import { createBooking } from "../services/firestore";

const MACHINES = [
  {
    id: "happy_seeder",
    name: "Happy Seeder",
    desc: "Direct sowing",
    price: 2000,
    icon: "seed",
    color: "#29563A",
  },
  {
    id: "zero_till_drill",
    name: "Zero-Till Drill",
    desc: "No-till seeding",
    price: 1800,
    icon: "arrow-down-bold-outline",
    color: "#1565C0",
  },
  {
    id: "rotavator",
    name: "Rotavator",
    desc: "Soil tilling & mixing",
    price: 1600,
    icon: "rotate-3d-variant",
    color: "#6A1B9A",
  },
  {
    id: "raised_bed_planter",
    name: "Raised Bed Planter",
    desc: "Raised bed cultivation",
    price: 2200,
    icon: "sprout",
    color: "#2E7D32",
  },
  {
    id: "broadcast_seeder",
    name: "Broadcast Seeder",
    desc: "Wide-area spreading",
    price: 1400,
    icon: "scatter-plot-outline",
    color: "#E65100",
  },
  {
    id: "rice_transplanter",
    name: "Rice Transplanter",
    desc: "Paddy transplanting",
    price: 2800,
    icon: "rice",
    color: "#00838F",
  },
  {
    id: "other",
    name: "Other",
    desc: "Custom requirement",
    price: 1500,
    icon: "dots-horizontal-circle-outline",
    color: "#D68C45",
  },
];

const BookingConfigScreen = ({ navigation, route }) => {
  const { user } = useAuth();
  const machineType = route.params?.machineType;
  const farmerId = route.params?.farmerId || user?.uid;
  const farmerName = route.params?.farmerName || "";
  const farmerPhone = route.params?.farmerPhone || "";
  const defaultMachine =
    MACHINES.find((m) => m.name === machineType) || MACHINES[0];

  const [selectedMachine, setSelectedMachine] = useState(defaultMachine);
  const [acres, setAcres] = useState(3);
  const [saving, setSaving] = useState(false);

  const incrementAcres = () => {
    if (acres < 50) setAcres(acres + 1);
  };
  const decrementAcres = () => {
    if (acres > 1) setAcres(acres - 1);
  };
  const totalPrice = selectedMachine.price * acres;

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
        >
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Fill in your requirements</Text>
        <View style={{ width: 24 }}></View>
      </View>

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionTitle}>Selected Machine</Text>
        <View style={styles.cardContainer}>
          <View style={[styles.machineCard, styles.machineCardSelected]}>
            <View
              style={[
                styles.machineIconBg,
                { backgroundColor: selectedMachine.color + "18" },
              ]}
            >
              <MaterialCommunityIcons
                name={selectedMachine.icon}
                size={20}
                color={selectedMachine.color}
              />
            </View>
            <View style={styles.machineInfo}>
              <Text style={styles.machineName}>{selectedMachine.name}</Text>
              <Text style={styles.machineDesc}>{selectedMachine.desc}</Text>
            </View>
            <View style={styles.priceContainer}>
              <Text style={styles.machinePrice}>₹{selectedMachine.price}</Text>
              <Text style={styles.perAcre}>per acre</Text>
            </View>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Number of Acres</Text>
        <View style={[styles.cardContainer, styles.acresCard]}>
          <TouchableOpacity onPress={decrementAcres} style={styles.circleBtn}>
            <Ionicons name="remove" size={24} color="#29563A" />
          </TouchableOpacity>
          <View style={styles.acresDisplay}>
            <Text style={styles.acresNumber}>{acres}</Text>
            <Text style={styles.acresText}>acres</Text>
          </View>
          <TouchableOpacity onPress={incrementAcres} style={styles.circleBtn}>
            <Ionicons name="add" size={24} color="#29563A" />
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionTitle}>Field Location</Text>
        <View style={styles.cardContainer}>
          <View style={styles.locationRow}>
            <Ionicons name="location-sharp" size={24} color="#C2185B" />
            <View style={styles.locationInfo}>
              <Text style={styles.locationName}>Near Panvel, Maharashtra</Text>
              <Text style={styles.locationDesc}>GPS detected location</Text>
            </View>
            <TouchableOpacity style={styles.changeBtn}>
              <Text style={styles.changeBtnText}>Change</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={{ height: 140 }}></View>
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.estimateRow}>
          <View>
            <Text style={styles.estimateLabel}>Estimated Price</Text>
            <Text style={styles.estimateCalc}>
              {selectedMachine.name} • ₹{selectedMachine.price} x {acres}{" "}
              {acres === 1 ? "acre" : "acres"}
            </Text>
          </View>
          <Text style={styles.totalPrice}>₹{totalPrice}</Text>
        </View>

        <TouchableOpacity
          style={[styles.findBtn, saving && { opacity: 0.7 }]}
          onPress={async () => {
            setSaving(true);
            try {
              // 1. Get real GPS location
              const { getCurrentLocation } = require("../services/location");
              const locationData = await getCurrentLocation();
              
              if (!locationData) {
                 Alert.alert("Location Required", "Please enable GPS to find operators near you.");
                 setSaving(false);
                 return;
              }

              const farmerLocation = {
                latitude: locationData.coords.latitude,
                longitude: locationData.coords.longitude,
              };

              // 2. Update user location in DB
              const { updateUserLocation } = require("../services/firestore");
              await updateUserLocation(farmerId, farmerLocation);

              // 3. Create booking
              const bookingId = await createBooking({
                farmerId,
                farmerName,
                farmerPhone,
                machineType: selectedMachine.name,
                machineId: selectedMachine.id, // For easy Haversine matching
                acres,
                pricePerAcre: selectedMachine.price,
                totalPrice: selectedMachine.price * acres,
                location: "Detected via GPS",
                coordinates: farmerLocation,
              });
              
              navigation.navigate("SearchingOperator", {
                 bookingId,
                 machineId: selectedMachine.id,
                 farmerLocation,
              });
            } catch (error) {
              console.log("Error creating booking:", error);
              Alert.alert("Error", "Failed to create booking. Please try again.");
            } finally {
              setSaving(false);
            }
          }}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.findBtnText}>Find Operators Nearby →</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#F2F6F0" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 15,
    paddingBottom: 10,
  },
  backBtn: { padding: 8, marginLeft: -8 },
  headerTitle: { fontSize: 18, fontWeight: "bold", color: "#333" },
  container: { flex: 1, paddingHorizontal: 20 },

  sectionTitle: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#333",
    marginTop: 15,
    marginBottom: 8,
  },
  cardContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 8,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },

  machineCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "transparent",
    borderBottomColor: "#F0F0F0",
    marginBottom: 4,
  },

  machineCardSelected: {
    backgroundColor: "#E8F5E9",
    borderColor: "#29563A",
    borderBottomColor: "#29563A",
  },
  machineIconBg: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#F5F5F5",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  machineInfo: { flex: 1 },
  machineName: { fontSize: 15, fontWeight: "bold", color: "#333" },
  machineDesc: { fontSize: 11, color: "#777", marginTop: 2 },
  priceContainer: { alignItems: "flex-end" },
  machinePrice: { fontSize: 15, fontWeight: "bold", color: "#29563A" },
  perAcre: { fontSize: 11, color: "#777" },

  acresCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 12,
  },
  circleBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#E8F5E9",
    justifyContent: "center",
    alignItems: "center",
  },
  acresDisplay: { alignItems: "center" },
  acresNumber: { fontSize: 24, fontWeight: "bold", color: "#333" },
  acresText: { fontSize: 13, color: "#777" },

  locationRow: { flexDirection: "row", alignItems: "center", padding: 8 },
  locationInfo: { flex: 1, marginLeft: 10 },
  locationName: { fontSize: 15, fontWeight: "bold", color: "#333" },
  locationDesc: { fontSize: 11, color: "#777", marginTop: 2 },
  changeBtn: {
    backgroundColor: "#F5F5F5",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  changeBtnText: { color: "#29563A", fontWeight: "bold", fontSize: 12 },

  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#FFFFFF",
    padding: 20,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  estimateRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginBottom: 15,
  },
  estimateLabel: { fontSize: 13, color: "#777", marginBottom: 2 },
  estimateCalc: { fontSize: 12, color: "#333", fontWeight: "500" },
  totalPrice: { fontSize: 26, fontWeight: "bold", color: "#29563A" },
  findBtn: {
    backgroundColor: "#29563A",
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: "center",
  },
  findBtnText: { color: "#FFFFFF", fontSize: 16, fontWeight: "bold" },
});

export default BookingConfigScreen;

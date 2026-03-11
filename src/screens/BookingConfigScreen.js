import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

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
    id: "mulcher",
    name: "Mulcher",
    desc: "Stubble management",
    price: 1500,
    icon: "leaf",
    color: "#D68C45",
  },
  {
    id: "baler",
    name: "Baler",
    desc: "Crop residue baling",
    price: 2500,
    icon: "grass",
    color: "#C2185B",
  },
];

const BookingConfigScreen = ({ navigation }) => {
  const [selectedMachine, setSelectedMachine] = useState(MACHINES[1]);
  const [acres, setAcres] = useState(3);

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
        <Text style={styles.sectionTitle}>Select Machine Type</Text>
        <View style={styles.cardContainer}>
          {MACHINES.map((machine) => (
            <TouchableOpacity
              key={machine.id}
              style={[
                styles.machineCard,
                selectedMachine.id === machine.id && styles.machineCardSelected,
              ]}
              onPress={() => setSelectedMachine(machine)}
            >
              <View style={styles.machineIconBg}>
                <MaterialCommunityIcons
                  name={machine.icon}
                  size={20}
                  color={machine.color}
                />
              </View>
              <View style={styles.machineInfo}>
                <Text style={styles.machineName}>{machine.name}</Text>
                <Text style={styles.machineDesc}>{machine.desc}</Text>
              </View>
              <View style={styles.priceContainer}>
                <Text style={styles.machinePrice}>₹{machine.price}</Text>
                <Text style={styles.perAcre}>per acre</Text>
              </View>
            </TouchableOpacity>
          ))}
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
          style={styles.findBtn}
          onPress={() => navigation.navigate("SearchingOperator")}
        >
          <Text style={styles.findBtnText}>Find Operators Nearby →</Text>
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

  // Adjusted for compactness
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
  },

  machineCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10, // Slightly increased padding for a better look
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "transparent", // Invisible border prevents the card from "jumping" when selected
    borderBottomColor: "#F0F0F0", // Keeps the clean divider line
    marginBottom: 4, // Gives the bottom border room to breathe so it doesn't get clipped
  },

  machineCardSelected: {
    backgroundColor: "#E8F5E9",
    borderColor: "#29563A",
    borderBottomColor: "#29563A", // <-- This is the magic line that fixes the bottom border!
  },
  machineIconBg: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#F5F5F5",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
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

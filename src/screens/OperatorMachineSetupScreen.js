import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
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
import { getUserProfile, updateOperatorMachines } from "../services/firestore";

// The same machines as in BookingConfig
const MACHINES = [
  { id: "happy_seeder", name: "Happy Seeder", icon: "seed", color: "#29563A" },
  { id: "zero_till_drill", name: "Zero-Till Drill", icon: "arrow-down-bold-outline", color: "#1565C0" },
  { id: "rotavator", name: "Rotavator", icon: "rotate-3d-variant", color: "#6A1B9A" },
  { id: "raised_bed_planter", name: "Raised Bed Planter", icon: "sprout", color: "#2E7D32" },
  { id: "broadcast_seeder", name: "Broadcast Seeder", icon: "scatter-plot-outline", color: "#E65100" },
  { id: "rice_transplanter", name: "Rice Transplanter", icon: "rice", color: "#00838F" },
  { id: "other", name: "Other", icon: "dots-horizontal-circle-outline", color: "#D68C45" },
];

const OperatorMachineSetupScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [selectedMachines, setSelectedMachines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      if (user?.uid) {
        const profile = await getUserProfile(user.uid);
        if (profile?.machines) {
          setSelectedMachines(profile.machines);
        }
      }
      setLoading(false);
    };
    fetchProfile();
  }, [user]);

  const toggleMachine = (machineId) => {
    if (selectedMachines.includes(machineId)) {
      setSelectedMachines(selectedMachines.filter((id) => id !== machineId));
    } else {
      setSelectedMachines([...selectedMachines, machineId]);
    }
  };

  const handleSave = async () => {
    if (selectedMachines.length === 0) {
      Alert.alert("Error", "Please select at least one machine type you operate.");
      return;
    }

    setSaving(true);
    try {
      await updateOperatorMachines(user.uid, selectedMachines);
      Alert.alert("Success", "Your machine list has been updated!");
      navigation.goBack();
    } catch (error) {
      console.log("Error updating machines:", error);
      Alert.alert("Error", "Failed to update machines.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#D68C45" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
        >
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Machines</Text>
        <View style={{ width: 24 }}></View>
      </View>

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <Text style={styles.instruction}>
          Select the types of machines you currently operate. You will only receive booking requests for these machines.
        </Text>

        <View style={styles.grid}>
          {MACHINES.map((machine) => {
            const isSelected = selectedMachines.includes(machine.id);
            return (
              <TouchableOpacity
                key={machine.id}
                style={[
                  styles.machineCard,
                  isSelected && { borderColor: machine.color, backgroundColor: machine.color + "10" }
                ]}
                onPress={() => toggleMachine(machine.id)}
                activeOpacity={0.7}
              >
                <View style={[styles.iconContainer, { backgroundColor: isSelected ? machine.color : "#F0F0F0" }]}>
                  <MaterialCommunityIcons
                    name={machine.icon}
                    size={28}
                    color={isSelected ? "#FFF" : "#666"}
                  />
                </View>
                <Text style={[styles.machineName, isSelected && { color: machine.color, fontWeight: "bold" }]}>
                  {machine.name}
                </Text>

                {isSelected && (
                  <View style={[styles.checkBadge, { backgroundColor: machine.color }]}>
                     <MaterialCommunityIcons name="check" size={12} color="#FFF" />
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={{ height: 100 }}></View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.saveBtn, saving && { opacity: 0.7 }]}
          onPress={handleSave}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.saveBtnText}>Save Machine Profile</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#FFF" },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 15,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0"
  },
  backBtn: { padding: 8, marginLeft: -8 },
  headerTitle: { fontSize: 18, fontWeight: "bold", color: "#333" },
  container: { flex: 1, paddingHorizontal: 20 },
  instruction: {
    fontSize: 14,
    color: "#666",
    marginTop: 20,
    marginBottom: 20,
    lineHeight: 20,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  machineCard: {
    width: "48%",
    backgroundColor: "#FFF",
    borderWidth: 2,
    borderColor: "#E0E0E0",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    alignItems: "center",
    position: "relative",
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  machineName: {
    fontSize: 14,
    color: "#555",
    textAlign: "center",
  },
  checkBadge: {
    position: "absolute",
    top: 10,
    right: 10,
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
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
  saveBtn: {
    backgroundColor: "#D68C45",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  saveBtnText: { color: "#FFFFFF", fontSize: 16, fontWeight: "bold" },
});

export default OperatorMachineSetupScreen;

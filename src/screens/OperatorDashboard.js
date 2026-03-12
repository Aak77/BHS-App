import { FontAwesome5, MaterialCommunityIcons } from "@expo/vector-icons";
import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
  Animated,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import * as Location from "expo-location";

const BACKEND_URL = "https://97d9-114-143-61-242.ngrok-free.app/api";

const OperatorDashboard = ({ navigation, route }) => {
  const token = route.params?.token;
  const userName = route.params?.userName || "Operator";

  const [isOnline, setIsOnline] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [hasTractor, setHasTractor] = useState(route.params?.hasTractor ?? false);

  // CHC assignment state — null = not assigned, object = assigned
  const [assignedChc, setAssignedChc] = useState(null);
  const [chcLoading, setChcLoading] = useState(true);   // loading profile on mount
  const [locationLoading, setLocationLoading] = useState(false);

  // Animations
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const dotAnim = useRef(new Animated.Value(0)).current;
  const tractorAnim = useRef(new Animated.Value(route.params?.hasTractor ? 1 : 0)).current;

  useEffect(() => {
    Animated.spring(tractorAnim, {
      toValue: hasTractor ? 1 : 0,
      useNativeDriver: false,
      friction: 6,
      tension: 80,
    }).start();
  }, [hasTractor]);

  // On mount: fetch operator profile to check CHC assignment
  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setChcLoading(true);
    try {
      const response = await fetch(`${BACKEND_URL}/operator/profile`, {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (data.assignedChcId && data.assignedChc) {
        setAssignedChc(data.assignedChc);
      } else {
        setAssignedChc(null);
      }
    } catch (err) {
      setAssignedChc(null);
    } finally {
      setChcLoading(false);
    }
  };

  // Share location → backend haversine assigns nearest CHC → fixed
  const handleShareLocation = async () => {
    setLocationLoading(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission Denied", "Location permission is required to assign you to a CHC.");
        setLocationLoading(false);
        return;
      }

      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
      const { latitude, longitude } = loc.coords;

      const response = await fetch(`${BACKEND_URL}/operator/location`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ latitude, longitude }),
      });

      const data = await response.json();

      if (data.assignedChcId) {
        // Re-fetch profile to get full CHC details
        await fetchProfile();
        Alert.alert("CHC Assigned!", "You have been assigned to your nearest CHC. You can now go online and accept jobs.");
      } else {
        Alert.alert("No CHC Found", "No CHC found near your location. Please contact support.");
      }
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "Could not get your location. Please try again.");
    } finally {
      setLocationLoading(false);
    }
  };

  const handleOnlineToggle = () => {
    const goingOnline = !isOnline;
    setIsOnline(goingOnline);
    if (goingOnline) {
      setIsSearching(true);
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.15, duration: 500, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
        ])
      );
      const dots = Animated.loop(
        Animated.timing(dotAnim, { toValue: 3, duration: 900, useNativeDriver: false })
      );
      pulse.start();
      dots.start();
      setTimeout(() => {
        pulse.stop();
        dots.stop();
        pulseAnim.setValue(1);
        dotAnim.setValue(0);
        setIsSearching(false);
      }, 1500);
    }
  };

  const cardBg = tractorAnim.interpolate({ inputRange: [0, 1], outputRange: ["#FFF5F5", "#F0FAF1"] });
  const cardBorder = tractorAnim.interpolate({ inputRange: [0, 1], outputRange: ["#FFCDD2", "#C8E6C9"] });
  const noColor = tractorAnim.interpolate({ inputRange: [0, 1], outputRange: ["#E53935", "#AAA"] });
  const yesColor = tractorAnim.interpolate({ inputRange: [0, 1], outputRange: ["#AAA", "#29563A"] });

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return "Good Morning,";
    if (hour >= 12 && hour < 17) return "Good Afternoon,";
    return "Good Evening,";
  };

  // ── NOT ASSIGNED TO CHC: block all activity ──────────────────────────────────
  if (chcLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContent}>
          <MaterialCommunityIcons name="loading" size={48} color="#29563A" />
          <Text style={styles.loadingText}>Loading profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!assignedChc) {
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.gateContent}>
          {/* Header */}
          <View style={styles.gateHeader}>
            <View style={styles.gateIconCircle}>
              <MaterialCommunityIcons name="map-marker-alert-outline" size={48} color="#D68C45" />
            </View>
            <Text style={styles.gateTitle}>No CHC Assigned</Text>
            <Text style={styles.gateSubtitle}>
              You need to be assigned to a Custom Hiring Centre (CHC) before you can go online and accept jobs.
            </Text>
          </View>

          {/* Info box */}
          <View style={styles.infoBox}>
            <MaterialCommunityIcons name="information-outline" size={20} color="#29563A" style={{ marginRight: 10, marginTop: 2 }} />
            <Text style={styles.infoText}>
              Share your current location and we'll automatically assign you to the nearest CHC. This assignment is permanent.
            </Text>
          </View>

          {/* Share Location Button */}
          <TouchableOpacity
            style={[styles.locationBtn, locationLoading && styles.locationBtnDisabled]}
            onPress={handleShareLocation}
            disabled={locationLoading}
            activeOpacity={0.85}
          >
            <MaterialCommunityIcons
              name={locationLoading ? "loading" : "map-marker-radius"}
              size={22}
              color="#FFF"
              style={{ marginRight: 10 }}
            />
            <Text style={styles.locationBtnText}>
              {locationLoading ? "Finding nearest CHC..." : "Share Location & Get Assigned"}
            </Text>
          </TouchableOpacity>

          {/* How it works */}
          <View style={styles.stepsCard}>
            <Text style={styles.stepsTitle}>How it works</Text>
            {[
              { icon: "crosshairs-gps", text: "We detect your current GPS location" },
              { icon: "map-search-outline", text: "We find the nearest CHC using distance calculation" },
              { icon: "store-check-outline", text: "You're permanently assigned to that CHC" },
              { icon: "check-circle-outline", text: "You can now go online and accept jobs" },
            ].map((step, i) => (
              <View key={i} style={styles.stepRow}>
                <View style={styles.stepNum}>
                  <Text style={styles.stepNumText}>{i + 1}</Text>
                </View>
                <MaterialCommunityIcons name={step.icon} size={20} color="#29563A" style={{ marginRight: 10 }} />
                <Text style={styles.stepText}>{step.text}</Text>
              </View>
            ))}
          </View>

          {/* Logout */}
          <TouchableOpacity
            style={styles.logoutBtnGate}
            onPress={() => navigation.navigate("RoleSelection")}
          >
            <MaterialCommunityIcons name="logout" size={18} color="#E53935" style={{ marginRight: 6 }} />
            <Text style={styles.logoutTextGate}>Logout</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // ── ASSIGNED: full dashboard ──────────────────────────────────────────────────
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {/* Profile Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>{getGreeting()}</Text>
            <Text style={styles.opName}>{userName}</Text>
            {/* CHC badge */}
            <View style={styles.chcBadge}>
              <MaterialCommunityIcons name="store-outline" size={13} color="#29563A" style={{ marginRight: 4 }} />
              <Text style={styles.chcBadgeText}>{assignedChc.name}</Text>
            </View>
            <TouchableOpacity
              style={styles.logoutButton}
              onPress={() => navigation.navigate("RoleSelection")}
            >
              <MaterialCommunityIcons name="logout" size={16} color="#E53935" />
              <Text style={styles.logoutText}>Logout</Text>
            </TouchableOpacity>
          </View>
          {/* Online Toggle */}
          <View style={styles.onlineRow}>
            <Text style={[styles.statusText, { color: isOnline ? "#29563A" : "#999" }]}>
              {isOnline ? "● ONLINE" : "○ OFFLINE"}
            </Text>
            <Switch
              trackColor={{ false: "#767577", true: "#A3C4A8" }}
              thumbColor={isOnline ? "#29563A" : "#f4f3f4"}
              onValueChange={handleOnlineToggle}
              value={isOnline}
              style={{ marginLeft: 8 }}
            />
          </View>
        </View>

        {/* Earnings Card */}
        <TouchableOpacity
          style={styles.earningsCard}
          activeOpacity={0.9}
          onPress={() => navigation.navigate("EarningsSummary")}
        >
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
            <Text style={styles.cardLabel}>Today's Earnings</Text>
            <MaterialCommunityIcons name="arrow-right-circle" size={20} color="#A3C4A8" />
          </View>
          <Text style={styles.amountText}>₹4,500</Text>
          <View style={styles.statsRow}>
            <View style={styles.miniStat}>
              <FontAwesome5 name="tractor" size={14} color="#A3C4A8" />
              <Text style={styles.miniStatText}>2 Jobs</Text>
            </View>
            <View style={styles.miniStat}>
              <MaterialCommunityIcons name="texture" size={16} color="#A3C4A8" />
              <Text style={styles.miniStatText}>12 Acres</Text>
            </View>
          </View>
        </TouchableOpacity>

        {/* Tractor Toggle */}
        <Animated.View style={[styles.tractorCard, { backgroundColor: cardBg, borderColor: cardBorder }]}>
          <View style={styles.tractorCardLeft}>
            <FontAwesome5 name="tractor" size={20} color={hasTractor ? "#29563A" : "#E53935"} style={{ marginRight: 12 }} />
            <Text style={styles.tractorLabel}>Own Tractor?</Text>
          </View>
          <View style={styles.tractorToggleRow}>
            <Animated.Text style={[styles.tractorToggleText, { color: noColor }]}>No</Animated.Text>
            <Switch
              trackColor={{ false: "#FFCDD2", true: "#A5D6A7" }}
              thumbColor={hasTractor ? "#29563A" : "#E53935"}
              onValueChange={setHasTractor}
              value={hasTractor}
              style={{ marginHorizontal: 8 }}
            />
            <Animated.Text style={[styles.tractorToggleText, { color: yesColor }]}>Yes</Animated.Text>
          </View>
        </Animated.View>

        {/* Notifications / Requests */}
        <Text style={styles.sectionTitle}>Recent Notifications</Text>

        {isSearching ? (
          <View style={styles.searchingState}>
            <Animated.View style={[styles.searchingCircle, { transform: [{ scale: pulseAnim }] }]}>
              <MaterialCommunityIcons name="magnify" size={36} color="#29563A" />
            </Animated.View>
            <Text style={styles.searchingText}>Searching for requests...</Text>
            <View style={styles.dotsRow}>
              {[0, 1, 2].map((i) => (
                <Animated.View
                  key={i}
                  style={[styles.dot, {
                    opacity: dotAnim.interpolate({ inputRange: [i, i + 0.5, i + 1], outputRange: [0.3, 1, 0.3], extrapolate: "clamp" }),
                    transform: [{ scale: dotAnim.interpolate({ inputRange: [i, i + 0.5, i + 1], outputRange: [0.8, 1.4, 0.8], extrapolate: "clamp" }) }],
                  }]}
                />
              ))}
            </View>
          </View>
        ) : !isOnline ? (
          <View style={styles.emptyState}>
            <MaterialCommunityIcons name="bell-off-outline" size={48} color="#CCC" />
            <Text style={styles.emptyText}>Go online to receive new seeding requests</Text>
          </View>
        ) : (
          <TouchableOpacity style={styles.alertCard} onPress={() => navigation.navigate("IncomingRequest")}>
            <View style={styles.alertHeader}>
              <View style={styles.newBadge}><Text style={styles.newText}>NEW REQUEST</Text></View>
              <Text style={styles.timeText}>Just now</Text>
            </View>
            <Text style={styles.farmerName}>Rajesh Kumar</Text>
            <Text style={styles.jobDetail}>Happy Seeder • 5 Acres • Panvel</Text>
            <View style={styles.alertFooter}>
              <Text style={styles.priceEstimate}>Est. Earnings: ₹2,200</Text>
              <Text style={styles.viewTask}>Tap to View →</Text>
            </View>
          </TouchableOpacity>
        )}

        {/* Support */}
        <TouchableOpacity style={styles.supportBtn} onPress={() => navigation.navigate("Support")}>
          <MaterialCommunityIcons name="lifebuoy" size={20} color="#29563A" style={{ marginRight: 8 }} />
          <Text style={styles.supportBtnText}>Contact Support</Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F2F6F0" },

  // Loading
  centerContent: { flex: 1, justifyContent: "center", alignItems: "center" },
  loadingText: { marginTop: 16, fontSize: 16, color: "#666" },

  // Gate screen (not assigned)
  gateContent: { padding: 24, paddingTop: 40, paddingBottom: 60 },
  gateHeader: { alignItems: "center", marginBottom: 28 },
  gateIconCircle: {
    width: 96, height: 96, borderRadius: 48,
    backgroundColor: "#FFF3E0",
    justifyContent: "center", alignItems: "center",
    marginBottom: 20,
  },
  gateTitle: { fontSize: 24, fontWeight: "bold", color: "#333", marginBottom: 10 },
  gateSubtitle: { fontSize: 15, color: "#666", textAlign: "center", lineHeight: 22 },
  infoBox: {
    flexDirection: "row", backgroundColor: "#E8F5E9",
    borderRadius: 12, padding: 16, marginBottom: 24,
    borderWidth: 1, borderColor: "#C8E6C9",
  },
  infoText: { flex: 1, fontSize: 14, color: "#333", lineHeight: 20 },
  locationBtn: {
    flexDirection: "row", backgroundColor: "#29563A",
    borderRadius: 14, padding: 18,
    justifyContent: "center", alignItems: "center",
    marginBottom: 28, elevation: 3,
  },
  locationBtnDisabled: { backgroundColor: "#A3C4A8" },
  locationBtnText: { color: "#FFF", fontSize: 17, fontWeight: "bold" },
  stepsCard: {
    backgroundColor: "#FFF", borderRadius: 16,
    padding: 20, marginBottom: 28,
    borderWidth: 1, borderColor: "#E0E0E0",
  },
  stepsTitle: { fontSize: 16, fontWeight: "bold", color: "#333", marginBottom: 16 },
  stepRow: { flexDirection: "row", alignItems: "center", marginBottom: 14 },
  stepNum: {
    width: 24, height: 24, borderRadius: 12,
    backgroundColor: "#29563A", justifyContent: "center", alignItems: "center",
    marginRight: 10,
  },
  stepNumText: { color: "#FFF", fontSize: 12, fontWeight: "bold" },
  stepText: { flex: 1, fontSize: 14, color: "#555" },
  logoutBtnGate: {
    flexDirection: "row", justifyContent: "center", alignItems: "center",
    padding: 14, borderRadius: 12,
    backgroundColor: "#FFEBEE",
  },
  logoutTextGate: { color: "#E53935", fontWeight: "bold", fontSize: 16 },

  // Dashboard
  scrollContent: { padding: 20, paddingTop: 28 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 25 },
  onlineRow: { flexDirection: "row", alignItems: "center" },
  statusText: { fontSize: 13, fontWeight: "bold", letterSpacing: 0.5 },
  greeting: { fontSize: 15, color: "#666", marginBottom: 2 },
  opName: { fontSize: 24, fontWeight: "bold", color: "#29563A" },
  chcBadge: {
    flexDirection: "row", alignItems: "center",
    marginTop: 4, marginBottom: 4,
    backgroundColor: "#E8F5E9", paddingHorizontal: 8, paddingVertical: 3,
    borderRadius: 8, alignSelf: "flex-start",
  },
  chcBadgeText: { fontSize: 12, color: "#29563A", fontWeight: "600" },
  logoutButton: {
    flexDirection: "row", alignItems: "center", marginTop: 4,
    paddingVertical: 4, paddingHorizontal: 8,
    borderRadius: 8, backgroundColor: "#FFEBEE", alignSelf: "flex-start",
  },
  logoutText: { color: "#E53935", fontSize: 12, fontWeight: "bold", marginLeft: 4 },
  earningsCard: { backgroundColor: "#29563A", padding: 25, borderRadius: 24, elevation: 4 },
  cardLabel: { color: "#A3C4A8", fontSize: 14, fontWeight: "600" },
  amountText: { color: "#FFF", fontSize: 36, fontWeight: "bold", marginVertical: 10 },
  statsRow: { flexDirection: "row", marginTop: 5 },
  miniStat: { flexDirection: "row", alignItems: "center", marginRight: 20 },
  miniStatText: { color: "#FFF", marginLeft: 6, fontSize: 14 },
  tractorCard: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    borderRadius: 16, padding: 18, marginTop: 16, elevation: 2, borderWidth: 1.5,
  },
  tractorCardLeft: { flexDirection: "row", alignItems: "center" },
  tractorLabel: { fontSize: 16, fontWeight: "600", color: "#333" },
  tractorToggleRow: { flexDirection: "row", alignItems: "center" },
  tractorToggleText: { fontSize: 15, fontWeight: "bold" },
  sectionTitle: { fontSize: 18, fontWeight: "bold", color: "#333", marginTop: 30, marginBottom: 15 },
  emptyState: { alignItems: "center", marginTop: 40 },
  emptyText: { color: "#999", textAlign: "center", marginTop: 10, paddingHorizontal: 40 },
  searchingState: { alignItems: "center", marginTop: 40, paddingVertical: 20 },
  searchingCircle: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: "#E8F5E9", justifyContent: "center", alignItems: "center",
    marginBottom: 16, elevation: 2,
  },
  searchingText: { fontSize: 15, color: "#29563A", fontWeight: "600", marginBottom: 16 },
  dotsRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  dot: { width: 10, height: 10, borderRadius: 5, backgroundColor: "#29563A" },
  alertCard: {
    backgroundColor: "#FFF", padding: 20, borderRadius: 20, elevation: 2,
    borderLeftWidth: 5, borderLeftColor: "#D68C45",
  },
  alertHeader: { flexDirection: "row", justifyContent: "space-between", marginBottom: 10 },
  newBadge: { backgroundColor: "#FFF3E0", paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  newText: { color: "#D68C45", fontSize: 10, fontWeight: "bold" },
  timeText: { fontSize: 12, color: "#AAA" },
  farmerName: { fontSize: 18, fontWeight: "bold", color: "#333" },
  jobDetail: { fontSize: 14, color: "#666", marginTop: 4 },
  alertFooter: {
    flexDirection: "row", justifyContent: "space-between",
    marginTop: 15, borderTopWidth: 1, borderTopColor: "#EEE", paddingTop: 15,
  },
  priceEstimate: { fontWeight: "bold", color: "#29563A" },
  viewTask: { color: "#D68C45", fontWeight: "bold" },
  supportBtn: {
    marginTop: 40, flexDirection: "row", justifyContent: "center", alignItems: "center",
    padding: 16, backgroundColor: "#E8F5E9", borderRadius: 16,
    borderWidth: 1, borderColor: "#A3C4A8",
  },
  supportBtnText: { color: "#29563A", fontWeight: "bold", fontSize: 16 },
});

export default OperatorDashboard;
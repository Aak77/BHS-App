import { FontAwesome5, MaterialCommunityIcons } from "@expo/vector-icons";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useAuth } from "../context/AuthContext";
import { getTodayEarnings } from "../services/firestore";
import { connectSocket, disconnectSocket, socket } from "../services/socket";
import { startWatchingLocation, stopWatchingLocation } from "../services/location";

const OperatorDashboard = ({ navigation, route }) => {
  const { user, userProfile, signOut } = useAuth();
  const [isOnline, setIsOnline] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [hasTractor, setHasTractor] = useState(
    route.params?.hasTractor ?? false
  );

  // Pulse animation for searching state
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const dotAnim = useRef(new Animated.Value(0)).current;

  // Animation value: 0 = No (red), 1 = Yes (green)
  const tractorAnim = useRef(
    new Animated.Value(route.params?.hasTractor ? 1 : 0)
  ).current;

  useEffect(() => {
    Animated.spring(tractorAnim, {
      toValue: hasTractor ? 1 : 0,
      useNativeDriver: false,
      friction: 6,
      tension: 80,
    }).start();
  }, [hasTractor]);

  // Store location subscription so we can cancel it later
  const [locationSub, setLocationSub] = useState(null);

  // Clean up socket and location tracking on unmount
  useEffect(() => {
    return () => {
      if (locationSub) stopWatchingLocation(locationSub);
      disconnectSocket();
    };
  }, [locationSub]);

  // Handle online toggle: connect socket, get location, start broadcasting
  const handleOnlineToggle = async () => {
    const goingOnline = !isOnline;
    setIsOnline(goingOnline);

    if (goingOnline) {
      setIsSearching(true);
      
      // 1. Connect to backend socket
      connectSocket();
      socket.emit("operator:online", { uid: user.uid, name: userName });

      // 2. Start tracking GPS location
      const sub = await startWatchingLocation(async (location) => {
        // Broadcast location to server every time it changes
        socket.emit("operator:location_update", {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          heading: location.coords.heading || 0,
          speed: location.coords.speed || 0,
        });
        
        // Ensure Database always has latest operator location for Farmer discovery 
        if (user?.uid) {
           const { updateUserLocation } = require("../services/firestore");
           await updateUserLocation(user.uid, {
             latitude: location.coords.latitude,
             longitude: location.coords.longitude
           });
        }
      });
      setLocationSub(sub);

      // Looping pulse while searching setup
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
      
      // Keep searching anim for 1.5s then show default online state
      setTimeout(() => {
        pulse.stop();
        dots.stop();
        pulseAnim.setValue(1);
        dotAnim.setValue(0);
        setIsSearching(false);
      }, 1500);

    } else {
      // Going Offline
      setIsSearching(false);
      if (locationSub) {
        stopWatchingLocation(locationSub);
        setLocationSub(null);
      }
      disconnectSocket();
    }
  };

  // Real-time booking observer
  useEffect(() => {
    let unsubscribeReq;
    if (isOnline && user?.uid) {
      const { observeIncomingBookings } = require("../services/firestore");
      unsubscribeReq = observeIncomingBookings(user.uid, (bookings) => {
        if (bookings && bookings.length > 0) {
          // Send operator to the Accept/Reject screen
          navigation.navigate("IncomingRequest", { booking: bookings[0] });
        }
      });
    }

    return () => {
      if (unsubscribeReq) unsubscribeReq();
    };
  }, [isOnline, user?.uid, navigation]);

  const cardBg = tractorAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["#FFF5F5", "#F0FAF1"],
  });
  const cardBorder = tractorAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["#FFCDD2", "#C8E6C9"],
  });
  const noColor = tractorAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["#E53935", "#AAA"],
  });
  const yesColor = tractorAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["#AAA", "#29563A"],
  });
  const iconColor = tractorAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["#E53935", "#29563A"],
  });

  // Grab the passed name
  const userName = route.params?.userName || userProfile?.name || "Operator";

  // Earnings from Firestore
  const [earnings, setEarnings] = useState({ totalEarnings: 0, totalJobs: 0, totalAcres: 0 });

  useEffect(() => {
    const loadEarnings = async () => {
      if (user?.uid) {
        const data = await getTodayEarnings(user.uid);
        setEarnings(data);
      }
    };
    loadEarnings();
  }, [user]);

  // Time-based greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return "Good Morning,";
    if (hour >= 12 && hour < 17) return "Good Afternoon,";
    return "Good Evening,";
  };

  const handleLogout = async () => {
    await signOut();
    navigation.reset({
      index: 0,
      routes: [{ name: "Splash" }],
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Header */}
        <View style={styles.header}>
          {/* Left: Greeting + Name */}
          <View>
            <Text style={styles.greeting}>{getGreeting()}</Text>
            <Text style={styles.opName}>{userName}</Text>
            <TouchableOpacity 
              style={styles.logoutButton} 
              onPress={handleLogout}
            >
              <MaterialCommunityIcons name="logout" size={16} color="#E53935" />
              <Text style={styles.logoutText}>Logout</Text>
            </TouchableOpacity>
          </View>
          {/* Right: Online Toggle */}
          <View style={styles.onlineRow}>
            <Text style={[
              styles.statusText,
              { color: isOnline ? "#29563A" : "#999" },
            ]}>
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

        {/* Earnings Card - Now Clickable! */}
        <TouchableOpacity
          style={styles.earningsCard}
          activeOpacity={0.9}
          onPress={() => navigation.navigate("EarningsSummary")}
        >
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Text style={styles.cardLabel}>Today&apos;s Earnings</Text>
            <MaterialCommunityIcons
              name="arrow-right-circle"
              size={20}
              color="#A3C4A8"
            />
          </View>
          <Text style={styles.amountText}>₹{earnings.totalEarnings.toLocaleString()}</Text>
          <View style={styles.statsRow}>
            <View style={styles.miniStat}>
              <FontAwesome5 name="tractor" size={14} color="#A3C4A8" />
              <Text style={styles.miniStatText}>{earnings.totalJobs} Jobs</Text>
            </View>
            <View style={styles.miniStat}>
              <MaterialCommunityIcons
                name="texture"
                size={16}
                color="#A3C4A8"
              />
              <Text style={styles.miniStatText}>{earnings.totalAcres} Acres</Text>
            </View>
          </View>
        </TouchableOpacity>

        {/* Machine Setup Card */}
        <TouchableOpacity
          style={[styles.tractorCard, { backgroundColor: "#FFF5F5", borderColor: "#FFCDD2" }]}
          activeOpacity={0.8}
          onPress={() => navigation.navigate("OperatorMachineSetup")}
        >
          <View style={styles.tractorCardLeft}>
            <View style={{ marginRight: 12 }}>
              <MaterialCommunityIcons
                name="cogs"
                size={22}
                color="#D68C45"
              />
            </View>
            <View>
              <Text style={styles.tractorLabel}>My Machines</Text>
              <Text style={{ fontSize: 13, color: "#666", marginTop: 2 }}>
                Configure machines you operate
              </Text>
            </View>
          </View>
          <MaterialCommunityIcons name="chevron-right" size={24} color="#999" />
        </TouchableOpacity>

        {/* Alerts Section */}
        <Text style={styles.sectionTitle}>Recent Notifications</Text>

        {isSearching ? (
          /* Searching animation */
          <View style={styles.searchingState}>
            <Animated.View style={[styles.searchingCircle, { transform: [{ scale: pulseAnim }] }]}>
              <MaterialCommunityIcons name="magnify" size={36} color="#29563A" />
            </Animated.View>
            <Text style={styles.searchingText}>Searching for requests...</Text>
            <View style={styles.dotsRow}>
              {[0, 1, 2].map((i) => (
                <Animated.View
                  key={i}
                  style={[
                    styles.dot,
                    {
                      opacity: dotAnim.interpolate({
                        inputRange: [i, i + 0.5, i + 1],
                        outputRange: [0.3, 1, 0.3],
                        extrapolate: "clamp",
                      }),
                      transform: [{
                        scale: dotAnim.interpolate({
                          inputRange: [i, i + 0.5, i + 1],
                          outputRange: [0.8, 1.4, 0.8],
                          extrapolate: "clamp",
                        }),
                      }],
                    },
                  ]}
                />
              ))}
            </View>
          </View>
        ) : !isOnline ? (
          <View style={styles.emptyState}>
            <MaterialCommunityIcons
              name="bell-off-outline"
              size={48}
              color="#CCC"
            />
            <Text style={styles.emptyText}>
              Go online to receive new seeding requests
            </Text>
          </View>
        ) : (
          <View style={styles.emptyState}>
            <MaterialCommunityIcons
              name="radar"
              size={48}
              color="#29563A"
            />
            <Text style={[styles.emptyText, { color: "#29563A", fontWeight: "bold" }]}>
              You are Online!
            </Text>
            <Text style={styles.emptyText}>
              Waiting for nearby seeding jobs...
            </Text>
          </View>
        )}

        {/* Contact Support Button */}
        <TouchableOpacity
          style={styles.supportBtn}
          onPress={() => navigation.navigate("Support")}
        >
          <MaterialCommunityIcons
            name="lifebuoy"
            size={20}
            color="#29563A"
            style={{ marginRight: 8 }}
          />
          <Text style={styles.supportBtnText}>Contact Support</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F2F6F0" },
  scrollContent: { padding: 20, paddingTop: 28 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 25,
  },
  onlineRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  statusText: {
    fontSize: 13,
    fontWeight: "bold",
    letterSpacing: 0.5,
  },
  greeting: { fontSize: 15, color: "#666", marginBottom: 2 },
  opName: { fontSize: 24, fontWeight: "bold", color: "#29563A" },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 6,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
    backgroundColor: "#FFEBEE",
    alignSelf: "flex-start",
  },
  logoutText: {
    color: "#E53935",
    fontSize: 12,
    fontWeight: "bold",
    marginLeft: 4,
  },
  earningsCard: {
    backgroundColor: "#29563A",
    padding: 25,
    borderRadius: 24,
    elevation: 4,
  },
  cardLabel: { color: "#A3C4A8", fontSize: 14, fontWeight: "600" },
  amountText: {
    color: "#FFF",
    fontSize: 36,
    fontWeight: "bold",
    marginVertical: 10,
  },
  statsRow: { flexDirection: "row", marginTop: 5 },
  miniStat: { flexDirection: "row", alignItems: "center", marginRight: 20 },
  miniStatText: { color: "#FFF", marginLeft: 6, fontSize: 14 },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginTop: 30,
    marginBottom: 15,
  },
  emptyState: { alignItems: "center", marginTop: 40 },
  emptyText: {
    color: "#999",
    textAlign: "center",
    marginTop: 10,
    paddingHorizontal: 40,
  },
  searchingState: {
    alignItems: "center",
    marginTop: 40,
    paddingVertical: 20,
  },
  searchingCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#E8F5E9",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
    elevation: 2,
  },
  searchingText: {
    fontSize: 15,
    color: "#29563A",
    fontWeight: "600",
    marginBottom: 16,
  },
  dotsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#29563A",
  },
  alertCard: {
    backgroundColor: "#FFF",
    padding: 20,
    borderRadius: 20,
    elevation: 2,
    borderLeftWidth: 5,
    borderLeftColor: "#D68C45",
  },
  alertHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  newBadge: {
    backgroundColor: "#FFF3E0",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  newText: { color: "#D68C45", fontSize: 10, fontWeight: "bold" },
  timeText: { fontSize: 12, color: "#AAA" },
  farmerName: { fontSize: 18, fontWeight: "bold", color: "#333" },
  jobDetail: { fontSize: 14, color: "#666", marginTop: 4 },
  alertFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 15,
    borderTopWidth: 1,
    borderTopColor: "#EEE",
    paddingTop: 15,
  },
  priceEstimate: { fontWeight: "bold", color: "#29563A" },
  viewTask: { color: "#D68C45", fontWeight: "bold" },
  supportBtn: {
    marginTop: 40,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#E8F5E9",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#A3C4A8",
  },
  supportBtnText: { color: "#29563A", fontWeight: "bold", fontSize: 16 },
  tractorCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderRadius: 16,
    padding: 18,
    marginTop: 16,
    elevation: 2,
    borderWidth: 1.5,
  },
  tractorCardLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  tractorLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  tractorToggleRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  tractorToggleText: {
    fontSize: 15,
    fontWeight: "bold",
  },
  tractorActive: {
    color: "#29563A",
    fontWeight: "bold",
  },
});

export default OperatorDashboard;

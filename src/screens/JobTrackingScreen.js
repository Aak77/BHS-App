import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as Location from "expo-location";
import React, { useEffect, useState, useRef } from "react";
import {
  Alert,
  ActivityIndicator,
  Dimensions,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Platform,
  Animated,
  PanResponder,
} from "react-native";

import { calculateDistance, estimateETA } from "../services/location";
import { connectSocket, disconnectSocket, socket } from "../services/socket";

// react-native-maps causes fatal errors on Web. We must conditionally import it.
let MapView, Marker;
if (Platform.OS !== "web") {
  const Maps = require("react-native-maps");
  MapView = Maps.default;
  Marker = Maps.Marker;
}

const { width, height } = Dimensions.get("window");

const JobTrackingScreen = ({ navigation, route }) => {
  const { bookingId, operatorName } = route.params || {};
  
  const [farmerLocation, setFarmerLocation] = useState(null);
  const [operatorLocation, setOperatorLocation] = useState(null);
  const [isOperatorOffline, setIsOperatorOffline] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // Calculate ETA and Distance when locations are available
  const [distance, setDistance] = useState(null);
  const [eta, setEta] = useState(null);
  const [currentStatus, setCurrentStatus] = useState("heading_to_farm");
  const [booking, setBooking] = useState(null);
  const [operatorProfile, setOperatorProfile] = useState(null);

  const steps = [
    { label: "Heading to field", status: "heading_to_farm" },
    { label: "Arrived at location", status: "reached_farm" },
    { label: "Work started", status: "started_work" },
    { label: "Work in progress", status: "in_progress" },
    { label: "Job completed", status: "finishing" },
  ];

  const getCurrentStepIndex = (status) => {
    const idx = steps.findIndex(s => s.status === status);
    if (idx === -1 && status === "completed") return steps.length;
    return idx === -1 ? 0 : idx;
  };

  const currentStep = getCurrentStepIndex(currentStatus);

  useEffect(() => {
    let mounted = true;
    let unsubscribeBooking = null;

    const setupTracking = async () => {
      try {
        // 1. Get farmer's current location to center map
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          alert("Permission to access location was denied");
          setLoading(false);
          return;
        }

        let location;
        try {
          location = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Balanced,
          });
        } catch (e) {
          console.warn("Could not get current position, trying last known:", e);
          location = await Location.getLastKnownPositionAsync({});
        }

        if (location && mounted) {
          setFarmerLocation({
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
          });
        } else {
          console.warn("Both current and last known locations are unavailable.");
          // We still proceed so the farmer can at least see the operator on the map
        }

        // 2. Observe booking for real-time data & operator details
        const { observeBooking, getUserProfile } = require("../services/firestore");
        unsubscribeBooking = observeBooking(bookingId, async (bookingData) => {
          if (mounted) {
            setBooking(bookingData);
            setCurrentStatus(bookingData.status);
            
            // If we don't have operator profile yet, fetch it
            if (bookingData.operatorId && !operatorProfile) {
              const profile = await getUserProfile(bookingData.operatorId);
              if (mounted) setOperatorProfile(profile);
            }
            setLoading(false);
          }
        });

        // 3. Connect to Socket Server and join this booking's room
        connectSocket();
        socket.emit("farmer:track_job", { bookingId });

        // 4. Listen for Operator location broadcasts
        socket.on("location_broadcast", (data) => {
          if (mounted) {
            setOperatorLocation({
              latitude: data.latitude,
              longitude: data.longitude,
            });
            setIsOperatorOffline(false);
            
            // Re-calculate distance/ETA
            if (farmerLocation) {
              const dist = calculateDistance(
                farmerLocation.latitude,
                farmerLocation.longitude,
                data.latitude,
                data.longitude
              );
              setDistance(dist.toFixed(1));
              setEta(estimateETA(dist));
            }
          }
        });

   // Listen for the granular status updates we added
        socket.on("job_status_update", (data) => {
          if (mounted) {
            setCurrentStatus(data.status);
          }
        });

        // Listen for final completion
        socket.on("job_completed", () => {
          if (mounted) {
            setCurrentStatus("completed");
          }
        });

      } catch (error) {
        console.error("Error setting up tracking:", error);
        if (mounted) setLoading(false);
      }
    };

    setupTracking();

    return () => {
      mounted = false;
      if (unsubscribeBooking) unsubscribeBooking();
      socket.off("location_broadcast");
      socket.off("operator_offline");
      socket.off("job_status_update");
      socket.off("job_completed");
      disconnectSocket();
    };
  }, [bookingId, farmerLocation?.latitude, farmerLocation?.longitude, operatorProfile]);

  // PanResponder for Farmer to confirm job is done
  const SLIDER_WIDTH = width - 80;
  const THUMB_SIZE = 50;
  const SLIDE_DISTANCE = SLIDER_WIDTH - THUMB_SIZE;
  const pan = useRef(new Animated.ValueXY()).current;

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dx > 0 && gestureState.dx < SLIDE_DISTANCE) {
          pan.setValue({ x: gestureState.dx, y: 0 });
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dx >= SLIDE_DISTANCE * 0.8) {
          Animated.timing(pan, {
            toValue: { x: SLIDE_DISTANCE, y: 0 },
            duration: 150,
            useNativeDriver: false,
          }).start(() => {
            alert("Payment requested. Job fully closed.");
            navigation.popToTop();
          });
        } else {
          Animated.spring(pan, {
            toValue: { x: 0, y: 0 },
            useNativeDriver: false,
          }).start();
        }
      },
    })
  ).current;



  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
        >
          <MaterialCommunityIcons name="arrow-left" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Live Tracking</Text>
        <TouchableOpacity style={styles.helpBtn}>
          <MaterialCommunityIcons name="help-circle-outline" size={24} color="#666" />
        </TouchableOpacity>
      </View>

      {/* Main Container */}
      <View style={{ flex: 1 }}>
        {/* Map Area (Upper Half) */}
        <View style={styles.mapContainer}>
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#29563A" />
              <Text style={styles.loadingText}>Locating...</Text>
            </View>
          ) : Platform.OS === "web" ? (
            <View style={[styles.map, styles.webMapPlaceholder]}>
              <MaterialCommunityIcons name="map-marker-off" size={48} color="#999" />
              <Text style={styles.webMapText}>Map view available on mobile</Text>
            </View>
          ) : (
            <MapView
              style={styles.map}
              initialRegion={farmerLocation}
              showsUserLocation={true}
            >
              {operatorLocation && !isOperatorOffline && (
                <Marker
                  coordinate={operatorLocation}
                  title={operatorProfile?.name || "Operator"}
                >
                  <View style={styles.markerContainer}>
                    <MaterialCommunityIcons name="tractor" size={24} color="#D68C45" />
                  </View>
                </Marker>
              )}
              {farmerLocation && (
                <Marker coordinate={farmerLocation} title="Your Farm" pinColor="#29563A" />
              )}
            </MapView>
          )}

          {/* Floaters (Distance/ETA) Overlaying the Map */}
          {!loading && !isOperatorOffline && operatorLocation && currentStatus !== "completed" && (
             <View style={styles.floatersContainer}>
                <View style={[styles.floater, { marginRight: 10 }]}>
                   <Text style={styles.floaterVal}>{eta || "--"}</Text>
                   <Text style={styles.floaterLab}>ETA</Text>
                </View>
                <View style={styles.floater}>
                   <Text style={styles.floaterVal}>{distance || "--"}<Text style={{fontSize: 10}}>km</Text></Text>
                   <Text style={styles.floaterLab}>Dist</Text>
                </View>
             </View>
          )}
        </View>

        {/* Details Area (Scrollable Bottom Half) */}
        <View style={styles.detailsContainer}>
          <View style={styles.dragHandle} />
          
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
            {/* Operator Info Row */}
            <View style={styles.operatorRow}>
              <View style={styles.avatar}>
                <MaterialCommunityIcons name="account" size={24} color="#29563A" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.operatorName}>{operatorProfile?.name || operatorName || "Operator"}</Text>
                <Text style={styles.operatorVehicle}>{booking?.machineType || "Assigned Operator"}</Text>
              </View>
              {operatorProfile?.phone && (
                <TouchableOpacity 
                  style={styles.callCircle}
                  onPress={() => Alert.alert("Call Operator", `Calling ${operatorProfile.phone}...`)}
                >
                  <MaterialCommunityIcons name="phone" size={20} color="#FFF" />
                </TouchableOpacity>
              )}
            </View>

            {/* Offline Alert */}
            {isOperatorOffline && (
               <View style={styles.offlineAlert}>
                 <MaterialCommunityIcons name="wifi-off" size={20} color="#E53935" />
                 <Text style={styles.offlineText}>Operator&apos;s GPS signal is weak...</Text>
               </View>
            )}

            {/* Job Progress Steps */}
            <Text style={styles.sectionTitle}>Job Progress</Text>
            <View style={styles.stepsWrapper}>
              {steps.map((step, index) => {
                const isCompleted = index < currentStep;
                const isCurrent = index === currentStep;
                return (
                  <View key={index} style={styles.stepItem}>
                    <View style={styles.stepIndicator}>
                      <View style={[
                        styles.stepDot,
                        isCompleted && styles.dotCompleted,
                        isCurrent && styles.dotCurrent
                      ]}>
                        {isCompleted && <MaterialCommunityIcons name="check" size={12} color="#FFF" />}
                      </View>
                      {index < steps.length - 1 && (
                        <View style={[styles.stepLine, isCompleted && styles.lineCompleted]} />
                      )}
                    </View>
                    <View style={styles.stepContent}>
                      <Text style={[
                        styles.stepLabel,
                        (isCompleted || isCurrent) && styles.labelActive
                      ]}>
                        {step.label}
                      </Text>
                      {isCurrent && (
                        <Text style={styles.currentHint}>Current phase</Text>
                      )}
                    </View>
                  </View>
                );
              })}
            </View>

            {/* Final Completion Action */}
            {(currentStatus === "completed" || currentStatus === "finishing") && (
              <View style={styles.completionCard}>
                <MaterialCommunityIcons name="check-circle" size={40} color="#29563A" />
                <Text style={styles.completionTitle}>Job Finished!</Text>
                <Text style={styles.completionSub}>Please confirm to finalize payment.</Text>
                
                <View style={styles.sliderTrack}>
                  <Text style={styles.sliderText}>Slide to Confirm &gt;&gt;</Text>
                  <Animated.View
                    style={[styles.sliderThumb, { transform: [{ translateX: pan.x }] }]}
                    {...panResponder.panHandlers}
                  >
                    <MaterialCommunityIcons name="chevron-double-right" size={28} color="#FFF" />
                  </Animated.View>
                </View>
              </View>
            )}
          </ScrollView>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F5F5F5",
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: { fontSize: 18, fontWeight: "bold", color: "#333" },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: { marginTop: 12, color: "#666", fontSize: 16 },
  mapContainer: { height: height * 0.45 },
  map: { width, height: "100%" },
  webMapPlaceholder: {
    backgroundColor: "#E8F5E9",
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  webMapText: {
    fontSize: 16,
    color: "#29563A",
    fontWeight: "bold",
    textAlign: "center",
  },
  markerContainer: {
    backgroundColor: "#FFF",
    padding: 4,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: "#D68C45",
  },
  floatersContainer: {
    position: "absolute",
    top: 20,
    left: 20,
    right: 20,
    flexDirection: "row",
    justifyContent: "center",
  },
  floater: {
    backgroundColor: "#FFF",
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    elevation: 4,
  },
  floaterVal: { fontSize: 18, fontWeight: "bold", color: "#2E7D32" },
  floaterLab: { fontSize: 10, color: "#999", marginLeft: 4, textTransform: "uppercase" },

  detailsContainer: {
    flex: 1,
    backgroundColor: "#FFF",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    marginTop: -30, // Overlap the map
    paddingHorizontal: 20,
    elevation: 20,
  },
  dragHandle: {
    width: 40,
    height: 5,
    backgroundColor: "#EEE",
    borderRadius: 3,
    alignSelf: "center",
    marginVertical: 15,
  },
  operatorRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#E8F5E9",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  operatorName: { fontSize: 18, fontWeight: "bold", color: "#333" },
  operatorVehicle: { fontSize: 14, color: "#666" },
  callCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#29563A",
    justifyContent: "center",
    alignItems: "center",
  },
  offlineAlert: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFEBEE",
    padding: 10,
    borderRadius: 10,
    marginBottom: 20,
  },
  offlineText: { color: "#E53935", fontSize: 13, marginLeft: 10 },
  sectionTitle: { fontSize: 16, fontWeight: "bold", color: "#333", marginBottom: 15 },
  stepsWrapper: { marginBottom: 30 },
  stepItem: { flexDirection: "row", minHeight: 60 },
  stepIndicator: { width: 30, alignItems: "center" },
  stepDot: { width: 20, height: 20, borderRadius: 10, backgroundColor: "#EEE", justifyContent: "center", alignItems: "center", zIndex: 1 },
  dotCompleted: { backgroundColor: "#A3C4A8" },
  dotCurrent: { backgroundColor: "#FFF", borderWidth: 2, borderColor: "#29563A" },
  stepLine: { width: 2, flex: 1, backgroundColor: "#EEE", marginVertical: -2 },
  lineCompleted: { backgroundColor: "#A3C4A8" },
  stepContent: { flex: 1, paddingLeft: 15, paddingTop: 2 },
  stepLabel: { fontSize: 15, color: "#999" },
  labelActive: { color: "#333", fontWeight: "600" },
  currentHint: { fontSize: 11, color: "#2E7D32", marginTop: 2 },

  completionCard: {
    backgroundColor: "#F1F8E9",
    borderRadius: 20,
    padding: 20,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#C5E1A5",
  },
  completionTitle: { fontSize: 20, fontWeight: "bold", color: "#2E7D32", marginTop: 10 },
  completionSub: { fontSize: 14, color: "#555", marginTop: 5, marginBottom: 20, textAlign: "center" },
  sliderTrack: {
    width: "100%",
    height: 50,
    backgroundColor: "#FFF",
    borderRadius: 25,
    justifyContent: "center",
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#A3C4A8",
  },
  sliderText: { textAlign: "center", color: "#29563A", fontWeight: "bold", fontSize: 14, position: "absolute", width: "100%" },
  sliderThumb: { width: 50, height: 50, borderRadius: 25, backgroundColor: "#29563A", justifyContent: "center", alignItems: "center", position: "absolute", left: 0 },
  helpBtn: { width: 40, height: 40, justifyContent: "center", alignItems: "center" },
});

export default JobTrackingScreen;

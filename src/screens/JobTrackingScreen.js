import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as Location from "expo-location";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Platform,
} from "react-native";

// react-native-maps causes fatal errors on Web. We must conditionally import it.
let MapView, Marker;
if (Platform.OS !== "web") {
  const Maps = require("react-native-maps");
  MapView = Maps.default;
  Marker = Maps.Marker;
}
import { calculateDistance, estimateETA } from "../services/location";
import { connectSocket, disconnectSocket, socket } from "../services/socket";

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

  useEffect(() => {
    let mounted = true;

    const setupTracking = async () => {
      try {
        // 1. Get farmer's current location to center map
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          alert("Permission to access location was denied");
          setLoading(false);
          return;
        }

        let location = await Location.getCurrentPositionAsync({});
        if (mounted) {
          setFarmerLocation({
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
          });
          setLoading(false);
        }

        // 2. Connect to Socket Server and join this booking's room
        connectSocket();
        socket.emit("farmer:track_job", { bookingId });

        // 3. Listen for Operator location broadcasts
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

        // 4. Handle operator disconnecting/going offline
        socket.on("operator_offline", () => {
          if (mounted) {
            setIsOperatorOffline(true);
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
      socket.off("location_broadcast");
      socket.off("operator_offline");
      disconnectSocket();
    };
  }, [bookingId, farmerLocation?.latitude, farmerLocation?.longitude]);

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
        <View style={{ width: 40 }} />
      </View>

      {/* Map Area */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#29563A" />
          <Text style={styles.loadingText}>Locating...</Text>
        </View>
      ) : (
        <View style={styles.mapContainer}>
          {Platform.OS === "web" ? (
            <View style={[styles.map, styles.webMapPlaceholder]}>
              <MaterialCommunityIcons name="map-marker-off" size={48} color="#999" />
              <Text style={styles.webMapText}>
                Live Map Tracking is only available on iOS and Android devices.
              </Text>
              <Text style={styles.webMapSubText}>
                (The background tracking logic is still running!)
              </Text>
            </View>
          ) : (
            <MapView
              style={styles.map}
              initialRegion={farmerLocation}
              showsUserLocation={true}
              showsMyLocationButton={true}
            >
              {/* Operator Marker */}
              {operatorLocation && !isOperatorOffline && (
                <Marker
                  coordinate={operatorLocation}
                  title={operatorName || "Operator"}
                  description="Approaching your farm"
                >
                  <View style={styles.markerContainer}>
                    <MaterialCommunityIcons
                      name="tractor"
                      size={28}
                      color="#D68C45"
                    />
                  </View>
                </Marker>
              )}

              {/* Farm Marker */}
              {farmerLocation && (
                <Marker
                  coordinate={farmerLocation}
                  title="Your Farm"
                  pinColor="#29563A"
                />
              )}
            </MapView>
          )}

          {/* Status Overlay UI */}
          <View style={styles.infoCard}>
            {isOperatorOffline ? (
              <View style={styles.offlineState}>
                <MaterialCommunityIcons name="wifi-off" size={24} color="#E53935" />
                <View style={{ marginLeft: 12 }}>
                  <Text style={styles.offlineTitle}>Operator is Offline</Text>
                  <Text style={styles.offlineSub}>Waiting for GPS signal...</Text>
                </View>
              </View>
            ) : !operatorLocation ? (
              <View style={styles.waitingState}>
                <ActivityIndicator size="small" color="#29563A" />
                <Text style={styles.waitingText}>Waiting for operator location...</Text>
              </View>
            ) : (
              <View style={styles.activeState}>
                <View style={styles.etaRow}>
                  <View>
                    <Text style={styles.infoLabel}>ETA</Text>
                    <Text style={styles.etaText}>{eta || "..."}</Text>
                  </View>
                  <View style={styles.divider} />
                  <View>
                    <Text style={styles.infoLabel}>Distance</Text>
                    <Text style={styles.distanceText}>{distance ? `${distance} km` : "..."}</Text>
                  </View>
                </View>
                
                <View style={styles.operatorRow}>
                  <View style={styles.avatar}>
                    <MaterialCommunityIcons name="account" size={24} color="#29563A" />
                  </View>
                  <View>
                    <Text style={styles.operatorName}>{operatorName || "John Doe"}</Text>
                    <Text style={styles.operatorVehicle}>Mahindra Tractor | MH46 XY1234</Text>
                  </View>
                </View>
              </View>
            )}
          </View>
        </View>
      )}
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
  mapContainer: { flex: 1 },
  map: { width, height: height - 80 }, // Account for header
  webMapPlaceholder: {
    backgroundColor: "#E8F5E9",
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  webMapText: {
    fontSize: 18,
    color: "#29563A",
    fontWeight: "bold",
    textAlign: "center",
    marginTop: 16,
  },
  webMapSubText: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    marginTop: 8,
  },
  markerContainer: {
    backgroundColor: "#FFF",
    padding: 6,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: "#D68C45",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  infoCard: {
    position: "absolute",
    bottom: 30,
    left: 20,
    right: 20,
    backgroundColor: "#FFF",
    borderRadius: 20,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 8,
  },
  waitingState: { flexDirection: "row", alignItems: "center", justifyContent: "center", paddingVertical: 10 },
  waitingText: { marginLeft: 12, color: "#666", fontSize: 15 },
  offlineState: { flexDirection: "row", alignItems: "center", paddingVertical: 5 },
  offlineTitle: { fontSize: 16, fontWeight: "bold", color: "#E53935" },
  offlineSub: { fontSize: 13, color: "#666", marginTop: 2 },
  activeState: {},
  etaRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  infoLabel: { fontSize: 12, color: "#999", textTransform: "uppercase", letterSpacing: 1 },
  etaText: { fontSize: 28, fontWeight: "bold", color: "#2E7D32" },
  distanceText: { fontSize: 24, fontWeight: "bold", color: "#333" },
  divider: { width: 1, height: 30, backgroundColor: "#E0E0E0" },
  operatorRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: "#F0F0F0",
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#E8F5E9",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  operatorName: { fontSize: 16, fontWeight: "bold", color: "#333" },
  operatorVehicle: { fontSize: 13, color: "#666", marginTop: 2 },
});

export default JobTrackingScreen;

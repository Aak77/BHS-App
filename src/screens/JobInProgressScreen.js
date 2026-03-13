import {
  FontAwesome5,
  Ionicons,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import React, { useState, useRef, useEffect } from "react";
import {
  Animated,
  PanResponder,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { socket } from "../services/socket";
import { updateBookingStatus } from "../services/firestore";

const SLIDER_WIDTH = 300;
const THUMB_SIZE = 50;
const SLIDE_DISTANCE = SLIDER_WIDTH - THUMB_SIZE;

const JobInProgressScreen = ({ navigation, route }) => {
  const { bookingId, booking } = route.params || {};
  // Track the current step (0 to 4)
  const [currentStep, setCurrentStep] = useState(0);
  const stepRef = useRef(0);

  useEffect(() => {
    stepRef.current = currentStep;
  }, [currentStep]);

  useEffect(() => {
    // 1. Join the booking room so broadcasting works
    if (bookingId) {
      const { connectSocket } = require("../services/socket");
      connectSocket();
      socket.emit("operator:start_job", { bookingId });
    }
  }, [bookingId]);

  const steps = [
    { label: "Heading to field", status: "heading_to_farm" },
    { label: "Arrived at location", status: "reached_farm" },
    { label: "Work started", status: "started_work" },
    { label: "Work in progress", status: "in_progress" },
    { label: "Job completed", status: "finishing" },
  ];

  // PanResponder logic for the Slide to Update button
  const pan = useRef(new Animated.ValueXY()).current;
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dx > 0 && gestureState.dx < SLIDE_DISTANCE) {
          pan.setValue({ x: gestureState.dx, y: 0 });
        }
      },
      onPanResponderRelease: async (_, gestureState) => {
        if (gestureState.dx >= SLIDE_DISTANCE * 0.8) {
          // Slide succeeded! Lock to end.
          Animated.timing(pan, {
            toValue: { x: SLIDE_DISTANCE, y: 0 },
            duration: 150,
            useNativeDriver: false,
          }).start(async () => {
             // Handle the step logic
             await handleNextStep(stepRef.current);
             
             // Reset slider back to start
             pan.setValue({ x: 0, y: 0 });
          });
        } else {
          // Snap back
          Animated.spring(pan, {
            toValue: { x: 0, y: 0 },
            useNativeDriver: false,
          }).start();
        }
      },
    })
  ).current;


  const handleNextStep = async (stepIndex) => {
    if (stepIndex < steps.length) {
      const newStatus = steps[stepIndex].status;
      
      // Emit the real-time status update to the server room
      if (bookingId && socket) {
        socket.emit("operator:status_update", { bookingId, status: newStatus });
        // Also update Firestore as a fallback source of truth
        await updateBookingStatus(bookingId, newStatus);
      }
      
      if (stepIndex === steps.length - 1) {
         // It's the final 'completing' step
         handleCompleteJob();
      } else {
         setCurrentStep(stepIndex + 1);
      }
    }
  };

  const handleCompleteJob = async () => {
     if (bookingId) {
        if (socket) {
           socket.emit("operator:status_update", { bookingId, status: "completed" });
           socket.emit("operator:complete_job", { bookingId });
        }
        await updateBookingStatus(bookingId, "completed");
     }
     alert("Job Completed Successfully!");
     navigation.navigate("OperatorDashboard"); // Send them back to dashboard
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 20 }}
      >
        {/* Header - Farmer Info */}
        <View style={styles.headerCard}>
          <View style={styles.farmerRow}>
            <View style={styles.avatar}>
              <Ionicons name="person" size={24} color="#29563A" />
            </View>
            <View>
              <Text style={styles.farmerName}>{booking?.farmerName || "Farmer"}</Text>
              <Text style={styles.farmerPhone}>{booking?.farmerPhone || "Contact details hidden"}</Text>
            </View>
            <TouchableOpacity style={styles.callBtn}>
              <Ionicons name="call" size={20} color="#FFF" />
            </TouchableOpacity>
          </View>
          <View style={styles.locationRow}>
            <Ionicons name="location-outline" size={18} color="#666" />
            <Text style={styles.locationText}>
              {booking?.location || "Detected via GPS"}
            </Text>
          </View>
        </View>

        {/* Job Details Grid */}
        <View style={styles.gridContainer}>
          <View style={styles.gridItem}>
            <Text style={styles.gridLabel}>Machine</Text>
            <View style={styles.gridValueRow}>
              <FontAwesome5 name="tractor" size={14} color="#29563A" />
              <Text style={styles.gridValue}>{booking?.machineType || "Machine"}</Text>
            </View>
          </View>
          <View style={styles.gridItem}>
            <Text style={styles.gridLabel}>Acres</Text>
            <View style={styles.gridValueRow}>
              <MaterialCommunityIcons
                name="texture"
                size={16}
                color="#D68C45"
              />
              <Text style={styles.gridValue}>{booking?.acres || 0} acres</Text>
            </View>
          </View>
          <View style={styles.gridItem}>
            <Text style={styles.gridLabel}>Rate</Text>
            <View style={styles.gridValueRow}>
              <Ionicons name="cash-outline" size={16} color="#29563A" />
              <Text style={styles.gridValue}>₹{booking?.pricePerAcre?.toLocaleString() || "0"}/ac</Text>
            </View>
          </View>
          <View style={styles.gridItem}>
            <Text style={styles.gridLabel}>Total</Text>
            <View style={styles.gridValueRow}>
              <Ionicons name="wallet" size={16} color="#D68C45" />
              <Text style={styles.gridTotal}>₹{booking?.totalPrice?.toLocaleString() || "0"}</Text>
            </View>
          </View>
        </View>

        {/* Static Progress List Tracker */}
        <Text style={styles.sectionTitle}>Job Progress</Text>
        <View style={styles.progressContainer}>
          {steps.map((stepInfo, index) => {
            const isCompleted = index < currentStep;
            const isCurrent = index === currentStep;

            return (
              <View
                key={index}
                style={[
                  styles.stepCard,
                  isCurrent && styles.stepCardCurrent,
                  isCompleted && styles.stepCardCompleted,
                ]}
              >
                <View style={styles.stepLeft}>
                  <View
                    style={[
                      styles.stepCircle,
                      isCompleted && styles.circleCompleted,
                      isCurrent && styles.circleCurrent,
                    ]}
                  >
                    {isCompleted ? (
                      <Ionicons name="checkmark" size={16} color="#FFF" />
                    ) : (
                      <Text
                        style={[
                          styles.stepNumber,
                          isCurrent && { color: "#29563A" },
                        ]}
                      >
                        {index + 1}
                      </Text>
                    )}
                  </View>
                  <Text
                    style={[
                      styles.stepText,
                      (isCompleted || isCurrent) && styles.stepTextActive,
                    ]}
                  >
                    {stepInfo.label}
                  </Text>
                </View>

                {isCurrent && (
                  <View style={styles.currentBadge}>
                    <Text style={styles.currentBadgeText}>Current Phase</Text>
                  </View>
                )}
              </View>
            );
          })}
        </View>
      </ScrollView>

      {/* Slide to Update Action Footer */}
      <View style={styles.footer}>
        <Text style={styles.swipeHintText}>Slide to update status to: <Text style={{fontWeight: 'bold'}}>{steps[currentStep]?.label}</Text></Text>
        <View style={styles.sliderTrack}>
          <Text style={styles.sliderText}>Slide to Update &gt;&gt;</Text>
          <Animated.View
            style={[styles.sliderThumb, { transform: [{ translateX: pan.x }] }]}
            {...panResponder.panHandlers}
          >
            <MaterialCommunityIcons name="chevron-double-right" size={28} color="#FFF" />
          </Animated.View>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F2F6F0" },

  headerCard: {
    backgroundColor: "#FFF",
    padding: 20,
    borderRadius: 20,
    elevation: 2,
    marginBottom: 15,
  },
  farmerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 15,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#E8F5E9",
    justifyContent: "center",
    alignItems: "center",
  },
  farmerName: { fontSize: 18, fontWeight: "bold", color: "#333" },
  farmerPhone: { fontSize: 14, color: "#666", marginTop: 2 },
  callBtn: {
    backgroundColor: "#29563A",
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#EEE",
    paddingTop: 15,
  },
  locationText: { marginLeft: 8, color: "#555", fontSize: 14 },

  gridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 25,
  },
  gridItem: {
    width: "48%",
    backgroundColor: "#FFF",
    padding: 15,
    borderRadius: 16,
    marginBottom: 10,
    elevation: 1,
  },
  gridLabel: { fontSize: 13, color: "#777", marginBottom: 6 },
  gridValueRow: { flexDirection: "row", alignItems: "center" },
  gridValue: { fontSize: 15, fontWeight: "bold", color: "#333", marginLeft: 8 },
  gridTotal: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#29563A",
    marginLeft: 8,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 15,
  },
  progressContainer: {
    backgroundColor: "#FFF",
    borderRadius: 20,
    padding: 10,
    elevation: 2,
    paddingBottom: 120,
  },

  stepCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    backgroundColor: "#F9F9F9",
  },
  stepCardCurrent: {
    backgroundColor: "#E8F5E9",
    borderWidth: 1,
    borderColor: "#A3C4A8",
  },
  stepCardCompleted: { backgroundColor: "#FFF" },

  stepLeft: { flexDirection: "row", alignItems: "center" },
  stepCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#EEE",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  circleCompleted: { backgroundColor: "#A3C4A8" },
  circleCurrent: {
    backgroundColor: "#FFF",
    borderWidth: 2,
    borderColor: "#29563A",
  },
  stepNumber: { fontSize: 12, fontWeight: "bold", color: "#999" },

  stepText: { fontSize: 15, color: "#888", fontWeight: "500" },
  stepTextActive: { color: "#333", fontWeight: "bold" },

  currentBadge: {
    backgroundColor: "#29563A",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  currentBadgeText: { color: "#FFF", fontSize: 10, fontWeight: "bold" },

  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#FFF",
    padding: 20,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    elevation: 10,
    alignItems: "center",
  },
  swipeHintText: {
     fontSize: 14,
     color: "#555",
     marginBottom: 10,
  },
  sliderTrack: {
    width: SLIDER_WIDTH,
    height: THUMB_SIZE,
    backgroundColor: "#E8F5E9",
    borderRadius: THUMB_SIZE / 2,
    justifyContent: "center",
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#A3C4A8",
  },
  sliderText: {
    textAlign: "center",
    color: "#29563A",
    fontWeight: "bold",
    fontSize: 16,
    position: "absolute",
    width: "100%",
  },
  sliderThumb: {
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    borderRadius: THUMB_SIZE / 2,
    backgroundColor: "#29563A",
    justifyContent: "center",
    alignItems: "center",
    position: "absolute",
    left: 0,
  },
});

export default JobInProgressScreen;

import {
  FontAwesome5,
  Ionicons,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import React, { useState } from "react";
import {
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const JobInProgressScreen = ({ navigation }) => {
  // Track the current step (0 to 4)
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    "Heading to field",
    "Arrived at location",
    "Work started",
    "Work in progress",
    "Finishing up",
  ];

  const handleNextStep = (index) => {
    // Only allow clicking the next immediate step
    if (index === currentStep) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleCompleteJob = () => {
    Alert.alert(
      "Confirm job completion?",
      "The farmer will be asked to rate you after this.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Confirm",
          onPress: () => {
            alert("Job Completed Successfully!");
            navigation.navigate("OperatorDashboard"); // Send them back to dashboard
          },
        },
      ],
    );
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
              <Text style={styles.farmerName}>Rajinder Singh</Text>
              <Text style={styles.farmerPhone}>+91 9876509999</Text>
            </View>
            <TouchableOpacity style={styles.callBtn}>
              <Ionicons name="call" size={20} color="#FFF" />
            </TouchableOpacity>
          </View>
          <View style={styles.locationRow}>
            <Ionicons name="location-outline" size={18} color="#666" />
            <Text style={styles.locationText}>
              Village Khanna, Dist. Ludhiana
            </Text>
          </View>
        </View>

        {/* Job Details Grid */}
        <View style={styles.gridContainer}>
          <View style={styles.gridItem}>
            <Text style={styles.gridLabel}>Machine</Text>
            <View style={styles.gridValueRow}>
              <FontAwesome5 name="tractor" size={14} color="#29563A" />
              <Text style={styles.gridValue}>Happy Seeder</Text>
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
              <Text style={styles.gridValue}>5 acres</Text>
            </View>
          </View>
          <View style={styles.gridItem}>
            <Text style={styles.gridLabel}>Rate</Text>
            <View style={styles.gridValueRow}>
              <Ionicons name="cash-outline" size={16} color="#29563A" />
              <Text style={styles.gridValue}>₹2,000/ac</Text>
            </View>
          </View>
          <View style={styles.gridItem}>
            <Text style={styles.gridLabel}>Total</Text>
            <View style={styles.gridValueRow}>
              <Ionicons name="wallet" size={16} color="#D68C45" />
              <Text style={styles.gridTotal}>₹10,000</Text>
            </View>
          </View>
        </View>

        {/* Interactive Progress List */}
        <Text style={styles.sectionTitle}>Update Progress</Text>
        <View style={styles.progressContainer}>
          {steps.map((step, index) => {
            const isCompleted = index < currentStep;
            const isCurrent = index === currentStep;

            return (
              <TouchableOpacity
                key={index}
                style={[
                  styles.stepCard,
                  isCurrent && styles.stepCardCurrent,
                  isCompleted && styles.stepCardCompleted,
                ]}
                onPress={() => handleNextStep(index)}
                activeOpacity={isCurrent ? 0.7 : 1}
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
                    {step}
                  </Text>
                </View>

                {isCurrent && (
                  <View style={styles.currentBadge}>
                    <Text style={styles.currentBadgeText}>Tap to complete</Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      {/* Footer Action Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.completeBtn,
            currentStep < steps.length && styles.completeBtnDisabled,
          ]}
          disabled={currentStep < steps.length}
          onPress={handleCompleteJob}
        >
          <MaterialCommunityIcons
            name="check-decagram"
            size={24}
            color={currentStep < steps.length ? "#999" : "#FFF"}
            style={{ marginRight: 8 }}
          />
          <Text
            style={[
              styles.completeBtnText,
              currentStep < steps.length && { color: "#999" },
            ]}
          >
            Mark Job as Complete
          </Text>
        </TouchableOpacity>
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
    paddingBottom: 100,
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
  },
  completeBtn: {
    flexDirection: "row",
    backgroundColor: "#29563A",
    paddingVertical: 16,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  completeBtnDisabled: { backgroundColor: "#E0E0E0" },
  completeBtnText: { color: "#FFF", fontSize: 16, fontWeight: "bold" },
});

export default JobInProgressScreen;

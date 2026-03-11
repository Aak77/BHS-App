import { FontAwesome5, MaterialCommunityIcons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const OperatorDashboard = ({ navigation, route }) => {
  const [isOnline, setIsOnline] = useState(false);

  // Grab the passed name
  const userName = route.params?.userName || "Operator";

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Header */}
        {/* Profile Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Good Morning,</Text>
            {/* Use the dynamic variable here */}
            <Text style={styles.opName}>{userName}</Text>
          </View>
          <View style={styles.statusBadge}>
            <Text style={styles.statusText}>
              {isOnline ? "ONLINE" : "OFFLINE"}
            </Text>
            <Switch
              trackColor={{ false: "#767577", true: "#A3C4A8" }}
              thumbColor={isOnline ? "#29563A" : "#f4f3f4"}
              onValueChange={() => setIsOnline(!isOnline)}
              value={isOnline}
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
            <Text style={styles.cardLabel}>Today's Earnings</Text>
            <MaterialCommunityIcons
              name="arrow-right-circle"
              size={20}
              color="#A3C4A8"
            />
          </View>
          <Text style={styles.amountText}>₹4,500</Text>
          <View style={styles.statsRow}>
            <View style={styles.miniStat}>
              <FontAwesome5 name="tractor" size={14} color="#A3C4A8" />
              <Text style={styles.miniStatText}>2 Jobs</Text>
            </View>
            <View style={styles.miniStat}>
              <MaterialCommunityIcons
                name="texture"
                size={16}
                color="#A3C4A8"
              />
              <Text style={styles.miniStatText}>12 Acres</Text>
            </View>
          </View>
        </TouchableOpacity>

        {/* Alerts Section */}
        <Text style={styles.sectionTitle}>Recent Notifications</Text>

        {!isOnline ? (
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
          <TouchableOpacity
            style={styles.alertCard}
            onPress={() => navigation.navigate("IncomingRequest")}
          >
            <View style={styles.alertHeader}>
              <View style={styles.newBadge}>
                <Text style={styles.newText}>NEW REQUEST</Text>
              </View>
              <Text style={styles.timeText}>Just now</Text>
            </View>
            <Text style={styles.farmerName}>Rajesh Kumar</Text>
            <Text style={styles.jobDetail}>
              Happy Seeder • 5 Acres • Panvel
            </Text>
            <View style={styles.alertFooter}>
              <Text style={styles.priceEstimate}>Est. Earnings: ₹2,200</Text>
              <Text style={styles.viewTask}>Tap to View →</Text>
            </View>
          </TouchableOpacity>
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
  scrollContent: { padding: 20 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 25,
  },
  greeting: { fontSize: 14, color: "#666" },
  opName: { fontSize: 22, fontWeight: "bold", color: "#29563A" },
  statusBadge: { alignItems: "center" },
  statusText: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#666",
    marginBottom: 4,
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
});

export default OperatorDashboard;

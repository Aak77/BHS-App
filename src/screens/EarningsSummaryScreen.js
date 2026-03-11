import { FontAwesome5, Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const EarningsSummaryScreen = ({ navigation }) => {
  return (
    <SafeAreaView style={styles.container}>
      {/* Top Header */}
      <View style={styles.topHeader}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Your income summary</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Total Earnings Hero Banner */}
        <View style={styles.heroBanner}>
          <Text style={styles.heroLabel}>Total Earnings</Text>
          <Text style={styles.heroAmount}>₹36,000</Text>

          <View style={styles.heroStatsRow}>
            <View style={styles.heroStatItem}>
              <Text style={styles.statTitle}>Jobs</Text>
              <Text style={styles.statValue}>4</Text>
            </View>
            <View style={styles.heroStatItem}>
              <Text style={styles.statTitle}>Total Acres</Text>
              <Text style={styles.statValue}>18</Text>
            </View>
            <View style={styles.heroStatItem}>
              <Text style={styles.statTitle}>Rating</Text>
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Text style={styles.statValue}>4.8 </Text>
                <Ionicons name="star" size={14} color="#D68C45" />
              </View>
            </View>
          </View>
        </View>

        <View style={styles.contentWrapper}>
          {/* This Week Card */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>This Week</Text>
              <Text style={styles.cardAction}>+₹26,000</Text>
            </View>
            <Text style={styles.cardSubtitle}>3 jobs completed</Text>

            {/* Simple Mock Chart */}
            <View style={styles.chartMock}>
              <View style={styles.barContainer}>
                <View style={[styles.bar, { height: "30%" }]} />
                <Text style={styles.dayText}>M</Text>
              </View>
              <View style={styles.barContainer}>
                <View style={[styles.bar, { height: "80%" }]} />
                <Text style={styles.dayText}>T</Text>
              </View>
              <View style={styles.barContainer}>
                <View style={[styles.bar, { height: "50%" }]} />
                <Text style={styles.dayText}>W</Text>
              </View>
              <View style={styles.barContainer}>
                <View style={[styles.bar, { height: "20%" }]} />
                <Text style={styles.dayText}>T</Text>
              </View>
              <View style={styles.barContainer}>
                <View style={[styles.bar, { height: "100%" }]} />
                <Text style={styles.dayText}>F</Text>
              </View>
              <View style={styles.barContainer}>
                <View style={[styles.bar, { height: "10%" }]} />
                <Text style={styles.dayText}>S</Text>
              </View>
              <View style={styles.barContainer}>
                <View style={[styles.bar, { height: "0%" }]} />
                <Text style={styles.dayText}>S</Text>
              </View>
            </View>
          </View>

          {/* Earnings by Machine */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Earnings by Machine</Text>
            <View style={{ marginTop: 15 }}>
              <View style={styles.machineRow}>
                <Text style={styles.machineName}>Happy Seeder</Text>
                <Text style={styles.machineValue}>₹26,000</Text>
              </View>
              {/* Progress bar mock */}
              <View style={styles.progressBg}>
                <View style={styles.progressFill} />
              </View>

              <View style={styles.machineRow}>
                <Text style={styles.machineName}>Mulcher</Text>
                <Text style={styles.machineValue}>₹0</Text>
              </View>

              <View style={styles.machineRow}>
                <Text style={styles.machineName}>Baler</Text>
                <Text style={styles.machineValue}>₹0</Text>
              </View>
            </View>
          </View>

          {/* Recent Jobs List */}
          <Text style={styles.sectionTitle}>Recent Jobs</Text>
          <View style={styles.historyCard}>
            <View style={styles.historyRow}>
              <View style={styles.avatar}>
                <FontAwesome5 name="user-alt" size={14} color="#29563A" />
              </View>
              <View style={styles.historyInfo}>
                <Text style={styles.historyName}>Rajinder Singh</Text>
                <Text style={styles.historyDetail}>
                  Happy Seeder • 5 acres • Today
                </Text>
              </View>
              <View style={{ alignItems: "flex-end" }}>
                <Text style={styles.historyAmount}>+₹10,000</Text>
                <Text style={styles.paidBadge}>Paid</Text>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.historyRow}>
              <View style={styles.avatar}>
                <FontAwesome5 name="user-alt" size={14} color="#29563A" />
              </View>
              <View style={styles.historyInfo}>
                <Text style={styles.historyName}>Amarjit Singh</Text>
                <Text style={styles.historyDetail}>
                  Happy Seeder • 4 acres • 28 Feb
                </Text>
              </View>
              <View style={{ alignItems: "flex-end" }}>
                <Text style={styles.historyAmount}>+₹8,000</Text>
                <Text style={styles.paidBadge}>Paid</Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#29563A" }, // Dark green background top
  topHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
  },
  headerTitle: { color: "#FFF", fontSize: 16, fontWeight: "600" },

  heroBanner: { paddingHorizontal: 20, paddingBottom: 30 },
  heroLabel: { color: "#A3C4A8", fontSize: 16, marginBottom: 5 },
  heroAmount: { color: "#FFF", fontSize: 42, fontWeight: "bold" },
  heroStatsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 25,
  },
  heroStatItem: { alignItems: "center" },
  statTitle: { color: "#A3C4A8", fontSize: 12, marginBottom: 4 },
  statValue: { color: "#FFF", fontSize: 18, fontWeight: "bold" },

  contentWrapper: {
    backgroundColor: "#F2F6F0",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    minHeight: 600,
  },

  card: {
    backgroundColor: "#FFF",
    padding: 20,
    borderRadius: 16,
    marginBottom: 15,
    elevation: 1,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  cardTitle: { fontSize: 16, fontWeight: "bold", color: "#333" },
  cardAction: { fontSize: 16, fontWeight: "bold", color: "#29563A" },
  cardSubtitle: { color: "#666", fontSize: 13, marginTop: 4 },

  chartMock: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    height: 100,
    marginTop: 20,
  },
  barContainer: { alignItems: "center", width: "10%" },
  bar: {
    width: 12,
    backgroundColor: "#A3C4A8",
    borderRadius: 6,
    marginBottom: 8,
  },
  dayText: { fontSize: 12, color: "#999" },

  machineRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 15,
  },
  machineName: { fontSize: 15, color: "#333", fontWeight: "500" },
  machineValue: { fontSize: 15, fontWeight: "bold", color: "#333" },
  progressBg: {
    height: 6,
    backgroundColor: "#E8F5E9",
    borderRadius: 3,
    marginTop: 8,
  },
  progressFill: {
    width: "85%",
    height: "100%",
    backgroundColor: "#2E7D32",
    borderRadius: 3,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginTop: 10,
    marginBottom: 15,
  },
  historyCard: {
    backgroundColor: "#FFF",
    borderRadius: 16,
    padding: 15,
    elevation: 1,
    marginBottom: 40,
  },
  historyRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#E8F5E9",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  historyInfo: { flex: 1 },
  historyName: { fontSize: 15, fontWeight: "bold", color: "#333" },
  historyDetail: { fontSize: 12, color: "#777", marginTop: 2 },
  historyAmount: { fontSize: 15, fontWeight: "bold", color: "#29563A" },
  paidBadge: {
    backgroundColor: "#E8F5E9",
    color: "#2E7D32",
    fontSize: 10,
    fontWeight: "bold",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginTop: 4,
  },
  divider: { height: 1, backgroundColor: "#F0F0F0", marginVertical: 5 },
});

export default EarningsSummaryScreen;

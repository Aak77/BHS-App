import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { MaterialCommunityIcons, Ionicons } from "@expo/vector-icons";

export default function SupportScreen() {
  return (
    <View style={styles.container}>
      
      <Text style={styles.header}>Help & Support</Text>

      <View style={styles.card}>
        <MaterialCommunityIcons name="phone" size={28} color="#29563A" />
        <Text style={styles.cardText}>Call Us</Text>
      </View>

      <View style={styles.card}>
        <Ionicons name="mail-outline" size={28} color="#29563A" />
        <Text style={styles.cardText}>Email Support</Text>
      </View>

      <Text style={styles.faqTitle}>FAQs</Text>

      <View style={styles.faqItem}>
        <Text>How to book?</Text>
      </View>

      <View style={styles.faqItem}>
        <Text>Payment methods</Text>
      </View>

      <View style={styles.faqItem}>
        <Text>How to cancel a booking?</Text>
      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F2F6F0",
    padding: 20,
  },

  header: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#29563A",
    marginBottom: 20,
  },

  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
  },

  cardText: {
    fontSize: 18,
    marginLeft: 10,
  },

  faqTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 20,
    marginBottom: 10,
  },

  faqItem: {
    backgroundColor: "white",
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
  },
});

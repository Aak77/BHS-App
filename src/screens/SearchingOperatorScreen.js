import { MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { Animated, Easing, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { fetchActiveOperators } from '../services/socket';

const SearchingOperatorScreen = ({ navigation, route }) => {
  const spinValue = new Animated.Value(0);
  const { farmerLocation, machineId, bookingId } = route.params || {};
  const [assignedOperator, setAssignedOperator] = useState(null);
  const [requested, setRequested] = useState(false);

  useEffect(() => {
    // Start spinning animation
    Animated.loop(
      Animated.timing(spinValue, {
        toValue: 1,
        duration: 3000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();

    let searchInterval;
    
    const searchForOperators = async () => {
      try {
        if (!farmerLocation || !machineId || requested) return;

        const { findNearbyOperators, updateBookingStatus } = require("../services/firestore");
        // Search within 15 km radius
        const operators = await findNearbyOperators(farmerLocation, 15, machineId);
        
        if (operators && operators.length > 0) {
          const matchedOperator = operators[0];
          clearInterval(searchInterval);
          setRequested(true);
          
          // Assign the booking to this operator in DB as pending approval
          if (bookingId) {
            await updateBookingStatus(bookingId, "pending_approval", matchedOperator.id);
            setAssignedOperator(matchedOperator);
          }
        }
      } catch (err) {
        console.log("Error finding operators:", err);
      }
    };

    // Initial check
    if (!requested) {
       searchForOperators();
       // Poll every 3 seconds until requested
       searchInterval = setInterval(searchForOperators, 3000);
    }

    return () => clearInterval(searchInterval);
  }, [farmerLocation, machineId, requested, bookingId]);

  // Dedicated real-time booking listener for Accept/Reject
  useEffect(() => {
    let unsubscribeBooking = null;
    if (requested && bookingId && assignedOperator) {
      const { observeBooking } = require("../services/firestore");
      unsubscribeBooking = observeBooking(bookingId, (booking) => {
         if (booking.status === "accepted") {
            // Wait 1 sec for visual effect then navigate directly to live tracking
            setTimeout(() => {
              navigation.replace('JobTracking', { 
                operatorName: assignedOperator?.name || "Operator",
                bookingId 
              });
            }, 1000);
         } else if (booking.status === "rejected") {
            // Operator rejected. Restart search!
            setRequested(false);
            setAssignedOperator(null);
         }
      });
    }

    return () => {
       if (unsubscribeBooking) unsubscribeBooking();
    };
  }, [requested, bookingId, assignedOperator, navigation]);

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Animated.View style={{ transform: [{ rotate: spin }] }}>
          <MaterialCommunityIcons name="loading" size={80} color="#29563A" />
        </Animated.View>
        
        <Text style={styles.title}>Searching for Operators...</Text>
        <Text style={styles.subtitle}>Finding the best equipment near your location</Text>
        
        <View style={styles.radarContainer}>
           <MaterialCommunityIcons name="radar" size={120} color="#A3C4A8" style={styles.radarIcon} />
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F2F6F0', justifyContent: 'center' },
  content: { alignItems: 'center', padding: 20 },
  title: { fontSize: 22, fontWeight: 'bold', color: '#29563A', marginTop: 30 },
  subtitle: { fontSize: 16, color: '#666', textAlign: 'center', marginTop: 10, lineHeight: 24 },
  radarContainer: { marginTop: 50, opacity: 0.3 },
});

export default SearchingOperatorScreen;
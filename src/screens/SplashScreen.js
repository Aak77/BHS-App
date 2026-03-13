import React, { useEffect, useRef } from "react";
import { Animated, Dimensions, StyleSheet, View } from "react-native";
import { useAuth } from "../context/AuthContext";

const { width } = Dimensions.get("window");

const SplashScreen = ({ navigation }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const { user, userProfile, loading } = useAuth();

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1500,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 4,
        useNativeDriver: true,
      }),
    ]).start(() => {
      // Wait for auth to finish loading
      if (loading) return;
      navigateBasedOnAuth();
    });
  }, []);

  // Re-check when loading state changes
  useEffect(() => {
    if (!loading) {
      navigateBasedOnAuth();
    }
  }, [loading]);

  const navigateBasedOnAuth = () => {
    if (user && userProfile) {
      // User is signed in and has a profile — go to their dashboard
      if (userProfile.role === "Operator") {
        navigation.replace("OperatorDashboard", {
          userName: userProfile.name,
        });
      } else {
        navigation.replace("FarmerBooking", {
          userName: userProfile.name,
        });
      }
    } else {
      // Not signed in or no profile — go to role selection
      navigation.replace("RoleSelection");
    }
  };

  return (
    <View style={styles.container}>
      <Animated.Image
        source={require("../../assets/smart_seed_app.png")}
        style={[
          styles.logo,
          { opacity: fadeAnim, transform: [{ scale: scaleAnim }] },
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
  },
  logo: {
    width: width * 1.2,
    height: width * 1.2,
    resizeMode: "contain",
    backgroundColor: "#FFFFFF",
  },
});

export default SplashScreen;

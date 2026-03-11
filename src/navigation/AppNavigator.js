import { createNativeStackNavigator } from "@react-navigation/native-stack";
import React from "react";

// Import all your screens
import AuthScreen from "../screens/AuthScreen";
import BookingConfigScreen from "../screens/BookingConfigScreen"; // The form screen
import Dashboard from "../screens/Dashboard";
import EarningsSummaryScreen from "../screens/EarningsSummaryScreen";
import FarmerBookingScreen from "../screens/FarmerBookingScreen";
import IncomingRequestScreen from "../screens/IncomingRequestScreen";
import JobInProgressScreen from "../screens/JobInProgressScreen";
import OperatorDashboard from "../screens/OperatorDashboard";
import OperatorFoundScreen from "../screens/OperatorFoundScreen"; // The profile card screen
import OperatorLoginScreen from "../screens/OperatorLoginScreen";
import OTPScreen from "../screens/OTPScreen";
import SearchingOperatorScreen from "../screens/SearchingOperatorScreen"; // The radar screen
import SplashScreen from "../screens/SplashScreen";
import SupportScreen from "../screens/SupportScreen";

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Splash" component={SplashScreen} />
      <Stack.Screen name="Login" component={AuthScreen} />
      <Stack.Screen name="OTP" component={OTPScreen} />
      <Stack.Screen name="Dashboard" component={Dashboard} />
      <Stack.Screen name="FarmerBooking" component={FarmerBookingScreen} />
      <Stack.Screen name="BookingConfig" component={BookingConfigScreen} />
      <Stack.Screen
        name="SearchingOperator"
        component={SearchingOperatorScreen}
      />
      <Stack.Screen name="OperatorFound" component={OperatorFoundScreen} />
      <Stack.Screen name="OperatorLogin" component={OperatorLoginScreen} />
      <Stack.Screen name="OperatorDashboard" component={OperatorDashboard} />
      <Stack.Screen name="Support" component={SupportScreen} />
      <Stack.Screen
        name="IncomingRequest"
        component={IncomingRequestScreen}
        options={{
          presentation: "modal",
          animation: "slide_from_bottom",
        }}
      />
      <Stack.Screen name="JobInProgress" component={JobInProgressScreen} />
      <Stack.Screen name="EarningsSummary" component={EarningsSummaryScreen} />
    </Stack.Navigator>
  );
}

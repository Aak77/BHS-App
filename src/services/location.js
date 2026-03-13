import * as Location from "expo-location";

/**
 * Request foreground permissions for location
 * @returns {Promise<boolean>} True if granted, false otherwise
 */
export const requestLocationPermissions = async () => {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    
    if (status !== "granted") {
      console.log("Permission to access location was denied");
      return false;
    }
    
    return true;
  } catch (error) {
    console.error("Error requesting location permissions:", error);
    return false;
  }
};

/**
 * Get current one-time location
 * @returns {Promise<Location.LocationObject | null>}
 */
export const getCurrentLocation = async () => {
  try {
    const hasPermission = await requestLocationPermissions();
    if (!hasPermission) return null;

    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced, // Saves battery compared to Highest
    });
    return location;
  } catch (error) {
    console.error("Error getting current location:", error);
    return null;
  }
};

/**
 * Start watching location changes
 * @param {Function} callback - Function to run when location changes
 * @returns {Promise<Location.LocationSubscription | null>} - Subscription object with a `.remove()` method
 */
export const startWatchingLocation = async (callback) => {
  try {
    const hasPermission = await requestLocationPermissions();
    if (!hasPermission) return null;

    // Use Highest accuracy while tracking an active job
    const subscription = await Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.Highest,
        timeInterval: 5000,    // Update at most every 5 seconds
        distanceInterval: 10,  // Or every 10 meters changed
      },
      (location) => {
        callback(location);
      }
    );

    return subscription;
  } catch (error) {
    console.error("Error watching location:", error);
    return null;
  }
};

/**
 * Stop watching location changes
 * @param {Location.LocationSubscription} subscription
 */
export const stopWatchingLocation = (subscription) => {
  if (subscription) {
    subscription.remove();
    console.log("[Location] Stopped tracking");
  }
};

/**
 * Calculate distance between two coordinates in kilometers using Haversine formula
 */
export const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) *
      Math.cos(deg2rad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c; // Distance in km
  return distance;
};

const deg2rad = (deg) => {
  return deg * (Math.PI / 180);
};

/**
 * Estimate ETA based on basic assumption of 30km/h average speed in rural/semi-urban areas
 */
export const estimateETA = (distanceKm) => {
  if (distanceKm < 0.5) return "Arriving now (~1 min)";
  
  const avgSpeedKmh = 30; // 30 km/h average speed
  const timeHours = distanceKm / avgSpeedKmh;
  const timeMinutes = Math.ceil(timeHours * 60);
  
  return `~${timeMinutes} min`;
};

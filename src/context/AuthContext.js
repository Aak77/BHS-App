import React, { createContext, useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { onAuthStateChanged, signOut as authSignOut } from "../services/auth";
import { getUserProfile } from "../services/firestore";

const AuthContext = createContext({});

const AUTH_STORAGE_KEY = "@bharat_seeder_auth";

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // On mount: check for persisted auth (dev mode) or listen to Firebase auth
  useEffect(() => {
    let unsubscribe = () => {};

    const init = async () => {
      try {
        // Check AsyncStorage for dev mode session
        const stored = await AsyncStorage.getItem(AUTH_STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          setUser(parsed.user);
          setUserProfile(parsed.profile);
          setLoading(false);
          // If we found a dev session, stop here and ignore Firebase
          return;
        }
      } catch (e) {
        console.log("Error loading stored auth:", e);
      }

      // Also listen for real Firebase auth changes
      unsubscribe = onAuthStateChanged(async (firebaseUser) => {
        if (firebaseUser) {
          setUser({
            uid: firebaseUser.uid,
            phoneNumber: firebaseUser.phoneNumber,
          });
          // Fetch profile from Firestore
          try {
            const profile = await getUserProfile(firebaseUser.uid);
            setUserProfile(profile);
          } catch (e) {
            console.log("Error fetching profile:", e);
          }
        } else {
          // No firebase user, and no dev user (since we returned early above if dev user existed)
          setUser(null);
          setUserProfile(null);
        }
        setLoading(false);
      });

      // If onAuthStateChanged doesn't fire (dev mode), stop loading
      setTimeout(() => setLoading(false), 1000);
    };

    init();
    return () => unsubscribe();
  }, []);

  /**
   * Called after successful OTP verification to persist the session
   */
  const setSession = async (userData, profile) => {
    setUser(userData);
    setUserProfile(profile);
    try {
      await AsyncStorage.setItem(
        AUTH_STORAGE_KEY,
        JSON.stringify({ user: userData, profile })
      );
    } catch (e) {
      console.log("Error saving auth:", e);
    }
  };

  /**
   * Update just the profile (e.g. after Firestore write)
   */
  const updateProfile = async (profile) => {
    setUserProfile(profile);
    try {
      const stored = await AsyncStorage.getItem(AUTH_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        await AsyncStorage.setItem(
          AUTH_STORAGE_KEY,
          JSON.stringify({ ...parsed, profile })
        );
      }
    } catch (e) {
      console.log("Error updating profile:", e);
    }
  };

  /**
   * Sign out: clear Firebase auth + AsyncStorage
   */
  const signOut = async () => {
    try {
      await authSignOut();
      await AsyncStorage.removeItem(AUTH_STORAGE_KEY);
      setUser(null);
      setUserProfile(null);
    } catch (e) {
      console.log("Error signing out:", e);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        userProfile,
        loading,
        setSession,
        updateProfile,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

export default AuthContext;

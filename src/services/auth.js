import {
  RecaptchaVerifier,
  signInWithPhoneNumber,
  signOut as firebaseSignOut,
  onAuthStateChanged as firebaseOnAuthStateChanged,
} from "firebase/auth";
import { Platform } from "react-native";
import { auth } from "../config/firebase";

// ============================================================
// DEV MODE: Set to true to bypass real OTP in Expo Go
// Set to false when Firebase Phone Auth is enabled
// ============================================================
export const DEV_MODE = true;
const DEV_OTP_CODE = "123456";

// Store confirmation result globally for OTP verification
let _confirmationResult = null;

/**
 * Send OTP to a phone number
 * Uses Firebase signInWithPhoneNumber on web
 */
export const sendOTP = async (phoneNumber) => {
  const fullPhone = phoneNumber.startsWith("+") ? phoneNumber : `+91${phoneNumber}`;

  if (DEV_MODE) {
    console.log(`[DEV MODE] OTP sent to ${fullPhone} — use code: ${DEV_OTP_CODE}`);
    return "dev-mode-verification-id";
  }

  try {
    // Create invisible reCAPTCHA verifier (web only)
    if (Platform.OS === "web") {
      // Clear previous verifier if exists
      if (window.recaptchaVerifier) {
        try {
          window.recaptchaVerifier.clear();
        } catch (e) {
          // ignore
        }
      }

      window.recaptchaVerifier = new RecaptchaVerifier(auth, "recaptcha-container", {
        size: "invisible",
        callback: () => {
          console.log("reCAPTCHA solved");
        },
        "expired-callback": () => {
          console.log("reCAPTCHA expired");
        },
      });
    }

    const appVerifier = window.recaptchaVerifier;
    const confirmationResult = await signInWithPhoneNumber(auth, fullPhone, appVerifier);

    // Store for verification step
    _confirmationResult = confirmationResult;

    return confirmationResult.verificationId;
  } catch (error) {
    console.error("sendOTP error:", error);
    // Reset reCAPTCHA on error
    if (window.recaptchaVerifier) {
      try {
        window.recaptchaVerifier.clear();
        window.recaptchaVerifier = null;
      } catch (e) {
        // ignore
      }
    }
    throw error;
  }
};

/**
 * Verify the OTP code
 * Uses the stored confirmationResult from sendOTP
 */
export const verifyOTP = async (verificationId, otpCode) => {
  if (DEV_MODE) {
    if (otpCode === DEV_OTP_CODE) {
      console.log("[DEV MODE] OTP verified successfully");
      return {
        uid: `dev_user_${Date.now()}`,
        phoneNumber: "+919999999999",
        isDevMode: true,
      };
    } else {
      throw new Error("Invalid OTP code. In dev mode use: " + DEV_OTP_CODE);
    }
  }

  try {
    // Use stored confirmation result
    if (_confirmationResult) {
      const result = await _confirmationResult.confirm(otpCode);
      _confirmationResult = null; // Clear after use
      return result.user;
    }
    throw new Error("No verification session found. Please request OTP again.");
  } catch (error) {
    console.error("verifyOTP error:", error);
    _confirmationResult = null;
    throw error;
  }
};

/**
 * Get the currently signed-in user
 */
export const getCurrentUser = () => {
  return auth.currentUser;
};

/**
 * Sign out the current user
 */
export const signOut = async () => {
  if (DEV_MODE) {
    console.log("[DEV MODE] User signed out");
    return;
  }
  await firebaseSignOut(auth);
};

/**
 * Listen for auth state changes
 */
export const onAuthStateChanged = (callback) => {
  if (DEV_MODE) {
    return () => {};
  }
  return firebaseOnAuthStateChanged(auth, callback);
};

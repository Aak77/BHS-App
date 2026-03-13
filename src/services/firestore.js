import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  addDoc,
  orderBy,
  limit,
  Timestamp,
} from "firebase/firestore";
import { db } from "../config/firebase";

/**
 * Create or update a user profile in Firestore
 */
export const createUserProfile = async (uid, data) => {
  const userRef = doc(db, "users", uid);
  await setDoc(
    userRef,
    {
      ...data,
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );
};

/**
 * Get a user profile from Firestore
 */
export const getUserProfile = async (uid) => {
  const userRef = doc(db, "users", uid);
  const userSnap = await getDoc(userRef);
  if (userSnap.exists()) {
    return { id: userSnap.id, ...userSnap.data() };
  }
  return null;
};

/**
 * Create a new booking
 */
export const createBooking = async (bookingData) => {
  const bookingsRef = collection(db, "bookings");
  const docRef = await addDoc(bookingsRef, {
    ...bookingData,
    status: "pending",
    createdAt: serverTimestamp(),
  });
  return docRef.id;
};

/**
 * Get bookings for a specific user (farmer)
 */
export const getUserBookings = async (uid) => {
  const bookingsRef = collection(db, "bookings");
  const q = query(bookingsRef, where("farmerId", "==", uid));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};

/**
 * Update operator profile with license details
 */
export const updateOperatorProfile = async (uid, data) => {
  const userRef = doc(db, "users", uid);
  await updateDoc(userRef, {
    ...data,
    updatedAt: serverTimestamp(),
  });
};

/**
 * Get booking stats for a farmer (total bookings, acres done)
 */
export const getBookingStats = async (uid) => {
  try {
    const bookingsRef = collection(db, "bookings");
    const q = query(bookingsRef, where("farmerId", "==", uid));
    const querySnapshot = await getDocs(q);

    let totalBookings = 0;
    let totalAcres = 0;

    querySnapshot.docs.forEach((doc) => {
      const data = doc.data();
      totalBookings++;
      totalAcres += data.acres || 0;
    });

    return { totalBookings, totalAcres };
  } catch (error) {
    console.log("Error getting booking stats:", error);
    return { totalBookings: 0, totalAcres: 0 };
  }
};

/**
 * Get bookings assigned to an operator
 */
export const getOperatorBookings = async (uid) => {
  const bookingsRef = collection(db, "bookings");
  const q = query(bookingsRef, where("operatorId", "==", uid));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};

/**
 * Get today's earnings for an operator
 */
export const getTodayEarnings = async (uid) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayTimestamp = Timestamp.fromDate(today);

    const bookingsRef = collection(db, "bookings");
    const q = query(
      bookingsRef,
      where("operatorId", "==", uid),
      where("status", "==", "completed"),
      where("completedAt", ">=", todayTimestamp)
    );
    const querySnapshot = await getDocs(q);

    let totalEarnings = 0;
    let totalJobs = 0;
    let totalAcres = 0;

    querySnapshot.docs.forEach((doc) => {
      const data = doc.data();
      totalJobs++;
      totalEarnings += data.totalPrice || 0;
      totalAcres += data.acres || 0;
    });

    return { totalEarnings, totalJobs, totalAcres };
  } catch (error) {
    console.log("Error getting today earnings:", error);
    return { totalEarnings: 0, totalJobs: 0, totalAcres: 0 };
  }
};

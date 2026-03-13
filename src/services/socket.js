import { io } from "socket.io-client";
import { DEV_MODE } from "./auth";

// Automatically use localhost for web, or your machine's local IP for iOS/Android physical devices
// When deploying to production, replace with your actual Render/Heroku backend URL
const getBackendUrl = () => {
  // Replace this with your computer's local network IP address if testing on a real phone!
  // Example: "http://192.168.1.5:3000"
  // For web development on the same machine, localhost works.
  
  // NOTE: If testing on an Android Emulator, use "http://10.0.2.2:3000"
  // If testing on an iOS Simulator, use "http://localhost:3000"
  const LOCAL_IP = "http://localhost:3000"; 
  
  // If you ever host this backend (e.g. Render, Railway, Vercel), put the URL here
  const PROD_URL = "https://your-production-url.com";
  
  return DEV_MODE ? LOCAL_IP : PROD_URL;
};

export const SOCKET_URL = getBackendUrl();

export const socket = io(SOCKET_URL, {
  autoConnect: false, // We'll connect manually when the user logs in or goes "Online"
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  reconnectionAttempts: 5,
});

/**
 * Connects the socket to the backend server
 */
export const connectSocket = () => {
  if (!socket.connected) {
    socket.connect();
    console.log("[Socket] Connecting to:", SOCKET_URL);
  }
};

/**
 * Disconnects the socket
 */
export const disconnectSocket = () => {
  if (socket.connected) {
    socket.disconnect();
    console.log("[Socket] Disconnected");
  }
};

/**
 * Fetches the current list of online operators from the backend
 */
export const fetchActiveOperators = async () => {
  try {
    const response = await fetch(`${SOCKET_URL}/active-operators`);
    const data = await response.json();
    return data.operators || [];
  } catch (error) {
    console.error("Failed to fetch active operators:", error);
    return [];
  }
};

export default socket;

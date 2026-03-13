import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import * as DocumentPicker from "expo-document-picker";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { sendOTP, DEV_MODE } from "../services/auth";

const OperatorLoginScreen = ({ navigation }) => {
  const [name, setName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [licenseNumber, setLicenseNumber] = useState("");
  const [licenseImage, setLicenseImage] = useState(null);
  const [licenseFileType, setLicenseFileType] = useState(null);
  const [licenseFileName, setLicenseFileName] = useState("");
  const [loading, setLoading] = useState(false);

  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ["image/*", "application/pdf"],
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setLicenseImage(result.assets[0].uri);
        setLicenseFileType(result.assets[0].mimeType);
        setLicenseFileName(result.assets[0].name);
      }
    } catch (error) {
      console.log("Error picking document: ", error);
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission Required",
        "Please allow camera access to take a photo of your license."
      );
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled) {
      setLicenseImage(result.assets[0].uri);
      setLicenseFileType("image");
      setLicenseFileName("camera_photo.jpg");
    }
  };

  const handleUploadPress = () => {
    Alert.alert("Upload License", "Choose an option", [
      { text: "Take Photo", onPress: takePhoto },
      { text: "Choose File (PDF/Image)", onPress: pickDocument },
      { text: "Cancel", style: "cancel" },
    ]);
  };

  const handleContinue = async () => {
    if (!name.trim()) {
      Alert.alert("Missing Info", "Please enter your name.");
      return;
    }
    if (phoneNumber.length !== 10) {
      Alert.alert("Missing Info", "Please enter a valid 10-digit phone number.");
      return;
    }
    if (!licenseNumber.trim()) {
      Alert.alert("Missing Info", "Please enter your license number.");
      return;
    }
    if (!licenseImage && !DEV_MODE) {
      Alert.alert("Missing Info", "Please upload your license image.");
      return;
    }

    setLoading(true);
    try {
      const verificationId = await sendOTP(phoneNumber);
      navigation.navigate("OTP", {
        phone: phoneNumber,
        userName: name,
        verificationId,
        role: "Operator",
        licenseNumber: licenseNumber,
        licenseImage: licenseImage,
      });
    } catch (error) {
      console.log("Error:", error);
      Alert.alert("Error", "Failed to send OTP: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const isFormValid =
    name.trim() &&
    phoneNumber.length === 10 &&
    licenseNumber.trim() &&
    (licenseImage || DEV_MODE);

  return (
    <SafeAreaView style={styles.safeArea}>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <MaterialCommunityIcons
              name="arrow-left"
              size={24}
              color="#FFFFFF"
            />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Operator Registration</Text>
          <Text style={styles.headerSubtitle}>
            Enter your details to get started
          </Text>
        </View>

        {/* Form */}
        <ScrollView
          style={styles.formContainer}
          contentContainerStyle={styles.formContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Name Field */}
          <Text style={styles.label}>Full Name</Text>
          <View style={styles.inputWrapper}>
            <MaterialCommunityIcons
              name="account-outline"
              size={22}
              color="#29563A"
              style={styles.inputIcon}
            />
            <TextInput
              style={styles.input}
              placeholder="e.g. Gurpreet Singh"
              placeholderTextColor="#999"
              value={name}
              onChangeText={setName}
            />
          </View>

          {/* Phone Number Field */}
          <Text style={styles.label}>Phone Number</Text>
          <View style={styles.inputWrapper}>
            <Text style={styles.prefix}>+91</Text>
            <TextInput
              style={styles.input}
              placeholder="9876543210"
              placeholderTextColor="#999"
              keyboardType="phone-pad"
              maxLength={10}
              value={phoneNumber}
              onChangeText={setPhoneNumber}
            />
          </View>

          {/* License Number Field */}
          <Text style={styles.label}>License Number</Text>
          <View style={styles.inputWrapper}>
            <MaterialCommunityIcons
              name="card-account-details-outline"
              size={22}
              color="#29563A"
              style={styles.inputIcon}
            />
            <TextInput
              style={styles.input}
              placeholder="e.g. DL-1420110012345"
              placeholderTextColor="#999"
              autoCapitalize="characters"
              value={licenseNumber}
              onChangeText={setLicenseNumber}
            />
          </View>

          {/* License Upload */}
          <Text style={styles.label}>
            License Upload {DEV_MODE ? "(Optional in Dev Mode)" : ""}
          </Text>
          <TouchableOpacity
            style={styles.uploadContainer}
            onPress={handleUploadPress}
            activeOpacity={0.7}
          >
            {licenseImage ? (
              <View style={styles.imagePreviewContainer}>
                {(licenseFileType && licenseFileType.includes("pdf")) ||
                (licenseFileName &&
                  licenseFileName.toLowerCase().endsWith(".pdf")) ? (
                  <View
                    style={[
                      styles.imagePreview,
                      {
                        justifyContent: "center",
                        alignItems: "center",
                        backgroundColor: "#EBF3EC",
                        borderWidth: 1,
                        borderColor: "#C8E6C9",
                      },
                    ]}
                  >
                    <MaterialCommunityIcons
                      name="file-pdf-box"
                      size={64}
                      color="#D32F2F"
                    />
                    <Text
                      style={{
                        marginTop: 12,
                        color: "#29563A",
                        fontWeight: "bold",
                        paddingHorizontal: 20,
                        textAlign: "center",
                      }}
                      numberOfLines={2}
                    >
                      {licenseFileName || "PDF Document Selected"}
                    </Text>
                  </View>
                ) : (
                  <Image
                    source={{ uri: licenseImage }}
                    style={styles.imagePreview}
                  />
                )}
                <TouchableOpacity
                  style={styles.removeImageButton}
                  onPress={() => {
                    setLicenseImage(null);
                    setLicenseFileType(null);
                    setLicenseFileName("");
                  }}
                >
                  <MaterialCommunityIcons
                    name="close-circle"
                    size={28}
                    color="#D32F2F"
                  />
                </TouchableOpacity>
                <Text style={styles.tapToChange}>Tap to change</Text>
              </View>
            ) : (
              <View style={styles.uploadPlaceholder}>
                <View style={styles.uploadIconCircle}>
                  <MaterialCommunityIcons
                    name="camera-plus-outline"
                    size={36}
                    color="#29563A"
                  />
                </View>
                <Text style={styles.uploadText}>Upload License Image</Text>
                <Text style={styles.uploadSubText}>
                  Take a photo or choose from gallery
                </Text>
              </View>
            )}
          </TouchableOpacity>

          {/* Continue Button */}
          <TouchableOpacity
            style={[
              styles.continueButton,
              (!isFormValid || loading) && styles.disabledButton,
            ]}
            onPress={handleContinue}
            disabled={!isFormValid || loading}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.continueText}>Continue →</Text>
            )}
          </TouchableOpacity>
          
          {/* Invisible ReCAPTCHA container for Web */}
          <View nativeID="recaptcha-container" />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#29563A",
  },
  container: {
    flex: 1,
  },
  header: {
    padding: 24,
    paddingTop: 16,
    paddingBottom: 30,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.15)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  headerTitle: {
    color: "#FFFFFF",
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 6,
  },
  headerSubtitle: {
    color: "#E8F5E9",
    fontSize: 16,
  },
  formContainer: {
    flex: 1,
    backgroundColor: "#F2F6F0",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
  },
  formContent: {
    padding: 24,
    paddingTop: 28,
    paddingBottom: 40,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 10,
    marginTop: 8,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 12,
    paddingHorizontal: 14,
    marginBottom: 20,
    height: 56,
  },
  inputIcon: {
    marginRight: 10,
  },
  prefix: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginRight: 8,
    paddingRight: 8,
    borderRightWidth: 1,
    borderRightColor: "#E0E0E0",
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: "#333",
    height: "100%",
  },
  uploadContainer: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1.5,
    borderColor: "#C8E6C9",
    borderRadius: 16,
    borderStyle: "dashed",
    marginBottom: 28,
    overflow: "hidden",
  },
  uploadPlaceholder: {
    alignItems: "center",
    paddingVertical: 36,
  },
  uploadIconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "#EBF3EC",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 14,
  },
  uploadText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#29563A",
    marginBottom: 4,
  },
  uploadSubText: {
    fontSize: 13,
    color: "#888",
  },
  imagePreviewContainer: {
    alignItems: "center",
    position: "relative",
  },
  imagePreview: {
    width: "100%",
    height: 200,
    borderRadius: 14,
    resizeMode: "cover",
  },
  removeImageButton: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
  },
  tapToChange: {
    fontSize: 13,
    color: "#888",
    paddingVertical: 8,
  },
  continueButton: {
    backgroundColor: "#29563A",
    padding: 18,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 4,
  },
  disabledButton: {
    backgroundColor: "#A3C4A8",
  },
  continueText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
  },
});

export default OperatorLoginScreen;

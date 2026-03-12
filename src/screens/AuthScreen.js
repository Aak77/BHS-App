import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

const BACKEND_URL = 'https://a283-114-143-61-242.ngrok-free.app/api'; // Backend URL with /api prefix for ngrok mobile testing

const AuthScreen = ({ navigation }) => {
  const [name, setName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState(1);
  const [otpRequested, setOtpRequested] = useState(false);

  const handleRequestOTP = async () => {
    if (phoneNumber.length === 10) {
      const formattedPhone = `+91${phoneNumber}`;
      try {
        const response = await fetch(`${BACKEND_URL}/auth/send-otp`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ phone: formattedPhone })
        });
        const data = await response.json();
        if (data.success) {
          setOtpRequested(true);
          setStep(2);
        } else {
          alert(data.message || 'Failed to send OTP');
        }
      } catch (err) {
        alert('Network error. Please try again.');
      }
    } else {
      alert('Please enter a valid 10-digit mobile number');
    }
  };

  const handleVerifyOTP = async () => {
    if (!name.trim()) {
      alert('Please enter your name');
      return;
    }
    if (!otp.trim() || otp.length !== 6) {
      alert('Please enter the OTP');
      return;
    }
    try {
      const formattedPhone = phoneNumber.length === 10 ? `+91${phoneNumber}` : phoneNumber;
      const response = await fetch(`${BACKEND_URL}/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: formattedPhone, otp, name })
      });
      const data = await response.json();
      if (data.success) {
        // Redirect to FarmerBookingScreen after verification
        navigation.navigate('FarmerBooking', { userName: data.user?.name || name, phone: data.user?.phone || formattedPhone });
      } else {
        alert(data.message || 'OTP verification failed');
      }
    } catch (err) {
      alert('Network error. Please try again.');
    }
  };

  const isValid = name.trim() && phoneNumber.length === 10;

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={styles.inner}>
        <Text style={styles.title}>Farmer Login</Text>
        {step === 1 ? (
          <>
            <Text style={styles.subtitle}>Enter your mobile number</Text>
            <Text style={styles.label}>Mobile Number</Text>
            <View style={styles.inputContainer}>
              <Text style={styles.prefix}>+91 </Text>
              <TextInput
                style={styles.input}
                placeholder="9876543210"
                keyboardType="phone-pad"
                maxLength={10}
                value={phoneNumber}
                onChangeText={setPhoneNumber}
              />
            </View>
            <TouchableOpacity
              style={[styles.button, phoneNumber.length !== 10 && styles.buttonDisabled]}
              onPress={handleRequestOTP}
              disabled={phoneNumber.length !== 10}
            >
              <Text style={styles.buttonText}>Request OTP</Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <Text style={styles.subtitle}>Enter your name and OTP</Text>
            <Text style={styles.label}>Full Name</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.inputFull}
                placeholder="e.g. Rajinder Singh"
                placeholderTextColor="#999"
                value={name}
                onChangeText={setName}
              />
            </View>
            <Text style={styles.label}>OTP</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="Enter OTP"
                keyboardType="number-pad"
                maxLength={6}
                value={otp}
                onChangeText={setOtp}
              />
            </View>
            <TouchableOpacity
              style={[styles.button, (!name.trim() || otp.length !== 6) && styles.buttonDisabled]}
              onPress={handleVerifyOTP}
              disabled={!name.trim() || otp.length !== 6}
            >
              <Text style={styles.buttonText}>Verify & Continue</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F1F8E9' },
  inner: { flex: 1, justifyContent: 'center', padding: 24 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#1B5E20', marginBottom: 8 },
  subtitle: { fontSize: 16, color: '#666', marginBottom: 24 },
  label: { fontSize: 15, fontWeight: '600', color: '#333', marginBottom: 8, marginTop: 4 },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#C8E6C9',
    borderRadius: 12,
    paddingHorizontal: 15,
    marginBottom: 20,
    height: 56,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
  },
  prefix: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  input: { flex: 1, fontSize: 18, height: '100%' },
  inputFull: { flex: 1, fontSize: 16, height: '100%', color: '#333' },
  button: {
    backgroundColor: '#2E7D32',
    height: 56,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
    marginTop: 8,
  },
  buttonDisabled: {
    backgroundColor: '#A5D6A7',
  },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
});

export default AuthScreen;
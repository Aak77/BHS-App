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

const AuthScreen = ({ navigation }) => {
  const [name, setName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');

  const handleSendOTP = () => {
    if (!name.trim()) {
      alert('Please enter your name');
      return;
    }
    if (phoneNumber.length === 10) {
      navigation.navigate('OTP', { phone: phoneNumber, userName: name });
    } else {
      alert('Please enter a valid 10-digit number');
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
        <Text style={styles.subtitle}>Enter your details to continue</Text>

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
          style={[styles.button, !isValid && styles.buttonDisabled]}
          onPress={handleSendOTP}
          disabled={!isValid}
        >
          <Text style={styles.buttonText}>Get OTP</Text>
        </TouchableOpacity>
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
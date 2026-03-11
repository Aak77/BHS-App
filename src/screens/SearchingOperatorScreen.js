import { MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useEffect } from 'react';
import { Animated, Easing, SafeAreaView, StyleSheet, Text, View } from 'react-native';

const SearchingOperatorScreen = ({ navigation }) => {
  const spinValue = new Animated.Value(0);

  useEffect(() => {
    // Start spinning animation
    Animated.loop(
      Animated.timing(spinValue, {
        toValue: 1,
        duration: 3000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();

    // Simulate a 3.5-second search before finding an operator
    const timer = setTimeout(() => {
      navigation.navigate('OperatorFound'); 
    }, 3500);

    return () => clearTimeout(timer);
  }, [navigation]);

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Animated.View style={{ transform: [{ rotate: spin }] }}>
          <MaterialCommunityIcons name="loading" size={80} color="#29563A" />
        </Animated.View>
        
        <Text style={styles.title}>Searching for Operators...</Text>
        <Text style={styles.subtitle}>Finding the best equipment near your location</Text>
        
        <View style={styles.radarContainer}>
           <MaterialCommunityIcons name="radar" size={120} color="#A3C4A8" style={styles.radarIcon} />
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F2F6F0', justifyContent: 'center' },
  content: { alignItems: 'center', padding: 20 },
  title: { fontSize: 22, fontWeight: 'bold', color: '#29563A', marginTop: 30 },
  subtitle: { fontSize: 16, color: '#666', textAlign: 'center', marginTop: 10, lineHeight: 24 },
  radarContainer: { marginTop: 50, opacity: 0.3 },
});

export default SearchingOperatorScreen;
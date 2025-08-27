import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function VerifySelfieScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      {/* Progress bar */}
      <View style={styles.progress}>
        <View style={[styles.step, styles.complete]} />
        <View style={[styles.step, styles.complete]} />
        <View style={[styles.step, styles.active]} />
      </View>

      {/* Icon + Text */}
      <Ionicons name="person-circle-outline" size={40} color="#3E4A5A" style={{ marginBottom: 16 }} />

      <Text style={styles.heading}>Smile, it’s time for your selfie.</Text>
      <Text style={styles.subtext}>
        In a moment, we’ll ask you to take a selfie by smiling. This will let us know it’s really you.
      </Text>

      {/* Spacer */}
      <View style={{ flex: 1 }} />

      {/* Continue Button */}
      <TouchableOpacity
        style={styles.button}
        onPress={() => router.push('/verify/verify-selfie-camera')} // or any selfie cam route
      >
        <Text style={styles.buttonText}>Continue</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFBFC',
    padding: 24,
    paddingTop: 50,
  },
  progress: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 40,
  },
  step: {
    width: 40,
    height: 6,
    borderRadius: 3,
    marginHorizontal: 6,
    backgroundColor: '#D0D7DF',
  },
  complete: {
    backgroundColor: '#2D8C4A',
  },
  active: {
    backgroundColor: '#FE712D',
  },
  heading: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#3E4A5A',
    marginBottom: 6,
  },
  subtext: {
    color: '#5B6B7F',
    fontSize: 13,
    marginBottom: 24,
  },
  button: {
    backgroundColor: '#FE712D',
    borderRadius: 6,
    paddingVertical: 14,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function VerifyStartScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      {/* Progress Indicator */}
      <View style={styles.progress}>
        <View style={[styles.step, styles.active]} />
        <View style={styles.step} />
        <View style={styles.step} />
      </View>

      {/* Shield Icon + Title */}
      <Ionicons
        name="shield-checkmark-outline"
        size={40}
        color="#3E4A5A"
        style={{ marginBottom: 16 }}
      />
      <Text style={styles.heading}>Verify your account</Text>
      <Text style={styles.subtext}>
        Please make sure your identity document is ready with you.
      </Text>

      {/* Spacer */}
      <View style={{ flex: 1 }} />

      {/* Continue Button */}
      <TouchableOpacity
        style={styles.button}
        onPress={() => router.push('/verify/verify-id')} // 👉 replace with next screen
      >
        <Text style={styles.buttonText}>Continue</Text>
      </TouchableOpacity>
    </View>
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
  active: {
    backgroundColor: '#FE712D',
  },
  heading: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#3E4A5A',
    marginBottom: 6,
  },
  subtext: {
    color: '#5B6B7F',
    fontSize: 13,
    textAlign: 'center',
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
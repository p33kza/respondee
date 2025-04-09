
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';

const { width } = Dimensions.get('window');
const ovalWidth = width * 0.6;
const ovalHeight = ovalWidth * 1.8;

export default function VerifySelfieCamera() {
  const router = useRouter();
  return (
    <View style={styles.container}>
      {/* Progress Steps */}
      <View style={styles.progress}>
        <View style={[styles.step, styles.complete]} />
        <View style={[styles.step, styles.complete]} />
        <View style={[styles.step, styles.active]} />
      </View>

      {/* Oval Frame UI */}
      <View style={styles.cameraBox}>
        <View style={styles.oval} />
        <Text style={styles.overlayText}>Place your face inside the circle</Text>
      </View>

      {/* Capture Button */}
      <TouchableOpacity
              style={styles.button}
              onPress={() => router.push('/verify/verify-status')} // or any selfie cam route
            >
              <Text style={styles.buttonText}>Capture</Text>
            </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFBFC',
    padding: 24,
  },
  progress: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 24,
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
  cameraBox: {
    flex: 1,
    borderRadius: 8,
    borderColor: '#D0D7DF',
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  oval: {
    width: ovalWidth,
    height: ovalHeight,
    borderRadius: ovalHeight / 2,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#D0D7DF',
  },
  overlayText: {
    marginTop: 8,
    color: '#3E4A5A',
    fontSize: 12,
  },
  button: {
    marginTop: 20,
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

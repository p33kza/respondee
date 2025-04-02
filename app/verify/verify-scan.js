
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function VerifyScanScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      {/* Progress bar */}
      <View style={styles.progress}>
        <View style={[styles.step, styles.active]} />
        <View style={[styles.step, styles.active]} />
        <View style={[styles.step, styles.active]} />
      </View>

      {/* Camera Icon */}
      <Ionicons name="camera-outline" size={48} color="#3E4A5A" style={{ marginBottom: 16 }} />

      {/* Title */}
      <Text style={styles.heading}>Scan your document</Text>
      <Text style={styles.subtext}>
        Make sure your selected document is visible and readable in the photo.
      </Text>

      {/* ID Scan Frame */}
      <View style={styles.scanCard}>
        <View style={styles.idFrame} />
        <Text style={styles.scanInstruction}>Move your ID inside the border.</Text>
      </View>

      {/* Spacer */}
      <View style={{ flex: 1 }} />

      {/* Actions */}
      <TouchableOpacity
        style={styles.button}
        onPress={() => router.push('/verify/verify-camera')}
      >
        <Text style={styles.buttonText}>Use Camera</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, { backgroundColor: '#ccc', marginTop: 12 }]}
        onPress={() => {}}
      >
        <Text style={[styles.buttonText, { color: '#3E4A5A' }]}>Upload from Gallery</Text>
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
    textAlign: 'center',
  },
  subtext: {
    color: '#5B6B7F',
    fontSize: 13,
    textAlign: 'center',
    marginBottom: 100,
  },
  scanCard: {
    borderWidth: 1,
    borderColor: '#D0D7DF',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    marginBottom: 24,
  },
  idFrame: {
    width: '100%',
    height: 180,
    borderWidth: 1,
    borderColor: '#D0D7DF',
    borderRadius: 8,
    marginBottom: 12,
  },
  scanInstruction: {
    fontSize: 12,
    color: '#5B6B7F',
  },
  button: {
    backgroundColor: '#FE712D',
    borderRadius: 6,
    paddingVertical: 14,
    alignItems: 'center',
  },
  buttonText: {
    fontWeight: 'bold',
    color: '#fff',
  },
});

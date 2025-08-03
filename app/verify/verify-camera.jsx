import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function VerifyPreviewScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      {/* Back Arrow */}
      <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
        <Ionicons name="arrow-back" size={20} color="#3E4A5A" />
      </TouchableOpacity>

      {/* Progress Bar */}
      <View style={styles.progress}>
        <View style={[styles.step, styles.complete]} />
        <View style={[styles.step, styles.active]} />
        <View style={styles.step} />
      </View>

      {/* Heading */}
      <Text style={styles.heading}>Check your image</Text>
      <Text style={styles.subtext}>Please make sure that the picture you took is clear and sharp.</Text>

      {/* Image Placeholder */}
      <View style={styles.imageBox} />

      {/* Buttons */}
      <View style={styles.buttonGroup}>
        <TouchableOpacity style={styles.primaryBtn} onPress={() => router.push('/verify/verify-selfie')}>
          <Text style={styles.primaryText}>Yes</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.secondaryBtn} onPress={() => router.push('/verify/verify-scan')}>
          <Text style={styles.secondaryText}>Take new photo</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFBFC',
    padding: 24,
  },
  backButton: {
    marginBottom: 8,
    alignSelf: 'flex-start',
  },
  progress: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 30,
  },
  step: {
    height: 6,
    width: 40,
    borderRadius: 3,
    marginHorizontal: 6,
    backgroundColor: '#D0D7DF',
  },
  active: {
    backgroundColor: '#FE712D',
  },
  complete: {
    backgroundColor: '#2D8C4A',
  },
  heading: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#3E4A5A',
    marginBottom: 4,
  },
  subtext: {
    color: '#5B6B7F',
    fontSize: 13,
    marginBottom: 20,
  },
  imageBox: {
    height: 150,
    borderWidth: 1,
    borderColor: '#D0D7DF',
    borderRadius: 8,
    marginBottom: 24,
  },
  buttonGroup: {
    marginTop: 'auto',
  },
  primaryBtn: {
    backgroundColor: '#FE712D',
    borderRadius: 6,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 12,
  },
  primaryText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  secondaryBtn: {
    borderColor: '#FE712D',
    borderWidth: 1,
    borderRadius: 6,
    paddingVertical: 14,
    alignItems: 'center',
  },
  secondaryText: {
    color: '#FE712D',
    fontWeight: 'bold',
  },
});
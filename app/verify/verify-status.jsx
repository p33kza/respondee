
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';

const STEP_TITLES = [
  'Photo processing',
  'Image quality checking',
  'Address verifying',
  'Finalizing the decision',
];

export default function VerifyStatusScreen() {
    const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [allComplete, setAllComplete] = useState(false);

  useEffect(() => {
    // Simulate step completion every 2 seconds
    if (currentStep < STEP_TITLES.length) {
      const timer = setTimeout(() => {
        setCurrentStep((prev) => prev + 1);
      }, 2000);
      return () => clearTimeout(timer);
    } else {
      setAllComplete(true);
    }
  }, [currentStep]);

  return (
    <SafeAreaView style={styles.container}>
      {/* Progress Bar */}
      <View style={styles.progress}>
        <View style={[styles.step, styles.complete]} />
        <View style={[styles.step, styles.complete]} />
        <View style={[styles.step, allComplete ? styles.complete : styles.active]} />
      </View>

      {/* Spinner and Title */}
      <View style={styles.loadingSection}>
        {!allComplete ? (
          <ActivityIndicator size="large" color="#3E4A5A" />
        ) : (
          <Text style={styles.checkMark}>✅</Text>
        )}
        <Text style={styles.title}>Identity verifying</Text>
        <Text style={styles.subtitle}>
          To prevent fraud on wealth, we have to collect some information to verify your identity.
        </Text>
      </View>

      {/* Checklist with animated ticks */}
      <View style={styles.steps}>
        {STEP_TITLES.map((label, index) => (
          <View key={index} style={styles.stepItem}>
            <Text style={styles.circle}>
              {index < currentStep ? '✓' : '○'}
            </Text>
            <Text style={styles.stepText}>{label}</Text>
          </View>
        ))}
      </View>

      {/* Continue Button */}
      <TouchableOpacity
        style={[styles.button, { backgroundColor: allComplete ? '#FE712D' : '#ccc' }]}
        disabled={!allComplete} onPress={() => router.push('/verify/verify-success')} // or any selfie cam route
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
    justifyContent: 'space-between',
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
  loadingSection: {
    alignItems: 'flex-start',
    marginTop: -12, // moves title upward
    marginBottom: 8, // slight spacing before the steps
  },
  
  
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#3E4A5A',
    marginTop: 16,
  },
  subtitle: {
    fontSize: 15,
    color: '#5B6B7F',
    marginTop: 4,
    marginBottom: 100,
  },
  steps: {
    gap: 12,
    marginTop: -150,
    marginBottom: 200, // 
  },
  
  stepItem: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D0D7DF',
    padding: 12,
    borderRadius: 6,
    backgroundColor: '#fff',
  },
  circle: {
    marginRight: 12,
    fontSize: 16,
    color: '#3E4A5A',
  },
  checkMark: {
    fontSize: 40,
    color: '#2D8C4A',
    marginBottom: 4, // less space below checkmark
  },
  
  
  stepText: {
    fontSize: 14,
    color: '#3E4A5A',
  },
  button: {
    paddingVertical: 14,
    borderRadius: 6,
    alignItems: 'center',
    marginTop: 16,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

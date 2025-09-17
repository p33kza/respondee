import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
  ActivityIndicator,
  StatusBar,
  Dimensions,
  Animated,
  Modal,
} from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRegister } from '../../hooks/useAuth';
import { Ionicons } from '@expo/vector-icons';
import { useSendOtpEmail } from '../../hooks/useSendOtpEmail';

const { width, height } = Dimensions.get('window');

// Normalize different error shapes (fetch/axios/react-query)
const extractError = (err) => {
  try {
    const status = err?.response?.status ?? err?.status ?? null;
    const data = err?.response?.data ?? err?.data ?? null;
    const message =
      err?.message ?? (typeof data === 'string' ? data : data?.error) ?? 'Unknown error';
    let parsed;
    if (typeof message === 'string' && message.trim().startsWith('{')) {
      try {
        parsed = JSON.parse(message);
      } catch {}
    }
    return {
      status,
      message: parsed?.message || parsed?.error || message,
      code: err?.code ?? data?.code ?? parsed?.code ?? null,
      data,
      raw: err,
    };
  } catch (e) {
    return { status: null, message: err?.message || 'Unknown error', code: null, data: null, raw: err };
  }
};



export default function OTPRegisterScreen() {
  const router = useRouter();
  const registerMutation = useRegister();
  const { sendOtpEmail } = useSendOtpEmail();

  const [otp, setOtp] = useState(Array(5).fill(''));
  const [error, setError] = useState('');
  const [storedOtp, setStoredOtp] = useState('');
  const [email, setEmail] = useState('');
  const [timer, setTimer] = useState(180);
  const [userData, setUserData] = useState(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);

  const inputs = useRef([]);
  const intervalRef = useRef(null);
  const shakeAnimation = useRef(new Animated.Value(0)).current;
  const successAnimation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [otpValue, emailValue, userDataValue] = await Promise.all([
          AsyncStorage.getItem('otp'),
          AsyncStorage.getItem('email'),
          AsyncStorage.getItem('pendingUserData'),
        ]);

        if (!otpValue || !emailValue || !userDataValue) {
          Alert.alert('Error', 'Registration data missing. Please start again.');
          router.push('/auth/register');
          return;
        }

        setStoredOtp(otpValue);
        setEmail(emailValue);
        setUserData(JSON.parse(userDataValue));
        startTimer();
      } catch (error) {
        console.error('Error fetching registration data:', error);
        Alert.alert('Error', 'Failed to load registration data. Please start again.');
        router.push('/auth/register');
      }
    };

    fetchData();
    return () => clearInterval(intervalRef.current);
  }, []);

  const startTimer = () => {
    setTimer(180);
    clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      setTimer((prev) => (prev <= 1 ? 0 : prev - 1));
    }, 1000);
  };

  const shakeOtpBoxes = () => {
    Animated.sequence([
      Animated.timing(shakeAnimation, { toValue: 10, duration: 100, useNativeDriver: true }),
      Animated.timing(shakeAnimation, { toValue: -10, duration: 100, useNativeDriver: true }),
      Animated.timing(shakeAnimation, { toValue: 10, duration: 100, useNativeDriver: true }),
      Animated.timing(shakeAnimation, { toValue: 0, duration: 100, useNativeDriver: true }),
    ]).start();
  };

  const showSuccessAnimation = () => {
    Animated.timing(successAnimation, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  };

  const handleRegisterUser = async () => {
    if (!userData) {
      Alert.alert('Error', 'User data not found. Please start registration again.');
      router.push('/auth/register');
      return;
    }

    setIsVerifying(true);
    showSuccessAnimation();

    try {
      // Prepare a safe payload (strip ImagePicker object or oversized base64)
      const buildSafeUserData = () => {
        const copy = { ...(userData || {}) };
        const gov = copy.govId;
        const isPickerAsset = gov && typeof gov === 'object' && (gov.uri || gov.assets);
        const isHugeBase64 = typeof gov === 'string' && gov.length > 2_000_000; // ~2MB
        if (isPickerAsset || isHugeBase64) {
          console.warn('[register] omitting govId from payload (non-serializable or too large)');
          delete copy.govId;
        }
        return copy;
      };

      const safeUserData = buildSafeUserData();

      // Safe log
      const { password, govId, ...rest } = userData || {};
      const govIdPreview =
        typeof govId === 'string'
          ? `${govId.slice(0, 24)}... (len=${govId.length})`
          : (govId && typeof govId === 'object'
              ? `{ ${Object.keys(govId).slice(0, 5).join(', ')}${Object.keys(govId).length > 5 ? ', ...' : ''} }`
              : typeof govId);
      console.log('[register] payload', {
        ...rest,
        password: password ? '***' : undefined,
        govId: govIdPreview,
        strippedGovId: safeUserData.govId ? false : true,
      });

      let response;
      try {
        response = await registerMutation.mutateAsync(safeUserData);
      } catch (e) {
        // If failure might be tied to govId, retry without it
        if (userData?.govId && safeUserData?.govId) {
          const retryPayload = { ...safeUserData };
          delete retryPayload.govId;
          console.warn('[register] retrying register without govId');
          response = await registerMutation.mutateAsync(retryPayload);
        } else {
          throw e;
        }
      }

      console.log('[register] success response', response);

      await AsyncStorage.multiRemove(['otp', 'email', 'pendingUserData']);

      setTimeout(() => {
        Alert.alert(
          'Welcome! 🎉',
          'Your account has been created successfully! You can now sign in.',
          [{ text: 'Sign In', onPress: () => router.push('/auth/login') }]
        );
      }, 600);
    } catch (err) {
      const norm = extractError(err);
      console.error('[register] error', norm);

      let errorMessage = 'Registration failed. Please try again.';
      if (norm.message?.includes('Network request failed')) {
        errorMessage = 'Network error. Please check your internet connection and try again.';
      } else if (
        typeof norm.message === 'string' &&
        (norm.message.includes('email-already-exists') || norm.code === 'auth/email-already-exists')
      ) {
        errorMessage = 'An account with this email already exists.';
      } else if (norm.message) {
        errorMessage = norm.message;
      }

      Alert.alert(
        'Registration Error',
        errorMessage,
        [
          { text: 'OK', onPress: () => {} },
          {
            text: 'View Details',
            onPress: () => {
              const details = {
                status: norm.status,
                code: norm.code,
                message: norm.message,
                data: typeof norm.data === 'string' ? norm.data : norm.data ? JSON.stringify(norm.data) : null,
              };
              Alert.alert('Error Details', JSON.stringify(details, null, 2), [{ text: 'OK' }]);
            },
          },
        ]
      );

      setIsVerifying(false);
    }
  };

  const handleOtpInput = (value, index) => {
    setError('');
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value !== '' && index < inputs.current.length - 1) {
      inputs.current[index + 1].focus();
    }

    const allFilled = newOtp.every((digit) => digit !== '');
    if (allFilled) {
      const enteredOtp = newOtp.join('');

      setTimeout(() => {
        if (enteredOtp === storedOtp) {
          handleRegisterUser();
        } else {
          setError('Invalid OTP. Please try again.');
          setOtp(['', '', '', '', '']);
          shakeOtpBoxes();
          setTimeout(() => inputs.current[0]?.focus(), 300);
        }
      }, 300);
    }
  };

  const handleKeyPress = (e, index) => {
    if (e.nativeEvent.key === 'Backspace' && otp[index] === '' && index > 0) {
      const newOtp = [...otp];
      newOtp[index - 1] = '';
      setOtp(newOtp);
      inputs.current[index - 1].focus();
    }
  };

  const clearOtp = () => {
    setOtp(['', '', '', '', '']);
    setError('');
    inputs.current[0]?.focus();
  };

  const resendOtp = async () => {
    if (!userData || !email) {
      Alert.alert('Error', 'Cannot resend OTP. Please start registration again.');
      return;
    }

    setIsResending(true);
    const newOtp = Math.floor(10000 + Math.random() * 90000).toString();

    try {
      const res = await sendOtpEmail(email, userData.name, newOtp);
      if (!res?.success) throw new Error(res?.error || 'Failed to send code');

      await AsyncStorage.setItem('otp', newOtp);
      setStoredOtp(newOtp);
      clearOtp();
      startTimer();
      Alert.alert('Code Sent!', res?.message || 'A new verification code has been sent to your email.');
    } catch (error) {
      Alert.alert('Error', error?.message || 'Failed to resend OTP. Please try again.');
    } finally {
      setIsResending(false);
    }
  };

  const formatTime = (seconds) => {
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    return `${min}:${sec < 10 ? '0' : ''}${sec}`;
  };

  const handleEditEmail = () => {
    Alert.alert(
      'Change Email Address',
      'To change your email address, you need to start the registration process again.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Start Over',
          style: 'destructive',
          onPress: () => {
            AsyncStorage.multiRemove(['otp', 'email', 'pendingUserData']);
            router.push('/auth/register');
          },
        },
      ]
    );
  };

  const maskedEmail = email
    ? email.length > 3
      ? email.substring(0, 3) + '***@' + email.split('@')[1]
      : email
    : 'your email';

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Background Elements */}
      <View style={styles.backgroundGradient} />
      <View style={styles.backgroundCircle1} />
      <View style={styles.backgroundCircle2} />

      {/* Header Section */}
      <View style={styles.headerSection}>
        {/* Progress Indicator */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View style={[styles.progressStep, styles.activeStep]} />
            <View style={[styles.progressStep, styles.activeStep]} />
          </View>
          <Text style={styles.progressText}>Final Step</Text>
        </View>

        {/* Logo and Title */}
        <View style={styles.logoContainer}>
          <View style={styles.logoCircle}>
            <View style={styles.checkIcon}>
              <Ionicons name="mail-outline" size={32} color="#FF9500" />
            </View>
          </View>
          <Text style={styles.title}>Complete Registration</Text>
          <Text style={styles.subtitle}>
            Enter the verification code sent to{'\n'}
            <Text style={styles.emailText}>{maskedEmail}</Text>
          </Text>
        </View>
      </View>

      {/* OTP Section */}
      <View style={styles.otpSection}>
        <View style={styles.otpHeader}>
          <Text style={styles.otpLabel}>Verification Code</Text>
          <TouchableOpacity onPress={clearOtp} activeOpacity={0.7}>
            <Text style={styles.clearButton}>Clear</Text>
          </TouchableOpacity>
        </View>

        {/* OTP Input Boxes */}
        <Animated.View style={[styles.otpContainer, { transform: [{ translateX: shakeAnimation }] }]}>
          {otp.map((digit, i) => (
            <View key={i} style={styles.otpBoxWrapper}>
              <TextInput
                ref={(ref) => (inputs.current[i] = ref)}
                maxLength={1}
                keyboardType="number-pad"
                style={[styles.otpBox, digit !== '' && styles.otpBoxFilled, error && styles.otpBoxError]}
                value={digit}
                onChangeText={(val) => handleOtpInput(val, i)}
                onKeyPress={(e) => handleKeyPress(e, i)}
                textAlign="center"
                selectionColor="#FE712D"
                editable={!isVerifying}
              />
              {digit !== '' && <View style={styles.otpBoxIndicator} />}
            </View>
          ))}
        </Animated.View>

        {/* Error Message */}
        {error ? (
          <View style={styles.errorContainer}>
            <Ionicons name="alert-circle" size={24} color="#FE712D" />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}
      </View>

      {/* Resend Section */}
      <View style={styles.resendSection}>
        <Text style={styles.resendTitle}>Didn't receive the code?</Text>
        <TouchableOpacity
          onPress={resendOtp}
          disabled={timer > 0 || isResending || isVerifying}
          activeOpacity={0.7}
          style={[styles.resendButton, (timer > 0 || isResending || isVerifying) && styles.resendButtonDisabled]}
        >
          {isResending ? (
            <View style={styles.resendLoadingContainer}>
              <ActivityIndicator size="small" color="#FE712D" />
              <Text style={styles.resendButtonText}>Sending...</Text>
            </View>
          ) : (
            <Text style={[styles.resendButtonText, timer > 0 && styles.resendButtonTextDisabled]}>
              {timer > 0 ? `Resend in ${formatTime(timer)}` : 'Resend Code'}
            </Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Info Alert */}
      <View style={styles.infoContainer}>
        <View style={styles.infoIcon}>
          <Ionicons name="information-circle" size={24} color="#FE712D" />
        </View>
        <View style={styles.infoContent}>
          <Text style={styles.infoTitle}>Please be patient</Text>
          <Text style={styles.infoText}>
            It may take up to 3 minutes for the verification code to arrive. Check your spam folder if needed.
          </Text>
        </View>
      </View>

      {/* Footer */}
      <View style={styles.footerSection}>
        <Text style={styles.footerText}>
          Wrong email address? {maskedEmail || ' '}
          <TouchableOpacity onPress={handleEditEmail} activeOpacity={0.7}>
            <Text style={styles.footerLink}>Change email</Text>
          </TouchableOpacity>
        </Text>
      </View>

      {/* Verification Modal */}
      <Modal transparent visible={isVerifying} animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Animated.View
              style={[
                styles.successIconContainer,
                {
                  transform: [
                    {
                      scale: successAnimation.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0, 1],
                      }),
                    },
                  ],
                },
              ]}
            >
              <Ionicons name="checkmark-circle" size={64} color="#FE712D" />
            </Animated.View>
            <Text style={styles.modalTitle}>Creating Your Account</Text>
            <Text style={styles.modalSubtitle}>Please wait while we set up everything for you...</Text>
            <ActivityIndicator size="large" color="#FE712D" style={styles.modalSpinner} />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  backgroundGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: height * 0.4,
    backgroundColor: '#FFF8F5',
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
  },
  backgroundCircle1: {
    position: 'absolute',
    top: -30,
    right: -30,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(254, 113, 45, 0.1)',
  },
  backgroundCircle2: {
    position: 'absolute',
    top: 60,
    left: -20,
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(254, 113, 45, 0.05)',
  },
  headerSection: { paddingHorizontal: 24, paddingTop: 20, alignItems: 'center', zIndex: 1 },
  progressContainer: { alignItems: 'center', marginBottom: 32 },
  progressBar: { flexDirection: 'row', marginBottom: 8 },
  progressStep: { height: 4, width: 40, backgroundColor: '#E5E7EB', marginHorizontal: 4, borderRadius: 2 },
  activeStep: { backgroundColor: '#FE712D' },
  progressText: { fontSize: 14, color: '#FE712D', fontWeight: '600' },
  logoContainer: { alignItems: 'center' },
  logoCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  checkIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(254, 113, 45, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: { fontSize: 28, fontWeight: '800', color: '#1F2937', marginBottom: 12, letterSpacing: -0.5 },
  subtitle: { fontSize: 16, color: '#6B7280', textAlign: 'center', lineHeight: 24 },
  emailText: { fontWeight: '600', color: '#FE712D' },
  otpSection: { paddingHorizontal: 24, paddingTop: 40, zIndex: 1 },
  otpHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  otpLabel: { fontSize: 16, fontWeight: '600', color: '#374151' },
  clearButton: { fontSize: 14, color: '#FE712D', fontWeight: '600' },
  otpContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 24 },
  otpBoxWrapper: { position: 'relative' },
  otpBox: {
    width: 56,
    height: 56,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
    backgroundColor: '#F9FAFB',
  },
  otpBoxFilled: {
    borderColor: '#FE712D',
    backgroundColor: '#FFFFFF',
    shadowColor: '#FE712D',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  otpBoxError: { borderColor: '#EF4444', backgroundColor: '#FEF2F2' },
  otpBoxIndicator: {
    position: 'absolute',
    bottom: -8,
    left: '50%',
    marginLeft: -3,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FE712D',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FEF2F2',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  errorText: { color: '#EF4444', fontSize: 14, fontWeight: '500' },
  resendSection: { paddingHorizontal: 24, paddingTop: 20, alignItems: 'center' },
  resendTitle: { fontSize: 14, color: '#6B7280', marginBottom: 12 },
  resendButton: { paddingVertical: 12, paddingHorizontal: 24, borderRadius: 8 },
  resendButtonDisabled: { opacity: 0.5 },
  resendLoadingContainer: { flexDirection: 'row', alignItems: 'center' },
  resendButtonText: { fontSize: 16, color: '#FE712D', fontWeight: '600', marginLeft: 8 },
  resendButtonTextDisabled: { color: '#9CA3AF', marginLeft: 0 },
  infoContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(254, 113, 45, 0.05)',
    marginHorizontal: 24,
    marginTop: 32,
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#FE712D',
  },
  infoIcon: { marginRight: 12 },
  infoContent: { flex: 1 },
  infoTitle: { fontSize: 14, fontWeight: '600', color: '#1F2937', marginBottom: 4 },
  infoText: { fontSize: 12, color: '#6B7280', lineHeight: 18 },
  footerSection: { flex: 1, justifyContent: 'flex-end', paddingHorizontal: 24, paddingBottom: 40 },
  footerText: { fontSize: 14, color: '#6B7280', textAlign: 'center' },
  footerLink: { color: '#FE712D', fontWeight: '600' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.6)', justifyContent: 'center', alignItems: 'center' },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 40,
    alignItems: 'center',
    minWidth: 300,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 24,
    elevation: 10,
  },
  successIconContainer: { marginBottom: 20 },
  modalTitle: { fontSize: 20, fontWeight: '700', color: '#1F2937', marginBottom: 8, textAlign: 'center' },
  modalSubtitle: { fontSize: 14, color: '#6B7280', textAlign: 'center', marginBottom: 20, lineHeight: 20 },
  modalSpinner: { marginTop: 12 },
});
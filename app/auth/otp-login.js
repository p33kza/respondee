import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  Keyboard,
  SafeAreaView,
} from 'react-native';
import { useRouter } from 'expo-router';
import logo from '../../assets/images/Logo1.png';

export default function OTPLoginScreen() {
  const router = useRouter();
  const [otp, setOtp] = useState(['', '', '', '', '']);
  const inputs = useRef([]);

  const handleOtpInput = (value, index) => {
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value !== '' && index < inputs.current.length - 1) {
      inputs.current[index + 1].focus();
    }

    const allFilled = newOtp.every((digit) => digit !== '');
    if (allFilled) {
      Keyboard.dismiss();
      setTimeout(() => router.push('/auth/mpin-login'), 300);
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
    inputs.current[0]?.focus();
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Logo */}
      <View style={styles.logoWrapper}>
      <Image source={logo} style={styles.logoCircle} />

      </View>

      {/* Progress */}
      <View style={styles.progress}>
        <View style={[styles.bar, styles.active]} />
        <View style={styles.bar} />
      </View>

      {/* Title */}
      <Text style={styles.heading}>Enter One-Time-Password</Text>
      <Text style={styles.subtext}>
        Please enter the one-time password (OTP){'\n'}
        that was sent to <Text style={styles.bold}>+639222555100</Text>
      </Text>

      {/* OTP Label + Clear */}
      <View style={styles.otpTopRow}>
        <Text style={styles.otpLabel}>OTP</Text>
        <TouchableOpacity onPress={clearOtp}>
          <Text style={styles.clear}>clear</Text>
        </TouchableOpacity>
      </View>

      {/* OTP Inputs */}
      <View style={styles.otpRow}>
        {otp.map((digit, i) => (
          <TextInput
            key={i}
            ref={(ref) => (inputs.current[i] = ref)}
            maxLength={1}
            keyboardType="number-pad"
            style={styles.otpBox}
            value={digit}
            onChangeText={(val) => handleOtpInput(val, i)}
            onKeyPress={(e) => handleKeyPress(e, i)}
          />
        ))}
      </View>

      {/* Resend */}
      <TouchableOpacity>
        <Text style={styles.resend}>Resend Code</Text>
      </TouchableOpacity>

      {/* Alert */}
      <View style={styles.alertBox}>
        <Text style={styles.alertText}>
          ⚠️ Kindly wait for at least <Text style={styles.bold}>3 minutes</Text> for the{' '}
          <Text style={styles.bold}>OTP</Text> to arrive. Sometimes, there may be delays in
          receiving it. Thank you for your patience.
        </Text>
      </View>

      {/* Spacer + Footer */}
      <View style={{ flex: 1 }} />
      <Text style={styles.edit}>
        Not <Text style={styles.bold}>+639222555100</Text>?{' '}
        <Text style={styles.editLink}>Edit mobile number here.</Text>
      </Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFBFC',
    padding: 24,
    paddingTop: 40,
  },
  logoWrapper: {
    alignItems: 'center',
    marginBottom: 16,
  },
  logoCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    // backgroundColor: '#D0D7DF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoText: {
    fontWeight: 'bold',
    color: '#3E4A5A',
  },
  progress: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 24,
  },
  bar: {
    height: 5,
    width: 40,
    backgroundColor: '#D0D7DF',
    marginHorizontal: 6,
    borderRadius: 3,
  },
  active: {
    backgroundColor: '#FF6A00',
  },
  heading: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#3E4A5A',
    marginBottom: 8,
  },
  subtext: {
    fontSize: 14,
    color: '#5B6B7F',
    marginBottom: 24,
  },
  bold: {
    fontWeight: 'bold',
    color: '#3E4A5A',
  },
  otpTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  otpLabel: {
    fontWeight: 'bold',
    color: '#3E4A5A',
  },
  clear: {
    color: '#FF6A00',
    textDecorationLine: 'underline',
  },
  otpRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  otpBox: {
    width: 50,
    height: 50,
    borderWidth: 1,
    borderColor: '#ccc',
    textAlign: 'center',
    fontSize: 18,
    borderRadius: 6,
    backgroundColor: '#fff',
    color: '#3E4A5A',
  },
  resend: {
    color: '#FF6A00',
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 24,
  },
  alertBox: {
    backgroundColor: '#FFE5DB',
    padding: 12,
    borderRadius: 6,
    borderLeftWidth: 4,
    borderLeftColor: '#FF6A00',
    marginBottom: 24,
  },
  alertText: {
    fontSize: 12,
    color: '#3E4A5A',
  },
  edit: {
    fontSize: 14,
    textAlign: 'center',
    color: '#3E4A5A',
  },
  editLink: {
    fontWeight: 'bold',
    color: '#FF6A00',
    textDecorationLine: 'underline',
  },
});
import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';

export default function OTPScreen() {
  const router = useRouter();
  const [otp, setOtp] = useState(['', '', '', '', '']);
  const inputs = useRef([]);

  const handleOtpInput = (value, index) => {
    if (value.length > 1) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value !== '' && index < inputs.current.length - 1) {
      inputs.current[index + 1].focus();
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

  useEffect(() => {
    const allFilled = otp.every((digit) => digit !== '');
    if (allFilled) {
      setTimeout(() => {
        router.push('/auth/mpin');
      }, 300);
    }
  }, [otp]);

  return (
    <View style={styles.container}>
      {/* Progress */}
      <View style={styles.progress}>
        <View style={[styles.bar, styles.complete]} />
        <View style={[styles.bar, styles.active]} />
        <View style={styles.bar} />
      </View>

      {/* Title + Subtext */}
      <Text style={styles.heading}>Enter One-Time-Password</Text>
      <Text style={styles.subText}>
        Please enter the one-time password (OTP) that was sent to{' '}
        <Text style={styles.bold}>+639222555100</Text>
      </Text>

      {/* OTP Label and Clear */}
      <View style={styles.otpTopRow}>
        <Text style={styles.otpLabel}>OTP</Text>
        <TouchableOpacity onPress={clearOtp}>
          <Text style={styles.clear}>clear</Text>
        </TouchableOpacity>
      </View>

      {/* OTP Input Boxes */}
      <View style={styles.otpRow}>
        {otp.map((digit, index) => (
          <TextInput
            key={index}
            ref={(ref) => (inputs.current[index] = ref)}
            maxLength={1}
            keyboardType="number-pad"
            style={styles.otpBox}
            value={digit}
            onChangeText={(val) => handleOtpInput(val, index)}
            onKeyPress={(e) => handleKeyPress(e, index)}
          />
        ))}
      </View>

      {/* Alert */}
      <View style={styles.alertBox}>
        <Text style={styles.alertText}>
          ⚠️ Kindly wait for at least <Text style={styles.bold}>3 minutes</Text> for the{' '}
          <Text style={styles.bold}>OTP</Text> to arrive. Sometimes, there may be delays in
          receiving it. Thank you for your patience.
        </Text>
      </View>

      {/* Spacer to push footer down */}
      <View style={{ flex: 1 }} />

      {/* Edit Mobile */}
      <Text style={styles.edit}>
        Not <Text style={styles.bold}>+639222555100</Text>?{' '}
        <Text style={styles.editLink}>Edit mobile number here.</Text>
      </Text>
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
    marginBottom: 32,
  },
  bar: {
    height: 5,
    width: 40,
    backgroundColor: '#D0D7DF',
    marginHorizontal: 6,
    borderRadius: 3,
  },
  complete: {
    backgroundColor: '#2DC4A4',
  },
  active: {
    backgroundColor: '#FF6A00',
  },
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#3E4A5A',
    marginBottom: 8,
    textAlign: 'left',
  },
  subText: {
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
    alignItems: 'center',
  },
  otpLabel: {
    fontSize: 14,
    color: '#5B6B7F',
    fontWeight: 'bold',
  },
  otpRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 16,
  },
  otpBox: {
    width: 50,
    height: 50,
    borderWidth: 1,
    borderColor: '#ccc',
    marginRight: 12,
    textAlign: 'center',
    fontSize: 18,
    borderRadius: 6,
    backgroundColor: '#fff',
    color: '#3E4A5A',
  },
  clear: {
    color: '#FF6A00',
    textDecorationLine: 'underline',
    fontSize: 13,
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
    fontSize: 14,
    color: '#3E4A5A',
    textAlign: 'center',
  },
  edit: {
    fontSize: 14,
    textAlign: 'center',
    color: '#3E4A5A',
    marginTop: 16,
  },
  editLink: {
    fontWeight: 'bold',
    color: '#FF6A00',
    textDecorationLine: 'underline',
  },
});
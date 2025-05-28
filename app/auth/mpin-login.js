import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Keyboard,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import logo from '../../assets/images/Logo1.png';

export default function MPINLoginScreen() {
  const router = useRouter();
  const [mpin, setMpin] = useState(['', '', '', '']);
  const inputs = useRef([]);

  const handleInput = (val, index) => {
    const newMpin = [...mpin];
    newMpin[index] = val;
    setMpin(newMpin);

    if (val !== '' && index < inputs.current.length - 1) {
      inputs.current[index + 1].focus();
    }

    const allFilled = newMpin.every((d) => d !== '');
    if (allFilled) {
      Keyboard.dismiss();
      setTimeout(() => router.push('/auth/welcome-back'), 300); // go to home/dashboard
    }
  };

  const handleKeyPress = (e, index) => {
    if (e.nativeEvent.key === 'Backspace' && mpin[index] === '' && index > 0) {
      const newMpin = [...mpin];
      newMpin[index - 1] = '';
      setMpin(newMpin);
      inputs.current[index - 1].focus();
    }
  };

  const clearMpin = () => {
    setMpin(['', '', '', '']);
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
        <View style={styles.barComplete} />
        <View style={styles.barActive} />
      </View>

      {/* Title + Subtext */}
      <Text style={styles.heading}>Enter your MPIN</Text>
      <Text style={styles.subtext}>Enter your 4-digit MPIN</Text>

      {/* Label + Clear */}
      <View style={styles.labelRow}>
        <Text style={styles.inputLabel}>Enter your MPIN</Text>
        <TouchableOpacity onPress={clearMpin}>
          <Text style={styles.clear}>clear</Text>
        </TouchableOpacity>
      </View>

      {/* MPIN Input */}
      <View style={styles.mpinRow}>
        {mpin.map((digit, i) => (
          <TextInput
            key={i}
            ref={(ref) => (inputs.current[i] = ref)}
            style={styles.mpinBox}
            keyboardType="number-pad"
            maxLength={1}
            value={digit}
            onChangeText={(val) => handleInput(val, i)}
            onKeyPress={(e) => handleKeyPress(e, i)}
          />
        ))}
      </View>

      {/* Footer Links */}
      <View style={styles.footer}>
        <TouchableOpacity>
          <Text style={styles.footerLink}>Help Center</Text>
        </TouchableOpacity>
        <View style={styles.dividerVertical} />
        <TouchableOpacity>
          <Text style={styles.footerLink}>Forgot MPIN?</Text>
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
    marginVertical: 16,
  },
  barComplete: {
    width: 40,
    height: 6,
    backgroundColor: '#2DC4A4',
    borderRadius: 3,
    marginHorizontal: 6,
  },
  barActive: {
    width: 40,
    height: 6,
    backgroundColor: '#FE712D',
    borderRadius: 3,
    marginHorizontal: 6,
  },
  heading: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#3E4A5A',
    textAlign: 'left',
  },
  subtext: {
    fontSize: 14,
    color: '#5B6B7F',
    marginBottom: 24,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  inputLabel: {
    fontWeight: 'bold',
    color: '#3E4A5A',
  },
  clear: {
    color: '#FE712D',
    textDecorationLine: 'underline',
  },
  mpinRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 32,
  },
  mpinBox: {
    width: 60,
    height: 60,
    backgroundColor: '#fff',
    borderRadius: 10,
    textAlign: 'center',
    fontSize: 24,
    color: '#3E4A5A',
    borderWidth: 1,
    borderColor: '#D0D7DF',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    borderTopWidth: 1,
    borderColor: '#eee',
    paddingTop: 12,
    marginTop: 'auto',
  },
  footerLink: {
    color: '#5B6B7F',
    fontSize: 14,
    marginHorizontal: 16,
  },
  dividerVertical: {
    width: 1,
    height: '100%',
    backgroundColor: '#ccc',
  },
});
import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Image,
  Keyboard,
} from 'react-native';
import { useRouter } from 'expo-router';

export default function WelcomeBackScreen() {
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

      const isVerified = false; 

      setTimeout(() => {
        router.replace(isVerified ? '/verified' : '/home');
      }, 300);
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
      {/* Top */}
      <View style={styles.top}>
        <View style={styles.logoCircle}>
          <Text style={styles.logoText}>LOGO</Text>
        </View>

        <Text style={styles.heading}>Welcome Back, name!</Text>
        <Text style={styles.subtext}>Enter your 4-digit pass code</Text>

        <View style={styles.row}>
          <Text style={styles.label}>Enter your MPIN</Text>
          <TouchableOpacity onPress={clearMpin}>
            <Text style={styles.clear}>clear</Text>
          </TouchableOpacity>
        </View>

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
      </View>

      {/* Bottom */}
      <View style={styles.bottom}>
        <Text style={styles.phoneText}>+63922***5100</Text>
        <Text style={styles.switchText}>
          Not you? <Text style={styles.switchLink}>Switch Account</Text>
        </Text>

        <Image
          source={{ uri: 'https://i.ibb.co/qdxqW3G/town-footer.png' }}
          style={styles.footerImg}
          resizeMode="contain"
        />

        <View style={styles.footerLinks}>
          <TouchableOpacity>
            <Text style={styles.footerLinkText}>Help Center</Text>
          </TouchableOpacity>
          <View style={styles.footerDivider} />
          <TouchableOpacity>
            <Text style={styles.footerLinkText}>Forgot MPIN?</Text>
          </TouchableOpacity>
        </View>
      </View>
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
  top: {
    alignItems: 'center',
  },
  logoCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#D0D7DF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  logoText: {
    fontWeight: 'bold',
    color: '#3E4A5A',
    fontSize: 16,
  },
  heading: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#3E4A5A',
    textAlign: 'center',
    marginBottom: 4,
  },
  subtext: {
    fontSize: 14,
    textAlign: 'center',
    color: '#5B6B7F',
    marginBottom: 24,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 8,
  },
  label: {
    fontWeight: 'bold',
    color: '#3E4A5A',
  },
  clear: {
    color: '#FE712D',
    textDecorationLine: 'underline',
    fontWeight: 'bold',
  },
  mpinRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
    gap: 16,
  },
  mpinBox: {
    width: 70,
    height: 70,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#D0D7DF',
    textAlign: 'center',
    fontSize: 24,
    color: '#3E4A5A',
    backgroundColor: '#fff',
  },
  bottom: {
    alignItems: 'center',
    paddingBottom: 16,
  },
  phoneText: {
    backgroundColor: '#FFE5DB',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    color: '#FE712D',
    fontWeight: '600',
    marginBottom: 6,
  },
  switchText: {
    fontSize: 13,
    color: '#3E4A5A',
    marginBottom: 12,
  },
  switchLink: {
    color: '#FE712D',
    fontWeight: 'bold',
    textDecorationLine: 'underline',
  },
  footerImg: {
    width: '100%',
    height: 110,
  },
  footerLinks: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingHorizontal: 24,
    width: '100%',
  },
  footerLinkText: {
    color: '#3E4A5A',
    fontSize: 13,
  },
  footerDivider: {
    width: 1,
    height: '100%',
    backgroundColor: '#ccc',
    marginHorizontal: 16,
    alignSelf: 'stretch',
  },
});
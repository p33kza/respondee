
import React from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Image,
  SafeAreaView,
} from 'react-native';
import { useRouter } from 'expo-router';

export default function LoginScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      {/* Top Section */}
      <View style={styles.topSection}>
        <View style={styles.logoCircle}>
          <Text style={styles.logoText}>LOGO</Text>
        </View>

        <Text style={styles.heading}>Welcome!</Text>
        <Text style={styles.subtext}>Please, enter your registered number</Text>

        {/* Phone Number Input */}
        <View style={styles.phoneInput}>
          <Image
            source={{ uri: 'https://flagcdn.com/w40/ph.png' }}
            style={{ width: 24, height: 16, marginRight: 8 }}
          />
          <Text style={{ marginRight: 8 }}>+63</Text>
          <TextInput placeholder="Phone Number" style={{ flex: 1 }} keyboardType="phone-pad" />
        </View>
      </View>

      {/* Bottom Section */}
      <View style={styles.bottomSection}>
            <TouchableOpacity style={styles.loginBtn} onPress={() => router.push('/auth/otp-login')}>
        <Text style={styles.loginText}>Login</Text>
        </TouchableOpacity>


        {/* Divider */}
        <View style={styles.divider}>
          <View style={styles.line} />
          <Text style={styles.or}>or</Text>
          <View style={styles.line} />
        </View>

        <Text style={styles.alreadyText}>Don't have an account yet?</Text>

        <TouchableOpacity style={styles.createAccountBtn} onPress={() => router.push('/auth/register')}>
          <Text style={styles.createAccountText}>Create new account</Text>
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
    paddingTop: 50,
    justifyContent: 'space-between',
  },
  topSection: {
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
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#3E4A5A',
    marginBottom: 4,
  },
  subtext: {
    fontSize: 14,
    textAlign: 'center',
    color: '#5B6B7F',
    marginBottom: 24,
  },
  phoneInput: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    padding: 12,
    backgroundColor: '#fff',
    width: '100%',
  },
  bottomSection: {
    alignItems: 'center',
  },
  loginBtn: {
    backgroundColor: '#FE712D',
    borderRadius: 6,
    paddingVertical: 14,
    alignItems: 'center',
    width: '100%',
  },
  loginText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 16,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: '#ccc',
  },
  or: {
    marginHorizontal: 8,
    color: '#999',
  },
  alreadyText: {
    textAlign: 'center',
    color: '#3E4A5A',
    marginBottom: 8,
  },
  createAccountBtn: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#FF6A00',
    borderRadius: 6,
    paddingVertical: 14,
    alignItems: 'center',
  },
  createAccountText: {
    color: '#FF6A00',
    fontWeight: 'bold',
  },
});

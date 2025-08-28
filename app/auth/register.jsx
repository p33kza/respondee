import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  SafeAreaView,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  TouchableWithoutFeedback,
  Keyboard,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useUsers } from '../../hooks/useUsers';
import { useSendOtpEmail } from '../../hooks/useSendOtpEmail';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';

const { width, height } = Dimensions.get('window');

export default function RegisterScreen() {
  const router = useRouter();
  const { sendOtpEmail } = useSendOtpEmail();
  const { data: users } = useUsers();
  const [firstName, setFirstName] = useState('');
  const [middleName, setMiddleName] = useState('');
  const [lastName, setLastName] = useState('');
  const [suffix, setSuffix] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [focusedInput, setFocusedInput] = useState('');
const [govId, setGovId] = useState(null); // store file metadata
const [govIdBase64, setGovIdBase64] = useState(null); // store converted base64
const pickGovId = async () => {
  try {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images, // you can allow pdf with DocumentPicker
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled) {
      const fileUri = result.assets[0].uri;
      setGovId(fileUri);

      // convert to base64
      const base64String = await FileSystem.readAsStringAsync(fileUri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      setGovIdBase64(base64String);
    }
  } catch (err) {
    console.error("Error picking Gov ID:", err);
  }
};
  const handleContinue = async () => {
  if (!firstName || !lastName || !email) {
    Alert.alert('Error', 'Please fill in all required fields.');
    return;
  }


  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert('Error', 'Please enter a valid email address.');
      return;
    }

    const emailExists = users?.some(user => user.email === email);
    if (emailExists) {
      Alert.alert('Error', 'This email is already registered. Please use a different email or sign in.');
      return;
    }

    if (phoneNumber) {
      const formattedPhone = `+63${phoneNumber}`;
      const phoneExists = users?.some(user => user.phone === formattedPhone);
      if (phoneExists) {
        Alert.alert('Error', 'This phone number is already registered. Please use a different number or sign in.');
        return;
      }
    }

    const name = [firstName, middleName, lastName, suffix].filter(Boolean).join(' ');
    const otp = Array.from({ length: 5 }, () => Math.floor(Math.random() * 10)).join('');
    
    setLoading(true);

    try {
  const userData = {
  email,
  password: 'QWERTYUIOP1234567890!@#$%^&*()',
  phone: phoneNumber ? `+63${phoneNumber}` : undefined,
  name,
  emailVerified: true,
  phoneVerified: false,
  role: 'user',
  userIsNew: true,
  govId: govIdBase64, // ⬅️ attach base64 here
};


      sendOtpEmail(email, name, otp);

      await AsyncStorage.setItem('otp', otp);
      await AsyncStorage.setItem('email', email);
      await AsyncStorage.setItem('pendingUserData', JSON.stringify(userData));
      
      Alert.alert(
        'OTP Sent!', 
        'Please check your email for the verification code.',
        [
          {
            text: 'OK',
            onPress: () => router.push('/auth/otp-register')
          }
        ]
      );
      
    } catch (err) {
      console.error('Error sending OTP:', err);
      Alert.alert('Error', 'Failed to send verification code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const isFormValid = firstName && lastName && email;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="always"
            nestedScrollEnabled={false}
          >
            <View style={styles.backgroundGradient} />
            <View style={styles.backgroundCircle1} />
            <View style={styles.backgroundCircle2} />

            <View style={styles.progressContainer}>
              <View style={styles.progressBar}>
                <View style={[styles.progressStep, styles.activeStep]} />
                <View style={styles.progressStep} />
              </View>
              <Text style={styles.progressText}>Step 1 of 2</Text>
            </View>

            <View style={styles.headerSection}>
              <View style={styles.titleContainer}>
                <Text style={styles.title}>Create Account</Text>
                <Text style={styles.subtitle}>Fill in your details to get started</Text>
              </View>
            </View>

            <View style={styles.formSection}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Email Address *</Text>
                <View style={[
                  styles.inputContainer,
                  focusedInput === 'email' && styles.inputContainerFocused
                ]}>
                  <Image
                    source={{ uri: 'https://img.icons8.com/ios-filled/50/000000/new-post.png' }}
                    style={[styles.inputIcon, focusedInput === 'email' && styles.inputIconFocused]}
                  />
                  <TextInput
                    placeholder="Enter your email"
                    placeholderTextColor="#9CA3AF"
                    style={styles.textInput}
                    value={email}
                    onChangeText={setEmail}
                    autoCapitalize="none"
                    keyboardType="email-address"
                    onBlur={() => setFocusedInput('')}
                  />
                </View>
              </View>
              <View style={styles.inputGroup}>
  <Text style={styles.inputLabel}>Government ID *</Text>
  <TouchableOpacity 
    style={styles.inputContainer}
    onPress={pickGovId}
  >
    <Text style={styles.uploadButtonText}>
      {govId ? "ID Selected ✅" : "Upload Government ID"}
    </Text>
  </TouchableOpacity>
</View>

              <View style={styles.nameRow}>
                <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
                  <Text style={styles.inputLabel}>First Name *</Text>
                  <View style={[
                    styles.inputContainer,
                    focusedInput === 'firstName' && styles.inputContainerFocused
                  ]}>
                    <TextInput
                      placeholder="First name"
                      placeholderTextColor="#9CA3AF"
                      style={styles.textInput}
                      value={firstName}
                      onChangeText={setFirstName}
                      onBlur={() => setFocusedInput('')}
                    />
                  </View>
                </View>

                <View style={[styles.inputGroup, { width: 80 }]}>
                  <Text style={styles.inputLabel}>Suffix</Text>
                  <View style={[
                    styles.inputContainer,
                    focusedInput === 'suffix' && styles.inputContainerFocused
                  ]}>
                    <TextInput
                      placeholder="Jr."
                      placeholderTextColor="#9CA3AF"
                      style={styles.textInput}
                      value={suffix}
                      onChangeText={setSuffix}
                      onBlur={() => setFocusedInput('')}
                    />
                  </View>
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Middle Name</Text>
                <View style={[
                  styles.inputContainer,
                  focusedInput === 'middleName' && styles.inputContainerFocused
                ]}>
                  <TextInput
                    placeholder="Middle name (optional)"
                    placeholderTextColor="#9CA3AF"
                    style={styles.textInput}
                    value={middleName}
                    onChangeText={setMiddleName}
                    onBlur={() => setFocusedInput('')}
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Last Name *</Text>
                <View style={[
                  styles.inputContainer,
                  focusedInput === 'lastName' && styles.inputContainerFocused
                ]}>
                  <TextInput
                    placeholder="Last name"
                    placeholderTextColor="#9CA3AF"
                    style={styles.textInput}
                    value={lastName}
                    onChangeText={setLastName}
                    onBlur={() => setFocusedInput('')}
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Phone Number</Text>
                <View style={[
                  styles.inputContainer,
                  focusedInput === 'phone' && styles.inputContainerFocused
                ]}>
                  <Image
                    source={{ uri: 'https://flagcdn.com/w40/ph.png' }}
                    style={styles.flagIcon}
                  />
                  <Text style={styles.countryCode}>+63</Text>
                  <TextInput
                    placeholder="9XX XXX XXXX"
                    placeholderTextColor="#9CA3AF"
                    style={[styles.textInput, { flex: 1 }]}
                    keyboardType="number-pad"
                    value={phoneNumber}
                    onChangeText={setPhoneNumber}
                    onBlur={() => setFocusedInput('')}
                  />
                </View>
              </View>

              <View style={styles.termsContainer}>
                <Text style={styles.termsText}>
                  By creating an account, you agree to our{' '}
                  <Text style={styles.termsLink}>Terms of Service</Text> and{' '}
                  <Text style={styles.termsLink}>Privacy Policy</Text>.
                </Text>
              </View>

              <TouchableOpacity
                style={[
                  styles.createButton,
                  !isFormValid && styles.createButtonDisabled
                ]}
                onPress={handleContinue}
                disabled={loading || !isFormValid}
                activeOpacity={0.8}
              >
                {loading ? (
                  <View style={styles.loadingContainer}>
                    <ActivityIndicator size="small" color="#FFFFFF" />
                    <Text style={styles.createButtonText}>Sending OTP...</Text>
                  </View>
                ) : (
                  <Text style={styles.createButtonText}>Continue</Text>
                )}
              </TouchableOpacity>
            </View>

            <View style={styles.footerSection}>
              <View style={styles.dividerContainer}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>or</Text>
                <View style={styles.dividerLine} />
              </View>

              <View style={styles.loginContainer}>
                <Text style={styles.loginText}>Already have an account? </Text>
                <TouchableOpacity
                  onPress={() => router.push('/auth/login')}
                  activeOpacity={0.7}
                >
                  <Text style={styles.loginLink}>Sign in</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF'
  },
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 40,
  },
  backgroundGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: height * 0.3,
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
  progressContainer: {
    alignItems: 'center',
    paddingTop: 20,
    paddingHorizontal: 24,
    zIndex: 1,
  },
  progressBar: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  progressStep: {
    height: 4,
    width: 40,
    backgroundColor: '#E5E7EB',
    marginHorizontal: 4,
    borderRadius: 2,
  },
  activeStep: {
    backgroundColor: '#FE712D',
  },
  progressText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  headerSection: {
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 24,
    alignItems: 'center',
    zIndex: 1,
  },
  titleContainer: {
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1F2937',
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
  },
  formSection: {
    paddingHorizontal: 24,
    zIndex: 1,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
    marginLeft: 4,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 16,
    minHeight: 52,
  },
  inputContainerFocused: {
    borderColor: '#FE712D',
    backgroundColor: '#FFFFFF',
    shadowColor: '#FE712D',
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  inputIcon: {
    width: 18,
    height: 18,
    tintColor: '#9CA3AF',
    marginRight: 12,
  },
  inputIconFocused: {
    tintColor: '#FE712D',
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: '#1F2937',
    fontWeight: '500',
  },
  eyeButton: {
    padding: 4,
  },
  eyeIcon: {
    width: 20,
    height: 20,
    tintColor: '#9CA3AF',
  },
  passwordHint: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
    marginLeft: 4,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  flagIcon: {
    width: 24,
    height: 16,
    marginRight: 8,
    borderRadius: 2,
  },
  countryCode: {
    fontSize: 16,
    color: '#1F2937',
    fontWeight: '500',
    marginRight: 12,
  },
  termsContainer: {
    marginBottom: 24,
    paddingHorizontal: 8,
  },
  termsText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
  },
  termsLink: {
    color: '#FE712D',
    fontWeight: '600',
  },
  createButton: {
    backgroundColor: '#FE712D',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 52,
    shadowColor: '#FE712D',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  createButtonDisabled: {
    backgroundColor: '#D1D5DB',
    shadowOpacity: 0,
    elevation: 0,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  createButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    marginLeft: 8,
  },
  footerSection: {
    paddingHorizontal: 24,
    paddingTop: 32,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E5E7EB',
  },
  dividerText: {
    marginHorizontal: 16,
    fontSize: 14,
    color: '#9CA3AF',
    fontWeight: '500',
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginText: {
    fontSize: 16,
    color: '#6B7280',
  },
  loginLink: {
    fontSize: 16,
    color: '#FE712D',
    fontWeight: '700',
  },
});
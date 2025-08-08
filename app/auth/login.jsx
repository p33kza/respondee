import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Image,
  SafeAreaView,
  Alert,
  ActivityIndicator,
  Modal,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  ScrollView,
  TouchableWithoutFeedback,
  Keyboard,
  BackHandler,
  ToastAndroid,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useUsers } from '../../hooks/useUsers';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSendOtpEmail } from '../../hooks/useSendOtpEmail';

const { width, height } = Dimensions.get('window');

export default function LoginScreen() {
  const router = useRouter();
  const { sendOtpEmail } = useSendOtpEmail();
  const [email, setEmail] = useState('');
  const [userId, setUserId] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [backPressCount, setBackPressCount] = useState(0);
  const { data: users, isLoading } = useUsers();

  useEffect(() => {
    if (email && users) {
      const foundUser = users.find((u) => u.email === email);
      setUserId(foundUser?.id || '');
    }
  }, [email, users]);

  useEffect(() => {
    const backAction = () => {
      if (backPressCount === 0) {
        setBackPressCount(1);
        
        if (Platform.OS === 'android') {
          ToastAndroid.show('Press back again to exit', ToastAndroid.SHORT);
        } else {
          Alert.alert('Exit App', 'Press back again to exit the app');
        }
        
        setTimeout(() => {
          setBackPressCount(0);
        }, 2000);
        
        return true; 
      } else {
        BackHandler.exitApp();
        return false;
      }
    };

    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);

    return () => backHandler.remove();
  }, [backPressCount]);

  const handleLogin = async () => {
    if (!email) {
      Alert.alert('Error', 'Please enter your email.');
      return;
    }

    if (!users || !users.some(u => u.email === email)) {
      Alert.alert('Error', 'This email is not registered. Please sign up first.');
      return;
    }

    const otp = Array.from({ length: 5 }, () => Math.floor(Math.random() * 10)).join('');
    setLoading(true);

    try {
      sendOtpEmail(email, users.find(u => u.email === email)?.displayName, otp);

      await AsyncStorage.setItem('otp', otp);
      await AsyncStorage.setItem('email', email);
      await AsyncStorage.setItem('userId', userId);
      
      router.push('/auth/otp-login');
    } catch (err) {
      Alert.alert('Error', err.message || 'Failed to send OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <KeyboardAvoidingView 
        style={styles.keyboardView} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.select({
          ios: 0,
          android: 20
        })}
      >
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
        >
          {/* Background Gradient Elements */}
          <View style={styles.backgroundGradient} />
          <View style={styles.backgroundCircle1} />
          <View style={styles.backgroundCircle2} />

          {/* Header Section */}
          <View style={styles.headerSection}>
            <View style={styles.logoContainer}>
              <View style={styles.logoCircle}>
                <Image
                  source={require('../../assets/images/Logo1.png')}
                  style={styles.logoImage}
                  resizeMode="contain"
                />
              </View>
              <Image
                source={require('../../assets/images/Logo.png')}
                style={styles.logoText}
                resizeMode="contain"
              />
            </View>

            <View style={styles.welcomeContainer}>
              <Text style={styles.welcomeTitle}>Welcome Back!</Text>
              <Text style={styles.welcomeSubtitle}>
                Sign in to continue to your account
              </Text>
            </View>
          </View>

          {/* Form Section */}
          <View style={styles.formSection}>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Email Address</Text>
              <View style={[
                styles.emailInput,
                emailFocused && styles.emailInputFocused,
                !email && styles.emailInputEmpty
              ]}>
                <View style={styles.iconContainer}>
                  <Image
                    source={{
                      uri: 'https://img.icons8.com/ios-filled/50/000000/new-post.png',
                    }}
                    style={[styles.inputIcon, emailFocused && styles.inputIconFocused]}
                  />
                </View>
                <TextInput
                  placeholder="Enter your email"
                  placeholderTextColor="#9CA3AF"
                  style={styles.textInput}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  value={email}
                  onChangeText={setEmail}
                  onBlur={() => setEmailFocused(false)}
                  returnKeyType="done"
                  blurOnSubmit={true}
                  editable={!loading}
                />
              </View>
            </View>

            <TouchableOpacity 
              style={[
                styles.loginButton,
                (!email || loading) && styles.loginButtonDisabled
              ]} 
              onPress={handleLogin} 
              disabled={isLoading || loading || !email}
              activeOpacity={0.8}
            >
              {loading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="small" color="#FFFFFF" />
                  <Text style={styles.loginButtonText}>Sending OTP...</Text>
                </View>
              ) : (
                <Text style={styles.loginButtonText}>Continue</Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Footer Section */}
          <View style={styles.footerSection}>
            <View style={styles.dividerContainer}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>or</Text>
              <View style={styles.dividerLine} />
            </View>

            <View style={styles.signupContainer}>
              <Text style={styles.signupText}>Don't have an account? </Text>
              <TouchableOpacity
                onPress={() => router.push('/auth/register')}
                activeOpacity={0.7}
              >
                <Text style={styles.signupLink}>Sign up</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>

        {/* Loading Modal */}
        <Modal transparent visible={loading} animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <ActivityIndicator size="large" color="#FE712D" />
              <Text style={styles.modalText}>Sending verification code...</Text>
              <Text style={styles.modalSubtext}>Please wait a moment</Text>
            </View>
          </View>
        </Modal>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    minHeight: height,
    paddingBottom: 20,
  },
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
    top: -50,
    right: -50,
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: 'rgba(254, 113, 45, 0.1)',
  },
  backgroundCircle2: {
    position: 'absolute',
    top: 80,
    left: -30,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(254, 113, 45, 0.05)',
  },
  headerSection: {
    paddingHorizontal: 24,
    paddingTop: 40,
    alignItems: 'center',
    zIndex: 1,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logoCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  logoImage: {
    width: 60,
    height: 60,
  },
  logoText: {
    width: 200,
    height: 45,
  },
  welcomeContainer: {
    alignItems: 'center',
  },
  welcomeTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: '#1F2937',
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
  },
  formSection: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 48,
    justifyContent: 'flex-start',
  },
  inputContainer: {
    marginBottom: 32,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
    marginLeft: 4,
  },
  emailInput: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: Platform.OS === 'ios' ? 16 : 12,
    minHeight: 56,
  },
  emailInputFocused: {
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
  emailInputEmpty: {
    borderColor: '#E5E7EB',
  },
  iconContainer: {
    marginRight: 12,
  },
  inputIcon: {
    width: 20,
    height: 20,
    tintColor: '#9CA3AF',
  },
  inputIconFocused: {
    tintColor: '#FE712D',
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: '#1F2937',
    fontWeight: '500',
    padding: 0,
    margin: 0,
    includeFontPadding: false,
  },
  loginButton: {
    backgroundColor: '#FE712D',
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 56,
    shadowColor: '#FE712D',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  loginButtonDisabled: {
    backgroundColor: '#D1D5DB',
    shadowOpacity: 0,
    elevation: 0,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    marginLeft: 8,
  },
  footerSection: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 32,
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
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  signupText: {
    fontSize: 16,
    color: '#6B7280',
  },
  signupLink: {
    fontSize: 16,
    color: '#FE712D',
    fontWeight: '700',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    minWidth: 280,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.25,
    shadowRadius: 24,
    elevation: 10,
  },
  modalText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginTop: 16,
    textAlign: 'center',
  },
  modalSubtext: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 8,
    textAlign: 'center',
  },
});
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
} from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRegister } from '../../hooks/useAuth';

export default function OTPRegisterScreen() {
    const router = useRouter();
    const registerMutation = useRegister();
    const [otp, setOtp] = useState(Array(5).fill(''));
    const [error, setError] = useState('');
    const [storedOtp, setStoredOtp] = useState('');
    const [email, setEmail] = useState('');
    const [timer, setTimer] = useState(180);
    const [userData, setUserData] = useState(null);
    const [isVerifying, setIsVerifying] = useState(false);
    const inputs = useRef([]);
    const intervalRef = useRef(null);

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

    const handleRegisterUser = async () => {
        if (!userData) {
        Alert.alert('Error', 'User data not found. Please start registration again.');
        router.push('/auth/register');
        return;
        }

        setIsVerifying(true);
        try {
        await registerMutation.mutateAsync(userData);
        
        await AsyncStorage.multiRemove(['otp', 'email', 'pendingUserData']);
        
        Alert.alert(
            'Success!', 
            'Your account has been created successfully!',
            [{ text: 'OK', onPress: () => router.push('/auth/login') }]
        );
        } catch (err) {
        console.error('Registration error:', err);
        let errorMessage = 'Registration failed. Please try again.';
        
        if (err?.response?.data?.error?.includes('email-already-exists')) {
            errorMessage = 'An account with this email already exists.';
        } else if (err?.response?.data?.error) {
            errorMessage = err.response.data.error;
        }
        
        Alert.alert('Error', errorMessage);
        } finally {
        setIsVerifying(false);
        }
    };

    const handleOtpInput = (value, index) => {
        setError('');
        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);

        // Auto-focus next input
        if (value !== '' && index < inputs.current.length - 1) {
        inputs.current[index + 1].focus();
        }

        // Check if all fields are filled
        const allFilled = newOtp.every((digit) => digit !== '');
        if (allFilled) {
        const enteredOtp = newOtp.join('');
        if (enteredOtp === storedOtp) {
            handleRegisterUser();
        } else {
            setError('Invalid OTP. Please try again.');
            setOtp(['', '', '', '', '']);
            inputs.current[0]?.focus();
        }
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

        const newOtp = Math.floor(10000 + Math.random() * 90000).toString();
        
        try {
        // Send new OTP email
        await fetch('https://innovatechservicesph.com/api/email', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
            api_key: 'A0466E9D-FC3A-4B94-9DB4-1ADBB7F41AAD',
            smtp_host: 'smtp.hostinger.com',
            smtp_port: 587,
            smtp_user: 'support@tcuregistrarrequest.site',
            smtp_password: '#228JyiuS',
            use_tls: true,
            to_email: email,
            to_name: userData.displayName,
            from_name: 'Respondee',
            subject: 'Your New OTP Code',
            body: `<p>Hello ${userData.displayName},</p><p>Your new OTP code is: <b>${newOtp}</b></p>`,
            }),
        });

        await AsyncStorage.setItem('otp', newOtp);
        setStoredOtp(newOtp);
        clearOtp();
        startTimer();
        Alert.alert('Success', 'New OTP has been sent to your email.');
        } catch (error) {
        Alert.alert('Error', 'Failed to resend OTP. Please try again.');
        }
    };

    const formatTime = (seconds) => {
        const min = Math.floor(seconds / 60);
        const sec = seconds % 60;
        return `${min}:${sec < 10 ? '0' : ''}${sec}`;
    };

    const handleEditEmail = () => {
        Alert.alert(
        'Edit Email',
        'To change your email address, you need to start the registration process again.',
        [
            { text: 'Cancel', style: 'cancel' },
            { 
            text: 'Start Over', 
            onPress: () => {
                AsyncStorage.multiRemove(['otp', 'email', 'pendingUserData']);
                router.push('/auth/register');
            }
            }
        ]
        );
    };

    if (isVerifying) {
        return (
        <SafeAreaView style={[styles.container, styles.centerContent]}>
            <ActivityIndicator size="large" color="#FF6A00" />
            <Text style={styles.verifyingText}>Creating your account...</Text>
        </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
        {/* Logo */}
        <View style={styles.logoWrapper}>
            <View style={styles.logoCircle}>
            <Text style={styles.logoText}>LOGO</Text>
            </View>
        </View>

        {/* Progress */}
        <View style={styles.progress}>
            <View style={[styles.bar, styles.active]} />
            <View style={[styles.bar, styles.active]} />
            <View style={styles.bar} />
        </View>

        {/* Title */}
        <Text style={styles.heading}>Verify Your Email</Text>
        <Text style={styles.subtext}>
            Please enter the one-time password (OTP){'\n'}
            that was sent to <Text style={styles.bold}>{email || 'your email'}</Text>
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
                editable={!isVerifying}
            />
            ))}
        </View>

        {/* Error Message */}
        {error ? (
            <Text style={styles.errorText}>{error}</Text>
        ) : null}

        {/* Resend */}
        <TouchableOpacity 
            onPress={resendOtp} 
            disabled={timer > 0 || isVerifying}
        >
            <Text
            style={[
                styles.resend,
                { color: (timer > 0 || isVerifying) ? '#ccc' : '#FF6A00' },
            ]}
            >
            {timer > 0 ? `Resend Code in ${formatTime(timer)}` : 'Resend Code'}
            </Text>
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
            Not <Text style={styles.bold}>{email || 'your email'}</Text>?{' '}
            <TouchableOpacity onPress={handleEditEmail}>
            <Text style={styles.editLink}>Edit email here.</Text>
            </TouchableOpacity>
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
    centerContent: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    logoWrapper: {
        alignItems: 'center',
        marginBottom: 16,
    },
    logoCircle: {
        width: 70,
        height: 70,
        borderRadius: 35,
        backgroundColor: '#D0D7DF',
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
    errorText: {
        color: 'red',
        textAlign: 'center',
        marginBottom: 10,
        fontSize: 14,
    },
    resend: {
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
    verifyingText: {
        marginTop: 16,
        fontSize: 16,
        color: '#3E4A5A',
        textAlign: 'center',
    },
});
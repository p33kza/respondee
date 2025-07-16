import { useState } from 'react'
import { View, Text, TextInput, StyleSheet, Pressable, TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '../../lib/supabase';
import logo from '../../assets/images/Logo1.png'; // Adjust the path as necessary

export default function RegisterScreen() {
    const router = useRouter();
    const [firstName, setFirstName] = useState('');
    const [middleName, setMiddleName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [message, setMessage] = useState('');
  return (
    
    <View style={styles.container}>
      {/* Top Progress Indicator */}
      <View style={styles.progress}>
        <View style={[styles.step, styles.active]} />
        <View style={styles.step} />
        <View style={styles.step} />
      </View>
    
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Let’s Get Started!</Text>
        <Image source={logo} style={styles.logoCircle} />

      </View>

      {/* Input Fields */}
      <View style={styles.row}>
        <TextInput
          placeholder="First Name"
          style={[styles.input, { flex: 1 }]}
          value={firstName}
          onChangeText={setFirstName}
        />
        <TextInput
          placeholder="Suffix"
          style={[styles.input, { width: 80, marginLeft: 8 }]}
          // Optional: you can use a `suffix` state too if you want to capture it
        />
      </View>
      <TextInput
        placeholder="Middle Name (optional)"
        style={styles.input}
        value={middleName}
        onChangeText={setMiddleName}
      />
      <TextInput
        placeholder="Last Name"
        style={styles.input}
        value={lastName}
        onChangeText={setLastName}
      />

      {/* Phone Number Field */}
      <View style={styles.phoneInputContainer}>
        <Text style={styles.flag}>🇵🇭</Text>
        <Text style={styles.prefix}>+63</Text>
        <TextInput
          placeholder="9123456789"
          keyboardType="number-pad"
          maxLength={10}
          style={styles.phoneInput}
          value={phoneNumber}
          onChangeText={(text) => {
            // Allow only digits, and must start with 9
            if (/^[0-9]{0,10}$/.test(text)) setPhoneNumber(text);
          }}
        />
      </View>

      {/* Terms Text */}
      <Text style={styles.terms}>
        By tapping <Text style={styles.bold}>Create new account</Text>, you agree with the{' '}
        <Text style={styles.link}>Terms and Conditions</Text> and{' '}
        <Text style={styles.link}>Privacy Policy</Text>.
        </Text>

        <TouchableOpacity
          style={styles.createBtn}
          onPress={async () => {
            const fullPhone = `+63${phoneNumber}`;
            if (!/^9\d{9}$/.test(phoneNumber)) {
              setMessage('Please enter a valid 10-digit PH mobile number starting with 9');
              return;
            }

            try {
              const { error } = await supabase.auth.signInWithOtp({
                phone: fullPhone,
                options: {
                  shouldCreateUser: true,
                },
              });

              if (error) throw error;

              router.push({
                pathname: '/auth/otp',
                params: { phone: fullPhone },
              });
            } catch (err) {
              console.error('Failed to send OTP:', err);
              setMessage('Failed to send OTP. Please try again.');
            }
          }}
        >
          <Text style={styles.createBtnText}>Create new account</Text>
        </TouchableOpacity>

        {message !== '' && (
          <Text style={{ color: 'red', textAlign: 'center', marginTop: 8 }}>{message}</Text>
        )}

        <View style={{ flex: 1 }} />
        
      {/* Divider */}
      <View style={styles.bottom}></View>
        <View style={styles.divider}>
        <View style={styles.line} />
        <Text style={styles.or}>or</Text>
        <View style={styles.line} />
      </View>
      
      <Text style={styles.alreadyText}>Already have an account?</Text>
      {/* Login Link */}
      <Pressable onPress={() => router.push('/auth/login')}>
  <Text style={styles.login}>Login here</Text>
</Pressable>

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
      marginBottom: 16,
    },
    step: {
      height: 5,
      width: 40,
      backgroundColor: '#d3d3d3',
      marginHorizontal: 6,
      borderRadius: 3,
    },
    active: {
      backgroundColor: '#FF6A00',
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 20,
    },
    title: {
        fontSize: 26,              // slightly bigger
        fontWeight: 'bold',
        color: '#3E4A5A',
        flex: 1,
      },
    
    logoCircle: {
      width: 60,
      height: 60,
      // borderRadius: 30,
      // borderWidth: 1,
      // borderColor: '#999',
      justifyContent: 'center',
      alignItems: 'center',
    },
    logoText: {
      fontSize: 12,
    },
    input: {
      borderWidth: 1,
      borderColor: '#ccc',
      padding: 12,
      borderRadius: 6,
      marginBottom: 12,
      backgroundColor: '#fff',
    },
    row: {
      flexDirection: 'row',
      marginBottom: 12,
    },
    phoneInput: {
      flexDirection: 'row',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: '#ccc',
      borderRadius: 6,
      padding: 12,
      marginBottom: 16,
      backgroundColor: '#fff',
    },
    terms: {
        fontSize: 12,
        color: '#555',
        textAlign: 'center',       // center the terms text
        marginTop: 24,
        marginBottom: 24,
        lineHeight: 18,
      },
      
    bold: {
      fontWeight: 'bold',
    },
    link: {
      color: '#FF6A00',
      textDecorationLine: 'underline',
    },
    createBtn: {
        backgroundColor: '#FF6A00',
        paddingVertical: 14,
        borderRadius: 6,
        alignItems: 'center',
        marginBottom: 32,          // adds breathing room below
      },
    
      createBtnText: {
        color: '#fff',
        fontWeight: 'bold',
      },
      divider: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
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
      
      login: {
        textAlign: 'center',
        color: '#FF6A00',
        textDecorationLine: 'underline',
        fontWeight: 'bold',
        paddingVertical: 12,
        borderWidth: 1,
        borderColor: '#FF6A00',
        borderRadius: 6,
      },
      bottom: {
        alignItems: 'center',
        paddingBottom: 24,
      },
      
      alreadyText: {
        fontSize: 14,
        color: '#3E4A5A',
        marginBottom: 8,
        textAlign: 'center', // ✅ this centers the text
      },
      
      
      login: {
        textAlign: 'center',
        color: '#FF6A00',
        fontWeight: 'bold',
        paddingVertical: 12,
        paddingHorizontal: 32,
        borderWidth: 1,
        borderColor: '#FF6A00',
        borderRadius: 6,
      },

      phoneInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 6,
        paddingHorizontal: 12,
        paddingVertical: 10,
        backgroundColor: '#fff',
        marginBottom: 16,
      },
      
      flag: {
        fontSize: 20,
        marginRight: 6,
      },
      
      prefix: {
        fontSize: 16,
        color: '#333',
        marginRight: 6,
      },
      
      phoneInput: {
        flex: 1,
        fontSize: 16,
        color: '#000',
      },      
      
  });
  
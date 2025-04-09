
import { View, Text, TextInput, StyleSheet, Pressable, TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';

export default function RegisterScreen() {
    const router = useRouter();
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
        <View style={styles.logoCircle}>
          <Text style={styles.logoText}>LOGO</Text>
        </View>
      </View>

      {/* Input Fields */}
      <View style={styles.row}>
        <TextInput placeholder="First Name" style={[styles.input, { flex: 1 }]} />
        <TextInput placeholder="Suffix" style={[styles.input, { width: 80, marginLeft: 8 }]} />
      </View>
      <TextInput placeholder="Middle Name (optional)" style={styles.input} />
      <TextInput placeholder="Last Name" style={styles.input} />

      {/* Phone Number Field */}
      <View style={styles.phoneInput}>
        <Image
          source={{ uri: 'https://flagcdn.com/w40/ph.png' }}
          style={{ width: 24, height: 16, marginRight: 8 }}
        />
        <Text style={{ marginRight: 8 }}>+63</Text>
        <TextInput
          placeholder="Phone Number"
          keyboardType="number-pad"
          style={{ flex: 1 }}
        />
      </View>

      {/* Terms Text */}
      <Text style={styles.terms}>
        By tapping <Text style={styles.bold}>Create new account</Text>, you agree with the{' '}
        <Text style={styles.link}>Terms and Conditions</Text> and{' '}
        <Text style={styles.link}>Privacy Policy</Text>.
        </Text>

        <TouchableOpacity style={styles.createBtn} onPress={() => router.push('/auth/otp')}>
        <Text style={styles.createBtnText}>Create new account</Text>
        </TouchableOpacity>

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
      borderRadius: 30,
      borderWidth: 1,
      borderColor: '#999',
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
      
  });
  
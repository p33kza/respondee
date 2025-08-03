import { View, Text, StyleSheet, Image, TouchableOpacity, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';

export default function SuccessScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      {/* Checkmark Image */}
      <Image
        source={{
          uri: 'https://img.icons8.com/fluency-systems-filled/96/2DC4A4/checkmark.png', // ✅ replace with your asset if needed
        }}
        style={styles.checkIcon}
      />

      {/* Title */}
      <Text style={styles.title}>Congratulations!</Text>
      <Text style={styles.subtitle}>You have successfully created your account.</Text>

      {/* Spacer */}
      <View style={{ flex: 1 }} />

      {/* Okay Button */}
      <TouchableOpacity style={styles.okayButton} onPress={() => router.replace('/auth/register')}>
        <Text style={styles.okayText}>Okay</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#FFFBFC',
      padding: 24,
      alignItems: 'center',
      paddingTop: 100,
    },
    checkIcon: {
      width: 100,
      height: 100,
      marginBottom: 32,
    },
    title: {
      fontSize: 24,
      fontWeight: 'bold',
      color: '#3E4A5A',
      marginBottom: 8,
    },
    subtitle: {
      fontSize: 14,
      color: '#5B6B7F',
      textAlign: 'center',
      marginHorizontal: 20,
    },
    okayButton: {
      backgroundColor: '#FE712D',
      width: '100%',
      paddingVertical: 16,
      borderRadius: 8,
      marginTop: 40,
    },
    okayText: {
      color: '#fff',
      textAlign: 'center',
      fontWeight: 'bold',
      fontSize: 16,
    },
  });
  
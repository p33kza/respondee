import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
// import 'react-native-reanimated';


export default function WelcomeScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      {/* Title */}
      <Text style={styles.welcome}>Welcome!</Text>

      {/* Logo Section */}
      <View style={styles.logoContainer}>
        <Image
          source={require('../assets/images/Logo1.png')} // speaker icon
          style={styles.logoIcon}
        />
        <Image
          source={require('../assets/images/Logo.png')} // respondee logo
          style={styles.logoText}
        />
      </View>


      {/* Get Started Button */}
      <TouchableOpacity
        style={styles.button}
        onPress={() => router.push('/auth/register')}
      >
        <Text style={styles.buttonText}>Get Started</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFBFC',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 60,
    paddingHorizontal: 24,
  },
  welcome: {
    fontSize: 32,
    fontWeight: '600',
    color: '#FE712D',
    marginTop: -20,
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  logoIcon: {
    width: 100,
    height: 100,
    marginBottom: 12,
    resizeMode: 'contain',
  },
  logoText: {
    width: 160,
    height: 40,
    resizeMode: 'contain',
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 16,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#D0D7DF',
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: '#0077C8',
  },
  button: {
    backgroundColor: '#FE712D',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 10,
    alignItems: 'center',
    alignSelf: 'stretch',
    marginTop: 50,
    marginBottom: -45,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

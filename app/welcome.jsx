import React from 'react';
import { Image, SafeAreaView, StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';

export default function Welcome() {
  const router = useRouter();
  
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.welcome}>Welcome!</Text>
      
      <View style={styles.logoContainer}>
        <Image
          source={require('../assets/images/Logo1.png')}
          style={styles.logoIcon}
        />
        <Image
          source={require('../assets/images/Logo.png')} 
          style={styles.logoText}
        />
      </View>
  
      <TouchableOpacity
        style={styles.button}
        onPress={() => router.push('/auth/login')}
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
    textAlign: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
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
  button: {
    backgroundColor: '#FE712D',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 10,
    alignItems: 'center',
    alignSelf: 'stretch',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { useStoredUser } from '../hooks/useStoredUser';
import AsyncStorage from '@react-native-async-storage/async-storage';
import SplashScreen from '../components/SplashScreen';

export default function IndexScreen() {
  const [isLoading, setIsLoading] = useState(true);
  const [showSplash, setShowSplash] = useState(true);
  const user = useStoredUser();
  const router = useRouter();

  useEffect(() => {
    const splashTimer = setTimeout(() => {
      setShowSplash(false);
    }, 3000);

    return () => clearTimeout(splashTimer);
  }, []);

  useEffect(() => {
    if (showSplash) return;

    const checkAuthState = async () => {
      try {
        const isFirstLaunch = await AsyncStorage.getItem('@app_launched_before');
        
        if (!isFirstLaunch) {
          await AsyncStorage.setItem('@app_launched_before', 'true');
          router.replace('/welcome');
          return;
        }

        if (user) {
          router.replace('/home');
        } else {
          router.replace('/auth/login');
        }
      } catch (error) {
        console.error('Error checking auth state:', error);
        router.replace('/auth/login');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthState();
  }, [user, showSplash, router]);

  if (showSplash) {
    return <SplashScreen />;
  }

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <ActivityIndicator size="large" />
    </View>
  );
}
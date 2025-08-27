import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const useStoredUser = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const stored = await AsyncStorage.getItem('user');
        setUser(stored ? JSON.parse(stored) : null);
      } catch (err) {
        console.error('Failed to load user:', err);
        setUser(null);
      }
    };
    fetchUser();
  }, []);

  return user;
};

import { useState, useEffect } from 'react';

export const useLocalStorageUser = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const getStoredUser = useCallback(() => {
    try {
      const stored = localStorage.getItem("user");
      return stored ? JSON.parse(stored) : null;
    } catch (err) {
      setError(err);
      return null;
    }
  }, []);

  const setStoredUser = useCallback((userData) => {
    try {
      localStorage.setItem("user", JSON.stringify(userData));
      setUser(userData);
    } catch (err) {
      setError(err);
    }
  }, []);

  const clearStoredUser = useCallback(() => {
    try {
      localStorage.removeItem("user");
      setUser(null);
    } catch (err) {
      setError(err);
    }
  }, []);

  useEffect(() => {
    const storedUser = getStoredUser();
    setUser(storedUser);
    setLoading(false);
  }, [getStoredUser]);

  return {
    user,
    loading,
    error,
    getStoredUser,
    setStoredUser,
    clearStoredUser,
  };
};
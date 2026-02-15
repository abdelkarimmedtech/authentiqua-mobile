import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as authService from '../services/authService';

export const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [userToken, setUserToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const restore = async () => {
      try {
        const token = await AsyncStorage.getItem('@auth_token');
        setUserToken(token);
      } catch (e) {
        console.warn('Failed to restore token', e);
      } finally {
        setLoading(false);
      }
    };
    restore();
  }, []);

  const signIn = async (email, password) => {
    const res = await authService.signIn(email, password);
    if (res?.token) {
      setUserToken(res.token);
      await AsyncStorage.setItem('@auth_token', res.token);
      return { ok: true };
    }
    return { ok: false, message: res?.message };
  };

  const signUp = async (email, password) => {
    const res = await authService.signUp(email, password);
    if (res?.token) {
      setUserToken(res.token);
      await AsyncStorage.setItem('@auth_token', res.token);
      return { ok: true };
    }
    return { ok: false, message: res?.message };
  };

  const signOut = async () => {
    await authService.signOut();
    setUserToken(null);
    await AsyncStorage.removeItem('@auth_token');
  };

  return (
    <AuthContext.Provider value={{ userToken, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

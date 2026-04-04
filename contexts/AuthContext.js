import React, { createContext, useState, useEffect, useContext } from 'react';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase, SUPABASE_AUTH_STORAGE_KEY } from '../config/supabase';

// Web platformu için güvenli import
let WebBrowser = null;
let Linking = null;

if (Platform.OS !== 'web') {
  try {
    WebBrowser = require('expo-web-browser');
    Linking = require('expo-linking');
    WebBrowser.maybeCompleteAuthSession();
  } catch (e) {
    console.warn('Expo auth packages not available.');
  }
}

const extractTokensFromCallbackUrl = (callbackUrl) => {
  if (typeof callbackUrl !== 'string' || !callbackUrl.includes('#')) {
    return { accessToken: null, refreshToken: null };
  }

  const hash = callbackUrl.split('#')[1] || '';
  const params = new URLSearchParams(hash);

  return {
    accessToken: params.get('access_token'),
    refreshToken: params.get('refresh_token'),
  };
};

const AuthContext = createContext({});

const clearStoredSession = async () => {
  if (Platform.OS === 'web') {
    if (typeof window !== 'undefined') {
      window.localStorage?.removeItem(SUPABASE_AUTH_STORAGE_KEY);
      window.sessionStorage?.removeItem(SUPABASE_AUTH_STORAGE_KEY);
    }
    return;
  }

  await AsyncStorage.removeItem(SUPABASE_AUTH_STORAGE_KEY);
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  const cleanupWebCallbackUrl = () => {
    if (Platform.OS !== 'web' || typeof window === 'undefined') {
      return;
    }

    const isAuthCallbackPath = window.location.pathname === '/auth/callback';
    const hasAuthHash =
      window.location.hash.includes('access_token') ||
      window.location.hash.includes('refresh_token') ||
      window.location.hash.includes('error');

    if (isAuthCallbackPath || hasAuthHash) {
      window.history.replaceState({}, document.title, '/');
    }
  };

  useEffect(() => {
    let isMounted = true;

    const initializeAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();

        if (error) {
          throw error;
        }

        if (!isMounted) {
          return;
        }

        setSession(session);
        setUser(session?.user ?? null);

        if (session) {
          cleanupWebCallbackUrl();
        }
      } catch (error) {
        await clearStoredSession();

        if (isMounted) {
          setSession(null);
          setUser(null);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    initializeAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!isMounted) {
        return;
      }

      setSession(session);
      setUser(session?.user ?? null);

      if (session) {
        cleanupWebCallbackUrl();
      } else {
        await clearStoredSession();
      }

      setLoading(false);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signInWithGoogle = async () => {
    try {
      // Web platformunda doğrudan yönlendirme
      if (Platform.OS === 'web') {
        const { data, error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: `${window.location.origin}/auth/callback`,
          },
        });

        if (error) throw error;
        
        // Web'de doğrudan yönlendirme yapılacak
        if (data?.url) {
          window.location.href = data.url;
        }
        return;
      }

      // Native platformda WebBrowser kullan
      if (!Linking || !WebBrowser) {
        throw new Error('Native auth packages not available');
      }

      const redirectUrl = Linking.createURL('auth/callback');
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
          skipBrowserRedirect: false,
        },
      });

      if (error) throw error;

      if (data?.url) {
        const result = await WebBrowser.openAuthSessionAsync(
          data.url,
          redirectUrl
        );

        if (result.type === 'success') {
          const { accessToken, refreshToken } = extractTokensFromCallbackUrl(result.url);

          if (accessToken && refreshToken) {
            await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken,
            });
          } else {
            throw new Error('Google oturum bilgisi alınamadı');
          }
        } else if (result.type === 'cancel') {
          throw new Error('Google girişi iptal edildi');
        } else {
          throw new Error('Google girişi başarısız oldu');
        }
      }
    } catch (error) {
      console.error('Error signing in with Google:', error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut({ scope: 'local' });

      if (error) {
        throw error;
      }

      await clearStoredSession();

      setUser(null);
      setSession(null);

      if (Platform.OS === 'web' && typeof window !== 'undefined') {
        window.localStorage?.removeItem(SUPABASE_AUTH_STORAGE_KEY);
        window.sessionStorage?.removeItem(SUPABASE_AUTH_STORAGE_KEY);
        window.history.replaceState({}, document.title, '/');
      }
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  };

  const value = {
    user,
    session,
    loading,
    signInWithGoogle,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

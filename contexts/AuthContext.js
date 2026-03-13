import React, { createContext, useState, useEffect, useContext } from 'react';
import { Platform } from 'react-native';
import { supabase } from '../config/supabase';

// Web platformu için güvenli import
let WebBrowser = null;
let Linking = null;

if (Platform.OS !== 'web') {
  try {
    WebBrowser = require('expo-web-browser');
    Linking = require('expo-linking');
    WebBrowser.maybeCompleteAuthSession();
  } catch (e) {
    console.warn('Expo packages not available:', e);
  }
}

const AuthContext = createContext({});

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
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session) {
        cleanupWebCallbackUrl();
      }
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session) {
        cleanupWebCallbackUrl();
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
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
          const url = result.url;
          const params = new URLSearchParams(url.split('#')[1]);
          const accessToken = params.get('access_token');
          const refreshToken = params.get('refresh_token');

          if (accessToken && refreshToken) {
            await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken,
            });
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
      await supabase.auth.signOut();
      setUser(null);
      setSession(null);
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  };

  // Local test login - development only
  const signInTestUser = async () => {
    const mockUser = {
      id: 'test-user-123',
      email: 'test@example.com',
      user_metadata: {
        full_name: 'Test Kullanıcı',
        avatar_url: null,
      },
      created_at: new Date().toISOString(),
    };
    
    setUser(mockUser);
    setSession({ user: mockUser });
  };

  const value = {
    user,
    session,
    loading,
    signInWithGoogle,
    signInTestUser,
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

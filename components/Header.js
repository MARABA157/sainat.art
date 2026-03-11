import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';

export default function Header({ onMenuPress, onNewChat, onProfilePress, onLoginPress, t, theme }) {
  const { user, signInWithGoogle } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    try {
      setLoading(true);
      await signInWithGoogle();
    } catch (error) {
      Alert.alert(t.auth?.signInError || 'Giriş Hatası', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.headerBackground, borderBottomColor: theme.headerBorder }]}>
      <TouchableOpacity style={styles.menuButton} onPress={onMenuPress}>
        <Ionicons name="menu" size={24} color={theme.headerIcon} />
      </TouchableOpacity>

      <View style={styles.titleContainer}>
        <Text style={[styles.title, { color: theme.headerText }]}>{t.headerTitle}</Text>
      </View>

      <View style={styles.actions}>
        {user ? (
          <TouchableOpacity style={styles.profileButton} onPress={onProfilePress}>
            {user.user_metadata?.avatar_url ? (
              <Image
                source={{ uri: user.user_metadata.avatar_url }}
                style={styles.avatar}
              />
            ) : (
              <View style={[styles.avatarPlaceholder, { backgroundColor: theme.paletteAccent || '#10A37F' }]}>
                <Text style={styles.avatarText}>
                  {user.email?.charAt(0).toUpperCase() || 'U'}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[
              styles.loginButton,
              {
                backgroundColor: '#10A37F',
              },
            ]}
            onPress={onLoginPress || handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <>
                <Ionicons name="log-in-outline" size={16} color="#FFFFFF" style={styles.loginButtonIcon} />
                <Text style={styles.loginButtonText}>{t.login}</Text>
              </>
            )}
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#343541',
    borderBottomWidth: 1,
    borderBottomColor: '#4D4D4F',
  },
  menuButton: {
    padding: 8,
  },
  titleContainer: {
    flex: 1,
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  loginButton: {
    height: 36,
    paddingHorizontal: 16,
    borderRadius: 18,
    borderWidth: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#10A37F',
    shadowOpacity: 0.28,
    shadowRadius: 10,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    elevation: 4,
  },
  loginButtonIcon: {
    marginRight: 6,
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  profileButton: {
    padding: 4,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  avatarPlaceholder: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  SafeAreaView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';

export default function LoginScreen({ onClose }) {
  const { signInWithGoogle, loading } = useAuth();

  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle();
      onClose?.();
    } catch (error) {
      console.error('Google sign-in error:', error);
      let errorMessage = 'Google ile giriş yapılırken bir hata oluştu.';
      
      if (error.message?.includes('cancel')) {
        errorMessage = 'Google girişi iptal edildi.';
      } else if (error.message?.includes('network')) {
        errorMessage = 'İnternet bağlantısı hatatı. Lütfen bağlantınızı kontrol edin.';
      } else if (error.message?.includes('popup')) {
        errorMessage = 'Google popup penceresi açılamadı. Lütfen tarayıcı ayarlarınızı kontrol edin.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      Alert.alert('Giriş Hatası', errorMessage);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity style={styles.closeButton} onPress={onClose}>
        <Ionicons name="close" size={28} color="#666" />
      </TouchableOpacity>
      <View style={styles.content}>
        <View style={styles.logoContainer}>
          <View style={styles.logoPlaceholder}>
            <Ionicons name="chatbubbles" size={64} color="#10A37F" />
          </View>
          <Text style={styles.title}>sainat.art</Text>
          <Text style={styles.subtitle}>Yapay Zeka Sohbet Asistanı</Text>
        </View>

        <View style={styles.featuresContainer}>
          <View style={styles.featureItem}>
            <Ionicons name="flash" size={24} color="#10A37F" />
            <Text style={styles.featureText}>Hızlı ve Akıllı Yanıtlar</Text>
          </View>
          <View style={styles.featureItem}>
            <Ionicons name="shield-checkmark" size={24} color="#10A37F" />
            <Text style={styles.featureText}>Güvenli ve Özel</Text>
          </View>
          <View style={styles.featureItem}>
            <Ionicons name="sync" size={24} color="#10A37F" />
            <Text style={styles.featureText}>Tüm Cihazlarda Senkronize</Text>
          </View>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.googleButton}
            onPress={handleGoogleSignIn}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Ionicons name="logo-google" size={24} color="#fff" />
                <Text style={styles.googleButtonText}>
                  Google ile Devam Et
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        <Text style={styles.termsText}>
          Giriş yaparak hizmet koşullarını ve gizlilik politikasını kabul etmiş olursunuz.
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    padding: 8,
    zIndex: 10,
  },
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 48,
  },
  logoPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 24,
    backgroundColor: '#E6F4FE',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  featuresContainer: {
    width: '100%',
    marginBottom: 48,
    gap: 16,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
  },
  featureText: {
    fontSize: 15,
    color: '#333',
    fontWeight: '500',
  },
  buttonContainer: {
    width: '100%',
    marginBottom: 24,
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#10A37F',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 12,
  },
  googleButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  termsText: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
    paddingHorizontal: 32,
  },
});

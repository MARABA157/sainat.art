import React from 'react';
import './LoginScreen.css';
import { useAuth } from '../contexts/AuthContext';

export default function LoginScreen({ onClose }) {
  const { signInWithGoogle, signInTestUser, loading } = useAuth();

  const handleTestSignIn = async () => {
    try {
      await signInTestUser();
      onClose?.();
    } catch (error) {
      alert('Test girişi yapılırken bir sorun oluştu.');
    }
  };

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
      
      alert('Giriş Hatası: ' + errorMessage);
    }
  };

  return (
    <div className="login-container">
      <button className="close-button" onClick={onClose}>×</button>
      <div className="login-content">
        <div className="logo-container">
          <div className="logo-placeholder">
            <span className="logo-icon">💬</span>
          </div>
          <h1 className="title">sainat.art</h1>
          <p className="subtitle">Yapay Zeka Sohbet Asistanı</p>
        </div>

        <div className="features-container">
          <div className="feature-item">
            <span className="feature-icon">⚡</span>
            <span className="feature-text">Hızlı ve Akıllı Yanıtlar</span>
          </div>
          <div className="feature-item">
            <span className="feature-icon">🛡️</span>
            <span className="feature-text">Güvenli ve Özel</span>
          </div>
          <div className="feature-item">
            <span className="feature-icon">🔄</span>
            <span className="feature-text">Tüm Cihazlarda Senkronize</span>
          </div>
        </div>

        <div className="button-container">
          <button
            className="google-button"
            onClick={handleGoogleSignIn}
            disabled={loading}
          >
            {loading ? (
              <span className="loading">Yükleniyor...</span>
            ) : (
              <>
                <span className="google-icon">G</span>
                <span className="google-button-text">
                  Google ile Devam Et
                </span>
              </>
            )}
          </button>

          <button
            className="test-button"
            onPress={handleTestSignIn}
            disabled={loading}
          >
            <span className="test-icon">🧪</span>
            <span className="test-button-text">
              Test Kullanıcısı ile Giriş (Dev)
            </span>
          </button>
        </div>

        <p className="terms-text">
          Giriş yaparak hizmet koşullarını ve gizlilik politikasını kabul etmiş olursunuz.
        </p>
      </div>
    </div>
  );
}

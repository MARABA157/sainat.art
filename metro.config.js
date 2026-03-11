const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Web platformunda sorun yaratan paketleri exclude et
config.resolver.platforms = ['ios', 'android', 'native', 'web'];

// Native modüllerin web'de sorun çıkarmaması için
config.resolver.alias = {
  'expo-web-browser': false,
  'expo-linking': false,
  'expo-auth-session': false,
  'expo-crypto': false,
};

// Web platformunda platform-specific dosyaları önceliklendir
config.resolver.platformFiles = {
  ...config.resolver.platformFiles,
  web: ['web.js', 'web.jsx', 'web.ts', 'web.tsx', 'js', 'jsx', 'ts', 'tsx', 'json'],
};

module.exports = config;

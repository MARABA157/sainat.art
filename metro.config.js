const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Support all platforms
config.resolver.platforms = ['ios', 'android', 'native', 'web'];

// Ensure Metro can resolve web-specific files
config.resolver.sourceExts = [
  ...config.resolver.sourceExts,
  'web.js',
  'web.jsx',
  'web.ts',
  'web.tsx',
];

module.exports = config;

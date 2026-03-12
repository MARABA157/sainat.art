import { registerRootComponent } from 'expo';
import * as Linking from 'expo-linking';

import App from './App';

// Linking configuration for OAuth callbacks
const linking = {
  prefixes: [Linking.createURL('/')],
  config: {
    screens: {
      'auth/callback': {
        path: 'auth/callback',
      },
    },
  },
};

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(App, { linking });

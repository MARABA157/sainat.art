import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey =
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || process.env.REACT_APP_SUPABASE_ANON_KEY;
const projectRef = supabaseUrl ? new URL(supabaseUrl).hostname.split('.')[0] : 'sainat';
export const SUPABASE_AUTH_STORAGE_KEY = `sb-${projectRef}-auth-token`;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: Platform.OS === 'web' ? undefined : AsyncStorage,
    storageKey: SUPABASE_AUTH_STORAGE_KEY,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: Platform.OS === 'web',
    flowType: 'pkce',
  },
});

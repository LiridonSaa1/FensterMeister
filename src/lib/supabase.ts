import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Retrieve credentials from Vite env or fallback window/localStorage
const getSupabaseUrl = (): string => {
  if (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_URL) {
    return import.meta.env.VITE_SUPABASE_URL;
  }
  return localStorage.getItem('apex_supabase_url') || '';
};

const getSupabaseAnonKey = (): string => {
  if (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_ANON_KEY) {
    return import.meta.env.VITE_SUPABASE_ANON_KEY;
  }
  return localStorage.getItem('apex_supabase_anon_key') || '';
};

export const isSupabaseConfigured = (): boolean => {
  const url = getSupabaseUrl();
  const key = getSupabaseAnonKey();
  return Boolean(url && key && url.startsWith('http') && key.length > 20);
};

let cachedClient: SupabaseClient | null = null;
let cachedUrl = '';
let cachedKey = '';

export const getSupabaseClient = (): SupabaseClient | null => {
  const url = getSupabaseUrl();
  const key = getSupabaseAnonKey();
  if (!url || !key || !url.startsWith('http') || key.length <= 20) {
    cachedClient = null;
    cachedUrl = '';
    cachedKey = '';
    return null;
  }

  if (cachedClient && cachedUrl === url && cachedKey === key) {
    return cachedClient;
  }

  try {
    cachedClient = createClient(url, key, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    });
    cachedUrl = url;
    cachedKey = key;
    return cachedClient;
  } catch (e) {
    console.warn('[Supabase] Failed to initialize Supabase client:', e);
    cachedClient = null;
    cachedUrl = '';
    cachedKey = '';
    return null;
  }
};

export const supabase = getSupabaseClient();

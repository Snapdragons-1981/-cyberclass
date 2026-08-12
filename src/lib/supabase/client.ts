import { createClient as createSupabaseClient } from '@supabase/supabase-js';

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('Supabase URL and anon key are not set. Using demo mode.');
    return createSupabaseClient('https://placeholder.supabase.co', 'placeholder-key');
  }

  return createSupabaseClient(supabaseUrl, supabaseAnonKey);
}

export const supabase = typeof window !== 'undefined' 
  ? (() => {
      const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      if (!url || !key) return null;
      return createSupabaseClient(url, key);
    })()
  : null;

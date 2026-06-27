import { createClient } from '@supabase/supabase-js';

// Vite reads hidden credentials from your .env file using import.meta.env
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// A safety check in your console to make sure your .env file is being read correctly
if (!supabaseUrl || !supabaseAnonKey) {
  console.error("⚠️ Setup Error: Supabase environment variables are missing in your .env file!");
}

export const supabase = createClient(
  supabaseUrl || '', 
  supabaseAnonKey || '',
  {
    auth: {
      storage: window.sessionStorage, // 🔥 Keeps each tab's login session completely isolated
      autoRefreshToken: true,
      persistSession: true
    }
  }
);
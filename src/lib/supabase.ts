import { createClient } from '@supabase/supabase-js';

// Public keys — safe to include in source (anon key is a publishable key)
const supabaseUrl =
  import.meta.env.VITE_SUPABASE_URL as string ||
  'https://owmgcguwmqdxerorgzje.supabase.co';

const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY as string ||
  'sb_publishable_1gLOmZn2nkwpMnmVR36Q0g_1XxPBmH0';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

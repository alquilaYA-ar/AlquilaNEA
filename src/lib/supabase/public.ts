import { createClient } from '@supabase/supabase-js';

/**
 * Cliente Supabase para lecturas públicas (sin cookies).
 * Útil dentro de unstable_cache porque no accede a headers/cookies.
 * Respeta RLS con la anon key.
 */
export function createPublicClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!url || !key) {
    throw new Error('Faltan variables de entorno de Supabase (NEXT_PUBLIC_SUPABASE_URL o NEXT_PUBLIC_SUPABASE_ANON_KEY)');
  }

  return createClient(url, key, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

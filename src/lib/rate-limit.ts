import { headers } from 'next/headers';
import { createClient } from '@/lib/supabase/server';

type Supabase = Awaited<ReturnType<typeof createClient>>;

export async function getClientIp(): Promise<string> {
  try {
    const h = await headers();
    const fwd = h.get('x-forwarded-for');
    if (fwd) return fwd.split(',')[0].trim().slice(0, 64);
    return (h.get('x-real-ip') || 'unknown').slice(0, 64);
  } catch {
    return 'unknown';
  }
}

/**
 * Devuelve true si la acción está permitida. Si la función SQL aún no existe
 * (no se ejecutó rate_limit.sql) o falla, NO bloquea al usuario (fail-open).
 */
export async function rateLimit(
  supabase: Supabase,
  key: string,
  max: number,
  windowSeconds: number
): Promise<boolean> {
  try {
    const { data, error } = await supabase.rpc('check_rate_limit', {
      p_key: key,
      p_max: max,
      p_window_seconds: windowSeconds,
    });
    if (error) {
      console.warn('rateLimit unavailable:', error.message);
      return true;
    }
    return data !== false;
  } catch {
    return true;
  }
}

export const TOO_MANY_REQUESTS = 'Demasiados intentos. Esperá unos minutos y volvé a intentar.';

/**
 * Fail-closed: si la función SQL no existe o falla, bloquea la acción.
 * Usar para operaciones críticas (especialmente panel de administración).
 */
export async function rateLimitStrict(
  supabase: Supabase,
  key: string,
  max: number,
  windowSeconds: number
): Promise<boolean> {
  try {
    const { data, error } = await supabase.rpc('check_rate_limit', {
      p_key: key,
      p_max: max,
      p_window_seconds: windowSeconds,
    });
    if (error) {
      console.error('rateLimitStrict error:', error.message);
      return false;
    }
    return data !== false;
  } catch (err) {
    console.error('rateLimitStrict exception:', err);
    return false;
  }
}

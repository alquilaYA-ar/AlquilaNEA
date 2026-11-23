import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { type EmailOtpType } from '@supabase/supabase-js';
import { getSiteUrl } from '@/lib/utils';

// Whitelist de rutas internas permitidas después del callback de auth.
// Evita open-redirect si un atacante manipula el parámetro ?next=.
const ALLOWED_REDIRECT_PATHS = new Set([
  '/',
  '/admin',
  '/mis-publicaciones',
  '/mi-cuenta',
  '/publicar',
  '/nueva-clave',
  '/propiedades',
  '/contacto',
]);

function isAllowedRedirect(path: string): boolean {
  if (!path.startsWith('/') || path.startsWith('//')) return false;
  // Permitir subrutas de las rutas en whitelist (ej. /mis-publicaciones/editar/xxx)
  for (const allowed of ALLOWED_REDIRECT_PATHS) {
    if (path === allowed || path.startsWith(`${allowed}/`)) return true;
  }
  return false;
}

function isTrustedOrigin(origin: string): boolean {
  // En desarrollo permitimos cualquier origin para no romper localhost
  if (process.env.NODE_ENV === 'development') return true;
  const siteUrl = getSiteUrl();
  return origin === siteUrl;
}

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const token_hash = searchParams.get('token_hash');
  const type = searchParams.get('type') as EmailOtpType | null;
  const rawNext = searchParams.get('next') ?? '/mis-publicaciones';
  const next = isAllowedRedirect(rawNext) ? rawNext : '/mis-publicaciones';

  if (!isTrustedOrigin(origin)) {
    return NextResponse.redirect(`${getSiteUrl()}/login?error=origin_invalido`);
  }

  const supabase = await createClient();

  const getDestination = async (fallback: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return fallback;

      const { data: profile } = await supabase
        .from('profiles')
        .select('es_admin, tipo_anunciante')
        .eq('id', user.id)
        .single();

      if (profile && (profile.es_admin === true || (profile.tipo_anunciante as string) === 'admin')) {
        return '/admin';
      }
    } catch (err) {
      console.error('Error resolving user role in callback:', err);
    }
    // Un usuario no-admin nunca debe terminar en /admin ni en rutas externas
    if (!fallback.startsWith('/') || fallback.startsWith('//') || fallback.startsWith('/admin')) {
      return '/mis-publicaciones';
    }
    return fallback;
  };

  // 1. Soporte para flujo PKCE (con parámetro ?code=...)
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error && next === '/nueva-clave') {
      return NextResponse.redirect(`${origin}/nueva-clave`);
    }
    if (!error) {
      const destination = await getDestination(next);
      return NextResponse.redirect(`${origin}${destination}`);
    }
    console.error('Error exchanging code for session:', error.message);
  }

  // 2. Soporte para flujo Token Hash / OTP (con parámetros ?token_hash=...&type=...)
  if (token_hash && type) {
    const { error } = await supabase.auth.verifyOtp({
      type,
      token_hash,
    });
    if (!error && type === 'recovery') {
      // Recuperación de contraseña: ir directo a elegir la nueva clave
      return NextResponse.redirect(`${origin}/nueva-clave`);
    }
    if (!error) {
      const destination = await getDestination(next);
      return NextResponse.redirect(`${origin}${destination}`);
    }
    console.error('Error verifying OTP token_hash:', error.message);
  }

  // 3. Si ya hay una sesión activa, simplemente redirigir a destino
  const { data: { user } } = await supabase.auth.getUser();
  if (user) {
    const destination = await getDestination(next);
    return NextResponse.redirect(`${origin}${destination}`);
  }

  // Si falló el código o expiró, redirigir al login con mensaje amigable
  return NextResponse.redirect(`${origin}/login?verified=true`);
}

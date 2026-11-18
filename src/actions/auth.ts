'use server';

import { createClient } from '@/lib/supabase/server';
import { Profile } from '@/types/database';
import { revalidatePath } from 'next/cache';
import { getSiteUrl } from '@/lib/utils';
import { getClientIp, rateLimit, TOO_MANY_REQUESTS } from '@/lib/rate-limit';
import { signUpSchema, signInSchema, emailSchema, passwordSchema, firstZodError } from '@/lib/validations/auth';

export interface SignUpInput {
  email: string;
  password: string;
  nombreCompleto: string;
  whatsapp: string;
  tipoAnunciante: 'dueno_directo' | 'inmobiliaria';
  nombreInmobiliaria?: string;
  matriculaInmobiliaria?: string;
  telefono?: string;
}

export async function signUp(rawInput: SignUpInput) {
  try {
    const parsed = signUpSchema.safeParse(rawInput);
    if (!parsed.success) {
      return { success: false, error: firstZodError(parsed.error) };
    }
    const input = parsed.data;

    const supabase = await createClient();
    const siteUrl = getSiteUrl();

    const ip = await getClientIp();
    if (!(await rateLimit(supabase, `signup:ip:${ip}`, 5, 3600))) {
      return { success: false, error: TOO_MANY_REQUESTS };
    }

    const { data, error } = await supabase.auth.signUp({
      email: input.email,
      password: input.password,
      options: {
        emailRedirectTo: `${siteUrl}/auth/callback?next=/mis-publicaciones`,
        data: {
          nombre_completo: input.nombreCompleto,
          whatsapp: input.whatsapp,
          tipo_anunciante: input.tipoAnunciante,
          nombre_inmobiliaria: input.nombreInmobiliaria || null,
          matricula_inmobiliaria: input.matriculaInmobiliaria || null,
          telefono: input.telefono || null,
        },
      },
    });

    if (error) {
      return { success: false, error: error.message };
    }

    // Si Supabase tiene verificación de correo activada, session será null hasta que confirme
    const requiresVerification = !data.session;

    // El perfil lo crea el trigger handle_new_user de la base de datos (con rol validado).

    revalidatePath('/', 'layout');
    return {
      success: true,
      user: data.user,
      session: data.session,
      requiresVerification,
      email: input.email,
    };
  } catch (err: any) {
    return { success: false, error: err.message || 'Error inesperado al registrar usuario.' };
  }
}

export async function signIn(rawEmail: string, rawPassword: string) {
  try {
    const parsedIn = signInSchema.safeParse({ email: rawEmail, password: rawPassword });
    if (!parsedIn.success) {
      return { success: false, error: firstZodError(parsedIn.error), isAdmin: false };
    }
    const { email, password } = parsedIn.data;

    const supabase = await createClient();

    // Anti fuerza bruta: por IP (20 / 15 min) y por correo (6 / 15 min)
    const ip = await getClientIp();
    const okIp = await rateLimit(supabase, `login:ip:${ip}`, 20, 900);
    const okEmail = await rateLimit(supabase, `login:email:${email}`, 6, 900);
    if (!okIp || !okEmail) {
      return { success: false, error: TOO_MANY_REQUESTS, isAdmin: false };
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return { success: false, error: error.message, isAdmin: false };
    }

    let isAdmin = false;
    const { data: profile } = await supabase
      .from('profiles')
      .select('es_admin, tipo_anunciante, suspendido')
      .eq('id', data.user.id)
      .single();

    if (profile?.suspendido) {
      await supabase.auth.signOut();
      return { success: false, error: 'Tu cuenta está suspendida. Contactá a soporte.', isAdmin: false };
    }
    if (profile && (profile.es_admin === true || (profile.tipo_anunciante as string) === 'admin')) {
      isAdmin = true;
    }

    revalidatePath('/', 'layout');
    return { success: true, user: data.user, isAdmin };
  } catch (err: any) {
    return { success: false, error: err.message || 'Error al iniciar sesión.' };
  }
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath('/', 'layout');
}

export async function getCurrentUser(): Promise<{ user: any; profile: Profile | null }> {
  try {
    const supabase = await createClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return { user: null, profile: null };
    }

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) {
      // Perfil de respaldo desde la metadata si aún no se sincronizó
      const fallbackProfile: Profile = {
        id: user.id,
        nombre_completo: user.user_metadata?.nombre_completo || 'Usuario',
        whatsapp: user.user_metadata?.whatsapp || '',
        email_contacto: user.email || '',
        tipo_anunciante: user.user_metadata?.tipo_anunciante || 'dueno_directo',
        nombre_inmobiliaria: user.user_metadata?.nombre_inmobiliaria || null,
        matricula_inmobiliaria: user.user_metadata?.matricula_inmobiliaria || null,
        telefono: user.user_metadata?.telefono || null,
        created_at: user.created_at,
        updated_at: user.updated_at || user.created_at,
      };
      return { user, profile: fallbackProfile };
    }

    return { user, profile: profile as Profile };
  } catch (err) {
    console.error('getCurrentUser error:', err);
    return { user: null, profile: null };
  }
}


export async function requestPasswordReset(rawEmail: string) {
  try {
    const parsed = emailSchema.safeParse(rawEmail);
    if (!parsed.success) {
      return { success: false, error: firstZodError(parsed.error) };
    }
    const supabase = await createClient();
    const siteUrl = getSiteUrl();
    const ip = await getClientIp();
    if (!(await rateLimit(supabase, `reset:ip:${ip}`, 5, 3600)) || !(await rateLimit(supabase, `reset:email:${parsed.data}`, 3, 3600))) {
      return { success: false, error: TOO_MANY_REQUESTS };
    }
    // Respuesta siempre genérica: no revelamos si el correo existe o no (anti-enumeración)
    await supabase.auth.resetPasswordForEmail(parsed.data, {
      redirectTo: `${siteUrl}/auth/callback?next=/nueva-clave`,
    });
    return { success: true };
  } catch (err) {
    console.error('requestPasswordReset error:', err);
    return { success: true };
  }
}

export async function updatePassword(rawPassword: string) {
  try {
    const parsed = passwordSchema.safeParse(rawPassword);
    if (!parsed.success) {
      return { success: false, error: firstZodError(parsed.error) };
    }
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: 'El enlace expiró. Solicitá uno nuevo.' };
    }
    const { error } = await supabase.auth.updateUser({ password: parsed.data });
    if (error) {
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'No se pudo actualizar la contraseña.' };
  }
}

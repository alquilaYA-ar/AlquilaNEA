'use server';

import { createClient } from '@/lib/supabase/server';
import { Profile } from '@/types/database';
import { revalidatePath } from 'next/cache';
import { getSiteUrl } from '@/lib/utils';

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

export async function signUp(input: SignUpInput) {
  try {
    const supabase = await createClient();
    const siteUrl = getSiteUrl();

    const { data, error } = await supabase.auth.signUp({
      email: input.email,
      password: input.password,
      options: {
        emailRedirectTo: `${siteUrl}/auth/callback?next=/publicar`,
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

    // Asegurar que el perfil quede insertado/actualizado en public.profiles
    if (data.user) {
      const { error: profileError } = await supabase.from('profiles').upsert({
        id: data.user.id,
        nombre_completo: input.nombreCompleto,
        whatsapp: input.whatsapp,
        email_contacto: input.email,
        tipo_anunciante: input.tipoAnunciante,
        nombre_inmobiliaria: input.nombreInmobiliaria || null,
        matricula_inmobiliaria: input.matriculaInmobiliaria || null,
        telefono: input.telefono || null,
      });

      if (profileError) {
        console.error('Error al asegurar perfil:', profileError);
      }
    }

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

export async function signIn(email: string, password: string) {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return { success: false, error: error.message };
    }

    let isAdmin = false;
    if (data.user.email?.toLowerCase() === 'gonza18av@gmail.com') {
      isAdmin = true;
    } else {
      const { data: profile } = await supabase
        .from('profiles')
        .select('es_admin, tipo_anunciante')
        .eq('id', data.user.id)
        .single();

      if (profile && (profile.es_admin === true || (profile.tipo_anunciante as string) === 'admin')) {
        isAdmin = true;
      }
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


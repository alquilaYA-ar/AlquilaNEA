'use server';

import { createClient } from '@/lib/supabase/server';
import { contactMessageSchema, firstZodError } from '@/lib/validations/auth';
import { getClientIp, rateLimit, TOO_MANY_REQUESTS } from '@/lib/rate-limit';

export async function submitContactMessage(raw: unknown) {
  try {
    const parsed = contactMessageSchema.safeParse(raw);
    if (!parsed.success) {
      return { success: false, error: firstZodError(parsed.error) };
    }

    const { website, ...data } = parsed.data;
    // Honeypot: si un bot completó el campo oculto, respondemos "éxito" sin guardar nada
    if (website) {
      return { success: true };
    }

    const supabase = await createClient();
    const ip = await getClientIp();
    if (!(await rateLimit(supabase, `contact:ip:${ip}`, 5, 3600))) {
      return { success: false, error: TOO_MANY_REQUESTS };
    }
    const { data: { user } } = await supabase.auth.getUser();

    const { error } = await supabase.from('mensajes_contacto').insert({
      nombre: data.nombre,
      email: data.email,
      telefono: data.telefono || null,
      motivo: data.motivo,
      mensaje: data.mensaje,
      user_id: user?.id ?? null,
    });

    if (error) {
      console.error('submitContactMessage error:', error.message);
      return { success: false, error: 'No pudimos enviar tu mensaje. Intentá nuevamente en unos minutos.' };
    }

    return { success: true };
  } catch (err) {
    console.error('submitContactMessage unexpected error:', err);
    return { success: false, error: 'Ocurrió un error inesperado. Intentá nuevamente.' };
  }
}

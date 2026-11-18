'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { removeStorageFilesByUrls, removeUserStorageFolder } from '@/lib/storage-cleanup';

export interface AdminStats {
  totalUsers: number;
  duenosCount: number;
  inmobiliariasCount: number;
  totalProperties: number;
  activeProperties: number;
  pausedProperties: number;
  rentedProperties: number;
  totalVisits: number;
  averagePrice: number;
  provinciasStats: {
    nombre: string;
    count: number;
    percentage: number;
  }[];
  topLocalidades: {
    nombre: string;
    provincia: string;
    count: number;
  }[];
  topBarrios: {
    nombre: string;
    count: number;
  }[];
  users: {
    id: string;
    nombre_completo: string;
    nombre_inmobiliaria: string | null;
    tipo_anunciante: 'admin' | 'dueno_directo' | 'inmobiliaria';
    email_contacto: string;
    whatsapp: string;
    suspendido: boolean;
    created_at: string;
    propiedadesCount: number;
  }[];
  topVisitedProperties: {
    id: string;
    titulo: string;
    precio_mensual: number;
    estado: string;
    visitas_count: number;
    localidad: string;
    anunciante: string;
  }[];
}

export async function getAdminStats(): Promise<AdminStats> {
  try {
    const supabase = await createClient();

    // 1. Obtener todos los perfiles de usuarios
    const { data: profiles, error: profErr } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (profErr) {
      console.error('Error fetching admin profiles:', profErr);
    }

    const allProfiles = profiles || [];
    const totalUsers = allProfiles.length;
    const duenosCount = allProfiles.filter((p) => p.tipo_anunciante === 'dueno_directo').length;
    const inmobiliariasCount = allProfiles.filter((p) => p.tipo_anunciante === 'inmobiliaria').length;

    // 2. Obtener todas las propiedades con sus relaciones geo
    const { data: properties, error: propErr } = await supabase
      .from('propiedades')
      .select(`
        id,
        anunciante_id,
        titulo,
        precio_mensual,
        estado,
        visitas_count,
        created_at,
        provincias (id, nombre),
        localidades (id, nombre),
        barrios (id, nombre),
        profiles (nombre_completo, nombre_inmobiliaria)
      `)
      .order('created_at', { ascending: false });

    if (propErr) {
      console.error('Error fetching admin properties:', propErr);
    }

    const allProps = properties || [];
    const totalProperties = allProps.length;
    const activeProperties = allProps.filter((p) => p.estado === 'activa').length;
    const pausedProperties = allProps.filter((p) => p.estado === 'pausada').length;
    const rentedProperties = allProps.filter((p) => p.estado === 'alquilada').length;

    // Métricas de visitas y precio promedio
    const totalVisits = allProps.reduce((sum, p) => sum + (p.visitas_count || 0), 0);
    const validPrices = allProps.map((p) => Number(p.precio_mensual)).filter((p) => p > 0);
    const averagePrice =
      validPrices.length > 0
        ? Math.round(validPrices.reduce((a, b) => a + b, 0) / validPrices.length)
        : 0;

    // Estadísticas por Provincia
    const provCounts: Record<string, number> = {};
    allProps.forEach((p: any) => {
      const provName = p.provincias?.nombre || 'Otras';
      provCounts[provName] = (provCounts[provName] || 0) + 1;
    });

    const provinciasStats = Object.entries(provCounts).map(([nombre, count]) => ({
      nombre,
      count,
      percentage: totalProperties > 0 ? Math.round((count / totalProperties) * 100) : 0,
    }));

    // Top Localidades
    const locCounts: Record<string, { count: number; provincia: string }> = {};
    allProps.forEach((p: any) => {
      const locName = p.localidades?.nombre || 'Desconocida';
      const provName = p.provincias?.nombre || '';
      if (!locCounts[locName]) {
        locCounts[locName] = { count: 0, provincia: provName };
      }
      locCounts[locName].count += 1;
    });

    const topLocalidades = Object.entries(locCounts)
      .map(([nombre, data]) => ({
        nombre,
        provincia: data.provincia,
        count: data.count,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);

    // Top Barrios
    const barCounts: Record<string, number> = {};
    allProps.forEach((p: any) => {
      if (p.barrios?.nombre) {
        barCounts[p.barrios.nombre] = (barCounts[p.barrios.nombre] || 0) + 1;
      }
    });

    const topBarrios = Object.entries(barCounts)
      .map(([nombre, count]) => ({ nombre, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);

    // Contar avisos por usuario
    const propsByUser: Record<string, number> = {};
    allProps.forEach((p) => {
      propsByUser[p.anunciante_id] = (propsByUser[p.anunciante_id] || 0) + 1;
    });

    const users = allProfiles.map((prof) => ({
      id: prof.id,
      nombre_completo: prof.nombre_completo,
      nombre_inmobiliaria: prof.nombre_inmobiliaria || null,
      tipo_anunciante: prof.tipo_anunciante,
      email_contacto: prof.email_contacto,
      whatsapp: prof.whatsapp,
      suspendido: Boolean(prof.suspendido),
      created_at: prof.created_at,
      propiedadesCount: propsByUser[prof.id] || 0,
    }));

    // Top propiedades más visitadas
    const topVisitedProperties = allProps
      .map((p: any) => ({
        id: p.id,
        titulo: p.titulo,
        precio_mensual: Number(p.precio_mensual),
        estado: p.estado,
        visitas_count: p.visitas_count || 0,
        localidad: p.localidades?.nombre || '',
        anunciante: p.profiles?.nombre_inmobiliaria || p.profiles?.nombre_completo || 'Anunciante',
      }))
      .sort((a, b) => b.visitas_count - a.visitas_count)
      .slice(0, 8);

    return {
      totalUsers,
      duenosCount,
      inmobiliariasCount,
      totalProperties,
      activeProperties,
      pausedProperties,
      rentedProperties,
      totalVisits,
      averagePrice,
      provinciasStats,
      topLocalidades,
      topBarrios,
      users,
      topVisitedProperties,
    };
  } catch (err) {
    console.error('Unexpected error in getAdminStats:', err);
    return {
      totalUsers: 0,
      duenosCount: 0,
      inmobiliariasCount: 0,
      totalProperties: 0,
      activeProperties: 0,
      pausedProperties: 0,
      rentedProperties: 0,
      totalVisits: 0,
      averagePrice: 0,
      provinciasStats: [],
      topLocalidades: [],
      topBarrios: [],
      users: [],
      topVisitedProperties: [],
    };
  }
}

export async function toggleSuspendUser(userId: string, suspend: boolean) {
  try {
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(userId)) {
      throw new Error('Identificador de usuario inválido.');
    }
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('No autenticado.');

    // Verificar permisos de admin
    const { data: adminProf } = await supabase
      .from('profiles')
      .select('es_admin, tipo_anunciante')
      .eq('id', user.id)
      .single();

    if (!adminProf?.es_admin && adminProf?.tipo_anunciante !== 'admin') {
      throw new Error('Permisos insuficientes. Solo administradores.');
    }

    if (userId === user.id) {
      throw new Error('No puedes suspender tu propia cuenta de administrador.');
    }

    // Actualizar estado del perfil
    const { error: profErr } = await supabase
      .from('profiles')
      .update({ suspendido: suspend })
      .eq('id', userId);

    if (profErr) {
      if (profErr.message.includes('suspendido')) {
        throw new Error(
          'Falta agregar la columna "suspendido" en Supabase. Ejecuta: ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS suspendido BOOLEAN DEFAULT FALSE;'
        );
      }
      throw new Error(profErr.message);
    }

    // Si se suspende al usuario, se pausan automáticamente todas sus publicaciones
    // Si se reactiva, se vuelven a activar
    const nuevoEstado = suspend ? 'pausada' : 'activa';
    const { error: propErr } = await supabase
      .from('propiedades')
      .update({ estado: nuevoEstado })
      .eq('anunciante_id', userId);

    if (propErr) {
      console.error('Error al actualizar publicaciones del usuario suspendido:', propErr);
    }

    revalidatePath('/admin');
    revalidatePath('/propiedades');
    revalidatePath('/');
    return { success: true };
  } catch (err: any) {
    console.error('toggleSuspendUser error:', err);
    return { success: false, error: err.message };
  }
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

async function requireAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('No autenticado.');

  const { data: adminProf } = await supabase
    .from('profiles')
    .select('es_admin, tipo_anunciante')
    .eq('id', user.id)
    .single();

  if (!adminProf?.es_admin && adminProf?.tipo_anunciante !== 'admin') {
    throw new Error('Permisos insuficientes. Solo administradores.');
  }
  return { supabase, user };
}

export async function deleteUserByAdmin(userId: string) {
  try {
    if (!UUID_RE.test(userId)) throw new Error('Identificador de usuario inválido.');
    const { supabase, user } = await requireAdmin();

    if (userId === user.id) {
      throw new Error('No puedes eliminar tu propia cuenta de administrador.');
    }

    // Limpiar fotos del Storage antes de borrar (las filas desaparecen en cascada)
    const { data: userFotos } = await supabase
      .from('propiedad_fotos')
      .select('storage_path, propiedades!inner(anunciante_id)')
      .eq('propiedades.anunciante_id', userId);
    await removeStorageFilesByUrls(supabase, (userFotos || []).map((f: any) => f.storage_path));
    await removeUserStorageFolder(supabase, userId);

    // Borra auth.users (y en cascada perfil, publicaciones y fotos) con una función segura de la BD
    const { error: rpcErr } = await supabase.rpc('admin_delete_user', { target_user: userId });
    if (rpcErr) {
      if (rpcErr.message.includes('admin_delete_user')) {
        throw new Error('Falta ejecutar supabase/security_hardening.sql en Supabase (función admin_delete_user).');
      }
      throw new Error(rpcErr.message);
    }

    revalidatePath('/admin');
    revalidatePath('/propiedades');
    revalidatePath('/');
    return { success: true };
  } catch (err: any) {
    console.error('deleteUserByAdmin error:', err);
    return { success: false, error: err.message };
  }
}

// ----------------------------------------------------------------------------
// Mensajes del formulario de contacto (solo administrador)
// ----------------------------------------------------------------------------
export interface ContactMessage {
  id: string;
  nombre: string;
  email: string;
  telefono: string | null;
  motivo: 'soporte' | 'inmobiliaria' | 'denuncia' | 'sugerencia';
  mensaje: string;
  leido: boolean;
  created_at: string;
}

export async function getContactMessages(): Promise<{ success: boolean; messages: ContactMessage[]; error?: string }> {
  try {
    const { supabase } = await requireAdmin();
    const { data, error } = await supabase
      .from('mensajes_contacto')
      .select('id, nombre, email, telefono, motivo, mensaje, leido, created_at')
      .order('created_at', { ascending: false })
      .limit(200);

    if (error) {
      if (error.message.includes('mensajes_contacto')) {
        return { success: false, messages: [], error: 'Falta ejecutar supabase/security_hardening.sql en Supabase.' };
      }
      throw new Error(error.message);
    }
    return { success: true, messages: (data || []) as ContactMessage[] };
  } catch (err: any) {
    return { success: false, messages: [], error: err.message };
  }
}

export async function setContactMessageRead(id: string, leido: boolean) {
  try {
    if (!UUID_RE.test(id)) throw new Error('Identificador inválido.');
    const { supabase } = await requireAdmin();
    const { error } = await supabase.from('mensajes_contacto').update({ leido }).eq('id', id);
    if (error) throw new Error(error.message);
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function deleteContactMessage(id: string) {
  try {
    if (!UUID_RE.test(id)) throw new Error('Identificador inválido.');
    const { supabase } = await requireAdmin();
    const { error } = await supabase.from('mensajes_contacto').delete().eq('id', id);
    if (error) throw new Error(error.message);
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

// ----------------------------------------------------------------------------
// Moderación de publicaciones (solo administrador)
// ----------------------------------------------------------------------------
export interface AdminProperty {
  id: string;
  titulo: string;
  precio_mensual: number;
  moneda: string;
  estado: 'activa' | 'pausada' | 'alquilada';
  visitas_count: number;
  created_at: string;
  localidad: string;
  anunciante: string;
}

export async function getAdminProperties(): Promise<AdminProperty[]> {
  try {
    const { supabase } = await requireAdmin();
    const { data, error } = await supabase
      .from('propiedades')
      .select('id, titulo, precio_mensual, moneda, estado, visitas_count, created_at, localidades (nombre), profiles (nombre_completo, nombre_inmobiliaria)')
      .order('created_at', { ascending: false })
      .limit(500);
    if (error) throw new Error(error.message);
    return (data || []).map((p: any) => ({
      id: p.id,
      titulo: p.titulo,
      precio_mensual: Number(p.precio_mensual),
      moneda: p.moneda || 'ARS',
      estado: p.estado,
      visitas_count: p.visitas_count || 0,
      created_at: p.created_at,
      localidad: p.localidades?.nombre || '-',
      anunciante: p.profiles?.nombre_inmobiliaria || p.profiles?.nombre_completo || '-',
    }));
  } catch (err) {
    console.error('getAdminProperties error:', err);
    return [];
  }
}

export async function setPropertyStateByAdmin(id: string, estado: 'activa' | 'pausada' | 'alquilada') {
  try {
    if (!UUID_RE.test(id)) throw new Error('Identificador inválido.');
    if (!['activa', 'pausada', 'alquilada'].includes(estado)) throw new Error('Estado inválido.');
    const { supabase } = await requireAdmin();
    const { error } = await supabase.from('propiedades').update({ estado }).eq('id', id);
    if (error) throw new Error(error.message);
    revalidatePath('/propiedades');
    revalidatePath('/');
    revalidatePath(`/propiedad/${id}`);
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function deletePropertyByAdmin(id: string) {
  try {
    if (!UUID_RE.test(id)) throw new Error('Identificador inválido.');
    const { supabase } = await requireAdmin();
    const { data: fotos } = await supabase.from('propiedad_fotos').select('storage_path').eq('propiedad_id', id);
    const { error } = await supabase.from('propiedades').delete().eq('id', id);
    if (error) throw new Error(error.message);
    await removeStorageFilesByUrls(supabase, (fotos || []).map((f: any) => f.storage_path));
    revalidatePath('/propiedades');
    revalidatePath('/');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

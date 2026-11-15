'use server';

import { createClient } from '@/lib/supabase/server';

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
    tipo_anunciante: 'dueno_directo' | 'inmobiliaria';
    email_contacto: string;
    whatsapp: string;
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


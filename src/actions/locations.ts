'use server';

import { createClient } from '@/lib/supabase/server';
import { Provincia, Localidad, Barrio } from '@/types/database';

// Datos semilla de respaldo si aún no se configuraron las variables de entorno de Supabase
const FALLBACK_PROVINCIAS: Provincia[] = [
  { id: 1, nombre: 'Corrientes', slug: 'corrientes', activo: true, created_at: new Date().toISOString() },
  { id: 2, nombre: 'Chaco', slug: 'chaco', activo: true, created_at: new Date().toISOString() },
];

const FALLBACK_LOCALIDADES: Localidad[] = [
  { id: 1, provincia_id: 1, nombre: 'Corrientes Capital', slug: 'corrientes-capital', activo: true, created_at: new Date().toISOString() },
  { id: 2, provincia_id: 1, nombre: 'Paso de la Patria', slug: 'paso-de-la-patria', activo: true, created_at: new Date().toISOString() },
  { id: 3, provincia_id: 1, nombre: 'Goya', slug: 'goya', activo: true, created_at: new Date().toISOString() },
  { id: 4, provincia_id: 2, nombre: 'Resistencia', slug: 'resistencia', activo: true, created_at: new Date().toISOString() },
  { id: 5, provincia_id: 2, nombre: 'Barranqueras', slug: 'barranqueras', activo: true, created_at: new Date().toISOString() },
  { id: 6, provincia_id: 2, nombre: 'Fontana', slug: 'fontana', activo: true, created_at: new Date().toISOString() },
  { id: 7, provincia_id: 2, nombre: 'Sáenz Peña', slug: 'saenz-pena', activo: true, created_at: new Date().toISOString() },
];

const FALLBACK_BARRIOS: Barrio[] = [
  // Corrientes Capital
  { id: 1, localidad_id: 1, nombre: 'Centro', slug: 'centro', activo: true, created_at: new Date().toISOString() },
  { id: 2, localidad_id: 1, nombre: 'Camba Cuá', slug: 'camba-cua', activo: true, created_at: new Date().toISOString() },
  { id: 3, localidad_id: 1, nombre: 'Aldana', slug: 'aldana', activo: true, created_at: new Date().toISOString() },
  { id: 4, localidad_id: 1, nombre: 'Libertad', slug: 'libertad', activo: true, created_at: new Date().toISOString() },
  { id: 5, localidad_id: 1, nombre: 'La Cruz', slug: 'la-cruz', activo: true, created_at: new Date().toISOString() },
  { id: 6, localidad_id: 1, nombre: 'San Jerónimo', slug: 'san-jeronimo', activo: true, created_at: new Date().toISOString() },
  { id: 7, localidad_id: 1, nombre: 'Molina Punta', slug: 'molina-punta', activo: true, created_at: new Date().toISOString() },
  // Resistencia
  { id: 8, localidad_id: 4, nombre: 'Centro', slug: 'centro', activo: true, created_at: new Date().toISOString() },
  { id: 9, localidad_id: 4, nombre: 'Villa San Martín', slug: 'villa-san-martin', activo: true, created_at: new Date().toISOString() },
  { id: 10, localidad_id: 4, nombre: 'Villa Universidad', slug: 'villa-universidad', activo: true, created_at: new Date().toISOString() },
  { id: 11, localidad_id: 4, nombre: 'Santa Inés', slug: 'santa-ines', activo: true, created_at: new Date().toISOString() },
  { id: 12, localidad_id: 4, nombre: 'Los Troncos', slug: 'los-troncos', activo: true, created_at: new Date().toISOString() },
];

export async function getProvincias(): Promise<Provincia[]> {
  try {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      return FALLBACK_PROVINCIAS;
    }
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('provincias')
      .select('*')
      .eq('activo', true)
      .order('nombre', { ascending: true });

    if (error || !data || data.length === 0) return FALLBACK_PROVINCIAS;
    return data as Provincia[];
  } catch {
    return FALLBACK_PROVINCIAS;
  }
}

export async function getLocalidades(provinciaId?: number): Promise<Localidad[]> {
  try {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      return provinciaId
        ? FALLBACK_LOCALIDADES.filter((l) => l.provincia_id === provinciaId)
        : FALLBACK_LOCALIDADES;
    }
    const supabase = await createClient();
    let query = supabase.from('localidades').select('*').eq('activo', true);

    if (provinciaId) {
      query = query.eq('provincia_id', provinciaId);
    }

    const { data, error } = await query.order('nombre', { ascending: true });
    if (error || !data || data.length === 0) {
      return provinciaId
        ? FALLBACK_LOCALIDADES.filter((l) => l.provincia_id === provinciaId)
        : FALLBACK_LOCALIDADES;
    }
    return data as Localidad[];
  } catch {
    return provinciaId
      ? FALLBACK_LOCALIDADES.filter((l) => l.provincia_id === provinciaId)
      : FALLBACK_LOCALIDADES;
  }
}

export async function getBarrios(localidadId?: number): Promise<Barrio[]> {
  try {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      return localidadId
        ? FALLBACK_BARRIOS.filter((b) => b.localidad_id === localidadId)
        : FALLBACK_BARRIOS;
    }
    const supabase = await createClient();
    let query = supabase.from('barrios').select('*').eq('activo', true);

    if (localidadId) {
      query = query.eq('localidad_id', localidadId);
    }

    const { data, error } = await query.order('nombre', { ascending: true });
    if (error || !data || data.length === 0) {
      return localidadId
        ? FALLBACK_BARRIOS.filter((b) => b.localidad_id === localidadId)
        : FALLBACK_BARRIOS;
    }
    return data as Barrio[];
  } catch {
    return localidadId
      ? FALLBACK_BARRIOS.filter((b) => b.localidad_id === localidadId)
      : FALLBACK_BARRIOS;
  }
}


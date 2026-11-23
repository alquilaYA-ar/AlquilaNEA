'use server';

import { unstable_cache } from 'next/cache';
import { createPublicClient } from '@/lib/supabase/public';
import { Provincia, Localidad, Barrio } from '@/types/database';

// Las ubicaciones cambian muy poco, así que las cacheamos 1 hora.
// Invalidación manual con revalidateTag('locations') si se modifican.
const CACHE_TTL = 3600;

async function fetchProvincias(): Promise<Provincia[]> {
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from('provincias')
    .select('*')
    .eq('activo', true)
    .order('nombre', { ascending: true });

  if (error) {
    console.error('Error fetching provincias:', error);
    return [];
  }
  return (data as Provincia[]) || [];
}

async function fetchLocalidades(provinciaId?: number): Promise<Localidad[]> {
  const supabase = createPublicClient();
  let query = supabase.from('localidades').select('*').eq('activo', true);

  if (provinciaId) {
    query = query.eq('provincia_id', provinciaId);
  }

  const { data, error } = await query.order('nombre', { ascending: true });
  if (error) {
    console.error('Error fetching localidades:', error);
    return [];
  }
  return (data as Localidad[]) || [];
}

async function fetchBarrios(localidadId?: number): Promise<Barrio[]> {
  const supabase = createPublicClient();
  let query = supabase.from('barrios').select('*').eq('activo', true);

  if (localidadId) {
    query = query.eq('localidad_id', localidadId);
  }

  const { data, error } = await query.order('nombre', { ascending: true });
  if (error) {
    console.error('Error fetching barrios:', error);
    return [];
  }
  return (data as Barrio[]) || [];
}

export const getProvincias = unstable_cache(
  fetchProvincias,
  ['provincias'],
  { revalidate: CACHE_TTL, tags: ['locations'] }
);

export const getLocalidades = unstable_cache(
  fetchLocalidades,
  ['localidades'],
  { revalidate: CACHE_TTL, tags: ['locations'] }
);

export const getBarrios = unstable_cache(
  fetchBarrios,
  ['barrios'],
  { revalidate: CACHE_TTL, tags: ['locations'] }
);

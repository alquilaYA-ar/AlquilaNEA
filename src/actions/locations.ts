'use server';

import { createClient } from '@/lib/supabase/server';
import { Provincia, Localidad, Barrio } from '@/types/database';

export async function getProvincias(): Promise<Provincia[]> {
  try {
    const supabase = await createClient();
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
  } catch (err) {
    console.error('Error in getProvincias:', err);
    return [];
  }
}

export async function getLocalidades(provinciaId?: number): Promise<Localidad[]> {
  try {
    const supabase = await createClient();
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
  } catch (err) {
    console.error('Error in getLocalidades:', err);
    return [];
  }
}

export async function getBarrios(localidadId?: number): Promise<Barrio[]> {
  try {
    const supabase = await createClient();
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
  } catch (err) {
    console.error('Error in getBarrios:', err);
    return [];
  }
}

'use server';

import { createClient } from '@/lib/supabase/server';
import { Propiedad } from '@/types/database';
import { PropertyFilterInput, propertyFilterSchema } from '@/lib/validations/property';
import { revalidatePath } from 'next/cache';

export async function searchProperties(filters: Partial<PropertyFilterInput> = {}) {
  const parsed = propertyFilterSchema.safeParse(filters);
  const validated = parsed.success ? parsed.data : propertyFilterSchema.parse({});

  try {
    const supabase = await createClient();
    let query = supabase
      .from('propiedades')
      .select(`
        *,
        provincias (*),
        localidades (*),
        barrios (*),
        profiles (*),
        propiedad_fotos (*)
      `, { count: 'exact' })
      .eq('estado', 'activa');

    if (validated.provinciaId) query = query.eq('provincia_id', validated.provinciaId);
    if (validated.localidadId) query = query.eq('localidad_id', validated.localidadId);
    if (validated.barrioId) query = query.eq('barrio_id', validated.barrioId);
    if (validated.tipoInmueble) query = query.eq('tipo_inmueble', validated.tipoInmueble);
    if (validated.ambientes) {
      if (validated.ambientes >= 4) {
        query = query.gte('ambientes', 4);
      } else {
        query = query.eq('ambientes', validated.ambientes);
      }
    }
    if (validated.precioMin) query = query.gte('precio_mensual', validated.precioMin);
    if (validated.precioMax) query = query.lte('precio_mensual', validated.precioMax);
    if (validated.cochera) query = query.eq('cochera', true);
    if (validated.terrazaBalcon) query = query.eq('terraza_balcon', true);
    if (validated.patio) query = query.eq('patio', true);
    if (validated.aceptaMascotas) query = query.eq('acepta_mascotas', true);
    if (validated.expensasIncluidas) query = query.eq('expensas_incluidas', true);

    // Ordenamiento
    if (validated.ordenarPor === 'precio_asc') {
      query = query.order('precio_mensual', { ascending: true });
    } else if (validated.ordenarPor === 'precio_desc') {
      query = query.order('precio_mensual', { ascending: false });
    } else {
      // Destacadas primero, luego más recientes
      query = query.order('destacada', { ascending: false }).order('created_at', { ascending: false });
    }

    // Paginación
    const from = (validated.page - 1) * validated.limit;
    const to = from + validated.limit - 1;
    query = query.range(from, to);

    const { data, count, error } = await query;

    if (error) {
      console.error('Error fetching properties from Supabase:', error);
      return {
        properties: [],
        totalCount: 0,
        page: validated.page,
        limit: validated.limit,
        totalPages: 1,
      };
    }

    let results = (data as Propiedad[]) || [];

    // Filtrar tipo de anunciante en el resultado si se solicitó
    if (validated.tipoAnunciante) {
      results = results.filter((p) => p.profiles?.tipo_anunciante === validated.tipoAnunciante);
    }

    const totalCount = count ?? results.length;

    return {
      properties: results,
      totalCount,
      page: validated.page,
      limit: validated.limit,
      totalPages: Math.ceil(totalCount / validated.limit) || 1,
    };
  } catch (err) {
    console.error('Unexpected error in searchProperties:', err);
    return {
      properties: [],
      totalCount: 0,
      page: validated.page,
      limit: validated.limit,
      totalPages: 1,
    };
  }
}

export async function getPropertyById(id: string): Promise<Propiedad | null> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('propiedades')
      .select(`
        *,
        provincias (*),
        localidades (*),
        barrios (*),
        profiles (*),
        propiedad_fotos (*)
      `)
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching property by id:', error);
      return null;
    }
    return data as Propiedad;
  } catch (err) {
    console.error('Unexpected error in getPropertyById:', err);
    return null;
  }
}

export interface CreatePropertyActionInput {
  provinciaId: number;
  localidadId: number;
  barrioId?: number | null;
  direccionCalle?: string;
  titulo: string;
  descripcion: string;
  tipoInmueble: string;
  ambientes: number;
  dormitorios: number;
  banos: number;
  cochera: boolean;
  terrazaBalcon: boolean;
  patio: boolean;
  aceptaMascotas: boolean;
  aireAcondicionado: boolean;
  pileta: boolean;
  precioMensual: number;
  expensasIncluidas: boolean;
  expensasMonto: number;
  fotosUrls: string[];
}

export async function createProperty(input: CreatePropertyActionInput) {
  try {
    const supabase = await createClient();

    // 1. Obtener usuario actual autenticado
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      throw new Error('Debes iniciar sesión para publicar una propiedad.');
    }

    const anuncianteId = user.id;

    // 2. Insertar la propiedad en Supabase
    const { data: prop, error: propError } = await supabase
      .from('propiedades')
      .insert({
        anunciante_id: anuncianteId,
        provincia_id: input.provinciaId,
        localidad_id: input.localidadId,
        barrio_id: input.barrioId || null,
        direccion_calle: input.direccionCalle || null,
        titulo: input.titulo,
        descripcion: input.descripcion,
        tipo_inmueble: input.tipoInmueble,
        ambientes: input.ambientes,
        dormitorios: input.dormitorios,
        banos: input.banos,
        cochera: input.cochera,
        terraza_balcon: input.terrazaBalcon,
        patio: input.patio,
        acepta_mascotas: input.aceptaMascotas,
        aire_acondicionado: input.aireAcondicionado,
        pileta: input.pileta,
        precio_mensual: input.precioMensual,
        expensas_incluidas: input.expensasIncluidas,
        expensas_monto: input.expensasMonto,
        estado: 'activa',
      })
      .select('id')
      .single();

    if (propError || !prop) {
      console.error('Error inserting property:', propError);
      throw new Error(propError?.message || 'Error al guardar la propiedad');
    }

    // 3. Insertar las fotos si se subieron
    if (input.fotosUrls && input.fotosUrls.length > 0) {
      const fotosRows = input.fotosUrls.map((url, idx) => ({
        propiedad_id: prop.id,
        storage_path: url,
        orden: idx,
        es_portada: idx === 0,
      }));

      const { error: fotosError } = await supabase
        .from('propiedad_fotos')
        .insert(fotosRows);

      if (fotosError) {
        console.error('Error inserting property photos:', fotosError);
      }
    }

    revalidatePath('/');
    revalidatePath('/propiedades');

    return { success: true, propertyId: prop.id };
  } catch (err: any) {
    console.error('createProperty error:', err);
    return { success: false, error: err.message };
  }
}

'use server';

import { createClient } from '@/lib/supabase/server';
import { Propiedad } from '@/types/database';
import {
  PropertyFilterInput,
  propertyFilterSchema,
  createPropertySchema,
  updatePropertySchema,
} from '@/lib/validations/property';
import { firstZodError } from '@/lib/validations/auth';
import { calculateMaxPhotos } from '@/lib/photo-limits';
import { removeStorageFilesByUrls } from '@/lib/storage-cleanup';
import { getClientIp, rateLimit, TOO_MANY_REQUESTS } from '@/lib/rate-limit';
import { createPublicClient } from '@/lib/supabase/public';

// Columnas públicas del perfil (NUNCA exponer email, teléfono ni flags de admin a visitantes)
const PUBLIC_PROFILE_COLUMNS =
  'id, nombre_completo, nombre_inmobiliaria, matricula_inmobiliaria, tipo_anunciante, whatsapp, avatar_url, created_at';

async function assertNotSuspended(supabase: Awaited<ReturnType<typeof createClient>>, userId: string) {
  const { data } = await supabase.from('profiles').select('suspendido').eq('id', userId).single();
  if (data?.suspendido) {
    throw new Error('Tu cuenta está suspendida. Contactá a soporte.');
  }
}

function isOwnStorageUrl(url: string, userId: string) {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
  return !!base && url.startsWith(`${base}/storage/v1/object/public/properties/${userId}/`);
}
import { revalidatePath } from 'next/cache';

export async function searchProperties(filters: Partial<PropertyFilterInput> = {}) {
  const parsed = propertyFilterSchema.safeParse(filters);
  const validated = parsed.success ? parsed.data : propertyFilterSchema.parse({});

  try {
    const supabase = createPublicClient();
    let query = supabase
      .from('propiedades')
      .select(`
        *,
        provincias (*),
        localidades (*),
        barrios (*),
        profiles (${PUBLIC_PROFILE_COLUMNS}),
        propiedad_fotos (*)
      `, { count: 'exact' })
      .eq('estado', 'activa');

    if (validated.provinciaId) query = query.eq('provincia_id', validated.provinciaId);
    if (validated.localidadId) query = query.eq('localidad_id', validated.localidadId);
    if (validated.barrioId) query = query.eq('barrio_id', validated.barrioId);
    if (validated.tipoInmueble) query = query.eq('tipo_inmueble', validated.tipoInmueble);
    if (validated.tipoAnunciante) query = query.eq('profiles.tipo_anunciante', validated.tipoAnunciante);
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

    const results = (data as Propiedad[]) || [];
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
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) return null;
  try {
    const supabase = createPublicClient();
    const { data, error } = await supabase
      .from('propiedades')
      .select(`
        *,
        provincias (*),
        localidades (*),
        barrios (*),
        profiles (${PUBLIC_PROFILE_COLUMNS}),
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

export async function trackPropertyView(propertyId: string) {
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(propertyId)) {
    return { success: false };
  }
  try {
    const supabase = await createClient();
    // Función SECURITY DEFINER de Postgres: incrementa de forma atómica sin abrir permisos de UPDATE
    const { error } = await supabase.rpc('increment_visitas', { prop_id: propertyId });
    if (error) {
      console.error('Error tracking property view:', error.message);
      return { success: false };
    }
    return { success: true };
  } catch (err) {
    console.error('Error tracking property view:', err);
    return { success: false };
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

    const ip = await getClientIp();
    if (!(await rateLimit(supabase, `property:create:${user.id}:${ip}`, 10, 3600))) {
      throw new Error(TOO_MANY_REQUESTS);
    }

    const anuncianteId = user.id;
    await assertNotSuspended(supabase, user.id);

    // Validación estricta del lado del servidor (nunca confiar en el cliente)
    const parsed = createPropertySchema.safeParse(input);
    if (!parsed.success) {
      throw new Error(firstZodError(parsed.error));
    }
    input = { ...input, ...parsed.data, barrioId: parsed.data.barrioId ?? null, direccionCalle: parsed.data.direccionCalle || undefined } as CreatePropertyActionInput;

    const maxPhotos = calculateMaxPhotos({
      ambientes: input.ambientes,
      cochera: input.cochera,
      terrazaBalcon: input.terrazaBalcon,
      patio: input.patio,
      pileta: input.pileta,
    }).maxPhotos;
    if (input.fotosUrls.length > maxPhotos) {
      throw new Error(`Superaste el máximo de ${maxPhotos} fotos permitido para este inmueble.`);
    }
    if (!input.fotosUrls.every((u) => isOwnStorageUrl(u, user.id))) {
      throw new Error('Alguna de las fotos no es válida.');
    }

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
    revalidatePath('/mis-publicaciones');

    return { success: true, propertyId: prop.id };
  } catch (err: any) {
    console.error('createProperty error:', err);
    return { success: false, error: err.message };
  }
}

export async function getMyProperties(): Promise<Propiedad[]> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return [];

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
      .eq('anunciante_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error in getMyProperties:', error);
      return [];
    }

    return (data as Propiedad[]) || [];
  } catch (err) {
    console.error('Unexpected error in getMyProperties:', err);
    return [];
  }
}

export interface UpdatePropertyActionInput {
  propertyId: string;
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
  estado: 'activa' | 'pausada' | 'alquilada';
}

export async function updateProperty(input: UpdatePropertyActionInput) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      throw new Error('Debes iniciar sesión para editar una propiedad.');
    }

    const ip = await getClientIp();
    if (!(await rateLimit(supabase, `property:update:${user.id}:${ip}`, 20, 3600))) {
      throw new Error(TOO_MANY_REQUESTS);
    }

    const parsed = updatePropertySchema.safeParse(input);
    if (!parsed.success) {
      throw new Error(firstZodError(parsed.error));
    }
    input = { ...input, ...parsed.data } as UpdatePropertyActionInput;

    if (input.estado === 'activa') {
      await assertNotSuspended(supabase, user.id);
    }

    // Actualizar estrictamente solo los campos modificables (SIN tocar ubicaciones)
    const { error } = await supabase
      .from('propiedades')
      .update({
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
        estado: input.estado,
      })
      .eq('id', input.propertyId)
      .eq('anunciante_id', user.id); // Asegura que solo el dueño legítimo pueda editarla

    if (error) {
      throw new Error(error.message);
    }

    revalidatePath('/');
    revalidatePath('/propiedades');
    revalidatePath(`/propiedad/${input.propertyId}`);
    revalidatePath('/mis-publicaciones');

    return { success: true };
  } catch (err: any) {
    console.error('updateProperty error:', err);
    return { success: false, error: err.message };
  }
}

export async function deleteProperty(propertyId: string) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) throw new Error('No autorizado.');

    const ip = await getClientIp();
    if (!(await rateLimit(supabase, `property:delete:${user.id}:${ip}`, 10, 3600))) {
      throw new Error(TOO_MANY_REQUESTS);
    }

    // Guardar las URLs de las fotos antes de borrar para limpiar el Storage
    const { data: fotos } = await supabase
      .from('propiedad_fotos')
      .select('storage_path, propiedades!inner(anunciante_id)')
      .eq('propiedad_id', propertyId)
      .eq('propiedades.anunciante_id', user.id);

    const { error } = await supabase
      .from('propiedades')
      .delete()
      .eq('id', propertyId)
      .eq('anunciante_id', user.id);

    if (error) throw new Error(error.message);

    await removeStorageFilesByUrls(supabase, (fotos || []).map((f: any) => f.storage_path));

    revalidatePath('/');
    revalidatePath('/propiedades');
    revalidatePath('/mis-publicaciones');

    return { success: true };
  } catch (err: any) {
    console.error('deleteProperty error:', err);
    return { success: false, error: err.message };
  }
}

export async function changePropertyStatus(propertyId: string, nuevoEstado: 'activa' | 'pausada' | 'alquilada') {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) throw new Error('No autorizado.');

    const { error } = await supabase
      .from('propiedades')
      .update({ estado: nuevoEstado })
      .eq('id', propertyId)
      .eq('anunciante_id', user.id);

    if (error) throw new Error(error.message);

    revalidatePath('/');
    revalidatePath('/propiedades');
    revalidatePath(`/propiedad/${propertyId}`);
    revalidatePath('/mis-publicaciones');

    return { success: true };
  } catch (err: any) {
    console.error('changePropertyStatus error:', err);
    return { success: false, error: err.message };
  }
}

export async function addPropertyPhotos(propertyId: string, fotosUrls: string[]) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('No autorizado.');

    const ip = await getClientIp();
    if (!(await rateLimit(supabase, `property:photos:add:${user.id}:${ip}`, 20, 3600))) {
      throw new Error(TOO_MANY_REQUESTS);
    }

    if (!Array.isArray(fotosUrls) || fotosUrls.length === 0 || fotosUrls.length > 10) {
      throw new Error('Cantidad de fotos inválida.');
    }
    if (!fotosUrls.every((u) => typeof u === 'string' && isOwnStorageUrl(u, user.id))) {
      throw new Error('Alguna de las fotos no es válida.');
    }

    // Verificar que la propiedad pertenezca al usuario
    const { data: prop, error: propErr } = await supabase
      .from('propiedades')
      .select('id, anunciante_id, ambientes, cochera, terraza_balcon, patio, pileta')
      .eq('id', propertyId)
      .eq('anunciante_id', user.id)
      .single();

    if (propErr || !prop) throw new Error('Propiedad no encontrada o permisos insuficientes.');

    const maxPhotos = calculateMaxPhotos({
      ambientes: prop.ambientes,
      cochera: prop.cochera,
      terrazaBalcon: prop.terraza_balcon,
      patio: prop.patio,
      pileta: prop.pileta,
    }).maxPhotos;

    // Obtener fotos actuales
    const { data: existingPhotos } = await supabase
      .from('propiedad_fotos')
      .select('id, es_portada, orden')
      .eq('propiedad_id', propertyId)
      .order('orden', { ascending: false });

    const currentCount = existingPhotos?.length || 0;
    if (currentCount + fotosUrls.length > maxPhotos) {
      throw new Error(`Superaste el máximo de ${maxPhotos} fotos permitido para este inmueble.`);
    }
    const hasCover = existingPhotos?.some((p) => p.es_portada) || false;

    const newRows = fotosUrls.map((url, idx) => ({
      propiedad_id: propertyId,
      storage_path: url,
      orden: currentCount + idx,
      es_portada: !hasCover && idx === 0,
    }));

    const { data: inserted, error: insertError } = await supabase
      .from('propiedad_fotos')
      .insert(newRows)
      .select();

    if (insertError) throw new Error(insertError.message);

    revalidatePath('/');
    revalidatePath('/propiedades');
    revalidatePath(`/propiedad/${propertyId}`);
    revalidatePath(`/mis-publicaciones/editar/${propertyId}`);
    revalidatePath('/mis-publicaciones');

    return { success: true, photos: inserted };
  } catch (err: any) {
    console.error('addPropertyPhotos error:', err);
    return { success: false, error: err.message };
  }
}

export async function deletePropertyPhoto(photoId: string, propertyId: string) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('No autorizado.');

    const ip = await getClientIp();
    if (!(await rateLimit(supabase, `property:photos:delete:${user.id}:${ip}`, 20, 3600))) {
      throw new Error(TOO_MANY_REQUESTS);
    }

    // Verificar propiedad
    const { data: prop } = await supabase
      .from('propiedades')
      .select('id, anunciante_id')
      .eq('id', propertyId)
      .eq('anunciante_id', user.id)
      .single();

    if (!prop) throw new Error('Permisos insuficientes.');

    // Obtener la foto antes de borrar
    const { data: photoToDelete } = await supabase
      .from('propiedad_fotos')
      .select('*')
      .eq('id', photoId)
      .eq('propiedad_id', propertyId)
      .single();

    if (!photoToDelete) throw new Error('Foto no encontrada.');

    // Intentar borrar del Storage de Supabase si corresponde
    if (photoToDelete.storage_path) {
      const pathParts = photoToDelete.storage_path.split('/properties/');
      const fileName = pathParts.length > 1 ? pathParts[1] : photoToDelete.storage_path;
      if (fileName && !fileName.startsWith('http')) {
        await supabase.storage.from('properties').remove([fileName]);
      }
    }

    const { error: delError } = await supabase
      .from('propiedad_fotos')
      .delete()
      .eq('id', photoId)
      .eq('propiedad_id', propertyId);

    if (delError) throw new Error(delError.message);

    // Si la foto borrada era la portada, promover la siguiente foto
    if (photoToDelete.es_portada) {
      const { data: remaining } = await supabase
        .from('propiedad_fotos')
        .select('id')
        .eq('propiedad_id', propertyId)
        .order('orden', { ascending: true })
        .limit(1);

      if (remaining && remaining.length > 0) {
        await supabase
          .from('propiedad_fotos')
          .update({ es_portada: true })
          .eq('id', remaining[0].id);
      }
    }

    revalidatePath('/');
    revalidatePath('/propiedades');
    revalidatePath(`/propiedad/${propertyId}`);
    revalidatePath(`/mis-publicaciones/editar/${propertyId}`);
    revalidatePath('/mis-publicaciones');

    return { success: true };
  } catch (err: any) {
    console.error('deletePropertyPhoto error:', err);
    return { success: false, error: err.message };
  }
}

export async function setCoverPhoto(photoId: string, propertyId: string) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('No autorizado.');

    const ip = await getClientIp();
    if (!(await rateLimit(supabase, `property:photos:cover:${user.id}:${ip}`, 20, 3600))) {
      throw new Error(TOO_MANY_REQUESTS);
    }

    // Verificar propiedad
    const { data: prop } = await supabase
      .from('propiedades')
      .select('id, anunciante_id')
      .eq('id', propertyId)
      .eq('anunciante_id', user.id)
      .single();

    if (!prop) throw new Error('Permisos insuficientes.');

    // Desmarcar todas las fotos como portada
    await supabase
      .from('propiedad_fotos')
      .update({ es_portada: false })
      .eq('propiedad_id', propertyId);

    // Marcar la foto seleccionada
    const { error } = await supabase
      .from('propiedad_fotos')
      .update({ es_portada: true })
      .eq('id', photoId)
      .eq('propiedad_id', propertyId);

    if (error) throw new Error(error.message);

    revalidatePath('/');
    revalidatePath('/propiedades');
    revalidatePath(`/propiedad/${propertyId}`);
    revalidatePath(`/mis-publicaciones/editar/${propertyId}`);
    revalidatePath('/mis-publicaciones');

    return { success: true };
  } catch (err: any) {
    console.error('setCoverPhoto error:', err);
    return { success: false, error: err.message };
  }
}

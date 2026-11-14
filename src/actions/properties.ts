'use server';

import { createClient } from '@/lib/supabase/server';
import { Propiedad } from '@/types/database';
import { PropertyFilterInput, propertyFilterSchema } from '@/lib/validations/property';

// Propiedades de demostración realistas para Corrientes y Chaco
const DEMO_PROPERTIES: Propiedad[] = [
  {
    id: 'prop-1',
    anunciante_id: 'user-1',
    provincia_id: 1, // Corrientes
    localidad_id: 1, // Corrientes Capital
    barrio_id: 2, // Camba Cuá
    titulo: 'Hermoso 2 Ambientes con Balcón y Cochera en Camba Cuá',
    descripcion: 'Excelente departamento en zona residencial de Camba Cuá, a 2 cuadras del parque. Muy luminoso, con cocina integrada, balcón al frente, dormitorio con placard y cochera cubierta en subsuelo.',
    direccion_calle: 'Chaco al 800',
    mostrar_direccion_exacta: false,
    tipo_inmueble: 'departamento',
    ambientes: 2,
    dormitorios: 1,
    banos: 1,
    cochera: true,
    terraza_balcon: true,
    patio: false,
    acepta_mascotas: true,
    aire_acondicionado: true,
    pileta: false,
    moneda: 'ARS',
    precio_mensual: 380000,
    expensas_incluidas: false,
    expensas_monto: 45000,
    estado: 'activa',
    destacada: true,
    visitas_count: 142,
    created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
    updated_at: new Date().toISOString(),
    provincias: { id: 1, nombre: 'Corrientes', slug: 'corrientes', activo: true, created_at: '' },
    localidades: { id: 1, provincia_id: 1, nombre: 'Corrientes Capital', slug: 'corrientes-capital', activo: true, created_at: '' },
    barrios: { id: 2, localidad_id: 1, nombre: 'Camba Cuá', slug: 'camba-cua', activo: true, created_at: '' },
    profiles: {
      id: 'user-1',
      tipo_anunciante: 'dueno_directo',
      nombre_completo: 'Carlos Romero',
      whatsapp: '5493794123456',
      email_contacto: 'carlos.romero@gmail.com',
      created_at: '',
      updated_at: '',
    },
    propiedad_fotos: [
      {
        id: 'foto-1',
        propiedad_id: 'prop-1',
        storage_path: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1000&q=80',
        orden: 0,
        es_portada: true,
        created_at: '',
      },
      {
        id: 'foto-2',
        propiedad_id: 'prop-1',
        storage_path: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1000&q=80',
        orden: 1,
        es_portada: false,
        created_at: '',
      },
    ],
  },
  {
    id: 'prop-2',
    anunciante_id: 'user-2',
    provincia_id: 2, // Chaco
    localidad_id: 4, // Resistencia
    barrio_id: 8, // Centro
    titulo: 'Monoambiente Moderno Céntrico a Estrenar - Sin Comisión',
    descripcion: 'Monoambiente espacioso en pleno centro de Resistencia (cerca de Plaza 25 de Mayo). Equipado con termotanque solar, mueble de bajo mesada y anafe eléctrico. Expensas muy bajas.',
    direccion_calle: 'Julio A. Roca 250',
    mostrar_direccion_exacta: false,
    tipo_inmueble: 'monoambiente',
    ambientes: 1,
    dormitorios: 0,
    banos: 1,
    cochera: false,
    terraza_balcon: true,
    patio: false,
    acepta_mascotas: false,
    aire_acondicionado: true,
    pileta: false,
    moneda: 'ARS',
    precio_mensual: 240000,
    expensas_incluidas: true,
    expensas_monto: 0,
    estado: 'activa',
    destacada: false,
    visitas_count: 88,
    created_at: new Date(Date.now() - 86400000 * 4).toISOString(),
    updated_at: new Date().toISOString(),
    provincias: { id: 2, nombre: 'Chaco', slug: 'chaco', activo: true, created_at: '' },
    localidades: { id: 4, provincia_id: 2, nombre: 'Resistencia', slug: 'resistencia', activo: true, created_at: '' },
    barrios: { id: 8, localidad_id: 4, nombre: 'Centro', slug: 'centro', activo: true, created_at: '' },
    profiles: {
      id: 'user-2',
      tipo_anunciante: 'dueno_directo',
      nombre_completo: 'Mariana Duarte',
      whatsapp: '5493624889900',
      email_contacto: 'mariana.duarte@gmail.com',
      created_at: '',
      updated_at: '',
    },
    propiedad_fotos: [
      {
        id: 'foto-3',
        propiedad_id: 'prop-2',
        storage_path: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1000&q=80',
        orden: 0,
        es_portada: true,
        created_at: '',
      },
    ],
  },
  {
    id: 'prop-3',
    anunciante_id: 'user-3',
    provincia_id: 2, // Chaco
    localidad_id: 4, // Resistencia
    barrio_id: 9, // Villa San Martín
    titulo: 'Casa 3 Ambientes con Patio y Cochera para 2 Autos',
    descripcion: 'Propiedad ideal para familias en Villa San Martín, Resistencia. 2 dormitorios amplios con ventilación natural, gran patio con parrilla, cocina comedor y garage para dos vehículos.',
    direccion_calle: 'Avenida Italia al 1100',
    mostrar_direccion_exacta: false,
    tipo_inmueble: 'casa',
    ambientes: 3,
    dormitorios: 2,
    banos: 2,
    cochera: true,
    terraza_balcon: false,
    patio: true,
    acepta_mascotas: true,
    aire_acondicionado: true,
    pileta: false,
    moneda: 'ARS',
    precio_mensual: 550000,
    expensas_incluidas: true,
    expensas_monto: 0,
    estado: 'activa',
    destacada: true,
    visitas_count: 215,
    created_at: new Date(Date.now() - 86400000).toISOString(),
    updated_at: new Date().toISOString(),
    provincias: { id: 2, nombre: 'Chaco', slug: 'chaco', activo: true, created_at: '' },
    localidades: { id: 4, provincia_id: 2, nombre: 'Resistencia', slug: 'resistencia', activo: true, created_at: '' },
    barrios: { id: 9, localidad_id: 4, nombre: 'Villa San Martín', slug: 'villa-san-martin', activo: true, created_at: '' },
    profiles: {
      id: 'user-3',
      tipo_anunciante: 'inmobiliaria',
      nombre_completo: 'Lic. Martín Gómez',
      nombre_inmobiliaria: 'Gómez & Asociados Propiedades',
      matricula_inmobiliaria: 'CPI-4821',
      whatsapp: '5493624771122',
      email_contacto: 'info@gomezasociados.com',
      created_at: '',
      updated_at: '',
    },
    propiedad_fotos: [
      {
        id: 'foto-4',
        propiedad_id: 'prop-3',
        storage_path: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=1000&q=80',
        orden: 0,
        es_portada: true,
        created_at: '',
      },
      {
        id: 'foto-5',
        propiedad_id: 'prop-3',
        storage_path: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1000&q=80',
        orden: 1,
        es_portada: false,
        created_at: '',
      },
    ],
  },
  {
    id: 'prop-4',
    anunciante_id: 'user-4',
    provincia_id: 1, // Corrientes
    localidad_id: 1, // Corrientes Capital
    barrio_id: 1, // Centro
    titulo: 'Departamento 3 Dormitorios Frente a Plaza Cabral',
    descripcion: 'Piso exclusivo con vista panorámica. 3 dormitorios grandes, dependencia de servicio, living comedor amplio, cocina separada, 2 baños completos y cochera fija. Administrado por inmobiliaria de primera línea.',
    direccion_calle: 'Junín y San Lorenzo',
    mostrar_direccion_exacta: false,
    tipo_inmueble: 'departamento',
    ambientes: 4,
    dormitorios: 3,
    banos: 2,
    cochera: true,
    terraza_balcon: true,
    patio: false,
    acepta_mascotas: false,
    aire_acondicionado: true,
    pileta: false,
    moneda: 'ARS',
    precio_mensual: 620000,
    expensas_incluidas: false,
    expensas_monto: 60000,
    estado: 'activa',
    destacada: false,
    visitas_count: 95,
    created_at: new Date(Date.now() - 86400000 * 3).toISOString(),
    updated_at: new Date().toISOString(),
    provincias: { id: 1, nombre: 'Corrientes', slug: 'corrientes', activo: true, created_at: '' },
    localidades: { id: 1, provincia_id: 1, nombre: 'Corrientes Capital', slug: 'corrientes-capital', activo: true, created_at: '' },
    barrios: { id: 1, localidad_id: 1, nombre: 'Centro', slug: 'centro', activo: true, created_at: '' },
    profiles: {
      id: 'user-4',
      tipo_anunciante: 'inmobiliaria',
      nombre_completo: 'Agustín Valenzuela',
      nombre_inmobiliaria: 'Inmobiliaria del Taragüí',
      matricula_inmobiliaria: 'CPIC-1049',
      whatsapp: '5493794998877',
      email_contacto: 'contacto@taraguiprop.com.ar',
      created_at: '',
      updated_at: '',
    },
    propiedad_fotos: [
      {
        id: 'foto-6',
        propiedad_id: 'prop-4',
        storage_path: 'https://images.unsplash.com/photo-1502005229762-ee152da7c5d6?auto=format&fit=crop&w=1000&q=80',
        orden: 0,
        es_portada: true,
        created_at: '',
      },
    ],
  },
];

export async function searchProperties(filters: Partial<PropertyFilterInput> = {}) {
  const parsed = propertyFilterSchema.safeParse(filters);
  const validated = parsed.success ? parsed.data : propertyFilterSchema.parse({});

  try {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      return filterDemoProperties(validated);
    }

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

    if (error || !data || data.length === 0) {
      return filterDemoProperties(validated);
    }

    // Filtrar tipo anunciante si se especificó
    let results = data as Propiedad[];
    if (validated.tipoAnunciante) {
      results = results.filter((p) => p.profiles?.tipo_anunciante === validated.tipoAnunciante);
    }

    return {
      properties: results,
      totalCount: count ?? results.length,
      page: validated.page,
      limit: validated.limit,
      totalPages: Math.ceil((count ?? results.length) / validated.limit),
    };
  } catch {
    return filterDemoProperties(validated);
  }
}

function filterDemoProperties(filters: PropertyFilterInput) {
  let list = [...DEMO_PROPERTIES];

  if (filters.provinciaId) {
    list = list.filter((p) => p.provincia_id === filters.provinciaId);
  }
  if (filters.localidadId) {
    list = list.filter((p) => p.localidad_id === filters.localidadId);
  }
  if (filters.barrioId) {
    list = list.filter((p) => p.barrio_id === filters.barrioId);
  }
  if (filters.tipoInmueble) {
    list = list.filter((p) => p.tipo_inmueble === filters.tipoInmueble);
  }
  if (filters.tipoAnunciante) {
    list = list.filter((p) => p.profiles?.tipo_anunciante === filters.tipoAnunciante);
  }
  if (filters.ambientes) {
    if (filters.ambientes >= 4) {
      list = list.filter((p) => p.ambientes >= 4);
    } else {
      list = list.filter((p) => p.ambientes === filters.ambientes);
    }
  }
  if (filters.precioMin) {
    list = list.filter((p) => p.precio_mensual >= filters.precioMin!);
  }
  if (filters.precioMax) {
    list = list.filter((p) => p.precio_mensual <= filters.precioMax!);
  }
  if (filters.cochera) {
    list = list.filter((p) => p.cochera);
  }
  if (filters.terrazaBalcon) {
    list = list.filter((p) => p.terraza_balcon);
  }
  if (filters.patio) {
    list = list.filter((p) => p.patio);
  }
  if (filters.aceptaMascotas) {
    list = list.filter((p) => p.acepta_mascotas);
  }
  if (filters.expensasIncluidas) {
    list = list.filter((p) => p.expensas_incluidas);
  }

  // Ordenar
  if (filters.ordenarPor === 'precio_asc') {
    list.sort((a, b) => a.precio_mensual - b.precio_mensual);
  } else if (filters.ordenarPor === 'precio_desc') {
    list.sort((a, b) => b.precio_mensual - a.precio_mensual);
  } else {
    // Destacadas primero
    list.sort((a, b) => (b.destacada ? 1 : 0) - (a.destacada ? 1 : 0));
  }

  const totalCount = list.length;
  const from = (filters.page - 1) * filters.limit;
  const paginated = list.slice(from, from + filters.limit);

  return {
    properties: paginated,
    totalCount,
    page: filters.page,
    limit: filters.limit,
    totalPages: Math.ceil(totalCount / filters.limit) || 1,
  };
}

export async function getPropertyById(id: string): Promise<Propiedad | null> {
  try {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      return DEMO_PROPERTIES.find((p) => p.id === id) || null;
    }
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

    if (error || !data) {
      return DEMO_PROPERTIES.find((p) => p.id === id) || null;
    }
    return data as Propiedad;
  } catch {
    return DEMO_PROPERTIES.find((p) => p.id === id) || null;
  }
}

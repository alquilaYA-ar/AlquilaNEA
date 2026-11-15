export type TipoAnunciante = 'admin' | 'dueno_directo' | 'inmobiliaria';
export type TipoInmueble = 'departamento' | 'casa' | 'ph' | 'oficina' | 'local' | 'monoambiente';
export type EstadoPropiedad = 'borrador' | 'activa' | 'pausada' | 'alquilada';
export type Moneda = 'ARS' | 'USD';

export interface Provincia {
  id: number;
  nombre: string;
  slug: string;
  activo: boolean;
  created_at: string;
}

export interface Localidad {
  id: number;
  provincia_id: number;
  nombre: string;
  slug: string;
  activo: boolean;
  created_at: string;
}

export interface Barrio {
  id: number;
  localidad_id: number;
  nombre: string;
  slug: string;
  activo: boolean;
  created_at: string;
}

export interface Profile {
  id: string;
  tipo_anunciante: TipoAnunciante;
  es_admin?: boolean;
  nombre_completo: string;
  nombre_inmobiliaria?: string | null;
  matricula_inmobiliaria?: string | null;
  telefono?: string | null;
  whatsapp: string;
  email_contacto: string;
  avatar_url?: string | null;
  created_at: string;
  updated_at: string;
}

export interface PropiedadFoto {
  id: string;
  propiedad_id: string;
  storage_path: string;
  orden: number;
  es_portada: boolean;
  created_at: string;
}

export interface Propiedad {
  id: string;
  anunciante_id: string;
  provincia_id: number;
  localidad_id: number;
  barrio_id?: number | null;
  titulo: string;
  descripcion: string;
  direccion_calle?: string | null;
  mostrar_direccion_exacta: boolean;
  tipo_inmueble: TipoInmueble;
  ambientes: number;
  dormitorios: number;
  banos: number;
  cochera: boolean;
  terraza_balcon: boolean;
  patio: boolean;
  acepta_mascotas: boolean;
  aire_acondicionado: boolean;
  pileta: boolean;
  moneda: Moneda;
  precio_mensual: number;
  expensas_incluidas: boolean;
  expensas_monto: number;
  estado: EstadoPropiedad;
  destacada: boolean;
  destacada_hasta?: string | null;
  visitas_count: number;
  created_at: string;
  updated_at: string;
  
  // Relaciones anidadas
  provincias?: Provincia;
  localidades?: Localidad;
  barrios?: Barrio;
  profiles?: Profile;
  propiedad_fotos?: PropiedadFoto[];
}


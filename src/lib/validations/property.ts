import { z } from 'zod';

export const propertyFilterSchema = z.object({
  provinciaId: z.coerce.number().optional(),
  localidadId: z.coerce.number().optional(),
  barrioId: z.coerce.number().optional(),
  tipoAnunciante: z.enum(['dueno_directo', 'inmobiliaria']).optional(),
  tipoInmueble: z.enum(['departamento', 'casa', 'ph', 'oficina', 'local', 'monoambiente']).optional(),
  ambientes: z.coerce.number().min(1).max(10).optional(),
  precioMin: z.coerce.number().min(0).optional(),
  precioMax: z.coerce.number().min(0).optional(),
  cochera: z.coerce.boolean().optional(),
  terrazaBalcon: z.coerce.boolean().optional(),
  patio: z.coerce.boolean().optional(),
  aceptaMascotas: z.coerce.boolean().optional(),
  expensasIncluidas: z.coerce.boolean().optional(),
  ordenarPor: z.enum(['precio_asc', 'precio_desc', 'recientes']).default('recientes'),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(50).default(12),
});

export type PropertyFilterInput = z.infer<typeof propertyFilterSchema>;

export const TIPOS_INMUEBLE = ['departamento', 'casa', 'ph', 'oficina', 'local', 'monoambiente'] as const;

export const TIPOS_INMUEBLE_LABELS: Record<(typeof TIPOS_INMUEBLE)[number], string> = {
  departamento: 'Departamento',
  casa: 'Casa',
  ph: 'PH',
  oficina: 'Oficina',
  local: 'Local Comercial',
  monoambiente: 'Monoambiente',
};

export const createPropertySchema = z.object({
  provinciaId: z.coerce.number({ required_error: 'La provincia es obligatoria' }).int().positive(),
  localidadId: z.coerce.number({ required_error: 'La localidad es obligatoria' }).int().positive(),
  barrioId: z.coerce.number().int().positive().optional().nullable(),
  titulo: z.string().trim().min(5, 'El título debe tener al menos 5 caracteres').max(160, 'El título no puede superar los 160 caracteres'),
  descripcion: z.string().trim().min(20, 'La descripción debe tener al menos 20 caracteres').max(3000, 'La descripción no puede superar los 3000 caracteres'),
  direccionCalle: z.string().trim().max(200, 'La dirección no puede superar los 200 caracteres').optional().nullable(),
  tipoInmueble: z.enum(TIPOS_INMUEBLE),
  ambientes: z.coerce.number().int().min(1, 'Mínimo 1 ambiente').max(20, 'Máximo 20 ambientes'),
  dormitorios: z.coerce.number().int().min(0).max(15, 'Máximo 15 dormitorios'),
  banos: z.coerce.number().int().min(1, 'Mínimo 1 baño').max(10, 'Máximo 10 baños'),
  cochera: z.boolean().default(false),
  terrazaBalcon: z.boolean().default(false),
  patio: z.boolean().default(false),
  aceptaMascotas: z.boolean().default(false),
  aireAcondicionado: z.boolean().default(false),
  pileta: z.boolean().default(false),
  precioMensual: z.coerce.number().positive('El precio debe ser mayor a 0').max(1_000_000_000, 'El precio es demasiado alto'),
  expensasIncluidas: z.boolean().default(true),
  expensasMonto: z.coerce.number().min(0).max(100_000_000, 'El monto de expensas es demasiado alto').default(0),
  fotosUrls: z.array(z.string().url().max(500)).max(10, 'Máximo 10 fotos').default([]),
});

export const updatePropertySchema = createPropertySchema
  .omit({ provinciaId: true, localidadId: true, barrioId: true, direccionCalle: true, fotosUrls: true })
  .extend({
    propertyId: z.string().uuid('Identificador de propiedad inválido'),
    estado: z.enum(['activa', 'pausada', 'alquilada']),
  });

export type CreatePropertyInput = z.infer<typeof createPropertySchema>;

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

export const createPropertySchema = z.object({
  provinciaId: z.coerce.number({ required_error: 'La provincia es obligatoria' }),
  localidadId: z.coerce.number({ required_error: 'La localidad es obligatoria' }),
  barrioId: z.coerce.number().optional().nullable(),
  titulo: z.string().min(5, 'El título debe tener al menos 5 caracteres').max(160),
  descripcion: z.string().min(20, 'La descripción debe tener al menos 20 caracteres'),
  direccionCalle: z.string().optional().nullable(),
  mostrarDireccionExacta: z.boolean().default(false),
  tipoInmueble: z.enum(['departamento', 'casa', 'ph', 'oficina', 'local', 'monoambiente']),
  ambientes: z.coerce.number().min(1, 'Mínimo 1 ambiente'),
  dormitorios: z.coerce.number().min(0),
  banos: z.coerce.number().min(1),
  cochera: z.boolean().default(false),
  terrazaBalcon: z.boolean().default(false),
  patio: z.boolean().default(false),
  aceptaMascotas: z.boolean().default(false),
  aireAcondicionado: z.boolean().default(false),
  pileta: z.boolean().default(false),
  moneda: z.enum(['ARS', 'USD']).default('ARS'),
  precioMensual: z.coerce.number().positive('El precio debe ser mayor a 0'),
  expensasIncluidas: z.boolean().default(true),
  expensasMonto: z.coerce.number().min(0).default(0),
});

export type CreatePropertyInput = z.infer<typeof createPropertySchema>;


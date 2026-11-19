import { z } from 'zod';

// Letras (con acentos), espacios, apóstrofes, puntos y guiones
const NAME_REGEX = /^[\p{L}][\p{L}\s'.\-]*$/u;
// Dígitos, espacios, guiones, paréntesis y + (se normaliza luego)
const PHONE_REGEX = /^[+\d][\d\s\-()]*$/;

export const emailSchema = z
  .string({ required_error: 'El correo es obligatorio' })
  .trim()
  .toLowerCase()
  .min(5, 'El correo es demasiado corto')
  .max(150, 'El correo no puede superar los 150 caracteres')
  .email('Ingresá un correo electrónico válido (ej: nombre@dominio.com)');

export const passwordSchema = z
  .string({ required_error: 'La contraseña es obligatoria' })
  .min(8, 'La contraseña debe tener al menos 8 caracteres')
  .max(72, 'La contraseña no puede superar los 72 caracteres')
  .regex(/[A-Za-z]/, 'La contraseña debe incluir al menos una letra')
  .regex(/\d/, 'La contraseña debe incluir al menos un número');

export const nombreSchema = z
  .string({ required_error: 'El nombre es obligatorio' })
  .trim()
  .min(2, 'El nombre debe tener al menos 2 caracteres')
  .max(100, 'El nombre no puede superar los 100 caracteres')
  .regex(NAME_REGEX, 'El nombre solo puede contener letras y espacios');

export const phoneSchema = z
  .string()
  .trim()
  .max(30, 'El teléfono es demasiado largo')
  .regex(PHONE_REGEX, 'El teléfono solo puede contener números')
  .refine((v) => {
    const digits = v.replace(/\D/g, '');
    return digits.length >= 8 && digits.length <= 15;
  }, 'El teléfono debe tener entre 8 y 15 dígitos');

export const signUpSchema = z
  .object({
    email: emailSchema,
    password: passwordSchema,
    nombreCompleto: nombreSchema,
    whatsapp: phoneSchema,
    tipoAnunciante: z.enum(['dueno_directo', 'inmobiliaria']),
    nombreInmobiliaria: z.string().trim().max(150, 'El nombre de la inmobiliaria no puede superar los 150 caracteres').optional(),
    matriculaInmobiliaria: z
      .string()
      .trim()
      .max(50, 'La matrícula no puede superar los 50 caracteres')
      .regex(/^[\p{L}\d\s.\-/]*$/u, 'La matrícula contiene caracteres no válidos')
      .optional(),
    telefono: phoneSchema.optional().or(z.literal('')),
  })
  .superRefine((val, ctx) => {
    if (val.tipoAnunciante === 'inmobiliaria' && !val.nombreInmobiliaria?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['nombreInmobiliaria'],
        message: 'El nombre de la inmobiliaria es obligatorio',
      });
    }
  });

export const signInSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'La contraseña es obligatoria').max(72),
});

export const updateProfileSchema = z.object({
  nombreCompleto: nombreSchema,
  whatsapp: phoneSchema,
  telefono: phoneSchema.optional().or(z.literal('')),
  nombreInmobiliaria: z
    .string()
    .trim()
    .max(150, 'El nombre de la inmobiliaria no puede superar los 150 caracteres')
    .optional(),
  matriculaInmobiliaria: z
    .string()
    .trim()
    .max(50, 'La matrícula no puede superar los 50 caracteres')
    .regex(/^[\p{L}\d\s.\-/]*$/u, 'La matrícula contiene caracteres no válidos')
    .optional(),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;

export const contactMessageSchema = z.object({
  nombre: nombreSchema,
  email: emailSchema,
  telefono: phoneSchema.optional().or(z.literal('')),
  motivo: z.enum(['soporte', 'inmobiliaria', 'denuncia', 'sugerencia']),
  mensaje: z
    .string({ required_error: 'El mensaje es obligatorio' })
    .trim()
    .min(10, 'El mensaje debe tener al menos 10 caracteres')
    .max(2000, 'El mensaje no puede superar los 2000 caracteres'),
  // Campo trampa anti-bots: debe llegar vacío
  website: z.string().max(0).optional(),
});

export type ContactMessageInput = z.infer<typeof contactMessageSchema>;

export function firstZodError(error: z.ZodError): string {
  return error.issues[0]?.message || 'Datos inválidos';
}


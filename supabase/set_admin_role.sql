-- ==============================================================================
-- SISTEMA DE ROLES Y ASIGNACIÓN DE ADMINISTRADOR
-- Ejecutar en Supabase: SQL Editor -> New Query -> Run
-- ==============================================================================

-- 1. Agregar 'admin' al tipo de datos enum de la base de datos (si no se agregó antes)
DO $$ BEGIN
    ALTER TYPE tipo_anunciante_enum ADD VALUE IF NOT EXISTS 'admin';
EXCEPTION WHEN duplicate_object THEN null;
END $$;

-- 2. Agregar columnas 'es_admin' y 'suspendido' a la tabla profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS es_admin BOOLEAN DEFAULT FALSE;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS suspendido BOOLEAN DEFAULT FALSE;

-- 3. Limpiar datos de inmobiliaria y asignar rol de Administrador Puro a tu cuenta
UPDATE public.profiles
SET 
  tipo_anunciante = 'admin',
  es_admin = TRUE,
  suspendido = FALSE,
  nombre_completo = 'Administrador General',
  nombre_inmobiliaria = NULL,
  matricula_inmobiliaria = NULL
WHERE email_contacto = 'gonza18av@gmail.com';

-- 4. Verificar el cambio
SELECT id, nombre_completo, email_contacto, tipo_anunciante, es_admin, suspendido, nombre_inmobiliaria
FROM public.profiles 
WHERE email_contacto = 'gonza18av@gmail.com';

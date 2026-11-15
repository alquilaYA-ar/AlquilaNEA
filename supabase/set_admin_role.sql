-- ==============================================================================
-- SISTEMA DE ROLES Y ASIGNACIÓN DE ADMINISTRADOR
-- Ejecutar en Supabase: SQL Editor -> New Query -> Run
-- ==============================================================================

-- 1. Agregar 'admin' al tipo de datos enum de la base de datos
DO $$ BEGIN
    ALTER TYPE tipo_anunciante_enum ADD VALUE IF NOT EXISTS 'admin';
EXCEPTION WHEN duplicate_object THEN null;
END $$;

-- 2. Agregar columna 'es_admin' a la tabla profiles si no existe
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS es_admin BOOLEAN DEFAULT FALSE;

-- 3. Asignar rol de Administrador a tu correo
UPDATE public.profiles
SET 
  tipo_anunciante = 'admin',
  es_admin = TRUE
WHERE email_contacto = 'gonza18av@gmail.com';

-- 4. Verificar el cambio
SELECT id, nombre_completo, email_contacto, tipo_anunciante, es_admin 
FROM public.profiles 
WHERE email_contacto = 'gonza18av@gmail.com';

-- ==============================================================================
-- FIX HANDLE_NEW_USER TRIGGER (A prueba de fallos para Dueños e Inmobiliarias)
-- Ejecutar en: Supabase Dashboard -> SQL Editor -> New Query -> Run
-- ==============================================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  v_tipo public.tipo_anunciante_enum;
BEGIN
  -- Intentar castear el tipo de anunciante de forma segura
  BEGIN
    v_tipo := (NEW.raw_user_meta_data->>'tipo_anunciante')::public.tipo_anunciante_enum;
  EXCEPTION WHEN OTHERS THEN
    v_tipo := 'dueno_directo'::public.tipo_anunciante_enum;
  END;

  IF v_tipo IS NULL THEN
    v_tipo := 'dueno_directo'::public.tipo_anunciante_enum;
  END IF;

  INSERT INTO public.profiles (
    id, 
    nombre_completo, 
    whatsapp, 
    email_contacto, 
    tipo_anunciante,
    nombre_inmobiliaria,
    matricula_inmobiliaria,
    telefono
  )
  VALUES (
    NEW.id,
    COALESCE(NULLIF(NEW.raw_user_meta_data->>'nombre_completo', ''), 'Nuevo Usuario'),
    COALESCE(NULLIF(NEW.raw_user_meta_data->>'whatsapp', ''), '0000000000'),
    COALESCE(NULLIF(NEW.email, ''), ''),
    v_tipo,
    NEW.raw_user_meta_data->>'nombre_inmobiliaria',
    NEW.raw_user_meta_data->>'matricula_inmobiliaria',
    NEW.raw_user_meta_data->>'telefono'
  )
  ON CONFLICT (id) DO UPDATE SET
    nombre_completo = EXCLUDED.nombre_completo,
    whatsapp = EXCLUDED.whatsapp,
    tipo_anunciante = EXCLUDED.tipo_anunciante,
    nombre_inmobiliaria = EXCLUDED.nombre_inmobiliaria,
    matricula_inmobiliaria = EXCLUDED.matricula_inmobiliaria,
    telefono = EXCLUDED.telefono,
    updated_at = NOW();

  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  -- Prevenir que cualquier error en la tabla de profiles aborte la creación de auth.users (evita el 500)
  RAISE WARNING 'handle_new_user error atrapado: %', SQLERRM;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();


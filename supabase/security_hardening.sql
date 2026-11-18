-- ==============================================================================
-- AlquilaNEA: ENDURECIMIENTO DE SEGURIDAD (ejecutar UNA VEZ en Supabase SQL Editor)
-- Es idempotente: se puede volver a ejecutar sin problemas.
-- Requisito previo: haber ejecutado set_admin_role.sql (columnas es_admin / suspendido).
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. Función is_admin(): ¿el usuario autenticado actual es administrador?
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
      AND (es_admin = TRUE OR tipo_anunciante::text = 'admin')
      AND COALESCE(suspendido, FALSE) = FALSE
  );
$$;
GRANT EXECUTE ON FUNCTION public.is_admin() TO anon, authenticated;

-- ------------------------------------------------------------------------------
-- 2. handle_new_user: SOLO permite 'dueno_directo' o 'inmobiliaria' desde el registro.
--    (Antes cualquiera podía registrarse con tipo_anunciante='admin' vía API.)
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  v_tipo public.tipo_anunciante_enum;
  v_raw  TEXT;
BEGIN
  v_raw := NEW.raw_user_meta_data->>'tipo_anunciante';
  IF v_raw = 'inmobiliaria' THEN
    v_tipo := 'inmobiliaria'::public.tipo_anunciante_enum;
  ELSE
    v_tipo := 'dueno_directo'::public.tipo_anunciante_enum;
  END IF;

  INSERT INTO public.profiles (
    id, nombre_completo, whatsapp, email_contacto, tipo_anunciante,
    nombre_inmobiliaria, matricula_inmobiliaria, telefono
  )
  VALUES (
    NEW.id,
    LEFT(COALESCE(NULLIF(NEW.raw_user_meta_data->>'nombre_completo', ''), 'Nuevo Usuario'), 150),
    LEFT(COALESCE(NULLIF(NEW.raw_user_meta_data->>'whatsapp', ''), '0000000000'), 30),
    LEFT(COALESCE(NULLIF(NEW.email, ''), ''), 150),
    v_tipo,
    LEFT(NEW.raw_user_meta_data->>'nombre_inmobiliaria', 150),
    LEFT(NEW.raw_user_meta_data->>'matricula_inmobiliaria', 50),
    LEFT(NEW.raw_user_meta_data->>'telefono', 30)
  )
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  RAISE WARNING 'handle_new_user error atrapado: %', SQLERRM;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- ------------------------------------------------------------------------------
-- 3. Anti escalada de privilegios en profiles:
--    un usuario común NO puede cambiarse es_admin / tipo_anunciante / suspendido / email.
--    (auth.uid() NULL = SQL Editor / service_role: se permite, así set_admin_role.sql funciona.)
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.protect_profile_privileged_columns()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NOT NULL AND NOT public.is_admin() THEN
    NEW.es_admin := OLD.es_admin;
    NEW.tipo_anunciante := OLD.tipo_anunciante;
    NEW.suspendido := OLD.suspendido;
    NEW.email_contacto := OLD.email_contacto;
  END IF;
  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_protect_profile_columns ON public.profiles;
CREATE TRIGGER trg_protect_profile_columns
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE PROCEDURE public.protect_profile_privileged_columns();

-- Un usuario suspendido no puede reactivar sus propias publicaciones ni crear nuevas.
CREATE OR REPLACE FUNCTION public.block_suspended_publishers()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_susp BOOLEAN;
BEGIN
  IF auth.uid() IS NULL OR public.is_admin() THEN
    RETURN NEW;
  END IF;
  SELECT COALESCE(suspendido, FALSE) INTO v_susp FROM public.profiles WHERE id = auth.uid();
  IF v_susp AND NEW.estado = 'activa' THEN
    RAISE EXCEPTION 'Tu cuenta está suspendida. Contactá a soporte.';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_block_suspended_publishers ON public.propiedades;
CREATE TRIGGER trg_block_suspended_publishers
  BEFORE INSERT OR UPDATE ON public.propiedades
  FOR EACH ROW EXECUTE PROCEDURE public.block_suspended_publishers();

-- ------------------------------------------------------------------------------
-- 4. Políticas RLS para el ADMINISTRADOR (sin necesidad de service_role key)
--    Esto permite que suspender usuarios pause SUS publicaciones realmente.
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Admin lee todas las propiedades" ON public.propiedades;
CREATE POLICY "Admin lee todas las propiedades" ON public.propiedades
  FOR SELECT USING (public.is_admin());

DROP POLICY IF EXISTS "Admin edita todas las propiedades" ON public.propiedades;
CREATE POLICY "Admin edita todas las propiedades" ON public.propiedades
  FOR UPDATE USING (public.is_admin());

DROP POLICY IF EXISTS "Admin elimina propiedades" ON public.propiedades;
CREATE POLICY "Admin elimina propiedades" ON public.propiedades
  FOR DELETE USING (public.is_admin());

DROP POLICY IF EXISTS "Admin edita perfiles" ON public.profiles;
CREATE POLICY "Admin edita perfiles" ON public.profiles
  FOR UPDATE USING (public.is_admin());

-- Borrado COMPLETO de un usuario (auth.users -> profiles -> propiedades -> fotos en cascada).
CREATE OR REPLACE FUNCTION public.admin_delete_user(target_user UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Permisos insuficientes. Solo administradores.';
  END IF;
  IF target_user = auth.uid() THEN
    RAISE EXCEPTION 'No podés eliminar tu propia cuenta de administrador.';
  END IF;
  DELETE FROM auth.users WHERE id = target_user;
END;
$$;
REVOKE ALL ON FUNCTION public.admin_delete_user(UUID) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_delete_user(UUID) TO authenticated;

-- ------------------------------------------------------------------------------
-- 5. Privacidad: visitantes anónimos NO pueden leer email / teléfono / flags de admin.
--    (El WhatsApp sí es público porque es el canal de contacto del aviso.)
-- ------------------------------------------------------------------------------
REVOKE SELECT ON public.profiles FROM anon;
GRANT SELECT (id, nombre_completo, nombre_inmobiliaria, matricula_inmobiliaria,
              tipo_anunciante, whatsapp, avatar_url, created_at)
  ON public.profiles TO anon;

-- ------------------------------------------------------------------------------
-- 6. Storage: solo usuarios autenticados suben a SU carpeta (<uid>/archivo).
--    Límite 5 MB y solo imágenes JPG/PNG/WEBP.
-- ------------------------------------------------------------------------------
UPDATE storage.buckets
SET public = TRUE,
    file_size_limit = 5242880,
    allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp']
WHERE id = 'properties';

DROP POLICY IF EXISTS "Permitir subida properties" ON storage.objects;
DROP POLICY IF EXISTS "Permitir actualizacion properties" ON storage.objects;
DROP POLICY IF EXISTS "Permitir eliminacion properties" ON storage.objects;
DROP POLICY IF EXISTS "Subida autenticada propia carpeta" ON storage.objects;
DROP POLICY IF EXISTS "Actualizar archivos propios" ON storage.objects;
DROP POLICY IF EXISTS "Eliminar archivos propios" ON storage.objects;

CREATE POLICY "Subida autenticada propia carpeta" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'properties' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Actualizar archivos propios" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'properties' AND ((storage.foldername(name))[1] = auth.uid()::text OR public.is_admin()));

CREATE POLICY "Eliminar archivos propios" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'properties' AND ((storage.foldername(name))[1] = auth.uid()::text OR public.is_admin()));

-- ------------------------------------------------------------------------------
-- 7. Mensajes del formulario de Contacto (visibles SOLO para el admin)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.mensajes_contacto (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre VARCHAR(100) NOT NULL CHECK (char_length(nombre) BETWEEN 2 AND 100),
  email VARCHAR(150) NOT NULL CHECK (char_length(email) BETWEEN 5 AND 150 AND email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  telefono VARCHAR(30) CHECK (telefono IS NULL OR char_length(telefono) <= 30),
  motivo VARCHAR(20) NOT NULL CHECK (motivo IN ('soporte', 'inmobiliaria', 'denuncia', 'sugerencia')),
  mensaje VARCHAR(2000) NOT NULL CHECK (char_length(mensaje) BETWEEN 10 AND 2000),
  leido BOOLEAN NOT NULL DEFAULT FALSE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.mensajes_contacto ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Cualquiera envía mensajes de contacto" ON public.mensajes_contacto;
CREATE POLICY "Cualquiera envía mensajes de contacto" ON public.mensajes_contacto
  FOR INSERT TO anon, authenticated
  WITH CHECK (leido = FALSE AND (user_id IS NULL OR user_id = auth.uid()));

DROP POLICY IF EXISTS "Admin lee mensajes" ON public.mensajes_contacto;
CREATE POLICY "Admin lee mensajes" ON public.mensajes_contacto
  FOR SELECT TO authenticated USING (public.is_admin());

DROP POLICY IF EXISTS "Admin actualiza mensajes" ON public.mensajes_contacto;
CREATE POLICY "Admin actualiza mensajes" ON public.mensajes_contacto
  FOR UPDATE TO authenticated USING (public.is_admin());

DROP POLICY IF EXISTS "Admin elimina mensajes" ON public.mensajes_contacto;
CREATE POLICY "Admin elimina mensajes" ON public.mensajes_contacto
  FOR DELETE TO authenticated USING (public.is_admin());

-- Tiempo real para el panel de administración
DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.mensajes_contacto;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

-- ------------------------------------------------------------------------------
-- 8. Restricciones de integridad en propiedades (NOT VALID = no revisa datos viejos)
-- ------------------------------------------------------------------------------
DO $$ BEGIN
  ALTER TABLE public.propiedades
    ADD CONSTRAINT chk_prop_precio CHECK (precio_mensual > 0 AND precio_mensual <= 1000000000) NOT VALID;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE public.propiedades
    ADD CONSTRAINT chk_prop_titulo CHECK (char_length(titulo) BETWEEN 5 AND 160) NOT VALID;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE public.propiedades
    ADD CONSTRAINT chk_prop_descripcion CHECK (char_length(descripcion) BETWEEN 20 AND 3000) NOT VALID;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

NOTIFY pgrst, 'reload schema';

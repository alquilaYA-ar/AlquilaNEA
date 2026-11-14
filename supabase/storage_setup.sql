-- ==============================================================================
-- AlquilaNEA: Configuración y Políticas de Acceso para Supabase Storage
-- Bucket: properties
-- ==============================================================================

-- 1. Crear el bucket 'properties' si no existe y asegurar que sea público
INSERT INTO storage.buckets (id, name, public)
VALUES ('properties', 'properties', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- 2. Eliminar políticas anteriores si existieran
DROP POLICY IF EXISTS "Acceso publico lectura properties" ON storage.objects;
DROP POLICY IF EXISTS "Permitir subida properties" ON storage.objects;
DROP POLICY IF EXISTS "Permitir actualizacion properties" ON storage.objects;
DROP POLICY IF EXISTS "Permitir eliminacion properties" ON storage.objects;

-- 3. Permitir lectura pública de las imágenes
CREATE POLICY "Acceso publico lectura properties"
ON storage.objects FOR SELECT
USING (bucket_id = 'properties');

-- 4. Permitir subida de imágenes al bucket properties
CREATE POLICY "Permitir subida properties"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'properties');

-- 5. Permitir actualización y eliminación
CREATE POLICY "Permitir actualizacion properties"
ON storage.objects FOR UPDATE
USING (bucket_id = 'properties');

CREATE POLICY "Permitir eliminacion properties"
ON storage.objects FOR DELETE
USING (bucket_id = 'properties');


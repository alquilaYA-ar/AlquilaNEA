-- ==============================================================================
-- AlquilaYa: Initial Database Schema (Corrientes & Chaco)
-- Execute this script directly in the Supabase SQL Editor
-- ==============================================================================

-- 1. EXTENSIONES
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- 2. TIPOS ENUMERADOS
DO $$ BEGIN
    CREATE TYPE tipo_anunciante_enum AS ENUM ('dueno_directo', 'inmobiliaria');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE tipo_inmueble_enum AS ENUM ('departamento', 'casa', 'ph', 'oficina', 'local', 'monoambiente');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE estado_propiedad_enum AS ENUM ('borrador', 'activa', 'pausada', 'alquilada');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE moneda_enum AS ENUM ('ARS', 'USD');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE estado_pago_enum AS ENUM ('pending', 'approved', 'rejected');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE tipo_item_pago_enum AS ENUM ('alta_publicacion', 'destacar_aviso');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 3. JERARQUÍA GEOGRÁFICA (Escalable a todo el país)
CREATE TABLE IF NOT EXISTS public.provincias (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL UNIQUE,
    slug VARCHAR(100) NOT NULL UNIQUE,
    activo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.localidades (
    id SERIAL PRIMARY KEY,
    provincia_id INT NOT NULL REFERENCES public.provincias(id) ON DELETE CASCADE,
    nombre VARCHAR(120) NOT NULL,
    slug VARCHAR(120) NOT NULL,
    activo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT uq_localidad_provincia UNIQUE(provincia_id, slug)
);

CREATE TABLE IF NOT EXISTS public.barrios (
    id SERIAL PRIMARY KEY,
    localidad_id INT NOT NULL REFERENCES public.localidades(id) ON DELETE CASCADE,
    nombre VARCHAR(120) NOT NULL,
    slug VARCHAR(120) NOT NULL,
    activo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT uq_barrio_localidad UNIQUE(localidad_id, slug)
);

-- 4. PERFILES DE USUARIO / ANUNCIANTES (VINCULADO A auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    tipo_anunciante tipo_anunciante_enum NOT NULL DEFAULT 'dueno_directo',
    nombre_completo VARCHAR(150) NOT NULL,
    nombre_inmobiliaria VARCHAR(150),
    matricula_inmobiliaria VARCHAR(50),
    telefono VARCHAR(30),
    whatsapp VARCHAR(30) NOT NULL,
    email_contacto VARCHAR(150) NOT NULL,
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. TABLA DE PROPIEDADES
CREATE TABLE IF NOT EXISTS public.propiedades (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    anunciante_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    provincia_id INT NOT NULL REFERENCES public.provincias(id),
    localidad_id INT NOT NULL REFERENCES public.localidades(id),
    barrio_id INT REFERENCES public.barrios(id),
    
    titulo VARCHAR(160) NOT NULL,
    descripcion TEXT NOT NULL,
    direccion_calle VARCHAR(200),
    mostrar_direccion_exacta BOOLEAN DEFAULT FALSE,
    
    tipo_inmueble tipo_inmueble_enum NOT NULL,
    ambientes INT NOT NULL DEFAULT 1,
    dormitorios INT NOT NULL DEFAULT 1,
    banos INT NOT NULL DEFAULT 1,
    
    -- Amenities / Comodidades
    cochera BOOLEAN DEFAULT FALSE,
    terraza_balcon BOOLEAN DEFAULT FALSE,
    patio BOOLEAN DEFAULT FALSE,
    acepta_mascotas BOOLEAN DEFAULT FALSE,
    aire_acondicionado BOOLEAN DEFAULT FALSE,
    pileta BOOLEAN DEFAULT FALSE,
    
    -- Precios y Expensas
    moneda moneda_enum DEFAULT 'ARS',
    precio_mensual NUMERIC(12, 2) NOT NULL,
    expensas_incluidas BOOLEAN DEFAULT TRUE,
    expensas_monto NUMERIC(12, 2) DEFAULT 0,
    
    -- Estado y Visibilidad
    estado estado_propiedad_enum DEFAULT 'activa',
    destacada BOOLEAN DEFAULT FALSE,
    destacada_hasta TIMESTAMPTZ,
    visitas_count INT DEFAULT 0,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. FOTOGRAFÍAS DE PROPIEDADES
CREATE TABLE IF NOT EXISTS public.propiedad_fotos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    propiedad_id UUID NOT NULL REFERENCES public.propiedades(id) ON DELETE CASCADE,
    storage_path TEXT NOT NULL,
    orden INT NOT NULL DEFAULT 0,
    es_portada BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. MODELO DE PAGOS Y MONETIZACIÓN (MERCADO PAGO)
CREATE TABLE IF NOT EXISTS public.pagos_publicacion (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    propiedad_id UUID NOT NULL REFERENCES public.propiedades(id) ON DELETE CASCADE,
    anunciante_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    mp_preference_id VARCHAR(100),
    mp_payment_id VARCHAR(100) UNIQUE,
    monto NUMERIC(10, 2) NOT NULL,
    estado estado_pago_enum DEFAULT 'pending',
    tipo_item tipo_item_pago_enum NOT NULL,
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. ÍNDICES DE RENDIMIENTO
CREATE INDEX IF NOT EXISTS idx_propiedades_geo ON public.propiedades (provincia_id, localidad_id, barrio_id);
CREATE INDEX IF NOT EXISTS idx_propiedades_estado ON public.propiedades (estado);
CREATE INDEX IF NOT EXISTS idx_propiedades_precio ON public.propiedades (precio_mensual);
CREATE INDEX IF NOT EXISTS idx_propiedades_filtros ON public.propiedades (tipo_inmueble, ambientes, cochera, terraza_balcon, acepta_mascotas);
CREATE INDEX IF NOT EXISTS idx_propiedad_fotos_propiedad ON public.propiedad_fotos (propiedad_id, orden);

-- 9. TRIGGERS
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, nombre_completo, whatsapp, email_contacto, tipo_anunciante)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'nombre_completo', 'Nuevo Usuario'),
    COALESCE(NEW.raw_user_meta_data->>'whatsapp', ''),
    COALESCE(NEW.email, ''),
    COALESCE((NEW.raw_user_meta_data->>'tipo_anunciante')::tipo_anunciante_enum, 'dueno_directo')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Trigger update timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_propiedades_updated_at ON public.propiedades;
CREATE TRIGGER trg_propiedades_updated_at BEFORE UPDATE ON public.propiedades FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();

DROP TRIGGER IF EXISTS trg_profiles_updated_at ON public.profiles;
CREATE TRIGGER trg_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();

-- 10. ROW LEVEL SECURITY (RLS)
ALTER TABLE public.provincias ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.localidades ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.barrios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.propiedades ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.propiedad_fotos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pagos_publicacion ENABLE ROW LEVEL SECURITY;

-- Políticas Geo
DO $$ BEGIN
    CREATE POLICY "Lectura pública de provincias" ON public.provincias FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE POLICY "Lectura pública de localidades" ON public.localidades FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE POLICY "Lectura pública de barrios" ON public.barrios FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Políticas Profiles
DO $$ BEGIN
    CREATE POLICY "Perfiles visibles públicamente" ON public.profiles FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE POLICY "Usuarios modifican su propio perfil" ON public.profiles FOR UPDATE USING (auth.uid() = id);
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Políticas Propiedades
DO $$ BEGIN
    CREATE POLICY "Cualquiera lee propiedades activas" ON public.propiedades FOR SELECT USING (estado = 'activa');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE POLICY "Anunciantes ven todas sus propiedades" ON public.propiedades FOR SELECT USING (auth.uid() = anunciante_id);
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE POLICY "Anunciantes insertan sus propiedades" ON public.propiedades FOR INSERT WITH CHECK (auth.uid() = anunciante_id);
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE POLICY "Anunciantes editan sus propiedades" ON public.propiedades FOR UPDATE USING (auth.uid() = anunciante_id);
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE POLICY "Anunciantes eliminan sus propiedades" ON public.propiedades FOR DELETE USING (auth.uid() = anunciante_id);
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Políticas Fotos
DO $$ BEGIN
    CREATE POLICY "Cualquiera ve las fotos de propiedades" ON public.propiedad_fotos FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE POLICY "Dueño gestiona fotos de su propiedad" ON public.propiedad_fotos FOR ALL USING (
        EXISTS (SELECT 1 FROM public.propiedades WHERE id = propiedad_fotos.propiedad_id AND anunciante_id = auth.uid())
    );
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- 11. DATOS SEMILLA (CORRIENTES & CHACO)
INSERT INTO public.provincias (id, nombre, slug) VALUES 
(1, 'Corrientes', 'corrientes'),
(2, 'Chaco', 'chaco')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.localidades (id, provincia_id, nombre, slug) VALUES 
(1, 1, 'Corrientes Capital', 'corrientes-capital'),
(2, 1, 'Paso de la Patria', 'paso-de-la-patria'),
(3, 1, 'Goya', 'goya'),
(4, 2, 'Resistencia', 'resistencia'),
(5, 2, 'Barranqueras', 'barranqueras'),
(6, 2, 'Fontana', 'fontana'),
(7, 2, 'Sáenz Peña', 'saenz-pena')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.barrios (localidad_id, nombre, slug) VALUES 
-- Corrientes Capital
(1, 'Centro', 'centro'),
(1, 'Camba Cuá', 'camba-cua'),
(1, 'Aldana', 'aldana'),
(1, 'Libertad', 'libertad'),
(1, 'La Cruz', 'la-cruz'),
(1, 'San Jerónimo', 'san-jeronimo'),
(1, 'Molina Punta', 'molina-punta'),
-- Resistencia
(4, 'Centro', 'centro'),
(4, 'Villa San Martín', 'villa-san-martin'),
(4, 'Villa Universidad', 'villa-universidad'),
(4, 'Santa Inés', 'santa-ines'),
(4, 'Los Troncos', 'los-troncos')
ON CONFLICT DO NOTHING;


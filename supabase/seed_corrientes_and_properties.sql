-- ==============================================================================
-- AlquilaYa: Carga masiva de Localidades de Corrientes, Barrios de Corrientes Capital
-- y Propiedades de Demostración reales en Supabase
-- ==============================================================================

-- 0. SINCRONIZAR SECUENCIAS DE AUTOINCREMENTO (SERIAL)
SELECT setval(pg_get_serial_sequence('public.localidades', 'id'), COALESCE(MAX(id), 1)) FROM public.localidades;
SELECT setval(pg_get_serial_sequence('public.barrios', 'id'), COALESCE(MAX(id), 1)) FROM public.barrios;
SELECT setval(pg_get_serial_sequence('public.provincias', 'id'), COALESCE(MAX(id), 1)) FROM public.provincias;

-- 1. LOCALIDADES DE LA PROVINCIA DE CORRIENTES (provincia_id = 1)
INSERT INTO public.localidades (provincia_id, nombre, slug) VALUES 
(1, 'Corrientes Capital', 'corrientes-capital'),
(1, 'Goya', 'goya'),
(1, 'Paso de la Patria', 'paso-de-la-patria'),
(1, 'Bella Vista', 'bella-vista'),
(1, 'Curuzú Cuatiá', 'curuzu-cuatia'),
(1, 'Mercedes', 'mercedes'),
(1, 'Esquina', 'esquina'),
(1, 'Santo Tomé', 'santo-tome'),
(1, 'Monte Caseros', 'monte-caseros'),
(1, 'Paso de los Libres', 'paso-de-los-libres'),
(1, 'Ituzaingó', 'ituzaingo'),
(1, 'Saladas', 'saladas'),
(1, 'San Roque', 'san-roque'),
(1, 'Empedrado', 'empedrado'),
(1, 'Santa Lucía', 'santa-lucia'),
(1, 'Itatí', 'itati'),
(1, 'Santa Ana de los Guácaras', 'santa-ana'),
(1, 'San Cosme', 'san-cosme'),
(1, 'Caá Catí', 'caa-cati'),
(1, 'Gobernador Virasoro', 'gobernador-virasoro'),
(1, 'La Cruz', 'la-cruz'),
(1, 'Alvear', 'alvear'),
(1, 'Concepción', 'concepcion'),
(1, 'Mburucuyá', 'mburucuya'),
(1, 'San Luis del Palmar', 'san-luis-del-palmar'),
(1, 'San Miguel', 'san-miguel'),
(1, 'Loreto', 'loreto'),
(1, 'Riachuelo', 'riachuelo'),
(1, 'El Sombrero', 'el-sombrero'),
(1, 'Lavalle', 'lavalle'),
(1, 'Perugorría', 'perugorria'),
(1, 'Sauce', 'sauce'),
(1, 'Mocoretá', 'mocoreta'),
(1, 'Juan Pujol', 'juan-pujol'),
(1, 'Bonpland', 'bonpland'),
(1, 'Yapeyú', 'yapeyu'),
(1, 'Colonia Liebig', 'colonia-liebig'),
(1, 'Colonia Carlos Pellegrini', 'colonia-carlos-pellegrini'),
(1, 'Ramada Paso', 'ramada-paso'),
(1, 'Mariano I. Loza', 'mariano-i-loza'),
(1, 'Chavarría', 'chavarria'),
(1, '9 de Julio', '9-de-julio')
ON CONFLICT (provincia_id, slug) DO UPDATE SET nombre = EXCLUDED.nombre;

-- 2. BARRIOS DE CORRIENTES CAPITAL
-- Obtenemos el ID de 'Corrientes Capital' dinámicamente
DO $$
DECLARE
    cap_id INT;
BEGIN
    SELECT id INTO cap_id FROM public.localidades WHERE provincia_id = 1 AND slug = 'corrientes-capital' LIMIT 1;
    
    IF cap_id IS NOT NULL THEN
        INSERT INTO public.barrios (localidad_id, nombre, slug) VALUES 
        (cap_id, 'Centro', 'centro'),
        (cap_id, 'Camba Cuá', 'camba-cua'),
        (cap_id, 'La Cruz', 'la-cruz'),
        (cap_id, 'Deportes', 'deportes'),
        (cap_id, 'Ferré', 'ferre'),
        (cap_id, 'Aldana', 'aldana'),
        (cap_id, 'Bañado Norte', 'banado-norte'),
        (cap_id, 'Cichero', 'cichero'),
        (cap_id, 'Yapeyú', 'yapeyu'),
        (cap_id, 'Celia', 'celia'),
        (cap_id, 'Antártida Argentina', 'antartida-argentina'),
        (cap_id, 'Libertad', 'libertad'),
        (cap_id, 'San Martín', 'san-martin'),
        (cap_id, 'San Benito', 'san-benito'),
        (cap_id, 'Arazatí', 'arazati'),
        (cap_id, 'Virgen de los Dolores', 'virgen-de-los-dolores'),
        (cap_id, 'Galván', 'galvan'),
        (cap_id, 'Pío X', 'pio-x'),
        (cap_id, 'Santa María (Mil Viviendas)', 'santa-maria-mil-viviendas'),
        (cap_id, 'Colombia Granaderos', 'colombia-granaderos'),
        (cap_id, 'Santa Rosa', 'santa-rosa'),
        (cap_id, 'Berón de Astrada', 'beron-de-astrada'),
        (cap_id, 'Unión', 'union'),
        (cap_id, 'Villa Chiquita', 'villa-chiquita'),
        (cap_id, 'Nuestra Señora de la Asunción', 'nuestra-senora-de-la-asuncion'),
        (cap_id, 'San Marcelo', 'san-marcelo'),
        (cap_id, 'San Jerónimo', 'san-jeronimo'),
        (cap_id, 'Universitario', 'universitario'),
        (cap_id, 'Popular', 'popular'),
        (cap_id, 'Industrial', 'industrial'),
        (cap_id, 'Anahí', 'anahi'),
        (cap_id, 'Sol de Mayo', 'sol-de-mayo'),
        (cap_id, 'Quinta Ferré', 'quinta-ferre'),
        (cap_id, 'Plácido Martínez', 'placido-martinez'),
        (cap_id, 'Itatí', 'itati'),
        (cap_id, 'Laguna Seca', 'laguna-seca'),
        (cap_id, '17 de Agosto', '17-de-agosto'),
        (cap_id, 'San Roque Este', 'san-roque-este'),
        (cap_id, 'San Roque Oeste', 'san-roque-oeste'),
        (cap_id, 'Independencia', 'independencia'),
        (cap_id, 'Alta Gracia', 'alta-gracia'),
        (cap_id, 'San Antonio', 'san-antonio'),
        (cap_id, 'Doctor Montaña', 'doctor-montana'),
        (cap_id, 'Esperanza', 'esperanza'),
        (cap_id, 'Pirayuí', 'pirayui'),
        (cap_id, 'Molina Punta', 'molina-punta'),
        (cap_id, 'Jardín', 'jardin'),
        (cap_id, 'Apipé', 'apipe'),
        (cap_id, 'Sor Assunta Pitrau', 'sor-assunta-pitrau'),
        (cap_id, 'San Antonio Oeste', 'san-antonio-oeste'),
        (cap_id, 'Bejarano', 'bejarano'),
        (cap_id, 'Perichón', 'perichon')
        ON CONFLICT (localidad_id, slug) DO UPDATE SET nombre = EXCLUDED.nombre;
    END IF;
END $$;

-- 3. CREAR USUARIOS ANUNCIANTES DEMO EN auth.users Y public.profiles
INSERT INTO auth.users (
    id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at
) VALUES 
(
    'a1111111-1111-1111-1111-111111111111',
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'carlos.romero@alquilaya.com',
    '$2a$10$abcdefghijklmnopqrstuuABCDEFGHIJKLMNOPQRSTUVWXYZ012345',
    NOW(),
    '{"provider":"email","providers":["email"]}',
    '{"nombre_completo":"Carlos Romero","whatsapp":"5493794123456","tipo_anunciante":"dueno_directo"}',
    NOW(),
    NOW()
),
(
    'a2222222-2222-2222-2222-222222222222',
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'mariana.duarte@alquilaya.com',
    '$2a$10$abcdefghijklmnopqrstuuABCDEFGHIJKLMNOPQRSTUVWXYZ012345',
    NOW(),
    '{"provider":"email","providers":["email"]}',
    '{"nombre_completo":"Mariana Duarte","whatsapp":"5493794889900","tipo_anunciante":"dueno_directo"}',
    NOW(),
    NOW()
),
(
    'a3333333-3333-3333-3333-333333333333',
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'contacto@taraguiprop.com.ar',
    '$2a$10$abcdefghijklmnopqrstuuABCDEFGHIJKLMNOPQRSTUVWXYZ012345',
    NOW(),
    '{"provider":"email","providers":["email"]}',
    '{"nombre_completo":"Agustín Valenzuela","nombre_inmobiliaria":"Inmobiliaria del Taragüí","matricula_inmobiliaria":"CPIC-1049","whatsapp":"5493794998877","tipo_anunciante":"inmobiliaria"}',
    NOW(),
    NOW()
),
(
    'a4444444-4444-4444-4444-444444444444',
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'info@gomezasociados.com',
    '$2a$10$abcdefghijklmnopqrstuuABCDEFGHIJKLMNOPQRSTUVWXYZ012345',
    NOW(),
    '{"provider":"email","providers":["email"]}',
    '{"nombre_completo":"Lic. Martín Gómez","nombre_inmobiliaria":"Gómez & Asociados Propiedades","matricula_inmobiliaria":"CPI-4821","whatsapp":"5493624771122","tipo_anunciante":"inmobiliaria"}',
    NOW(),
    NOW()
)
ON CONFLICT (id) DO NOTHING;

-- Asegurar actualización de perfiles con sus datos de contacto
INSERT INTO public.profiles (
    id, tipo_anunciante, nombre_completo, nombre_inmobiliaria, matricula_inmobiliaria, whatsapp, email_contacto
) VALUES 
('a1111111-1111-1111-1111-111111111111', 'dueno_directo', 'Carlos Romero', NULL, NULL, '5493794123456', 'carlos.romero@alquilaya.com'),
('a2222222-2222-2222-2222-222222222222', 'dueno_directo', 'Mariana Duarte', NULL, NULL, '5493794889900', 'mariana.duarte@alquilaya.com'),
('a3333333-3333-3333-3333-333333333333', 'inmobiliaria', 'Agustín Valenzuela', 'Inmobiliaria del Taragüí', 'CPIC-1049', '5493794998877', 'contacto@taraguiprop.com.ar'),
('a4444444-4444-4444-4444-444444444444', 'inmobiliaria', 'Lic. Martín Gómez', 'Gómez & Asociados Propiedades', 'CPI-4821', '5493624771122', 'info@gomezasociados.com')
ON CONFLICT (id) DO UPDATE SET
  tipo_anunciante = EXCLUDED.tipo_anunciante,
  nombre_completo = EXCLUDED.nombre_completo,
  nombre_inmobiliaria = EXCLUDED.nombre_inmobiliaria,
  matricula_inmobiliaria = EXCLUDED.matricula_inmobiliaria,
  whatsapp = EXCLUDED.whatsapp;

-- 4. INSERTAR PROPIEDADES REALES EN SUPABASE
DO $$
DECLARE
    cap_id INT;
    res_id INT;
    b_cambacua INT;
    b_centro_ctes INT;
    b_aldana INT;
    b_centro_res INT;
    b_sanmartin_res INT;
    
    p1_id UUID := 'b1111111-1111-1111-1111-111111111111';
    p2_id UUID := 'b2222222-2222-2222-2222-222222222222';
    p3_id UUID := 'b3333333-3333-3333-3333-333333333333';
    p4_id UUID := 'b4444444-4444-4444-4444-444444444444';
    p5_id UUID := 'b5555555-5555-5555-5555-555555555555';
BEGIN
    SELECT id INTO cap_id FROM public.localidades WHERE slug = 'corrientes-capital' LIMIT 1;
    SELECT id INTO res_id FROM public.localidades WHERE slug = 'resistencia' LIMIT 1;
    
    SELECT id INTO b_cambacua FROM public.barrios WHERE localidad_id = cap_id AND slug = 'camba-cua' LIMIT 1;
    SELECT id INTO b_centro_ctes FROM public.barrios WHERE localidad_id = cap_id AND slug = 'centro' LIMIT 1;
    SELECT id INTO b_aldana FROM public.barrios WHERE localidad_id = cap_id AND slug = 'aldana' LIMIT 1;
    SELECT id INTO b_centro_res FROM public.barrios WHERE localidad_id = res_id AND slug = 'centro' LIMIT 1;
    SELECT id INTO b_sanmartin_res FROM public.barrios WHERE localidad_id = res_id AND slug = 'villa-san-martin' LIMIT 1;

    -- Propiedad 1: Camba Cuá (Dueño directo)
    INSERT INTO public.propiedades (
        id, anunciante_id, provincia_id, localidad_id, barrio_id, titulo, descripcion, direccion_calle,
        tipo_inmueble, ambientes, dormitorios, banos, cochera, terraza_balcon, patio, acepta_mascotas,
        aire_acondicionado, pileta, moneda, precio_mensual, expensas_incluidas, expensas_monto, estado, destacada
    ) VALUES (
        p1_id,
        'a1111111-1111-1111-1111-111111111111',
        1, cap_id, b_cambacua,
        'Hermoso 2 Ambientes con Balcón y Cochera en Camba Cuá',
        'Excelente departamento en zona residencial de Camba Cuá, a 2 cuadras del parque. Muy luminoso, con cocina integrada, balcón al frente, dormitorio con placard y cochera cubierta en subsuelo.',
        'Chaco al 800',
        'departamento', 2, 1, 1, true, true, false, true, true, false, 'ARS', 380000, false, 45000, 'activa', true
    ) ON CONFLICT (id) DO NOTHING;

    -- Propiedad 2: Aldana / Universitario (Dueño directo)
    INSERT INTO public.propiedades (
        id, anunciante_id, provincia_id, localidad_id, barrio_id, titulo, descripcion, direccion_calle,
        tipo_inmueble, ambientes, dormitorios, banos, cochera, terraza_balcon, patio, acepta_mascotas,
        aire_acondicionado, pileta, moneda, precio_mensual, expensas_incluidas, expensas_monto, estado, destacada
    ) VALUES (
        p2_id,
        'a2222222-2222-2222-2222-222222222222',
        1, cap_id, b_aldana,
        'Monoambiente Amplio Cerca del Campus Universitario UNNE',
        'Monoambiente ideal para estudiantes o profesionales jóvenes. A pocas cuadras de las facultades de Exactas y Medicina. Cocina amoblada, baño completo con bañera, expensas incluidas en el alquiler.',
        'Velez Sarsfield al 1200',
        'monoambiente', 1, 0, 1, false, true, false, false, true, false, 'ARS', 260000, true, 0, 'activa', false
    ) ON CONFLICT (id) DO NOTHING;

    -- Propiedad 3: Centro Corrientes (Inmobiliaria del Taragüí)
    INSERT INTO public.propiedades (
        id, anunciante_id, provincia_id, localidad_id, barrio_id, titulo, descripcion, direccion_calle,
        tipo_inmueble, ambientes, dormitorios, banos, cochera, terraza_balcon, patio, acepta_mascotas,
        aire_acondicionado, pileta, moneda, precio_mensual, expensas_incluidas, expensas_monto, estado, destacada
    ) VALUES (
        p3_id,
        'a3333333-3333-3333-3333-333333333333',
        1, cap_id, b_centro_ctes,
        'Piso Exclusivo 3 Dormitorios Frente a Plaza Cabral',
        'Piso de categoría con vista abierta a la plaza. 3 dormitorios grandes, dependencia de servicio, living comedor amplio, cocina comedor separada, 2 baños completos y cochera fija techada.',
        'Junín y San Lorenzo',
        'departamento', 4, 3, 2, true, true, false, false, true, false, 'ARS', 620000, false, 60000, 'activa', true
    ) ON CONFLICT (id) DO NOTHING;

    -- Propiedad 4: Resistencia Centro (Dueño Directo)
    INSERT INTO public.propiedades (
        id, anunciante_id, provincia_id, localidad_id, barrio_id, titulo, descripcion, direccion_calle,
        tipo_inmueble, ambientes, dormitorios, banos, cochera, terraza_balcon, patio, acepta_mascotas,
        aire_acondicionado, pileta, moneda, precio_mensual, expensas_incluidas, expensas_monto, estado, destacada
    ) VALUES (
        p4_id,
        'a2222222-2222-2222-2222-222222222222',
        2, res_id, b_centro_res,
        'Moderno Departamento 1 Habitación a Estrenar - Sin Comisión',
        'Ubicado a 3 cuadras de la Plaza 25 de Mayo. Edificio con ascensor de última generación, portero visor, termotanque solar y bajo costo de mantenimiento.',
        'Julio A. Roca 250',
        'departamento', 2, 1, 1, false, true, false, false, true, false, 'ARS', 290000, true, 0, 'activa', false
    ) ON CONFLICT (id) DO NOTHING;

    -- Propiedad 5: Resistencia Villa San Martín (Inmobiliaria Gómez)
    INSERT INTO public.propiedades (
        id, anunciante_id, provincia_id, localidad_id, barrio_id, titulo, descripcion, direccion_calle,
        tipo_inmueble, ambientes, dormitorios, banos, cochera, terraza_balcon, patio, acepta_mascotas,
        aire_acondicionado, pileta, moneda, precio_mensual, expensas_incluidas, expensas_monto, estado, destacada
    ) VALUES (
        p5_id,
        'a4444444-4444-4444-4444-444444444444',
        2, res_id, b_sanmartin_res,
        'Casa 3 Ambientes con Gran Patio y Cochera Doble',
        'Propiedad espaciosa en Villa San Martín. Cuenta con 2 dormitorios con placares, 2 baños, living, cocina comedor, quincho con parrilla y garage techado para 2 vehículos.',
        'Avenida Italia al 1100',
        'casa', 3, 2, 2, true, false, true, true, true, false, 'ARS', 550000, true, 0, 'activa', true
    ) ON CONFLICT (id) DO NOTHING;

    -- 5. FOTOGRAFÍAS DE LAS PROPIEDADES
    INSERT INTO public.propiedad_fotos (propiedad_id, storage_path, orden, es_portada) VALUES 
    (p1_id, 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1000&q=80', 0, true),
    (p1_id, 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1000&q=80', 1, false),
    (p2_id, 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1000&q=80', 0, true),
    (p3_id, 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1000&q=80', 0, true),
    (p3_id, 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1000&q=80', 1, false),
    (p4_id, 'https://images.unsplash.com/photo-1502005229762-ee152da7c5d6?auto=format&fit=crop&w=1000&q=80', 0, true),
    (p5_id, 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=1000&q=80', 0, true)
    ON CONFLICT DO NOTHING;

END $$;


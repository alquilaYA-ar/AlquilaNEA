# 🏢 AlquilaNEA - El Portal de Alquileres Inmobiliarios del Litoral

Plataforma web de clasificados de alquileres inmobiliarios enfocada en las provincias de **Corrientes** y **Chaco** (Argentina), construida con **Next.js 15 (App Router)**, **TypeScript**, **Tailwind CSS** y **Supabase (PostgreSQL, Auth, Storage, RLS)**.

---

## 🚀 Puesta en Marcha Rápida (Local)

### 1. Clonar el repositorio
```bash
git clone https://github.com/alquilaYA-ar/AlquilaNEA.git
cd AlquilaNEA
```

### 2. Instalar dependencias
```bash
npm install
```

### 3. Configurar variables de entorno
Crea un archivo `.env.local` en la raíz del proyecto basándote en `.env.example`:
```env
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### 4. Iniciar el servidor de desarrollo
```bash
npm run dev
```
Abre en tu navegador [http://localhost:3000](http://localhost:3000).

---

## 🗄️ Base de Datos y Supabase

Los scripts SQL listos para ejecutar en el SQL Editor de Supabase se encuentran en la carpeta `supabase/`:
* `supabase/schema.sql`: Creación de tablas, relaciones jerárquicas (Provincias, Localidades, Barrios), perfiles, triggers y políticas RLS.
* `supabase/seed_corrientes_and_properties.sql`: Carga de las 42 localidades de Corrientes, los 52 barrios de Corrientes Capital y propiedades de ejemplo.
* `supabase/email-templates/`: Plantillas HTML personalizadas para confirmación de registro y restablecimiento de contraseña.

---

## 🧭 Características Principales

* **Buscador Jerárquico en Cascada:** Provincia ➔ Localidad / Ciudad ➔ Barrio.
* **Filtros Avanzados:** Por tipo de anunciante (*Dueño Directo sin comisión* o *Inmobiliaria*), ambientes, comodidades (cochera, balcón, patio, expensas) y rango de precio.
* **Contacto Directo por WhatsApp:** Mensajes prearmados automáticos para agilizar el contacto entre inquilinos y propietarios.
* **Autenticación y Sesiones:** Middleware con rotación automática de Access Tokens / Refresh Tokens mediante `@supabase/ssr`.
* **Subida de Fotografías:** Almacenamiento directo en Supabase Storage con compresión previa.

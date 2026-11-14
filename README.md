# 🏠 AlquilaYa - Clasificados Inmobiliarios (Corrientes & Chaco)

Plataforma web de clasificados de alquileres inmobiliarios enfocada inicialmente en las provincias de **Corrientes** y **Chaco** (Argentina), construida con **Next.js 15 (App Router)**, **TypeScript**, **Tailwind CSS** y **Supabase**.

---

## 🚀 Puesta en Marcha Rápida (Local)

### 1. Iniciar el Servidor de Desarrollo
```bash
npm run dev
```
Abre en tu navegador [http://localhost:3000](http://localhost:3000).

> **Nota:** La aplicación incluye un conjunto de datos semilla de demostración realistas (Resistencia, Corrientes Capital, Camba Cuá, Villa San Martín, etc.) que te permiten navegar, probar los filtros y ver fichas de propiedades inmediatamente sin necesidad de configurar Supabase primero.

---

## 🗄️ Conectar con tu Base de Datos Supabase

Cuando desees conectar tu proyecto real en Supabase:

1. **Crear Proyecto en Supabase:**
   - Ve a [supabase.com](https://supabase.com) y crea un nuevo proyecto (se sugiere región `sa-east-1` São Paulo para menor latencia en Argentina).
2. **Ejecutar el Script SQL:**
   - Copia el contenido del archivo [`supabase/schema.sql`](file:///Users/gonzalovallejos/Documents/alquilaYA/supabase/schema.sql) y pégalo en el **SQL Editor** de Supabase.
   - Esto creará automáticamente:
     - Jerarquía geográfica (`provincias`, `localidades`, `barrios`) con datos de Corrientes y Chaco.
     - Perfiles vinculados a `auth.users` con distinción entre **Dueño Directo** e **Inmobiliaria**.
     - Tablas de `propiedades`, `propiedad_fotos` y `pagos_publicacion`.
     - Políticas de seguridad por fila (**Row Level Security - RLS**).
     - Triggers automáticos y buckets de almacenamiento.
3. **Configurar Variables de Entorno:**
   - Crea un archivo `.env.local` en la raíz (basándote en `.env.example`):
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-clave-anon
   NEXT_PUBLIC_SITE_URL=http://localhost:3000
   ```

---

## 🧭 Estructura del Proyecto

- [`src/app/page.tsx`](file:///Users/gonzalovallejos/Documents/alquilaYA/src/app/page.tsx): Landing page con Hero y buscador geográfico en cascada.
- [`src/app/propiedades/page.tsx`](file:///Users/gonzalovallejos/Documents/alquilaYA/src/app/propiedades/page.tsx): Catálogo de resultados con sidebar de filtros avanzados.
- [`src/app/propiedad/[id]/page.tsx`](file:///Users/gonzalovallejos/Documents/alquilaYA/src/app/propiedad/[id]/page.tsx): Ficha técnica con fotos, desglose de precio/expensas y botón directo a WhatsApp.
- [`src/app/publicar/page.tsx`](file:///Users/gonzalovallejos/Documents/alquilaYA/src/app/publicar/page.tsx): Asistente multi-paso para publicación de avisos (Ubicación, Características, Fotos y Contacto).
- [`src/actions/locations.ts`](file:///Users/gonzalovallejos/Documents/alquilaYA/src/actions/locations.ts): Server Actions para Provincias, Localidades y Barrios.
- [`src/actions/properties.ts`](file:///Users/gonzalovallejos/Documents/alquilaYA/src/actions/properties.ts): Server Actions para búsqueda con filtros dinámicos.
- [`src/types/database.ts`](file:///Users/gonzalovallejos/Documents/alquilaYA/src/types/database.ts): Tipado TypeScript estricto.
- [`supabase/schema.sql`](file:///Users/gonzalovallejos/Documents/alquilaYA/supabase/schema.sql): DDL completo con RLS y datos semilla.

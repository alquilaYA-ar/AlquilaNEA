import Link from 'next/link';
import { Sparkles, ShieldCheck, MessageCircle, Building2, ArrowRight } from 'lucide-react';
import { getProvincias } from '@/actions/locations';
import { searchProperties } from '@/actions/properties';
import { GeoSelector } from '@/components/search/geo-selector';
import { PropertyCard } from '@/components/properties/property-card';

// ISR: la home se cachea 60 segundos para servirse casi instantáneamente.
// Se invalida automáticamente con revalidatePath('/') al crear/editar/borrar propiedades.
export const revalidate = 60;

export default async function HomePage() {
  const provincias = await getProvincias();
  const { properties } = await searchProperties({ limit: 6 });

  return (
    <div className="space-y-16 pb-16">
      {/* HERO SECTION CON PALETA ALQUILANEA (RÍO PARANÁ & ATARDECER LITORAL) */}
      <section className="relative overflow-hidden bg-gradient-to-b from-slate-950 via-slate-900 to-blue-950 text-white pt-16 pb-24 px-4 sm:px-6 lg:px-8 border-b border-blue-900/40">
        {/* Glow de fondo inspirado en el atardecer del NEA */}
        <div className="absolute inset-0 opacity-20 pointer-events-none">
          <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-orange-500 blur-3xl"></div>
          <div className="absolute bottom-0 -left-40 w-96 h-96 rounded-full bg-blue-500 blur-3xl"></div>
        </div>

        <div className="max-w-5xl mx-auto text-center relative z-10 space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-orange-300 text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5 text-orange-400" />
            <span>El portal de alquileres del Litoral • Corrientes y Chaco</span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight leading-tight">
            Alquilá en el <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-amber-300 to-orange-500">NEA</span> sin vueltas
          </h1>

          <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto font-normal">
            Conectamos inquilinos con propiedades verificadas de dueños directos e inmobiliarias en Corrientes y Chaco. Buscador por barrio real y contacto directo por WhatsApp.
          </p>

          {/* BUSCADOR GEOGRÁFICO EN CASCADA */}
          <div className="pt-4 text-left">
            <GeoSelector provincias={provincias} />
          </div>

          {/* ACCESOS RÁPIDOS */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-2 text-xs">
            <span className="text-slate-400">Búsquedas rápidas:</span>
            <Link
              href="/propiedades?provinciaId=1&localidadId=1"
              className="px-3 py-1 rounded-full bg-white/10 hover:bg-white/20 text-white transition font-medium"
            >
              Corrientes Capital
            </Link>
            <Link
              href="/propiedades?provinciaId=2&localidadId=4"
              className="px-3 py-1 rounded-full bg-white/10 hover:bg-white/20 text-white transition font-medium"
            >
              Resistencia
            </Link>
            <Link
              href="/propiedades?tipoAnunciante=dueno_directo"
              className="px-3 py-1 rounded-full bg-orange-500/20 text-orange-300 border border-orange-500/30 hover:bg-orange-500/30 transition font-bold"
            >
              Dueño Directo (Sin Comisión)
            </Link>
            <Link
              href="/propiedades?tipoInmueble=monoambiente"
              className="px-3 py-1 rounded-full bg-white/10 hover:bg-white/20 text-white transition font-medium"
            >
              Monoambientes
            </Link>
          </div>
        </div>
      </section>

      {/* PROPIEDADES DESTACADAS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Alquileres Destacados y Recientes
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Las mejores opciones disponibles en Corrientes Capital, Resistencia y localidades de la región.
            </p>
          </div>
          <Link
            href="/propiedades"
            className="inline-flex items-center gap-1.5 text-sm font-bold text-blue-700 hover:text-blue-800 transition"
          >
            <span>Ver todos los avisos</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {properties.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {properties.map((prop) => (
              <PropertyCard key={prop.id} property={prop} />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-500">
            Cargando propiedades desde Supabase...
          </div>
        )}
      </section>

      {/* PROPUESTA DE VALOR / CARACTERÍSTICAS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 rounded-3xl text-white p-8 sm:p-12 shadow-xl border border-blue-900/30">
          <div className="max-w-2xl mb-10">
            <span className="text-xs uppercase font-extrabold tracking-wider text-orange-400">
              ¿Por qué AlquilaNEA?
            </span>
            <h3 className="text-2xl sm:text-3xl font-extrabold mt-2">
              Diseñado a la medida del mercado inmobiliario del Noreste
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-orange-500/20 text-orange-400 flex items-center justify-center">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h4 className="text-lg font-bold">Dueño Directo vs Inmobiliarias</h4>
              <p className="text-sm text-slate-300 leading-relaxed">
                Identificá claramente avisos de Dueño Directo (sin costos de comisión) o inmobiliarias certificadas con matrícula profesional.
              </p>
            </div>

            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-blue-500/20 text-blue-300 flex items-center justify-center">
                <MessageCircle className="w-6 h-6" />
              </div>
              <h4 className="text-lg font-bold">Contacto Directo por WhatsApp</h4>
              <p className="text-sm text-slate-300 leading-relaxed">
                Sin intermediarios ni demoras. Hacés un clic y chateás directo por WhatsApp con el propietario o agente a cargo.
              </p>
            </div>

            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-300 flex items-center justify-center">
                <Building2 className="w-6 h-6" />
              </div>
              <h4 className="text-lg font-bold">Filtros por Barrio Real</h4>
              <p className="text-sm text-slate-300 leading-relaxed">
                Filtrá por Camba Cuá, Aldana, Villa San Martín, Centro o La Cruz con claridad sobre expensas y cocheras.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

import Link from 'next/link';
import { Sparkles, ShieldCheck, MessageCircle, Building2, ArrowRight } from 'lucide-react';
import { getProvincias } from '@/actions/locations';
import { searchProperties } from '@/actions/properties';
import { GeoSelector } from '@/components/search/geo-selector';
import { PropertyCard } from '@/components/properties/property-card';

export default async function HomePage() {
  const provincias = await getProvincias();
  const { properties } = await searchProperties({ limit: 6 });

  return (
    <div className="space-y-16 pb-16">
      {/* HERO SECTION */}
      <section className="relative overflow-hidden bg-gradient-to-b from-emerald-900 via-emerald-800 to-slate-900 text-white pt-16 pb-24 px-4 sm:px-6 lg:px-8">
        {/* Background glow decoration */}
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-emerald-400 blur-3xl"></div>
          <div className="absolute bottom-0 -left-40 w-96 h-96 rounded-full bg-teal-300 blur-3xl"></div>
        </div>

        <div className="max-w-5xl mx-auto text-center relative z-10 space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-emerald-200 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>El portal de alquileres del NEA • Corrientes y Chaco</span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight leading-tight">
            Alquilá en <span className="text-emerald-400">Corrientes</span> y{' '}
            <span className="text-teal-300">Chaco</span> sin vueltas
          </h1>

          <p className="text-base sm:text-lg text-emerald-100/90 max-w-2xl mx-auto font-normal">
            Conectamos inquilinos con propiedades verificadas de dueños directos e inmobiliarias. Filtros específicos por barrio y contacto directo por WhatsApp.
          </p>

          {/* BUSCADOR GEOGRÁFICO EN CASCADA */}
          <div className="pt-4 text-left">
            <GeoSelector provincias={provincias} />
          </div>

          {/* ACCESOS RÁPIDOS */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-2 text-xs">
            <span className="text-emerald-200/70">Búsquedas populares:</span>
            <Link
              href="/propiedades?provinciaId=1&localidadId=1"
              className="px-3 py-1 rounded-full bg-white/10 hover:bg-white/20 text-white transition"
            >
              Corrientes Capital
            </Link>
            <Link
              href="/propiedades?provinciaId=2&localidadId=4"
              className="px-3 py-1 rounded-full bg-white/10 hover:bg-white/20 text-white transition"
            >
              Resistencia
            </Link>
            <Link
              href="/propiedades?tipoAnunciante=dueno_directo"
              className="px-3 py-1 rounded-full bg-emerald-500/30 text-emerald-200 border border-emerald-400/30 hover:bg-emerald-500/40 transition font-medium"
            >
              Dueño Directo (Sin Comisión)
            </Link>
            <Link
              href="/propiedades?tipoInmueble=monoambiente"
              className="px-3 py-1 rounded-full bg-white/10 hover:bg-white/20 text-white transition"
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
              Las mejores opciones disponibles en Corrientes Capital, Resistencia y alrededores.
            </p>
          </div>
          <Link
            href="/propiedades"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-700 hover:text-emerald-800 transition"
          >
            <span>Ver todos los avisos</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {properties.map((prop) => (
            <PropertyCard key={prop.id} property={prop} />
          ))}
        </div>
      </section>

      {/* PROPUESTA DE VALOR / CARACTERÍSTICAS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-3xl text-white p-8 sm:p-12">
          <div className="max-w-2xl mb-10">
            <span className="text-xs uppercase font-bold tracking-wider text-emerald-400">
              ¿Por qué AlquilaYa?
            </span>
            <h3 className="text-2xl sm:text-3xl font-extrabold mt-2">
              Diseñado a la medida del mercado inmobiliario regional
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h4 className="text-lg font-bold">Claridad en Dueños e Inmobiliarias</h4>
              <p className="text-sm text-slate-300">
                Identificá al instante si el aviso es de Dueño Directo (sin comisiones) o de una inmobiliaria con matrícula profesional verificable.
              </p>
            </div>

            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-teal-500/20 text-teal-300 flex items-center justify-center">
                <MessageCircle className="w-6 h-6" />
              </div>
              <h4 className="text-lg font-bold">Contacto Directo por WhatsApp</h4>
              <p className="text-sm text-slate-300">
                Sin intermediarios ni formularios burocráticos. Hacé un clic y abrí una conversación de WhatsApp con el anunciante al instante.
              </p>
            </div>

            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                <Building2 className="w-6 h-6" />
              </div>
              <h4 className="text-lg font-bold">Filtros por Barrio Real</h4>
              <p className="text-sm text-slate-300">
                Filtrá por los barrios que conocés: Camba Cuá, Aldana, Villa San Martín, Centro o La Cruz, con datos claros de expensas y cocheras.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

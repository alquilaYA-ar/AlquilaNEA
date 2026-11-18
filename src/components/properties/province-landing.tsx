import Link from 'next/link';
import { MapPin, ArrowRight, Search } from 'lucide-react';
import { getProvincias } from '@/actions/locations';
import { searchProperties } from '@/actions/properties';
import { PropertyCard } from '@/components/properties/property-card';

interface ProvinceLandingProps {
  provinceMatch: string;
  heading: string;
  subheading: string;
  seoParagraph: string;
  cities: string[];
}

export async function ProvinceLanding({
  provinceMatch,
  heading,
  subheading,
  seoParagraph,
  cities,
}: ProvinceLandingProps) {
  const provincias = await getProvincias();
  const provincia = provincias.find((p) =>
    p.nombre.toLowerCase().includes(provinceMatch.toLowerCase())
  );

  const { properties, totalCount } = await searchProperties({
    provinciaId: provincia?.id,
    limit: 12,
  });

  const filterHref = provincia ? `/propiedades?provinciaId=${provincia.id}` : '/propiedades';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      <header className="bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white rounded-3xl p-8 sm:p-10 space-y-4 shadow-lg">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-orange-600/90 text-white">
          <MapPin className="w-3.5 h-3.5" />
          AlquilaNEA • {provincia?.nombre || provinceMatch}
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">{heading}</h1>
        <p className="text-sm sm:text-base text-slate-300 max-w-2xl">{subheading}</p>
        <div className="flex flex-wrap gap-2 pt-1">
          {cities.map((city) => (
            <span
              key={city}
              className="px-3 py-1 rounded-full bg-white/10 text-xs font-semibold text-slate-200"
            >
              {city}
            </span>
          ))}
        </div>
        <div className="pt-2 flex flex-wrap gap-3">
          <Link
            href={filterHref}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs shadow-md transition"
          >
            <Search className="w-4 h-4" />
            <span>Filtrar todos los alquileres ({totalCount})</span>
          </Link>
          <Link
            href="/publicar"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs transition"
          >
            <span>Publicar propiedad gratis</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </header>

      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-extrabold text-slate-900">
            Propiedades disponibles ({totalCount})
          </h2>
          <Link href={filterHref} className="text-xs font-bold text-orange-600 hover:underline">
            Ver con filtros →
          </Link>
        </div>

        {properties.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200 p-10 text-center space-y-3">
            <p className="text-sm text-slate-600">
              Todavía no hay publicaciones activas en esta zona.
            </p>
            <Link
              href="/publicar"
              className="inline-block px-5 py-2.5 rounded-xl bg-orange-600 text-white text-xs font-bold"
            >
              Publicar el primer aviso gratis
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {properties.map((prop) => (
              <PropertyCard key={prop.id} property={prop} />
            ))}
          </div>
        )}
      </section>

      <section className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 text-sm text-slate-600 leading-relaxed space-y-2">
        <h2 className="text-base font-bold text-slate-900">
          Alquilar en {provincia?.nombre || provinceMatch} con AlquilaNEA
        </h2>
        <p>{seoParagraph}</p>
      </section>
    </div>
  );
}

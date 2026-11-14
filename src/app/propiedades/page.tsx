import { searchProperties } from '@/actions/properties';
import { getProvincias } from '@/actions/locations';
import { PropertyCard } from '@/components/properties/property-card';
import { FilterSidebar } from '@/components/search/filter-sidebar';
import { GeoSelector } from '@/components/search/geo-selector';
import { SearchX } from 'lucide-react';
import Link from 'next/link';

interface PropiedadesPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function PropiedadesPage({ searchParams }: PropiedadesPageProps) {
  const resolvedParams = await searchParams;

  const filters = {
    provinciaId: resolvedParams.provinciaId ? Number(resolvedParams.provinciaId) : undefined,
    localidadId: resolvedParams.localidadId ? Number(resolvedParams.localidadId) : undefined,
    barrioId: resolvedParams.barrioId ? Number(resolvedParams.barrioId) : undefined,
    tipoAnunciante: resolvedParams.tipoAnunciante as any,
    tipoInmueble: resolvedParams.tipoInmueble as any,
    ambientes: resolvedParams.ambientes ? Number(resolvedParams.ambientes) : undefined,
    precioMin: resolvedParams.precioMin ? Number(resolvedParams.precioMin) : undefined,
    precioMax: resolvedParams.precioMax ? Number(resolvedParams.precioMax) : undefined,
    cochera: resolvedParams.cochera === 'true',
    terrazaBalcon: resolvedParams.terrazaBalcon === 'true',
    patio: resolvedParams.patio === 'true',
    aceptaMascotas: resolvedParams.aceptaMascotas === 'true',
    expensasIncluidas: resolvedParams.expensasIncluidas === 'true',
    ordenarPor: (resolvedParams.ordenarPor as any) || 'recientes',
    page: resolvedParams.page ? Number(resolvedParams.page) : 1,
  };

  const [provincias, searchResult] = await Promise.all([
    getProvincias(),
    searchProperties(filters),
  ]);

  const { properties, totalCount } = searchResult;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Selector Geográfico Superior */}
      <div>
        <GeoSelector
          provincias={provincias}
          initialProvinciaId={filters.provinciaId}
          initialLocalidadId={filters.localidadId}
          initialBarrioId={filters.barrioId}
          compact
        />
      </div>

      {/* Cabecera de Resultados */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 gap-2">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Alquileres Disponibles
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Se encontraron <span className="font-semibold text-slate-800">{totalCount}</span> propiedades coincidentes.
          </p>
        </div>
      </div>

      {/* Grid: Sidebar Filtros + Resultados */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
        {/* Sidebar Filtros */}
        <div className="lg:col-span-1">
          <FilterSidebar />
        </div>

        {/* Listado de Propiedades */}
        <div className="lg:col-span-3">
          {properties.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {properties.map((property) => (
                <PropertyCard key={property.id} property={property} />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
                <SearchX className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">
                No se encontraron propiedades con estos filtros
              </h3>
              <p className="text-sm text-slate-500 max-w-md mx-auto">
                Probá ampliando el rango de precios o quitando algunos filtros de comodidades para ver más opciones en la zona.
              </p>
              <Link
                href="/propiedades"
                className="inline-block text-xs font-semibold px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-sm transition"
              >
                Ver todos los alquileres
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


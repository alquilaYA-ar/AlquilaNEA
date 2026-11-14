'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { MapPin, Search } from 'lucide-react';
import { Provincia, Localidad, Barrio } from '@/types/database';

interface GeoSelectorProps {
  provincias: Provincia[];
  initialProvinciaId?: number;
  initialLocalidadId?: number;
  initialBarrioId?: number;
  compact?: boolean;
}

export function GeoSelector({
  provincias,
  initialProvinciaId,
  initialLocalidadId,
  initialBarrioId,
  compact = false,
}: GeoSelectorProps) {
  const router = useRouter();
  const [selectedProvincia, setSelectedProvincia] = useState<number | undefined>(initialProvinciaId);
  const [selectedLocalidad, setSelectedLocalidad] = useState<number | undefined>(initialLocalidadId);
  const [selectedBarrio, setSelectedBarrio] = useState<number | undefined>(initialBarrioId);

  const [localidades, setLocalidades] = useState<Localidad[]>([]);
  const [barrios, setBarrios] = useState<Barrio[]>([]);
  const [loadingLocalidades, setLoadingLocalidades] = useState(false);
  const [loadingBarrios, setLoadingBarrios] = useState(false);

  // Cargar localidades cuando cambia la provincia
  useEffect(() => {
    if (!selectedProvincia) {
      setLocalidades([]);
      setSelectedLocalidad(undefined);
      setBarrios([]);
      setSelectedBarrio(undefined);
      return;
    }

    async function fetchLocalidades() {
      setLoadingLocalidades(true);
      try {
        const { getLocalidades } = await import('@/actions/locations');
        const data = await getLocalidades(selectedProvincia);
        setLocalidades(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingLocalidades(false);
      }
    }

    fetchLocalidades();
  }, [selectedProvincia]);

  // Cargar barrios cuando cambia la localidad
  useEffect(() => {
    if (!selectedLocalidad) {
      setBarrios([]);
      setSelectedBarrio(undefined);
      return;
    }

    async function fetchBarrios() {
      setLoadingBarrios(true);
      try {
        const { getBarrios } = await import('@/actions/locations');
        const data = await getBarrios(selectedLocalidad);
        setBarrios(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingBarrios(false);
      }
    }

    fetchBarrios();
  }, [selectedLocalidad]);

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (selectedProvincia) params.set('provinciaId', selectedProvincia.toString());
    if (selectedLocalidad) params.set('localidadId', selectedLocalidad.toString());
    if (selectedBarrio) params.set('barrioId', selectedBarrio.toString());

    router.push(`/propiedades?${params.toString()}`);
  };

  return (
    <div
      className={`bg-white rounded-2xl shadow-xl border border-slate-200/80 p-4 sm:p-5 ${
        compact ? '' : 'max-w-4xl mx-auto'
      }`}
    >
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Selector 1: Provincia */}
        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
            1. Provincia
          </label>
          <div className="relative">
            <select
              value={selectedProvincia || ''}
              onChange={(e) => {
                const val = e.target.value ? Number(e.target.value) : undefined;
                setSelectedProvincia(val);
                setSelectedLocalidad(undefined);
                setSelectedBarrio(undefined);
              }}
              className="w-full appearance-none bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-3 text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
            >
              <option value="">Todas las provincias</option>
              {provincias.map((prov) => (
                <option key={prov.id} value={prov.id}>
                  {prov.nombre}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-400">
              <MapPin className="w-4 h-4" />
            </div>
          </div>
        </div>

        {/* Selector 2: Localidad */}
        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
            2. Localidad / Ciudad
          </label>
          <div className="relative">
            <select
              disabled={!selectedProvincia || loadingLocalidades}
              value={selectedLocalidad || ''}
              onChange={(e) => {
                const val = e.target.value ? Number(e.target.value) : undefined;
                setSelectedLocalidad(val);
                setSelectedBarrio(undefined);
              }}
              className="w-full appearance-none bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-3 text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white disabled:opacity-50 disabled:bg-slate-100 transition"
            >
              <option value="">
                {!selectedProvincia
                  ? 'Elige una provincia primero'
                  : loadingLocalidades
                  ? 'Cargando ciudades...'
                  : 'Todas las localidades'}
              </option>
              {localidades.map((loc) => (
                <option key={loc.id} value={loc.id}>
                  {loc.nombre}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Selector 3: Barrio */}
        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
            3. Barrio (Opcional)
          </label>
          <div className="relative">
            <select
              disabled={!selectedLocalidad || loadingBarrios}
              value={selectedBarrio || ''}
              onChange={(e) => {
                const val = e.target.value ? Number(e.target.value) : undefined;
                setSelectedBarrio(val);
              }}
              className="w-full appearance-none bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-3 text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white disabled:opacity-50 disabled:bg-slate-100 transition"
            >
              <option value="">
                {!selectedLocalidad
                  ? 'Elige una ciudad primero'
                  : loadingBarrios
                  ? 'Cargando barrios...'
                  : 'Todos los barrios'}
              </option>
              {barrios.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.nombre}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Botón de Buscar */}
      <div className="mt-4 flex justify-end">
        <button
          onClick={handleSearch}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm px-7 py-3 rounded-xl shadow-md hover:shadow-lg transition cursor-pointer"
        >
          <Search className="w-4 h-4" />
          <span>Buscar Alquileres</span>
        </button>
      </div>
    </div>
  );
}


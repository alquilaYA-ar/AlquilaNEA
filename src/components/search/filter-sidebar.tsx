'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { Filter, RotateCcw } from 'lucide-react';

export function FilterSidebar() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [tipoAnunciante, setTipoAnunciante] = useState(searchParams.get('tipoAnunciante') || '');
  const [tipoInmueble, setTipoInmueble] = useState(searchParams.get('tipoInmueble') || '');
  const [ambientes, setAmbientes] = useState(searchParams.get('ambientes') || '');
  const [precioMin, setPrecioMin] = useState(searchParams.get('precioMin') || '');
  const [precioMax, setPrecioMax] = useState(searchParams.get('precioMax') || '');
  const [cochera, setCochera] = useState(searchParams.get('cochera') === 'true');
  const [terrazaBalcon, setTerrazaBalcon] = useState(searchParams.get('terrazaBalcon') === 'true');
  const [patio, setPatio] = useState(searchParams.get('patio') === 'true');
  const [aceptaMascotas, setAceptaMascotas] = useState(searchParams.get('aceptaMascotas') === 'true');
  const [expensasIncluidas, setExpensasIncluidas] = useState(searchParams.get('expensasIncluidas') === 'true');
  const [ordenarPor, setOrdenarPor] = useState(searchParams.get('ordenarPor') || 'recientes');

  const aplicarFiltros = () => {
    const params = new URLSearchParams(searchParams.toString());

    if (tipoAnunciante) params.set('tipoAnunciante', tipoAnunciante);
    else params.delete('tipoAnunciante');

    if (tipoInmueble) params.set('tipoInmueble', tipoInmueble);
    else params.delete('tipoInmueble');

    if (ambientes) params.set('ambientes', ambientes);
    else params.delete('ambientes');

    if (precioMin) params.set('precioMin', precioMin);
    else params.delete('precioMin');

    if (precioMax) params.set('precioMax', precioMax);
    else params.delete('precioMax');

    if (cochera) params.set('cochera', 'true');
    else params.delete('cochera');

    if (terrazaBalcon) params.set('terrazaBalcon', 'true');
    else params.delete('terrazaBalcon');

    if (patio) params.set('patio', 'true');
    else params.delete('patio');

    if (aceptaMascotas) params.set('aceptaMascotas', 'true');
    else params.delete('aceptaMascotas');

    if (expensasIncluidas) params.set('expensasIncluidas', 'true');
    else params.delete('expensasIncluidas');

    params.set('ordenarPor', ordenarPor);
    params.set('page', '1');

    router.push(`/propiedades?${params.toString()}`);
  };

  const limpiarFiltros = () => {
    const params = new URLSearchParams();
    const prov = searchParams.get('provinciaId');
    const loc = searchParams.get('localidadId');
    const bar = searchParams.get('barrioId');

    if (prov) params.set('provinciaId', prov);
    if (loc) params.set('localidadId', loc);
    if (bar) params.set('barrioId', bar);

    setTipoAnunciante('');
    setTipoInmueble('');
    setAmbientes('');
    setPrecioMin('');
    setPrecioMax('');
    setCochera(false);
    setTerrazaBalcon(false);
    setPatio(false);
    setAceptaMascotas(false);
    setExpensasIncluidas(false);
    setOrdenarPor('recientes');

    router.push(`/propiedades?${params.toString()}`);
  };

  return (
    <aside className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-sm space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-emerald-600" />
          <h3 className="font-bold text-slate-900 text-sm">Filtros Avanzados</h3>
        </div>
        <button
          onClick={limpiarFiltros}
          className="text-xs text-slate-500 hover:text-red-600 flex items-center gap-1 transition"
        >
          <RotateCcw className="w-3 h-3" />
          Limpiar
        </button>
      </div>

      {/* 1. Tipo de Anunciante */}
      <div>
        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
          Tipo de Anunciante
        </label>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setTipoAnunciante(tipoAnunciante === 'dueno_directo' ? '' : 'dueno_directo')}
            className={`py-2 px-3 text-xs font-semibold rounded-xl border text-center transition ${
              tipoAnunciante === 'dueno_directo'
                ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
            }`}
          >
            Dueño Directo
          </button>
          <button
            type="button"
            onClick={() => setTipoAnunciante(tipoAnunciante === 'inmobiliaria' ? '' : 'inmobiliaria')}
            className={`py-2 px-3 text-xs font-semibold rounded-xl border text-center transition ${
              tipoAnunciante === 'inmobiliaria'
                ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
            }`}
          >
            Inmobiliaria
          </button>
        </div>
      </div>

      {/* 2. Tipo de Inmueble */}
      <div>
        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
          Tipo de Inmueble
        </label>
        <select
          value={tipoInmueble}
          onChange={(e) => setTipoInmueble(e.target.value)}
          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
        >
          <option value="">Todos los tipos</option>
          <option value="departamento">Departamento</option>
          <option value="casa">Casa</option>
          <option value="monoambiente">Monoambiente</option>
          <option value="ph">PH</option>
          <option value="oficina">Oficina</option>
          <option value="local">Local Comercial</option>
        </select>
      </div>

      {/* 3. Ambientes */}
      <div>
        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
          Cantidad de Ambientes
        </label>
        <div className="grid grid-cols-4 gap-1.5">
          {[
            { label: 'Mono', val: '1' },
            { label: '2 Amb', val: '2' },
            { label: '3 Amb', val: '3' },
            { label: '4+ Amb', val: '4' },
          ].map((item) => (
            <button
              key={item.val}
              type="button"
              onClick={() => setAmbientes(ambientes === item.val ? '' : item.val)}
              className={`py-2 text-xs font-semibold rounded-xl border text-center transition ${
                ambientes === item.val
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* 4. Rango de Precios */}
      <div>
        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
          Precio Mensual (ARS)
        </label>
        <div className="grid grid-cols-2 gap-2">
          <input
            type="number"
            placeholder="Mínimo"
            value={precioMin}
            onChange={(e) => setPrecioMin(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
          <input
            type="number"
            placeholder="Máximo"
            value={precioMax}
            onChange={(e) => setPrecioMax(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
      </div>

      {/* 5. Comodidades y Características */}
      <div>
        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
          Comodidades
        </label>
        <div className="space-y-2 text-xs font-medium text-slate-700">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={cochera}
              onChange={(e) => setCochera(e.target.checked)}
              className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
            />
            <span>Con Cochera / Garage</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={terrazaBalcon}
              onChange={(e) => setTerrazaBalcon(e.target.checked)}
              className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
            />
            <span>Balcón o Terraza</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={patio}
              onChange={(e) => setPatio(e.target.checked)}
              className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
            />
            <span>Patio / Jardín</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={aceptaMascotas}
              onChange={(e) => setAceptaMascotas(e.target.checked)}
              className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
            />
            <span>Acepta Mascotas</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={expensasIncluidas}
              onChange={(e) => setExpensasIncluidas(e.target.checked)}
              className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
            />
            <span>Expensas Incluidas</span>
          </label>
        </div>
      </div>

      {/* 6. Ordenar por */}
      <div>
        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
          Ordenar Por
        </label>
        <select
          value={ordenarPor}
          onChange={(e) => setOrdenarPor(e.target.value)}
          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
        >
          <option value="recientes">Más recientes & Destacados</option>
          <option value="precio_asc">Menor precio</option>
          <option value="precio_desc">Mayor precio</option>
        </select>
      </div>

      <button
        onClick={aplicarFiltros}
        className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl shadow-md transition"
      >
        Aplicar Filtros
      </button>
    </aside>
  );
}

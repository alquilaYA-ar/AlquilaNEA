'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Building2, Eye, Pause, Play, Trash2, Search, ExternalLink, RefreshCw } from 'lucide-react';
import {
  AdminProperty,
  getAdminProperties,
  setPropertyStateByAdmin,
  deletePropertyByAdmin,
} from '@/actions/admin';
import { createClient } from '@/lib/supabase/client';
import { formatCurrency } from '@/lib/utils';

const ESTADO_CLS: Record<string, string> = {
  activa: 'bg-emerald-100 text-emerald-800',
  pausada: 'bg-amber-100 text-amber-800',
  alquilada: 'bg-slate-200 text-slate-700',
};

export function AdminPropertiesTable({ initialProperties }: { initialProperties: AdminProperty[] }) {
  const [items, setItems] = useState(initialProperties);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<'todas' | 'activa' | 'pausada' | 'alquilada'>('todas');
  const [sort, setSort] = useState<'recientes' | 'visitas'>('recientes');
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => setItems(await getAdminProperties()), []);

  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel(`admin-props-${Math.random().toString(36).slice(2, 8)}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'propiedades' }, reload)
      .subscribe();
    const interval = setInterval(reload, 10000);
    return () => {
      clearInterval(interval);
      supabase.removeChannel(channel);
    };
  }, [reload]);

  const visible = items
    .filter((p) => (filter === 'todas' ? true : p.estado === filter))
    .filter((p) => {
      const q = query.trim().toLowerCase();
      return !q || [p.titulo, p.anunciante, p.localidad].some((v) => v.toLowerCase().includes(q));
    })
    .sort((a, b) =>
      sort === 'visitas' ? b.visitas_count - a.visitas_count : +new Date(b.created_at) - +new Date(a.created_at)
    );

  const toggle = async (p: AdminProperty) => {
    const next = p.estado === 'activa' ? 'pausada' : 'activa';
    setBusyId(p.id);
    setError(null);
    const res = await setPropertyStateByAdmin(p.id, next);
    if (!res.success) setError(res.error || 'No se pudo actualizar el aviso.');
    else setItems((prev) => prev.map((x) => (x.id === p.id ? { ...x, estado: next } : x)));
    setBusyId(null);
  };

  const remove = async (p: AdminProperty) => {
    if (!confirm(`¿Eliminar definitivamente "${p.titulo}"? Se borrarán también sus fotos.`)) return;
    setBusyId(p.id);
    setError(null);
    const res = await deletePropertyByAdmin(p.id);
    if (!res.success) setError(res.error || 'No se pudo eliminar el aviso.');
    else setItems((prev) => prev.filter((x) => x.id !== p.id));
    setBusyId(null);
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-orange-600" />
            Publicaciones ({visible.length})
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">Moderá avisos: pausar, reactivar o eliminar. Se actualiza en vivo.</p>
        </div>
        <button
          onClick={reload}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-700 cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Actualizar
        </button>
      </div>

      <div className="flex flex-wrap gap-2 items-center">
        {(['todas', 'activa', 'pausada', 'alquilada'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-full text-xs font-bold capitalize cursor-pointer transition ${
              filter === f ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {f}
          </button>
        ))}
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as 'recientes' | 'visitas')}
          className="ml-auto text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 font-semibold"
        >
          <option value="recientes">Más recientes</option>
          <option value="visitas">Más visitadas</option>
        </select>
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            maxLength={100}
            placeholder="Buscar aviso, anunciante..."
            className="pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl w-56"
          />
        </div>
      </div>

      {error && <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs font-semibold rounded-xl">{error}</div>}

      {visible.length === 0 ? (
        <p className="text-xs text-slate-400 py-6 text-center">No hay publicaciones para mostrar.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="text-[11px] uppercase tracking-wider text-slate-400 border-b border-slate-100">
                <th className="py-2 pr-3">Aviso</th>
                <th className="py-2 pr-3">Anunciante</th>
                <th className="py-2 pr-3">Precio</th>
                <th className="py-2 pr-3">Estado</th>
                <th className="py-2 pr-3">Visitas</th>
                <th className="py-2 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {visible.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50/70">
                  <td className="py-3 pr-3 max-w-[260px]">
                    <Link href={`/propiedad/${p.id}`} className="font-bold text-slate-900 hover:text-orange-600 line-clamp-1">
                      {p.titulo}
                    </Link>
                    <span className="text-[11px] text-slate-400">{p.localidad}</span>
                  </td>
                  <td className="py-3 pr-3 text-slate-600">{p.anunciante}</td>
                  <td className="py-3 pr-3 font-semibold text-slate-800">{formatCurrency(p.precio_mensual, p.moneda)}</td>
                  <td className="py-3 pr-3">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold capitalize ${ESTADO_CLS[p.estado]}`}>{p.estado}</span>
                  </td>
                  <td className="py-3 pr-3">
                    <span className="inline-flex items-center gap-1 font-bold text-emerald-700">
                      <Eye className="w-3.5 h-3.5" />
                      {p.visitas_count}
                    </span>
                  </td>
                  <td className="py-3 text-right">
                    <div className="inline-flex items-center gap-1.5">
                      <Link href={`/propiedad/${p.id}`} title="Ver aviso" className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600">
                        <ExternalLink className="w-4 h-4" />
                      </Link>
                      {p.estado !== 'alquilada' && (
                        <button
                          onClick={() => toggle(p)}
                          disabled={busyId === p.id}
                          title={p.estado === 'activa' ? 'Pausar' : 'Reactivar'}
                          className="p-2 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-700 cursor-pointer disabled:opacity-50"
                        >
                          {p.estado === 'activa' ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                        </button>
                      )}
                      <button
                        onClick={() => remove(p)}
                        disabled={busyId === p.id}
                        title="Eliminar"
                        className="p-2 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 cursor-pointer disabled:opacity-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

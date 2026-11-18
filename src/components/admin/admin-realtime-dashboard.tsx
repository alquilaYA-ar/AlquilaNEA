'use client';

import { useState, useEffect, useTransition } from 'react';
import Link from 'next/link';
import {
  Users,
  Building2,
  Eye,
  TrendingUp,
  MapPin,
  Building,
  Shield,
  Phone,
  Mail,
  Home,
  Compass,
  RefreshCw,
  ArrowUpRight,
  Radio,
} from 'lucide-react';
import { AdminStats, getAdminStats } from '@/actions/admin';
import { formatCurrency } from '@/lib/utils';
import { createClient } from '@/lib/supabase/client';
import { Profile } from '@/types/database';

interface AdminRealtimeDashboardProps {
  initialStats: AdminStats;
  adminProfile: Profile | null;
  adminEmail: string;
  adminId: string;
}

export function AdminRealtimeDashboard({
  initialStats,
  adminProfile,
  adminEmail,
  adminId,
}: AdminRealtimeDashboardProps) {
  const [stats, setStats] = useState<AdminStats>(initialStats);
  const [isPending, startTransition] = useTransition();
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [pulseLive, setPulseLive] = useState(false);

  // Función para recargar estadísticas
  const refreshStats = () => {
    startTransition(async () => {
      const freshStats = await getAdminStats();
      setStats(freshStats);
      setLastUpdated(new Date());
      setPulseLive(true);
      setTimeout(() => setPulseLive(false), 1200);
    });
  };

  // Suscripción a eventos de Supabase Realtime + Polling cada 5 segundos
  useEffect(() => {
    const supabase = createClient();

    // 1. Canal WebSocket en tiempo real
    const channel = supabase
      .channel('admin-realtime-channel')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'propiedades' },
        () => {
          refreshStats();
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'profiles' },
        () => {
          refreshStats();
        }
      )
      .subscribe();

    // 2. Heartbeat de refresco automático cada 6 segundos para garantizar métricas vivas
    const interval = setInterval(() => {
      refreshStats();
    }, 6000);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(interval);
    };
  }, []);

  return (
    <div className="space-y-10">
      <div className="flex items-center justify-between">
        <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">Resumen General</h1>
        <div className="flex items-center gap-3">
          <span className="text-[11px] text-slate-400 font-semibold hidden sm:inline">
            Actualizado: {lastUpdated.toLocaleTimeString('es-AR')}
          </span>
          <button
            type="button"
            onClick={refreshStats}
            disabled={isPending}
            title="Actualizar datos ahora"
            className="px-3.5 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-bold text-slate-600 transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isPending ? 'animate-spin text-orange-600' : ''}`} />
            <span className="hidden sm:inline">Actualizar</span>
          </button>
        </div>
      </div>

      {/* TARJETA DE PERFIL DEL ADMINISTRADOR */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-blue-950 text-white rounded-3xl p-6 sm:p-7 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-orange-600 text-white flex items-center justify-center shrink-0 shadow-md">
            <Shield className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-lg font-black tracking-tight">
                {adminProfile?.nombre_completo || 'Administrador General'}
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-orange-500 text-white shadow-xs">
                Perfil 1 • Administrador General
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-300 font-medium pt-0.5">
              <span className="flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                {adminEmail}
              </span>
              {adminProfile?.whatsapp && (
                <span className="flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-emerald-400" />
                  {adminProfile.whatsapp}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/propiedades"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-white text-slate-900 hover:bg-slate-100 font-bold text-xs shadow-md transition"
          >
            <Compass className="w-4 h-4 text-orange-600" />
            <span>Explorar Web</span>
          </Link>
        </div>
      </div>

      {/* 4 TARJETAS PRINCIPALES DE RESUMEN (VIVAS) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Usuarios Registrados */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Total Usuarios
            </span>
            <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-black text-slate-900">{stats.totalUsers}</div>
            <div className="flex items-center gap-2 mt-2 text-xs font-semibold text-slate-500">
              <span className="text-orange-600 font-bold">{stats.duenosCount} Dueños</span>
              <span>•</span>
              <span className="text-blue-700 font-bold">{stats.inmobiliariasCount} Inmobiliarias</span>
            </div>
          </div>
        </div>

        {/* Publicaciones Totales */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Inmuebles Cargados
            </span>
            <div className="w-10 h-10 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center">
              <Building2 className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-black text-slate-900">{stats.totalProperties}</div>
            <div className="flex items-center gap-2 mt-2 text-xs font-semibold text-slate-500">
              <span className="text-emerald-600 font-bold">{stats.activeProperties} Activas</span>
              <span>•</span>
              <span className="text-amber-600 font-bold">{stats.pausedProperties} Pausadas</span>
              <span>•</span>
              <span className="text-slate-400 font-bold">{stats.rentedProperties} Alquiladas</span>
            </div>
          </div>
        </div>

        {/* Tráfico & Visitas en Vivo */}
        <div className="bg-white rounded-3xl border-2 border-emerald-500/40 p-6 shadow-sm space-y-4 relative overflow-hidden">
          <div className="absolute top-2 right-2">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">
              Visitas en Tiempo Real
            </span>
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Eye className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-black text-slate-900">
              {stats.totalVisits.toLocaleString('es-AR')}
            </div>
            <p className="text-xs text-slate-500 mt-2 font-medium">
              Vistas registradas en vivo en las fichas del portal
            </p>
          </div>
        </div>

        {/* Precio Promedio de Alquiler */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Alquiler Promedio
            </span>
            <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900">
              {formatCurrency(stats.averagePrice, 'ARS')}
            </div>
            <p className="text-xs text-slate-500 mt-2 font-medium">
              Valor medio mensual en el Litoral (ARS)
            </p>
          </div>
        </div>
      </div>

      {/* SECCIÓN DE ANALÍTICA GEOGRÁFICA */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Distribución por Provincia */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-7 shadow-sm space-y-6">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <MapPin className="w-5 h-5 text-orange-600" />
            <div>
              <h2 className="text-base font-bold text-slate-900">Oferta por Provincia</h2>
              <p className="text-xs text-slate-500">Distribución de avisos en el NEA</p>
            </div>
          </div>

          <div className="space-y-4">
            {stats.provinciasStats.map((prov) => (
              <div key={prov.nombre} className="space-y-1.5">
                <div className="flex justify-between text-xs font-bold text-slate-700">
                  <span>{prov.nombre}</span>
                  <span>{prov.count} avisos ({prov.percentage}%)</span>
                </div>
                <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-600 to-orange-500 rounded-full"
                    style={{ width: `${Math.max(prov.percentage, 5)}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Localidades */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-7 shadow-sm space-y-6">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <Building className="w-5 h-5 text-blue-700" />
            <div>
              <h2 className="text-base font-bold text-slate-900">Top Ciudades con Más Oferta</h2>
              <p className="text-xs text-slate-500">Localidades con mayor concentración de avisos</p>
            </div>
          </div>

          <div className="space-y-3">
            {stats.topLocalidades.map((loc, idx) => (
              <div
                key={loc.nombre}
                className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-100 text-xs font-semibold"
              >
                <div className="flex items-center gap-2.5">
                  <span className="w-6 h-6 rounded-full bg-white border border-slate-200 text-slate-700 font-bold flex items-center justify-center text-[11px]">
                    {idx + 1}
                  </span>
                  <div>
                    <span className="text-slate-900 font-bold block">{loc.nombre}</span>
                    <span className="text-[10px] text-slate-400 font-normal">{loc.provincia}</span>
                  </div>
                </div>
                <span className="px-2.5 py-1 bg-white rounded-lg border border-slate-200 text-orange-600 font-bold">
                  {loc.count} {loc.count === 1 ? 'aviso' : 'avisos'}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Top Barrios */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-7 shadow-sm space-y-6">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <Home className="w-5 h-5 text-emerald-600" />
            <div>
              <h2 className="text-base font-bold text-slate-900">Barrios Más Solicitados</h2>
              <p className="text-xs text-slate-500">Zonas residenciales y universitarias</p>
            </div>
          </div>

          <div className="space-y-3">
            {stats.topBarrios.length > 0 ? (
              stats.topBarrios.map((bar, idx) => (
                <div
                  key={bar.nombre}
                  className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-100 text-xs font-semibold"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="w-6 h-6 rounded-full bg-white border border-slate-200 text-slate-700 font-bold flex items-center justify-center text-[11px]">
                      {idx + 1}
                    </span>
                    <span className="text-slate-900 font-bold">{bar.nombre}</span>
                  </div>
                  <span className="px-2.5 py-1 bg-white rounded-lg border border-slate-200 text-slate-700 font-bold">
                    {bar.count} avisos
                  </span>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400 text-center py-6">Sin datos de barrios aún</p>
            )}
          </div>
        </div>
      </div>

    </div>
  );
}

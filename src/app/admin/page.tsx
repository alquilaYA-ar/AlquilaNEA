import Link from 'next/link';
import {
  Users,
  Building2,
  Eye,
  TrendingUp,
  MapPin,
  UserCheck,
  Building,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  Shield,
  Phone,
  Mail,
  Home,
} from 'lucide-react';
import { getAdminStats } from '@/actions/admin';
import { formatCurrency } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export default async function AdminDashboardPage() {
  const stats = await getAdminStats();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* CABECERA DEL PANEL */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-900 text-white shadow-sm">
              <Shield className="w-3.5 h-3.5 text-orange-400" />
              Panel de Administración Central
            </span>
            <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              En Vivo
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-2">
            Métricas, Usuarios & Estadísticas de AlquilaNEA
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Monitoreo en tiempo real de oferta inmobiliaria, base de anunciantes y tráfico en Corrientes & Chaco.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/propiedades"
            className="px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-bold text-slate-700 transition flex items-center gap-1.5"
          >
            <Home className="w-4 h-4 text-slate-400" />
            <span>Ver Portal Público</span>
          </Link>
          <Link
            href="/publicar"
            className="px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold shadow-sm transition flex items-center gap-1.5"
          >
            <span>+ Publicar Aviso</span>
          </Link>
        </div>
      </div>

      {/* 4 TARJETAS PRINCIPALES DE RESUMEN */}
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

        {/* Tráfico & Visitas */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Visitas Acumuladas
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
              Interacciones totales de inquilinos en fichas técnicas
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

      {/* SECCIÓN DE ANALÍTICA GEOGRÁFICA (ZONAS MÁS PUBLICADAS) */}
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

      {/* TABLA DE DIRECTORIO DE USUARIOS REGISTRADOS */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-600" />
              Directorio de Usuarios & Anunciantes ({stats.users.length})
            </h2>
            <p className="text-xs text-slate-500">
              Dueños directos e inmobiliarias registradas en la plataforma
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-400 uppercase tracking-wider font-bold border-b border-slate-100">
              <tr>
                <th className="py-3 px-4">Anunciante</th>
                <th className="py-3 px-4">Tipo / Rol</th>
                <th className="py-3 px-4">Contacto (Email & WhatsApp)</th>
                <th className="py-3 px-4 text-center">Avisos</th>
                <th className="py-3 px-4 text-right">Fecha Registro</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {stats.users.map((user) => {
                const isDueno = user.tipo_anunciante === 'dueno_directo';
                return (
                  <tr key={user.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      {user.nombre_inmobiliaria ? (
                        <div>
                          <span>{user.nombre_inmobiliaria}</span>
                          <span className="block text-[11px] font-normal text-slate-500">
                            Contacto: {user.nombre_completo}
                          </span>
                        </div>
                      ) : (
                        user.nombre_completo
                      )}
                    </td>

                    <td className="py-3.5 px-4">
                      {isDueno ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-orange-100 text-orange-800">
                          <UserCheck className="w-3 h-3" />
                          Dueño Directo
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-blue-100 text-blue-800">
                          <Building2 className="w-3 h-3" />
                          Inmobiliaria
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 space-y-1">
                      <div className="flex items-center gap-1.5 text-slate-600">
                        <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{user.email_contacto}</span>
                      </div>
                      {user.whatsapp && (
                        <a
                          href={`https://wa.me/${user.whatsapp.replace(/[^0-9]/g, '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1.5 text-emerald-700 hover:underline font-semibold"
                        >
                          <Phone className="w-3.5 h-3.5 shrink-0" />
                          <span>{user.whatsapp}</span>
                        </a>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <span className="inline-block px-2.5 py-1 rounded-lg bg-slate-100 text-slate-800 font-bold">
                        {user.propiedadesCount}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right text-slate-400">
                      {new Date(user.created_at).toLocaleDateString('es-AR', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* PUBLICACIONES MÁS VISITADAS */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
        <div className="pb-4 border-b border-slate-100">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Eye className="w-5 h-5 text-emerald-600" />
            Avisos con Mayor Rendimiento & Visitas
          </h2>
          <p className="text-xs text-slate-500">
            Propiedades con mayor tracción e interés por parte de inquilinos en Corrientes y Chaco
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {stats.topVisitedProperties.map((prop) => (
            <div
              key={prop.id}
              className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between gap-4 hover:border-slate-300 transition"
            >
              <div className="space-y-1 min-w-0 flex-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  {prop.localidad} • {prop.anunciante}
                </span>
                <Link
                  href={`/propiedad/${prop.id}`}
                  className="font-bold text-slate-900 hover:text-orange-600 text-sm truncate block transition"
                >
                  {prop.titulo}
                </Link>
                <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                  <span>{formatCurrency(prop.precio_mensual, 'ARS')}</span>
                  <span>•</span>
                  <span className="capitalize text-[11px] text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                    {prop.estado}
                  </span>
                </div>
              </div>

              <div className="text-right shrink-0">
                <div className="text-base font-black text-emerald-700 flex items-center gap-1 justify-end">
                  <Eye className="w-4 h-4" />
                  <span>{prop.visitas_count}</span>
                </div>
                <span className="text-[10px] text-slate-400 font-semibold block">visitas</span>
                <Link
                  href={`/propiedad/${prop.id}`}
                  className="inline-flex items-center gap-1 text-[11px] text-blue-600 hover:underline font-bold mt-1"
                >
                  <span>Ver aviso</span>
                  <ArrowUpRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

import Link from 'next/link';
import Image from 'next/image';
import { redirect } from 'next/navigation';
import {
  Building2,
  PlusCircle,
  Pencil,
  Eye,
  Trash2,
  PauseCircle,
  PlayCircle,
  CheckCircle2,
  MapPin,
  Sparkles,
} from 'lucide-react';
import { getCurrentUser } from '@/actions/auth';
import { getMyProperties, deleteProperty, changePropertyStatus } from '@/actions/properties';
import { formatCurrency } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export default async function MisPublicacionesPage() {
  const { user, profile } = await getCurrentUser();

  if (!user) {
    redirect('/login?redirectTo=/mis-publicaciones');
  }

  const properties = await getMyProperties();

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Cabecera del Panel */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-200 gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold mb-2">
            <Building2 className="w-3.5 h-3.5" />
            <span>Panel de Anunciante • {profile?.tipo_anunciante === 'inmobiliaria' ? 'Inmobiliaria' : 'Dueño Directo'}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Mis Publicaciones
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Gestioná tus avisos, modificá precios y pausá o reactivá propiedades en tiempo real.
          </p>
        </div>

        {properties.length > 0 && (
          <Link
            href="/publicar"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-sm shadow-sm transition self-start sm:self-auto cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Publicar Nueva Propiedad</span>
          </Link>
        )}
      </div>

      {/* Lista de Publicaciones */}
      {properties.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-4 shadow-sm">
          <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
            <Building2 className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">
            Aún no tenés propiedades publicadas
          </h3>
          <p className="text-sm text-slate-500 max-w-md mx-auto">
            Publicá tu primer aviso de alquiler en Corrientes o Chaco de forma 100% gratuita para comenzar a recibir interesados en tu WhatsApp.
          </p>
          <div className="pt-2">
            <Link
              href="/publicar"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-sm shadow-md transition"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Publicar mi primera propiedad</span>
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Total: {properties.length} {properties.length === 1 ? 'publicación' : 'publicaciones'}
          </div>

          <div className="grid grid-cols-1 gap-4">
            {properties.map((prop) => {
              const portada = prop.propiedad_fotos?.find((f) => f.es_portada) || prop.propiedad_fotos?.[0];
              const imageUrl = portada?.storage_path || '/placeholder-property.svg';

              const ubicacionTexto = [
                prop.barrios?.nombre,
                prop.localidades?.nombre,
                prop.provincias?.nombre,
              ].filter(Boolean).join(', ');

              return (
                <div
                  key={prop.id}
                  className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-sm hover:shadow-md transition flex flex-col md:flex-row gap-5 items-start md:items-center justify-between"
                >
                  {/* Foto y Datos Principales */}
                  <div className="flex items-start gap-4 flex-1">
                    <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-xl overflow-hidden bg-slate-100 shrink-0 border border-slate-200">
                      <Image
                        src={imageUrl}
                        alt={prop.titulo}
                        fill
                        className="object-cover"
                      />
                    </div>

                    <div className="space-y-1.5 flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        {/* Badge de Estado */}
                        {prop.estado === 'activa' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-green-100 text-green-800">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-600"></span>
                            Activa
                          </span>
                        )}
                        {prop.estado === 'pausada' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-600"></span>
                            Pausada
                          </span>
                        )}
                        {prop.estado === 'alquilada' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-800">
                            <CheckCircle2 className="w-3 h-3 text-slate-600" />
                            Alquilada
                          </span>
                        )}

                        <span className="text-[11px] font-semibold text-slate-500 capitalize bg-slate-100 px-2 py-0.5 rounded">
                          {prop.tipo_inmueble}
                        </span>
                      </div>

                      <h3 className="text-base font-bold text-slate-900 truncate">
                        {prop.titulo}
                      </h3>

                      <div className="flex items-center gap-1 text-xs text-slate-500">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{ubicacionTexto}</span>
                      </div>

                      <div className="text-sm font-extrabold text-slate-900 pt-0.5">
                        {formatCurrency(prop.precio_mensual, prop.moneda)}
                        <span className="text-xs font-normal text-slate-500 ml-1">/ mes</span>
                        {prop.expensas_incluidas ? (
                          <span className="text-[11px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded ml-2">
                            Expensas incluidas
                          </span>
                        ) : (
                          <span className="text-[11px] text-slate-500 ml-2">
                            (+ {formatCurrency(prop.expensas_monto, prop.moneda)} expensas)
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Botones de Acción */}
                  <div className="flex flex-wrap items-center gap-2 self-end md:self-center border-t md:border-t-0 pt-3 md:pt-0 w-full md:w-auto justify-end">
                    {/* Ver en vivo */}
                    <Link
                      href={`/propiedad/${prop.id}`}
                      target="_blank"
                      className="p-2 sm:px-3 sm:py-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold flex items-center gap-1.5 transition"
                      title="Ver publicación pública"
                    >
                      <Eye className="w-4 h-4 text-slate-500" />
                      <span className="hidden sm:inline">Ver</span>
                    </Link>

                    {/* Editar (Solo datos, NO ubicación) */}
                    <Link
                      href={`/mis-publicaciones/editar/${prop.id}`}
                      className="px-3.5 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold flex items-center gap-1.5 transition"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                      <span>Editar</span>
                    </Link>

                    {/* Pausar / Reactivar Server Action form */}
                    <form
                      action={async () => {
                        'use server';
                        const nuevoEstado = prop.estado === 'activa' ? 'pausada' : 'activa';
                        await changePropertyStatus(prop.id, nuevoEstado);
                      }}
                    >
                      <button
                        type="submit"
                        className="px-3 py-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
                        title={prop.estado === 'activa' ? 'Pausar publicación' : 'Activar publicación'}
                      >
                        {prop.estado === 'activa' ? (
                          <>
                            <PauseCircle className="w-3.5 h-3.5 text-amber-600" />
                            <span className="hidden sm:inline">Pausar</span>
                          </>
                        ) : (
                          <>
                            <PlayCircle className="w-3.5 h-3.5 text-green-600" />
                            <span className="hidden sm:inline">Activar</span>
                          </>
                        )}
                      </button>
                    </form>

                    {/* Eliminar Aviso */}
                    <form
                      action={async () => {
                        'use server';
                        await deleteProperty(prop.id);
                      }}
                    >
                      <button
                        type="submit"
                        className="p-2 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 transition cursor-pointer"
                        title="Eliminar publicación"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </form>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}


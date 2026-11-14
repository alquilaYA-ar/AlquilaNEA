import Link from 'next/link';
import Image from 'next/image';
import { Bed, Bath, Car, Sparkles, Building2, UserCheck, MessageCircle, MapPin, PawPrint } from 'lucide-react';
import { Propiedad } from '@/types/database';
import { formatCurrency, buildWhatsAppLink } from '@/lib/utils';

interface PropertyCardProps {
  property: Propiedad;
}

export function PropertyCard({ property }: PropertyCardProps) {
  const isDuenoDirecto = property.profiles?.tipo_anunciante === 'dueno_directo';
  const portada = property.propiedad_fotos?.find((f) => f.es_portada) || property.propiedad_fotos?.[0];
  const imageUrl = portada?.storage_path || 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1000&q=80';

  const whatsappNumber = property.profiles?.whatsapp || '';
  const propertyUrl = typeof window !== 'undefined' ? `${window.location.origin}/propiedad/${property.id}` : `/propiedad/${property.id}`;
  const whatsappLink = buildWhatsAppLink(whatsappNumber, property.titulo, property.precio_mensual, propertyUrl);

  const ubicacionTexto = [
    property.barrios?.nombre,
    property.localidades?.nombre,
    property.provincias?.nombre,
  ].filter(Boolean).join(', ');

  return (
    <article className="group bg-white rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col overflow-hidden">
      {/* Imagen & Badges */}
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-100">
        <Image
          src={imageUrl}
          alt={property.titulo}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover group-hover:scale-105 transition-transform duration-500"
        />

        {/* Badge Tipo Anunciante */}
        <div className="absolute top-3 left-3 z-10 flex flex-col gap-1.5">
          {isDuenoDirecto ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-600 text-white shadow-md">
              <UserCheck className="w-3.5 h-3.5" />
              Dueño Directo (Sin Comisión)
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-slate-900 text-white shadow-md">
              <Building2 className="w-3.5 h-3.5" />
              Inmobiliaria
            </span>
          )}

          {property.destacada && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-400 text-amber-950 shadow-sm">
              <Sparkles className="w-3 h-3 fill-amber-950" />
              Destacado
            </span>
          )}
        </div>

        {/* Tipo Inmueble Tag */}
        <div className="absolute bottom-3 right-3 z-10">
          <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-black/60 backdrop-blur-md text-white capitalize">
            {property.tipo_inmueble}
          </span>
        </div>
      </div>

      {/* Contenido */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Ubicación */}
          <div className="flex items-center gap-1 text-xs font-medium text-slate-500 mb-1.5">
            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="truncate">{ubicacionTexto}</span>
          </div>

          {/* Título */}
          <Link href={`/propiedad/${property.id}`}>
            <h3 className="text-base font-bold text-slate-900 group-hover:text-emerald-600 transition line-clamp-2 mb-3">
              {property.titulo}
            </h3>
          </Link>

          {/* Precio y Expensas */}
          <div className="mb-4">
            <div className="text-xl font-extrabold text-slate-900">
              {formatCurrency(property.precio_mensual, property.moneda)}
              <span className="text-xs font-normal text-slate-500 ml-1">/ mes</span>
            </div>
            <p className="text-xs font-medium mt-0.5">
              {property.expensas_incluidas ? (
                <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-semibold">
                  Expensas incluidas
                </span>
              ) : (
                <span className="text-slate-600">
                  + {formatCurrency(property.expensas_monto, property.moneda)} expensas
                </span>
              )}
            </p>
          </div>

          {/* Características / Amenities */}
          <div className="flex items-center gap-3 text-xs text-slate-600 py-3 border-y border-slate-100 mb-4 flex-wrap">
            <span className="inline-flex items-center gap-1">
              <Bed className="w-4 h-4 text-slate-400" />
              {property.ambientes === 1 ? 'Monoambiente' : `${property.dormitorios} hab`}
            </span>
            <span className="inline-flex items-center gap-1">
              <Bath className="w-4 h-4 text-slate-400" />
              {property.banos} {property.banos === 1 ? 'baño' : 'baños'}
            </span>
            {property.cochera && (
              <span className="inline-flex items-center gap-1 text-emerald-700 font-medium">
                <Car className="w-4 h-4" />
                Cochera
              </span>
            )}
            {property.acepta_mascotas && (
              <span className="inline-flex items-center gap-1 text-slate-600">
                <PawPrint className="w-3.5 h-3.5 text-slate-400" />
                Mascotas
              </span>
            )}
          </div>
        </div>

        {/* Acciones */}
        <div className="flex items-center gap-2 pt-1">
          <Link
            href={`/propiedad/${property.id}`}
            className="flex-1 text-center py-2.5 px-3 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
          >
            Ver Detalle
          </Link>
          {whatsappNumber && (
            <a
              href={whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-1.5 py-2.5 px-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm transition"
              title="Consultar por WhatsApp"
            >
              <MessageCircle className="w-4 h-4 fill-white text-emerald-600" />
              <span>WhatsApp</span>
            </a>
          )}
        </div>
      </div>
    </article>
  );
}


import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  Bed,
  Bath,
  Car,
  Sparkles,
  Building2,
  UserCheck,
  MessageCircle,
  MapPin,
  PawPrint,
  Wind,
  Waves,
  ArrowLeft,
  Calendar,
  CheckCircle2,
} from 'lucide-react';
import { getPropertyById } from '@/actions/properties';
import { formatCurrency, buildWhatsAppLink } from '@/lib/utils';

interface PropiedadDetallePageProps {
  params: Promise<{ id: string }>;
}

export default async function PropiedadDetallePage({ params }: PropiedadDetallePageProps) {
  const { id } = await params;
  const property = await getPropertyById(id);

  if (!property) {
    notFound();
  }

  const isDuenoDirecto = property.profiles?.tipo_anunciante === 'dueno_directo';
  const fotos = property.propiedad_fotos || [];
  const portada = fotos.find((f) => f.es_portada) || fotos[0];
  const mainImageUrl = portada?.storage_path || 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1200&q=80';

  const whatsappNumber = property.profiles?.whatsapp || '';
  const propertyUrl = `https://alquilanea.com.ar/propiedad/${property.id}`;
  const whatsappLink = buildWhatsAppLink(whatsappNumber, property.titulo, property.precio_mensual, propertyUrl);

  const ubicacionTexto = [
    property.barrios?.nombre,
    property.localidades?.nombre,
    property.provincias?.nombre,
  ].filter(Boolean).join(', ');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Botón Volver */}
      <Link
        href="/propiedades"
        className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-900 transition"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Volver a los resultados de búsqueda</span>
      </Link>

      {/* CABECERA: TÍTULO, BADGES Y PRECIO */}
      <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6 pb-6 border-b border-slate-200">
        <div className="space-y-3 max-w-3xl">
          {/* Badges */}
          <div className="flex flex-wrap items-center gap-2">
            {isDuenoDirecto ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-orange-600 text-white shadow-sm">
                <UserCheck className="w-4 h-4" />
                Dueño Directo (Sin Comisión Inmobiliaria)
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-900 text-white shadow-sm">
                <Building2 className="w-4 h-4" />
                Inmobiliaria: {property.profiles?.nombre_inmobiliaria || 'Profesional'}
              </span>
            )}

            {property.destacada && (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-amber-400 text-amber-950 shadow-sm">
                <Sparkles className="w-3.5 h-3.5 fill-amber-950" />
                Destacada
              </span>
            )}

            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 capitalize">
              {property.tipo_inmueble}
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
            {property.titulo}
          </h1>

          <div className="flex items-center gap-1 text-sm font-medium text-slate-500">
            <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{ubicacionTexto}</span>
            {property.direccion_calle && (
              <span className="text-slate-400">• {property.direccion_calle}</span>
            )}
          </div>
        </div>

        {/* Precio Destacado */}
        <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200/90 text-right min-w-[240px]">
          <span className="text-xs uppercase font-bold text-slate-400 tracking-wider">
            Alquiler Mensual
          </span>
          <div className="text-3xl font-extrabold text-slate-900 mt-1">
            {formatCurrency(property.precio_mensual, property.moneda)}
          </div>
          <p className="text-xs font-semibold mt-1">
            {property.expensas_incluidas ? (
              <span className="text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-md inline-block mt-1">
                ✓ Expensas Incluidas
              </span>
            ) : (
              <span className="text-slate-600">
                + {formatCurrency(property.expensas_monto, property.moneda)} expensas
              </span>
            )}
          </p>
        </div>
      </div>

      {/* GALERÍA DE FOTOS */}
      <div className="space-y-4">
        <div className="relative aspect-[16/9] md:aspect-[21/9] w-full rounded-3xl overflow-hidden shadow-md bg-slate-100">
          <Image
            src={mainImageUrl}
            alt={property.titulo}
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
        </div>

        {fotos.length > 1 && (
          <div className="grid grid-cols-4 sm:grid-cols-6 gap-3">
            {fotos.map((foto, idx) => (
              <div
                key={foto.id || idx}
                className="relative aspect-[4/3] rounded-xl overflow-hidden border border-slate-200 shadow-sm bg-slate-100"
              >
                <Image
                  src={foto.storage_path}
                  alt={`Foto ${idx + 1}`}
                  fill
                  sizes="20vw"
                  className="object-cover hover:scale-105 transition"
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* DETALLE Y CONTACTO (2 COLUMNAS) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Columna Izquierda: Ficha Técnica y Descripción */}
        <div className="lg:col-span-2 space-y-8">
          {/* Amenities / Resumen Rápido */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-sm">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-4">
              Características Principales
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm text-slate-700">
              <div className="flex items-center gap-2">
                <Bed className="w-5 h-5 text-emerald-600" />
                <div>
                  <div className="font-bold text-slate-900">{property.ambientes} Ambientes</div>
                  <div className="text-xs text-slate-500">{property.dormitorios} Dormitorios</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Bath className="w-5 h-5 text-emerald-600" />
                <div>
                  <div className="font-bold text-slate-900">{property.banos} Baños</div>
                  <div className="text-xs text-slate-500">Completos</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Car className="w-5 h-5 text-emerald-600" />
                <div>
                  <div className="font-bold text-slate-900">
                    {property.cochera ? 'Con Cochera' : 'Sin cochera'}
                  </div>
                  <div className="text-xs text-slate-500">Espacio para auto</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <PawPrint className="w-5 h-5 text-emerald-600" />
                <div>
                  <div className="font-bold text-slate-900">
                    {property.acepta_mascotas ? 'Acepta Mascotas' : 'Sin mascotas'}
                  </div>
                  <div className="text-xs text-slate-500">Política de mascotas</div>
                </div>
              </div>
            </div>
          </div>

          {/* Comodidades Adicionales */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-sm">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-4">
              Comodidades y Servicios
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs sm:text-sm text-slate-700">
              {property.terraza_balcon && (
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Balcón / Terraza</span>
                </div>
              )}
              {property.patio && (
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Patio / Jardín</span>
                </div>
              )}
              {property.aire_acondicionado && (
                <div className="flex items-center gap-2">
                  <Wind className="w-4 h-4 text-emerald-600" />
                  <span>Aire Acondicionado</span>
                </div>
              )}
              {property.pileta && (
                <div className="flex items-center gap-2">
                  <Waves className="w-4 h-4 text-emerald-600" />
                  <span>Pileta / Piscina</span>
                </div>
              )}
              {property.expensas_incluidas && (
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Expensas bonificadas</span>
                </div>
              )}
            </div>
          </div>

          {/* Descripción Completa */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-sm space-y-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">
              Descripción del Inmueble
            </h3>
            <p className="text-sm sm:text-base text-slate-700 whitespace-pre-line leading-relaxed">
              {property.descripcion}
            </p>
          </div>
        </div>

        {/* Columna Derecha: Tarjeta de Contacto Anunciante */}
        <div className="lg:col-span-1 sticky top-24">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xl p-6 space-y-6">
            <div className="pb-4 border-b border-slate-100">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Anunciante
              </span>
              <h4 className="text-lg font-bold text-slate-900 mt-1">
                {property.profiles?.nombre_inmobiliaria || property.profiles?.nombre_completo}
              </h4>
              <p className="text-xs text-slate-500 mt-0.5">
                {isDuenoDirecto ? 'Propietario / Dueño Directo' : `Inmobiliaria • Matrícula: ${property.profiles?.matricula_inmobiliaria || 'Verificada'}`}
              </p>
            </div>

            {/* CTA WhatsApp Principal */}
            {whatsappNumber ? (
              <div className="space-y-3">
                <a
                  href={whatsappLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-flex items-center justify-center gap-2 py-3.5 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md hover:shadow-lg transition cursor-pointer"
                >
                  <MessageCircle className="w-5 h-5 fill-white text-emerald-600" />
                  <span>Contactar por WhatsApp</span>
                </a>
                <p className="text-[11px] text-center text-slate-400">
                  Respuesta directa sin intermediarios.
                </p>
              </div>
            ) : (
              <p className="text-xs text-slate-500">Contacto disponible vía mensaje interno.</p>
            )}

            {/* Información adicional de seguridad */}
            <div className="bg-slate-50 rounded-2xl p-4 text-xs text-slate-600 space-y-2 border border-slate-100">
              <div className="flex items-center gap-2 font-semibold text-slate-800">
                <Calendar className="w-4 h-4 text-emerald-600" />
                <span>Publicado recientemente</span>
              </div>
              <p className="text-[11px] text-slate-500">
                AlquilaNEA te conecta directamente con el propietario. No envíes dinero previo sin antes visitar el inmueble.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


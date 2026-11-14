'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Lock,
  DollarSign,
  Building,
  CheckCircle2,
  ArrowLeft,
  Loader2,
  MapPin,
} from 'lucide-react';
import { Propiedad } from '@/types/database';
import { updateProperty } from '@/actions/properties';

interface EditPropertyFormProps {
  property: Propiedad;
}

export function EditPropertyForm({ property }: EditPropertyFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Form State (Datos editables)
  const [formData, setFormData] = useState({
    titulo: property.titulo,
    descripcion: property.descripcion,
    tipoInmueble: property.tipo_inmueble,
    ambientes: property.ambientes,
    dormitorios: property.dormitorios,
    banos: property.banos,
    cochera: property.cochera,
    terrazaBalcon: property.terraza_balcon,
    patio: property.patio,
    aceptaMascotas: property.acepta_mascotas,
    aireAcondicionado: property.aire_acondicionado,
    pileta: property.pileta,
    precioMensual: property.precio_mensual.toString(),
    expensasIncluidas: property.expensas_incluidas,
    expensasMonto: property.expensas_monto.toString(),
    estado: property.estado as 'activa' | 'pausada' | 'alquilada',
  });

  const ubicacionFijaTexto = [
    property.barrios?.nombre,
    property.localidades?.nombre,
    property.provincias?.nombre,
  ].filter(Boolean).join(', ');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(null);

    try {
      const res = await updateProperty({
        propertyId: property.id,
        titulo: formData.titulo,
        descripcion: formData.descripcion,
        tipoInmueble: formData.tipoInmueble,
        ambientes: Number(formData.ambientes),
        dormitorios: Number(formData.dormitorios),
        banos: Number(formData.banos),
        cochera: formData.cochera,
        terrazaBalcon: formData.terrazaBalcon,
        patio: formData.patio,
        aceptaMascotas: formData.aceptaMascotas,
        aireAcondicionado: formData.aireAcondicionado,
        pileta: formData.pileta,
        precioMensual: Number(formData.precioMensual),
        expensasIncluidas: formData.expensasIncluidas,
        expensasMonto: formData.expensasIncluidas ? 0 : Number(formData.expensasMonto || 0),
        estado: formData.estado,
      });

      if (!res.success) {
        throw new Error(res.error || 'Error al actualizar el aviso.');
      }

      router.push('/mis-publicaciones');
      router.refresh();
    } catch (err: any) {
      setErrorMessage(err.message || 'Error inesperado al guardar los cambios.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-slate-200">
        <div>
          <Link
            href="/mis-publicaciones"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Volver a Mis Publicaciones</span>
          </Link>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Editar Publicación
          </h1>
        </div>
      </div>

      {errorMessage && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold">
          {errorMessage}
        </div>
      )}

      {/* BLOQUE DE UBICACIÓN FIJA (NO EDITABLE) */}
      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-2">
        <div className="flex items-center gap-2 text-slate-700">
          <div className="w-7 h-7 rounded-lg bg-slate-200 text-slate-700 flex items-center justify-center shrink-0">
            <Lock className="w-4 h-4" />
          </div>
          <div>
            <span className="text-xs font-extrabold uppercase tracking-wider text-slate-800">
              Ubicación Geográfica (Fija • No modificable)
            </span>
            <p className="text-xs text-slate-500">
              Por transparencia con los inquilinos, la ubicación del inmueble no puede ser alterada una vez creado el aviso.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-sm font-bold text-slate-900 pl-9">
          <MapPin className="w-4 h-4 text-orange-600 shrink-0" />
          <span>{ubicacionFijaTexto}</span>
          {property.direccion_calle && (
            <span className="text-slate-500 font-normal">• {property.direccion_calle}</span>
          )}
        </div>
      </div>

      {/* FORMULARIO DE EDICIÓN */}
      <form onSubmit={handleSubmit} className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
        {/* Título y Estado */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="sm:col-span-2">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Título del Aviso *
            </label>
            <input
              type="text"
              required
              value={formData.titulo}
              onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Estado de la Publicación
            </label>
            <select
              value={formData.estado}
              onChange={(e) => setFormData({ ...formData, estado: e.target.value as any })}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-bold capitalize text-slate-800"
            >
              <option value="activa">🟢 Activa (Visible)</option>
              <option value="pausada">🟡 Pausada (Oculta)</option>
              <option value="alquilada">⚪ Alquilada</option>
            </select>
          </div>
        </div>

        {/* Tipo e Inmueble y Ambientes */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Tipo de Inmueble
            </label>
            <select
              value={formData.tipoInmueble}
              onChange={(e) => setFormData({ ...formData, tipoInmueble: e.target.value as any })}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm capitalize"
            >
              <option value="departamento">Departamento</option>
              <option value="casa">Casa</option>
              <option value="monoambiente">Monoambiente</option>
              <option value="ph">PH</option>
              <option value="oficina">Oficina</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Ambientes
            </label>
            <input
              type="number"
              min="1"
              max="10"
              value={formData.ambientes}
              onChange={(e) => setFormData({ ...formData, ambientes: Number(e.target.value) })}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Baños
            </label>
            <input
              type="number"
              min="1"
              max="5"
              value={formData.banos}
              onChange={(e) => setFormData({ ...formData, banos: Number(e.target.value) })}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm"
            />
          </div>
        </div>

        {/* Precio y Expensas */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-200">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Precio Alquiler Mensual (ARS) *
            </label>
            <input
              type="number"
              required
              value={formData.precioMensual}
              onChange={(e) => setFormData({ ...formData, precioMensual: e.target.value })}
              className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-bold text-slate-900"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Situación de Expensas
            </label>
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.expensasIncluidas}
                  onChange={(e) => setFormData({ ...formData, expensasIncluidas: e.target.checked })}
                  className="rounded text-orange-600"
                />
                <span>Expensas ya incluidas en el precio</span>
              </label>
              {!formData.expensasIncluidas && (
                <input
                  type="number"
                  placeholder="Monto de expensas extra (ARS)"
                  value={formData.expensasMonto}
                  onChange={(e) => setFormData({ ...formData, expensasMonto: e.target.value })}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs"
                />
              )}
            </div>
          </div>
        </div>

        {/* Amenities */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
            Comodidades y Servicios
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs font-medium text-slate-700">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.cochera}
                onChange={(e) => setFormData({ ...formData, cochera: e.target.checked })}
                className="rounded text-orange-600"
              />
              <span>Cochera / Garage</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.terrazaBalcon}
                onChange={(e) => setFormData({ ...formData, terrazaBalcon: e.target.checked })}
                className="rounded text-orange-600"
              />
              <span>Balcón / Terraza</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.patio}
                onChange={(e) => setFormData({ ...formData, patio: e.target.checked })}
                className="rounded text-orange-600"
              />
              <span>Patio / Jardín</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.aceptaMascotas}
                onChange={(e) => setFormData({ ...formData, aceptaMascotas: e.target.checked })}
                className="rounded text-orange-600"
              />
              <span>Acepta Mascotas</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.aireAcondicionado}
                onChange={(e) => setFormData({ ...formData, aireAcondicionado: e.target.checked })}
                className="rounded text-orange-600"
              />
              <span>Aire Acondicionado</span>
            </label>
          </div>
        </div>

        {/* Descripción */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
            Descripción Completa *
          </label>
          <textarea
            rows={5}
            required
            value={formData.descripcion}
            onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm"
          ></textarea>
        </div>

        {/* Botones Guardar / Cancelar */}
        <div className="flex justify-between items-center pt-4 border-t border-slate-100">
          <Link
            href="/mis-publicaciones"
            className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-semibold text-sm transition"
          >
            Cancelar
          </Link>

          <button
            type="submit"
            disabled={loading}
            className="px-8 py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-sm font-bold shadow-md transition disabled:opacity-50 flex items-center gap-2 cursor-pointer"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            <span>{loading ? 'Guardando cambios...' : 'Guardar Cambios'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}

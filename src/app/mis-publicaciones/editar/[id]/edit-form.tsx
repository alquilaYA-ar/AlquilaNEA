'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  Lock,
  DollarSign,
  Building,
  CheckCircle2,
  ArrowLeft,
  Loader2,
  MapPin,
  Image as ImageIcon,
  Trash2,
  Star,
  UploadCloud,
  X,
} from 'lucide-react';
import { Propiedad, PropiedadFoto } from '@/types/database';
import {
  updateProperty,
  addPropertyPhotos,
  deletePropertyPhoto,
  setCoverPhoto,
} from '@/actions/properties';
import { createClient } from '@/lib/supabase/client';
import { calculateMaxPhotos } from '@/lib/photo-limits';

interface EditPropertyFormProps {
  property: Propiedad;
}

export function EditPropertyForm({ property }: EditPropertyFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Estado de Fotos actuales
  const [photos, setPhotos] = useState<PropiedadFoto[]>(property.propiedad_fotos || []);
  const [photoActionLoading, setPhotoActionLoading] = useState<string | null>(null);

  // Estado para Nuevas Fotos
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const [newPreviews, setNewPreviews] = useState<string[]>([]);
  const [uploadingPhotos, setUploadingPhotos] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string | null>(null);

  // Form State (Datos editables del inmueble)
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
  ]
    .filter(Boolean)
    .join(', ');

  // ==========================================
  // GESTIÓN DE FOTOGRAFÍAS
  // ==========================================

  // Cupo dinámico de fotos según ambientes, cochera, terraza, etc.
  const photoLimit = calculateMaxPhotos({
    ambientes: formData.ambientes,
    cochera: formData.cochera,
    terrazaBalcon: formData.terrazaBalcon,
    patio: formData.patio,
    pileta: formData.pileta,
  });

  const totalCurrentPhotos = photos.length + newFiles.length;

  // Manejar selección de archivos nuevos con cupo dinámico
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const files = Array.from(e.target.files);
    const availableSlots = photoLimit.maxPhotos - (photos.length + newFiles.length);

    if (availableSlots <= 0) {
      alert(`Has alcanzado el límite máximo de ${photoLimit.maxPhotos} fotos para las características de este inmueble.`);
      return;
    }

    const filesToAdd = files.slice(0, availableSlots);
    if (files.length > availableSlots) {
      alert(`Solo se agregaron ${availableSlots} foto(s) para no exceder el cupo máximo permitido (${photoLimit.maxPhotos} fotos).`);
    }

    setNewFiles((prev) => [...prev, ...filesToAdd]);
    const previews = filesToAdd.map((file) => URL.createObjectURL(file));
    setNewPreviews((prev) => [...prev, ...previews]);
  };

  const removeSelectedFile = (index: number) => {
    setNewFiles((prev) => prev.filter((_, i) => i !== index));
    setNewPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  // Subir nuevas fotos a Supabase Storage y asociarlas
  const handleUploadNewPhotos = async () => {
    if (newFiles.length === 0) return;
    setUploadingPhotos(true);
    setUploadProgress(`Subiendo 1 de ${newFiles.length} fotos...`);
    setErrorMessage(null);

    try {
      const supabase = createClient();
      const uploadedUrls: string[] = [];

      for (let i = 0; i < newFiles.length; i++) {
        const file = newFiles[i];
        setUploadProgress(`Subiendo foto ${i + 1} de ${newFiles.length}...`);

        const fileExt = file.name.split('.').pop() || 'jpg';
        const cleanName = file.name.replace(/[^a-zA-Z0-9]/g, '_').slice(0, 20);
        const fileName = `${Date.now()}_${cleanName}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from('properties')
          .upload(fileName, file, {
            cacheControl: '3600',
            upsert: true,
          });

        if (uploadError) {
          throw new Error(`Error en Storage: ${uploadError.message}. Verifica las políticas de RLS.`);
        }

        const { data: { publicUrl } } = supabase.storage
          .from('properties')
          .getPublicUrl(fileName);

        uploadedUrls.push(publicUrl);
      }

      setUploadProgress('Guardando fotos en la publicación...');
      const res = await addPropertyPhotos(property.id, uploadedUrls);

      if (!res.success) {
        throw new Error(res.error || 'Error al asociar las fotos a la propiedad.');
      }

      if (res.photos) {
        setPhotos((prev) => [...prev, ...(res.photos as PropiedadFoto[])]);
      }

      setNewFiles([]);
      setNewPreviews([]);
      setSuccessMessage('Fotos subidas y agregadas correctamente.');
      setTimeout(() => setSuccessMessage(null), 4000);
      router.refresh();
    } catch (err: any) {
      setErrorMessage(err.message || 'Error al subir fotos.');
    } finally {
      setUploadingPhotos(false);
      setUploadProgress(null);
    }
  };

  // Eliminar una foto existente
  const handleDeletePhoto = async (photoId: string) => {
    if (!confirm('¿Estás seguro de que deseas eliminar esta fotografía?')) return;
    setPhotoActionLoading(photoId);
    setErrorMessage(null);

    try {
      const res = await deletePropertyPhoto(photoId, property.id);
      if (!res.success) throw new Error(res.error || 'Error al eliminar la foto.');

      setPhotos((prev) => {
        const updated = prev.filter((p) => p.id !== photoId);
        // Si borramos la que era portada y quedan otras, marcar la primera como portada localmente
        const wasCover = prev.find((p) => p.id === photoId)?.es_portada;
        if (wasCover && updated.length > 0) {
          updated[0].es_portada = true;
        }
        return [...updated];
      });

      setSuccessMessage('Foto eliminada correctamente.');
      setTimeout(() => setSuccessMessage(null), 4000);
      router.refresh();
    } catch (err: any) {
      setErrorMessage(err.message || 'Error al eliminar la foto.');
    } finally {
      setPhotoActionLoading(null);
    }
  };

  // Marcar una foto como portada
  const handleSetCover = async (photoId: string) => {
    setPhotoActionLoading(photoId);
    setErrorMessage(null);

    try {
      const res = await setCoverPhoto(photoId, property.id);
      if (!res.success) throw new Error(res.error || 'Error al cambiar la foto de portada.');

      setPhotos((prev) =>
        prev.map((p) => ({
          ...p,
          es_portada: p.id === photoId,
        }))
      );

      setSuccessMessage('Foto de portada actualizada.');
      setTimeout(() => setSuccessMessage(null), 4000);
      router.refresh();
    } catch (err: any) {
      setErrorMessage(err.message || 'Error al definir foto de portada.');
    } finally {
      setPhotoActionLoading(null);
    }
  };

  // ==========================================
  // GUARDAR DATOS DEL FORMULARIO
  // ==========================================
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

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
      {/* Encabezado */}
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

      {successMessage && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMessage}</span>
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

      {/* ======================================================== */}
      {/* SECCIÓN DE GESTIÓN DE FOTOS */}
      {/* ======================================================== */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center">
              <ImageIcon className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Fotografías del Inmueble ({photos.length})
              </h2>
              <p className="text-xs text-slate-500">
                Puedes cambiar la foto de portada, eliminar fotos o agregar nuevas imágenes.
              </p>
            </div>
          </div>
        </div>

        {/* CUPO DINÁMICO DE FOTOS */}
        <div className="p-4 bg-orange-50 border border-orange-200 rounded-2xl space-y-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <span className="text-xs font-bold text-orange-950 uppercase tracking-wider">
              Cupo de Fotos para este Inmueble
            </span>
            <span className="px-3 py-1 bg-orange-600 text-white rounded-lg text-xs font-black shadow-xs self-start sm:self-auto">
              {totalCurrentPhotos} de {photoLimit.maxPhotos} fotos (máx. 10)
            </span>
          </div>
          <div className="flex flex-wrap gap-1.5 text-[11px] font-semibold text-orange-800">
            {photoLimit.breakdown.map((item, i) => (
              <span key={i} className="px-2 py-0.5 bg-white rounded-md border border-orange-200">
                {item}
              </span>
            ))}
          </div>
        </div>

        {/* Galería de fotos existentes */}
        {photos.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {photos.map((foto) => {
              const isCover = foto.es_portada;
              const isActionRunning = photoActionLoading === foto.id;

              return (
                <div
                  key={foto.id}
                  className={`relative group rounded-2xl overflow-hidden border-2 transition ${
                    isCover ? 'border-orange-500 ring-2 ring-orange-200' : 'border-slate-200'
                  }`}
                >
                  <div className="aspect-[4/3] relative bg-slate-100">
                    <img
                      src={foto.storage_path}
                      alt="Foto de la propiedad"
                      className="w-full h-full object-cover"
                    />

                    {/* Badge Portada */}
                    {isCover && (
                      <div className="absolute top-2 left-2 bg-orange-600 text-white text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md shadow-md flex items-center gap-1">
                        <Star className="w-3 h-3 fill-white" />
                        <span>Portada</span>
                      </div>
                    )}

                    {/* Overlay con acciones */}
                    <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-2.5">
                      <div className="flex justify-end">
                        <button
                          type="button"
                          onClick={() => handleDeletePhoto(foto.id)}
                          disabled={isActionRunning}
                          title="Eliminar foto"
                          className="w-8 h-8 rounded-lg bg-red-600 hover:bg-red-700 text-white flex items-center justify-center transition shadow cursor-pointer disabled:opacity-50"
                        >
                          {isActionRunning ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </button>
                      </div>

                      {!isCover && (
                        <button
                          type="button"
                          onClick={() => handleSetCover(foto.id)}
                          disabled={isActionRunning}
                          className="w-full py-1.5 px-2 bg-white/95 hover:bg-white text-slate-800 text-[11px] font-bold rounded-lg transition shadow flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                        >
                          <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                          <span>Hacer Portada</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-8 text-center bg-slate-50 border border-dashed border-slate-200 rounded-2xl text-slate-500 text-xs">
            Aún no hay fotos cargadas en esta publicación.
          </div>
        )}

        {/* Subida de nuevas fotos */}
        <div className="pt-4 border-t border-slate-100 space-y-4">
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
            Agregar Más Fotos
          </label>

          <label className="border-2 border-dashed border-slate-200 hover:border-orange-500 rounded-2xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition bg-slate-50 hover:bg-orange-50/20 block">
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleFileChange}
              disabled={uploadingPhotos}
              className="hidden"
            />
            <div className="w-10 h-10 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center mb-2">
              <UploadCloud className="w-5 h-5" />
            </div>
            <p className="text-xs font-bold text-slate-800">
              Haz clic para seleccionar imágenes
            </p>
            <p className="text-[11px] text-slate-500 mt-1">
              JPG, PNG o WebP hasta 5MB por foto
            </p>
          </label>

          {/* Previsualización de fotos recién seleccionadas */}
          {newPreviews.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                <span>Fotos seleccionadas para subir ({newPreviews.length}):</span>
              </div>

              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
                {newPreviews.map((url, idx) => (
                  <div key={idx} className="relative aspect-square rounded-xl overflow-hidden border border-slate-200 group bg-slate-100">
                    <img src={url} alt={`Nueva ${idx}`} className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeSelectedFile(idx)}
                      disabled={uploadingPhotos}
                      className="absolute top-1 right-1 w-6 h-6 rounded-full bg-red-600 text-white flex items-center justify-center hover:bg-red-700 transition cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setNewFiles([]);
                    setNewPreviews([]);
                  }}
                  disabled={uploadingPhotos}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 transition"
                >
                  Cancelar selección
                </button>

                <button
                  type="button"
                  onClick={handleUploadNewPhotos}
                  disabled={uploadingPhotos}
                  className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {uploadingPhotos ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>{uploadProgress || 'Subiendo...'}</span>
                    </>
                  ) : (
                    <>
                      <UploadCloud className="w-3.5 h-3.5" />
                      <span>Subir {newFiles.length} foto{newFiles.length > 1 ? 's' : ''}</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ======================================================== */}
      {/* FORMULARIO DE DETALLES DEL INMUEBLE */}
      {/* ======================================================== */}
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
              onChange={(e) =>
                setFormData({
                  ...formData,
                  estado: e.target.value as 'activa' | 'pausada' | 'alquilada',
                })
              }
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-slate-800"
            >
              <option value="activa">🟢 Activa (Visible)</option>
              <option value="pausada">🟡 Pausada (Oculta)</option>
              <option value="alquilada">🔴 Alquilada (Finalizada)</option>
            </select>
          </div>
        </div>

        {/* Tipo de Inmueble y Características */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Tipo de Inmueble
            </label>
            <select
              value={formData.tipoInmueble}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  tipoInmueble: e.target.value as Propiedad['tipo_inmueble'],
                })
              }
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-sm"
            >
              <option value="departamento">Departamento</option>
              <option value="casa">Casa</option>
              <option value="monoambiente">Monoambiente</option>
              <option value="duplex">Dúplex</option>
              <option value="ph">PH</option>
              <option value="quinta">Quinta / Casa de campo</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Ambientes
            </label>
            <input
              type="number"
              min={1}
              max={10}
              value={formData.ambientes}
              onChange={(e) => setFormData({ ...formData, ambientes: Number(e.target.value) })}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Dormitorios
            </label>
            <input
              type="number"
              min={0}
              max={10}
              value={formData.dormitorios}
              onChange={(e) => setFormData({ ...formData, dormitorios: Number(e.target.value) })}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Baños
            </label>
            <input
              type="number"
              min={1}
              max={10}
              value={formData.banos}
              onChange={(e) => setFormData({ ...formData, banos: Number(e.target.value) })}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-sm"
            />
          </div>
        </div>

        {/* Precio y Expensas */}
        <div className="bg-orange-50/50 border border-orange-100 rounded-2xl p-5 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1">
                Precio Mensual de Alquiler (ARS) *
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold">
                  $
                </span>
                <input
                  type="number"
                  required
                  min={1}
                  value={formData.precioMensual}
                  onChange={(e) => setFormData({ ...formData, precioMensual: e.target.value })}
                  className="w-full bg-white border border-slate-200 rounded-xl pl-8 pr-3.5 py-2.5 text-base font-bold text-slate-900 focus:ring-2 focus:ring-orange-500"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1">
                Expensas
              </label>
              <div className="flex items-center gap-4 pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700">
                  <input
                    type="radio"
                    name="expensas"
                    checked={formData.expensasIncluidas}
                    onChange={() => setFormData({ ...formData, expensasIncluidas: true })}
                    className="text-orange-600"
                  />
                  <span>Incluidas en el precio</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700">
                  <input
                    type="radio"
                    name="expensas"
                    checked={!formData.expensasIncluidas}
                    onChange={() => setFormData({ ...formData, expensasIncluidas: false })}
                    className="text-orange-600"
                  />
                  <span>Se pagan aparte</span>
                </label>
              </div>

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
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.pileta}
                onChange={(e) => setFormData({ ...formData, pileta: e.target.checked })}
                className="rounded text-orange-600"
              />
              <span>Pileta / Piscina</span>
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

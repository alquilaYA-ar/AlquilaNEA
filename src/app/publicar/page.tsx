'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import {
  Upload,
  CheckCircle,
  Building,
  DollarSign,
  Image as ImageIcon,
  Check,
  Sparkles,
  X,
  Loader2,
} from 'lucide-react';
import { Provincia, Localidad, Barrio } from '@/types/database';
import { getProvincias, getLocalidades, getBarrios } from '@/actions/locations';
import { createProperty } from '@/actions/properties';
import { createClient } from '@/lib/supabase/client';

export default function PublicarPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Paso actual (1: Ubicación, 2: Datos y Precios, 3: Contacto y Fotos)
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [newPropertyId, setNewPropertyId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Datos geográficos
  const [provincias, setProvincias] = useState<Provincia[]>([]);
  const [localidades, setLocalidades] = useState<Localidad[]>([]);
  const [barrios, setBarrios] = useState<Barrio[]>([]);

  // Estado de Fotos
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [uploadProgress, setUploadProgress] = useState<string>('');

  // Form State
  const [formData, setFormData] = useState({
    provinciaId: '',
    localidadId: '',
    barrioId: '',
    direccionCalle: '',
    titulo: '',
    descripcion: '',
    tipoInmueble: 'departamento',
    ambientes: 2,
    dormitorios: 1,
    banos: 1,
    cochera: false,
    terrazaBalcon: false,
    patio: false,
    aceptaMascotas: false,
    aireAcondicionado: false,
    pileta: false,
    precioMensual: '',
    expensasIncluidas: true,
    expensasMonto: '',
    tipoAnunciante: 'dueno_directo' as 'dueno_directo' | 'inmobiliaria',
    nombreContacto: '',
    whatsapp: '',
    destacar: false,
  });

  useEffect(() => {
    async function initGeo() {
      const provs = await getProvincias();
      setProvincias(provs);
      if (provs.length > 0) {
        setFormData((prev) => ({ ...prev, provinciaId: provs[0].id.toString() }));
      }
    }
    initGeo();
  }, []);

  useEffect(() => {
    if (!formData.provinciaId) return;
    async function loadLocs() {
      const locs = await getLocalidades(Number(formData.provinciaId));
      setLocalidades(locs);
      if (locs.length > 0) {
        setFormData((prev) => ({ ...prev, localidadId: locs[0].id.toString() }));
      }
    }
    loadLocs();
  }, [formData.provinciaId]);

  useEffect(() => {
    if (!formData.localidadId) return;
    async function loadBars() {
      const bars = await getBarrios(Number(formData.localidadId));
      setBarrios(bars);
      if (bars.length > 0) {
        setFormData((prev) => ({ ...prev, barrioId: bars[0].id.toString() }));
      } else {
        setFormData((prev) => ({ ...prev, barrioId: '' }));
      }
    }
    loadBars();
  }, [formData.localidadId]);

  // Manejo de Fotos Locales
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const files = Array.from(e.target.files);
    setSelectedFiles((prev) => [...prev, ...files]);

    const newPreviews = files.map((file) => URL.createObjectURL(file));
    setPreviewUrls((prev) => [...prev, ...newPreviews]);
  };

  const removePhoto = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
    setPreviewUrls((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(null);

    try {
      const supabase = createClient();
      const uploadedUrls: string[] = [];

      // 1. Subir fotos a Supabase Storage
      if (selectedFiles.length > 0) {
        setUploadProgress(`Subiendo 1 de ${selectedFiles.length} fotos a Supabase Storage...`);
        for (let i = 0; i < selectedFiles.length; i++) {
          const file = selectedFiles[i];
          setUploadProgress(`Subiendo foto ${i + 1} de ${selectedFiles.length}...`);

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
            console.warn(`Error al subir imagen ${file.name}:`, uploadError.message);
          } else {
            const { data: { publicUrl } } = supabase.storage
              .from('properties')
              .getPublicUrl(fileName);
            uploadedUrls.push(publicUrl);
          }
        }
      }

      setUploadProgress('Guardando aviso en la base de datos...');

      // 2. Guardar propiedad en Supabase vía Server Action
      const res = await createProperty({
        provinciaId: Number(formData.provinciaId),
        localidadId: Number(formData.localidadId),
        barrioId: formData.barrioId ? Number(formData.barrioId) : null,
        direccionCalle: formData.direccionCalle || undefined,
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
        tipoAnunciante: formData.tipoAnunciante,
        nombreContacto: formData.nombreContacto,
        whatsapp: formData.whatsapp,
        fotosUrls: uploadedUrls,
      });

      if (!res.success) {
        throw new Error(res.error || 'Ocurrió un error al guardar la propiedad');
      }

      setNewPropertyId(res.propertyId || null);
      setSuccess(true);
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || 'Error al procesar la publicación.');
    } finally {
      setLoading(false);
      setUploadProgress('');
    }
  };

  if (success) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center space-y-6">
        <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
          <CheckCircle className="w-10 h-10" />
        </div>
        <h2 className="text-3xl font-extrabold text-slate-900">
          ¡Aviso Publicado con Éxito!
        </h2>
        <p className="text-slate-600 text-sm">
          Tu propiedad ya se encuentra activa en el catálogo de AlquilaNEA y guardada en tu base de datos de Supabase.
        </p>
        <div className="pt-4 flex justify-center gap-3">
          {newPropertyId ? (
            <button
              onClick={() => router.push(`/propiedad/${newPropertyId}`)}
              className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold text-sm shadow-sm transition"
            >
              Ver mi aviso publicado
            </button>
          ) : (
            <button
              onClick={() => router.push('/propiedades')}
              className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold text-sm shadow-sm transition"
            >
              Ir al catálogo
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      {/* Banner Freemium Lanzamiento */}
      <div className="bg-orange-50 border border-orange-200 rounded-2xl p-4 flex items-center gap-3 text-orange-950">
        <Sparkles className="w-5 h-5 text-orange-600 shrink-0" />
        <div className="text-xs sm:text-sm">
          <span className="font-bold">Lanzamiento regional Corrientes & Chaco:</span> ¡Publicación 100% gratuita para propietarios e inmobiliarias!
        </div>
      </div>

      <div className="border-b border-slate-200 pb-4">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Publicar Inmueble en Alquila<span className="text-orange-600">NEA</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Completá los datos de tu aviso. Te llevará menos de 3 minutos.
        </p>
      </div>

      {errorMessage && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold">
          {errorMessage}
        </div>
      )}

      {/* Progress Steps */}
      <div className="flex items-center justify-between relative">
        <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-0.5 bg-slate-200 -z-0"></div>
        {[
          { num: 1, label: 'Ubicación' },
          { num: 2, label: 'Características y Precio' },
          { num: 3, label: 'Contacto y Fotos' },
        ].map((s) => (
          <div key={s.num} className="relative z-10 flex flex-col items-center bg-slate-50 px-2">
            <div
              className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs transition ${
                step >= s.num
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-slate-200 text-slate-500'
              }`}
            >
              {step > s.num ? <Check className="w-4 h-4" /> : s.num}
            </div>
            <span className="text-[11px] font-semibold mt-1 text-slate-600 hidden sm:block">
              {s.label}
            </span>
          </div>
        ))}
      </div>

      {/* Formulario */}
      <form onSubmit={handleSubmit} className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
        {/* PASO 1: UBICACIÓN */}
        {step === 1 && (
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Building className="w-5 h-5 text-emerald-600" />
              <span>1. Ubicación Geográfica</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Provincia *
                </label>
                <select
                  value={formData.provinciaId}
                  onChange={(e) => setFormData({ ...formData, provinciaId: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm font-medium"
                >
                  {provincias.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.nombre}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Localidad / Ciudad *
                </label>
                <select
                  value={formData.localidadId}
                  onChange={(e) => setFormData({ ...formData, localidadId: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm font-medium"
                >
                  {localidades.map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.nombre}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Barrio
                </label>
                <select
                  value={formData.barrioId}
                  onChange={(e) => setFormData({ ...formData, barrioId: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm font-medium"
                >
                  <option value="">Seleccionar barrio (Opcional)</option>
                  {barrios.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.nombre}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Calle y Altura aproximada (Opcional)
              </label>
              <input
                type="text"
                placeholder="Ej: Junín al 900"
                value={formData.direccionCalle}
                onChange={(e) => setFormData({ ...formData, direccionCalle: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm"
              />
            </div>

            <div className="flex justify-end pt-4">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-bold shadow-sm transition"
              >
                Continuar a Características →
              </button>
            </div>
          </div>
        )}

        {/* PASO 2: CARACTERÍSTICAS Y PRECIOS */}
        {step === 2 && (
          <div className="space-y-5">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-emerald-600" />
              <span>2. Características y Precios</span>
            </h3>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Título del Aviso *
              </label>
              <input
                type="text"
                required
                placeholder="Ej: Departamento 2 ambientes luminoso en Camba Cuá"
                value={formData.titulo}
                onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Tipo de Inmueble
                </label>
                <select
                  value={formData.tipoInmueble}
                  onChange={(e) => setFormData({ ...formData, tipoInmueble: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm capitalize"
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
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm"
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
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm"
                />
              </div>
            </div>

            {/* PRECIO Y EXPENSAS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-200">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Precio Alquiler Mensual (ARS) *
                </label>
                <input
                  type="number"
                  required
                  placeholder="350000"
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
                      className="rounded text-emerald-600"
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

            {/* AMENITIES */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Amenities y Comodidades
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs font-medium text-slate-700">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.cochera}
                    onChange={(e) => setFormData({ ...formData, cochera: e.target.checked })}
                    className="rounded text-emerald-600"
                  />
                  <span>Cochera / Garage</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.terrazaBalcon}
                    onChange={(e) => setFormData({ ...formData, terrazaBalcon: e.target.checked })}
                    className="rounded text-emerald-600"
                  />
                  <span>Balcón / Terraza</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.patio}
                    onChange={(e) => setFormData({ ...formData, patio: e.target.checked })}
                    className="rounded text-emerald-600"
                  />
                  <span>Patio / Jardín</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.aceptaMascotas}
                    onChange={(e) => setFormData({ ...formData, aceptaMascotas: e.target.checked })}
                    className="rounded text-emerald-600"
                  />
                  <span>Acepta Mascotas</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.aireAcondicionado}
                    onChange={(e) => setFormData({ ...formData, aireAcondicionado: e.target.checked })}
                    className="rounded text-emerald-600"
                  />
                  <span>Aire Acondicionado</span>
                </label>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Descripción Completa *
              </label>
              <textarea
                rows={4}
                required
                placeholder="Describí los detalles del inmueble, requisitos de ingreso, condiciones del contrato..."
                value={formData.descripcion}
                onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm"
              ></textarea>
            </div>

            <div className="flex justify-between pt-4">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="px-5 py-2.5 border border-slate-200 rounded-xl text-sm font-semibold text-slate-600"
              >
                ← Volver
              </button>
              <button
                type="button"
                onClick={() => setStep(3)}
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-bold shadow-sm transition"
              >
                Continuar a Contacto y Fotos →
              </button>
            </div>
          </div>
        )}

        {/* PASO 3: CONTACTO Y FOTOS */}
        {step === 3 && (
          <div className="space-y-6">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-emerald-600" />
              <span>3. Datos de Contacto y Fotos Reales</span>
            </h3>

            {/* Selector Tipo Anunciante */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                ¿Cómo publicás este aviso? *
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, tipoAnunciante: 'dueno_directo' })}
                  className={`p-3 rounded-2xl border text-left transition ${
                    formData.tipoAnunciante === 'dueno_directo'
                      ? 'border-emerald-600 bg-emerald-50 text-emerald-950 font-bold'
                      : 'border-slate-200 bg-slate-50 text-slate-700'
                  }`}
                >
                  <div className="text-sm">Dueño Directo</div>
                  <div className="text-xs text-slate-500 font-normal">Sin comisión para el inquilino</div>
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, tipoAnunciante: 'inmobiliaria' })}
                  className={`p-3 rounded-2xl border text-left transition ${
                    formData.tipoAnunciante === 'inmobiliaria'
                      ? 'border-slate-900 bg-slate-900 text-white font-bold'
                      : 'border-slate-200 bg-slate-50 text-slate-700'
                  }`}
                >
                  <div className="text-sm">Inmobiliaria</div>
                  <div className="text-xs text-slate-400 font-normal">Empresa o corredor inmobiliario</div>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Nombre Completo o Razón Social *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Carlos Romero"
                  value={formData.nombreContacto}
                  onChange={(e) => setFormData({ ...formData, nombreContacto: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  WhatsApp de Contacto (con código de área) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej: 3794123456"
                  value={formData.whatsapp}
                  onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm"
                />
              </div>
            </div>

            {/* ZONA DE SUBIDA REAL DE FOTOS */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Fotografías del Inmueble (Supabase Storage)
              </label>

              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />

              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-300 hover:border-emerald-500 rounded-2xl p-6 text-center cursor-pointer transition bg-slate-50/50"
              >
                <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                <p className="text-sm font-bold text-slate-800">
                  Hacé clic para seleccionar o arrastrá fotos del inmueble
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  Formatos JPG, PNG o WebP. Se suben directamente a tu bucket de Supabase.
                </p>
              </div>

              {/* Previsualización de imágenes seleccionadas */}
              {previewUrls.length > 0 && (
                <div className="mt-4 grid grid-cols-3 sm:grid-cols-4 gap-3">
                  {previewUrls.map((url, idx) => (
                    <div
                      key={idx}
                      className="relative aspect-[4/3] rounded-xl overflow-hidden border border-slate-200 shadow-sm bg-slate-100 group"
                    >
                      <Image
                        src={url}
                        alt={`Preview ${idx + 1}`}
                        fill
                        className="object-cover"
                      />
                      {idx === 0 && (
                        <span className="absolute bottom-1.5 left-1.5 bg-black/70 text-white text-[10px] font-semibold px-2 py-0.5 rounded">
                          Portada
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          removePhoto(idx);
                        }}
                        className="absolute top-1.5 right-1.5 bg-red-600 hover:bg-red-700 text-white rounded-full p-1 opacity-90 transition"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-between items-center pt-4">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="px-5 py-2.5 border border-slate-200 rounded-xl text-sm font-semibold text-slate-600"
              >
                ← Volver
              </button>

              <div className="flex items-center gap-3">
                {uploadProgress && (
                  <span className="text-xs text-emerald-700 font-semibold flex items-center gap-1.5">
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    {uploadProgress}
                  </span>
                )}
                <button
                  type="submit"
                  disabled={loading}
                  className="px-8 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-bold shadow-md transition disabled:opacity-50 flex items-center gap-2"
                >
                  {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>{loading ? 'Publicando en Supabase...' : 'Confirmar y Publicar Aviso'}</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}

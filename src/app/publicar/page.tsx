'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
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
  UserCheck,
  Building2,
  Lock,
} from 'lucide-react';
import { Provincia, Localidad, Barrio, Profile } from '@/types/database';
import { getProvincias, getLocalidades, getBarrios } from '@/actions/locations';
import { createProperty } from '@/actions/properties';
import { getCurrentUser } from '@/actions/auth';
import { createClient } from '@/lib/supabase/client';

export default function PublicarPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Estado de Autenticación
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [currentProfile, setCurrentProfile] = useState<Profile | null>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);

  // Paso actual (1: Ubicación, 2: Características y Precios, 3: Fotos y Confirmación)
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

  // Form State (Solo datos del inmueble, los datos del anunciante provienen del perfil autenticado)
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
  });

  // 1. Verificar sesión del usuario
  useEffect(() => {
    async function checkAuth() {
      try {
        const { user, profile } = await getCurrentUser();
        setCurrentUser(user);
        setCurrentProfile(profile);
      } catch (err) {
        console.error(err);
      } finally {
        setCheckingAuth(false);
      }
    }
    checkAuth();
  }, []);

  // 2. Cargar Provincias
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

  // 3. Cargar Localidades al cambiar Provincia
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

  // 4. Cargar Barrios al cambiar Localidad
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

      setUploadProgress('Guardando aviso en Supabase...');

      // 2. Guardar propiedad en Supabase asociada al usuario autenticado
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

  // Estado de carga inicial de sesión
  if (checkingAuth) {
    return (
      <div className="max-w-md mx-auto py-24 text-center space-y-4">
        <Loader2 className="w-8 h-8 text-orange-600 animate-spin mx-auto" />
        <p className="text-sm font-semibold text-slate-500">Verificando cuenta de anunciante...</p>
      </div>
    );
  }

  // Si NO está autenticado, solicitar registro / login una sola vez
  if (!currentUser) {
    return (
      <div className="max-w-lg mx-auto px-4 py-16 text-center space-y-6">
        <div className="w-16 h-16 bg-orange-100 text-orange-600 rounded-3xl flex items-center justify-center mx-auto shadow-sm">
          <Lock className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Ingresá como Anunciante
          </h2>
          <p className="text-sm text-slate-600 max-w-md mx-auto">
            Para publicar en <span className="font-bold text-slate-900">Alquila<span className="text-orange-600">NEA</span></span> necesitás registrarte gratis. Cargás tus datos de contacto una sola vez y no tendrás que volver a escribirlos en cada aviso.
          </p>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row justify-center gap-3">
          <Link
            href="/login?redirectTo=/publicar"
            className="w-full sm:w-auto px-6 py-3.5 bg-orange-600 hover:bg-orange-700 text-white rounded-xl font-bold text-sm shadow-md transition"
          >
            Registrarme Gratis o Iniciar Sesión
          </Link>
          <Link
            href="/propiedades"
            className="w-full sm:w-auto px-6 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold text-sm transition"
          >
            Explorar Alquileres
          </Link>
        </div>
      </div>
    );
  }

  // Pantalla de éxito tras publicar
  if (success) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center space-y-6">
        <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto">
          <CheckCircle className="w-10 h-10" />
        </div>
        <h2 className="text-3xl font-extrabold text-slate-900">
          ¡Aviso Publicado con Éxito!
        </h2>
        <p className="text-slate-600 text-sm">
          Tu propiedad ya se encuentra activa en el catálogo de AlquilaNEA y vinculada a tu cuenta de anunciante ({currentProfile?.nombre_completo}).
        </p>
        <div className="pt-4 flex justify-center gap-3">
          {newPropertyId ? (
            <button
              onClick={() => router.push(`/propiedad/${newPropertyId}`)}
              className="px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-xl font-semibold text-sm shadow-sm transition"
            >
              Ver mi aviso publicado
            </button>
          ) : (
            <button
              onClick={() => router.push('/propiedades')}
              className="px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-xl font-semibold text-sm shadow-sm transition"
            >
              Ir al catálogo
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 space-y-6">
      {/* Banner de Perfil Autenticado Activo */}
      <div className="bg-gradient-to-r from-blue-900 to-slate-900 rounded-2xl p-4 text-white shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-white shrink-0">
            {currentProfile?.tipo_anunciante === 'inmobiliaria' ? (
              <Building2 className="w-5 h-5 text-blue-300" />
            ) : (
              <UserCheck className="w-5 h-5 text-orange-400" />
            )}
          </div>
          <div>
            <div className="text-xs text-slate-300">Publicando como:</div>
            <div className="text-sm font-bold text-white flex items-center gap-2">
              <span>{currentProfile?.nombre_inmobiliaria || currentProfile?.nombre_completo}</span>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-white/20 capitalize">
                {currentProfile?.tipo_anunciante === 'inmobiliaria' ? 'Inmobiliaria' : 'Dueño Directo'}
              </span>
            </div>
          </div>
        </div>
        <div className="text-xs text-slate-300 bg-white/5 px-3 py-1.5 rounded-lg border border-white/10">
          WhatsApp: <span className="font-bold text-white">{currentProfile?.whatsapp}</span>
        </div>
      </div>

      <div className="border-b border-slate-200 pb-4">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Publicar Inmueble en Alquila<span className="text-orange-600">NEA</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Completá los datos del inmueble y subí las fotografías. Tus datos de contacto se adjuntan automáticamente.
        </p>
      </div>

      {errorMessage && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold">
          {errorMessage}
        </div>
      )}

      {/* Progress Steps (3 Pasos Ágiles) */}
      <div className="flex items-center justify-between relative">
        <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-0.5 bg-slate-200 -z-0"></div>
        {[
          { num: 1, label: 'Ubicación' },
          { num: 2, label: 'Características y Precios' },
          { num: 3, label: 'Fotos y Confirmación' },
        ].map((s) => (
          <div key={s.num} className="relative z-10 flex flex-col items-center bg-slate-50 px-2">
            <div
              className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs transition ${
                step >= s.num
                  ? 'bg-orange-600 text-white shadow-sm'
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
              <Building className="w-5 h-5 text-orange-600" />
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
                  Barrio (Opcional)
                </label>
                <select
                  value={formData.barrioId}
                  onChange={(e) => setFormData({ ...formData, barrioId: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm font-medium"
                >
                  <option value="">Seleccionar barrio</option>
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
                placeholder="Ej: Junín al 900 o Av. Sarmiento 1200"
                value={formData.direccionCalle}
                onChange={(e) => setFormData({ ...formData, direccionCalle: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm"
              />
            </div>

            <div className="flex justify-end pt-4">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="px-6 py-2.5 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-sm font-bold shadow-sm transition"
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
              <DollarSign className="w-5 h-5 text-orange-600" />
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
                className="px-6 py-2.5 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-sm font-bold shadow-sm transition"
              >
                Continuar a Fotos y Confirmación →
              </button>
            </div>
          </div>
        )}

        {/* PASO 3: FOTOS Y CONFIRMACIÓN */}
        {step === 3 && (
          <div className="space-y-6">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-orange-600" />
              <span>3. Fotografías del Inmueble</span>
            </h3>

            {/* ZONA DE SUBIDA REAL DE FOTOS */}
            <div>
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
                className="border-2 border-dashed border-slate-300 hover:border-orange-500 rounded-2xl p-8 text-center cursor-pointer transition bg-slate-50/50"
              >
                <Upload className="w-10 h-10 text-slate-400 mx-auto mb-2" />
                <p className="text-sm font-bold text-slate-800">
                  Hacé clic para seleccionar o arrastrá fotos del inmueble
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  Formatos JPG, PNG o WebP. Se suben directamente a Supabase Storage.
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

            <div className="flex justify-between items-center pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="px-5 py-2.5 border border-slate-200 rounded-xl text-sm font-semibold text-slate-600"
              >
                ← Volver
              </button>

              <div className="flex items-center gap-3">
                {uploadProgress && (
                  <span className="text-xs text-orange-700 font-semibold flex items-center gap-1.5">
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    {uploadProgress}
                  </span>
                )}
                <button
                  type="submit"
                  disabled={loading}
                  className="px-8 py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-sm font-bold shadow-md transition disabled:opacity-50 flex items-center gap-2 cursor-pointer"
                >
                  {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>{loading ? 'Publicando...' : 'Confirmar y Publicar Aviso'}</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}

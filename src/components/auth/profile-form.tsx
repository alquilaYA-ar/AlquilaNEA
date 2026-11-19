'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  User,
  Mail,
  Phone,
  Building2,
  Shield,
  UserCheck,
  Save,
  Loader2,
  CheckCircle2,
  KeyRound,
  Calendar,
} from 'lucide-react';
import { Profile } from '@/types/database';
import { updateMyProfile } from '@/actions/auth';

interface ProfileFormProps {
  profile: Profile;
  email: string;
}

export function ProfileForm({ profile, email }: ProfileFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const isInmo = profile.tipo_anunciante === 'inmobiliaria';
  const isAdmin = profile.es_admin === true || (profile.tipo_anunciante as string) === 'admin';

  const [nombreCompleto, setNombreCompleto] = useState(profile.nombre_completo || '');
  const [whatsapp, setWhatsapp] = useState(profile.whatsapp || '');
  const [telefono, setTelefono] = useState(profile.telefono || '');
  const [nombreInmobiliaria, setNombreInmobiliaria] = useState(profile.nombre_inmobiliaria || '');
  const [matriculaInmobiliaria, setMatriculaInmobiliaria] = useState(
    profile.matricula_inmobiliaria || ''
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSaved(false);

    startTransition(async () => {
      const res = await updateMyProfile({
        nombreCompleto,
        whatsapp,
        telefono,
        nombreInmobiliaria: isInmo ? nombreInmobiliaria : undefined,
        matriculaInmobiliaria: isInmo ? matriculaInmobiliaria : undefined,
      });

      if (!res.success) {
        setError(res.error || 'No se pudieron guardar los datos.');
        return;
      }

      setSaved(true);
      router.refresh();
    });
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10 space-y-6">
      {/* Cabecera */}
      <div className="bg-gradient-to-r from-slate-900 to-blue-950 text-white rounded-3xl p-6 sm:p-8 shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-orange-600 flex items-center justify-center shrink-0 shadow-md">
            {isAdmin ? (
              <Shield className="w-7 h-7" />
            ) : isInmo ? (
              <Building2 className="w-7 h-7" />
            ) : (
              <UserCheck className="w-7 h-7" />
            )}
          </div>
          <div className="space-y-1">
            <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-white/15 text-orange-300">
              {isAdmin ? 'Administrador' : isInmo ? 'Inmobiliaria' : 'Dueño Directo'}
            </span>
            <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight">
              Mis Datos de Cuenta
            </h1>
            <p className="text-xs text-slate-300 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-slate-400" />
              {email}
            </p>
          </div>
        </div>

        <div className="text-[11px] text-slate-300 flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5 text-slate-400" />
          <span>
            Desde {new Date(profile.created_at).toLocaleDateString('es-AR')}
          </span>
        </div>
      </div>

      {/* Formulario de datos */}
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-5"
      >
        <div className="space-y-1 pb-3 border-b border-slate-100">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <User className="w-4 h-4 text-orange-600" />
            Información Personal y de Contacto
          </h2>
          <p className="text-xs text-slate-500">
            Estos datos aparecen en tus publicaciones para que los interesados puedan escribirte.
          </p>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs font-semibold rounded-xl">
            {error}
          </div>
        )}

        {saved && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-xl flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>Tus datos se actualizaron correctamente.</span>
          </div>
        )}

        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
            Correo Electrónico (no editable)
          </label>
          <input
            type="email"
            value={email}
            disabled
            className="w-full bg-slate-100 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-500 cursor-not-allowed"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
            {isInmo ? 'Nombre del Corredor / Contacto *' : 'Nombre y Apellido *'}
          </label>
          <input
            type="text"
            required
            minLength={2}
            maxLength={100}
            autoComplete="name"
            value={nombreCompleto}
            onChange={(e) => setNombreCompleto(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              WhatsApp de Contacto *
            </label>
            <div className="relative">
              <input
                type="tel"
                inputMode="tel"
                required
                minLength={8}
                maxLength={30}
                autoComplete="tel"
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm pr-9"
              />
              <Phone className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Teléfono Alternativo (Opcional)
            </label>
            <input
              type="tel"
              inputMode="tel"
              maxLength={30}
              value={telefono}
              onChange={(e) => setTelefono(e.target.value)}
              placeholder="Ej: 3794112233"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm"
            />
          </div>
        </div>

        {isInmo && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-blue-50/60 border border-blue-100">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Nombre de la Inmobiliaria *
              </label>
              <input
                type="text"
                required
                maxLength={150}
                value={nombreInmobiliaria}
                onChange={(e) => setNombreInmobiliaria(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Matrícula Profesional
              </label>
              <input
                type="text"
                maxLength={50}
                value={matriculaInmobiliaria}
                onChange={(e) => setMatriculaInmobiliaria(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-sm"
              />
            </div>
          </div>
        )}

        <div className="pt-2 flex flex-wrap items-center justify-between gap-3">
          <Link
            href="/nueva-clave"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-orange-600 transition"
          >
            <KeyRound className="w-4 h-4" />
            <span>Cambiar mi contraseña</span>
          </Link>

          <button
            type="submit"
            disabled={isPending}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-sm shadow-sm transition cursor-pointer disabled:opacity-50"
          >
            {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>{isPending ? 'Guardando...' : 'Guardar Cambios'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}

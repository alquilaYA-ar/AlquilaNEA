'use client';

import { useState, useEffect, useTransition, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Building2, Mail, Lock, UserCheck, Phone, CheckCircle2, Loader2, Sparkles } from 'lucide-react';
import { signIn, signUp, getCurrentUser } from '@/actions/auth';

function LoginFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const rawRedirect = searchParams.get('redirectTo');
  // Solo se aceptan rutas internas; /admin jamás se usa como destino para no-admins
  const explicitRedirect =
    rawRedirect && rawRedirect.startsWith('/') && !rawRedirect.startsWith('//') && !rawRedirect.startsWith('/admin')
      ? rawRedirect
      : null;
  const isVerifiedParam = searchParams.get('verified') === 'true';
  const modeParam = searchParams.get('mode');

  // Si ya tiene sesión activa, redirigir según su rol
  useEffect(() => {
    async function checkExistingUser() {
      const { user, profile } = await getCurrentUser();
      if (user) {
        const isAdmin =
          profile?.es_admin === true ||
          (profile?.tipo_anunciante as string) === 'admin' ||
          user.email?.toLowerCase() === 'gonza18av@gmail.com';

        if (isAdmin) {
          router.replace('/admin');
        } else if (explicitRedirect) {
          router.replace(explicitRedirect);
        } else {
          router.replace('/mis-publicaciones');
        }
      }
    }
    checkExistingUser();
  }, [router, explicitRedirect]);

  // Por defecto abre en Modo Iniciar Sesión (Login)
  const [isRegister, setIsRegister] = useState(modeParam === 'register');
  const [isPending, startTransition] = useTransition();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [emailSent, setEmailSent] = useState<string | null>(null);

  // Form State
  const [tipoAnunciante, setTipoAnunciante] = useState<'dueno_directo' | 'inmobiliaria'>('dueno_directo');
  const [nombreCompleto, setNombreCompleto] = useState('');
  const [nombreInmobiliaria, setNombreInmobiliaria] = useState('');
  const [matriculaInmobiliaria, setMatriculaInmobiliaria] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    startTransition(async () => {
      if (isRegister) {
        if (!whatsapp.trim()) {
          setErrorMessage('El WhatsApp de contacto es obligatorio para que los inquilinos puedan comunicarse.');
          return;
        }

        const res = await signUp({
          email,
          password,
          nombreCompleto,
          whatsapp,
          tipoAnunciante,
          nombreInmobiliaria: tipoAnunciante === 'inmobiliaria' ? nombreInmobiliaria : undefined,
          matriculaInmobiliaria: tipoAnunciante === 'inmobiliaria' ? matriculaInmobiliaria : undefined,
        });

        if (!res.success) {
          setErrorMessage(res.error || 'Ocurrió un error al registrarse.');
          return;
        }

        if (res.requiresVerification) {
          setEmailSent(email);
          return;
        }

        if (explicitRedirect) {
          router.push(explicitRedirect);
        } else {
          router.push('/mis-publicaciones');
        }
        router.refresh();
      } else {
        const res = await signIn(email, password);

        if (!res.success) {
          setErrorMessage('Correo o contraseña incorrectos.');
          return;
        }

        // Si es Admin, SIEMPRE redirigir al panel de administración
        if (res.isAdmin) {
          router.push('/admin');
        } else if (explicitRedirect) {
          router.push(explicitRedirect);
        } else {
          router.push('/mis-publicaciones');
        }
        router.refresh();
      }
    });
  };

  if (emailSent) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center space-y-6">
        <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-3xl flex items-center justify-center mx-auto shadow-sm">
          <Mail className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            ¡Revisá tu correo electrónico!
          </h2>
          <p className="text-sm text-slate-600">
            Enviamos un enlace de verificación a <span className="font-bold text-slate-900">{emailSent}</span>.
          </p>
          <p className="text-xs text-slate-500 pt-1">
            Hacé clic en el botón de confirmación en tu correo para activar tu cuenta y comenzar a publicar en AlquilaNEA.
          </p>
        </div>

        <div className="pt-4">
          <button
            onClick={() => {
              setEmailSent(null);
              setIsRegister(false);
            }}
            className="text-xs font-semibold text-orange-600 hover:text-orange-700 transition cursor-pointer"
          >
            ← Volver a Iniciar Sesión
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-12 space-y-6">
      {/* Brand Header */}
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-700 to-orange-500 flex items-center justify-center text-white mx-auto shadow-md">
          <Building2 className="w-6 h-6 text-white" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          {isRegister ? 'Registro de Anunciante' : 'Iniciar Sesión'}
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 max-w-sm mx-auto">
          {isRegister
            ? 'Cargá tus datos de contacto una sola vez y publicá todas tus propiedades sin repetir información.'
            : 'Ingresá para gestionar tus publicaciones en AlquilaNEA.'}
        </p>
      </div>

      {/* Card Formulario */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-5">
        {isVerifiedParam && (
          <div className="p-3.5 rounded-xl bg-green-50 border border-green-200 text-green-800 text-xs font-bold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />
            <span>¡Tu correo ha sido confirmado exitosamente! Ingresá tu contraseña para continuar.</span>
          </div>
        )}

        {errorMessage && (
          <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegister && (
            <>
              {/* 1. Selector Tipo de Anunciante */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  ¿Qué tipo de anunciante sos? *
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setTipoAnunciante('dueno_directo')}
                    className={`p-3 rounded-2xl border text-left transition ${
                      tipoAnunciante === 'dueno_directo'
                        ? 'border-orange-600 bg-orange-50 text-orange-950 font-bold shadow-sm'
                        : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 text-xs font-bold mb-0.5">
                      <UserCheck className="w-4 h-4 text-orange-600" />
                      <span>Dueño Directo</span>
                    </div>
                    <div className="text-[11px] text-slate-500 font-normal">Sin comisión inmobiliaria</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setTipoAnunciante('inmobiliaria')}
                    className={`p-3 rounded-2xl border text-left transition ${
                      tipoAnunciante === 'inmobiliaria'
                        ? 'border-blue-900 bg-blue-900 text-white font-bold shadow-sm'
                        : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 text-xs font-bold mb-0.5">
                      <Building2 className="w-4 h-4 text-blue-300" />
                      <span>Inmobiliaria</span>
                    </div>
                    <div className="text-[11px] text-slate-400 font-normal">Empresa o matriculado</div>
                  </button>
                </div>
              </div>

              {/* Si es Inmobiliaria: Nombre de Fantasía y Matrícula */}
              {tipoAnunciante === 'inmobiliaria' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 bg-blue-50/60 rounded-2xl border border-blue-100">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Nombre de la Inmobiliaria *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ej: Gómez & Asoc."
                      value={nombreInmobiliaria}
                      onChange={(e) => setNombreInmobiliaria(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Matrícula Profesional
                    </label>
                    <input
                      type="text"
                      placeholder="Ej: CPI-4821"
                      value={matriculaInmobiliaria}
                      onChange={(e) => setMatriculaInmobiliaria(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-medium"
                    />
                  </div>
                </div>
              )}

              {/* Nombre de la persona o contacto */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  {tipoAnunciante === 'inmobiliaria' ? 'Nombre del Corredor / Contacto *' : 'Nombre y Apellido Completo *'}
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Carlos Romero"
                  value={nombreCompleto}
                  onChange={(e) => setNombreCompleto(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm"
                />
              </div>

              {/* WhatsApp de Contacto */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  WhatsApp para recibir consultas *
                </label>
                <div className="relative">
                  <input
                    type="tel"
                    required
                    placeholder="Ej: 3794123456 o 3624889900"
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm pr-9 font-medium"
                  />
                  <Phone className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  A este número te escribirán directamente los inquilinos interesados desde la web.
                </p>
              </div>
            </>
          )}

          {/* Email */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Correo Electrónico *
            </label>
            <div className="relative">
              <input
                type="email"
                required
                placeholder="tu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm pr-9"
              />
              <Mail className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          {/* Contraseña */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Contraseña *
            </label>
            <div className="relative">
              <input
                type="password"
                required
                minLength={6}
                placeholder="Mínimo 6 caracteres"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm pr-9"
              />
              <Lock className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          {/* Botón Submit */}
          <button
            type="submit"
            disabled={isPending}
            className="w-full py-3.5 bg-orange-600 hover:bg-orange-700 text-white font-bold text-sm rounded-xl shadow-md transition disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer mt-2"
          >
            {isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>{isRegister ? 'Registrando cuenta...' : 'Iniciando sesión...'}</span>
              </>
            ) : (
              <span>{isRegister ? 'Registrarme y Publicar' : 'Ingresar'}</span>
            )}
          </button>
        </form>

        {/* Toggle Login / Register */}
        <div className="text-center pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={() => {
              setIsRegister(!isRegister);
              setErrorMessage(null);
            }}
            className="text-xs text-slate-600 hover:text-orange-600 font-semibold transition cursor-pointer"
          >
            {isRegister
              ? '¿Ya tenés una cuenta registrada? Iniciar Sesión'
              : '¿No tenés cuenta? Registrate gratis como anunciante'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="max-w-md mx-auto py-24 text-center space-y-4">
        <Loader2 className="w-8 h-8 text-orange-600 animate-spin mx-auto" />
        <p className="text-sm font-semibold text-slate-500">Cargando...</p>
      </div>
    }>
      <LoginFormContent />
    </Suspense>
  );
}

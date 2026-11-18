'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { Mail, Loader2, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { requestPasswordReset } from '@/actions/auth';

export default function RecuperarPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const res = await requestPasswordReset(email);
      if (!res.success) {
        setError(res.error || 'No se pudo procesar la solicitud.');
        return;
      }
      setSent(true);
    });
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16 space-y-6">
      <Link href="/login" className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900">
        <ArrowLeft className="w-4 h-4" /> Volver a Iniciar Sesión
      </Link>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-xl p-6 sm:p-8 space-y-5">
        {sent ? (
          <div className="text-center space-y-3">
            <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <h1 className="text-xl font-extrabold text-slate-900">Revisá tu correo</h1>
            <p className="text-sm text-slate-600">
              Si <span className="font-bold">{email}</span> está registrado, te enviamos un enlace para crear una nueva contraseña.
              Revisá también la carpeta de spam.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <h1 className="text-xl font-extrabold text-slate-900">Recuperar contraseña</h1>
              <p className="text-xs text-slate-500">Ingresá tu correo y te enviaremos un enlace para restablecerla.</p>
            </div>
            <div className="relative">
              <input
                type="email"
                required
                maxLength={150}
                autoComplete="email"
                placeholder="tu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm pr-9"
              />
              <Mail className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
            </div>
            {error && <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs font-semibold rounded-xl">{error}</div>}
            <button
              type="submit"
              disabled={isPending}
              className="w-full py-3 bg-orange-600 hover:bg-orange-700 text-white font-bold text-sm rounded-xl shadow-md transition disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
            >
              {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              <span>{isPending ? 'Enviando...' : 'Enviarme el enlace'}</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Home, Mail, Lock, UserCheck, Building2 } from 'lucide-react';

export default function LoginPage() {
  const [isRegister, setIsRegister] = useState(false);
  const [tipoAnunciante, setTipoAnunciante] = useState<'dueno_directo' | 'inmobiliaria'>('dueno_directo');

  return (
    <div className="max-w-md mx-auto px-4 py-16 space-y-6">
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-2xl bg-emerald-600 flex items-center justify-center text-white mx-auto shadow-sm">
          <Home className="w-6 h-6" />
        </div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          {isRegister ? 'Crear cuenta en AlquilaYa' : 'Iniciar Sesión'}
        </h1>
        <p className="text-xs text-slate-500">
          Gestioná tus propiedades publicadas en Corrientes y Chaco
        </p>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-4">
        {isRegister && (
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Tipo de Anunciante
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setTipoAnunciante('dueno_directo')}
                className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition ${
                  tipoAnunciante === 'dueno_directo'
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-800'
                    : 'border-slate-200 text-slate-600'
                }`}
              >
                <UserCheck className="w-3.5 h-3.5" />
                Dueño Directo
              </button>
              <button
                type="button"
                onClick={() => setTipoAnunciante('inmobiliaria')}
                className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition ${
                  tipoAnunciante === 'inmobiliaria'
                    ? 'border-slate-900 bg-slate-900 text-white'
                    : 'border-slate-200 text-slate-600'
                }`}
              >
                <Building2 className="w-3.5 h-3.5" />
                Inmobiliaria
              </button>
            </div>
          </div>
        )}

        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
            Correo Electrónico
          </label>
          <div className="relative">
            <input
              type="email"
              placeholder="tu@email.com"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm"
            />
            <Mail className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
            Contraseña
          </label>
          <div className="relative">
            <input
              type="password"
              placeholder="••••••••"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm"
            />
            <Lock className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
          </div>
        </div>

        {isRegister && (
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              WhatsApp de Contacto
            </label>
            <input
              type="text"
              placeholder="3794..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm"
            />
          </div>
        )}

        <button
          type="button"
          className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl shadow-sm transition"
        >
          {isRegister ? 'Registrarse como Anunciante' : 'Ingresar'}
        </button>

        <div className="text-center pt-2">
          <button
            type="button"
            onClick={() => setIsRegister(!isRegister)}
            className="text-xs text-slate-600 hover:text-emerald-600 font-medium transition"
          >
            {isRegister
              ? '¿Ya tenés cuenta? Iniciar Sesión'
              : '¿No tenés cuenta? Registrate gratis aquí'}
          </button>
        </div>
      </div>
    </div>
  );
}


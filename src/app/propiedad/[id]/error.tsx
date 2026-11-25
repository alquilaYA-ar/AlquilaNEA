'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function PropertyErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error('Error en ficha de propiedad:', error);
  }, [error]);

  return (
    <div className="max-w-2xl mx-auto px-4 py-24 text-center space-y-6">
      <div className="w-16 h-16 bg-red-100 text-red-600 rounded-3xl flex items-center justify-center mx-auto shadow-sm">
        <span className="text-2xl font-bold">!</span>
      </div>
      <div className="space-y-2">
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">No se pudo cargar la propiedad</h1>
        <p className="text-sm text-slate-600">
          Ocurrió un error inesperado al mostrar el aviso. El equipo técnico fue notificado.
        </p>
        {process.env.NODE_ENV === 'development' && (
          <pre className="text-left text-xs bg-slate-100 p-4 rounded-xl overflow-auto text-slate-700">
            {error.message}
            {'\n'}
            {error.stack}
          </pre>
        )}
      </div>
      <div className="flex items-center justify-center gap-3">
        <button
          onClick={reset}
          className="px-6 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition shadow-sm"
        >
          Intentar de nuevo
        </button>
        <Link
          href="/propiedades"
          className="px-6 py-3 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold transition"
        >
          Volver al buscador
        </Link>
      </div>
    </div>
  );
}

'use client';

export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="max-w-md mx-auto px-4 py-24 text-center space-y-4">
      <h1 className="text-xl font-extrabold text-slate-900">Algo salió mal</h1>
      <p className="text-sm text-slate-600">Ocurrió un error inesperado. Intentá nuevamente en unos segundos.</p>
      <button
        onClick={() => reset()}
        className="px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold rounded-xl cursor-pointer"
      >
        Reintentar
      </button>
    </div>
  );
}

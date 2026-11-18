import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="max-w-md mx-auto px-4 py-24 text-center space-y-4">
      <div className="text-6xl font-black text-orange-600">404</div>
      <h1 className="text-xl font-extrabold text-slate-900">Página no encontrada</h1>
      <p className="text-sm text-slate-600">El enlace que seguiste no existe o la publicación ya no está disponible.</p>
      <Link href="/propiedades" className="inline-block px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl">
        Explorar Alquileres
      </Link>
    </div>
  );
}

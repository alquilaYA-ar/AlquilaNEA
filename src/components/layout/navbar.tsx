import Link from 'next/link';
import { Building2, PlusCircle, User } from 'lucide-react';

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-700 to-orange-500 flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform">
            <Building2 className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="text-xl font-extrabold tracking-tight text-slate-900 leading-none">
              Alquila<span className="text-orange-600">NEA</span>
            </div>
            <span className="block text-[10px] uppercase font-bold tracking-wider text-slate-500 mt-0.5">
              Corrientes & Chaco
            </span>
          </div>
        </Link>

        {/* Navigation & CTAs */}
        <div className="flex items-center gap-3">
          <Link
            href="/propiedades"
            className="text-sm font-semibold text-slate-600 hover:text-blue-600 transition px-3 py-2 hidden sm:block"
          >
            Explorar Alquileres
          </Link>
          <Link
            href="/login"
            className="text-sm font-semibold text-slate-700 hover:text-slate-900 transition px-3 py-2 flex items-center gap-1.5"
          >
            <User className="w-4 h-4 text-slate-500" />
            <span>Ingresar</span>
          </Link>
          <Link
            href="/publicar"
            className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-bold text-white bg-orange-600 hover:bg-orange-700 rounded-xl shadow-sm hover:shadow transition"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Publicar Gratis</span>
          </Link>
        </div>
      </div>
    </header>
  );
}

import Link from 'next/link';
import { Building2 } from 'lucide-react';
import { UserNav } from '@/components/layout/user-nav';

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
            href="/contacto"
            className="text-sm font-semibold text-slate-600 hover:text-orange-600 transition px-3 py-2 hidden md:block"
          >
            Contacto
          </Link>
          
          <UserNav />
        </div>
      </div>
    </header>
  );
}

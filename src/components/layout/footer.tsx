import Link from 'next/link';

export function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-slate-50 text-slate-600 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand info */}
          <div className="space-y-3 md:col-span-1">
            <span className="text-xl font-bold tracking-tight text-slate-900">
              Alquila<span className="text-emerald-600">Ya</span>
            </span>
            <p className="text-sm text-slate-500">
              El portal de clasificados de alquileres inmobiliarios directo del NEA argentino. Conectando inquilinos con dueños directos e inmobiliarias.
            </p>
          </div>

          {/* Corrientes */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-900 mb-3">
              Alquileres en Corrientes
            </h4>
            <ul className="space-y-2 text-sm text-slate-600">
              <li>
                <Link href="/propiedades?provinciaId=1&localidadId=1" className="hover:text-emerald-600 transition">
                  Corrientes Capital
                </Link>
              </li>
              <li>
                <Link href="/propiedades?provinciaId=1&localidadId=2" className="hover:text-emerald-600 transition">
                  Paso de la Patria
                </Link>
              </li>
              <li>
                <Link href="/propiedades?provinciaId=1&localidadId=3" className="hover:text-emerald-600 transition">
                  Goya
                </Link>
              </li>
            </ul>
          </div>

          {/* Chaco */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-900 mb-3">
              Alquileres en Chaco
            </h4>
            <ul className="space-y-2 text-sm text-slate-600">
              <li>
                <Link href="/propiedades?provinciaId=2&localidadId=4" className="hover:text-emerald-600 transition">
                  Resistencia
                </Link>
              </li>
              <li>
                <Link href="/propiedades?provinciaId=2&localidadId=5" className="hover:text-emerald-600 transition">
                  Barranqueras
                </Link>
              </li>
              <li>
                <Link href="/propiedades?provinciaId=2&localidadId=6" className="hover:text-emerald-600 transition">
                  Fontana
                </Link>
              </li>
              <li>
                <Link href="/propiedades?provinciaId=2&localidadId=7" className="hover:text-emerald-600 transition">
                  Sáenz Peña
                </Link>
              </li>
            </ul>
          </div>

          {/* Anunciantes */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-900 mb-3">
              Para Propietarios
            </h4>
            <ul className="space-y-2 text-sm text-slate-600">
              <li>
                <Link href="/publicar" className="hover:text-emerald-600 transition font-medium text-emerald-700">
                  Publicar Aviso Gratis
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-emerald-600 transition">
                  Panel de Anunciante
                </Link>
              </li>
              <li>
                <span className="text-xs text-slate-500">Plan Freemium de lanzamiento en el NEA</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-200 mt-10 pt-6 text-center text-xs text-slate-400">
          © {new Date().getFullYear()} AlquilaYa. Diseñado para Corrientes & Chaco, Argentina.
        </div>
      </div>
    </footer>
  );
}

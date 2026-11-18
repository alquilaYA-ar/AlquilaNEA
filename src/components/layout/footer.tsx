import Link from 'next/link';

export function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-slate-900 text-slate-300 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand info */}
          <div className="space-y-3 md:col-span-1">
            <span className="text-xl font-extrabold tracking-tight text-white">
              Alquila<span className="text-orange-500">NEA</span>
            </span>
            <p className="text-xs text-slate-400 leading-relaxed">
              El portal de clasificados de alquileres del Noreste Argentino. Conectamos directamente a inquilinos con dueños directos e inmobiliarias en Corrientes y Chaco.
            </p>
          </div>

          {/* Corrientes */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-3">
              Alquileres en Corrientes
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <Link href="/propiedades?provinciaId=1&localidadId=1" className="hover:text-orange-400 transition">
                  Corrientes Capital
                </Link>
              </li>
              <li>
                <Link href="/propiedades?provinciaId=1&localidadId=3" className="hover:text-orange-400 transition">
                  Paso de la Patria
                </Link>
              </li>
              <li>
                <Link href="/propiedades?provinciaId=1&localidadId=2" className="hover:text-orange-400 transition">
                  Goya
                </Link>
              </li>
            </ul>
          </div>

          {/* Chaco */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-3">
              Alquileres en Chaco
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <Link href="/propiedades?provinciaId=2&localidadId=4" className="hover:text-orange-400 transition">
                  Resistencia
                </Link>
              </li>
              <li>
                <Link href="/propiedades?provinciaId=2&localidadId=5" className="hover:text-orange-400 transition">
                  Barranqueras
                </Link>
              </li>
              <li>
                <Link href="/propiedades?provinciaId=2&localidadId=6" className="hover:text-orange-400 transition">
                  Fontana
                </Link>
              </li>
              <li>
                <Link href="/propiedades?provinciaId=2&localidadId=7" className="hover:text-orange-400 transition">
                  Sáenz Peña
                </Link>
              </li>
            </ul>
          </div>

          {/* Anunciantes */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-3">
              Para Propietarios
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <Link href="/publicar" className="hover:text-orange-400 transition font-bold text-orange-400">
                  Publicar Aviso Gratis
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-white transition">
                  Panel de Anunciante
                </Link>
              </li>
              <li>
                <Link href="/contacto" className="hover:text-white transition">
                  Soporte & Contacto Oficial
                </Link>
              </li>
              <li>
                <Link href="/terminos" className="hover:text-white transition">
                  Términos y Condiciones
                </Link>
              </li>
              <li>
                <Link href="/privacidad" className="hover:text-white transition">
                  Política de Privacidad
                </Link>
              </li>
              <li>
                <span className="text-[11px] text-slate-500">Plan Freemium de lanzamiento en el NEA</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-800 mt-10 pt-6 text-center text-xs text-slate-500">
          © {new Date().getFullYear()} AlquilaNEA. El portal inmobiliario de Corrientes & Chaco, Argentina.
        </div>
      </div>
    </footer>
  );
}

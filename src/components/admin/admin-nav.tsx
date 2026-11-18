'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Users, Building2, Inbox, Compass } from 'lucide-react';

const ITEMS = [
  { href: '/admin', label: 'Resumen', icon: LayoutDashboard, exact: true },
  { href: '/admin/usuarios', label: 'Usuarios', icon: Users },
  { href: '/admin/publicaciones', label: 'Publicaciones', icon: Building2 },
  { href: '/admin/mensajes', label: 'Mensajes', icon: Inbox },
];

export function AdminNav() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-wrap items-center gap-2" aria-label="Secciones del panel">
      {ITEMS.map(({ href, label, icon: Icon, exact }) => {
        const active = exact ? pathname === href : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? 'page' : undefined}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
              active
                ? 'bg-slate-900 text-white shadow-sm'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Icon className={`w-4 h-4 ${active ? 'text-orange-400' : 'text-slate-400'}`} />
            <span>{label}</span>
          </Link>
        );
      })}
      <Link
        href="/propiedades"
        className="ml-auto inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-orange-600 hover:bg-orange-700 text-white transition shadow-sm"
      >
        <Compass className="w-4 h-4" />
        <span>Explorar Web</span>
      </Link>
    </nav>
  );
}

'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { User, LogOut, UserCheck, Building2, Shield, PlusCircle } from 'lucide-react';
import { getCurrentUser, signOut } from '@/actions/auth';
import { createClient } from '@/lib/supabase/client';
import { Profile } from '@/types/database';

export function UserNav() {
  const pathname = usePathname();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [currentProfile, setCurrentProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const { user, profile } = await getCurrentUser();
    setCurrentUser(user);
    setCurrentProfile(profile);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
}, [load, pathname]);

useEffect(() => {
  const supabase = createClient();
  const {
    data: { subscription },
  } = supabase.auth.onAuthStateChange(() => {
    load();
  });
  return () => subscription.unsubscribe();
}, [load]);

const handleSignOut = async () => {
  await signOut();
  setCurrentUser(null);
  setCurrentProfile(null);
  window.location.href = '/';
};

if (loading) {
  return <div className="w-20 h-8 rounded-xl bg-slate-100 animate-pulse" />;
}

// 1. USUARIO NO AUTENTICADO (VISITANTE)
if (!currentUser) {
  return (
    <div className="flex items-center gap-2">
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
  );
}

const isAdmin =
  currentProfile?.es_admin === true || (currentProfile?.tipo_anunciante as string) === 'admin';

// 2. USUARIO ADMINISTRADOR (Vista limpia y exclusiva de gestión)
if (isAdmin) {
  return (
      <div className="flex items-center gap-2.5">
        <Link
          href="/admin"
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-sm transition"
        >
          <Shield className="w-3.5 h-3.5 text-orange-400" />
          <span>Panel Administrador</span>
        </Link>

        <Link
          href="/mi-cuenta"
          className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200/80 text-xs font-semibold text-slate-700 transition"
        >
          <User className="w-3.5 h-3.5 text-slate-500" />
          <span>Mis Datos</span>
        </Link>

        <button
          onClick={handleSignOut}
          title="Cerrar Sesión"
          className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-bold text-red-600 hover:text-red-700 hover:bg-red-50 rounded-xl transition cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          <span className="hidden sm:inline">Cerrar Sesión</span>
        </button>
      </div>
      );
  }

      // 3. ANUNCIANTE REGULAR (DUEÑO DIRECTO O INMOBILIARIA)
      const displayName =
      currentProfile?.nombre_inmobiliaria || currentProfile?.nombre_completo || 'Mi Cuenta';
      const isDuenoDirecto = currentProfile?.tipo_anunciante === 'dueno_directo';

      return (
        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            href="/mi-cuenta"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200/80 border border-slate-200/80 text-xs font-semibold text-slate-800 transition"
            title="Ver y editar mis datos"
          >
            {isDuenoDirecto ? (
              <UserCheck className="w-3.5 h-3.5 text-orange-600" />
            ) : (
              <Building2 className="w-3.5 h-3.5 text-blue-700" />
            )}
            <span className="max-w-[110px] sm:max-w-[130px] truncate">{displayName}</span>
          </Link>

          <Link
            href="/mis-publicaciones"
            className="text-xs font-bold text-slate-700 hover:text-orange-600 transition px-2 py-1.5 hidden md:block"
          >
            Mis Avisos
          </Link>

          <button
            onClick={handleSignOut}
            title="Cerrar Sesión"
            className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-bold text-red-600 hover:text-red-700 hover:bg-red-50 rounded-xl transition cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden lg:inline">Cerrar Sesión</span>
          </button>

          <Link
            href="/publicar"
            className="inline-flex items-center gap-1.5 px-3.5 sm:px-4 py-2 text-xs sm:text-sm font-bold text-white bg-orange-600 hover:bg-orange-700 rounded-xl shadow-sm hover:shadow transition"
          >
            <PlusCircle className="w-4 h-4" />
            <span className="hidden sm:inline">Publicar Gratis</span>
            <span className="sm:hidden">Publicar</span>
          </Link>
        </div>
        );
}

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { User, LogOut, UserCheck, Building2, Shield } from 'lucide-react';
import { getCurrentUser, signOut } from '@/actions/auth';
import { Profile } from '@/types/database';

export function UserNav() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [currentProfile, setCurrentProfile] = useState<Profile | null>(null);

  useEffect(() => {
    async function load() {
      const { user, profile } = await getCurrentUser();
      setCurrentUser(user);
      setCurrentProfile(profile);
    }
    load();
  }, []);

  const handleSignOut = async () => {
    await signOut();
    window.location.href = '/';
  };

  if (!currentUser) {
    return (
      <Link
        href="/login"
        className="text-sm font-semibold text-slate-700 hover:text-slate-900 transition px-3 py-2 flex items-center gap-1.5"
      >
        <User className="w-4 h-4 text-slate-500" />
        <span>Ingresar</span>
      </Link>
    );
  }

  const displayName = currentProfile?.nombre_inmobiliaria || currentProfile?.nombre_completo || 'Mi Cuenta';
  const isDuenoDirecto = currentProfile?.tipo_anunciante === 'dueno_directo';
  const isAdmin = currentProfile?.es_admin === true || (currentProfile?.tipo_anunciante as string) === 'admin';

  return (
    <div className="flex items-center gap-2">
      <Link
        href="/mis-publicaciones"
        className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200/80 border border-slate-200/80 text-xs font-semibold text-slate-800 transition"
        title="Ir a Mis Publicaciones"
      >
        {isAdmin ? (
          <Shield className="w-3.5 h-3.5 text-orange-600" />
        ) : isDuenoDirecto ? (
          <UserCheck className="w-3.5 h-3.5 text-orange-600" />
        ) : (
          <Building2 className="w-3.5 h-3.5 text-blue-700" />
        )}
        <span className="max-w-[130px] truncate">{displayName}</span>
      </Link>

      <Link
        href="/mis-publicaciones"
        className="text-xs font-bold text-slate-700 hover:text-orange-600 transition px-2 py-1.5 hidden md:block"
      >
        Mis Avisos
      </Link>

      {isAdmin && (
        <Link
          href="/admin"
          className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-extrabold text-orange-700 bg-orange-100 hover:bg-orange-200/80 border border-orange-200 rounded-xl transition shadow-xs"
          title="Panel Administrador Central"
        >
          <Shield className="w-3.5 h-3.5 text-orange-600" />
          <span>Admin</span>
        </Link>
      )}

      <button
        onClick={handleSignOut}
        title="Cerrar Sesión"
        className="p-2 text-slate-500 hover:text-red-600 transition rounded-lg hover:bg-slate-100 cursor-pointer"
      >
        <LogOut className="w-4 h-4" />
      </button>
    </div>
  );
}


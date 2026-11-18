import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Shield } from 'lucide-react';
import { getCurrentUser } from '@/actions/auth';
import { AdminNav } from '@/components/admin/admin-nav';

export const dynamic = 'force-dynamic';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, profile } = await getCurrentUser();

  if (!user) {
    redirect('/login?redirectTo=/admin');
  }

  const isAdmin = profile?.es_admin === true || (profile?.tipo_anunciante as string) === 'admin';

  if (!isAdmin) {
    return (
      <div className="max-w-md mx-auto px-4 py-24 text-center space-y-6">
        <div className="w-16 h-16 bg-red-100 text-red-600 rounded-3xl flex items-center justify-center mx-auto shadow-sm">
          <Shield className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Acceso Denegado</h1>
          <p className="text-sm text-slate-600">
            Esta sección es de uso exclusivo para el Administrador del sistema. Tu cuenta no posee permisos de administración.
          </p>
        </div>
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 px-6 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition shadow-sm"
        >
          ← Volver al Portal
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="space-y-4 pb-6 border-b border-slate-200">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-900 text-white shadow-sm">
            <Shield className="w-3.5 h-3.5 text-orange-400" />
            Panel de Administración
          </span>
          <span className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full border bg-emerald-50 text-emerald-700 border-emerald-200">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            Tiempo Real
          </span>
        </div>
        <AdminNav />
      </div>
      {children}
    </div>
  );
}

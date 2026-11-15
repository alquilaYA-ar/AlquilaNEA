import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/actions/auth';
import { Shield } from 'lucide-react';
import { getAdminStats } from '@/actions/admin';
import { AdminRealtimeDashboard } from '@/components/admin/admin-realtime-dashboard';

export const dynamic = 'force-dynamic';

export default async function AdminDashboardPage() {
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
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Acceso Denegado
          </h1>
          <p className="text-sm text-slate-600">
            Esta sección es de uso exclusivo para el Administrador del sistema. Tu cuenta no posee permisos de administración.
          </p>
        </div>
        <div>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 px-6 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition shadow-sm"
          >
            ← Volver al Portal
          </Link>
        </div>
      </div>
    );
  }

  const stats = await getAdminStats();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <AdminRealtimeDashboard
        initialStats={stats}
        adminProfile={profile}
        adminEmail={user.email || 'gonza18av@gmail.com'}
        adminId={user.id}
      />
    </div>
  );
}

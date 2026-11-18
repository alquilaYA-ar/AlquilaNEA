import { getCurrentUser } from '@/actions/auth';
import { getAdminStats } from '@/actions/admin';
import { AdminRealtimeDashboard } from '@/components/admin/admin-realtime-dashboard';

export const dynamic = 'force-dynamic';

// La verificación de acceso de administrador vive en admin/layout.tsx
export default async function AdminDashboardPage() {
  const [{ user, profile }, stats] = await Promise.all([getCurrentUser(), getAdminStats()]);

  return (
    <AdminRealtimeDashboard
      initialStats={stats}
      adminProfile={profile}
      adminEmail={user?.email || ''}
      adminId={user?.id || ''}
    />
  );
}

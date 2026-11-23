import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/actions/auth';
import { AdminDashboard } from '@/components/admin/admin-dashboard';

export const dynamic = 'force-dynamic';

export default async function AdminDashboardPage() {
  const { user, profile } = await getCurrentUser();

  if (!user) {
    redirect('/login?redirectTo=/admin');
  }

  return (
    <AdminDashboard
      initialTab="resumen"
      currentAdminId={user.id}
      adminProfile={profile}
      adminEmail={user.email || ''}
    />
  );
}

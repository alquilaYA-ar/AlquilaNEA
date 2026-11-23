import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/actions/auth';
import { AdminDashboard } from '@/components/admin/admin-dashboard';

export const dynamic = 'force-dynamic';

export default async function AdminPublicacionesPage() {
  const { user, profile } = await getCurrentUser();

  if (!user) {
    redirect('/login?redirectTo=/admin/publicaciones');
  }

  return (
    <AdminDashboard
      initialTab="publicaciones"
      currentAdminId={user.id}
      adminProfile={profile}
      adminEmail={user.email || ''}
    />
  );
}

import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/actions/auth';
import { AdminDashboard } from '@/components/admin/admin-dashboard';

export const dynamic = 'force-dynamic';

export default async function AdminUsuariosPage() {
  const { user, profile } = await getCurrentUser();

  if (!user) {
    redirect('/login?redirectTo=/admin/usuarios');
  }

  return (
    <AdminDashboard
      initialTab="usuarios"
      currentAdminId={user.id}
      adminProfile={profile}
      adminEmail={user.email || ''}
    />
  );
}

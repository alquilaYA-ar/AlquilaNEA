import { getCurrentUser } from '@/actions/auth';
import { getAdminStats } from '@/actions/admin';
import { AdminUsersLive } from '@/components/admin/admin-users-live';

export const dynamic = 'force-dynamic';

export default async function AdminUsuariosPage() {
  const [{ user }, stats] = await Promise.all([getCurrentUser(), getAdminStats()]);
  return <AdminUsersLive initialStats={stats} currentAdminId={user?.id || ''} />;
}

import { getAdminProperties } from '@/actions/admin';
import { AdminPropertiesTable } from '@/components/admin/admin-properties-table';

export const dynamic = 'force-dynamic';

export default async function AdminPublicacionesPage() {
  const properties = await getAdminProperties();
  return <AdminPropertiesTable initialProperties={properties} />;
}

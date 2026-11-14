import { redirect, notFound } from 'next/navigation';
import { getCurrentUser } from '@/actions/auth';
import { getPropertyById } from '@/actions/properties';
import { EditPropertyForm } from './edit-form';

export const dynamic = 'force-dynamic';

interface EditPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditarPublicacionPage({ params }: EditPageProps) {
  const { user } = await getCurrentUser();

  if (!user) {
    redirect('/login');
  }

  const { id } = await params;
  const property = await getPropertyById(id);

  if (!property) {
    notFound();
  }

  // Verificar que la propiedad pertenezca al usuario logueado
  if (property.anunciante_id !== user.id) {
    redirect('/mis-publicaciones');
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 space-y-6">
      <EditPropertyForm property={property} />
    </div>
  );
}

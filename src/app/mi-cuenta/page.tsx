import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/actions/auth';
import { ProfileForm } from '@/components/auth/profile-form';

export const dynamic = 'force-dynamic';

export default async function MiCuentaPage() {
  const { user, profile } = await getCurrentUser();

  if (!user || !profile) {
    redirect('/login?redirectTo=/mi-cuenta');
  }

  return <ProfileForm profile={profile} email={user.email || profile.email_contacto} />;
}


import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login?redirectTo=/admin');
  }

  // Verificación de admin centralizada a través de la función SQL is_admin().
  const { data: isAdmin, error } = await supabase.rpc('is_admin');

  if (error || !isAdmin) {
    redirect('/');
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {children}
    </div>
  );
}

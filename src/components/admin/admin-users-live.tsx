'use client';

import { AdminStats } from '@/actions/admin';
import { useAdminStats } from '@/components/admin/use-admin-stats';
import { AdminUserTable } from '@/components/admin/admin-user-table';
import { Users, UserCheck, Building2, Ban } from 'lucide-react';

export function AdminUsersLive({ initialStats, currentAdminId }: { initialStats: AdminStats; currentAdminId: string }) {
  const { stats } = useAdminStats(initialStats);
  const suspended = stats.users.filter((u) => u.suspendido).length;

  const cards = [
    { label: 'Total usuarios', value: stats.totalUsers, icon: Users, cls: 'text-slate-700 bg-slate-100' },
    { label: 'Dueños directos', value: stats.duenosCount, icon: UserCheck, cls: 'text-orange-700 bg-orange-100' },
    { label: 'Inmobiliarias', value: stats.inmobiliariasCount, icon: Building2, cls: 'text-blue-800 bg-blue-100' },
    { label: 'Suspendidos', value: suspended, icon: Ban, cls: 'text-red-700 bg-red-100' },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map(({ label, value, icon: Icon, cls }) => (
          <div key={label} className="bg-white rounded-2xl border border-slate-200 p-4 flex items-center gap-3 shadow-sm">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${cls}`}>
              <Icon className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xl font-black text-slate-900">{value}</div>
              <div className="text-[11px] font-semibold text-slate-500">{label}</div>
            </div>
          </div>
        ))}
      </div>
      <AdminUserTable initialUsers={stats.users} currentAdminId={currentAdminId} />
    </div>
  );
}

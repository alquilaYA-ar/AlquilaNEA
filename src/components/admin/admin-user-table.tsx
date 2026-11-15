'use client';

import { useState } from 'react';
import {
  Users,
  Search,
  UserCheck,
  Building2,
  Mail,
  Phone,
  Ban,
  CheckCircle,
  Trash2,
  Loader2,
  Shield,
  AlertTriangle,
} from 'lucide-react';
import { toggleSuspendUser, deleteUserByAdmin } from '@/actions/admin';

interface AdminUser {
  id: string;
  nombre_completo: string;
  nombre_inmobiliaria: string | null;
  tipo_anunciante: 'admin' | 'dueno_directo' | 'inmobiliaria';
  email_contacto: string;
  whatsapp: string;
  suspendido: boolean;
  created_at: string;
  propiedadesCount: number;
}

interface AdminUserTableProps {
  initialUsers: AdminUser[];
  currentAdminId: string;
}

export function AdminUserTable({ initialUsers, currentAdminId }: AdminUserTableProps) {
  const [users, setUsers] = useState<AdminUser[]>(initialUsers);
  const [searchTerm, setSearchTerm] = useState('');
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const filteredUsers = users.filter((u) => {
    const term = searchTerm.toLowerCase();
    return (
      u.nombre_completo.toLowerCase().includes(term) ||
      (u.nombre_inmobiliaria && u.nombre_inmobiliaria.toLowerCase().includes(term)) ||
      u.email_contacto.toLowerCase().includes(term) ||
      u.whatsapp.includes(term)
    );
  });

  const handleToggleSuspend = async (user: AdminUser) => {
    const nuevoEstado = !user.suspendido;
    const confirmText = nuevoEstado
      ? `¿Suspender al usuario "${user.nombre_inmobiliaria || user.nombre_completo}"? Sus ${user.propiedadesCount} publicaciones quedarán pausadas y ocultas para el público.`
      : `¿Reactivar al usuario "${user.nombre_inmobiliaria || user.nombre_completo}"? Sus publicaciones volverán a estar activas.`;

    if (!confirm(confirmText)) return;

    setActionLoadingId(user.id);
    setMessage(null);

    try {
      const res = await toggleSuspendUser(user.id, nuevoEstado);
      if (!res.success) throw new Error(res.error || 'Error al actualizar el usuario.');

      setUsers((prev) =>
        prev.map((u) => (u.id === user.id ? { ...u, suspendido: nuevoEstado } : u))
      );

      setMessage({
        type: 'success',
        text: nuevoEstado
          ? `Usuario suspendido. Sus publicaciones han sido pausadas.`
          : `Usuario reactivado con éxito.`,
      });
      setTimeout(() => setMessage(null), 4000);
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Error al procesar la solicitud.' });
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDeleteUser = async (user: AdminUser) => {
    const confirmText = `⚠️ ATENCIÓN: ¿Eliminar definitivamente al usuario "${user.nombre_inmobiliaria || user.nombre_completo}"?\n\nEsta acción eliminará su cuenta y TODAS sus ${user.propiedadesCount} publicaciones de forma irreversible.`;

    if (!confirm(confirmText)) return;

    setActionLoadingId(user.id);
    setMessage(null);

    try {
      const res = await deleteUserByAdmin(user.id);
      if (!res.success) throw new Error(res.error || 'Error al eliminar el usuario.');

      setUsers((prev) => prev.filter((u) => u.id !== user.id));

      setMessage({
        type: 'success',
        text: `Usuario y sus publicaciones eliminados correctamente.`,
      });
      setTimeout(() => setMessage(null), 4000);
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Error al eliminar usuario.' });
    } finally {
      setActionLoadingId(null);
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-600" />
            Gestión de Usuarios & Anunciantes ({users.length})
          </h2>
          <p className="text-xs text-slate-500">
            Control de cuentas, suspensión preventiva y eliminación de perfiles
          </p>
        </div>

        {/* Buscador */}
        <div className="relative w-full sm:w-72">
          <input
            type="text"
            placeholder="Buscar por nombre, email o tel..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3.5 py-2 text-xs font-medium focus:ring-2 focus:ring-orange-500"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        </div>
      </div>

      {message && (
        <div
          className={`p-3.5 rounded-xl text-xs font-semibold flex items-center gap-2 ${
            message.type === 'success'
              ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
              : 'bg-red-50 border border-red-200 text-red-700'
          }`}
        >
          {message.type === 'success' ? (
            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : (
            <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 text-slate-400 uppercase tracking-wider font-bold border-b border-slate-100">
            <tr>
              <th className="py-3 px-4">Anunciante</th>
              <th className="py-3 px-4">Rol / Tipo</th>
              <th className="py-3 px-4">Estado</th>
              <th className="py-3 px-4">Contacto</th>
              <th className="py-3 px-4 text-center">Avisos</th>
              <th className="py-3 px-4 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-medium">
            {filteredUsers.map((user) => {
              const isCurrentUser = user.id === currentAdminId;
              const isActionRunning = actionLoadingId === user.id;

              return (
                <tr
                  key={user.id}
                  className={`transition ${
                    user.suspendido ? 'bg-red-50/40 hover:bg-red-50/70' : 'hover:bg-slate-50/80'
                  }`}
                >
                  <td className="py-3.5 px-4 font-bold text-slate-900">
                    {user.nombre_inmobiliaria ? (
                      <div>
                        <span>{user.nombre_inmobiliaria}</span>
                        <span className="block text-[11px] font-normal text-slate-500">
                          Contacto: {user.nombre_completo}
                        </span>
                      </div>
                    ) : (
                      user.nombre_completo
                    )}
                    {isCurrentUser && (
                      <span className="ml-1.5 px-2 py-0.5 rounded text-[10px] font-extrabold bg-slate-900 text-white">
                        Tú (Admin)
                      </span>
                    )}
                  </td>

                  <td className="py-3.5 px-4">
                    {user.tipo_anunciante === 'admin' ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-slate-900 text-white shadow-xs">
                        <Shield className="w-3 h-3 text-orange-400" />
                        Admin
                      </span>
                    ) : user.tipo_anunciante === 'inmobiliaria' ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-blue-100 text-blue-800">
                        <Building2 className="w-3 h-3" />
                        Inmobiliaria
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-orange-100 text-orange-800">
                        <UserCheck className="w-3 h-3" />
                        Dueño Directo
                      </span>
                    )}
                  </td>

                  <td className="py-3.5 px-4">
                    {user.suspendido ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-800">
                        <Ban className="w-3 h-3" />
                        Suspendido
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        <CheckCircle className="w-3 h-3" />
                        Activo
                      </span>
                    )}
                  </td>

                  <td className="py-3.5 px-4 space-y-1">
                    <div className="flex items-center gap-1.5 text-slate-600">
                      <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{user.email_contacto}</span>
                    </div>
                    {user.whatsapp && (
                      <a
                        href={`https://wa.me/${user.whatsapp.replace(/[^0-9]/g, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 text-emerald-700 hover:underline font-semibold"
                      >
                        <Phone className="w-3.5 h-3.5 shrink-0" />
                        <span>{user.whatsapp}</span>
                      </a>
                    )}
                  </td>

                  <td className="py-3.5 px-4 text-center">
                    <span className="inline-block px-2.5 py-1 rounded-lg bg-slate-100 text-slate-800 font-bold">
                      {user.propiedadesCount}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 text-right">
                    {isCurrentUser ? (
                      <span className="text-[11px] text-slate-400 font-semibold italic">
                        Cuenta principal
                      </span>
                    ) : (
                      <div className="flex items-center justify-end gap-1.5">
                        {/* Botón Suspender / Reactivar */}
                        <button
                          type="button"
                          onClick={() => handleToggleSuspend(user)}
                          disabled={isActionRunning}
                          title={user.suspendido ? 'Reactivar usuario y avisos' : 'Suspender usuario y pausar avisos'}
                          className={`p-1.5 rounded-lg text-xs font-bold transition cursor-pointer disabled:opacity-50 flex items-center gap-1 ${
                            user.suspendido
                              ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200'
                              : 'bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200'
                          }`}
                        >
                          {isActionRunning ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : user.suspendido ? (
                            <>
                              <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                              <span className="hidden sm:inline">Reactivar</span>
                            </>
                          ) : (
                            <>
                              <Ban className="w-3.5 h-3.5 text-amber-700" />
                              <span className="hidden sm:inline">Suspender</span>
                            </>
                          )}
                        </button>

                        {/* Botón Eliminar */}
                        <button
                          type="button"
                          onClick={() => handleDeleteUser(user)}
                          disabled={isActionRunning}
                          title="Eliminar cuenta y avisos"
                          className="p-1.5 rounded-lg text-xs font-bold text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 transition cursor-pointer disabled:opacity-50"
                        >
                          {isActionRunning ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Trash2 className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}


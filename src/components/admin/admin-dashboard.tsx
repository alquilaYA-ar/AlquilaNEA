'use client';

import { useState, useEffect, useCallback } from 'react';
import { LayoutDashboard, Users, Building2, Inbox, Compass, Shield } from 'lucide-react';
import { AdminRealtimeDashboard } from './admin-realtime-dashboard';
import { AdminUsersLive } from './admin-users-live';
import { AdminPropertiesTable } from './admin-properties-table';
import { AdminContactMessages } from './admin-contact-messages';
import {
  getAdminStats,
  getAdminUsers,
  getAdminProperties,
  getContactMessages,
  AdminStats,
  AdminUsersData,
  AdminProperty,
  ContactMessage,
} from '@/actions/admin';
import { Profile } from '@/types/database';

type Tab = 'resumen' | 'usuarios' | 'publicaciones' | 'mensajes';

const ITEMS = [
  { id: 'resumen' as Tab, label: 'Resumen', icon: LayoutDashboard },
  { id: 'usuarios' as Tab, label: 'Usuarios', icon: Users },
  { id: 'publicaciones' as Tab, label: 'Publicaciones', icon: Building2 },
  { id: 'mensajes' as Tab, label: 'Mensajes', icon: Inbox },
];

interface AdminDashboardProps {
  initialTab: Tab;
  currentAdminId: string;
  adminProfile: Profile | null;
  adminEmail: string;
}

export function AdminDashboard({ initialTab, currentAdminId, adminProfile, adminEmail }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<Tab>(initialTab);
  const [data, setData] = useState<{
    resumen?: AdminStats;
    usuarios?: AdminUsersData;
    publicaciones?: AdminProperty[];
    mensajes?: ContactMessage[];
  }>({});
  const [loading, setLoading] = useState<Record<Tab, boolean>>({
    resumen: false,
    usuarios: false,
    publicaciones: false,
    mensajes: false,
  });

  const loadTab = useCallback(async (tab: Tab) => {
    if (data[tab] !== undefined) return; // ya cargado
    setLoading((prev) => ({ ...prev, [tab]: true }));
    try {
      switch (tab) {
        case 'resumen': {
          const stats = await getAdminStats();
          setData((prev) => ({ ...prev, resumen: stats }));
          break;
        }
        case 'usuarios': {
          const usersData = await getAdminUsers();
          setData((prev) => ({ ...prev, usuarios: usersData }));
          break;
        }
        case 'publicaciones': {
          const properties = await getAdminProperties();
          setData((prev) => ({ ...prev, publicaciones: properties }));
          break;
        }
        case 'mensajes': {
          const messagesRes = await getContactMessages();
          if (messagesRes.success) {
            setData((prev) => ({ ...prev, mensajes: messagesRes.messages }));
          }
          break;
        }
      }
    } catch (err) {
      console.error(`Error loading admin tab ${tab}:`, err);
    } finally {
      setLoading((prev) => ({ ...prev, [tab]: false }));
    }
  }, [data]);

  useEffect(() => {
    loadTab(initialTab);
  }, [initialTab, loadTab]);

  const handleTabChange = (tab: Tab) => {
    setActiveTab(tab);
    loadTab(tab);
    // Actualizar URL sin recargar la página
    const url = tab === 'resumen' ? '/admin' : `/admin/${tab}`;
    window.history.replaceState({ tab }, '', url);
  };

  // Sincronizar si el usuario usa los botones de atrás/adelante del navegador
  useEffect(() => {
    const onPopState = (e: PopStateEvent) => {
      const path = window.location.pathname;
      const tabFromUrl = path.replace('/admin', '').replace('/', '') as Tab;
      const newTab = ITEMS.some((i) => i.id === tabFromUrl) ? tabFromUrl : 'resumen';
      setActiveTab(newTab);
      loadTab(newTab);
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, [loadTab]);

  const renderContent = () => {
    switch (activeTab) {
      case 'resumen':
        if (loading.resumen || !data.resumen) return <AdminTabSkeleton />;
        return (
          <AdminRealtimeDashboard
            initialStats={data.resumen}
            adminProfile={adminProfile}
            adminEmail={adminEmail}
            adminId={currentAdminId}
          />
        );
      case 'usuarios':
        if (loading.usuarios || !data.usuarios) return <AdminTabSkeleton />;
        // AdminUsersLive espera AdminStats para las cards; adaptamos la forma mínima.
        const stats = {
          totalUsers: data.usuarios.totalUsers,
          duenosCount: data.usuarios.duenosCount,
          inmobiliariasCount: data.usuarios.inmobiliariasCount,
          users: data.usuarios.users,
        } as unknown as AdminStats;
        return <AdminUsersLive initialStats={stats} currentAdminId={currentAdminId} />;
      case 'publicaciones':
        if (loading.publicaciones || !data.publicaciones) return <AdminTabSkeleton />;
        return <AdminPropertiesTable initialProperties={data.publicaciones} />;
      case 'mensajes':
        if (loading.mensajes || !data.mensajes) return <AdminTabSkeleton />;
        return <AdminContactMessages initialMessages={data.mensajes} />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-8">
      <div className="space-y-4 pb-6 border-b border-slate-200">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-900 text-white shadow-sm">
            <Shield className="w-3.5 h-3.5 text-orange-400" />
            Panel de Administración
          </span>
          <span className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full border bg-emerald-50 text-emerald-700 border-emerald-200">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            Tiempo Real
          </span>
        </div>
      </div>

      <nav className="flex flex-wrap items-center gap-2" aria-label="Secciones del panel">
        {ITEMS.map(({ id, label, icon: Icon }) => {
          const active = activeTab === id;
          return (
            <button
              key={id}
              onClick={() => handleTabChange(id)}
              aria-current={active ? 'page' : undefined}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
                active
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Icon className={`w-4 h-4 ${active ? 'text-orange-400' : 'text-slate-400'}`} />
              <span>{label}</span>
            </button>
          );
        })}
        <a
          href="/propiedades"
          className="ml-auto inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-orange-600 hover:bg-orange-700 text-white transition shadow-sm"
        >
          <Compass className="w-4 h-4" />
          <span>Explorar Web</span>
        </a>
      </nav>
      {renderContent()}
    </div>
  );
}

function AdminTabSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-24 bg-white rounded-2xl border border-slate-200 p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-slate-200" />
              <div className="space-y-2">
                <div className="h-6 w-16 bg-slate-200 rounded" />
                <div className="h-3 w-20 bg-slate-200 rounded" />
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="h-96 bg-white rounded-2xl border border-slate-200" />
    </div>
  );
}

'use client';

import { useCallback, useEffect, useState } from 'react';
import { Inbox, Mail, Phone, Trash2, CheckCheck, MailOpen, RefreshCw, Search } from 'lucide-react';
import {
  ContactMessage,
  getContactMessages,
  setContactMessageRead,
  deleteContactMessage,
} from '@/actions/admin';
import { createClient } from '@/lib/supabase/client';

const MOTIVOS: Record<ContactMessage['motivo'], { label: string; cls: string }> = {
  soporte: { label: 'Soporte técnico', cls: 'bg-blue-100 text-blue-800' },
  inmobiliaria: { label: 'Inmobiliaria', cls: 'bg-indigo-100 text-indigo-800' },
  denuncia: { label: 'Denuncia', cls: 'bg-red-100 text-red-800' },
  sugerencia: { label: 'Sugerencia', cls: 'bg-emerald-100 text-emerald-800' },
};

export function AdminContactMessages({ initialMessages }: { initialMessages?: ContactMessage[] }) {
  const [messages, setMessages] = useState<ContactMessage[]>(initialMessages || []);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(!initialMessages || initialMessages.length === 0);
  const [filter, setFilter] = useState<'todos' | 'nuevos' | ContactMessage['motivo']>('todos');
  const [query, setQuery] = useState('');
  const [openId, setOpenId] = useState<string | null>(null);

  const load = useCallback(async () => {
    const res = await getContactMessages();
    if (res.success) {
      setMessages(res.messages);
      setError(null);
    } else {
      setError(res.error || 'No se pudieron cargar los mensajes.');
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
    const supabase = createClient();
    const channel = supabase
      .channel('admin-contact-messages')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'mensajes_contacto' }, () => load())
      .subscribe();
    const interval = setInterval(load, 15000);
    return () => {
      clearInterval(interval);
      supabase.removeChannel(channel);
    };
  }, [load]);

  const unread = messages.filter((m) => !m.leido).length;

  const visible = messages.filter((m) => {
    if (filter === 'nuevos' && m.leido) return false;
    if (filter !== 'todos' && filter !== 'nuevos' && m.motivo !== filter) return false;
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return [m.nombre, m.email, m.mensaje, m.telefono || ''].some((v) => v.toLowerCase().includes(q));
  });

  const toggleRead = async (m: ContactMessage) => {
    setMessages((prev) => prev.map((x) => (x.id === m.id ? { ...x, leido: !m.leido } : x)));
    await setContactMessageRead(m.id, !m.leido);
  };

  const remove = async (m: ContactMessage) => {
    if (!confirm(`¿Eliminar el mensaje de ${m.nombre}? Esta acción no se puede deshacer.`)) return;
    setMessages((prev) => prev.filter((x) => x.id !== m.id));
    await deleteContactMessage(m.id);
  };

  const open = async (m: ContactMessage) => {
    setOpenId(openId === m.id ? null : m.id);
    if (!m.leido) {
      setMessages((prev) => prev.map((x) => (x.id === m.id ? { ...x, leido: true } : x)));
      await setContactMessageRead(m.id, true);
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Inbox className="w-5 h-5 text-orange-600" />
            Mensajes de Contacto
            {unread > 0 && (
              <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-orange-600 text-white">{unread} nuevos</span>
            )}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">Consultas, denuncias y sugerencias enviadas desde el formulario público.</p>
        </div>
        <button
          onClick={load}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-700 cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Actualizar
        </button>
      </div>

      <div className="flex flex-wrap gap-2 items-center">
        {(['todos', 'nuevos', 'soporte', 'inmobiliaria', 'denuncia', 'sugerencia'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-full text-xs font-bold capitalize transition cursor-pointer ${
              filter === f ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {f}
          </button>
        ))}
        <div className="relative ml-auto">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            maxLength={100}
            placeholder="Buscar..."
            className="pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl w-44"
          />
        </div>
      </div>

      {error && <div className="p-3 bg-amber-50 border border-amber-200 text-amber-800 text-xs font-semibold rounded-xl">{error}</div>}

      {loading ? (
        <p className="text-xs text-slate-400 py-6 text-center">Cargando mensajes...</p>
      ) : visible.length === 0 ? (
        <p className="text-xs text-slate-400 py-6 text-center">No hay mensajes para mostrar.</p>
      ) : (
        <ul className="space-y-2.5">
          {visible.map((m) => (
            <li
              key={m.id}
              className={`rounded-2xl border p-4 transition ${m.leido ? 'bg-white border-slate-200' : 'bg-orange-50/60 border-orange-200'}`}
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <button onClick={() => open(m)} className="text-left flex-1 min-w-0 cursor-pointer">
                  <div className="flex flex-wrap items-center gap-2">
                    {!m.leido && <span className="w-2 h-2 rounded-full bg-orange-600" />}
                    <span className="font-bold text-sm text-slate-900">{m.nombre}</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${MOTIVOS[m.motivo]?.cls}`}>
                      {MOTIVOS[m.motivo]?.label || m.motivo}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      {new Date(m.created_at).toLocaleString('es-AR', { dateStyle: 'short', timeStyle: 'short' })}
                    </span>
                  </div>
                  <p className={`text-xs text-slate-600 mt-1 ${openId === m.id ? 'whitespace-pre-wrap break-words' : 'line-clamp-1'}`}>
                    {m.mensaje}
                  </p>
                </button>
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => toggleRead(m)}
                    title={m.leido ? 'Marcar como no leído' : 'Marcar como leído'}
                    className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 cursor-pointer"
                  >
                    {m.leido ? <MailOpen className="w-4 h-4" /> : <CheckCheck className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => remove(m)}
                    title="Eliminar"
                    className="p-2 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {openId === m.id && (
                <div className="mt-3 pt-3 border-t border-slate-200/70 flex flex-wrap gap-3 text-xs">
                  <a
                    href={`mailto:${m.email}?subject=${encodeURIComponent('Respuesta de AlquilaNEA')}`}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 text-white font-bold"
                  >
                    <Mail className="w-3.5 h-3.5" /> Responder a {m.email}
                  </a>
                  {m.telefono && (
                    <a
                      href={`https://wa.me/${m.telefono.replace(/\D/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 text-white font-bold"
                    >
                      <Phone className="w-3.5 h-3.5" /> WhatsApp {m.telefono}
                    </a>
                  )}
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

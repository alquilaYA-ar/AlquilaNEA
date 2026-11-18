'use client';

import { useCallback, useEffect, useRef, useState, useTransition } from 'react';
import { AdminStats, getAdminStats } from '@/actions/admin';
import { createClient } from '@/lib/supabase/client';

/** Estadísticas del panel en tiempo real (WebSocket + refresco periódico). */
export function useAdminStats(initialStats: AdminStats, intervalMs = 8000) {
  const [stats, setStats] = useState<AdminStats>(initialStats);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [isPending, startTransition] = useTransition();
  const [pulse, setPulse] = useState(false);
  const busy = useRef(false);

  const refresh = useCallback(() => {
    if (busy.current) return;
    busy.current = true;
    startTransition(async () => {
      try {
        const fresh = await getAdminStats();
        setStats(fresh);
        setLastUpdated(new Date());
        setPulse(true);
        setTimeout(() => setPulse(false), 1200);
      } finally {
        busy.current = false;
      }
    });
  }, []);

  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel(`admin-stats-${Math.random().toString(36).slice(2, 8)}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'propiedades' }, refresh)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, refresh)
      .subscribe();
    const interval = setInterval(refresh, intervalMs);
    return () => {
      clearInterval(interval);
      supabase.removeChannel(channel);
    };
  }, [refresh, intervalMs]);

  return { stats, lastUpdated, isPending, pulse, refresh };
}

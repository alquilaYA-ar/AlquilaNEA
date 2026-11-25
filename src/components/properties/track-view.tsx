'use client';

import { useEffect } from 'react';
import { trackPropertyView } from '@/actions/properties';

export function TrackPropertyView({ propertyId }: { propertyId: string }) {
  useEffect(() => {
    try {
      // Registrar la visita al cargar la publicación en el dispositivo
      const sessionKey = `viewed_prop_${propertyId}`;
      const lastViewTime = sessionStorage.getItem(sessionKey);
      const now = Date.now();

      // Evitar contar múltiples veces si el usuario recarga accidentalmente en menos de 30 segundos
      if (!lastViewTime || now - Number(lastViewTime) > 30000) {
        sessionStorage.setItem(sessionKey, now.toString());
        trackPropertyView(propertyId);
      }
    } catch (err) {
      // No debe romper la página si falla el tracking
      console.warn('TrackPropertyView error:', err);
    }
  }, [propertyId]);

  return null;
}


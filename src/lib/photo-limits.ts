export interface PropertyPhotoFeatures {
  ambientes: number | string;
  cochera?: boolean;
  terrazaBalcon?: boolean;
  patio?: boolean;
  pileta?: boolean;
}

export interface PhotoLimitResult {
  maxPhotos: number;
  breakdown: string[];
}

/**
 * Calcula dinámicamente el cupo máximo de fotografías permitidas (tope máximo: 10).
 * - Base por inmueble: 3 fotos (Fachada, Ambiente central, Baño).
 * - Ambientes adicionales: +1 foto por ambiente (hasta +4).
 * - Cochera: +1 foto.
 * - Balcón / Terraza: +1 foto.
 * - Patio / Jardín: +1 foto.
 * - Pileta: +1 foto.
 * - Máximo absoluto: 10 fotos.
 */
export function calculateMaxPhotos(features: PropertyPhotoFeatures): PhotoLimitResult {
  const breakdown: string[] = [];

  // Base inicial
  let total = 3;
  breakdown.push('Base del inmueble: 3 fotos');

  // Adicional por ambientes
  const amb = Number(features.ambientes) || 1;
  const extraAmbientes = Math.min(Math.max(amb - 1, 0), 4);
  if (extraAmbientes > 0) {
    total += extraAmbientes;
    breakdown.push(`+${extraAmbientes} por ${amb} ambientes`);
  }

  // Adicional por cochera
  if (features.cochera) {
    total += 1;
    breakdown.push('+1 por Cochera');
  }

  // Adicional por balcón o terraza
  if (features.terrazaBalcon) {
    total += 1;
    breakdown.push('+1 por Balcón/Terraza');
  }

  // Adicional por patio
  if (features.patio) {
    total += 1;
    breakdown.push('+1 por Patio/Jardín');
  }

  // Adicional por pileta
  if (features.pileta) {
    total += 1;
    breakdown.push('+1 por Pileta');
  }

  const maxPhotos = Math.min(total, 10);

  return {
    maxPhotos,
    breakdown,
  };
}

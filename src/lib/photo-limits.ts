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


export const MAX_IMAGE_BYTES = 5 * 1024 * 1024; // 5 MB
export const ALLOWED_IMAGE_TYPES: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
};

/** Filtra archivos no permitidos (tipo o tamaño) y devuelve los válidos + un mensaje de error. */
export function filterValidImages(files: File[]): { valid: File[]; error: string | null } {
  const valid: File[] = [];
  const problems: string[] = [];
  for (const f of files) {
    if (!ALLOWED_IMAGE_TYPES[f.type]) {
      problems.push(`"${f.name}" no es JPG, PNG o WEBP`);
    } else if (f.size > MAX_IMAGE_BYTES) {
      problems.push(`"${f.name}" supera los 5 MB`);
    } else {
      valid.push(f);
    }
  }
  return { valid, error: problems.length ? `Se omitieron archivos: ${problems.join('; ')}.` : null };
}

/** Nombre seguro de archivo dentro de la carpeta del usuario (<uid>/<ts>_<rand>.<ext>). */
export function buildStoragePath(userId: string, file: File, index: number): string {
  const ext = ALLOWED_IMAGE_TYPES[file.type] || 'jpg';
  const rand = Math.random().toString(36).slice(2, 8);
  return `${userId}/${Date.now()}_${index}_${rand}.${ext}`;
}

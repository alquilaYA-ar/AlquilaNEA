import { createClient } from '@/lib/supabase/server';

type Supabase = Awaited<ReturnType<typeof createClient>>;

/** Extrae la ruta interna del bucket 'properties' desde una URL pública de Supabase. */
export function storagePathFromUrl(url: string): string | null {
  const marker = '/storage/v1/object/public/properties/';
  const idx = url.indexOf(marker);
  if (idx === -1) return null;
  return decodeURIComponent(url.slice(idx + marker.length).split('?')[0]);
}

/** Borra del Storage los archivos asociados a una lista de URLs (ignora fallos silenciosamente). */
export async function removeStorageFilesByUrls(supabase: Supabase, urls: (string | null | undefined)[]) {
  const paths = urls
    .filter((u): u is string => !!u)
    .map(storagePathFromUrl)
    .filter((p): p is string => !!p);
  if (paths.length === 0) return;
  try {
    await supabase.storage.from('properties').remove(paths);
  } catch (err) {
    console.error('removeStorageFilesByUrls error:', err);
  }
}

/** Borra toda la carpeta <userId>/ del bucket (archivos subidos por ese usuario). */
export async function removeUserStorageFolder(supabase: Supabase, userId: string) {
  try {
    const { data } = await supabase.storage.from('properties').list(userId, { limit: 1000 });
    if (data && data.length > 0) {
      await supabase.storage.from('properties').remove(data.map((f) => `${userId}/${f.name}`));
    }
  } catch (err) {
    console.error('removeUserStorageFolder error:', err);
  }
}

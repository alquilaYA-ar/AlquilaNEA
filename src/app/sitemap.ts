import type { MetadataRoute } from 'next';
import { createClient } from '@/lib/supabase/server';
import { getSiteUrl } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const site = getSiteUrl();
  const staticPages: MetadataRoute.Sitemap = [
    { url: site, changeFrequency: 'daily', priority: 1 },
    { url: `${site}/propiedades`, changeFrequency: 'hourly', priority: 0.9 },
    { url: `${site}/contacto`, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${site}/terminos`, changeFrequency: 'yearly', priority: 0.1 },
    { url: `${site}/privacidad`, changeFrequency: 'yearly', priority: 0.1 },
  ];

  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from('propiedades')
      .select('id, updated_at')
      .eq('estado', 'activa')
      .order('created_at', { ascending: false })
      .limit(5000);

    const props: MetadataRoute.Sitemap = (data || []).map((p: { id: string; updated_at?: string }) => ({
      url: `${site}/propiedad/${p.id}`,
      lastModified: p.updated_at ? new Date(p.updated_at) : undefined,
      changeFrequency: 'weekly',
      priority: 0.7,
    }));
    return [...staticPages, ...props];
  } catch {
    return staticPages;
  }
}

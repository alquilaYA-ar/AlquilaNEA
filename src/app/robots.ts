import type { MetadataRoute } from 'next';
import { getSiteUrl } from '@/lib/utils';

export default function robots(): MetadataRoute.Robots {
  const site = getSiteUrl();
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin', '/login', '/recuperar', '/nueva-clave', '/mi-cuenta', '/mis-publicaciones', '/publicar', '/auth/'],
      },
    ],
    sitemap: `${site}/sitemap.xml`,
  };
}

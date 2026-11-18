import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'AlquilaNEA - Alquileres en Corrientes y Chaco',
    short_name: 'AlquilaNEA',
    description:
      'Portal de alquileres inmobiliarios en Corrientes y Chaco. Departamentos, casas y monoambientes por dueño directo e inmobiliarias.',
    start_url: '/',
    display: 'standalone',
    background_color: '#f8fafc',
    theme_color: '#0f172a',
    lang: 'es-AR',
    icons: [
      {
        src: '/icon.svg',
        sizes: 'any',
        type: 'image/svg+xml',
      },
      {
        src: '/apple-icon',
        sizes: '180x180',
        type: 'image/png',
      },
    ],
  };
}


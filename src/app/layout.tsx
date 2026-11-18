import type { Metadata } from 'next';
import './globals.css';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { getSiteUrl } from '@/lib/utils';

const siteUrl = getSiteUrl();

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  applicationName: 'AlquilaNEA',
  title: {
    default: 'AlquilaNEA | Alquileres en Corrientes y Chaco',
    template: '%s | AlquilaNEA',
  },
  description:
    'Encontrá alquileres en Corrientes Capital, Resistencia, Chaco y todo el NEA. Departamentos, casas y monoambientes publicados por dueños directos e inmobiliarias.',
  keywords: [
    'AlquilaNEA',
    'alquileres corrientes',
    'alquiler corrientes capital',
    'alquileres resistencia chaco',
    'alquiler chaco',
    'alquiler dueño directo corrientes',
    'alquiler dueño directo resistencia',
    'departamentos en alquiler corrientes',
    'departamentos en alquiler resistencia',
    'monoambientes corrientes',
    'inmobiliarias corrientes',
    'inmobiliarias resistencia',
  ],
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'AlquilaNEA | Alquileres en Corrientes y Chaco',
    description:
      'Departamentos, casas y monoambientes en alquiler en Corrientes y Chaco. Contacto directo por WhatsApp.',
    url: siteUrl,
    siteName: 'AlquilaNEA',
    locale: 'es_AR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AlquilaNEA | Alquileres en Corrientes y Chaco',
    description: 'Departamentos, casas y monoambientes en Corrientes y Chaco.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebSite',
        name: 'AlquilaNEA',
        alternateName: ['Alquila NEA', 'AlquilaNEA Argentina'],
        url: siteUrl,
        potentialAction: {
          '@type': 'SearchAction',
          target: `${siteUrl}/propiedades?ordenarPor=recientes`,
          'query-input': 'required name=search_term_string',
        },
      },
      {
        '@type': 'Organization',
        name: 'AlquilaNEA',
        url: siteUrl,
        logo: `${siteUrl}/apple-icon`,
        areaServed: ['Corrientes, Argentina', 'Chaco, Argentina'],
      },
    ],
  };

  return (
    <html lang="es-AR">
      <body className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}

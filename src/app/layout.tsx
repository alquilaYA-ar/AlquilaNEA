import type { Metadata } from 'next';
import './globals.css';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { getSiteUrl } from '@/lib/utils';

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: 'AlquilaNEA | Alquileres Inmobiliarios en Corrientes y Chaco',
  description: 'Encontrá tu próximo alquiler en el Noreste Argentino: Corrientes y Chaco. Departamentos, casas y monoambientes publicados por dueños directos e inmobiliarias.',
  keywords: ['alquiler corrientes', 'alquiler resistencia chaco', 'dueno directo alquiler nea', 'monoambientes corrientes', 'inmobiliarias resistencia'],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}

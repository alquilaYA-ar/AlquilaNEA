import type { Metadata } from 'next';
import { ProvinceLanding } from '@/components/properties/province-landing';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Alquileres en Resistencia y Chaco | Departamentos y Casas',
  description:
    'Buscá alquileres en Resistencia, Barranqueras, Fontana y Sáenz Peña, Chaco. Departamentos, casas y monoambientes por dueño directo e inmobiliarias.',
  alternates: { canonical: '/alquileres-chaco' },
  openGraph: {
    title: 'Alquileres en Resistencia y Chaco | AlquilaNEA',
    description:
      'Departamentos, casas y monoambientes en alquiler en Resistencia y toda la provincia del Chaco.',
  },
};

export default function AlquileresChacoPage() {
  return (
    <ProvinceLanding
      provinceMatch="Chaco"
      heading="Alquileres en Resistencia y Chaco"
      subheading="Departamentos, casas, PH y monoambientes en Resistencia, Barranqueras, Fontana y Presidencia Roque Sáenz Peña. Contacto directo por WhatsApp."
      cities={['Resistencia', 'Barranqueras', 'Fontana', 'Sáenz Peña', 'Dueño Directo']}
      seoParagraph="Explorá avisos actualizados de alquiler en Resistencia y toda la provincia del Chaco. Compará precios en pesos, expensas, ambientes, cochera o patio y comunicate al instante por WhatsApp con dueños directos e inmobiliarias verificadas de la región."
    />
  );
}

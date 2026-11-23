import type { Metadata } from 'next';
import { ProvinceLanding } from '@/components/properties/province-landing';

export const revalidate = 60;

export const metadata: Metadata = {
  title: 'Alquileres en Corrientes | Departamentos y Casas',
  description:
    'Encontrá departamentos, casas y monoambientes en alquiler en Corrientes Capital, Paso de la Patria y Goya. Contacto directo por WhatsApp con dueños e inmobiliarias.',
  alternates: { canonical: '/alquileres-corrientes' },
  openGraph: {
    title: 'Alquileres en Corrientes | AlquilaNEA',
    description:
      'Departamentos, casas y monoambientes en alquiler en Corrientes Capital y toda la provincia.',
  },
};

export default function AlquileresCorrientesPage() {
  return (
    <ProvinceLanding
      provinceMatch="Corrientes"
      heading="Alquileres en Corrientes"
      subheading="Departamentos, casas y monoambientes en Corrientes Capital, Paso de la Patria, Goya y toda la provincia. Contacto directo por WhatsApp."
      cities={['Corrientes Capital', 'Paso de la Patria', 'Goya', 'Dueño Directo', 'Inmobiliarias']}
      seoParagraph="En AlquilaNEA podés buscar alquileres en Corrientes Capital (Camba Cuá, Centro, La Rosada, Molina Punta, Laguna Seca) y localidades del interior como Paso de la Patria y Goya. Filtrá por cantidad de ambientes, cochera, mascotas y precio mensual, y escribí directamente por WhatsApp al propietario o inmobiliaria sin intermediarios."
    />
  );
}


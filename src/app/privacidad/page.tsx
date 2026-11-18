import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Política de Privacidad | AlquilaNEA' };

export default function PrivacidadPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12 space-y-6 text-sm text-slate-700 leading-relaxed">
      <h1 className="text-3xl font-extrabold text-slate-900">Política de Privacidad</h1>
      <p className="text-xs text-slate-500">Última actualización: noviembre de 2026</p>

      <section className="space-y-2">
        <h2 className="text-lg font-bold text-slate-900">1. Datos que recolectamos</h2>
        <p>Al registrarte: nombre, correo electrónico, WhatsApp, y —si sos inmobiliaria— nombre comercial y matrícula. Al publicar: los datos y fotografías del inmueble. Al escribirnos desde Contacto: nombre, correo, teléfono (opcional) y mensaje.</p>
      </section>
      <section className="space-y-2">
        <h2 className="text-lg font-bold text-slate-900">2. Para qué los usamos</h2>
        <p>Para crear y gestionar tu cuenta, mostrar tus avisos, permitir que los interesados te contacten por WhatsApp, enviarte correos de verificación y recuperación de contraseña, y responder tus consultas. No vendemos tus datos a terceros.</p>
      </section>
      <section className="space-y-2">
        <h2 className="text-lg font-bold text-slate-900">3. Qué es público</h2>
        <p>El nombre del anunciante, el WhatsApp de contacto y los datos del inmueble son visibles en cada aviso. Tu correo electrónico no se muestra públicamente.</p>
      </section>
      <section className="space-y-2">
        <h2 className="text-lg font-bold text-slate-900">4. Proveedores</h2>
        <p>Utilizamos Supabase (base de datos y autenticación), Vercel (hosting) y Resend (envío de correos) para operar el servicio.</p>
      </section>
      <section className="space-y-2">
        <h2 className="text-lg font-bold text-slate-900">5. Tus derechos</h2>
        <p>Conforme a la Ley 25.326 de Protección de Datos Personales, podés acceder, rectificar y solicitar la supresión de tus datos escribiéndonos desde la sección Contacto. La Agencia de Acceso a la Información Pública es el órgano de control de esta ley.</p>
      </section>
    </div>
  );
}

import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Términos y Condiciones | AlquilaNEA' };

export default function TerminosPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12 space-y-6 text-sm text-slate-700 leading-relaxed">
      <h1 className="text-3xl font-extrabold text-slate-900">Términos y Condiciones de Uso</h1>
      <p className="text-xs text-slate-500">Última actualización: noviembre de 2026</p>

      <section className="space-y-2">
        <h2 className="text-lg font-bold text-slate-900">1. Naturaleza del servicio</h2>
        <p>AlquilaNEA es un portal de clasificados que permite a propietarios e inmobiliarias de Corrientes y Chaco publicar inmuebles en alquiler y a los interesados contactarlos directamente. AlquilaNEA no es parte de los contratos de alquiler, no cobra comisiones por la intermediación ni garantiza la veracidad de los avisos.</p>
      </section>
      <section className="space-y-2">
        <h2 className="text-lg font-bold text-slate-900">2. Cuenta de anunciante</h2>
        <p>El anunciante debe proporcionar datos verdaderos y mantener la confidencialidad de su contraseña. Es responsable de toda actividad realizada desde su cuenta. Las inmobiliarias declaran contar con la matrícula profesional habilitante.</p>
      </section>
      <section className="space-y-2">
        <h2 className="text-lg font-bold text-slate-900">3. Contenido de las publicaciones</h2>
        <p>Está prohibido publicar contenido falso, engañoso, ilegal, discriminatorio u ofensivo, así como fotografías de las que no se posea autorización. El anunciante es el único responsable del contenido que publica. AlquilaNEA puede pausar o eliminar avisos y suspender cuentas que incumplan estas reglas, sin previo aviso.</p>
      </section>
      <section className="space-y-2">
        <h2 className="text-lg font-bold text-slate-900">4. Recomendaciones de seguridad</h2>
        <p>No transfieras dinero antes de visitar el inmueble y verificar la identidad de quien lo ofrece. Ante un aviso sospechoso, denunciálo desde la sección Contacto.</p>
      </section>
      <section className="space-y-2">
        <h2 className="text-lg font-bold text-slate-900">5. Limitación de responsabilidad</h2>
        <p>El servicio se brinda “tal cual está”. AlquilaNEA no responde por las transacciones entre usuarios ni por interrupciones del servicio ajenas a su control.</p>
      </section>
      <section className="space-y-2">
        <h2 className="text-lg font-bold text-slate-900">6. Ley aplicable</h2>
        <p>Estos términos se rigen por las leyes de la República Argentina. Cualquier controversia se someterá a los tribunales ordinarios competentes.</p>
      </section>
    </div>
  );
}

import { ImageResponse } from 'next/og';

export const alt = 'AlquilaNEA | Alquileres en Corrientes y Chaco';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '72px 80px',
          background: 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 60%, #9a3412 100%)',
          color: '#ffffff',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: 18,
              background: 'linear-gradient(45deg, #1d4ed8, #ea580c)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 30,
              fontWeight: 900,
            }}
          >
            AN
          </div>
          <div style={{ display: 'flex', fontSize: 36, fontWeight: 900, letterSpacing: -1 }}>
            Alquila<span style={{ color: '#fb923c' }}>NEA</span>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div style={{ fontSize: 62, fontWeight: 900, lineHeight: 1.1, letterSpacing: -1.5 }}>
            Alquileres en Corrientes y Chaco
          </div>
          <div style={{ fontSize: 28, color: '#cbd5e1', maxWidth: 920 }}>
            Departamentos, casas y monoambientes publicados por dueños directos e inmobiliarias. Contacto directo por WhatsApp.
          </div>
        </div>

        <div style={{ display: 'flex', gap: 16, fontSize: 20, color: '#fed7aa', fontWeight: 700 }}>
          <span>Corrientes Capital</span>
          <span>•</span>
          <span>Resistencia</span>
          <span>•</span>
          <span>Paso de la Patria</span>
          <span>•</span>
          <span>Goya</span>
          <span>•</span>
          <span>Sáenz Peña</span>
        </div>
      </div>
    ),
    { ...size }
  );
}

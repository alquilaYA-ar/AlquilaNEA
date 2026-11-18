import { ImageResponse } from 'next/og';

export const size = { width: 180, height: 180 };
export const contentType = 'image/png';

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: 36,
          background: 'linear-gradient(45deg, #1d4ed8 0%, #ea580c 100%)',
          color: '#ffffff',
          fontSize: 78,
          fontWeight: 900,
          letterSpacing: -3,
        }}
      >
        AN
      </div>
    ),
    { ...size }
  );
}

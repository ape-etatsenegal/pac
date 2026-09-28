'use client';

import { useEffect } from 'react';

const PAC = {
  red: '#D62828',
  redDark: '#A81E1E',
  redLight: '#F8D7D7',
  black: '#1A1A1A',
  blackSoft: '#2D2D2D',
  gray: '#F5F5F5',
  grayBorder: '#E5E5E5',
};

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Erreur critique :', error);
  }, [error]);

  return (
    <html lang="fr">
      <body style={{ margin: 0, fontFamily: 'system-ui, -apple-system, sans-serif' }}>
        <div
          style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px',
            background: `linear-gradient(135deg, ${PAC.gray} 0%, #FFF5F5 50%, ${PAC.gray} 100%)`,
          }}
        >
          <div
            style={{
              background: 'white',
              borderRadius: '24px',
              boxShadow: '0 25px 50px -12px rgba(0,0,0,0.15)',
              padding: '48px 32px',
              maxWidth: '480px',
              width: '100%',
              textAlign: 'center',
              borderTop: `4px solid ${PAC.red}`,
            }}
          >
            <div
              style={{
                width: '80px',
                height: '80px',
                margin: '0 auto 24px',
                borderRadius: '50%',
                background: `linear-gradient(135deg, ${PAC.red}, ${PAC.redDark})`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '40px',
              }}
            >
              ⚠️
            </div>

            <h1
              style={{
                fontSize: '28px',
                fontWeight: 'bold',
                color: PAC.black,
                marginBottom: '12px',
              }}
            >
              Erreur critique
            </h1>

            <p
              style={{
                color: PAC.blackSoft,
                marginBottom: '32px',
                lineHeight: 1.6,
              }}
            >
              Une erreur critique est survenue. Veuillez recharger la page ou
              contacter l&apos;équipe organisatrice.
            </p>

            <button
              onClick={reset}
              style={{
                background: `linear-gradient(90deg, ${PAC.red}, ${PAC.redDark})`,
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                padding: '14px 32px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer',
                boxShadow: '0 10px 30px rgba(214, 40, 40, 0.25)',
              }}
            >
              🔄 Recharger la page
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
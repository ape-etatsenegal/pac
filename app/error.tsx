'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { AlertTriangle, RefreshCw, Home, ArrowLeft } from 'lucide-react';

const PAC = {
  red: '#D62828',
  redDark: '#A81E1E',
  redLight: '#F8D7D7',
  black: '#1A1A1A',
  blackSoft: '#2D2D2D',
  gray: '#F5F5F5',
  grayBorder: '#E5E5E5',
};

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log l'erreur côté client (visible dans la console du navigateur)
    console.error('Une erreur est survenue :', error);
  }, [error]);

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-12 relative overflow-hidden"
      style={{ background: `linear-gradient(135deg, ${PAC.gray} 0%, #FFF5F5 50%, ${PAC.gray} 100%)` }}
    >
      <div
        className="pointer-events-none absolute -top-60 -right-60 h-[700px] w-[700px] opacity-[0.06]"
        style={{
          backgroundImage: 'url(/motif-pac.png)',
          backgroundSize: 'contain',
          backgroundRepeat: 'no-repeat',
        }}
      />

      <div className="relative w-full max-w-2xl">
        <div className="flex justify-center mb-8">
          <div
            className="rounded-2xl bg-white p-4 shadow-xl"
            style={{ border: `1px solid ${PAC.grayBorder}` }}
          >
            <Image
              src="/logo-pac.png"
              alt="Logo PAC"
              width={120}
              height={60}
              className="object-contain"
              priority
            />
          </div>
        </div>

        <div
          className="bg-white/95 backdrop-blur rounded-3xl shadow-2xl overflow-hidden"
          style={{ border: `1px solid ${PAC.grayBorder}` }}
        >
          <div className="h-2" style={{ background: `linear-gradient(90deg, ${PAC.red}, ${PAC.black})` }} />

          <div className="p-8 sm:p-12 text-center">
            <div className="relative mx-auto mb-6 flex h-24 w-24 items-center justify-center">
              <div className="absolute inset-0 rounded-full opacity-20 animate-ping" style={{ backgroundColor: PAC.redLight }} />
              <div className="absolute inset-0 rounded-full" style={{ backgroundColor: PAC.redLight }} />
              <div
                className="relative flex h-20 w-20 items-center justify-center rounded-full shadow-lg"
                style={{ background: `linear-gradient(135deg, ${PAC.red}, ${PAC.redDark})` }}
              >
                <AlertTriangle className="h-10 w-10 text-white" strokeWidth={2} />
              </div>
            </div>

            <p
              className="text-[11px] font-semibold uppercase tracking-wider px-3 py-1 rounded-full inline-block mb-4"
              style={{ color: PAC.redDark, backgroundColor: PAC.redLight }}
            >
              Une erreur est survenue
            </p>

            <h1
              className="text-3xl sm:text-4xl font-bold mb-4 tracking-tight"
              style={{ color: PAC.black }}
            >
              Oups, quelque chose s&apos;est mal passé
            </h1>

            <p
              className="text-base mb-8 max-w-md mx-auto leading-relaxed"
              style={{ color: PAC.blackSoft }}
            >
              Une erreur inattendue s&apos;est produite. Vous pouvez réessayer ou
              retourner à la page d&apos;accueil.
            </p>

            {/* Détail technique (visible uniquement en dev) */}
            {process.env.NODE_ENV === 'development' && error.message && (
              <div
                className="mb-6 p-4 rounded-xl text-left text-xs font-mono overflow-auto max-h-32"
                style={{
                  backgroundColor: PAC.gray,
                  border: `1px solid ${PAC.grayBorder}`,
                  color: PAC.redDark,
                }}
              >
                <p className="font-semibold mb-1">Détail technique :</p>
                <p className="break-all">{error.message}</p>
                {error.digest && (
                  <p className="mt-1 opacity-60">Digest : {error.digest}</p>
                )}
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={reset}
                className="inline-flex items-center justify-center gap-2 rounded-xl px-6 h-12 font-semibold text-white shadow-lg transition-all hover:-translate-y-0.5"
                style={{
                  background: `linear-gradient(90deg, ${PAC.red}, ${PAC.redDark})`,
                  boxShadow: `0 10px 30px rgba(214, 40, 40, 0.25)`,
                }}
              >
                <RefreshCw className="h-4 w-4" />
                Réessayer
              </button>

              <Link
                href="/"
                className="inline-flex items-center justify-center gap-2 rounded-xl px-6 h-12 font-semibold transition-all hover:-translate-y-0.5 bg-white"
                style={{
                  color: PAC.black,
                  border: `1px solid ${PAC.grayBorder}`,
                }}
              >
                <Home className="h-4 w-4" />
                Retour à l&apos;accueil
              </Link>
            </div>

            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs mt-6 transition-colors"
              style={{ color: PAC.blackSoft }}
            >
              <ArrowLeft className="h-3 w-3" />
              Retourner à la page précédente
            </Link>
          </div>
        </div>

        <p className="text-center text-xs mt-6" style={{ color: PAC.blackSoft }}>
          Si le problème persiste, contactez l&apos;équipe organisatrice.
        </p>
      </div>
    </div>
  );
}
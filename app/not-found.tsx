'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Home, Search, ArrowLeft, Compass } from 'lucide-react';

const PAC = {
  red: '#D62828',
  redDark: '#A81E1E',
  redLight: '#F8D7D7',
  black: '#1A1A1A',
  blackSoft: '#2D2D2D',
  gray: '#F5F5F5',
  grayBorder: '#E5E5E5',
};

export default function NotFound() {
  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-12 relative overflow-hidden"
      style={{ background: `linear-gradient(135deg, ${PAC.gray} 0%, #FFF5F5 50%, ${PAC.gray} 100%)` }}
    >
      {/* Motif circulaire décoratif */}
      <div
        className="pointer-events-none absolute -top-60 -right-60 h-[700px] w-[700px] opacity-[0.06]"
        style={{
          backgroundImage: 'url(/motif-pac.png)',
          backgroundSize: 'contain',
          backgroundRepeat: 'no-repeat',
        }}
      />
      <div
        className="pointer-events-none absolute -bottom-60 -left-60 h-[700px] w-[700px] opacity-[0.05]"
        style={{
          backgroundImage: 'url(/motif-pac.png)',
          backgroundSize: 'contain',
          backgroundRepeat: 'no-repeat',
        }}
      />

      <div className="relative w-full max-w-2xl">
        {/* Logo PAC centré */}
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

        {/* Carte principale */}
        <div
          className="bg-white/95 backdrop-blur rounded-3xl shadow-2xl overflow-hidden"
          style={{ border: `1px solid ${PAC.grayBorder}` }}
        >
          {/* Bandeau gradient */}
          <div className="h-2" style={{ background: `linear-gradient(90deg, ${PAC.red}, ${PAC.black})` }} />

          <div className="p-8 sm:p-12 text-center">
            {/* Icône 404 */}
            <div className="relative mx-auto mb-6 flex h-24 w-24 items-center justify-center">
              <div className="absolute inset-0 rounded-full opacity-20 animate-ping" style={{ backgroundColor: PAC.redLight }} />
              <div className="absolute inset-0 rounded-full" style={{ backgroundColor: PAC.redLight }} />
              <div
                className="relative flex h-20 w-20 items-center justify-center rounded-full shadow-lg"
                style={{ background: `linear-gradient(135deg, ${PAC.red}, ${PAC.redDark})` }}
              >
                <Compass className="h-10 w-10 text-white" strokeWidth={2} />
              </div>
            </div>

            <p
              className="text-[11px] font-semibold uppercase tracking-wider px-3 py-1 rounded-full inline-block mb-4"
              style={{ color: PAC.redDark, backgroundColor: PAC.redLight }}
            >
              Erreur 404
            </p>

            <h1
              className="text-5xl sm:text-6xl font-bold mb-4 tracking-tight"
              style={{ color: PAC.black }}
            >
              Page introuvable
            </h1>

            <p
              className="text-base sm:text-lg mb-8 max-w-md mx-auto leading-relaxed"
              style={{ color: PAC.blackSoft }}
            >
              Désolé, la page que vous recherchez n&apos;existe pas ou a été déplacée.
              Vérifiez l&apos;URL ou retournez à l&apos;accueil.
            </p>

            {/* Boutons d'action */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/"
                className="inline-flex items-center justify-center gap-2 rounded-xl px-6 h-12 font-semibold text-white shadow-lg transition-all hover:-translate-y-0.5"
                style={{
                  background: `linear-gradient(90deg, ${PAC.red}, ${PAC.redDark})`,
                  boxShadow: `0 10px 30px rgba(214, 40, 40, 0.25)`,
                }}
              >
                <Home className="h-4 w-4" />
                Retour à l&apos;accueil
              </Link>

              <Link
                href="/#formulaire"
                className="inline-flex items-center justify-center gap-2 rounded-xl px-6 h-12 font-semibold transition-all hover:-translate-y-0.5 bg-white"
                style={{
                  color: PAC.black,
                  border: `1px solid ${PAC.grayBorder}`,
                }}
              >
                <Search className="h-4 w-4" />
                Formulaire d&apos;inscription
              </Link>
            </div>

            {/* Lien discret */}
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
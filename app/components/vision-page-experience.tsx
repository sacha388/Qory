'use client';

import Link from 'next/link';
import { useEffect, useRef, useState, type RefObject } from 'react';
import SiteFooter from '@/app/components/site-footer';
import SiteHeader from '@/app/components/site-header';
import { TitleDecoScribble, REPORT_DECO_GREEN } from '@/app/components/title-deco';

/** Panneaux plein écran empilés au scroll (sticky + z-index) — affichés à partir de `md` uniquement. */
const VISION_STACK_PANELS = [
  { label: 'Score', bg: '#69D33F' },
  { label: 'IA', bg: '#4BA7F5' },
  { label: 'Marché', bg: '#F16B5D' },
  { label: 'Plan d’action', bg: '#F4B43A' },
] as const;

const VIEWPORT_BLOCK = 'min-h-[100svh]';

function VideoPlayPauseToggle({ videoRef }: { videoRef: RefObject<HTMLVideoElement | null> }) {
  const [playing, setPlaying] = useState(true);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);
    v.addEventListener('play', onPlay);
    v.addEventListener('pause', onPause);
    setPlaying(!v.paused);
    return () => {
      v.removeEventListener('play', onPlay);
      v.removeEventListener('pause', onPause);
    };
  }, [videoRef]);

  const toggle = () => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) {
      void v.play();
    } else {
      v.pause();
    }
  };

  return (
    <button
      type="button"
      onClick={toggle}
      className="absolute z-20 flex h-11 w-11 items-center justify-center rounded-full bg-white transition-transform hover:scale-105 active:scale-95 sm:h-12 sm:w-12"
      style={{
        bottom: 'max(1.25rem, env(safe-area-inset-bottom, 0px))',
        right: 'max(1.25rem, env(safe-area-inset-right, 0px))',
      }}
      aria-label={playing ? 'Mettre la vidéo en pause' : 'Lire la vidéo'}
    >
      {playing ? (
        <svg
          viewBox="0 0 24 24"
          className="h-6 w-6 text-black sm:h-7 sm:w-7"
          fill="currentColor"
          aria-hidden
        >
          <rect x="5.5" y="4" width="5" height="16" rx="2.5" ry="2.5" />
          <rect x="13.5" y="4" width="5" height="16" rx="2.5" ry="2.5" />
        </svg>
      ) : (
        <svg
          viewBox="0 0 24 24"
          className="h-6 w-6 text-black sm:h-7 sm:w-7"
          fill="currentColor"
          aria-hidden
        >
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            transform="translate(1.15 0)"
            d="M4.5 5.653c0-1.427 1.529-2.33 2.779-1.643l11.54 6.347c1.295.712 1.295 2.573 0 3.286L7.28 19.99c-1.25.687-2.779-.217-2.779-1.643V5.653Z"
          />
        </svg>
      )}
    </button>
  );
}

export default function VisionPageExperience() {
  const videoRef = useRef<HTMLVideoElement>(null);

  return (
    <main className="relative min-h-screen overflow-x-clip bg-black [overflow-anchor:none]">
      <SiteHeader variant="dark" position="fixed" landingMinimal landingMinimalLightSurface={false} />

      {/* Hero vidéo */}
      <section
        className={`relative w-full overflow-hidden bg-black ${VIEWPORT_BLOCK}`}
        aria-label="Vision Qory"
      >
        <video
          ref={videoRef}
          className="absolute inset-0 h-full w-full object-contain object-center sm:object-cover sm:object-center"
          autoPlay
          muted
          playsInline
          loop
          preload="auto"
        >
          <source src="/lauch.mp4" type="video/mp4" />
          <source src="/launch.mp4" type="video/mp4" />
        </video>
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              'linear-gradient(180deg, rgba(0,0,0,0.32) 0%, rgba(0,0,0,0.14) 28%, rgba(0,0,0,0.10) 52%, rgba(0,0,0,0.16) 78%, rgba(0,0,0,0.38) 100%)',
          }}
          aria-hidden
        />
        <VideoPlayPauseToggle videoRef={videoRef} />
      </section>

      {/* Citation */}
      <section
        className={`cv-auto flex items-center justify-center bg-white px-4 py-14 sm:px-8 sm:py-20 lg:px-12 ${VIEWPORT_BLOCK}`}
      >
        <div className="mx-auto w-full max-w-3xl text-center">
          <blockquote className="text-balance text-[1.0625rem] font-medium leading-[1.45] tracking-tight text-[#1D1D1F] sm:text-[1.35rem] sm:leading-snug md:text-[1.65rem] lg:text-[1.85rem]">
            <p>Avant, une marque cherchait sa place dans une liste.</p>
            <p className="mt-5 sm:mt-6">Maintenant, elle cherche sa place dans une réponse.</p>
            <p className="mt-5 sm:mt-6">Qory existe pour lire cette nouvelle couche de visibilité.</p>
          </blockquote>
        </div>
      </section>

      {/* 4 panneaux — desktop / tablette large uniquement (pas de section sur mobile). */}
      <section
        className="relative isolate hidden overscroll-y-contain bg-black md:block cv-auto"
        aria-label="Enchaînement des quatre lectures"
      >
        {VISION_STACK_PANELS.map((panel, i) => (
          <div
            key={panel.label}
            className="sticky top-0 flex h-[100svh] w-full touch-pan-y transform-gpu items-center justify-center px-6 [backface-visibility:hidden]"
            style={{
              backgroundColor: panel.bg,
              zIndex: i + 1,
            }}
          >
            <h2 className="text-balance px-2 text-center text-[clamp(3.25rem,14vw,10.5rem)] font-semibold leading-[0.92] tracking-tight text-white">
              {panel.label}
            </h2>
          </div>
        ))}
      </section>

      {/* Clôture */}
      <section className="relative bg-black cv-auto">
        <div className="flex max-md:min-h-0 max-md:py-16 min-h-0 flex-col items-center justify-center px-5 py-16 sm:min-h-[100svh] sm:px-10 sm:py-24 lg:px-16">
          <div className="mx-auto w-full max-w-5xl text-center">
            <h2 className="text-balance text-[1.9rem] font-semibold leading-[1.02] tracking-tight text-white sm:text-[2.85rem] sm:leading-[0.94] md:text-[4.25rem] lg:text-[5.1rem]">
              L’IA décide le{' '}
              <TitleDecoScribble color={REPORT_DECO_GREEN}>
                futur
              </TitleDecoScribble>
              .
            </h2>
            <div className="mx-auto mt-10 flex w-full max-w-md flex-col items-stretch gap-3 sm:mt-14 sm:max-w-none sm:flex-row sm:flex-wrap sm:items-center sm:justify-center sm:gap-4">
              <Link
                href="/audit"
                className="inline-flex h-[52px] w-full shrink-0 items-center justify-center rounded-full bg-white px-7 text-base font-semibold text-black transition-colors hover:bg-[#F2F2F2] sm:h-14 sm:w-auto sm:min-w-[10.5rem] sm:px-9 sm:text-lg"
              >
                Lancer l’audit
              </Link>
              <Link
                href="/contact"
                className="inline-flex h-[52px] w-full shrink-0 items-center justify-center rounded-full border border-white/[0.14] px-7 text-base font-semibold text-white transition-colors hover:bg-white/[0.08] sm:h-14 sm:w-auto sm:min-w-[10.5rem] sm:px-9 sm:text-lg"
              >
                Nous contacter
              </Link>
            </div>
          </div>
        </div>
      </section>

      <SiteFooter className="relative mt-0 rounded-none bg-[#121418] px-4 pb-[max(2.75rem,env(safe-area-inset-bottom,0px))] pt-12 text-white sm:px-6 sm:pb-12 sm:pt-14 md:pb-16 md:pt-16" />
    </main>
  );
}

'use client';

import type { ReactNode } from 'react';
import { Globe02Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { TitleDecoScribble, REPORT_DECO_BLUE } from '@/app/components/title-deco';

const HERO_PLATFORMS = [
  { name: 'ChatGPT', src: '/openai.svg?v=3' },
  { name: 'Claude', src: '/claude.svg?v=3' },
  { name: 'Perplexity', src: '/perplexity.svg?v=3' },
] as const;

/** Barre URL comme le hero (globe + placeholder gris) — radius extérieur aligné sur le bouton (cf. home : ~31px / 26px). */
function MiniHeroUrlBar() {
  return (
    <div className="relative mx-auto mt-2 flex min-h-[24px] w-full max-w-[15rem] items-center rounded-[13px] border border-white/[0.12] bg-white/[0.06] p-[3px] sm:mt-2.5 sm:min-h-[28px] sm:max-w-[17rem] sm:rounded-[15px] sm:p-[4px]">
      <span className="pointer-events-none absolute left-[7px] top-1/2 -translate-y-1/2 text-white/40 sm:left-2">
        <HugeiconsIcon
          icon={Globe02Icon}
          size={14}
          className="h-3 w-3 opacity-100 [&_*]:[stroke-linecap:butt] [&_*]:[stroke-linejoin:miter] sm:h-3.5 sm:w-3.5"
          aria-hidden
        />
      </span>
      <span className="min-w-0 flex-1 truncate pl-[26px] pr-1 text-left text-[0.42rem] text-white/40 sm:pl-[30px] sm:text-[0.48rem]">
        https://votre-site.fr
      </span>
      <span className="inline-flex h-[20px] shrink-0 items-center justify-center self-stretch rounded-[10px] bg-white px-2 text-[0.42rem] font-semibold whitespace-nowrap text-black sm:h-[24px] sm:rounded-[11px] sm:px-2.5 sm:text-[0.48rem]">
        Analyser
      </span>
    </div>
  );
}

function DarkSafariFrame({ children }: { children: ReactNode }) {
  return (
    <div className="overflow-hidden rounded-[14px] border border-white/[0.12] bg-[#101012] shadow-[0_20px_40px_rgba(0,0,0,0.5)] sm:rounded-[16px]">
      <div className="flex items-center gap-1.5 border-b border-white/[0.07] bg-[#2b2b30] px-2.5 py-1.5 sm:gap-2 sm:px-3 sm:py-2">
        <span className="h-2 w-2 shrink-0 rounded-full bg-[#ff5f57] sm:h-2.5 sm:w-2.5" aria-hidden />
        <span className="h-2 w-2 shrink-0 rounded-full bg-[#febc2e] sm:h-2.5 sm:w-2.5" aria-hidden />
        <span className="h-2 w-2 shrink-0 rounded-full bg-[#28c840] sm:h-2.5 sm:w-2.5" aria-hidden />
        <div className="ml-1 flex min-h-[20px] min-w-0 flex-1 items-center justify-center rounded-md bg-black/40 px-2 sm:min-h-[22px]">
          <span className="truncate text-[8px] text-white/38 sm:text-[9px]">qory.fr</span>
        </div>
      </div>
      <div className="bg-black">{children}</div>
    </div>
  );
}

function MiniHeroGood() {
  return (
    <div className="px-2 pb-3 pt-2.5 text-center text-white sm:px-3 sm:pb-4 sm:pt-3">
      <div className="mb-1.5 flex items-center justify-center gap-1 sm:mb-2 sm:gap-1.5">
        {HERO_PLATFORMS.map((p) => (
          <div
            key={p.name}
            className="flex h-[17px] w-[17px] items-center justify-center rounded-md border border-white/[0.12] bg-white/10 sm:h-[19px] sm:w-[19px] sm:rounded-[7px]"
            aria-hidden
          >
            <img src={p.src} alt="" className="h-2.5 w-2.5 shrink-0 brightness-0 invert sm:h-[11px] sm:w-[11px]" />
          </div>
        ))}
      </div>
      <h3 className="mx-auto max-w-[15.5rem] text-balance text-[0.78rem] font-semibold leading-[1.06] tracking-tight sm:max-w-[18rem] sm:text-[0.92rem]">
        <span className="block">Savez-vous ce que</span>
        <span className="block">
          l&apos;IA dit de{' '}
          <span className="[&_svg]:translate-y-[0.14em] sm:[&_svg]:translate-y-[0.16em]">
            <TitleDecoScribble color={REPORT_DECO_BLUE}>vous</TitleDecoScribble>
          </span>
          &nbsp;?
        </span>
      </h3>
      <p className="mx-auto mt-1.5 max-w-[13.5rem] text-[0.5rem] leading-snug text-white/[0.72] sm:mt-2 sm:max-w-[15rem] sm:text-[0.56rem] sm:leading-relaxed">
        Découvrez si votre site ressort dans les réponses de ChatGPT, Claude et Perplexity — et ce qu&apos;il faut corriger.
      </p>
      <MiniHeroUrlBar />
    </div>
  );
}

function MiniHeroBad() {
  return (
    <div className="px-2 pb-3 pt-2.5 text-center text-white sm:px-3 sm:pb-4 sm:pt-3">
      <div className="mb-1.5 flex items-center justify-center gap-1 sm:mb-2 sm:gap-1.5">
        {HERO_PLATFORMS.map((p) => (
          <div
            key={p.name}
            className="flex h-[17px] w-[17px] items-center justify-center rounded-md border border-white/[0.12] bg-white/10 sm:h-[19px] sm:w-[19px] sm:rounded-[7px]"
            aria-hidden
          >
            <img src={p.src} alt="" className="h-2.5 w-2.5 shrink-0 brightness-0 invert sm:h-[11px] sm:w-[11px]" />
          </div>
        ))}
      </div>
      <h3 className="mx-auto max-w-[15.5rem] text-balance text-[0.78rem] font-semibold leading-[1.06] tracking-tight text-white/90 sm:max-w-[18rem] sm:text-[0.92rem]">
        <span className="block">Boostez votre présence</span>
        <span className="block">grâce à notre solution innovante</span>
      </h3>
      <p className="mx-auto mt-1.5 max-w-[13.5rem] text-[0.5rem] leading-snug text-white/55 sm:mt-2 sm:max-w-[15rem] sm:text-[0.56rem] sm:leading-relaxed">
        Une plateforme tout-en-un pour accompagner les entreprises dans leur transformation digitale au quotidien.
      </p>
      <MiniHeroUrlBar />
    </div>
  );
}

function BadgeCheck() {
  return (
    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#22c55e] sm:h-9 sm:w-9" aria-hidden>
      <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4 text-white sm:h-[18px] sm:w-[18px]">
        <path
          d="M20 6L9 17l-5-5"
          stroke="currentColor"
          strokeWidth="3.25"
          strokeLinecap="round"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
    </div>
  );
}

function BadgeCross() {
  return (
    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#ef4444] sm:h-9 sm:w-9" aria-hidden>
      <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4 text-white sm:h-[18px] sm:w-[18px]">
        <path
          d="M18 6L6 18M6 6l12 12"
          stroke="currentColor"
          strokeWidth="3.25"
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
    </div>
  );
}

export default function LandingHeroSafariComparison() {
  return (
    <div className="grid grid-cols-2 gap-2.5 sm:gap-4 md:gap-5">
      <div className="flex min-w-0 flex-col items-center gap-2 sm:gap-2.5">
        <DarkSafariFrame>
          <MiniHeroGood />
        </DarkSafariFrame>
        <BadgeCheck />
      </div>
      <div className="flex min-w-0 flex-col items-center gap-2 sm:gap-2.5">
        <DarkSafariFrame>
          <MiniHeroBad />
        </DarkSafariFrame>
        <BadgeCross />
      </div>
    </div>
  );
}

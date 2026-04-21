'use client';

import { useEffect, useMemo, useRef, type CSSProperties } from 'react';
import Link from 'next/link';
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useTransform,
  type MotionValue,
} from 'framer-motion';
import SiteFooter from '@/app/components/site-footer';
import SiteHeader from '@/app/components/site-header';
import type { MoneyPageData } from '@/app/lib/money-pages-content';

type SectionKey = 'intro' | 'measure' | 'report' | 'why' | 'faq';
type ChapterLayout = 'split' | 'headline' | 'report' | 'stack' | 'faq';
type SceneKind = 'mesh' | 'moneyPage1' | 'scan' | 'ledger' | 'signal' | 'strips';
type Tone = 'light' | 'dark';

type PageTheme = {
  heroDescription: string;
  statementTitleLines: [string, string];
  statementBody: string;
  statementGradient: string;
  accents: [string, string, string];
  finalSurface: string;
  finalTone: Tone;
  finalTitle: string;
  finalBody: string;
};

type Chapter = {
  key: SectionKey;
  eyebrow: string;
  title: string;
  paragraphs?: string[];
  bullets?: string[];
  faqs?: MoneyPageData['faqs'];
  layout: ChapterLayout;
  scene: SceneKind;
  bg: string;
  nextBg: string;
  tone: Tone;
};

function premiumEase(value: number) {
  if (value < 0.4) {
    // Sine ease-in for first 40% — gentle acceleration
    return (1 - Math.cos((value / 0.4) * (Math.PI / 2))) * 0.5;
  }
  // Cubic ease-out for remaining 60% — long, smooth deceleration
  const t = (value - 0.4) / 0.6;
  return 0.5 + (1 - Math.pow(1 - t, 3)) * 0.5;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

const PAGE_THEMES: Record<MoneyPageData['slug'], PageTheme> = {
  'audit-visibilite-ia': {
    heroDescription:
      'Mesurez votre présence dans ChatGPT, Claude et Perplexity avec un rapport clair, priorisé et sans abonnement.',
    statementTitleLines: ['La visibilité IA', 'ne se lit plus au hasard.'],
    statementBody:
      'Une marque peut sembler présente, puis disparaître sur les requêtes qui comptent vraiment. Qory remet cette lecture au propre.',
    statementGradient: 'linear-gradient(135deg, #ff6a3d 0%, #9f47ff 50%, #39b9ff 100%)',
    accents: ['#4BA7F5', '#7C3AED', '#FF6A3D'],
    finalSurface: '#4BA7F5',
    finalTone: 'dark',
    finalTitle: 'Passez d’une intuition floue à un plan lisible.',
    finalBody:
      'Un seul rapport pour voir ce que les IA retiennent déjà, ce qu’elles comprennent mal, et ce qu’il faut clarifier ensuite.',
  },
  'chatgpt-cite-mon-site': {
    heroDescription:
      'Vérifiez si ChatGPT vous cite vraiment, sur les bonnes requêtes et avec la bonne lecture de votre activité.',
    statementTitleLines: ['Un test isolé', 'ne dit jamais toute l’histoire.'],
    statementBody:
      'ChatGPT peut vous citer une fois, puis recommander quelqu’un d’autre sur la requête suivante. Qory regarde la répétition, pas le hasard.',
    statementGradient: 'linear-gradient(135deg, #07111d 0%, #2354ff 42%, #8b35ff 100%)',
    accents: ['#4F7CFF', '#8B5CF6', '#22D3EE'],
    finalSurface: '#0F172A',
    finalTone: 'dark',
    finalTitle: 'Arrêtez de deviner si ChatGPT vous cite.',
    finalBody:
      'Qory vous montre quand votre marque ressort, comment elle est décrite et qui prend encore votre place.',
  },
  'analyse-reponses-ia': {
    heroDescription:
      'Comprenez comment les réponses IA parlent de votre entreprise, ce qu’elles retiennent vraiment et ce qui reste encore flou.',
    statementTitleLines: ['Ce que l’IA dit', 'façonne déjà la perception.'],
    statementBody:
      'Une réponse IA n’est pas seulement un résultat. C’est déjà une reformulation de votre offre, de votre crédibilité et de votre place face aux concurrents.',
    statementGradient: 'linear-gradient(135deg, #fff26b 0%, #ffb347 44%, #ff6b6b 100%)',
    accents: ['#FF8A00', '#FF4D6D', '#FFD60A'],
    finalSurface: '#FFF26B',
    finalTone: 'light',
    finalTitle: 'Lisez enfin ce que les réponses IA racontent vraiment de vous.',
    finalBody:
      'Qory aide à passer d’un texte généré à une lecture claire: ce qui vous aide, ce qui vous affaiblit, et ce qu’il faut corriger.',
  },
};

function buildChapters(page: MoneyPageData, finalSurface: string): Chapter[] {
  return [
    {
      key: 'intro',
      eyebrow: page.eyebrow,
      title: page.eyebrow,
      paragraphs: page.intro,
      layout: 'split',
      scene: 'moneyPage1',
      bg: '#FFFFFF',
      nextBg: '#05070D',
      tone: 'light',
    },
    {
      key: 'measure',
      eyebrow: 'Ce que Qory regarde',
      title: page.measureTitle,
      bullets: page.measureItems,
      layout: 'headline',
      scene: 'scan',
      bg: '#05070D',
      nextBg: '#F5F5F7',
      tone: 'dark',
    },
    {
      key: 'report',
      eyebrow: 'Le rapport',
      title: page.reportTitle,
      bullets: page.reportItems,
      layout: 'report',
      scene: 'ledger',
      bg: '#F5F5F7',
      nextBg: '#0B0B0C',
      tone: 'light',
    },
    {
      key: 'why',
      eyebrow: 'Pourquoi ça compte',
      title: page.whyTitle,
      bullets: page.whyItems,
      layout: 'stack',
      scene: 'signal',
      bg: '#0B0B0C',
      nextBg: '#000000',
      tone: 'dark',
    },
    {
      key: 'faq',
      eyebrow: 'Questions fréquentes',
      title: 'Ce qu’il faut savoir avant de lancer votre audit',
      faqs: page.faqs,
      layout: 'faq',
      scene: 'strips',
      bg: '#000000',
      nextBg: finalSurface,
      tone: 'dark',
    },
  ];
}

function toneClasses(tone: Tone) {
  return tone === 'dark'
    ? {
        title: 'text-white',
        body: 'text-white/[0.75]',
        border: 'border-white/[0.12]',
        number: 'bg-white/10 text-white',
      }
    : {
        title: 'text-[#1D1D1F]',
        body: 'text-[#4A4A52]',
        border: 'border-black/10',
        number: 'bg-[#ECF4FF] text-[#4BA7F5]',
      };
}

function ChapterBackdrop({
  progress,
  bg,
  nextBg,
}: {
  progress: MotionValue<number>;
  bg: string;
  nextBg: string;
}) {
  const reduceMotion = useReducedMotion();
  const revealHeight = useTransform(
    progress,
    [0, 0.72, 1],
    reduceMotion
      ? ['100%', '100%', '100%']
      : ['0%', '0%', '100%']
  );

  return (
    <>
      <div className="absolute inset-0 z-0" style={{ backgroundColor: bg }} />
      <motion.div
        className="pointer-events-none absolute inset-x-0 bottom-0 z-20"
        style={{
          backgroundColor: nextBg,
          height: revealHeight,
        }}
        aria-hidden
      />
    </>
  );
}

function HeroSection({ page }: { page: MoneyPageData }) {
  const reduceMotion = useReducedMotion();
  const ref = useRef<HTMLElement | null>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end start'],
  });
  const contentY = useTransform(scrollYProgress, [0, 1], reduceMotion ? [0, 0] : [0, -42]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.85, 1], [1, 1, 0.35]);

  return (
    <section
      ref={ref}
      className="relative flex min-h-svh flex-col items-center justify-center bg-black px-6 pb-[5.25rem] pt-[5.25rem] text-white sm:px-10 sm:pb-24 sm:pt-24 md:pb-28 md:pt-28 lg:px-16"
    >
      <motion.div
        className="relative mx-auto flex w-full max-w-5xl flex-col items-center justify-center text-center"
        style={{ y: contentY, opacity: contentOpacity }}
      >
        <img
          src="/logo.svg"
          alt="Qory"
          className="mx-auto mb-8 h-[4rem] w-[4rem] brightness-0 invert sm:h-[4.6rem] sm:w-[4.6rem]"
        />
        <h1 className="max-w-5xl text-balance text-[3rem] font-semibold leading-[0.96] tracking-tight sm:text-[4.35rem] lg:text-[5.5rem]">
          {page.title}
        </h1>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3 sm:mt-8">
          <Link
            href="/audit"
            className="inline-flex h-14 items-center justify-center rounded-full bg-white px-7 text-base font-semibold text-black transition-colors duration-300 hover:bg-[#F2F2F2]"
          >
            {page.ctaLabel}
          </Link>
          <Link
            href="/tarifs"
            className="inline-flex h-14 items-center justify-center rounded-full border border-white/[0.14] px-7 text-base font-semibold text-white transition-colors hover:bg-white/[0.08]"
          >
            Voir les tarifs
          </Link>
        </div>
      </motion.div>
    </section>
  );
}

function StatementSection({ theme }: { theme: PageTheme }) {
  const reduceMotion = useReducedMotion();
  const ref = useRef<HTMLElement | null>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end end'],
  });
  const stageScale = useTransform(scrollYProgress, [0, 0.55, 1], reduceMotion ? [1, 1, 1] : [0.94, 1, 1]);
  const stageY = useTransform(scrollYProgress, [0, 0.55, 1], reduceMotion ? [0, 0, 0] : [90, 0, 0]);
  const titleY = useTransform(scrollYProgress, [0, 0.55, 1], reduceMotion ? [0, 0, 0] : [70, 0, 0]);
  const maskClip = useTransform(
    scrollYProgress,
    [0, 0.55, 1],
    reduceMotion
      ? ['inset(0% 0% 0% 0%)', 'inset(0% 0% 0% 0%)', 'inset(0% 0% 0% 0%)']
      : ['inset(14% 0% 14% 0%)', 'inset(0% 0% 0% 0%)', 'inset(0% 0% 0% 0%)']
  );

  return (
    <section
      ref={ref}
      className="relative h-[200svh]"
      style={{ background: theme.statementGradient }}
    >
      <div className="sticky top-0 h-screen overflow-hidden">
        <div
          className="absolute inset-0"
          style={{
            background: theme.statementGradient,
          }}
        />
        <motion.div
          className="absolute inset-[-4%]"
          style={{
            background: theme.statementGradient,
            scale: stageScale,
            y: stageY,
            clipPath: maskClip,
          }}
        />
        <motion.div
          className="relative z-10 flex h-full flex-col items-center justify-center px-6 text-center text-white sm:px-10 lg:px-16"
          style={{ y: titleY }}
        >
          <h2 className="text-balance text-[3.1rem] font-semibold leading-[0.94] tracking-tight sm:text-[4.7rem] lg:text-[6rem]">
            <span className="block">{theme.statementTitleLines[0]}</span>
            <span className="block">{theme.statementTitleLines[1]}</span>
          </h2>
        </motion.div>
      </div>
    </section>
  );
}

function StaticSceneAsset({
  src,
  alt,
  wrapperClassName,
  imageClassName,
  imageStyle,
}: {
  src: string;
  alt: string;
  wrapperClassName?: string;
  imageClassName?: string;
  imageStyle?: CSSProperties;
}) {
  return (
    <div className={`relative h-full w-full overflow-hidden ${wrapperClassName ?? ''}`}>
      <img
        src={src}
        alt={alt}
        className={`h-full w-full object-cover ${imageClassName ?? ''}`}
        style={imageStyle}
        draggable={false}
      />
    </div>
  );
}

function MeshScene({ accents: _accents }: { accents: PageTheme['accents'] }) {
  return (
    <StaticSceneAsset
      src="/money-pages/scene-intro-network.svg"
      alt="Schema editorial plat montrant plusieurs sources qui convergent vers une lecture unique."
      wrapperClassName="bg-[#17171A]"
      imageClassName="object-contain object-center"
    />
  );
}

function MoneyPageOneScene({
  accents: _accents,
  progress,
}: {
  accents: PageTheme['accents'];
  progress?: MotionValue<number>;
}) {
  const sceneProgress = useMotionValue(progress ? 0 : 1);

  useEffect(() => {
    if (!progress) {
      sceneProgress.set(1);
      return;
    }

    let frame = 0;
    let startTime: number | null = null;
    let isRunning = false;
    let hasCompleted = false;

    const stop = () => {
      if (frame) {
        cancelAnimationFrame(frame);
        frame = 0;
      }
      startTime = null;
      isRunning = false;
    };

    const step = (now: number) => {
      if (startTime === null) {
        startTime = now;
      }

      const elapsed = now - startTime;
      const normalized = clamp(elapsed / 3400, 0, 1);
      sceneProgress.set(premiumEase(normalized));

      if (normalized < 1) {
        frame = requestAnimationFrame(step);
        return;
      }

      frame = 0;
      isRunning = false;
      hasCompleted = true;
      sceneProgress.set(1);
    };

    const maybeStart = (value: number) => {
      if (value <= 0.04) {
        stop();
        hasCompleted = false;
        sceneProgress.set(0);
        return;
      }

      if (value >= 0.12 && !isRunning && !hasCompleted) {
        isRunning = true;
        frame = requestAnimationFrame(step);
      }
    };

    maybeStart(progress.get());
    const unsubscribe = progress.on('change', maybeStart);

    return () => {
      unsubscribe();
      stop();
    };
  }, [progress, sceneProgress]);

  const frameScale = useTransform(sceneProgress, [0.04, 0.16], [0.92, 1]);
  const frameOpacity = useTransform(sceneProgress, [0, 0.08], [0.6, 1]);
  const lineTopLeft = useTransform(sceneProgress, [0.14, 0.28], [0, 1]);
  const lineTopRight = useTransform(sceneProgress, [0.18, 0.32], [0, 1]);
  const lineBottomLeft = useTransform(sceneProgress, [0.22, 0.36], [0, 1]);
  const lineBottomRight = useTransform(sceneProgress, [0.26, 0.4], [0, 1]);
  const logoTopLeftOpacity = useTransform(sceneProgress, [0.26, 0.38], [0, 1]);
  const logoTopRightOpacity = useTransform(sceneProgress, [0.3, 0.42], [0, 1]);
  const logoBottomLeftOpacity = useTransform(sceneProgress, [0.34, 0.46], [0, 1]);
  const logoBottomRightOpacity = useTransform(sceneProgress, [0.38, 0.5], [0, 1]);
  const logoTopLeftScale = useTransform(sceneProgress, [0.26, 0.38], [0.82, 1]);
  const logoTopRightScale = useTransform(sceneProgress, [0.3, 0.42], [0.82, 1]);
  const logoBottomLeftScale = useTransform(sceneProgress, [0.34, 0.46], [0.82, 1]);
  const logoBottomRightScale = useTransform(sceneProgress, [0.38, 0.5], [0.82, 1]);

  return (
    <div className="relative h-full w-full overflow-hidden bg-[#17171A]">
      <motion.svg viewBox="0 0 760 760" preserveAspectRatio="none" className="absolute inset-0 h-full w-full" aria-hidden="true">
        <motion.path
          d="M332 328V118H136"
          fill="none"
          stroke="#4BA7F5"
          strokeWidth="20"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ pathLength: lineTopLeft, opacity: lineTopLeft }}
        />
        <motion.path
          d="M428 328V118H624"
          fill="none"
          stroke="#4BA7F5"
          strokeWidth="20"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ pathLength: lineTopRight, opacity: lineTopRight }}
        />
        <motion.path
          d="M332 432V642H136"
          fill="none"
          stroke="#4BA7F5"
          strokeWidth="20"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ pathLength: lineBottomLeft, opacity: lineBottomLeft }}
        />
        <motion.path
          d="M428 432V642H624"
          fill="none"
          stroke="#4BA7F5"
          strokeWidth="20"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ pathLength: lineBottomRight, opacity: lineBottomRight }}
        />
      </motion.svg>

      <div className="absolute inset-0 z-10 flex items-center justify-center">
        <motion.div
          className="flex h-[15.5rem] w-[15.5rem] items-center justify-center rounded-[3.25rem] bg-[#F7F4ED] sm:h-[17rem] sm:w-[17rem] lg:h-[18rem] lg:w-[18rem]"
          style={{ scale: frameScale, opacity: frameOpacity }}
        >
          <img src="/logo.svg" alt="" className="h-[64%] w-[64%]" draggable={false} />
        </motion.div>
      </div>

      <div className="absolute left-[17.9%] top-[15.5%] z-20 -translate-x-1/2 -translate-y-1/2">
        <motion.div
          className="flex h-16 w-16 items-center justify-center rounded-[1.1rem] bg-[#B76439] sm:h-[4.5rem] sm:w-[4.5rem]"
          style={{ opacity: logoTopLeftOpacity, scale: logoTopLeftScale }}
        >
          <img src="/claude.svg" alt="" className="h-11 w-11 brightness-0 invert sm:h-12 sm:w-12" draggable={false} />
        </motion.div>
      </div>

      <div className="absolute left-[82.1%] top-[15.5%] z-20 -translate-x-1/2 -translate-y-1/2">
        <motion.div
          className="flex h-16 w-16 items-center justify-center rounded-[1.1rem] bg-white sm:h-[4.5rem] sm:w-[4.5rem]"
          style={{ opacity: logoTopRightOpacity, scale: logoTopRightScale }}
        >
          <img src="/google.svg" alt="" className="h-11 w-11 sm:h-12 sm:w-12" draggable={false} />
        </motion.div>
      </div>

      <div className="absolute left-[17.9%] top-[84.5%] z-20 -translate-x-1/2 -translate-y-1/2">
        <motion.div
          className="flex h-16 w-16 items-center justify-center rounded-[1.1rem] bg-white sm:h-[4.5rem] sm:w-[4.5rem]"
          style={{ opacity: logoBottomLeftOpacity, scale: logoBottomLeftScale }}
        >
          <img src="/openai.svg" alt="" className="h-11 w-11 sm:h-12 sm:w-12" draggable={false} />
        </motion.div>
      </div>

      <div className="absolute left-[82.1%] top-[84.5%] z-20 -translate-x-1/2 -translate-y-1/2">
        <motion.div
          className="flex h-16 w-16 items-center justify-center rounded-[1.1rem] bg-black sm:h-[4.5rem] sm:w-[4.5rem]"
          style={{ opacity: logoBottomRightOpacity, scale: logoBottomRightScale }}
        >
          <img src="/perplexity.svg" alt="" className="h-11 w-11 brightness-0 invert sm:h-12 sm:w-12" draggable={false} />
        </motion.div>
      </div>
    </div>
  );
}

function ScanScene({ accents: _accents }: { accents: PageTheme['accents'] }) {
  return (
    <div className="relative h-full w-full overflow-hidden bg-[#17171A]">
      <img
        src="/money-pages/office-hands.jpg"
        alt="Mains en reunion autour d'un bureau pour illustrer l'analyse des signaux et des echanges."
        className="h-full w-full object-cover object-center"
        draggable={false}
      />
    </div>
  );
}

function LedgerScene({ accents: _accents }: { accents: PageTheme['accents'] }) {
  return (
    <div className="relative h-full w-full overflow-hidden bg-[#E6E1D7]" aria-hidden="true">
      <div className="absolute inset-x-[10%] top-[9%] bottom-[6%]">
        <img
          src="/money-pages/scene-report-reading.svg"
          alt="Composition de trois cartes flottantes avec liste, histogramme et score 43 sur 100."
          className="h-full w-full object-contain object-center"
          draggable={false}
        />

        <div className="absolute left-[74.35%] top-[73.9%] -translate-x-1/2 -translate-y-1/2">
          <div className="absolute inset-x-[-10%] inset-y-[-18%] rounded-[1.4rem] bg-[#F7F4ED]" />
          <div className="relative text-center text-[2.15rem] font-semibold leading-none tracking-tight text-[#FBBC05] sm:text-[2.75rem] lg:text-[2.95rem]">
            43/100
          </div>
        </div>
      </div>
    </div>
  );
}

function SignalScene({ accents }: { accents: PageTheme['accents'] }) {
  const [a, b, c] = accents;

  return (
    <div className="relative h-full w-full overflow-hidden bg-[#06080D]">
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.04)_0%,rgba(255,255,255,0)_28%)]" />
      <svg viewBox="0 0 1200 900" className="absolute inset-0 h-full w-full">
        <defs>
          <linearGradient id="signalGradA" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor={a} stopOpacity="0.95" />
            <stop offset="100%" stopColor={a} stopOpacity="0" />
          </linearGradient>
          <linearGradient id="signalGradB" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor={b} stopOpacity="0.95" />
            <stop offset="100%" stopColor={b} stopOpacity="0" />
          </linearGradient>
          <linearGradient id="signalGradC" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor={c} stopOpacity="0.95" />
            <stop offset="100%" stopColor={c} stopOpacity="0" />
          </linearGradient>
        </defs>
        <rect x="150" y="320" width="90" height="430" fill="url(#signalGradA)" />
        <rect x="314" y="220" width="90" height="530" fill="url(#signalGradB)" />
        <rect x="478" y="410" width="90" height="340" fill="url(#signalGradC)" />
        <rect x="642" y="280" width="90" height="470" fill="url(#signalGradA)" />
        <rect x="806" y="180" width="90" height="570" fill="url(#signalGradB)" />
        <rect x="970" y="350" width="90" height="400" fill="url(#signalGradC)" />
        <path d="M110 650 C 280 620 360 430 510 460 S 790 760 1090 290" fill="none" stroke="#FFFFFF" strokeOpacity="0.55" strokeWidth="4" />
        <path d="M110 710 C 250 580 350 590 460 520 S 790 420 1080 520" fill="none" stroke={a} strokeOpacity="0.65" strokeWidth="3" />
      </svg>
    </div>
  );
}

function StripsScene({ accents: _accents }: { accents: PageTheme['accents'] }) {
  return (
    <StaticSceneAsset
      src="/money-pages/scene-faq-bars.svg"
      alt="Serie de cartes de questions simplifiees dans une composition horizontale."
      wrapperClassName="bg-[#111214]"
      imageClassName="object-contain object-center"
    />
  );
}

function SceneCanvas({
  scene,
  accents,
  progress,
}: {
  scene: SceneKind;
  accents: PageTheme['accents'];
  progress?: MotionValue<number>;
}) {
  if (scene === 'moneyPage1') return <MoneyPageOneScene accents={accents} progress={progress} />;
  if (scene === 'scan') return <ScanScene accents={accents} />;
  if (scene === 'ledger') return <LedgerScene accents={accents} />;
  if (scene === 'signal') return <SignalScene accents={accents} />;
  if (scene === 'strips') return <StripsScene accents={accents} />;
  return <MeshScene accents={accents} />;
}

function SplitChapter({
  chapter,
  accents,
}: {
  chapter: Chapter;
  accents: PageTheme['accents'];
}) {
  const reduceMotion = useReducedMotion();
  const ref = useRef<HTMLElement | null>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });
  const textMotion = useTransform(scrollYProgress, [0.1, 0.65, 0.92], reduceMotion ? [0, 0, 0] : [80, 0, -24]);
  const visualMotion = useTransform(scrollYProgress, [0.1, 0.65, 0.92], reduceMotion ? [0, 0, 0] : [110, 0, -42]);
  const moneyPageSceneMask = useTransform(
    scrollYProgress,
    [0.06, 0.28, 0.42],
    reduceMotion
      ? ['inset(0% 0% 0% 0%)', 'inset(0% 0% 0% 0%)', 'inset(0% 0% 0% 0%)']
      : ['inset(12% 0% 12% 0%)', 'inset(2% 0% 2% 0%)', 'inset(0% 0% 0% 0%)']
  );
  const classes = toneClasses(chapter.tone);
  const hasMoneyPageScene = chapter.scene === 'moneyPage1';
  const visualFrameClassName = chapter.scene === 'moneyPage1' ? 'absolute inset-0' : 'absolute inset-0 py-4 lg:px-4 lg:py-8';

  return (
    <section
      ref={ref}
      className="relative h-[200svh]"
      style={{ backgroundColor: chapter.bg }}
    >
      <div className="sticky top-0 h-screen overflow-hidden">
        <ChapterBackdrop progress={scrollYProgress} bg={chapter.bg} nextBg={chapter.nextBg} />
        <div className="relative z-10 grid h-full lg:grid-cols-[0.95fr_1.05fr]">
          <motion.div className="flex items-center px-6 py-16 sm:px-10 lg:px-16" style={{ y: textMotion }}>
            <div className="max-w-2xl">
              <h2 className={`text-balance text-[2.5rem] font-semibold leading-[0.98] tracking-tight sm:text-[4rem] lg:text-[4.75rem] ${classes.title}`}>
                {chapter.title}
              </h2>
              <div className={`mt-7 space-y-5 text-lg leading-relaxed sm:text-xl ${classes.body}`}>
                {chapter.paragraphs?.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
              </div>
            </div>
          </motion.div>
          <div className="relative h-[42svh] overflow-hidden sm:h-[46svh] lg:h-full">
            {hasMoneyPageScene ? (
              <motion.div
                className="absolute inset-0 bg-[#17171A]"
                style={{ clipPath: moneyPageSceneMask }}
              />
            ) : null}
            <motion.div className={visualFrameClassName} style={{ y: visualMotion }}>
              <div className="h-full">
                <SceneCanvas scene={chapter.scene} accents={accents} progress={scrollYProgress} />
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}

function HeadlineChapter({
  chapter,
  accents,
}: {
  chapter: Chapter;
  accents: PageTheme['accents'];
}) {
  const reduceMotion = useReducedMotion();
  const ref = useRef<HTMLElement | null>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });
  const titleY = useTransform(scrollYProgress, [0.1, 0.65, 0.92], reduceMotion ? [0, 0, 0] : [60, 0, -30]);
  const visualY = useTransform(scrollYProgress, [0.1, 0.65, 0.92], reduceMotion ? [0, 0, 0] : [80, 0, -40]);
  const lineScale = useTransform(scrollYProgress, [0.2, 0.65], [0, 1]);
  const classes = toneClasses(chapter.tone);
  const visualFrameClassName = chapter.scene === 'scan'
    ? 'absolute inset-x-0 top-0 -bottom-10 lg:-bottom-14'
    : 'absolute inset-0 py-4 lg:px-4 lg:py-8';

  return (
    <section
      ref={ref}
      className="relative h-[200svh]"
      style={{ backgroundColor: chapter.bg }}
    >
      <div className="sticky top-0 h-screen overflow-hidden">
        <ChapterBackdrop progress={scrollYProgress} bg={chapter.bg} nextBg={chapter.nextBg} />
        <div className="relative z-10 flex h-full flex-col">
          <motion.div className="px-6 pt-16 sm:px-10 lg:px-16 lg:pt-20" style={{ y: titleY }}>
            <h2 className={`max-w-5xl text-balance text-[2.75rem] font-semibold leading-[0.96] tracking-tight sm:text-[4.5rem] lg:text-[5.25rem] ${classes.title}`}>
              {chapter.title}
            </h2>
            <motion.div className="mt-7 h-[3px] w-28 origin-left bg-[#4BA7F5]" style={{ scaleX: lineScale }} />
          </motion.div>

          <div className="grid flex-1 lg:grid-cols-[0.72fr_1.28fr]">
            <div className="flex items-end px-6 pb-12 pt-10 sm:px-10 lg:px-16 lg:pb-16">
              <div className="space-y-5">
                {chapter.bullets?.map((item, index) => (
                  <div key={item} className={`border-b pb-5 ${classes.border}`}>
                    <div className="flex items-start gap-4">
                      <span className={`mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold ${classes.number}`}>
                        {index + 1}
                      </span>
                      <p className={`text-lg leading-relaxed sm:text-xl ${classes.body}`}>{item}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative h-[40svh] overflow-hidden sm:h-[44svh] lg:h-full">
              <motion.div className={visualFrameClassName} style={{ y: visualY }}>
                <div className="h-full">
                  <SceneCanvas scene={chapter.scene} accents={accents} />
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function ReportChapter({
  chapter,
  accents,
}: {
  chapter: Chapter;
  accents: PageTheme['accents'];
}) {
  const reduceMotion = useReducedMotion();
  const ref = useRef<HTMLElement | null>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });
  const textY = useTransform(scrollYProgress, [0.1, 0.65, 0.92], reduceMotion ? [0, 0, 0] : [84, 0, -28]);
  const visualScale = useTransform(scrollYProgress, [0.1, 0.65, 0.92], reduceMotion ? [1, 1, 1] : [1.02, 1, 1]);
  const classes = toneClasses(chapter.tone);

  return (
    <section
      ref={ref}
      className="relative h-[200svh]"
      style={{ backgroundColor: chapter.bg }}
    >
      <div className="sticky top-0 h-screen overflow-hidden">
        <ChapterBackdrop progress={scrollYProgress} bg={chapter.bg} nextBg={chapter.nextBg} />
        <div className="relative z-10 grid h-full lg:grid-cols-[1.18fr_0.82fr]">
          <motion.div className="order-2 flex items-stretch overflow-hidden bg-[#E6E1D7] px-0 pb-0 pt-0 sm:px-0 lg:order-1 lg:px-0" style={{ scale: visualScale }}>
            <div className="h-[52svh] w-full lg:h-full">
              <SceneCanvas scene={chapter.scene} accents={accents} />
            </div>
          </motion.div>
          <motion.div className="order-1 flex items-start px-6 pb-10 pt-12 sm:px-10 lg:order-2 lg:px-10 lg:pb-14 lg:pt-16" style={{ y: textY }}>
            <div className="max-w-[28.5rem]">
              <h2 className={`text-balance text-[2.5rem] font-semibold leading-[0.98] tracking-tight sm:text-[4rem] lg:text-[4.15rem] ${classes.title}`}>
                {chapter.title}
              </h2>
              <div className="mt-7 space-y-4 lg:mt-8">
                {chapter.bullets?.map((item, index) => (
                  <div key={item} className={`border-b pb-5 ${classes.border}`}>
                    <div className="flex items-start gap-4">
                      <span className={`mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold ${classes.number}`}>
                        {index + 1}
                      </span>
                      <p className={`text-lg leading-relaxed sm:text-xl ${classes.body}`}>{item}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function StackChapter({
  chapter,
  accents: _accents,
}: {
  chapter: Chapter;
  accents: PageTheme['accents'];
}) {
  const reduceMotion = useReducedMotion();
  const ref = useRef<HTMLElement | null>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });
  const textY = useTransform(scrollYProgress, [0.1, 0.65, 0.92], reduceMotion ? [0, 0, 0] : [80, 0, -18]);
  const classes = toneClasses(chapter.tone);

  return (
    <section
      ref={ref}
      className="relative h-[200svh]"
      style={{ backgroundColor: chapter.bg }}
    >
      <div className="sticky top-0 h-screen overflow-hidden">
        <ChapterBackdrop progress={scrollYProgress} bg={chapter.bg} nextBg={chapter.nextBg} />
        <motion.div className="relative z-10 flex h-full items-center px-6 py-12 sm:px-10 lg:px-16" style={{ y: textY }}>
          <div className="grid w-full gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:gap-16">
            <div>
              <h2 className={`text-balance text-[2.55rem] font-semibold leading-[0.98] tracking-tight sm:text-[4.15rem] lg:text-[4.75rem] ${classes.title}`}>
                {chapter.title}
              </h2>
            </div>
            <div className="space-y-5">
              {chapter.bullets?.map((item, index) => (
                <div key={item} className={`border-b pb-5 ${classes.border}`}>
                  <div className="flex items-start gap-4">
                    <span className={`mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold ${classes.number}`}>
                      {index + 1}
                    </span>
                    <p className={`text-lg leading-relaxed sm:text-xl ${classes.body}`}>{item}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function FaqSection({
  chapter,
  accents: _accents,
}: {
  chapter: Chapter;
  accents: PageTheme['accents'];
}) {
  const reduceMotion = useReducedMotion();
  const ref = useRef<HTMLElement | null>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });
  const leftY = useTransform(scrollYProgress, [0.1, 0.65, 0.92], reduceMotion ? [0, 0, 0] : [60, 0, -20]);
  const rightY = useTransform(scrollYProgress, [0.1, 0.65, 0.92], reduceMotion ? [0, 0, 0] : [80, 0, -30]);
  const classes = toneClasses(chapter.tone);

  return (
    <section
      ref={ref}
      className="relative h-[200svh]"
      style={{ backgroundColor: chapter.bg }}
    >
      <div className="sticky top-0 h-screen overflow-hidden">
        <ChapterBackdrop progress={scrollYProgress} bg={chapter.bg} nextBg={chapter.nextBg} />
        <div className="relative z-10 grid h-full lg:grid-cols-[0.84fr_1.16fr] lg:gap-6">
          <motion.div className="flex items-center px-6 py-16 sm:px-10 lg:px-16" style={{ y: leftY }}>
            <div className="max-w-[31rem]">
              <h2 className={`text-balance text-[2.7rem] font-semibold leading-[0.96] tracking-tight sm:text-[4.25rem] lg:text-[4.85rem] ${classes.title}`}>
                {chapter.title}
              </h2>
            </div>
          </motion.div>

          <motion.div className="flex items-center px-6 py-14 sm:px-10 lg:px-14" style={{ y: rightY }}>
            <div className="w-full max-w-[46rem] space-y-7">
              {chapter.faqs?.map((faq) => (
                <div key={faq.question} className={`border-b pb-6 ${classes.border}`}>
                  <h3 className={`max-w-[44rem] text-lg font-semibold leading-tight sm:text-xl lg:text-[1.7rem] lg:leading-[1.18] ${classes.title}`}>
                    {faq.question}
                  </h3>
                  <p className={`mt-3 max-w-[44rem] text-base leading-relaxed sm:text-lg lg:text-[1.18rem] lg:leading-[1.7] ${classes.body}`}>
                    {faq.answer}
                  </p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function FinalCtaSection({
  page,
  theme,
}: {
  page: MoneyPageData;
  theme: PageTheme;
}) {
  const isDarkSurface = theme.finalTone === 'dark';
  const finalTitleClass = isDarkSurface ? 'text-white' : 'text-[#111111]';
  const secondaryButtonClass = isDarkSurface
    ? 'border-white/[0.14] text-white hover:bg-white/[0.08]'
    : 'border-black/[0.12] text-[#111111] hover:bg-white/70';
  const secondaryButtonSurface = isDarkSurface ? '' : ' bg-white/40';

  return (
    <section className="relative min-h-[100svh] cv-auto" style={{ backgroundColor: theme.finalSurface }}>
      <div className="flex min-h-[100svh] items-center justify-center px-6 sm:px-10 lg:px-16">
        <div className="mx-auto max-w-5xl text-center">
          <h2 className={`text-balance text-[3rem] font-semibold leading-[0.94] tracking-tight sm:text-[4.5rem] lg:text-[5.35rem] ${finalTitleClass}`}>
            {theme.finalTitle}
          </h2>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3 sm:mt-10">
            <Link
              href="/audit"
              className={`inline-flex h-14 items-center justify-center rounded-full px-7 text-base font-semibold transition-colors duration-300 ${
                isDarkSurface ? 'bg-white text-black hover:bg-[#F2F2F2]' : 'bg-black text-white hover:bg-[#1A1A1A]'
              }`}
            >
              {page.ctaLabel}
            </Link>
            <Link
              href="/tarifs"
              className={`inline-flex h-14 items-center justify-center rounded-full border px-7 text-base font-semibold transition-colors ${secondaryButtonClass}${secondaryButtonSurface}`}
            >
              Voir les tarifs
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function MoneyPageExperience({ page }: { page: MoneyPageData }) {
  const theme = PAGE_THEMES[page.slug];
  const chapters = useMemo(() => buildChapters(page, theme.finalSurface), [page, theme.finalSurface]);

  return (
    <main className="site-grid-bg min-h-screen overscroll-x-none">
      <SiteHeader variant="dark" position="fixed" landingMinimal />
      <HeroSection page={page} />
      <StatementSection theme={theme} />
      <SplitChapter chapter={chapters[0]} accents={theme.accents} />
      <HeadlineChapter chapter={chapters[1]} accents={theme.accents} />
      <ReportChapter chapter={chapters[2]} accents={theme.accents} />
      <StackChapter chapter={chapters[3]} accents={theme.accents} />
      <FaqSection chapter={chapters[4]} accents={theme.accents} />
      <FinalCtaSection page={page} theme={theme} />
      <div>
        <SiteFooter className="relative mt-0 rounded-none bg-[#121418] px-4 pb-10 pt-12 text-white sm:px-6 sm:pb-12 sm:pt-14 md:pb-16 md:pt-16" />
      </div>
    </main>
  );
}

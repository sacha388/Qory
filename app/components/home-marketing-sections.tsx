'use client';

import { useEffect, useRef, useState, type FormEvent, type ReactNode } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
  type MotionValue,
} from 'framer-motion';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  AiBrain01Icon,
  Alert02Icon,
  ChartBarLineIcon,
  CheckListIcon,
  FileChartColumnIncreasingIcon,
  Globe02Icon,
  Link01Icon,
  Target02Icon,
} from '@hugeicons/core-free-icons';
import SiteFooter from './site-footer';
import {
  MethodeShapeFace,
  type MethodeLectureBlock,
} from '@/app/components/methode-lecture-shapes';
import {
  TitleDecoPill,
  TitleDecoScribble,
  REPORT_DECO_BLUE,
  REPORT_DECO_CORAL,
  REPORT_DECO_GREEN,
} from './title-deco';
import { PAID_SCAN_TYPE_OPTIONS } from '@/lib/scanner/paid-scan-catalog';
import { TypeOptionIcon } from '@/app/components/paid-scan-questionnaire-icons';
import {
  PREMIUM_CCM_TITLE_BOTTOM_BY_SECTION,
  premiumStaticPages,
} from '@/app/lib/premium-static-pages-content';

/* ═══════════════════════════════════════════════════
   Constants
   ═══════════════════════════════════════════════════ */

type Tone = 'light' | 'dark';

/** Ligne 1px entre fonds sur mobile — plus fiable que `border-t` (contraste faible #121418 ↔ noir + purge JIT). */
function MobileSectionBgHairline() {
  return <div className="h-px w-full shrink-0 bg-white/[0.22]" aria-hidden />;
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

/* ═══════════════════════════════════════════════════
   Data
   ═══════════════════════════════════════════════════ */

const problemAnglesItems = [
  {
    title: 'Invisible.',
    body: 'Votre site existe, mais les IA ne le citent pas.',
  },
  {
    title: 'Imprécis.',
    body: 'Les IA parlent de vous, mais ce qu\u2019elles disent est flou ou faux.',
  },
  {
    title: 'Remplacé.',
    body: 'Vos concurrents prennent déjà la place dans les réponses.',
  },
] as const;

const methodeLectureBlocks: MethodeLectureBlock[] = [
  {
    title: 'Technique',
    body:
      'Nous regardons si vos pages donnent aux IA une structure claire, des contenus lisibles et des signaux techniques fiables.',
    shape: 'circle',
    color: '#4BA7F5',
  },
  {
    title: 'Factualité',
    body:
      'Nous vérifions si les IA attribuent à votre marque des informations concrètes\u00a0: adresse, téléphone, horaires, ville.',
    shape: 'triangle',
    color: '#69D33F',
  },
  {
    title: 'Visibilité',
    body:
      'Nous mesurons si votre marque ressort vraiment sur les requêtes qui comptent pour la découverte et la décision.',
    shape: 'squircle',
    color: '#F16B5D',
  },
  {
    title: 'Positionnement',
    body:
      'Nous comparons votre présence à celle des acteurs qui prennent déjà la place dans les réponses IA.',
    shape: 'pill',
    color: '#F4B43A',
  },
];

type ReportPanel = {
  key: string;
  number: string;
  label: string;
  title: string;
  /** Aligné sur la 2e ligne du titre de la section « Comment ça marche » de même famille de couleur. */
  titleColor: string;
  body: string;
  accent: string;
  surface: string;
  imageSrc: string;
  imageAlt: string;
  imageClassName?: string;
};

const reportPanels: ReportPanel[] = [
  {
    key: 'market',
    number: '01',
    label: 'Score global',
    /** Espace insécable : évite la coupure « Score » / « global » sur deux lignes. */
    title: 'Score\u00a0global',
    titleColor: PREMIUM_CCM_TITLE_BOTTOM_BY_SECTION['method-report'],
    body:
      'Un score lisible qui résume votre visibilité IA, avec le détail des piliers et ce qui fait vraiment bouger le résultat dans les réponses.',
    accent: '#69D33F',
    surface: '#69D33F',
    imageSrc: '/report-assets/carousel-score-global.svg',
    imageAlt:
      'Schema de score global : quatre piliers en barres et noyau central sur fond sombre.',
    imageClassName: 'object-cover object-center',
  },
  {
    key: 'models',
    number: '02',
    label: 'Visibilité par modèle IA',
    title: 'Modèles IA',
    titleColor: PREMIUM_CCM_TITLE_BOTTOM_BY_SECTION['method-start'],
    body:
      'Vous voyez où votre marque ressort vraiment, modèle par modèle, au lieu de tout mélanger dans une seule impression floue.',
    accent: '#4BA7F5',
    surface: '#4BA7F5',
    imageSrc: '/report-assets/models-visibility.svg',
    imageAlt:
      'Composition abstraite de trois modèles IA connectés à un score de visibilité central.',
    imageClassName: 'object-cover object-center',
  },
  {
    key: 'competitors',
    number: '03',
    label: 'Analyse concurrentielle',
    title: 'Concurrents',
    titleColor: PREMIUM_CCM_TITLE_BOTTOM_BY_SECTION['method-priority'],
    body:
      'Vous identifiez les acteurs déjà visibles dans les réponses IA et les signaux qui semblent les faire remonter avant vous.',
    accent: '#F16B5D',
    surface: '#F16B5D',
    imageSrc: '/report-assets/competitor-radar.svg',
    imageAlt:
      'Radar concurrentiel avec acteurs visibles, signaux et zones d’analyse.',
    imageClassName: 'object-cover object-center',
  },
  {
    key: 'action-plan',
    number: '04',
    label: 'Plan d’action',
    title: 'Plan d’action',
    titleColor: PREMIUM_CCM_TITLE_BOTTOM_BY_SECTION['method-pillars'],
    body:
      'Les priorités sont triées pour que le rapport serve vraiment à décider: quoi clarifier, quoi renforcer, quoi publier ensuite.',
    accent: '#F4B43A',
    surface: '#F4B43A',
    imageSrc: '/report-assets/action-plan.svg',
    imageAlt:
      'Roadmap priorisée avec étapes, jalons et corrections à mener dans l’ordre.',
    imageClassName: 'object-cover object-center',
  },
];

/** Icônes cartes « rapport » mobile (sans visuel carrousel). */
const REPORT_PANEL_MOBILE_ICONS = {
  market: ChartBarLineIcon,
  models: AiBrain01Icon,
  competitors: Target02Icon,
  'action-plan': CheckListIcon,
} as const;

/** Même principe que `AiProvidersLogosVisual` (page visibilité IA) : cadres `rounded-[22%]` + couleurs marque. */
const REPORT_CAROUSEL_LOGO_INSET = 'inset-[14%]';

/** Fond uni photobooth (Score global, Modèles IA) — sans ancien SVG décoratif. */
const REPORT_CAROUSEL_PHOTOBOOTH_FLAT_BG = '#0B0B0C';

/**
 * Visuels carrousel : Score global, Modèles IA, Concurrents (barres), Plan d’action (ligne + pastilles) ;
 * autres panneaux = SVG.
 */
function ReportCarouselPhotoboothContent({ panel }: { panel: ReportPanel }) {
  if (panel.key === 'market') {
    return (
      <div
        className="relative h-full min-h-full min-w-0 w-full"
        style={{ backgroundColor: REPORT_CAROUSEL_PHOTOBOOTH_FLAT_BG }}
      >
        <div
          className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center px-3"
          aria-hidden
        >
          <div className="flex items-baseline justify-center gap-1.5 tabular-nums sm:gap-2">
            <span
              className="font-bold leading-[0.9] tracking-[-0.04em]"
              style={{
                color: REPORT_DECO_GREEN,
                fontSize: 'clamp(4.75rem, min(28vw, 22vh), 11rem)',
              }}
            >
              72
            </span>
            <span className="font-semibold leading-none text-white/70 [font-size:clamp(1.4rem,5.5vw,3.25rem)]">
              /100
            </span>
          </div>
        </div>
      </div>
    );
  }

  if (panel.key === 'models') {
    const tiles = [
      { src: '/openai.svg?v=3', bg: '#FFFFFF', invert: false },
      { src: '/claude.svg?v=3', bg: '#C15F3C', invert: true },
      { src: '/perplexity.svg?v=3', bg: '#20808D', invert: true },
    ] as const;

    return (
      <div
        className="relative h-full min-h-full min-w-0 w-full"
        style={{ backgroundColor: REPORT_CAROUSEL_PHOTOBOOTH_FLAT_BG }}
      >
        <div
          className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center gap-[2.5%] px-[5%] py-2 sm:gap-[3%] sm:px-[6%]"
          aria-hidden
        >
          {tiles.map((tile) => (
            <div
              key={tile.src}
              className="relative aspect-square min-h-0 w-full min-w-0 max-w-[30%] flex-1 overflow-hidden rounded-[22%] shadow-[0_4px_14px_rgba(0,0,0,0.35)]"
              style={{ backgroundColor: tile.bg }}
            >
              <div className={`absolute ${REPORT_CAROUSEL_LOGO_INSET} z-0`}>
                <div className="relative h-full w-full">
                  <Image
                    src={tile.src}
                    alt=""
                    fill
                    className={`object-contain ${tile.invert ? 'brightness-0 invert' : ''}`}
                    sizes="(max-width: 768px) 28vw, 120px"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (panel.key === 'competitors') {
    const barHeightsPct = [38, 82, 54, 94] as const;
    return (
      <div
        className="relative h-full min-h-full min-w-0 w-full"
        style={{ backgroundColor: REPORT_CAROUSEL_PHOTOBOOTH_FLAT_BG }}
      >
        <div
          className="pointer-events-none absolute inset-0 z-10 flex items-end justify-center gap-[2.5%] px-[7%] pb-[12%] pt-[14%] sm:gap-[3%] sm:px-[9%] sm:pb-[14%]"
          aria-hidden
        >
          {barHeightsPct.map((pct, i) => (
            <div
              key={i}
              className="rounded-t-2xl bg-[#F16B5D] shadow-[0_6px_24px_rgba(0,0,0,0.35)] sm:rounded-t-3xl"
              style={{
                width: 'clamp(2.35rem, 16vw, 4.25rem)',
                height: `${pct}%`,
                maxHeight: 'min(68%, 15rem)',
              }}
            />
          ))}
        </div>
      </div>
    );
  }

  if (panel.key === 'action-plan') {
    const steps = 4;
    return (
      <div
        className="relative h-full min-h-full min-w-0 w-full"
        style={{ backgroundColor: REPORT_CAROUSEL_PHOTOBOOTH_FLAT_BG }}
      >
        <div
          className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center px-[6%] py-[18%] sm:px-[10%]"
          aria-hidden
        >
          <div className="relative w-full max-w-lg">
            <div
              className="absolute left-[5%] right-[5%] top-1/2 z-0 h-[0.65rem] -translate-y-1/2 rounded-full bg-white/[0.16] sm:left-[3%] sm:right-[3%] sm:h-[0.85rem]"
              aria-hidden
            />
            <div className="relative z-10 flex w-full items-center justify-between px-0">
              {Array.from({ length: steps }, (_, i) => (
                <div
                  key={i}
                  className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border-[5px] border-[#F4B43A] bg-[#F4B43A] text-lg font-bold tabular-nums text-white shadow-[0_5px_20px_rgba(0,0,0,0.45)] sm:h-[4.25rem] sm:w-[4.25rem] sm:border-[6px] sm:text-2xl"
                >
                  {i + 1}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <img
      src={panel.imageSrc}
      alt={panel.imageAlt}
      draggable={false}
      className={`block h-full min-h-full w-full min-w-full max-w-none object-cover object-center ${panel.imageClassName ?? ''}`}
    />
  );
}

const faqItems = [
  {
    question: 'Que mesure exactement Qory\u00a0?',
    answer:
      'Qory mesure quatre choses\u00a0: la lisibilité de votre site pour les IA, la qualité des informations qu\u2019elles associent à votre marque, votre présence réelle dans leurs réponses et votre position face aux concurrents déjà visibles.',
  },
  {
    question: 'Qu\u2019est-ce que je reçois concrètement dans le rapport\u00a0?',
    answer:
      'Vous obtenez un score global, le détail par pilier, la visibilité par modèle IA, les informations déjà associées à votre marque, les concurrents qui ressortent à votre place et un plan d\u2019action priorisé.',
  },
  {
    question: 'Comment interpréter le score\u00a0?',
    answer:
      'Le score ne juge pas votre site dans l\u2019absolu. Il indique à quel point votre présence est exploitable par les IA aujourd\u2019hui. Plus il est élevé, plus votre marque ressort avec des informations claires, fiables et bien positionnées.',
  },
  {
    question: 'Est-ce utile si mon site est déjà bien référencé sur Google\u00a0?',
    answer:
      'Oui. Un bon SEO classique ne garantit pas une bonne reprise par les IA. Qory met en lumière ce qui est bien compris, mal interprété ou totalement absent dans les réponses générées.',
  },
  {
    question: 'Puis-je analyser une page précise ou faut-il lancer le domaine complet\u00a0?',
    answer:
      'Vous pouvez partir de votre domaine principal ou d\u2019une page clé. L\u2019objectif est d\u2019évaluer ce que les IA comprennent réellement de l\u2019entrée que vous voulez rendre visible.',
  },
];

/* ═══════════════════════════════════════════════════
   ChapterBackdrop — reveals nextBg from bottom
   ═══════════════════════════════════════════════════ */

function ChapterBackdrop({
  progress,
  bg,
  nextBg,
  revealStops = [0, 0.72, 1] as [number, number, number],
  veilCenterContent,
}: {
  progress: MotionValue<number>;
  bg: string;
  nextBg: string;
  /** Keyframes du voile (progress0→1). Plus resserré = transition plus courte en scroll. */
  revealStops?: [number, number, number];
  /** Centré dans la hauteur du voile : monte avec le bloc (pas fixe au viewport). */
  veilCenterContent?: ReactNode;
}) {
  const reduceMotion = useReducedMotion();
  const revealHeight = useTransform(
    progress,
    revealStops,
    reduceMotion ? ['100%', '100%', '100%'] : ['0%', '0%', '100%']
  );

  return (
    <>
      <div className="absolute inset-0 z-0" style={{ backgroundColor: bg }} />
      <motion.div
        className={
          veilCenterContent
            ? 'pointer-events-none absolute inset-x-0 bottom-0 z-20 flex items-center justify-center overflow-hidden'
            : 'pointer-events-none absolute inset-x-0 bottom-0 z-20'
        }
        style={{ backgroundColor: nextBg, height: revealHeight }}
        aria-hidden
      >
        {veilCenterContent}
      </motion.div>
    </>
  );
}

/* ═══════════════════════════════════════════════════
   NumberedBullets — shared for Stack/Headline
   ═══════════════════════════════════════════════════ */

function NumberedBullets({
  items,
  tone,
}: {
  items: string[];
  tone: Tone;
}) {
  const classes = toneClasses(tone);
  return (
    <div className="space-y-5">
      {items.map((item, index) => (
        <div key={index} className={`border-b pb-5 ${classes.border}`}>
          <div className="flex items-start gap-4">
            <span
              className={`mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold ${classes.number}`}
            >
              {index + 1}
            </span>
            <p className={`text-lg leading-relaxed sm:text-xl ${classes.body}`}>{item}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

/** Couleurs des panneaux carrousel « rapport » (surfaces) — réutilisées pour les icônes d’étapes. */
const REPORT_PANEL_SURFACE_COLORS = [
  reportPanels[0]?.surface ?? '#69D33F',
  reportPanels[1]?.surface ?? '#4BA7F5',
  reportPanels[3]?.surface ?? '#F4B43A',
] as const;

const HOW_IT_WORKS_EDITORIAL_STEPS = [
  {
    title: 'Entrez votre URL',
    icon: Link01Icon,
    color: REPORT_PANEL_SURFACE_COLORS[0],
    typeText: 'https://votre-site.fr',
    typeMono: true,
  },
  {
    title: 'Qory interroge les IA',
    icon: AiBrain01Icon,
    color: REPORT_PANEL_SURFACE_COLORS[1],
  },
  {
    title: 'Recevez votre rapport',
    icon: FileChartColumnIncreasingIcon,
    color: REPORT_PANEL_SURFACE_COLORS[2],
  },
] as const;

const REPORT_SCORE_HOVER_END = 87;
/** Fraction de la progression (0→1) pour rouge→orange : plus élevé = le rouge reste lisible plus longtemps. */
const REPORT_SCORE_COLOR_RED_ORANGE_FRAC = 0.72;
/** Rouge → orange → vert, synchronisé avec la montée 0 →87. */
const REPORT_SCORE_RED = { r: 255, g: 69, b: 58 } as const; // #FF453A
const REPORT_SCORE_ORANGE = { r: 244, g: 180, b: 58 } as const; // #F4B43A
const REPORT_SCORE_GREEN = { r: 105, g: 211, b: 63 } as const; // #69D33F

type ReportScoreRgb = { readonly r: number; readonly g: number; readonly b: number };

function reportScoreHoverColor(t: number): string {
  const u = Math.min(1, Math.max(0, t));
  const lerp = (a: number, b: number, k: number) => Math.round(a + (b - a) * k);
  const split = REPORT_SCORE_COLOR_RED_ORANGE_FRAC;
  let from: ReportScoreRgb = REPORT_SCORE_RED;
  let to: ReportScoreRgb = REPORT_SCORE_ORANGE;
  let k: number;
  if (u <= split) {
    k = split > 0 ? u / split : 0;
  } else {
    from = REPORT_SCORE_ORANGE;
    to = REPORT_SCORE_GREEN;
    const rest = 1 - split;
    k = rest > 0 ? (u - split) / rest : 1;
  }
  const r = lerp(from.r, to.r, k);
  const g = lerp(from.g, to.g, k);
  const b = lerp(from.b, to.b, k);
  return `rgb(${r},${g},${b})`;
}

/** Trois étapes — chaîne verticale en zigzag (entrée + hover : typewriter sur 1, points sur 2, note /100 sur 3). */
function HowItWorksEditorialBubbles({
  tone,
  bubblePalette = 'light',
}: {
  tone: Tone;
  /** Sur fond sombre (mobile) : bulles foncées au repos, blanches au tap ; `light` = gris clair + survol classique. */
  bubblePalette?: 'light' | 'onDarkStack';
}) {
  const classes = toneClasses(tone);
  const reduceMotion = useReducedMotion();
  const [hoveredStep, setHoveredStep] = useState<number | null>(null);
  const [typedSnippet, setTypedSnippet] = useState('');
  const [reportScorePreview, setReportScorePreview] = useState(0);

  const onDarkStack = bubblePalette === 'onDarkStack';

  const bubbleSizeClass =
    'aspect-square size-[clamp(7.25rem,15vmin,10.25rem)] shrink-0 rounded-full bg-[#F5F5F7]';

  useEffect(() => {
    if (hoveredStep !== 0) {
      setTypedSnippet('');
      return;
    }
    const full = HOW_IT_WORKS_EDITORIAL_STEPS[0].typeText;
    if (reduceMotion) {
      setTypedSnippet(full);
      return;
    }
    setTypedSnippet('');
    let j = 0;
    const id = window.setInterval(() => {
      j += 1;
      setTypedSnippet(full.slice(0, j));
      if (j >= full.length) window.clearInterval(id);
    }, 38);
    return () => window.clearInterval(id);
  }, [hoveredStep, reduceMotion]);

  useEffect(() => {
    if (hoveredStep !== 2) {
      setReportScorePreview(0);
      return;
    }
    if (reduceMotion) {
      setReportScorePreview(REPORT_SCORE_HOVER_END);
      return;
    }
    let start: number | null = null;
    const durationMs = 2100;
    let raf = 0;
    setReportScorePreview(0);
    const tick = (now: number) => {
      if (start === null) start = now;
      const t = Math.min(1, (now - start) / durationMs);
      // easeInOutQuad : un peu plus de temps au milieu pour mieux lire orange puis vert
      const eased = t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2;
      setReportScorePreview(REPORT_SCORE_HOVER_END * eased);
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [hoveredStep, reduceMotion]);

  const entryMotion = [
    {
      initial: reduceMotion
        ? false
        : ({ opacity: 0, x: -20, scale: 0.9 } as const),
      transition: { type: 'spring' as const, stiffness: 86, damping: 20, mass: 1.05, delay: 0.04 },
    },
    {
      initial: reduceMotion ? false : ({ opacity: 0, y: 26, scale: 0.86 } as const),
      transition: { type: 'spring' as const, stiffness: 64, damping: 15, mass: 1.2, delay: 0.1 },
    },
    {
      initial: reduceMotion ? false : ({ opacity: 0, rotate: 10, scale: 0.88 } as const),
      transition: { type: 'spring' as const, stiffness: 72, damping: 14, mass: 1.15, delay: 0.16 },
    },
  ];

  return (
    <div
      className="flex w-full min-h-0 flex-col gap-y-6 pb-4 pt-1 sm:gap-y-7 lg:mx-auto lg:max-w-[min(100%,26rem)] lg:gap-y-8"
      role="list"
      aria-label="Les trois étapes"
    >
      {HOW_IT_WORKS_EDITORIAL_STEPS.map((step, i) => {
        const chain =
          i === 0
            ? 'flex flex-col items-center self-start max-md:self-center'
            : i === 1
              ? '-mt-4 flex flex-col items-center self-end max-md:mt-0 max-md:self-center sm:-mt-5 lg:-mt-7'
              : 'flex flex-col items-center self-start ml-[min(20%,5.5rem)] max-md:ml-0 max-md:self-center sm:ml-[min(18%,6rem)]';

        const em = entryMotion[i] ?? entryMotion[0];
        const isHovered = hoveredStep === i;
        const showTypewriter = isHovered && i === 0;
        const showScore = isHovered && i === 2;
        const showDots = isHovered && i === 1;
        const scoreProgress =
          REPORT_SCORE_HOVER_END > 0 ? Math.min(1, reportScorePreview / REPORT_SCORE_HOVER_END) : 0;
        const scoreColor = reportScoreHoverColor(scoreProgress);
        const bubbleLightActive = onDarkStack && isHovered;

        const dotsMicroUi = (
          <div className="flex items-center gap-1.5" aria-hidden>
            {[0, 1, 2].map((d) => (
              <motion.span
                key={d}
                className={`size-2 rounded-full ${bubbleLightActive ? 'bg-neutral-500/80' : 'bg-white/75'}`}
                animate={reduceMotion ? undefined : { y: [0, -5, 0], opacity: [0.45, 1, 0.45] }}
                transition={{
                  duration: 1.05,
                  repeat: Infinity,
                  delay: d * 0.18,
                  ease: [0.45, 0, 0.55, 1],
                }}
              />
            ))}
          </div>
        );

        return (
          <div key={step.title} role="listitem" className={chain}>
            <motion.div
              initial={em.initial || false}
              animate={{ opacity: 1, x: 0, y: 0, scale: 1, rotate: 0 }}
              transition={em.transition}
            >
              <motion.div
                role="button"
                tabIndex={0}
                aria-pressed={onDarkStack ? isHovered : undefined}
                onMouseEnter={() => {
                  if (onDarkStack) return;
                  setHoveredStep(i);
                  if (i === 0) setTypedSnippet('');
                }}
                onMouseLeave={() => {
                  if (onDarkStack) return;
                  setHoveredStep(null);
                }}
                onClick={() => {
                  if (!onDarkStack) return;
                  setHoveredStep((prev) => (prev === i ? null : i));
                  if (i === 0) setTypedSnippet('');
                }}
                onKeyDown={(e) => {
                  if (!onDarkStack) return;
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setHoveredStep((prev) => (prev === i ? null : i));
                    if (i === 0) setTypedSnippet('');
                  }
                }}
                whileHover={
                  onDarkStack || reduceMotion
                    ? undefined
                    : {
                        scale: 1.14,
                        rotate: i === 1 ? -5 : i === 2 ? 6 : -3,
                        transition: {
                          type: 'spring',
                          stiffness: 52,
                          damping: 11,
                          mass: 1.45,
                        },
                      }
                }
                transition={{ type: 'spring', stiffness: 380, damping: 26 }}
                className={`group relative isolate flex cursor-default items-center justify-center overflow-hidden ${
                  onDarkStack
                    ? `aspect-square size-[clamp(7.25rem,15vmin,10.25rem)] shrink-0 rounded-full border transition-[background-color,border-color,box-shadow] duration-300 ease-out ${
                        isHovered
                          ? 'cursor-pointer border-transparent bg-white shadow-[0_10px_36px_rgba(0,0,0,0.18)]'
                          : 'cursor-pointer border-white/[0.16] bg-[#252830]'
                      }`
                    : `${bubbleSizeClass} cursor-default`
                }`}
              >
                {!onDarkStack ? (
                  <span
                    className="pointer-events-none absolute inset-0 z-[1] rounded-full bg-black opacity-0 transition-[opacity] duration-[720ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:opacity-[0.86]"
                    aria-hidden
                  />
                ) : null}
                <motion.span className="relative z-[3] flex items-center justify-center will-change-transform">
                  <HugeiconsIcon
                    icon={step.icon}
                    size="clamp(2.15rem, 6.2vmin, 3.15rem)"
                    strokeWidth={1.75}
                    primaryColor={onDarkStack ? (isHovered ? step.color : '#D1D5DB') : step.color}
                    className={
                      onDarkStack
                        ? 'transition-all duration-[580ms] ease-[cubic-bezier(0.34,1.2,0.64,1)]'
                        : 'transition-all duration-[580ms] ease-[cubic-bezier(0.34,1.2,0.64,1)] group-hover:scale-[0.48] group-hover:opacity-0 group-hover:rotate-[-14deg]'
                    }
                    aria-hidden
                  />
                </motion.span>
                <div
                  className={`pointer-events-none absolute inset-0 z-[4] flex items-center justify-center transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                    isHovered ? 'scale-100 opacity-100' : 'scale-[0.92] opacity-0'
                  }`}
                  aria-hidden
                >
                  {showDots ? dotsMicroUi : null}
                </div>
                {showTypewriter ? (
                  <span
                    className={`pointer-events-none absolute inset-x-2 z-20 flex items-center justify-center text-center font-mono text-[0.78rem] font-semibold leading-snug tracking-tight sm:text-[0.82rem] ${
                      onDarkStack && isHovered
                        ? 'text-neutral-900 drop-shadow-none'
                        : 'text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.85)]'
                    }`}
                    aria-live="polite"
                  >
                    {typedSnippet}
                    {typedSnippet.length < HOW_IT_WORKS_EDITORIAL_STEPS[0].typeText.length ? (
                      <span
                        className={`ml-px inline-block h-[1em] w-px animate-pulse align-[-0.08em] ${
                          onDarkStack && isHovered ? 'bg-neutral-900' : 'bg-white'
                        }`}
                      />
                    ) : null}
                  </span>
                ) : null}
                {showScore ? (
                  <span
                    className={`pointer-events-none absolute inset-x-1 z-20 flex items-baseline justify-center gap-0.5 tabular-nums ${
                      bubbleLightActive ? '' : 'drop-shadow-[0_1px_2px_rgba(0,0,0,0.75)]'
                    }`}
                    style={{ color: scoreColor }}
                    aria-hidden
                  >
                    <span className="text-[clamp(1.35rem,4.8vmin,1.85rem)] font-bold leading-none tracking-[-0.04em]">
                      {Math.round(reportScorePreview)}
                    </span>
                    <span
                      className={`text-[0.62rem] font-semibold leading-none sm:text-[0.68rem] ${
                        bubbleLightActive ? 'text-neutral-500' : 'text-white/55'
                      }`}
                    >
                      /100
                    </span>
                  </span>
                ) : null}
              </motion.div>
            </motion.div>
            <p
              className={`mt-2.5 max-w-[22ch] text-balance text-center text-[1.05rem] font-semibold leading-snug tracking-[-0.02em] sm:mt-3 sm:max-w-[24ch] sm:text-[1.2rem] lg:mt-3.5 lg:text-[1.35rem] lg:leading-[1.2] ${classes.title}`}
            >
              {step.title}
            </p>
          </div>
        );
      })}
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   Statement Section — fond dégradé
   ═══════════════════════════════════════════════════ */

const STATEMENT_GRADIENT_BG =
  'linear-gradient(135deg, #69D33F 0%, #4BA7F5 50%, #F16B5D 100%)';

function StatementSection() {
  const reduceMotion = useReducedMotion();
  const ref = useRef<HTMLElement | null>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end end'],
  });
  const titleY = useTransform(scrollYProgress, [0, 0.5, 1], reduceMotion ? [0, 0, 0] : [76, 14, -40]);

  return (
    <>
      <section
        className="relative py-20 sm:py-24 md:hidden"
        style={{ background: STATEMENT_GRADIENT_BG }}
      >
        <div className="mx-auto flex max-w-3xl flex-col items-center justify-center px-6 text-center text-white sm:px-10">
          <h2 className="text-balance text-[clamp(1.85rem,7.5vw,3.1rem)] font-semibold leading-[0.94] tracking-tight">
            <span className="block">Le trafic change de forme.</span>
            <span className="block">Les IA décident pour vous.</span>
          </h2>
        </div>
      </section>
      <section
        ref={ref}
        className="relative hidden h-[200svh] md:block"
        style={{ background: STATEMENT_GRADIENT_BG }}
      >
        <div className="sticky top-0 h-screen overflow-hidden">
          <motion.div
            className="relative z-10 flex h-full flex-col items-center justify-center px-6 text-center text-white sm:px-10 lg:px-16"
            style={{ y: titleY }}
          >
            <h2 className="text-balance text-[clamp(1.85rem,7.5vw,3.1rem)] font-semibold leading-[0.94] tracking-tight sm:text-[4.7rem] lg:text-[6rem]">
              <span className="block">Le trafic change de forme.</span>
              <span className="block">Les IA décident pour vous.</span>
            </h2>
          </motion.div>
        </div>
      </section>
    </>
  );
}

/* ═══════════════════════════════════════════════════
   StackChapter — title left, bullets right
   ═══════════════════════════════════════════════════ */

function StackChapterLayout({
  title,
  items,
  tone,
  accentLine,
  titleColumnY,
  accentLineScale,
  rightSlot,
}: {
  title: ReactNode;
  items?: string[];
  tone: Tone;
  accentLine?: string;
  /** Colonne titre + barre (ex. scroll lié) ; les puces restent sans ce décalage. */
  titleColumnY?: MotionValue<number>;
  accentLineScale?: MotionValue<number>;
  /** Remplace la colonne de puces numérotées (ex. bulles éditoriales). */
  rightSlot?: ReactNode;
}) {
  const classes = toneClasses(tone);
  const accent =
    accentLine != null ? (
      accentLineScale ? (
        <motion.div
          className="mt-7 h-[3px] w-28 origin-left"
          style={{ scaleX: accentLineScale, backgroundColor: accentLine }}
        />
      ) : (
        <div className="mt-7 h-[3px] w-28" style={{ backgroundColor: accentLine }} />
      )
    ) : null;

  const left =
    titleColumnY != null || accentLineScale != null ? (
      <motion.div style={titleColumnY != null ? { y: titleColumnY } : undefined}>
        <h2 className={`text-balance text-[clamp(1.85rem,5.8vw,2.55rem)] font-semibold leading-[0.98] tracking-tight sm:text-[4.15rem] lg:text-[4.75rem] ${classes.title}`}>
          {title}
        </h2>
        {accent}
      </motion.div>
    ) : (
      <div>
        <h2 className={`text-balance text-[clamp(1.85rem,5.8vw,2.55rem)] font-semibold leading-[0.98] tracking-tight sm:text-[4.15rem] lg:text-[4.75rem] ${classes.title}`}>
          {title}
        </h2>
        {accent}
      </div>
    );

  return (
    <div className="grid min-h-0 w-full items-start gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:gap-16">
      {left}
      {rightSlot ?? <NumberedBullets items={items ?? []} tone={tone} />}
    </div>
  );
}

function StackChapter({
  title,
  items,
  bg,
  nextBg,
  tone,
  id,
  accentLine,
}: {
  title: ReactNode;
  items: string[];
  bg: string;
  nextBg: string;
  tone: Tone;
  id?: string;
  accentLine?: string;
}) {
  const reduceMotion = useReducedMotion();
  const ref = useRef<HTMLElement | null>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });
  const textY = useTransform(scrollYProgress, [0.1, 0.65, 0.92], reduceMotion ? [0, 0, 0] : [80, 0, -18]);

  return (
    <div id={id}>
      <section className="relative py-14 sm:py-16 md:hidden" style={{ backgroundColor: bg }}>
        <div className="px-6 sm:px-10">
          <StackChapterLayout title={title} items={items} tone={tone} />
        </div>
      </section>
      <section ref={ref} className="relative hidden h-[200svh] md:block" style={{ backgroundColor: bg }}>
        <div className="sticky top-0 h-screen overflow-hidden">
          <ChapterBackdrop progress={scrollYProgress} bg={bg} nextBg={nextBg} />
          <motion.div className="relative z-10 flex h-full items-center px-6 py-12 sm:px-10 lg:px-16" style={{ y: textY }}>
            <StackChapterLayout title={title} items={items} tone={tone} accentLine={accentLine} />
          </motion.div>
        </div>
      </section>
    </div>
  );
}

/** Section « Trois angles morts » : titre + trois blocs alignés à gauche. */
function ProblemChapter({
  title,
  items,
  bg,
  nextBg,
  id,
}: {
  title: ReactNode;
  items: readonly { title: string; body: string }[];
  bg: string;
  nextBg: string;
  id?: string;
}) {
  const reduceMotion = useReducedMotion();
  const ref = useRef<HTMLElement | null>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });
  const textY = useTransform(scrollYProgress, [0.1, 0.65, 0.92], reduceMotion ? [0, 0, 0] : [48, 0, -12]);
  const lineScale = useTransform(scrollYProgress, [0.2, 0.65], reduceMotion ? [0, 0] : [0, 1]);
  const classes = toneClasses('dark');

  const renderList = (withWarningIcons: boolean, mobileAsCards = false) => (
    <ul
      className={`mt-10 w-full max-w-xl list-none sm:mt-12 ${
        mobileAsCards ? 'space-y-4' : 'space-y-10 sm:space-y-11'
      }`}
      role="list"
    >
      {items.map((item) => {
        const body = withWarningIcons ? (
          <div className="flex gap-3 sm:gap-3.5 md:gap-4">
            <HugeiconsIcon
              icon={Alert02Icon}
              primaryColor="#FF453A"
              className="mt-[0.2em] h-6 w-6 shrink-0 sm:h-7 sm:w-7 md:mt-[0.15em] md:h-8 md:w-8"
              strokeWidth={1.85}
              aria-hidden
            />
            <div className="min-w-0">
              <h3
                className={`text-[1.35rem] font-semibold leading-snug tracking-tight sm:text-[1.65rem] md:text-[1.85rem] ${classes.title}`}
              >
                {item.title}
              </h3>
              <p className={`mt-3 max-w-xl text-base leading-relaxed sm:mt-3.5 sm:text-lg ${classes.body}`}>
                {item.body}
              </p>
            </div>
          </div>
        ) : (
          <div className="min-w-0">
            <h3
              className={`text-[1.35rem] font-semibold leading-snug tracking-tight sm:text-[1.65rem] md:text-[1.85rem] ${classes.title}`}
            >
              {item.title}
            </h3>
            <p className={`mt-3 max-w-xl text-base leading-relaxed sm:mt-3.5 sm:text-lg ${classes.body}`}>
              {item.body}
            </p>
          </div>
        );

        return (
          <li key={item.title} role="listitem">
            {mobileAsCards ? (
              <article className="rounded-[2rem] border border-white/[0.1] bg-[#1e2229] p-5 sm:rounded-[2.25rem] sm:p-6">
                {body}
              </article>
            ) : (
              body
            )}
          </li>
        );
      })}
    </ul>
  );

  return (
    <div id={id}>
      <section className="relative bg-[#121418] md:hidden">
        <MobileSectionBgHairline />
        <div className="relative px-6 pb-14 pt-16 text-left sm:px-10 sm:pb-16 sm:pt-20">
          <div className="max-w-2xl">
            <h2
              className={`text-balance text-[clamp(1.9rem,6vw,2.55rem)] font-semibold leading-[0.98] tracking-tight sm:text-[4.15rem] lg:text-[4.75rem] ${classes.title}`}
            >
              {title}
            </h2>
          </div>
          {renderList(true, true)}
        </div>
      </section>
      <section ref={ref} className="relative hidden h-[200svh] md:block" style={{ backgroundColor: bg }}>
        <div className="sticky top-0 h-screen overflow-hidden">
          <ChapterBackdrop progress={scrollYProgress} bg={bg} nextBg={nextBg} />
          <div
            className="pointer-events-none absolute inset-0 z-[1] overflow-visible"
            aria-hidden
          >
            <div className="absolute bottom-0 right-0 flex translate-x-[20%] translate-y-[4%] items-end justify-end sm:translate-x-[18%] sm:translate-y-[3%] lg:translate-x-[16%] lg:translate-y-[2%]">
              <HugeiconsIcon
                icon={Alert02Icon}
                primaryColor="#FF453A"
                className="h-[min(68vw,28rem)] w-[min(68vw,28rem)] opacity-[0.13] sm:h-[min(58vw,30rem)] sm:w-[min(58vw,30rem)] sm:opacity-[0.15] lg:h-[min(50vw,32rem)] lg:w-[min(50vw,32rem)]"
                strokeWidth={1}
              />
            </div>
          </div>
          <motion.div
            className="relative z-10 flex h-full min-h-0 flex-col items-start px-6 pb-10 pt-24 text-left sm:px-10 sm:pb-12 sm:pt-28 lg:px-16 lg:pb-14 lg:pt-[7.25rem]"
            style={{ y: textY }}
          >
            <div className="max-w-2xl shrink-0">
              <h2
                className={`text-balance text-[clamp(1.9rem,6vw,2.55rem)] font-semibold leading-[0.98] tracking-tight sm:text-[4.15rem] lg:text-[4.75rem] ${classes.title}`}
              >
                {title}
              </h2>
              <motion.div
                className="mt-7 h-[3px] w-28 origin-left"
                style={{ scaleX: lineScale, backgroundColor: REPORT_DECO_BLUE }}
                aria-hidden
              />
            </div>
            {renderList(false)}
          </motion.div>
        </div>
      </section>
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   Méthode — formes géométriques (lectures)
   ═══════════════════════════════════════════════════ */

function MethodeLectureInteractive({
  block,
  panelAnchor = 'center',
  onHoverChange,
}: {
  block: MethodeLectureBlock;
  /** Évite le débordement viewport : `start` (gauche), `end` (droite), `centre` sous la forme. */
  panelAnchor?: 'center' | 'start' | 'end';
  onHoverChange?: (hovered: boolean) => void;
}) {
  const reduceMotion = useReducedMotion();
  const [hovered, setHovered] = useState(false);
  const [wiggling, setWiggling] = useState(false);

  const onEnter = () => {
    setHovered(true);
    onHoverChange?.(true);
    if (reduceMotion) return;
    setWiggling(true);
    window.setTimeout(() => setWiggling(false), 520);
  };
  const onLeave = () => {
    setHovered(false);
    onHoverChange?.(false);
  };

  const panelJustify =
    panelAnchor === 'end' ? 'justify-end' : panelAnchor === 'start' ? 'justify-start' : 'justify-center';

  return (
    <div
      className="relative w-max outline-none focus-visible:ring-2 focus-visible:ring-[#4BA7F5] focus-visible:ring-offset-2"
      role="button"
      tabIndex={0}
      aria-label={`${block.title}. ${block.body}`}
      aria-expanded={hovered}
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      onFocus={onEnter}
      onBlur={onLeave}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          setHovered((h) => {
            const next = !h;
            onHoverChange?.(next);
            return next;
          });
        }
      }}
    >
      <MethodeShapeFace block={block} reduceMotion={reduceMotion} wiggling={wiggling} />
      <motion.div
        className={`pointer-events-none absolute inset-x-0 top-[calc(100%+0.45rem)] z-[60] flex ${panelJustify}`}
        initial={false}
        animate={
          hovered
            ? {
                opacity: 1,
                y: 0,
                scale: 1,
                rotate: reduceMotion ? 0 : [0, -2.5, 2.5, -1.5, 1.5, 0],
              }
            : { opacity: 0, y: 14, scale: 0.88, rotate: 0 }
        }
        transition={
          hovered && !reduceMotion
            ? {
                opacity: { type: 'spring', stiffness: 460, damping: 22, mass: 0.65 },
                y: { type: 'spring', stiffness: 460, damping: 22, mass: 0.65 },
                scale: { type: 'spring', stiffness: 460, damping: 22, mass: 0.65 },
                rotate: { type: 'tween', duration: 0.45, ease: 'easeInOut' },
              }
            : { type: 'spring', stiffness: 460, damping: 22, mass: 0.65 }
        }
      >
        <div className="w-[min(19.5rem,calc(100vw-1.75rem))] shrink-0 rounded-2xl border-[2.5px] border-[#1a1d24] bg-[#F5F5F7] px-3.5 py-2.5 shadow-[4px_4px_0_#1a1d24] sm:w-[min(21rem,calc(100vw-2rem))] sm:px-4 sm:py-3">
          <p className="text-[0.82rem] font-bold leading-tight tracking-[-0.02em] text-[#1a1d24] sm:text-[0.88rem]">{block.title}</p>
          <p className="mt-2 text-[0.74rem] font-semibold leading-snug text-[#1a1d24] sm:mt-2.5 sm:text-[0.8rem]">{block.body}</p>
        </div>
      </motion.div>
    </div>
  );
}

function MethodeLecturesGeometry({ blocks }: { blocks: MethodeLectureBlock[] }) {
  const [liftedIndex, setLiftedIndex] = useState<number | null>(null);
  /**
   * Ordre des blocs : cercle, triangle, squircle, pilule.
   * Positions étalées sur toute la largeur + hauteurs variées pour éviter le « paquet » à gauche.
   */
  const scatter = [
    'left-[2%] top-[6%] -rotate-[3deg] sm:left-[5%] sm:top-[9%] lg:left-[6%]',
    /* Triangle : entre « trop collé » et « deux bandes » — centre ~62–64 %. */
    'left-[60%] top-[2%] -translate-x-1/2 rotate-[5deg] sm:left-[62%] sm:top-[5%] lg:left-[64%]',
    'right-[2%] top-[12%] -rotate-[2.2deg] sm:right-[4%] sm:top-[15%] lg:right-[6%] lg:top-[12%]',
    'left-[26%] top-[22%] rotate-[3deg] sm:left-[28%] sm:top-[26%] lg:left-[30%] lg:top-[24%]',
  ];

  return (
    <div className="relative mx-auto w-full max-w-none">
      <div
        className="grid grid-cols-2 justify-items-center gap-x-2 gap-y-10 py-4 md:hidden"
        role="list"
        aria-label="Les quatre lectures du diagnostic"
      >
        {blocks.map((block, i) => (
          <div
            key={block.title}
            className="flex w-full max-w-[11.5rem] flex-col items-center justify-start sm:max-w-[15rem]"
            role="listitem"
          >
            <div className="flex origin-top scale-[0.88] justify-center sm:scale-95">
              <MethodeLectureInteractive
                block={block}
                onHoverChange={(h) => setLiftedIndex(h ? i : null)}
                panelAnchor="center"
              />
            </div>
          </div>
        ))}
      </div>
      <div
        className="relative mx-auto hidden min-h-[13rem] h-[min(50svh,30rem)] w-full max-w-none sm:min-h-[15rem] sm:h-[min(48svh,32rem)] lg:h-[min(52svh,34rem)] md:block"
        role="list"
        aria-label="Les quatre lectures du diagnostic"
      >
        {blocks.map((block, i) => (
          <div
            key={block.title}
            className={`absolute w-max ${scatter[i] ?? ''}`}
            style={{ zIndex: liftedIndex === i ? 80 : 10 + i }}
            role="listitem"
          >
            <MethodeLectureInteractive
              block={block}
              onHoverChange={(h) => setLiftedIndex(h ? i : null)}
              panelAnchor={i === 0 ? 'start' : i === 2 ? 'end' : 'center'}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   HeadlineChapter — big title top, grid below
   ═══════════════════════════════════════════════════ */


function HeadlineChapter({
  title,
  items,
  methodeBlocks,
  bg,
  nextBg,
  tone,
  id,
  accentLine,
  veilRevealStops,
  showOnMobile = true,
}: {
  title: ReactNode;
  items?: string[];
  methodeBlocks?: MethodeLectureBlock[];
  bg: string;
  nextBg: string;
  tone: Tone;
  id?: string;
  accentLine?: string;
  /** Keyframes du voile (voir ChapterBackdrop). Plus tôt le 2e stop = montée du voile plus longue en scroll. */
  veilRevealStops?: [number, number, number];
  /** Si false, la variante mobile (md:hidden) n’est pas rendue — utile quand le desktop suffit. */
  showOnMobile?: boolean;
}) {
  const reduceMotion = useReducedMotion();
  const ref = useRef<HTMLElement | null>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });
  const titleYMotion = useTransform(scrollYProgress, [0.1, 0.65, 0.92], reduceMotion ? [0, 0, 0] : [40, 0, 0]);
  const lineScale = useTransform(scrollYProgress, [0.2, 0.65], [0, 1]);
  const classes = toneClasses(tone);
  /** Sur mobile uniquement, les sections autrefois blanches passent en fond sombre. */
  const mobileTone: Tone = tone === 'light' ? 'dark' : tone;
  const mobileClasses = toneClasses(mobileTone);

  const bottomContent = items ? <NumberedBullets items={items} tone={mobileTone} /> : null;

  const mobileDarkSection = tone === 'light';

  return (
    <div id={id}>
      {showOnMobile ? (
        methodeBlocks ? (
          <section
            className={`relative md:hidden ${mobileDarkSection ? 'bg-[#121418]' : ''}`}
            style={mobileDarkSection ? undefined : { backgroundColor: bg }}
          >
            <div className="px-5 pb-12 pt-12 sm:px-6 sm:pb-14 sm:pt-14">
              <header className="mb-10 flex w-full flex-col items-end text-right">
                <h2
                  className={`inline-flex flex-col items-end text-[clamp(2rem,6.5vw,2.75rem)] font-semibold leading-[1.02] tracking-tight ${mobileClasses.title}`}
                >
                  {title}
                </h2>
              </header>
              <MethodeLecturesGeometry blocks={methodeBlocks} />
            </div>
          </section>
        ) : (
          <section
            className={`relative md:hidden ${mobileDarkSection ? 'bg-[#121418]' : ''}`}
            style={mobileDarkSection ? undefined : { backgroundColor: bg }}
          >
            <div className="px-6 pb-12 pt-14 sm:px-10">
              <h2
                className={`max-w-5xl text-balance text-[2.75rem] font-semibold leading-[0.96] tracking-tight ${mobileClasses.title}`}
              >
                {title}
              </h2>
              <div className="mt-10">{bottomContent}</div>
            </div>
          </section>
        )
      ) : null}
      <section ref={ref} className="relative hidden h-[200svh] md:block" style={{ backgroundColor: bg }}>
        <div className="sticky top-0 h-screen overflow-hidden">
          <ChapterBackdrop
            progress={scrollYProgress}
            bg={bg}
            nextBg={nextBg}
            revealStops={veilRevealStops ?? [0, 0.72, 1]}
          />
          {methodeBlocks ? (
            <motion.div
              className="relative z-10 flex h-full w-full flex-col overflow-visible bg-white px-5 pb-8 pt-14 sm:px-8 sm:pb-10 sm:pt-16 lg:px-12 lg:pb-10 lg:pt-12 xl:px-16 xl:pt-14"
              style={{ y: titleYMotion }}
            >
              <div className="flex min-h-0 w-full min-w-0 flex-1 flex-col pt-1">
                <MethodeLecturesGeometry blocks={methodeBlocks} />
              </div>
              <header className="mt-auto flex w-full shrink-0 flex-col items-end text-right">
                <h2
                  className={`inline-flex flex-col items-end text-[clamp(2rem,6.5vw,2.75rem)] font-semibold leading-[1.02] tracking-tight sm:text-[4.5rem] lg:text-[5.25rem] ${classes.title}`}
                >
                  {title}
                </h2>
                {accentLine ? (
                  <motion.div
                    className="mt-7 ml-auto h-[3px] w-28 origin-right"
                    style={{ scaleX: lineScale, backgroundColor: accentLine }}
                  />
                ) : null}
              </header>
            </motion.div>
          ) : (
            <div className="relative z-10 flex h-full min-h-0 flex-col overflow-hidden">
              <motion.div className="shrink-0 px-6 pt-16 sm:px-10 lg:px-16 lg:pt-20" style={{ y: titleYMotion }}>
                <h2
                  className={`max-w-5xl text-balance text-[2.75rem] font-semibold leading-[0.96] tracking-tight sm:text-[4.5rem] lg:text-[5.25rem] ${classes.title}`}
                >
                  {title}
                </h2>
                {accentLine ? (
                  <motion.div className="mt-7 h-[3px] w-28 origin-left" style={{ scaleX: lineScale, backgroundColor: accentLine }} />
                ) : null}
              </motion.div>
              <div className="flex min-h-0 flex-1 flex-col justify-end px-6 pb-12 pt-10 sm:px-10 lg:px-16 lg:pb-16">
                {bottomContent}
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   SplitChapter — text left, visual/content right
   ═══════════════════════════════════════════════════ */

function SplitChapter({
  title,
  items,
  bg,
  nextBg,
  tone,
  id,
  accentLine,
  children,
}: {
  title: string;
  items?: string[];
  bg: string;
  nextBg: string;
  tone: Tone;
  id?: string;
  accentLine?: string;
  children?: React.ReactNode;
}) {
  const reduceMotion = useReducedMotion();
  const ref = useRef<HTMLElement | null>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });
  const textMotion = useTransform(scrollYProgress, [0.1, 0.65, 0.92], reduceMotion ? [0, 0, 0] : [80, 0, -24]);
  const classes = toneClasses(tone);

  return (
    <section ref={ref} id={id} className="relative h-[200svh]" style={{ backgroundColor: bg }}>
      <div className="sticky top-0 h-screen overflow-hidden">
        <ChapterBackdrop progress={scrollYProgress} bg={bg} nextBg={nextBg} />
        <div className="relative z-10 grid h-full lg:grid-cols-[0.95fr_1.05fr]">
          <motion.div className="flex items-center px-6 py-16 sm:px-10 lg:px-16" style={{ y: textMotion }}>
            <div className="max-w-2xl">
              <h2 className={`text-balance text-[2.5rem] font-semibold leading-[0.98] tracking-tight sm:text-[4rem] lg:text-[4.75rem] ${classes.title}`}>
                {title}
              </h2>
              {accentLine ? (
                <div
                  className="mt-7 hidden h-[3px] w-28 md:block"
                  style={{ backgroundColor: accentLine }}
                />
              ) : null}
              {items ? (
                <div className="mt-7">
                  <NumberedBullets items={items} tone={tone} />
                </div>
              ) : null}
              {children}
            </div>
          </motion.div>
          <div className="relative hidden lg:block" />
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════
   ReportColorCrushChapter — carrousel (intro 100vw, couleurs étroites + aperçus)
   ═══════════════════════════════════════════════════ */


/** Panneaux sur la piste après l’intro 100vw (le 1er panneau data est uniquement dans le split intro). */
const REPORT_CAROUSEL_TRACK_PANEL_COUNT = Math.max(0, reportPanels.length - 1);
const REPORT_CAROUSEL_INTRO = 0.05;
const REPORT_CAROUSEL_INTRO_VW = 100;
const REPORT_CAROUSEL_COLOR_VW = 62;
const REPORT_CAROUSEL_PEEK_VW = 19;
const REPORT_PHOTOBOOTH_RAIL = 'clamp(1.5rem,2.6vw,3rem)';
const REPORT_PHOTOBOOTH_CONTENT_PAD = 'clamp(2.45rem,4.35vw,5rem)';
const REPORT_ENTRY_REVEAL_END = 1;
/**
 * Une unité de slide = même durée en scroll pour passer d’une couleur à la suivante ET pour la sortie finale.
 * INTRO + n×SLIDE + EXIT = 1 avec EXIT = SLIDE (pas de « queue » vw après la dernière carte).
 */
const REPORT_CAROUSEL_SLIDE =
  (1 - REPORT_CAROUSEL_INTRO) / (REPORT_CAROUSEL_TRACK_PANEL_COUNT + 1);
/** Aligné sur un StackChapter (200svh) pour que le voile ait la même courbe / le même rythme que le reste de la landing. */
const REPORT_STACK_FOLLOW_SVH = 200;

function smoothStep01(t: number): number {
  const x = Math.min(1, Math.max(0, t));
  return x * x * (3 - 2 * x);
}

/** 0 = début de pose ; 1 = vue ouverte (fin de révélation scroll). */
function reportAssetOpenT(
  p: number,
  windowStart: number,
  windowLen: number,
  reduceMotion: boolean | null
): number {
  if (reduceMotion) return 1;
  if (p < windowStart) return 0;
  if (p > windowStart + windowLen) return 1;
  return smoothStep01((p - windowStart) / windowLen);
}

/**
 * Réf. type Akaru : (1) fenêtre basse et étroite ; (2) masque + photo remontent ; (3) ~65 % / ~35 % image / typo.
 */
const REPORT_ASSET_PHOTO_FLEX = 13;
const REPORT_ASSET_COLORBAND_FLEX = 7;

const REPORT_ASSET_SCALE_MAX = 1.16;

function reportCarouselTrackWidthVw(panelCount: number): number {
  return REPORT_CAROUSEL_INTRO_VW + panelCount * REPORT_CAROUSEL_COLOR_VW;
}

function reportCarouselCarouselEndProgress(panelCount: number): number {
  return REPORT_CAROUSEL_INTRO + panelCount * REPORT_CAROUSEL_SLIDE;
}

/**
 * Progrès p où le bord gauche du viewport atteint déjà sa position finale (clamp `maxT`),
 * alors que `reportCarouselTrackOffset` peut encore monter jusqu’à `n`. Sans ça : scroll « mort »
 * sur la fin du dernier slide — la sortie ne doit pas attendre `carouselEnd` dans ce cas.
 */
function reportCarouselTrackExitStartProgress(panelCount: number): number {
  const n = panelCount;
  const carouselEnd = reportCarouselCarouselEndProgress(n);
  if (n <= 0) return carouselEnd;

  const intro = REPORT_CAROUSEL_INTRO;
  const slide = REPORT_CAROUSEL_SLIDE;
  const introW = REPORT_CAROUSEL_INTRO_VW;
  const colW = REPORT_CAROUSEL_COLOR_VW;
  const peek = REPORT_CAROUSEL_PEEK_VW;
  const slideLeft = (j: number) => (j === 0 ? 0 : introW + (j - 1) * colW);
  const viewportAt = (j: number) => (j === 0 ? 0 : slideLeft(j) - peek);
  const trackW = reportCarouselTrackWidthVw(n);
  const maxT = Math.max(0, trackW - 100);

  const v0 = viewportAt(n - 1);
  const v1 = viewportAt(n);
  const exitFrom = Math.min(v1, maxT);

  if (v1 <= maxT + 1e-6 || v1 - v0 <= 1e-6) return carouselEnd;

  const tStar = Math.min(1, Math.max(0, (maxT - v0) / (v1 - v0)));
  const lastSlideStart = intro + (n - 1) * slide;
  return lastSlideStart + tStar * slide;
}

/**
 * Progression carrousel (0–1) à partir de laquelle « Trois étapes » réagit aussi au scroll.
 */
const REPORT_STACK_BLEND_CAROUSEL_P =
  reportCarouselTrackExitStartProgress(REPORT_CAROUSEL_TRACK_PANEL_COUNT) * 0.76;

/** Progression 0 = intro, 1 = 1er panneau couleur centré, …, n = dernier. */
function reportCarouselTrackOffset(
  p: number,
  reduceMotion: boolean | null,
  transitionCount: number
): number {
  const intro = REPORT_CAROUSEL_INTRO;
  const slide = REPORT_CAROUSEL_SLIDE;
  const n = transitionCount;

  if (reduceMotion) {
    if (p < intro) return 0;
    return Math.min(n, Math.floor((p - intro) / slide));
  }

  if (p < intro) return 0;
  if (p >= intro + n * slide) return n;

  const s = Math.min(n - 1, Math.floor((p - intro) / slide));
  const a = intro + s * slide;
  const t = Math.min(1, Math.max(0, (p - a) / slide));
  return s + t;
}

/** Bord gauche du viewport sur la piste (vw) : ~aperçu | colonne ~62vw | aperçu. */
function reportCarouselViewportLeftVw(offset: number, panelCount: number): number {
  const introW = REPORT_CAROUSEL_INTRO_VW;
  const colW = REPORT_CAROUSEL_COLOR_VW;
  const peek = REPORT_CAROUSEL_PEEK_VW;
  const n = panelCount;

  const stepW = colW;
  const slideLeft = (j: number) => (j === 0 ? 0 : introW + (j - 1) * stepW);
  const viewportAt = (j: number) => (j === 0 ? 0 : slideLeft(j) - peek);

  const trackW = reportCarouselTrackWidthVw(n);
  const maxT = Math.max(0, trackW - 100);

  if (offset >= n) {
    return Math.min(viewportAt(n), maxT);
  }

  const j = Math.floor(offset);
  const t = offset - j;
  const v0 = viewportAt(j);
  const v1 = viewportAt(j + 1);
  return Math.min(v0 + t * (v1 - v0), maxT);
}

/** Bord gauche viewport (vw), y compris phase de sortie jusqu’à dégagement total de la piste. */
function reportCarouselTrackLeftVw(
  p: number,
  reduceMotion: boolean | null,
  panelCount: number
): number {
  const n = panelCount;
  const intro = REPORT_CAROUSEL_INTRO;
  const slide = REPORT_CAROUSEL_SLIDE;
  const trackW = reportCarouselTrackWidthVw(n);
  const exitTrackW = trackW;
  const exitFrom = reportCarouselViewportLeftVw(n, n);
  const carouselEnd = reportCarouselCarouselEndProgress(n);
  const exitStartSmooth = reportCarouselTrackExitStartProgress(n);
  const exitEnd = 1;
  const exitLenSmooth = Math.max(0.001, exitEnd - exitStartSmooth);

  if (reduceMotion) {
    const exitStart = carouselEnd;
    const exitLen = Math.max(0.001, exitEnd - exitStart);
    if (p < intro) return 0;
    if (p < exitStart) {
      const off = Math.min(n, Math.floor((p - intro) / slide));
      return reportCarouselViewportLeftVw(off, n);
    }
    if (p >= exitEnd) return exitTrackW;
    const u = (p - exitStart) / exitLen;
    return exitFrom + u * (exitTrackW - exitFrom);
  }

  if (p < intro) return 0;
  if (p < exitStartSmooth) {
    const off = reportCarouselTrackOffset(p, false, n);
    return reportCarouselViewportLeftVw(off, n);
  }
  if (p >= exitEnd) return exitTrackW;

  const u = (p - exitStartSmooth) / exitLenSmooth;
  return exitFrom + u * (exitTrackW - exitFrom);
}

function ReportColorPanelColumn({
  panel,
  panelIndex,
  progress,
  reduceMotion,
}: {
  panel: ReportPanel;
  panelIndex: number;
  progress: MotionValue<number>;
  reduceMotion: boolean | null;
}) {
  const intro = REPORT_CAROUSEL_INTRO;
  const slide = REPORT_CAROUSEL_SLIDE;
  /** La 1re colonne masquée récupère l’ancienne plage scroll de l’intro (photo bleue déjà finale). */
  const revealStart = panelIndex === 0 ? 0 : intro + panelIndex * slide;
  const revealLen = panelIndex === 0 ? intro + slide : slide;

  const assetScale = useTransform(progress, (p) => {
    if (reduceMotion) return 1.04;
    const e = reportAssetOpenT(p, revealStart, revealLen, reduceMotion);
    return REPORT_ASSET_SCALE_MAX - e * 0.12;
  });
  const topCacheY = useTransform(progress, (p) => {
    if (reduceMotion) return '-100%';
    const e = reportAssetOpenT(p, revealStart, revealLen, reduceMotion);
    return `${-102 * e}%`;
  });
  const bottomCacheY = useTransform(progress, (p) => {
    if (reduceMotion) return '100%';
    const e = reportAssetOpenT(p, revealStart, revealLen, reduceMotion);
    return `${102 * e}%`;
  });
  const titleOpacity = useTransform(progress, (p) => {
    if (reduceMotion) return 1;
    const e = reportAssetOpenT(p, revealStart, revealLen, reduceMotion);
    return Math.min(1, Math.max(0, (e - 0.32) / 0.5));
  });
  const titleY = useTransform(progress, (p) => {
    if (reduceMotion) return 0;
    const e = reportAssetOpenT(p, revealStart, revealLen, reduceMotion);
    return -22 * (1 - e);
  });
  const panelY = useTransform(progress, (p) => {
    if (reduceMotion) return 0;
    const e = reportAssetOpenT(p, revealStart, revealLen, reduceMotion);
    return 72 * (1 - e);
  });
  const panelClip = useTransform(progress, (p) => {
    if (reduceMotion) return 'inset(0px 0px 0px 0px)';
    const e = reportAssetOpenT(p, revealStart, revealLen, reduceMotion);
    return `inset(${72 * (1 - e)}px 0px 0px 0px)`;
  });

  return (
    <motion.div
      className="pointer-events-none relative flex h-full shrink-0 flex-col overflow-hidden"
      style={{
        width: `${REPORT_CAROUSEL_COLOR_VW}vw`,
        minWidth: `${REPORT_CAROUSEL_COLOR_VW}vw`,
        maxWidth: `${REPORT_CAROUSEL_COLOR_VW}vw`,
        backgroundColor: panel.surface,
        y: panelY,
        clipPath: panelClip,
      }}
      aria-hidden
    >
      <div
        className="pointer-events-none absolute inset-y-0 left-0 z-30"
        style={{ width: REPORT_PHOTOBOOTH_RAIL, backgroundColor: panel.surface }}
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-y-0 right-0 z-30"
        style={{ width: REPORT_PHOTOBOOTH_RAIL, backgroundColor: panel.surface }}
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-x-0 top-0 z-30"
        style={{ height: REPORT_PHOTOBOOTH_RAIL, backgroundColor: panel.surface }}
        aria-hidden
      />
      <div
        className="relative min-h-[40svh] w-full shrink-0 md:min-h-0"
        style={{ flex: `${REPORT_ASSET_PHOTO_FLEX} 1 0%` }}
      >
        <div
          className="absolute bottom-0 overflow-hidden"
          style={{
            left: REPORT_PHOTOBOOTH_RAIL,
            right: REPORT_PHOTOBOOTH_RAIL,
            top: REPORT_PHOTOBOOTH_RAIL,
            backgroundColor: panel.surface,
          }}
        >
          <motion.div
            className="h-full min-h-full w-full min-w-full max-w-none [&>img]:block [&>img]:h-full [&>img]:min-h-full [&>img]:w-full [&>img]:min-w-full [&>img]:max-w-none [&>img]:object-cover"
            style={{
              scale: assetScale,
              y: 0,
              transformOrigin: '50% 50%',
            }}
          >
            <ReportCarouselPhotoboothContent panel={panel} />
          </motion.div>
          <motion.div
            className="absolute inset-x-[-2px] top-[-1px] h-[calc(50%+2px)]"
            style={{ y: topCacheY, backgroundColor: panel.surface }}
            aria-hidden
          />
          <motion.div
            className="absolute inset-x-[-2px] bottom-[-1px] h-[calc(50%+2px)]"
            style={{ y: bottomCacheY, backgroundColor: panel.surface }}
            aria-hidden
          />
        </div>
      </div>
      <div
        className="relative z-20 -mt-px min-h-0 w-full shrink-0"
        style={{
          flex: `${REPORT_ASSET_COLORBAND_FLEX} 1 0%`,
          backgroundColor: panel.surface,
        }}
      >
        <span
          className="absolute bottom-4 text-[0.68rem] font-semibold tracking-[0.18em]"
          style={{
            left: REPORT_PHOTOBOOTH_CONTENT_PAD,
            color: panel.titleColor,
            opacity: 0.58,
          }}
        >
          {panel.number}
        </span>
        <motion.p
          className="absolute top-0 max-w-[10ch] text-[3.1rem] font-semibold leading-[0.86] tracking-[-0.07em] sm:text-[4.7rem] lg:max-w-[12ch] lg:text-[5.6rem]"
          style={{
            left: REPORT_PHOTOBOOTH_CONTENT_PAD,
            right: REPORT_PHOTOBOOTH_CONTENT_PAD,
            top: REPORT_PHOTOBOOTH_CONTENT_PAD,
            color: panel.titleColor,
            opacity: titleOpacity,
            y: titleY,
          }}
        >
          {panel.title}
        </motion.p>
      </div>
    </motion.div>
  );
}

/** Sous-textes landing mobile seulement : plus courts que `howItWorksBlocks` (titres inchangés, `block.title`). */
const HOME_MOBILE_HOW_IT_WORKS_BODY_SHORT = [
  'Vous entrez l’adresse du site et lancez : Qory lit ce que les IA peuvent déjà comprendre.',
  'ChatGPT, Claude, Perplexity… sont interrogés sur votre marque — pas seulement votre site.',
  'Score, écarts, concurrents et actions prioritaires, en français et sans jargon.',
] as const;

/** Mobile home : icône + titre + texte (sans les visuels animés de `/comment-ca-marche`). */
const HOME_MOBILE_HOW_IT_WORKS_ICONS = {
  crawl: Link01Icon,
  analyse: AiBrain01Icon,
  rapport: FileChartColumnIncreasingIcon,
} as const;

const HOME_MOBILE_HOW_IT_WORKS_ICON_ACCENTS: Record<
  keyof typeof HOME_MOBILE_HOW_IT_WORKS_ICONS,
  string
> = {
  crawl: '#69D33F',
  analyse: '#4BA7F5',
  rapport: '#F4B43A',
};

function HomeMobileHowItWorksCcmCards() {
  const blocks = premiumStaticPages['comment-ca-marche'].howItWorksBlocks ?? [];
  return (
    <div className="flex w-full min-w-0 flex-col gap-5 sm:gap-6">
      {blocks.map((block, index) => {
        const Icon = HOME_MOBILE_HOW_IT_WORKS_ICONS[block.visual];
        const accent = HOME_MOBILE_HOW_IT_WORKS_ICON_ACCENTS[block.visual];
        return (
          <article
            key={`${block.title}-${index}`}
            className="rounded-[2rem] border border-white/[0.1] bg-[#121418] p-5 sm:rounded-[2.25rem] sm:p-6"
          >
            <HugeiconsIcon
              icon={Icon}
              size={48}
              strokeWidth={1.65}
              primaryColor={accent}
              className="h-11 w-11 shrink-0 sm:h-12 sm:w-12"
              aria-hidden
            />
            <h3 className="mt-4 text-balance text-[1.15rem] font-semibold leading-[1.12] tracking-tight text-white sm:mt-5 sm:text-[1.3rem]">
              {block.title}
            </h3>
            <p className="mt-2.5 text-[0.9375rem] leading-relaxed text-white/78 sm:mt-3 sm:text-base sm:leading-relaxed">
              {HOME_MOBILE_HOW_IT_WORKS_BODY_SHORT[index] ?? block.body}
            </p>
          </article>
        );
      })}
    </div>
  );
}

/** Carte rapport mobile : icône + titre + texte (pas de visuel carrousel). */
function ReportCarouselMobileStackCard({ panel }: { panel: ReportPanel }) {
  const Icon = REPORT_PANEL_MOBILE_ICONS[panel.key as keyof typeof REPORT_PANEL_MOBILE_ICONS];
  return (
    <article
      className={`rounded-[2rem] border border-white/[0.1] p-5 sm:rounded-[2.25rem] sm:p-6 ${MOBILE_REPORT_QORY_CARD_BG}`}
    >
      {Icon ? (
        <HugeiconsIcon
          icon={Icon}
          size={48}
          strokeWidth={1.65}
          primaryColor={panel.accent}
          className="h-11 w-11 shrink-0 sm:h-12 sm:w-12"
          aria-hidden
        />
      ) : null}
      <h3 className="mt-4 text-[1.4rem] font-semibold leading-[1.08] tracking-[-0.04em] text-white sm:mt-5 sm:text-[1.55rem]">
        {panel.title}
      </h3>
      <p className="mt-3 text-[0.875rem] leading-relaxed text-white/85 sm:text-[0.9375rem]">
        {panel.body}
      </p>
    </article>
  );
}

/** Mobile : « Trois étapes » — fond noir pur ; cartes en `#121418`. */
const MOBILE_HOW_IT_WORKS_SECTION_BG = 'bg-black';

/** Mobile : « Le rapport Qory » — même fond que le footer `#121418`. */
const MOBILE_REPORT_QORY_SECTION_BG = 'bg-[#121418]';

/** Cartes « Le rapport Qory » mobile : gris plus clair que le fond pour les faire ressortir. */
const MOBILE_REPORT_QORY_CARD_BG = 'bg-[#2a323e]';

/** Mobile : « Trois étapes » puis « Le rapport » ; desktop = carrousel `md+`. */
function ReportCarouselMobileFallback({
  stackTitle,
}: {
  stackTitle: ReactNode;
  /** Conservé pour l’API ; le bloc mobile force un thème sombre. */
  stackTone?: Tone;
  /** Conservé pour l’API avec le parent ; non affiché sur mobile (pas de barre d’accent). */
  stackAccentLine?: string;
}) {
  return (
    <div className="md:hidden" aria-label="Aperçu du rapport et étapes">
      {/* 1. Trois étapes — fond noir pur */}
      <section className={MOBILE_HOW_IT_WORKS_SECTION_BG}>
        <MobileSectionBgHairline />
        <div className="px-5 pb-12 pt-12 sm:px-6 sm:pb-14 sm:pt-14">
          <StackChapterLayout
            title={stackTitle}
            tone="dark"
            rightSlot={<HomeMobileHowItWorksCcmCards />}
          />
        </div>
      </section>

      {/* 2. Rapport Qory — fond footer */}
      <section className={MOBILE_REPORT_QORY_SECTION_BG}>
        <MobileSectionBgHairline />
        <div className="px-5 pb-12 pt-12 sm:px-6 sm:pb-14 sm:pt-14">
          <h2 className="max-w-2xl text-balance text-left text-[clamp(1.95rem,6.5vw,2.65rem)] font-semibold leading-[0.98] tracking-tight text-white">
            Le rapport{' '}
            <TitleDecoPill color={REPORT_DECO_BLUE} titleInk="onLight" revealOrder={0}>
              Qory
            </TitleDecoPill>
          </h2>
          <div className="mt-8 flex flex-col gap-5 sm:mt-10 sm:gap-6">
            {reportPanels.map((panel) => (
              <ReportCarouselMobileStackCard key={panel.key} panel={panel} />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

function ReportColorCrushChapter({
  bg,
  nextBg,
  stackTitle,
  stackTone,
  stackAccentLine,
  stackNextBg,
}: {
  bg: string;
  nextBg: string;
  stackTitle: ReactNode;
  stackTone: Tone;
  stackAccentLine?: string;
  stackNextBg: string;
}) {
  const reduceMotion = useReducedMotion();
  const ref = useRef<HTMLElement | null>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end end'],
  });
  const { scrollYProgress: reportEntryProgress } = useScroll({
    target: ref,
    offset: ['start end', 'start start'],
  });

  const reportH = Math.max(380, Math.round(110 + 440));
  const totalH = reportH + REPORT_STACK_FOLLOW_SVH;
  const reportScrollRatio = reportH / totalH;

  const carouselProgress = useTransform(scrollYProgress, (sp) => Math.min(1, sp / reportScrollRatio));

  const stackBlendStartSp = REPORT_STACK_BLEND_CAROUSEL_P * reportScrollRatio;
  const stackProgress = useTransform(scrollYProgress, (sp) => {
    if (sp <= stackBlendStartSp) return 0;
    return (sp - stackBlendStartSp) / (1 - stackBlendStartSp);
  });

  /** Même courbe / clamp que StackChapter (pas de palier y=0 puis saut à 0,1). */
  const stackTitleColumnY = useTransform(
    stackProgress,
    [0.1, 0.65, 0.92],
    reduceMotion ? [0, 0, 0] : [56, 12, -6]
  );
  const stackAccentLineScale = useTransform(
    stackProgress,
    [0.2, 0.65],
    reduceMotion ? [0, 0] : [0, 1]
  );
  /**0 → 1 en phase avec le voile ChapterBackdrop ([0,72,1] sur la hauteur). */
  const stackVeilPhase = useTransform(stackProgress, (p) => {
    if (p < 0.72) return 0;
    return (p - 0.72) / (1 - 0.72);
  });
  const stackVeilLogoOpacity = useTransform(
    stackVeilPhase,
    [0, 0.14, 1],
    reduceMotion ? [0, 1, 1] : [0, 1, 1]
  );
  const stackVeilLogoScale = useTransform(
    stackVeilPhase,
    [0, 1],
    reduceMotion ? [1, 1] : [0.76, 1]
  );

  const trackX = useTransform(carouselProgress, (p) => {
    const left = reportCarouselTrackLeftVw(p, reduceMotion, REPORT_CAROUSEL_TRACK_PANEL_COUNT);
    return `${-left}vw`;
  });
  const firstAssetScale = useTransform(
    reportEntryProgress,
    [0.14, REPORT_ENTRY_REVEAL_END],
    reduceMotion ? [1.04, 1.04] : [REPORT_ASSET_SCALE_MAX, 1.04]
  );
  /** Entrée étalée (comme la zone « Trois étapes ») : évite le palier brutal avant le scroll carrousel. */
  const firstTitleOpacity = useTransform(
    reportEntryProgress,
    [0.1, 0.26, 0.92, REPORT_ENTRY_REVEAL_END],
    reduceMotion ? [1, 1, 1, 1] : [0, 1, 1, 1]
  );
  const firstTitleY = useTransform(
    reportEntryProgress,
    [0.1, 0.38, 0.72, REPORT_ENTRY_REVEAL_END],
    reduceMotion ? [0, 0, 0, 0] : [58, 28, 8, 0]
  );
  /** Barre sous le titre de section « Le rapport… » — même fenêtre que StackChapterLayout (accent). */
  const reportHeadlineAccentLineScale = useTransform(
    reportEntryProgress,
    [0.22, 0.58],
    reduceMotion ? [1, 1] : [0, 1]
  );
  const firstTopCacheY = useTransform(
    reportEntryProgress,
    [0.12, REPORT_ENTRY_REVEAL_END],
    reduceMotion ? ['-100%', '-100%'] : ['0%', '-102%']
  );
  const firstBottomCacheY = useTransform(
    reportEntryProgress,
    [0.12, REPORT_ENTRY_REVEAL_END],
    reduceMotion ? ['100%', '100%'] : ['0%', '102%']
  );
  const firstPanelY = useTransform(
    reportEntryProgress,
    [0, 0.14, 0.38, 0.62, 0.86, REPORT_ENTRY_REVEAL_END],
    reduceMotion ? [0, 0, 0, 0, 0, 0] : [300, 215, 118, 48, 14, 0]
  );
  const reportHeadlineY = useTransform(
    reportEntryProgress,
    [0, 0.58, 1],
    reduceMotion ? [0, 0, 0] : [14, 4, 0]
  );
  const reportHeadlineOpacity = useTransform(
    reportEntryProgress,
    [0, 0.18, 0.48],
    reduceMotion ? [1, 1, 1] : [0.88, 0.94, 1]
  );
  const carouselBackdropFadeStart = Math.min(0.82, REPORT_STACK_BLEND_CAROUSEL_P + 0.06);
  const carouselBackdropOpacity = useTransform(
    carouselProgress,
    [0, carouselBackdropFadeStart, 0.98],
    reduceMotion ? [1, 1, 0] : [1, 1, 0]
  );

  return (
    <>
      <ReportCarouselMobileFallback
        stackTitle={stackTitle}
        stackTone={stackTone}
        stackAccentLine={stackAccentLine}
      />
      <section ref={ref} className="relative hidden md:block" style={{ height: `${totalH}svh`, backgroundColor: bg }}>
      <div className="sticky top-0 h-screen overflow-hidden">
        <div
          className="pointer-events-none absolute inset-0 z-0"
          style={{ backgroundColor: nextBg }}
          aria-hidden
        />

        <div className="pointer-events-none absolute inset-0 z-[8] flex items-start">
          <ChapterBackdrop
            progress={stackProgress}
            bg={nextBg}
            nextBg={stackNextBg}
            veilCenterContent={
              <motion.img
                src="/logo.svg"
                alt=""
                width={183}
                height={183}
                draggable={false}
                className="h-[min(18vw,7.5rem)] w-[min(18vw,7.5rem)] shrink-0 brightness-0 invert"
                style={{ opacity: stackVeilLogoOpacity, scale: stackVeilLogoScale }}
              />
            }
          />
          <div className="pointer-events-auto relative z-10 flex h-full w-full items-start overflow-x-hidden px-6 pb-8 pt-24 sm:px-10 sm:pb-10 sm:pt-28 lg:px-16 lg:pb-10 lg:pt-[7.25rem]">
            <StackChapterLayout
              title={stackTitle}
              tone={stackTone}
              accentLine={stackAccentLine}
              titleColumnY={stackTitleColumnY}
              accentLineScale={stackAccentLineScale}
              rightSlot={<HowItWorksEditorialBubbles tone={stackTone} />}
            />
          </div>
        </div>

        {/* Tout le carrousel est non-interactif : sinon il capte le hover au-dessus des bulles « Trois étapes » (z-10). */}
        <div className="pointer-events-none absolute inset-0 z-20 overflow-hidden [&_*]:pointer-events-none">
          <motion.div
            className="absolute inset-0"
            style={{ backgroundColor: bg, opacity: carouselBackdropOpacity }}
            aria-hidden
          />
          <motion.div className="relative z-10 flex h-full flex-row flex-nowrap" style={{ x: trackX }}>
            <div className="relative z-0 flex h-full w-screen min-w-[100vw] shrink-0 flex-col md:flex-row">
              <motion.div
                className="relative z-0 flex w-full shrink-0 flex-col justify-start px-4 pb-8 pt-8 sm:px-8 sm:pb-10 sm:pt-10 md:h-full md:w-[35%] md:min-w-[35%] md:max-w-[35%] md:py-12 md:pt-12 lg:pl-10 lg:pr-6 lg:pt-14"
                style={{
                  backgroundColor: bg,
                  y: reportHeadlineY,
                  opacity: reportHeadlineOpacity,
                }}
              >
                <h2 className="max-w-[min(36rem,94vw)] text-balance text-[2.7rem] font-semibold leading-[0.96] tracking-tight text-white sm:text-[4.25rem] lg:text-[4.85rem]">
                  Le rapport{' '}
                  <TitleDecoPill color={REPORT_DECO_BLUE} titleInk="onLight" revealOrder={0}>
                    Qory
                  </TitleDecoPill>
                </h2>
                <motion.div
                  className="mt-7 h-[3px] w-28 origin-left"
                  style={{ scaleX: reportHeadlineAccentLineScale, backgroundColor: REPORT_DECO_BLUE }}
                  aria-hidden
                />
              </motion.div>
              <motion.div
                className="relative z-10 flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden md:h-full"
                style={{
                  backgroundColor: reportPanels[0]?.surface ?? '#69D33F',
                  y: firstPanelY,
                }}
              >
                {reportPanels[0] ? (
                  <>
                    <div
                      className="pointer-events-none absolute inset-y-0 left-0 z-30"
                      style={{ width: REPORT_PHOTOBOOTH_RAIL, backgroundColor: reportPanels[0].surface }}
                      aria-hidden
                    />
                    <div
                      className="pointer-events-none absolute inset-y-0 right-0 z-30"
                      style={{ width: REPORT_PHOTOBOOTH_RAIL, backgroundColor: reportPanels[0].surface }}
                      aria-hidden
                    />
                    <div
                      className="pointer-events-none absolute inset-x-0 top-0 z-30"
                      style={{ height: REPORT_PHOTOBOOTH_RAIL, backgroundColor: reportPanels[0].surface }}
                      aria-hidden
                    />
                    <div
                      className="relative min-h-[40svh] w-full shrink-0 md:min-h-0"
                      style={{ flex: `${REPORT_ASSET_PHOTO_FLEX} 1 0%` }}
                    >
                      <div
                        className="absolute bottom-0 overflow-hidden"
                        style={{
                          left: REPORT_PHOTOBOOTH_RAIL,
                          right: REPORT_PHOTOBOOTH_RAIL,
                          top: REPORT_PHOTOBOOTH_RAIL,
                          backgroundColor: reportPanels[0].surface,
                        }}
                      >
                        <motion.div
                          className="h-full min-h-full w-full min-w-full max-w-none [&>img]:block [&>img]:h-full [&>img]:min-h-full [&>img]:w-full [&>img]:min-w-full [&>img]:max-w-none [&>img]:object-cover"
                          style={{
                            scale: firstAssetScale,
                            y: 0,
                            transformOrigin: '50% 50%',
                          }}
                        >
                          <ReportCarouselPhotoboothContent panel={reportPanels[0]} />
                        </motion.div>
                        <motion.div
                          className="absolute inset-x-0 top-0 h-1/2"
                          style={{ y: firstTopCacheY, backgroundColor: reportPanels[0].surface }}
                          aria-hidden
                        />
                        <motion.div
                          className="absolute inset-x-0 bottom-0 h-1/2"
                          style={{ y: firstBottomCacheY, backgroundColor: reportPanels[0].surface }}
                          aria-hidden
                        />
                      </div>
                    </div>
                    <div
                      className="relative z-20 -mt-px min-h-0 w-full shrink-0"
                      style={{
                        flex: `${REPORT_ASSET_COLORBAND_FLEX} 1 0%`,
                        backgroundColor: reportPanels[0]?.surface ?? '#69D33F',
                      }}
                    >
                      <span
                        className="absolute bottom-4 text-[0.68rem] font-semibold tracking-[0.18em]"
                        style={{
                          left: REPORT_PHOTOBOOTH_CONTENT_PAD,
                          color: reportPanels[0].titleColor,
                          opacity: 0.58,
                        }}
                      >
                        {reportPanels[0].number}
                      </span>
                      <motion.div
                        className="absolute top-0 max-w-[min(100%,14rem)] sm:max-w-[min(100%,18rem)]"
                        style={{
                          left: REPORT_PHOTOBOOTH_CONTENT_PAD,
                          right: REPORT_PHOTOBOOTH_CONTENT_PAD,
                          top: REPORT_PHOTOBOOTH_CONTENT_PAD,
                          opacity: firstTitleOpacity,
                          y: firstTitleY,
                        }}
                      >
                        <p
                          className="text-[3.1rem] font-semibold leading-[0.86] tracking-[-0.07em] sm:text-[4.7rem] lg:text-[5.6rem]"
                          style={{ color: reportPanels[0].titleColor }}
                        >
                          {reportPanels[0].title}
                        </p>
                      </motion.div>
                    </div>
                  </>
                ) : null}
              </motion.div>
            </div>

            {reportPanels.slice(1).map((panel, index) => (
              <ReportColorPanelColumn
                key={panel.key}
                panel={panel}
                panelIndex={index}
                progress={carouselProgress}
                reduceMotion={reduceMotion}
              />
            ))}
          </motion.div>
        </div>

        <p className="sr-only">
          Carrousel avec titre de section et barre d’accent animés au scroll, puis Trois étapes en bulles décalées, pictogramme Qory blanc sur le voile, puis section suivante.
        </p>
      </div>
    </section>
    </>
  );
}

/* ═══════════════════════════════════════════════════
   AudienceChapter — title + compact site type cards
   ═══════════════════════════════════════════════════ */

function AudienceChapter({
  bg,
  nextBg,
  id,
}: {
  bg: string;
  nextBg: string;
  id?: string;
}) {
  const reduceMotion = useReducedMotion();
  const ref = useRef<HTMLElement | null>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });
  const contentY = useTransform(scrollYProgress, [0.1, 0.65, 0.92], reduceMotion ? [0, 0, 0] : [76, 0, -22]);
  const cardsY = useTransform(scrollYProgress, [0.16, 0.68, 0.92], reduceMotion ? [0, 0, 0] : [46, 0, -18]);

  const titleBlock = (
    <>
      <h2 className="max-w-[14ch] text-balance text-[clamp(2rem,6.5vw,2.75rem)] font-semibold leading-[0.94] tracking-tight text-white sm:text-[4.35rem] lg:text-[5.15rem]">
        Qui utilise{' '}
        <TitleDecoPill color={REPORT_DECO_CORAL} titleInk="onDark">
          Qory.
        </TitleDecoPill>
      </h2>
      <p className="mt-6 max-w-md text-base leading-relaxed text-[#D1D1D6] sm:text-lg sm:leading-relaxed">
        Des sites qui doivent être compris, recommandés et comparés correctement par les IA.
      </p>
    </>
  );

  const cardsGrid = (
    <div className="grid min-h-0 grid-cols-1 gap-3 pt-1 sm:grid-cols-2 sm:gap-4 lg:gap-5">
      {PAID_SCAN_TYPE_OPTIONS.map((option, index) => (
        <motion.div
          key={option.id}
          className="group relative flex min-h-[5.65rem] items-end overflow-hidden rounded-[1.65rem] bg-[#121418] p-5 text-left max-md:border max-md:border-white/[0.14] sm:min-h-[7.35rem] sm:p-6 lg:min-h-[8rem] lg:rounded-[2rem]"
          initial={reduceMotion ? false : { opacity: 0, y: 18 }}
          whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.35 }}
          transition={{ duration: 0.58, delay: index * 0.035, ease: [0.16, 1, 0.3, 1] }}
        >
          <TypeOptionIcon
            type={option.id}
            size={48}
            strokeWidth={1.8}
            className="absolute right-5 top-5 h-10 w-10 text-[#4BA7F5] sm:right-6 sm:top-6 sm:h-12 sm:w-12 lg:h-14 lg:w-14"
          />
          <div className="relative max-w-[11ch] text-[1.25rem] font-semibold leading-[1.02] tracking-[-0.055em] text-white sm:text-[1.65rem] lg:text-[1.85rem]">
            {option.label}
          </div>
        </motion.div>
      ))}
    </div>
  );

  return (
    <div id={id}>
      <section className="relative bg-black md:hidden">
        <MobileSectionBgHairline />
        <div className="px-6 pb-16 pt-16 sm:px-10 sm:pb-20 sm:pt-20">
          <div className="grid w-full items-start gap-10">
            <div>{titleBlock}</div>
            {cardsGrid}
          </div>
        </div>
      </section>
      <section ref={ref} className="relative hidden h-[200svh] md:block" style={{ backgroundColor: bg }}>
        <div className="sticky top-0 h-screen overflow-hidden">
          <ChapterBackdrop progress={scrollYProgress} bg={bg} nextBg={nextBg} />
          <div className="relative z-10 flex h-full px-6 pb-14 pt-16 sm:px-10 lg:px-16 lg:pb-16 lg:pt-20">
            <div className="grid w-full items-start gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-14">
              <motion.div style={{ y: contentY }}>{titleBlock}</motion.div>
              <motion.div style={{ y: cardsY }}>{cardsGrid}</motion.div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   FaqChapter — title left, Q&A right
   ═══════════════════════════════════════════════════ */

function FaqChapter({
  items,
  bg,
  nextBg,
  tone,
  id,
}: {
  items: Array<{ question: string; answer: string }>;
  bg: string;
  nextBg: string;
  tone: Tone;
  id?: string;
}) {
  const reduceMotion = useReducedMotion();
  const ref = useRef<HTMLElement | null>(null);
  const [openIndexMobile, setOpenIndexMobile] = useState<number | null>(null);
  const [openIndexDesktop, setOpenIndexDesktop] = useState<number | null>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });
  const leftY = useTransform(scrollYProgress, [0.1, 0.65, 0.92], reduceMotion ? [0, 0, 0] : [60, 0, -20]);
  const rightY = useTransform(scrollYProgress, [0.1, 0.65, 0.92], reduceMotion ? [0, 0, 0] : [80, 0, -30]);
  const classes = toneClasses(tone);

  const faqList = (openIndex: number | null, setOpen: (v: number | null) => void) => (
    <div className="w-full max-w-[48rem] border-t border-white/[0.14]">
      {items.map((faq, index) => {
        const isOpen = openIndex === index;
        return (
          <div key={faq.question} className="border-b border-white/[0.14]">
            <button
              type="button"
              onClick={() => setOpen(isOpen ? null : index)}
              aria-expanded={isOpen}
              className="group flex w-full items-center justify-between gap-6 py-5 text-left sm:py-6 lg:py-7"
            >
              <span className={`max-w-[42rem] text-lg font-semibold leading-tight sm:text-xl lg:text-[1.55rem] lg:leading-[1.16] ${classes.title}`}>
                {faq.question}
              </span>
              <motion.span
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-white/52 transition-colors group-hover:text-white"
                animate={{ rotate: isOpen ? 180 : 0 }}
                transition={{ duration: reduceMotion ? 0 : 0.28, ease: [0.16, 1, 0.3, 1] }}
                aria-hidden
              >
                <svg viewBox="0 0 20 20" className="h-5 w-5" fill="none">
                  <path d="m5 7.5 5 5 5-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </motion.span>
            </button>
            <motion.div
              initial={false}
              animate={{
                height: isOpen ? 'auto' : 0,
                opacity: isOpen ? 1 : 0,
              }}
              transition={{ duration: reduceMotion ? 0 : 0.34, ease: [0.16, 1, 0.3, 1] }}
              className="overflow-hidden"
            >
              <p className={`max-w-[43rem] pb-6 text-base leading-relaxed sm:text-lg lg:text-[1.08rem] lg:leading-[1.65] ${classes.body}`}>
                {faq.answer}
              </p>
            </motion.div>
          </div>
        );
      })}
    </div>
  );

  return (
    <div id={id}>
      <section className="relative md:hidden" style={{ backgroundColor: bg }}>
        <MobileSectionBgHairline />
        <div className="px-6 pb-12 pt-16 max-md:pb-14 sm:px-10">
          <div className="max-w-[31rem]">
            <h2 className={`text-balance text-[clamp(1.95rem,6.2vw,2.7rem)] font-semibold leading-[0.96] tracking-tight ${classes.title}`}>
              Questions fréquentes
            </h2>
          </div>
          <div className="mt-10">{faqList(openIndexMobile, setOpenIndexMobile)}</div>
        </div>
      </section>
      <section ref={ref} className="relative hidden h-[200svh] md:block" style={{ backgroundColor: bg }}>
        <div className="sticky top-0 z-10 h-screen overflow-hidden">
          <ChapterBackdrop progress={scrollYProgress} bg={bg} nextBg={nextBg} />
          <div className="relative z-10 grid h-full lg:grid-cols-[0.84fr_1.16fr] lg:gap-6">
            <motion.div className="flex items-start px-6 pb-16 pt-16 sm:px-10 lg:px-16 lg:pt-20" style={{ y: leftY }}>
              <div className="max-w-[31rem]">
                <h2 className={`text-balance text-[clamp(1.95rem,6.2vw,2.7rem)] font-semibold leading-[0.96] tracking-tight sm:text-[4.25rem] lg:text-[4.85rem] ${classes.title}`}>
                  Ce qu&apos;il faut savoir avant de lancer votre{' '}
                  <TitleDecoScribble color={REPORT_DECO_GREEN}>audit</TitleDecoScribble>
                </h2>
              </div>
            </motion.div>
            <motion.div className="flex items-start px-6 pb-14 pt-16 sm:px-10 lg:px-14 lg:pt-20" style={{ y: rightY }}>
              {faqList(openIndexDesktop, setOpenIndexDesktop)}
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   TarifChapter — pricing split
   ═══════════════════════════════════════════════════ */

function TarifChapter({
  bg,
  nextBg,
  tone,
  id,
}: {
  bg: string;
  nextBg: string;
  tone: Tone;
  id?: string;
}) {
  const reduceMotion = useReducedMotion();
  const ref = useRef<HTMLElement | null>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });
  const textMotion = useTransform(scrollYProgress, [0.1, 0.65, 0.92], reduceMotion ? [0, 0, 0] : [80, 0, -24]);
  const classes = toneClasses(tone);
  /** Fond sombre sur mobile quand la section desktop est blanche. */
  const classesMobile = tone === 'light' ? toneClasses('dark') : classes;

  const features = [
    'Score global + détail par pilier',
    'Visibilité par modèle IA (ChatGPT, Claude, Perplexity)',
    'Analyse concurrentielle',
    'Plan d\u2019action priorisé',
    'Rapport complet en français',
  ];

  const checkFill = REPORT_DECO_GREEN;
  const checkStroke = '#FFFFFF';

  const priceEl = (c: ReturnType<typeof toneClasses>) => (
    <p className={`m-0 shrink-0 font-semibold leading-none tracking-[-0.04em] ${c.title}`}>
      <span className="inline-block text-[clamp(2.75rem,9vw,6.25rem)] leading-none">9,99</span>
      <span className="ml-1 inline-block align-baseline text-[clamp(1.35rem,3.5vw,2.75rem)] leading-none">€</span>
    </p>
  );

  /**
   * `surfaceLight` : fond clair (CTA principal foncé). `surfaceLight === false` : fond sombre (CTA principal clair).
   * `headingPlacement` : mobile = « Tarif Qory », desktop = titre historique « Un audit. Un prix. »
   */
  const tarifBody = (
    c: ReturnType<typeof toneClasses>,
    surfaceLight: boolean,
    headingPlacement: 'mobile' | 'desktop',
  ) => (
    <div className="w-full">
      {headingPlacement === 'mobile' ? (
        <h2
          className={`max-w-[min(100%,20ch)] text-balance text-[clamp(2rem,6.5vw,2.85rem)] font-semibold leading-[0.94] tracking-[-0.03em] sm:text-[4.25rem] lg:text-[clamp(3.5rem,6.5vw,5.75rem)] ${c.title}`}
        >
          Tarif Qory
        </h2>
      ) : (
        <h2
          className={`max-w-[14ch] text-balance text-[clamp(2rem,6.5vw,2.85rem)] font-semibold leading-[0.94] tracking-[-0.03em] sm:text-[4.25rem] lg:text-[clamp(3.5rem,6.5vw,5.75rem)] ${c.title}`}
        >
          <span className="block">Un audit.</span>
          <span className="block">
            Un <TitleDecoScribble color={REPORT_DECO_GREEN}>prix.</TitleDecoScribble>
          </span>
        </h2>
      )}

      <div className="mt-8 grid gap-5 sm:mt-9 sm:gap-6 lg:mt-10 lg:grid-cols-2 lg:items-stretch lg:gap-x-12 lg:gap-y-5">
        <div className="min-w-0 lg:col-start-1 lg:row-start-1">
          <h3 className={`text-lg font-semibold tracking-tight sm:text-xl ${c.title}`}>Offre unique</h3>
          <ul className="mt-6 max-w-xl space-y-4 sm:mt-7">
            {features.map((feature) => (
              <li key={feature} className="flex items-start gap-3">
                <svg className="mt-0.5 h-5 w-5 shrink-0" viewBox="0 0 20 20" fill="none" aria-hidden>
                  <circle cx="10" cy="10" r="10" fill={checkFill} />
                  <path
                    d="M6 10.5l2.5 2.5 5.5-5.5"
                    stroke={checkStroke}
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <span className={`text-[0.95rem] leading-snug sm:text-base sm:leading-relaxed ${c.body}`}>
                  {feature}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex flex-row items-end justify-between gap-4 lg:col-start-1 lg:row-start-2 lg:justify-start">
          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end sm:gap-4">
            <Link
              href="/audit"
              className={`inline-flex h-14 items-center justify-center rounded-full px-7 text-base font-semibold transition-colors duration-300 ${
                surfaceLight ? 'bg-black text-white hover:bg-[#1A1A1A]' : 'bg-white text-black hover:bg-[#F2F2F2]'
              }`}
            >
              Lancer l&apos;audit
            </Link>
            <Link
              href="/tarifs"
              className={`inline-flex h-14 items-center justify-center rounded-full border px-7 text-base font-semibold transition-colors ${
                surfaceLight
                  ? 'border-black/[0.12] text-[#1D1D1F] hover:bg-black/[0.04]'
                  : 'border-white/[0.14] text-white hover:bg-white/[0.08]'
              }`}
            >
              Voir les tarifs
            </Link>
          </div>
          <div className="self-end lg:hidden">{priceEl(c)}</div>
        </div>

        <div className="hidden lg:col-start-2 lg:row-start-1 lg:row-span-2 lg:flex lg:flex-col lg:justify-end lg:items-end lg:text-right">
          {priceEl(c)}
        </div>
      </div>
    </div>
  );

  return (
    <div id={id}>
      <section
        className={`relative md:hidden ${tone === 'light' ? 'bg-[#121418]' : ''}`}
        style={tone === 'light' ? undefined : { backgroundColor: bg }}
      >
        <MobileSectionBgHairline />
        <div className="px-6 pb-20 pt-14 sm:px-10 sm:pb-24 sm:pt-16">
          {tarifBody(classesMobile, false, 'mobile')}
        </div>
      </section>
      <section ref={ref} className="relative hidden h-[200svh] md:block" style={{ backgroundColor: bg }}>
        <div className="sticky top-0 h-screen overflow-hidden">
          <ChapterBackdrop progress={scrollYProgress} bg={bg} nextBg={nextBg} />
          <motion.div
            className="relative z-10 flex h-full items-start px-6 pb-20 pt-14 sm:px-10 sm:pb-24 sm:pt-16 lg:px-16 lg:pb-28 lg:pt-20"
            style={{ y: textMotion }}
          >
            {tarifBody(classes, tone === 'light', 'desktop')}
          </motion.div>
        </div>
      </section>
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   FinalCtaSection
   ═══════════════════════════════════════════════════ */

function FinalCtaSection({
  url,
  error,
  onUrlChange,
  onUrlSubmit,
}: {
  url: string;
  error: string;
  onUrlChange: (value: string) => void;
  onUrlSubmit: (event: FormEvent<HTMLFormElement>) => void;
}) {
  return (
    <section className="relative bg-black md:min-h-[100svh] md:bg-[#4BA7F5]">
      <div className="flex flex-col items-center justify-center px-6 pt-10 pb-28 sm:px-10 md:min-h-[100svh] md:py-0 lg:px-16">
        <div className="mx-auto w-full max-w-5xl text-center">
          <h2 className="text-balance text-[clamp(2.1rem,7vw,3rem)] font-semibold leading-[0.94] tracking-tight text-white sm:text-[4.5rem] lg:text-[5.35rem]">
            Mesurez votre visibilité IA
          </h2>

          <form onSubmit={onUrlSubmit} className="mx-auto mt-10 w-full max-w-3xl sm:mt-12">
            <div className="relative flex min-h-[62px] items-center rounded-[31px] border border-white/[0.18] bg-white/[0.12] p-[5px] sm:min-h-[66px] sm:rounded-[33px] sm:p-[7px]">
              <span className="pointer-events-none absolute left-[18px] top-1/2 -translate-y-1/2 text-white sm:left-5">
                <HugeiconsIcon
                  icon={Globe02Icon}
                  size={22}
                  className="h-[22px] w-[22px] opacity-50 [&_*]:[stroke-linecap:butt] [&_*]:[stroke-linejoin:miter]"
                  aria-hidden="true"
                />
              </span>
              <input
                type="text"
                value={url}
                onChange={(e) => onUrlChange(e.target.value)}
                placeholder="https://votre-site.fr"
                className="min-w-0 flex-1 bg-transparent pl-12 pr-3 text-base text-white outline-none transition-colors placeholder:text-white/50 sm:pl-14 sm:pr-4 sm:text-lg"
              />
              <button
                type="submit"
                className="inline-flex h-[52px] shrink-0 items-center justify-center rounded-[26px] bg-white px-3.5 text-base font-semibold whitespace-nowrap text-black transition-colors hover:bg-[#F2F2F2] sm:px-5 sm:text-lg md:px-7"
              >
                Analyser
              </button>
            </div>
            {error ? <div className="mt-3 text-left text-sm text-red-200">{error}</div> : null}
          </form>
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════
   Main Component
   ═══════════════════════════════════════════════════ */

type HomeMarketingSectionsProps = {
  url: string;
  error: string;
  onUrlChange: (value: string) => void;
  onUrlSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  faqItemsOverride?: Array<{ question: string; answer: string }>;
};

export default function HomeMarketingSections({
  url,
  error,
  onUrlChange,
  onUrlSubmit,
  faqItemsOverride,
}: HomeMarketingSectionsProps) {
  const resolvedFaqItems = faqItemsOverride ?? faqItems;

  return (
    <div className="relative">
      {/* 2. Statement */}
      <StatementSection />

      {/* 3. Problème — angles morts */}
      <ProblemChapter
        title={<>Pourquoi agir&nbsp;?</>}
        items={problemAnglesItems}
        bg="#0B0B0C"
        nextBg="#FFFFFF"
      />

      {/* 4. Méthode — Headline layout */}
      <HeadlineChapter
        id="methode"
        title={
          <>
            <span className="block sm:whitespace-nowrap">
              Quatre{' '}
              <TitleDecoPill color={REPORT_DECO_BLUE} titleInk="onLight" revealOrder={0}>
                lectures.
              </TitleDecoPill>
            </span>
            <span className="mt-1 block sm:mt-1.5 sm:whitespace-nowrap">
              Un{' '}
              <TitleDecoScribble color={REPORT_DECO_GREEN} revealOrder={1}>
                diagnostic.
              </TitleDecoScribble>
            </span>
          </>
        }
        methodeBlocks={methodeLectureBlocks}
        bg="#FFFFFF"
        nextBg="#05070D"
        tone="light"
        accentLine="#4BA7F5"
        showOnMobile={false}
      />

      {/* 5. Rapport + 6. Comment ça marche — même sticky (scroll fusionné) */}
      <ReportColorCrushChapter
        bg="#05070D"
        nextBg="#FFFFFF"
        stackTitle={<>Trois étapes simples.</>}
        stackTone="light"
        stackAccentLine="#4BA7F5"
        stackNextBg="#0B0B0C"
      />

      {/* 7. Pour qui — compact cards */}
      <AudienceChapter
        id="pour-qui"
        bg="#0B0B0C"
        nextBg="#FFFFFF"
      />

      {/* 8. Tarif — Split layout */}
      <TarifChapter
        id="tarif"
        bg="#FFFFFF"
        nextBg="#000000"
        tone="light"
      />

      {/* 9. FAQ — FAQ layout */}
      <FaqChapter
        id="faq"
        items={resolvedFaqItems}
        bg="#000000"
        nextBg="#4BA7F5"
        tone="dark"
      />

      {/* 10. Final CTA */}
      <FinalCtaSection
        url={url}
        error={error}
        onUrlChange={onUrlChange}
        onUrlSubmit={onUrlSubmit}
      />

      {/* Footer */}
      <SiteFooter className="relative mt-0 max-md:border-t max-md:border-solid max-md:border-white/[0.22] md:border-t-0 rounded-none bg-[#121418] px-4 pb-10 pt-12 text-white sm:px-6 sm:pb-12 sm:pt-14 md:pb-16 md:pt-16" />
    </div>
  );
}

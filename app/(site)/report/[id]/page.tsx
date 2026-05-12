'use client';

import { useEffect, useRef, useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { createPortal } from 'react-dom';
import { HugeiconsIcon } from '@hugeicons/react';
import type { IconSvgElement } from '@hugeicons/react';
import {
  ActivitySparkIcon,
  AddMoneyCircleIcon,
  AiSearchIcon,
  AlertDiamondIcon,
  AlertSquareIcon,
  Award01Icon,
  BrainIcon,
  CheckmarkBadge02Icon,
  ChartBarLineIcon,
  ChartDownIcon,
  ChartUpIcon,
  CheckmarkCircle02Icon,
  CustomerService01Icon,
  Copy01Icon,
  DeliveryBox01Icon,
  HelpCircleIcon,
  IdeaIcon,
  InstagramIcon,
  Linkedin01Icon,
  Mail01Icon,
  NewTwitterIcon,
  PrinterIcon,
  Shield01Icon,
  SparklesIcon,
  StarIcon,
  Target01Icon,
  TiktokIcon,
  TimeQuarterPassIcon,
} from '@hugeicons/core-free-icons';
import type {
  Audit,
  Recommendation,
  RecommendationAxis,
  RecommendationPhase,
  Report,
} from '@/types';
import { buildGlobalExecutiveSummary, buildReportSynthesis } from '@/lib/report/synthesis';
import { getSitemapVerdict, getStructuredDataVerdict } from '@/lib/scanner/crawl-status';
import { useRouteProgressRouter } from '@/app/components/route-progress';
import QoryWord from '@/app/components/qory-word';
import SiteSpinner from '@/app/components/site-spinner';

const PREFETCHED_REPORT_STORAGE_PREFIX = 'prefetched-report:';

function getDisplayDomain(rawUrl: string) {
  const fallbackDomain = rawUrl
    .trim()
    .replace(/^https?:\/\//i, '')
    .replace(/^www\./i, '')
    .split('/')[0];

  try {
    const normalizedUrl = /^https?:\/\//i.test(rawUrl) ? rawUrl : `https://${rawUrl}`;
    return new URL(normalizedUrl).hostname.replace(/^www\./i, '') || fallbackDomain;
  } catch {
    return fallbackDomain;
  }
}

function getFallbackFaviconUrl(rawUrl: string): string | null {
  try {
    const normalizedUrl = /^https?:\/\//i.test(rawUrl) ? rawUrl : `https://${rawUrl}`;
    const parsedUrl = new URL(normalizedUrl);
    return `${parsedUrl.origin}/favicon.ico`;
  } catch {
    return null;
  }
}

function consumePrefetchedReport(auditId: string): Audit | null {
  if (typeof window === 'undefined') return null;

  const storageKey = `${PREFETCHED_REPORT_STORAGE_PREFIX}${auditId}`;

  try {
    const raw = window.sessionStorage.getItem(storageKey);
    if (!raw) return null;
    window.sessionStorage.removeItem(storageKey);
    return JSON.parse(raw) as Audit;
  } catch {
    window.sessionStorage.removeItem(storageKey);
    return null;
  }
}

function slugifyRecommendationTitle(title: string): string {
  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '') || 'recommendation';
}

function inferAxisFromLegacyRecommendation(
  recommendation: Pick<Recommendation, 'title' | 'description'>
): RecommendationAxis {
  const text = `${recommendation.title} ${recommendation.description}`.toLowerCase();
  if (
    text.includes('schema') ||
    text.includes('robots') ||
    text.includes('sitemap') ||
    text.includes('https')
  ) {
    return 'readable';
  }
  if (
    text.includes('prix') ||
    text.includes('offre') ||
    text.includes('positionnement') ||
    text.includes('informations')
  ) {
    return 'offer';
  }
  if (
    text.includes('faq') ||
    text.includes('requ') ||
    text.includes('page') ||
    text.includes('compar')
  ) {
    return 'citable';
  }
  return 'credible';
}

function inferPhaseFromLegacyRecommendation(priority: number): RecommendationPhase {
  if (priority <= 2) return 'this_week';
  if (priority <= 5) return 'this_month';
  return 'later';
}

function getAxisLabel(axis: RecommendationAxis): string {
  switch (axis) {
    case 'readable':
      return 'Lisibilité IA';
    case 'offer':
      return 'Offre claire';
    case 'citable':
      return 'Citable';
    case 'credible':
      return 'Crédibilité';
    default:
      return 'Action';
  }
}

function normalizeRecommendationCopy(text: string): string {
  return text
    .replace(
      /Ajouter davantage de preuves de confiance visibles/gi,
      'Ajouter davantage de preuves de confiance visibles'
    )
    .replace(
      /Des preuves de confiance visibles aident les IA et vos visiteurs a vous juger plus credibles\./gi,
      'Des preuves de confiance visibles aident les IA et vos visiteurs à vous juger plus crédibles.'
    )
    .replace(
      /Uniformiser vos informations cles sur tout le site/gi,
      'Uniformiser vos informations clés sur tout le site'
    )
    .replace(/\bcles\b/gi, 'clés')
    .replace(/\brequetes\b/gi, 'requêtes')
    .replace(/\breponses\b/gi, 'réponses')
    .replace(/\bdonnees\b/gi, 'données')
    .replace(/\bcitees\b/gi, 'citées')
    .replace(/\bcites\b/gi, 'cités')
    .replace(/\bcredibilite\b/gi, 'crédibilité')
    .replace(/\bcredibles\b/gi, 'crédibles')
    .replace(/\bautorite\b/gi, 'autorité')
    .replace(/\breputation\b/gi, 'réputation')
    .replace(/\bqualite-prix\b/gi, 'qualité-prix')
    .replace(/\bvisibilite\b/gi, 'visibilité')
    .replace(/\borientee\b/gi, 'orientée')
    .replace(/\bcoherentes\b/gi, 'cohérentes')
    .replace(/\bfiabilite\b/gi, 'fiabilité')
    .replace(/\bdeja\b/gi, 'déjà')
    .replace(/\ba vous\b/g, 'à vous')
    .replace(/\ba votre\b/g, 'à votre')
    .replace(/\ba vos\b/g, 'à vos')
    .replace(/\ba mieux\b/g, 'à mieux')
    .replace(/\ba juger\b/g, 'à juger')
    .replace(/\ba retenir\b/g, 'à retenir')
    .replace(/\ba etre\b/gi, 'à être')
    .replace(/\bface a\b/gi, 'face à')
    // accents manquants
    .replace(/\bfacon\b/gi, 'façon')
    .replace(/\bstrategiques\b/gi, 'stratégiques')
    .replace(/\bstrategique\b/gi, 'stratégique')
    .replace(/\bciblees\b/gi, 'ciblées')
    .replace(/\bciblee\b/gi, 'ciblée')
    .replace(/\breutiliser\b/gi, 'réutiliser')
    .replace(/\bCreer\b/g, 'Créer')
    .replace(/\bcreer\b/g, 'créer')
    .replace(/\bCreez\b/g, 'Créez')
    .replace(/\bcreez\b/g, 'créez')
    .replace(/\bDebloquer\b/g, 'Débloquer')
    .replace(/\bdebloquer\b/g, 'débloquer')
    .replace(/\bReduire\b/g, 'Réduire')
    .replace(/\breduire\b/g, 'réduire')
    .replace(/\bprecises\b/gi, 'précises')
    .replace(/\bprecis\b/gi, 'précis')
    .replace(/\bmemorables\b/gi, 'mémorables')
    // à manquant
    .replace(/\ba fort\b/gi, 'à fort')
    .replace(/\bfaciles a\b/gi, 'faciles à')
    .replace(/\ba reutiliser\b/gi, 'à réutiliser')
    // apostrophes manquantes
    .replace(/\bC est\b/g, "C'est")
    .replace(/\bc est\b/g, "c'est")
    .replace(/\bd etre\b/gi, "d'être")
    .replace(/\bl action\b/gi, "l'action")
    .replace(/\bl offre\b/gi, "l'offre")
    .replace(/\bl impact\b/gi, "l'impact")
    .replace(/\bl ecart\b/gi, "l'écart");
}

function normalizeRecommendationsForDisplay(
  recommendations: Report['recommendations']
): Recommendation[] {
  return (recommendations || []).map((recommendation, index) => {
    const priority = recommendation.priority || index + 1;
    const axis = recommendation.axis || inferAxisFromLegacyRecommendation(recommendation);
    const phase = recommendation.phase || inferPhaseFromLegacyRecommendation(priority);

    return {
      ...recommendation,
      title: normalizeRecommendationCopy(recommendation.title),
      description: normalizeRecommendationCopy(recommendation.description),
      id:
        recommendation.id ||
        slugifyRecommendationTitle(normalizeRecommendationCopy(recommendation.title)),
      priority,
      axis,
      phase,
      evidence: recommendation.evidence || [],
    };
  });
}

function RecommendationCard({
  recommendation,
  className = 'bg-elevated',
}: {
  recommendation: Recommendation;
  className?: string;
}) {
  return (
    <div className={`rounded-[18px] p-4 sm:p-6 ${className}`}>
      <div className="font-bold text-sm sm:text-base text-primary mb-1.5 sm:mb-2">
        {recommendation.priority}. {recommendation.title}
      </div>
      <p className="text-secondary text-sm sm:text-base leading-relaxed">
        {recommendation.description}
      </p>
      <div className="mt-3 flex flex-wrap items-center gap-2 sm:mt-4">
        <span
          className={`px-3 py-1 rounded-full text-xs font-semibold ${
            recommendation.difficulty === 'easy'
              ? 'bg-success/10 text-success'
              : recommendation.difficulty === 'medium'
              ? 'bg-warning/10 text-warning'
              : 'bg-error/10 text-error'
          }`}
        >
          {recommendation.difficulty === 'easy'
            ? 'Facile'
            : recommendation.difficulty === 'medium'
            ? 'Technique'
            : 'Complexe'}
        </span>
        <span
          className={`px-3 py-1 rounded-full text-xs font-semibold ${
            recommendation.impact === 'high'
              ? 'bg-error/10 text-error'
              : recommendation.impact === 'medium'
              ? 'bg-warning/10 text-warning'
              : 'bg-success/10 text-success'
          }`}
        >
          Impact: {recommendation.impact === 'high' ? 'Élevé' : recommendation.impact === 'medium' ? 'Moyen' : 'Faible'}
        </span>
      </div>
    </div>
  );
}

function getRecommendationCardSurface(inModal: boolean): string {
  if (inModal) {
    return 'bg-elevated';
  }

  return 'bg-elevated';
}

function renderRecommendationCard(
  recommendation: Recommendation,
  options?: { inModal?: boolean }
) {
  return (
    <RecommendationCard
      key={recommendation.id}
      recommendation={recommendation}
      className={getRecommendationCardSurface(Boolean(options?.inModal))}
    />
  );
}

type InfoTooltipProps = {
  label: string;
  description: string;
  className?: string;
  tooltipClassName?: string;
};

function InfoTooltip({
  label,
  description,
  className = '',
  tooltipClassName = 'w-48 sm:w-60 rounded-[16px] border border-white/[0.08] bg-surface px-2.5 py-2 text-[10px] leading-relaxed text-secondary sm:w-60 sm:px-3 sm:text-[11px]',
}: InfoTooltipProps) {
  return (
    <span className={`group relative inline-flex shrink-0 ${className}`.trim()}>
      <button
        type="button"
        aria-label={label}
        className="inline-flex text-white/55 transition-colors hover:text-white focus:outline-none focus:text-white"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-4 w-4"
          aria-hidden="true"
        >
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="16" x2="12" y2="12" />
          <line x1="12" y1="8" x2="12.01" y2="8" />
        </svg>
      </button>
      <span
        className={`pointer-events-none absolute right-0 top-full z-20 mt-2 opacity-0 shadow-[0_18px_40px_rgba(29,29,31,0.08)] transition-opacity duration-200 group-hover:opacity-100 group-focus-within:opacity-100 ${tooltipClassName}`.trim()}
      >
        {description}
      </span>
    </span>
  );
}

function ReportSectionIcon({
  icon,
  className = 'h-5 w-5 sm:h-6 sm:w-6',
}: {
  icon: IconSvgElement;
  className?: string;
}) {
  return (
    <HugeiconsIcon
      icon={icon}
      size={24}
      strokeWidth={1.9}
      className={className}
    />
  );
}

const reportFooterSocialLinks = [
  { label: 'X', href: '#', icon: NewTwitterIcon },
  { label: 'LinkedIn', href: '#', icon: Linkedin01Icon },
  { label: 'Instagram', href: '#', icon: InstagramIcon },
  { label: 'TikTok', href: '#', icon: TiktokIcon },
] as const;

function ReportFooterBrand() {
  return (
    <footer className="relative left-1/2 w-screen -translate-x-1/2 bg-[#121418] px-4 pb-10 pt-12 text-white sm:px-6 sm:pb-12 sm:pt-14 md:pb-16 md:pt-16">
      <div className="mx-auto max-w-6xl">
        <div className="flex items-center gap-4 sm:gap-5">
          <img
            src="/logo.svg"
            alt="Qory"
            className="h-[3.15rem] w-[3.15rem] shrink-0 brightness-0 invert sm:h-[4.35rem] sm:w-[4.35rem] md:h-[5.3rem] md:w-[5.3rem]"
          />
          <p className="text-[3.9rem] font-semibold leading-[0.88] tracking-tight sm:text-[5.3rem] md:text-[6.6rem]">
            <QoryWord />
          </p>
        </div>

        <div className="mt-10 flex items-center justify-between border-t border-white/20 pt-5 text-sm text-white/70">
          <p>@ 2026 <QoryWord />. All rights reserved.</p>
          <div className="flex items-center gap-3">
            {reportFooterSocialLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                aria-label={link.label}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white transition-colors hover:bg-white/18 hover:text-white"
              >
                <HugeiconsIcon
                  icon={link.icon}
                  size={18}
                  strokeWidth={1.8}
                  className="h-[18px] w-[18px]"
                />
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

function AspectLabelIcon({
  label,
  className = 'h-4 w-4',
}: {
  label: string;
  className?: string;
}) {
  const normalized = label.toLowerCase();
  let icon: IconSvgElement = SparklesIcon;

  if (normalized === 'prix') {
    icon = AddMoneyCircleIcon;
  } else if (normalized === 'rapport qualité-prix') {
    icon = ChartUpIcon;
  } else if (normalized === 'qualité') {
    icon = StarIcon;
  } else if (normalized === 'fiabilité' || normalized === 'confiance') {
    icon = Shield01Icon;
  } else if (normalized === 'support') {
    icon = CustomerService01Icon;
  } else if (normalized === "facilité d'utilisation" || normalized === 'accessibilité') {
    icon = CheckmarkCircle02Icon;
  } else if (normalized === 'choix disponible' || normalized === 'disponibilité') {
    icon = Target01Icon;
  } else if (normalized === 'livraison' || normalized === 'rapidité') {
    icon = TimeQuarterPassIcon;
  } else if (normalized === 'retours') {
    icon = ChartDownIcon;
  } else if (normalized === 'expertise' || normalized === 'autorité') {
    icon = Award01Icon;
  } else if (normalized === 'clarté') {
    icon = IdeaIcon;
  } else if (normalized.includes('ia')) {
    icon = BrainIcon;
  } else if (normalized.includes('boîte') || normalized.includes('box')) {
    icon = DeliveryBox01Icon;
  } else if (normalized.includes('aide')) {
    icon = HelpCircleIcon;
  }

  return <ReportSectionIcon icon={icon} className={className} />;
}

function MarketSignalCard({
  eyebrow,
  title,
  titleClassName,
  onClick,
}: {
  eyebrow: string;
  title: string;
  titleClassName: string;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-haspopup="dialog"
      className="relative flex min-h-[96px] w-full cursor-pointer flex-col items-center justify-center overflow-hidden rounded-[18px] bg-elevated px-4 py-3.5 text-center transition-colors hover:bg-white/[0.08] sm:min-h-[104px] sm:px-5 sm:py-4"
    >
      <p className="mb-2 text-[10px] font-semibold tracking-[0.14em] text-primary uppercase sm:text-[11px]">
        {eyebrow}
      </p>
      <h3 className={`text-base font-bold leading-none tracking-tight sm:text-[1.05rem] ${titleClassName}`}>
        {title}
      </h3>
    </button>
  );
}

function normalizeMarketInsightsForDisplay(
  raw: Report['marketInsights'] | undefined
): Report['marketInsights'] | undefined {
  if (!raw) return raw;

  type MarketInsightsValue = NonNullable<Report['marketInsights']>;

  const candidate = raw as MarketInsightsValue & {
    pricePositioning: MarketInsightsValue['pricePositioning'] & {
      label?:
        | 'budget'
        | 'value'
        | 'premium'
        | 'mixed'
        | 'undetermined'
        | 'accessible'
        | 'mid_market'
        | 'high_end'
        | 'unclear';
    };
    marketSentiment: MarketInsightsValue['marketSentiment'] & {
      label?:
        | 'positive'
        | 'mixed'
        | 'negative'
        | 'undetermined'
        | 'very_positive'
        | 'mixed_positive'
        | 'mixed_negative'
        | 'insufficient_signal';
    };
    polarization: MarketInsightsValue['polarization'] & {
      level?: 'low' | 'medium' | 'high' | 'moderate' | 'insufficient_signal';
    };
    signalStrength?: 'strong' | 'partial' | 'insufficient' | 'medium' | 'weak';
    aiConsensus?: {
      level?: 'strong' | 'partial' | 'fragmented';
      confidence?: 'high' | 'medium' | 'low';
      summary?: string;
    };
    comparisonCriteria?: Array<{
      aspect?: string;
      confidence?: 'high' | 'medium' | 'low';
    }>;
    executiveSummaryLong?: string;
  };

  if (
    candidate.trustLevel &&
    candidate.comparisonAxes &&
    candidate.alternativeFamilies &&
    candidate.sourceMix &&
    candidate.executiveSummary
  ) {
    return candidate;
  }

  const legacyConsensus = candidate.aiConsensus;
  const trustLevel: MarketInsightsValue['trustLevel'] = candidate.trustLevel || {
    level:
      legacyConsensus?.level === 'strong'
        ? 'high'
        : legacyConsensus?.level === 'partial'
        ? 'moderate'
        : legacyConsensus?.level === 'fragmented'
        ? 'low'
        : 'unclear',
    confidence: legacyConsensus?.confidence || 'low',
    summary:
      legacyConsensus?.summary ||
      "Le niveau de confiance perçu n'était pas structuré dans cette version du rapport.",
  };

  const legacyPriceLabel = String(candidate.pricePositioning.label || '');
  const normalizedPriceLabel: MarketInsightsValue['pricePositioning']['label'] =
    legacyPriceLabel === 'value'
      ? 'accessible'
      : legacyPriceLabel === 'mixed'
      ? 'mid_market'
      : legacyPriceLabel === 'undetermined'
      ? 'unclear'
      : candidate.pricePositioning.label;

  const legacySentimentLabel = String(candidate.marketSentiment.label || '');
  const normalizedSentimentLabel: MarketInsightsValue['marketSentiment']['label'] =
    legacySentimentLabel === 'undetermined'
      ? 'insufficient_signal'
      : candidate.marketSentiment.label;

  const legacyPolarizationLevel = String(candidate.polarization.level || '');
  const normalizedPolarizationLevel: MarketInsightsValue['polarization']['level'] =
    legacyPolarizationLevel === 'medium'
      ? 'moderate'
      : candidate.polarization.level;

  return {
    ...candidate,
    pricePositioning: {
      ...candidate.pricePositioning,
      label: normalizedPriceLabel,
    },
    marketSentiment: {
      ...candidate.marketSentiment,
      label: normalizedSentimentLabel,
    },
    polarization: {
      ...candidate.polarization,
      level: normalizedPolarizationLevel,
    },
    trustLevel,
    signalStrength:
      (candidate.signalStrength as 'strong' | 'partial' | 'insufficient' | 'medium' | 'weak' | undefined) === 'strong'
        ? 'strong'
        : (candidate.signalStrength as 'strong' | 'partial' | 'insufficient' | 'medium' | 'weak' | undefined) === 'partial'
        ? 'medium'
        : (candidate.signalStrength as 'strong' | 'partial' | 'insufficient' | 'medium' | 'weak' | undefined) === 'insufficient'
        ? 'weak'
        : candidate.signalStrength || 'weak',
    strengths: candidate.strengths.map((item) => ({
      category: 'other',
      label: item.label,
      evidence: `Cette force ressortait déjà dans la version précédente du rapport, sans preuve structurée plus détaillée.`,
      confidence: item.confidence,
    })),
    weaknesses: candidate.weaknesses.map((item) => ({
      category: 'other',
      label: item.label,
      evidence: `Cette limite ressortait déjà dans la version précédente du rapport, sans preuve structurée plus détaillée.`,
      confidence: item.confidence,
    })),
    comparisonAxes:
      candidate.comparisonAxes ||
      (candidate.comparisonCriteria || []).map((item) => ({
        category: item.aspect || 'other',
        label: item.aspect || 'Autre',
        confidence: item.confidence || 'low',
      })),
    alternativeFamilies:
      candidate.alternativeFamilies ||
      (candidate.genericAlternatives || []).map((item) => ({
        label: item.label,
        description:
          'Cette famille d’alternatives ressortait déjà dans la version précédente du rapport.',
      })),
    sourceMix:
      candidate.sourceMix ||
      [
        {
          type: 'other',
          label: 'Analyse historique du rapport',
          weight: 'medium',
        },
      ],
    executiveSummary:
      candidate.executiveSummary ||
      candidate.executiveSummaryLong ||
      candidate.marketSentiment.summary,
    provider: candidate.provider || 'fallback',
    model: candidate.model,
    genericAlternatives:
      candidate.genericAlternatives ||
      (candidate.alternativeFamilies || []).map((item) => ({
        label: item.label,
      })),
  };
}

export default function ReportPage() {
  const params = useParams();
  const router = useRouteProgressRouter();
  const searchParams = useSearchParams();
  const auditId = params?.id as string;
  const sessionId = searchParams?.get('session_id') ?? null;
  const accessToken = searchParams?.get('t') ?? null;
  const shareToken = searchParams?.get('st') ?? null;

  const [audit, setAudit] = useState<Audit | null>(null);
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(!!sessionId);
  const [waitlistEmail, setWaitlistEmail] = useState('');
  const [waitlistSubmitted, setWaitlistSubmitted] = useState(false);
  const [isPdfDownloading, setIsPdfDownloading] = useState(false);
  const [pdfDownloadProgress, setPdfDownloadProgress] = useState(0);
  const [pdfDownloadLabel, setPdfDownloadLabel] = useState('Préparation du téléchargement...');
  const [isLinkCopied, setIsLinkCopied] = useState(false);
  const [shareFeedback, setShareFeedback] = useState<string | null>(null);
  const [shareFallbackUrl, setShareFallbackUrl] = useState<string | null>(null);
  const [siteFaviconFailed, setSiteFaviconFailed] = useState(false);
  const [showAllRecommendations, setShowAllRecommendations] = useState(false);
  const [isModalScrollLockActive, setIsModalScrollLockActive] = useState(false);
  const [selectedMarketSignal, setSelectedMarketSignal] = useState<{
    eyebrow: string;
    title: string;
    summary: string;
    barClass: string;
    progress: number;
  } | null>(null);
  const [competitiveView, setCompetitiveView] = useState<'bars' | 'chart'>('bars');
  const [competitiveTooltip, setCompetitiveTooltip] = useState<{
    label: string;
    mentions: number;
    x: number;
    y: number;
  } | null>(null);
  const [competitiveHoveredBar, setCompetitiveHoveredBar] = useState<string | null>(null);
  const competitiveChartPlotRef = useRef<HTMLDivElement | null>(null);
  const copyResetTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (copyResetTimeoutRef.current !== null && typeof window !== 'undefined') {
        window.clearTimeout(copyResetTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const shouldLockScroll =
      showAllRecommendations || selectedMarketSignal !== null || isPdfDownloading;
    let timeoutId: number | null = null;

    if (shouldLockScroll) {
      setIsModalScrollLockActive(true);
    } else if (typeof window !== 'undefined') {
      timeoutId = window.setTimeout(() => {
        setIsModalScrollLockActive(false);
      }, 360);
    }

    return () => {
      if (timeoutId !== null && typeof window !== 'undefined') {
        window.clearTimeout(timeoutId);
      }
    };
  }, [showAllRecommendations, selectedMarketSignal, isPdfDownloading]);

  useEffect(() => {
    if (!isPdfDownloading) {
      setPdfDownloadProgress(0);
      setPdfDownloadLabel('Préparation du téléchargement...');
      return;
    }

    const timer = window.setInterval(() => {
      setPdfDownloadProgress((current) => {
        if (current >= 94) return current;
        const next = current + Math.max(0.35, (94 - current) * 0.035);
        return Math.min(next, 94);
      });
    }, 90);

    return () => {
      window.clearInterval(timer);
    };
  }, [isPdfDownloading]);

  useEffect(() => {
    if (!isModalScrollLockActive) {
      return;
    }

    const body = document.body;
    const html = document.documentElement;
    const previousBodyOverflow = body.style.overflow;
    const previousHtmlOverflow = html.style.overflow;
    const previousBodyTouchAction = body.style.touchAction;

    body.style.overflow = 'hidden';
    html.style.overflow = 'hidden';
    body.style.touchAction = 'none';

    return () => {
      body.style.overflow = previousBodyOverflow;
      html.style.overflow = previousHtmlOverflow;
      body.style.touchAction = previousBodyTouchAction;
    };
  }, [isModalScrollLockActive]);

  useEffect(() => {
    const loadReport = async () => {
      try {
        const prefetchedAudit = consumePrefetchedReport(auditId);
        if (prefetchedAudit) {
          setAudit(prefetchedAudit);
          if (sessionId && typeof window !== 'undefined') {
            window.history.replaceState(
              window.history.state,
              '',
              `/report/${auditId}`
            );
          }
          setLoading(false);
          setVerifying(false);
          return;
        }

        setVerifying(!!sessionId);

        const requestParams = new URLSearchParams();
        if (sessionId) {
          requestParams.set('session_id', sessionId);
        }
        if (shareToken) {
          requestParams.set('st', shareToken);
        }

        const headers: HeadersInit = {};
        if (accessToken) {
          headers.Authorization = `Bearer ${accessToken}`;
        }

        const query = requestParams.toString();
        const response = await fetch(
          `/api/report/${auditId}${query ? `?${query}` : ''}`,
          { headers }
        );

        if (response.status === 403) {
          const payload = await response.json().catch(() => ({}));
          if (
            payload?.error === 'Audit not paid' ||
            payload?.error === 'Audit non payé'
          ) {
            router.replace('/');
          } else {
            router.replace('/');
          }
          return;
        }

        if (response.status === 202) {
          const payload = await response.json().catch(() => ({}));
          const redirectToRaw =
            typeof payload?.redirectTo === 'string'
              ? payload.redirectTo
              : `/scan/${auditId}`;
          const redirectTo = redirectToRaw;
          if (/^https?:\/\//.test(redirectTo)) {
            window.location.href = redirectTo;
          } else {
            router.replace(redirectTo);
          }
          return;
        }

        if (response.status === 410 || response.status === 404 || response.status === 400) {
          router.replace('/erreur/rapport-introuvable');
          return;
        }

        if (!response.ok) {
          throw new Error(`status_${response.status}`);
        }

        const auditData = await response.json();
        setAudit(auditData);

        // Stripe session token is one-time verification data:
        // keep URL clean and shareable once verification is done.
        if (sessionId && typeof window !== 'undefined') {
          window.history.replaceState(
            window.history.state,
            '',
            `/report/${auditId}`
          );
        }
      } catch (error) {
        console.warn('Report fetch issue, redirecting to landing.', error);
        router.replace('/');
      } finally {
        setLoading(false);
        setVerifying(false);
      }
    };

    loadReport();
  }, [auditId, sessionId, accessToken, shareToken, router]);

  useEffect(() => {
    setSiteFaviconFailed(false);
  }, [
    auditId,
    audit?.url,
    audit?.results?.crawl?.favicon?.dataUrl,
    audit?.results?.crawl?.favicon?.url,
  ]);

  useEffect(() => {
    if (loading || verifying) {
      return;
    }

    if (!audit) {
      router.replace('/erreur/rapport-introuvable');
    }
  }, [loading, verifying, audit, router]);

  const handleWaitlistSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const email = waitlistEmail.trim();
    if (!email) return;

    if (typeof document !== 'undefined' && document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }

    // Optimistic UI: succès immédiat côté utilisateur, envoi backend en arrière-plan.
    setWaitlistSubmitted(true);
    setWaitlistEmail('');

    void fetch('/api/waitlist', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      },
      body: JSON.stringify({
        email,
        auditId,
        source: 'report_monitoring',
        ...(accessToken ? { accessToken } : {}),
      }),
      keepalive: true,
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error('Impossible d’ajouter à la liste d’attente');
        }
      })
      .catch((error) => {
        console.error('Error submitting waitlist:', error);
      });
  };

  const handleCopyReportLink = async () => {
    if (typeof window === 'undefined') return;

    setShareFeedback(null);
    setShareFallbackUrl(null);

    const showCopiedState = () => {
      setIsLinkCopied(true);
      if (copyResetTimeoutRef.current !== null) {
        window.clearTimeout(copyResetTimeoutRef.current);
      }
      copyResetTimeoutRef.current = window.setTimeout(() => {
        setIsLinkCopied(false);
        copyResetTimeoutRef.current = null;
      }, 1800);
    };

    const copyToClipboard = async (urlToCopy: string): Promise<boolean> => {
      try {
        if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
          await navigator.clipboard.writeText(urlToCopy);
          return true;
        }
      } catch (error) {
        console.warn('Clipboard write failed:', error);
      }
      return false;
    };

    let shareUrl: string | null = null;

    if (shareToken) {
      shareUrl = window.location.href;
    } else {
      try {
        const headers: HeadersInit = { 'Content-Type': 'application/json' };
        if (accessToken) {
          headers.Authorization = `Bearer ${accessToken}`;
        }
        const response = await fetch(`/api/report/${auditId}/share`, {
          method: 'POST',
          headers,
          cache: 'no-store',
        });
        if (response.ok) {
          const payload = await response.json();
          if (typeof payload?.shareUrl === 'string') {
            shareUrl = payload.shareUrl;
          }
        }
      } catch (error) {
        console.warn('Share link generation failed:', error);
      }

      if (!shareUrl) {
        shareUrl = window.location.href;
      }
    }

    if (await copyToClipboard(shareUrl)) {
      showCopiedState();
      return;
    }

    setShareFallbackUrl(shareUrl);
    setShareFeedback('Copiez le lien ci-dessous.');
  };

  const handleDownloadPdf = async () => {
    if (typeof window === 'undefined' || !audit?.report || isPdfDownloading) {
      return;
    }

    setShareFeedback(null);
    setShareFallbackUrl(null);
    setPdfDownloadProgress(8);
    setPdfDownloadLabel('Préparation du PDF...');
    setIsPdfDownloading(true);

    try {
      const filenameDomain =
        getDisplayDomain(audit.url)
          .toLowerCase()
          .replace(/[^a-z0-9.-]+/g, '-')
          .replace(/^-+|-+$/g, '') || 'rapport-qory';

      const requestParams = new URLSearchParams();
      if (sessionId) requestParams.set('session_id', sessionId);
      if (accessToken) requestParams.set('t', accessToken);
      if (shareToken) requestParams.set('st', shareToken);

      const query = requestParams.toString();
      setPdfDownloadProgress((current) => Math.max(current, 24));
      setPdfDownloadLabel('Génération du PDF...');
      const response = await fetch(`/api/report/${auditId}/pdf${query ? `?${query}` : ''}`, {
        method: 'GET',
        cache: 'no-store',
      });

      if (!response.ok) {
        throw new Error(`PDF API error: ${response.status}`);
      }

      setPdfDownloadProgress((current) => Math.max(current, 76));
      setPdfDownloadLabel('Finalisation du fichier...');
      const pdfBlob = await response.blob();
      setPdfDownloadProgress((current) => Math.max(current, 94));
      const blobUrl = window.URL.createObjectURL(pdfBlob);
      const link = window.document.createElement('a');
      link.href = blobUrl;
      link.download = `rapport-qory-${filenameDomain}.pdf`;
      window.document.body.appendChild(link);
      link.click();
      window.document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
      setPdfDownloadProgress(100);
      setPdfDownloadLabel('Téléchargement lancé');
      await new Promise((resolve) => window.setTimeout(resolve, 220));
    } catch (error) {
      console.error('PDF download failed:', error);
      setShareFeedback('Impossible de télécharger le PDF pour le moment.');
    } finally {
      setIsPdfDownloading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'cited_first':
      case 'cited':
        return 'bg-success/10 text-success';
      case 'unavailable':
        return 'bg-elevated/50 text-tertiary';
      case 'not_cited':
      default:
        return 'bg-error/10 text-error';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'cited_first':
      case 'cited':
        return 'Cité';
      case 'unavailable':
        return 'Indisponible';
      case 'not_cited':
      default:
        return 'Non cité';
    }
  };

  const getStatusWidthClass = (status: string) =>
    status === 'not_cited' ? 'w-20' : '';

  const getDataQualityBadgeClass = (quality: Report['dataQuality']) => {
    if (quality === 'good') return 'bg-success/10 text-success';
    if (quality === 'partial') return 'bg-warning/10 text-warning';
    return 'bg-error/10 text-error';
  };

  const getDataQualityLabel = (quality: Report['dataQuality']) => {
    if (quality === 'good') return 'Bonne';
    if (quality === 'partial') return 'Partielle';
    return 'Limitée';
  };

  const getHealthTextClass = (value: number) => {
    if (value >= 70) return 'text-success';
    if (value >= 40) return 'text-warning';
    return 'text-error';
  };

  const getMarketSentimentBadge = (
    value: NonNullable<Report['marketInsights']>['marketSentiment']['label']
  ) => {
    if (value === 'very_positive' || value === 'positive') return 'bg-success/10 text-success';
    if (value === 'negative') return 'bg-error/10 text-error';
    if (value === 'mixed' || value === 'mixed_positive' || value === 'mixed_negative') {
      return 'bg-warning/10 text-warning';
    }
    return 'bg-elevated/50 text-secondary';
  };

  const getMarketSentimentLabel = (
    value: NonNullable<Report['marketInsights']>['marketSentiment']['label']
  ) => {
    if (value === 'very_positive') return 'Très positif';
    if (value === 'positive') return 'Positif';
    if (value === 'negative') return 'Négatif';
    if (value === 'mixed_positive') return 'Plutôt positif';
    if (value === 'mixed_negative') return 'Plutôt fragile';
    if (value === 'mixed') return 'Mitigé';
    return 'Signal faible';
  };

  const getPricePositionBadge = (
    value: NonNullable<Report['marketInsights']>['pricePositioning']['label']
  ) => {
    if (value === 'budget') return 'bg-success/10 text-success';
    if (value === 'accessible') return 'bg-[#4BA7F5]/10 text-[#4BA7F5]';
    if (value === 'premium' || value === 'high_end') return 'bg-warning/10 text-warning';
    if (value === 'mid_market') return 'bg-warning/10 text-warning';
    return 'bg-elevated/50 text-secondary';
  };

  const getPricePositionLabel = (
    value: NonNullable<Report['marketInsights']>['pricePositioning']['label']
  ) => {
    if (value === 'budget') return 'Accessible';
    if (value === 'accessible') return 'Bonne valeur';
    if (value === 'mid_market') return 'Intermédiaire';
    if (value === 'premium') return 'Premium';
    if (value === 'high_end') return 'Très premium';
    return 'Peu lisible';
  };

  const getPolarizationBadge = (
    value: NonNullable<Report['marketInsights']>['polarization']['level']
  ) => {
    if (value === 'high') return 'bg-error/10 text-error';
    if (value === 'moderate') return 'bg-warning/10 text-warning';
    if (value === 'insufficient_signal') return 'bg-elevated/50 text-secondary';
    return 'bg-success/10 text-success';
  };

  const getPolarizationLabel = (
    value: NonNullable<Report['marketInsights']>['polarization']['level']
  ) => {
    if (value === 'high') return 'Forte';
    if (value === 'moderate') return 'Modérée';
    if (value === 'insufficient_signal') return 'Signal faible';
    return 'Faible';
  };

  const getTrustLevelBadge = (
    value: NonNullable<Report['marketInsights']>['trustLevel']['level']
  ) => {
    if (value === 'high') return 'bg-success/10 text-success';
    if (value === 'moderate') return 'bg-warning/10 text-warning';
    if (value === 'unclear') return 'bg-elevated/50 text-secondary';
    return 'bg-error/10 text-error';
  };

  const getTrustLevelLabel = (
    value: NonNullable<Report['marketInsights']>['trustLevel']['level']
  ) => {
    if (value === 'high') return 'Élevée';
    if (value === 'moderate') return 'Moyenne';
    if (value === 'unclear') return 'Peu lisible';
    return 'Fragile';
  };

  const getSignalStrengthBadge = (
    value: NonNullable<Report['marketInsights']>['signalStrength']
  ) => {
    if (value === 'strong') return 'bg-success/10 text-success';
    if (value === 'medium') return 'bg-warning/10 text-warning';
    return 'bg-elevated/50 text-secondary';
  };

  const getSignalStrengthLabel = (
    value: NonNullable<Report['marketInsights']>['signalStrength']
  ) => {
    if (value === 'strong') return 'Fort';
    if (value === 'medium') return 'Moyen';
    return 'Faible';
  };

  const getToneStyles = (tone: 'success' | 'warning' | 'error' | 'brand' | 'neutral') => {
    if (tone === 'success') {
      return { bar: 'bg-success' };
    }
    if (tone === 'warning') {
      return { bar: 'bg-warning' };
    }
    if (tone === 'error') {
      return { bar: 'bg-error' };
    }
    if (tone === 'brand') {
      return { bar: 'bg-[#4BA7F5]' };
    }
    return { bar: 'bg-[#8E96A3]' };
  };

  const getToneTitleClass = (tone: 'success' | 'warning' | 'error' | 'brand' | 'neutral') => {
    if (tone === 'success') return 'text-success';
    if (tone === 'warning') return 'text-warning';
    if (tone === 'error') return 'text-error';
    if (tone === 'brand') return 'text-[#4BA7F5]';
    return 'text-primary';
  };

  const getSignalBarProgress = (level: 'good' | 'mixed' | 'poor') => {
    if (level === 'good') return 100;
    if (level === 'mixed') return 50;
    return 0;
  };

  const getPriceBarProgress = (
    value: NonNullable<Report['marketInsights']>['pricePositioning']['label']
  ) => {
    if (value === 'budget') return 20;
    if (value === 'accessible') return 40;
    if (value === 'mid_market') return 60;
    if (value === 'premium') return 80;
    if (value === 'high_end') return 100;
    return 0;
  };

  const getProviderLabel = (source: string) => {
    switch (source) {
      case 'openai':
        return 'ChatGPT';
      case 'anthropic':
        return 'Claude';
      case 'perplexity':
        return 'Perplexity';
      default:
        return source;
    }
  };

  if (loading || verifying) {
    return (
      <div className="site-grid-bg ds-shell min-h-screen bg-primary flex items-center justify-center">
        <div className="text-center">
          <SiteSpinner className="mx-auto" />
          <p className="mt-4 text-secondary">
            {verifying ? 'Vérification du paiement...' : 'Chargement du rapport...'}
          </p>
        </div>
      </div>
    );
  }

  if (!audit || !audit.report) {
    return (
      <div className="site-grid-bg ds-shell min-h-screen bg-primary flex items-center justify-center">
        <div className="text-center">
          <SiteSpinner className="mx-auto" />
          <p className="mt-4 text-secondary">Chargement...</p>
        </div>
      </div>
    );
  }

  const report = audit.report;
  const marketInsights = normalizeMarketInsightsForDisplay(report.marketInsights);
  const displayDomain = getDisplayDomain(audit.url);
  const siteMonogram = displayDomain.charAt(0).toUpperCase() || '?';
  const unconfiguredProviders = report.providerHealth.unconfiguredProviders ?? [];
  const configuredProviderScores = [
    unconfiguredProviders.includes('openai')
      ? null
      : report.providerHealth.openai,
    unconfiguredProviders.includes('anthropic')
      ? null
      : report.providerHealth.anthropic,
    unconfiguredProviders.includes('perplexity')
      ? null
      : report.providerHealth.perplexity,
  ].filter((value): value is number => value !== null);
  const providerHealthTotal = configuredProviderScores.reduce((sum, value) => sum + value, 0);
  const providerDrivenDataQuality: Report['dataQuality'] =
    configuredProviderScores.length === 0
      ? 'poor'
      : providerHealthTotal >= configuredProviderScores.length * 80
      ? 'good'
      : providerHealthTotal >= configuredProviderScores.length * 55
      ? 'partial'
      : 'poor';
  const resolvedDataQuality = report.dataQuality || providerDrivenDataQuality;
  const score = report.summary?.globalScore ?? audit.score ?? 0;
  const crawl = audit.results?.crawl;
  const siteFaviconSrc = !siteFaviconFailed
    ? crawl?.favicon?.dataUrl || crawl?.favicon?.url || getFallbackFaviconUrl(audit.url)
    : null;
  const scoreColor = score >= 70 ? 'text-success' : score >= 40 ? 'text-warning' : 'text-error';
  const scoreBarColor = score >= 70 ? 'bg-success' : score >= 40 ? 'bg-warning' : 'bg-error';
  const scoreLabel = score >= 70 ? 'Bonne' : score >= 40 ? 'Moyenne' : 'Faible';
  const getPercentScoreTextClass = (value: number) =>
    value >= 70 ? 'text-success' : value >= 40 ? 'text-warning' : 'text-error';
  const factualCoverageValue = report.summary.factualCoverage;
  const factualCoverageDisplay = factualCoverageValue === null ? 'N/A' : factualCoverageValue;
  const factualCoverageTextClass =
    factualCoverageValue === null ? 'text-tertiary' : getPercentScoreTextClass(factualCoverageValue);
  const factSnapshots = report.factSnapshots ?? [];
  const factSnapshotRows = [
    { label: 'Adresse', key: 'address' as const },
    { label: 'Téléphone', key: 'phone' as const },
    { label: 'Email', key: 'email' as const },
    { label: 'Horaires', key: 'openingHours' as const },
    { label: 'Ville', key: 'city' as const },
  ];
  const fallbackCompetitorTotal =
    Math.max(report.providerHealth.activeProviders || 1, 1) * 10;
  const totalQueries = report.competitorBenchmark?.totalQueries ?? fallbackCompetitorTotal;
  const competitorQueriesDisplay = Math.max(totalQueries, 1);
  const youMentionCount = report.competitorBenchmark?.youMentionCount ?? 0;
  const youMentionDisplay = Math.min(youMentionCount, competitorQueriesDisplay);
  const topCompetitors = [...report.competitors]
    .sort((a, b) => b.mentionCount - a.mentionCount)
    .slice(0, 5);
  const competitiveChartSeries = [
    ...topCompetitors.map((competitor) => ({
      label: competitor.name,
      mentions: Math.min(competitor.mentionCount, competitorQueriesDisplay),
      isYou: false,
    })),
    {
      label: 'Vous',
      mentions: youMentionDisplay,
      isYou: true,
    },
  ];
  const competitiveChartMax = Math.max(
    1,
    ...competitiveChartSeries.map((entry) => entry.mentions)
  );
  const competitiveChartTickStep =
    competitiveChartMax <= 8 ? 1 : Math.max(1, Math.ceil(competitiveChartMax / 4));
  const competitiveChartUpperBoundBase = Math.max(
    competitiveChartTickStep,
    Math.ceil(competitiveChartMax / competitiveChartTickStep) * competitiveChartTickStep
  );
  const competitiveChartUpperBound =
    competitiveChartUpperBoundBase === competitiveChartMax
      ? competitiveChartUpperBoundBase + competitiveChartTickStep
      : competitiveChartUpperBoundBase;
  const competitiveChartTicks = Array.from(
    { length: Math.floor(competitiveChartUpperBound / competitiveChartTickStep) + 1 },
    (_, index) => index * competitiveChartTickStep
  );
  const derivedMentionRate =
    totalQueries > 0
      ? Math.round((youMentionCount / totalQueries) * 100)
      : Math.round(
          (
            report.visibilityByModel.openai.mentionRate +
            report.visibilityByModel.anthropic.mentionRate +
            report.visibilityByModel.perplexity.mentionRate
          ) / 3
        );
  const fallbackQueryMatrix = (audit.results?.prompts || []).slice(0, 5).map((prompt) => ({
    query: prompt.prompt,
    category: prompt.category,
    openai: 'unavailable' as const,
    anthropic: 'unavailable' as const,
    perplexity: 'unavailable' as const,
  }));
  const queryMatrixRows =
    report.queryMatrix.length > 0 ? report.queryMatrix : fallbackQueryMatrix;

  const getCompetitiveBarColor = (mentionsOnThirty: number) => {
    if (mentionsOnThirty >= 20) return 'bg-[#FF3B30]';
    if (mentionsOnThirty >= 10) return 'bg-[#FF9F0A]';
    if (mentionsOnThirty >= 1) return 'bg-[#34C759]';
    return 'bg-[#8E96A3]';
  };

  const getCompetitiveHoverBarColor = (mentionsOnThirty: number, isYou: boolean) => {
    if (isYou) return 'bg-[#2F8ED8]';
    if (mentionsOnThirty >= 20) return 'bg-[#E13227]';
    if (mentionsOnThirty >= 10) return 'bg-[#E08E09]';
    if (mentionsOnThirty >= 1) return 'bg-[#2FB24D]';
    return 'bg-[#6F7785]';
  };

  const technicalRobotBots = report.technicalAudit.robotsTxt.bots;
  const robotsFetchUnknown = crawl ? Boolean(crawl.robotsTxt.fetchError) : report.technicalAudit.robotsTxt.verdict === 'unknown';
  const gptVerdict = crawl
    ? robotsFetchUnknown
      ? 'unknown'
      : crawl.robotsTxt.blocksGPTBot
        ? 'blocked'
        : 'authorized'
    : technicalRobotBots?.gptbot?.verdict ?? (technicalRobotBots?.gptbot?.blocked ? 'blocked' : 'authorized');
  const claudeVerdict = crawl
    ? robotsFetchUnknown
      ? 'unknown'
      : crawl.robotsTxt.blocksClaude
        ? 'blocked'
        : 'authorized'
    : technicalRobotBots?.claudebot?.verdict ?? (technicalRobotBots?.claudebot?.blocked ? 'blocked' : 'authorized');
  const perplexityVerdict = crawl
    ? robotsFetchUnknown
      ? 'unknown'
      : crawl.robotsTxt.blocksPerplexity
        ? 'blocked'
        : 'authorized'
    : technicalRobotBots?.perplexitybot?.verdict ?? (technicalRobotBots?.perplexitybot?.blocked ? 'blocked' : 'authorized');
  const googleExtendedVerdict = crawl
    ? robotsFetchUnknown
      ? 'unknown'
      : crawl.robotsTxt.blocksGoogleExtended
        ? 'blocked'
        : 'authorized'
    : technicalRobotBots?.googleExtended?.verdict ?? (technicalRobotBots?.googleExtended?.blocked ? 'blocked' : 'authorized');
  const gptBlocked = gptVerdict === 'blocked';
  const claudeBlocked = claudeVerdict === 'blocked';
  const perplexityBlocked = perplexityVerdict === 'blocked';
  const googleExtendedBlocked = googleExtendedVerdict === 'blocked';
  const schemaVerdict = crawl
    ? getStructuredDataVerdict(crawl)
    : report.technicalAudit.structuredData.verdict ?? (report.technicalAudit.structuredData.status === 'good' ? 'present' : 'absent');
  const sitemapVerdict = crawl
    ? getSitemapVerdict(crawl)
    : report.technicalAudit.sitemap.verdict ?? ((report.technicalAudit.sitemap.exists ?? report.technicalAudit.sitemap.status === 'good') ? 'present' : 'absent');
  const hasSchema = schemaVerdict === 'present';
  const hasSitemap = sitemapVerdict === 'present';
  const hasHttps = crawl
    ? crawl.performance.isHttps
    : audit.url.startsWith('https://');
  const displaySynthesis = buildReportSynthesis({
    globalScore: score,
    mentionRate: derivedMentionRate,
    topCompetitorName: topCompetitors[0]?.name,
    factualCoverageScore: report.summary.factualCoverage ?? 0,
    blocksAICrawlers: gptBlocked || claudeBlocked,
    dataQuality: report.dataQuality || providerDrivenDataQuality,
    crawlStatus: crawl?.crawlStatus,
  });
  const displayGlobalExecutiveSummary =
    report.globalExecutiveSummary ||
    buildGlobalExecutiveSummary({
      globalScore: score,
      visibilityScore: report.summary.visibility,
      positioningScore: report.summary.positioning,
      technicalScore: report.summary.technical,
      mentionRate: derivedMentionRate,
      topCompetitorName: topCompetitors[0]?.name,
      factualCoverageScore: report.summary.factualCoverage ?? 0,
      blockedBots: [
        gptBlocked ? 'GPTBot' : null,
        claudeBlocked ? 'ClaudeBot' : null,
        perplexityBlocked ? 'PerplexityBot' : null,
      ].filter(Boolean) as string[],
      hasSchema,
      hasSitemap,
      hasHttps,
      marketInsights,
      recommendations: report.recommendations,
      dataQuality: report.dataQuality || providerDrivenDataQuality,
      crawlStatus: crawl?.crawlStatus,
    });
  const displayRecommendations = normalizeRecommendationsForDisplay(report.recommendations);
  const visibleRecommendations = displayRecommendations.slice(0, 5);
  const extraRecommendations = displayRecommendations.slice(5);

  const technicalRows = [
    {
      check: 'GPTBot autorisé dans robots.txt',
      status: gptVerdict === 'unknown' ? 'Non confirmé' : gptBlocked ? 'Bloqué' : 'Autorisé',
      impact: gptVerdict === 'unknown' ? 'Moyen' : gptBlocked ? 'Élevé' : '—',
    },
    {
      check: 'ClaudeBot autorisé',
      status: claudeVerdict === 'unknown' ? 'Non confirmé' : claudeBlocked ? 'Bloqué' : 'Autorisé',
      impact: claudeVerdict === 'unknown' ? 'Moyen' : claudeBlocked ? 'Élevé' : '—',
    },
    {
      check: 'PerplexityBot autorisé',
      status: perplexityVerdict === 'unknown' ? 'Non confirmé' : perplexityBlocked ? 'Bloqué' : 'Autorisé',
      impact: perplexityVerdict === 'unknown' ? 'Moyen' : perplexityBlocked ? 'Moyen' : '—',
    },
    {
      check: 'Google-Extended autorisé',
      status: googleExtendedVerdict === 'unknown' ? 'Non confirmé' : googleExtendedBlocked ? 'Bloqué' : 'Autorisé',
      impact: googleExtendedVerdict === 'unknown' ? 'Faible' : googleExtendedBlocked ? 'Moyen' : '—',
    },
    {
      check: 'Données structurées (schema.org)',
      status: schemaVerdict === 'unknown' ? 'Non confirmé' : hasSchema ? 'Présent' : 'Absent',
      impact: schemaVerdict === 'unknown' ? 'Faible' : hasSchema ? '—' : 'Moyen',
    },
    {
      check: 'Sitemap.xml présent',
      status: sitemapVerdict === 'unknown' ? 'Non confirmé' : hasSitemap ? 'Présent' : 'Absent',
      impact: sitemapVerdict === 'unknown' ? 'Faible' : hasSitemap ? '—' : 'Faible',
    },
    {
      check: 'HTTPS actif',
      status: hasHttps ? 'Oui' : 'Non',
      impact: hasHttps ? '—' : 'Élevé',
    },
  ];

  const getTechnicalStatusBadge = (status: string) => {
    if (status === 'Bloqué' || status === 'Absent' || status === 'Non') {
      return 'bg-error/10 text-error';
    }
    if (status === 'Autorisé' || status === 'Présent' || status === 'Oui') {
      return 'bg-success/10 text-success';
    }
    return 'bg-warning/10 text-warning';
  };

  const getTechnicalImpactBadge = (impact: string) => {
    if (impact === 'Élevé') return 'bg-error/10 text-error';
    if (impact === 'Moyen') return 'bg-warning/10 text-warning';
    if (impact === 'Faible') return 'bg-success/10 text-success';
    return 'bg-elevated/50 text-secondary';
  };

  return (
      <div className="report-shell site-grid-bg min-h-screen">
        {/* Acquisition Banner */}
      <div className="bg-gradient-to-r from-brand to-brand-light text-white py-2.5 sm:py-3 px-3 sm:px-4">
        <div className="w-full flex flex-wrap items-center justify-between gap-2 sm:gap-3">
          <p className="text-xs sm:text-sm">
            Ce rapport a été généré par <span className="font-bold"><QoryWord /></span>
          </p>
          <button
            type="button"
            onClick={handleDownloadPdf}
            disabled={isPdfDownloading}
            className="inline-flex items-center justify-center gap-1.5 rounded-full bg-white px-3 py-1 text-xs font-semibold text-black transition-colors hover:bg-[#F2F2F2] disabled:cursor-wait disabled:opacity-70 sm:px-4 sm:text-sm"
          >
            <HugeiconsIcon
              icon={PrinterIcon}
              size={16}
              strokeWidth={1.9}
              className="h-3.5 w-3.5 shrink-0"
            />
            {isPdfDownloading ? 'Génération du PDF...' : 'Télécharger le PDF'}
          </button>
        </div>
      </div>

      <div className="max-w-4xl w-full mx-auto py-6 sm:py-10 px-4 sm:px-6">
        <div className="mb-5 sm:mb-6">
          <div className="flex items-center justify-center gap-3 sm:gap-4">
            {siteFaviconSrc ? (
              <img
                src={siteFaviconSrc}
                alt=""
                aria-hidden="true"
                className="h-9 w-9 shrink-0 rounded-[12px] object-contain sm:h-10 sm:w-10"
                onError={() => setSiteFaviconFailed(true)}
              />
            ) : (
              <div className="flex h-9 w-9 shrink-0 items-center justify-center text-sm font-semibold text-primary sm:h-10 sm:w-10">
                {siteMonogram}
              </div>
            )}
            <p className="min-w-0 break-words text-center text-2xl font-semibold leading-tight tracking-tight text-primary sm:text-3xl">
              {displayDomain}
            </p>
          </div>
        </div>

        {/* SECTION 1 — Score Global */}
        <div className="mb-10 sm:mb-12">
          <div className="ds-card p-5 sm:p-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-primary text-center mb-4 sm:mb-6">
              Votre Score de Visibilité IA
            </h1>

            <div className="flex items-center justify-center mb-3 sm:mb-4">
              <div className={`text-5xl sm:text-6xl font-bold ${scoreColor}`}>
                {score}/100
              </div>
            </div>

            <p className="text-center text-lg sm:text-xl text-secondary mb-4 sm:mb-6">
              Votre visibilité IA est <span className={`font-semibold ${scoreColor}`}>{scoreLabel}</span>
            </p>

            <div className="w-full bg-elevated rounded-full h-3 sm:h-4 mb-4 overflow-hidden">
              <div
                className={`h-3 sm:h-4 rounded-full ${scoreBarColor}`}
                style={{ width: `${score}%` }}
              />
            </div>

            <div className="rounded-[18px] bg-elevated p-4 sm:p-6">
              <p className="text-primary leading-relaxed">
                {displaySynthesis}
              </p>
            </div>
          </div>
        </div>

        {/* SECTION — Fiabilité + Sous-scores */}
        <div className="grid md:grid-cols-2 gap-4 mb-10 sm:mb-12">
          <div>
            <div className="ds-card h-full p-4 sm:p-6">
              <div className="mb-3 flex items-center justify-between gap-3 sm:mb-4">
                <h2 className="text-xl sm:text-2xl font-bold text-primary">Fiabilité des données IA</h2>
                <InfoTooltip
                  label="Information fiabilité des données IA"
                  description="Indique la stabilité des données collectées sur les providers configurés. Plus ce signal est élevé, plus le rapport est exploitable sans réserve."
                />
              </div>
              <div className="flex items-center justify-between gap-3 mb-4">
                <span className="text-primary text-sm font-semibold">Qualité globale</span>
	                <span
	                  className={`inline-flex items-center justify-center px-3 py-1 rounded-full text-xs font-semibold ${getDataQualityBadgeClass(
	                    resolvedDataQuality
	                  )}`}
	                >
	                  {getDataQualityLabel(resolvedDataQuality)}
	                </span>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-secondary">ChatGPT</span>
                    <span className={`font-semibold ${getHealthTextClass(report.providerHealth.openai)}`}>
                    {unconfiguredProviders.includes('openai')
                      ? 'N/A'
                      : `${report.providerHealth.openai}%`}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-secondary">Claude</span>
                  <span className={`font-semibold ${getHealthTextClass(report.providerHealth.anthropic)}`}>
                    {unconfiguredProviders.includes('anthropic')
                      ? 'N/A'
                      : `${report.providerHealth.anthropic}%`}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-secondary">Perplexity</span>
                  <span className={`font-semibold ${getHealthTextClass(report.providerHealth.perplexity)}`}>
                    {unconfiguredProviders.includes('perplexity')
                      ? 'N/A'
                      : `${report.providerHealth.perplexity}%`}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div>
            <div className="ds-card h-full p-4 sm:p-6">
              <h2 className="mb-3 sm:mb-4 text-xl sm:text-2xl font-bold text-primary">Détail du score</h2>
              <div className="grid grid-cols-2 gap-2 sm:gap-3">
                <div className="rounded-[18px] bg-elevated p-2.5 sm:p-3">
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <p className="text-xs font-semibold text-primary">Visibilité</p>
                    <InfoTooltip
                      label="Information score visibilité"
                      description="Mesure la fréquence à laquelle votre entreprise est citée dans les réponses IA sur les requêtes testées."
                    />
                  </div>
                  <p className={`text-xl font-bold ${getPercentScoreTextClass(report.summary.visibility)}`}>
                    {report.summary.visibility}
                  </p>
                </div>
                <div className="rounded-[18px] bg-elevated p-2.5 sm:p-3">
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <p className="text-xs font-semibold text-primary">Couverture factuelle</p>
                    <InfoTooltip
                      label="Information couverture factuelle"
                      description="Mesure dans quelle mesure les IA attribuent des informations pratiques concrètes à votre entreprise."
                    />
                  </div>
                  <p className={`text-xl font-bold ${factualCoverageTextClass}`}>
                    {factualCoverageDisplay}
                  </p>
                </div>
                <div className="rounded-[18px] bg-elevated p-2.5 sm:p-3">
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <p className="text-xs font-semibold text-primary">Positionnement</p>
                    <InfoTooltip
                      label="Information score positionnement"
                      description="Mesure votre position relative face aux concurrents sur les requêtes clés (présence, rang et pression concurrentielle)."
                    />
                  </div>
                  <p className={`text-xl font-bold ${getPercentScoreTextClass(report.summary.positioning)}`}>
                    {report.summary.positioning}
                  </p>
                </div>
                <div className="rounded-[18px] bg-elevated p-2.5 sm:p-3">
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <p className="text-xs font-semibold text-primary">Technique</p>
                    <InfoTooltip
                      label="Information score technique"
                      description="Mesure la préparation technique du site pour l&apos;indexation IA (robots.txt, schema.org, sitemap, HTTPS)."
                    />
                  </div>
                  <p className={`text-xl font-bold ${getPercentScoreTextClass(report.summary.technical)}`}>
                    {report.summary.technical}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 2 — Visibilité par Modèle (Query Matrix) */}
        <div className="mb-10 sm:mb-12">
          <div className="ds-card p-5 sm:p-8">
            <div className="mb-2 sm:mb-2.5 flex items-center justify-between gap-3">
              <h2 className="text-xl sm:text-2xl font-bold flex items-center text-primary">
                Visibilité par Modèle IA
              </h2>
              <InfoTooltip
                label="Informations sur les requêtes IA"
                description="Les requêtes affichées sont générées automatiquement à partir de l’analyse du site. Elles peuvent parfois contenir des formulations imparfaites, surtout si le contenu du site est dynamique, ambigu ou très éditorial."
                tooltipClassName="w-64 rounded-[16px] border border-white/[0.08] bg-surface px-3 py-2.5 text-[11px] leading-relaxed text-secondary shadow-[0_18px_40px_rgba(29,29,31,0.08)] sm:w-80 sm:text-xs"
              />
            </div>
            <p className="text-xs sm:text-sm text-tertiary mb-4 sm:mb-6">
              Extrait de 5 requêtes sur 30 effectuées
            </p>
            
            <div className="space-y-3 sm:hidden">
              {queryMatrixRows.map((row, idx) => (
                <div key={idx} className="rounded-[20px] bg-elevated p-4">
                  <div className="mb-3">
                    <p className="text-[0.98rem] font-semibold leading-relaxed text-primary">
                      {row.query}
                    </p>
                    <p className="mt-1 text-xs text-tertiary">{row.category}</p>
                  </div>

                  <div className="space-y-2.5">
                    {[
                      { label: 'ChatGPT', icon: '/openai.svg?v=3', value: row.openai },
                      { label: 'Claude', icon: '/claude.svg?v=3', value: row.anthropic },
                      { label: 'Perplexity', icon: '/perplexity.svg?v=3', value: row.perplexity },
                    ].map((provider) => (
                      <div
                        key={provider.label}
                        className="flex items-center justify-between gap-3 rounded-[16px] bg-surface px-3 py-2.5"
                      >
                        <span className="inline-flex min-w-0 items-center gap-2 text-sm font-medium text-primary">
                          <img
                            src={provider.icon}
                            alt=""
                            className="h-4 w-4 shrink-0 object-contain brightness-0 invert"
                          />
                          <span>{provider.label}</span>
                        </span>
                        <span className={`inline-flex items-center justify-center px-3 py-1 rounded-full text-[10px] font-semibold ${getStatusWidthClass(provider.value)} ${getStatusColor(provider.value)}`}>
                          {getStatusLabel(provider.value)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="hidden sm:block -mx-5 sm:mx-0 overflow-x-auto">
              <div className="overflow-hidden rounded-2xl border border-elevated">
              <table className="w-full min-w-[540px] border-collapse">
              <thead>
                <tr className="bg-elevated">
                  <th className="border border-elevated p-2 sm:p-3 text-left text-sm sm:text-base font-semibold text-primary">Requête</th>
                  <th className="border border-elevated p-2 sm:p-3 text-center text-sm sm:text-base font-semibold text-primary">
                    <span className="inline-flex items-center justify-center gap-1 sm:gap-1.5">
                      <img
                        src="/openai.svg?v=3"
                        alt="ChatGPT"
                        className="h-3.5 w-3.5 sm:h-4 sm:w-4 object-contain shrink-0 brightness-0 invert"
                      />
                      <span className="hidden sm:inline">ChatGPT</span>
                      <span className="sm:hidden">GPT</span>
                    </span>
                  </th>
                  <th className="border border-elevated p-2 sm:p-3 text-center text-sm sm:text-base font-semibold text-primary">
                    <span className="inline-flex items-center justify-center gap-1 sm:gap-1.5">
                      <img
                        src="/claude.svg?v=3"
                        alt="Claude"
                        className="h-3.5 w-3.5 sm:h-4 sm:w-4 object-contain shrink-0 brightness-0 invert"
                      />
                      <span>Claude</span>
                    </span>
                  </th>
                  <th className="border border-elevated p-2 sm:p-3 text-center text-sm sm:text-base font-semibold text-primary">
                    <span className="inline-flex items-center justify-center gap-1 sm:gap-1.5">
                      <img
                        src="/perplexity.svg?v=3"
                        alt="Perplexity"
                        className="h-3.5 w-3.5 sm:h-4 sm:w-4 object-contain shrink-0 brightness-0 invert"
                      />
                      <span className="hidden sm:inline">Perplexity</span>
                      <span className="sm:hidden">Perpl.</span>
                    </span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {queryMatrixRows.map((row, idx) => (
                  <tr key={idx} className="hover:bg-elevated/50 align-top">
                    <td className="border border-elevated p-2 sm:p-3 text-xs sm:text-sm text-primary align-top">
                      <div className="font-medium whitespace-normal break-words leading-relaxed">
                        {row.query}
                      </div>
                      <div className="text-xs text-tertiary mt-1">{row.category}</div>
                    </td>
                    <td className="border border-elevated p-2 sm:p-3 text-center align-top">
                      <span className={`inline-flex items-center justify-center px-2 sm:px-3 py-1 rounded-full text-[10px] sm:text-xs font-semibold ${getStatusWidthClass(row.openai)} ${getStatusColor(row.openai)}`}>
                        {getStatusLabel(row.openai)}
                      </span>
                    </td>
                    <td className="border border-elevated p-2 sm:p-3 text-center align-top">
                      <span className={`inline-flex items-center justify-center px-2 sm:px-3 py-1 rounded-full text-[10px] sm:text-xs font-semibold ${getStatusWidthClass(row.anthropic)} ${getStatusColor(row.anthropic)}`}>
                        {getStatusLabel(row.anthropic)}
                      </span>
                    </td>
                    <td className="border border-elevated p-2 sm:p-3 text-center align-top">
                      <span className={`inline-flex items-center justify-center px-2 sm:px-3 py-1 rounded-full text-[10px] sm:text-xs font-semibold ${getStatusWidthClass(row.perplexity)} ${getStatusColor(row.perplexity)}`}>
                        {getStatusLabel(row.perplexity)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
              </table>
              </div>
            </div>

            {queryMatrixRows.length === 0 && (
              <div className="mt-4 rounded-[18px] bg-elevated p-4 text-sm text-secondary">
                Aucune donnée de matrice disponible pour cet audit. Les modèles IA interrogés étaient indisponibles.
              </div>
            )}

            {/* Summary */}
            <p className="mt-4 text-xs sm:mt-6 sm:text-sm text-secondary">
              <span className="font-semibold text-primary">Résumé :</span> Vous apparaissez dans{' '}
              <span className={`font-bold ${getPercentScoreTextClass(report.visibilityByModel.openai.mentionRate)}`}>
                {report.visibilityByModel.openai.mentionRate}%
              </span>{' '}
              des réponses ChatGPT,{' '}
              <span className={`font-bold ${getPercentScoreTextClass(report.visibilityByModel.anthropic.mentionRate)}`}>
                {report.visibilityByModel.anthropic.mentionRate}%
              </span>{' '}
              des réponses Claude, et{' '}
              <span className={`font-bold ${getPercentScoreTextClass(report.visibilityByModel.perplexity.mentionRate)}`}>
                {report.visibilityByModel.perplexity.mentionRate}%
              </span>{' '}
              des réponses Perplexity.
            </p>
          </div>
        </div>

        {marketInsights && (
          <div className="mb-10 sm:mb-12">
            <div className="ds-card p-5 sm:p-8">
              <div className="mb-4 flex items-center justify-between gap-3">
                <h2 className="text-xl sm:text-2xl font-bold flex items-center text-primary">
                  Positionnement Marché
                </h2>
                <InfoTooltip
                  label="Information positionnement marché"
                  description="Synthétise le signal marché remonté par les réponses IA: perception prix, ressenti, polarisation, cohérence et principaux avantages ou limites qui ressortent."
                />
              </div>

              {(() => {
              const priceTone =
                marketInsights.pricePositioning.label === 'budget'
                  ? 'success'
                  : marketInsights.pricePositioning.label === 'premium' || marketInsights.pricePositioning.label === 'high_end' || marketInsights.pricePositioning.label === 'mid_market'
                  ? 'warning'
                  : marketInsights.pricePositioning.label === 'accessible'
                  ? 'brand'
                  : 'neutral';
              const sentimentTone =
                marketInsights.marketSentiment.label === 'very_positive' || marketInsights.marketSentiment.label === 'positive'
                  ? 'success'
                  : marketInsights.marketSentiment.label === 'negative'
                  ? 'error'
                  : marketInsights.marketSentiment.label === 'mixed' || marketInsights.marketSentiment.label === 'mixed_positive' || marketInsights.marketSentiment.label === 'mixed_negative'
                  ? 'warning'
                  : 'neutral';
              const polarizationTone =
                marketInsights.polarization.level === 'insufficient_signal'
                  ? 'neutral'
                  : marketInsights.polarization.level === 'low'
                  ? 'success'
                  : marketInsights.polarization.level === 'moderate'
                  ? 'warning'
                  : 'error';
              const trustTone =
                marketInsights.trustLevel.level === 'high'
                  ? 'success'
                  : marketInsights.trustLevel.level === 'moderate'
                  ? 'warning'
                  : marketInsights.trustLevel.level === 'unclear'
                  ? 'neutral'
                  : 'error';
              const signalTone =
                marketInsights.signalStrength === 'strong'
                  ? 'success'
                  : marketInsights.signalStrength === 'medium'
                  ? 'warning'
                  : 'neutral';

              const polarizationTitle =
                marketInsights.polarization.level === 'insufficient_signal'
                  ? 'Signal faible'
                  : marketInsights.polarization.level === 'low'
                  ? 'Stable'
                  : marketInsights.polarization.level === 'moderate'
                  ? 'Modérée'
                  : 'Instable';
              const trustTitle = getTrustLevelLabel(marketInsights.trustLevel.level);
              const signalTitle = getSignalStrengthLabel(marketInsights.signalStrength);
              const priceProgress = getPriceBarProgress(marketInsights.pricePositioning.label);
              const sentimentProgress = getSignalBarProgress(
                marketInsights.marketSentiment.label === 'very_positive' ||
                  marketInsights.marketSentiment.label === 'positive'
                  ? 'good'
                  : marketInsights.marketSentiment.label === 'mixed_positive' ||
                      marketInsights.marketSentiment.label === 'mixed' ||
                      marketInsights.marketSentiment.label === 'mixed_negative'
                  ? 'mixed'
                  : 'poor'
              );
              const polarizationProgress = getSignalBarProgress(
                marketInsights.polarization.level === 'low'
                  ? 'good'
                  : marketInsights.polarization.level === 'moderate'
                  ? 'mixed'
                  : 'poor'
              );
              const trustProgress = getSignalBarProgress(
                marketInsights.trustLevel.level === 'high'
                  ? 'good'
                  : marketInsights.trustLevel.level === 'moderate'
                  ? 'mixed'
                  : 'poor'
              );
              const signalProgress = getSignalBarProgress(
                marketInsights.signalStrength === 'strong'
                  ? 'good'
                  : marketInsights.signalStrength === 'medium'
                  ? 'mixed'
                  : 'poor'
              );

                return (
              <div className="grid gap-3 sm:gap-4 md:grid-cols-2 xl:grid-cols-5">
                <MarketSignalCard
                  eyebrow="Prix"
                  title={getPricePositionLabel(marketInsights.pricePositioning.label)}
                  titleClassName={getToneTitleClass(priceTone)}
                  onClick={() =>
                    setSelectedMarketSignal({
                      eyebrow: 'Prix',
                      title: getPricePositionLabel(marketInsights.pricePositioning.label),
                      summary: marketInsights.pricePositioning.summary,
                      barClass: getToneStyles(priceTone).bar,
                      progress: priceProgress,
                    })
                  }
                />

                <MarketSignalCard
                  eyebrow="Ressenti"
                  title={getMarketSentimentLabel(marketInsights.marketSentiment.label)}
                  titleClassName={getToneTitleClass(sentimentTone)}
                  onClick={() =>
                    setSelectedMarketSignal({
                      eyebrow: 'Ressenti',
                      title: getMarketSentimentLabel(marketInsights.marketSentiment.label),
                      summary: marketInsights.marketSentiment.summary,
                      barClass: getToneStyles(sentimentTone).bar,
                      progress: sentimentProgress,
                    })
                  }
                />

                <MarketSignalCard
                  eyebrow="Polarisation"
                  title={polarizationTitle}
                  titleClassName={getToneTitleClass(polarizationTone)}
                  onClick={() =>
                    setSelectedMarketSignal({
                      eyebrow: 'Polarisation',
                      title: polarizationTitle,
                      summary: marketInsights.polarization.summary,
                      barClass: getToneStyles(polarizationTone).bar,
                      progress: polarizationProgress,
                    })
                  }
                />

                <MarketSignalCard
                  eyebrow="Confiance"
                  title={trustTitle}
                  titleClassName={getToneTitleClass(trustTone)}
                  onClick={() =>
                    setSelectedMarketSignal({
                      eyebrow: 'Confiance',
                      title: trustTitle,
                      summary: marketInsights.trustLevel.summary,
                      barClass: getToneStyles(trustTone).bar,
                      progress: trustProgress,
                    })
                  }
                />

                <MarketSignalCard
                  eyebrow="Signal"
                  title={signalTitle}
                  titleClassName={getToneTitleClass(signalTone)}
                  onClick={() =>
                    setSelectedMarketSignal({
                      eyebrow: 'Signal',
                      title: signalTitle,
                      summary:
                        marketInsights.signalStrength === 'strong'
                          ? 'Le volume et la convergence des signaux publics sont suffisamment solides pour une lecture assez stable.'
                          : marketInsights.signalStrength === 'medium'
                          ? 'Le signal est exploitable, mais encore incomplet selon les sources et les angles de lecture.'
                          : 'Le signal public reste encore limité: les conclusions doivent être lues avec prudence.',
                      barClass: getToneStyles(signalTone).bar,
                      progress: signalProgress,
                    })
                  }
                />
              </div>
              );
            })()}

              <p className="mt-3 text-center text-xs text-tertiary">
                Cliquez sur une carte pour voir le détail.
              </p>

              <div className="mt-4 grid gap-4 md:grid-cols-2">
              <div>
                <h3 className="mb-3 flex items-center gap-2 text-base font-bold text-success sm:text-lg">
                  <ReportSectionIcon icon={CheckmarkBadge02Icon} className="h-5 w-5" />
                  Avantages identifiés par l'IA
                </h3>
                {marketInsights.strengths.length === 0 ? (
                  <p className="text-sm text-secondary">
                    Aucun point fort récurrent n&apos;est encore assez stable pour être affiché avec confiance.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {marketInsights.strengths.map((item, idx) => (
                      <div key={`${item.label}-${idx}`} className="rounded-[18px] bg-success/10 px-4 py-4">
                        <p className="text-sm font-semibold text-success">{item.label}</p>
                        <p className="mt-1 text-sm text-white">{item.evidence}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <h3 className="mb-3 flex items-center gap-2 text-base font-bold text-error sm:text-lg">
                  <ReportSectionIcon icon={AlertSquareIcon} className="h-5 w-5" />
                  Limites et points de friction
                </h3>
                {marketInsights.weaknesses.length === 0 ? (
                  <p className="text-sm text-secondary">
                    Aucun point faible dominant ne ressort suffisamment dans les réponses IA.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {marketInsights.weaknesses.map((item, idx) => (
                      <div key={`${item.label}-${idx}`} className="rounded-[18px] bg-error/10 px-4 py-4">
                        <p className="text-sm font-semibold text-error">{item.label}</p>
                        <p className="mt-1 text-sm text-white">{item.evidence}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

              {marketInsights.alternativeFamilies.length > 0 && (
                <div className="mt-4">
                  <h3 className="text-base sm:text-lg font-bold mb-3 sm:mb-4 text-primary">
                    Familles d&apos;alternatives
                  </h3>
                  <div className="grid gap-3 md:grid-cols-2">
                    {marketInsights.alternativeFamilies.map((item, idx) => (
                      <div key={`${item.label}-${idx}`} className="rounded-[18px] bg-elevated px-4 py-4">
                        <p className="text-sm font-semibold text-primary">{item.label}</p>
                        <p className="mt-2 text-sm text-secondary">{item.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-4">
                <h3 className="text-base sm:text-lg font-bold mb-3 sm:mb-4 text-primary">
                  Résumé Marché
                </h3>

                <div className="rounded-[18px] bg-elevated p-4 sm:p-6">
                  <p className="text-primary leading-relaxed">
                    {marketInsights.executiveSummary}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SECTION 3 — Informations attribuées par les IA */}
        <div className="mb-10 sm:mb-12">
          <div className="ds-card p-5 sm:p-8">
            <div className="mb-3 flex items-center justify-between gap-3 sm:mb-4">
              <h2 className="text-xl sm:text-2xl font-bold flex items-center text-primary">
                Informations attribuées par les IA
              </h2>
              <InfoTooltip
                label="Information informations attribuées par les IA"
                description="Affiche les informations pratiques que les IA associent à votre marque, comme l’adresse, le téléphone, l’email, les horaires ou la ville."
              />
            </div>

            {factSnapshots.length === 0 ? (
              <div className="rounded-[18px] bg-elevated p-4 sm:p-6">
                <p className="text-secondary">
                  Aucune information pratique exploitable n’a été attribuée par les IA sur cet audit.
                </p>
              </div>
            ) : (
              <>
                <div className="space-y-3 sm:hidden">
                  {factSnapshotRows.map((row) => (
                    <div key={row.key} className="rounded-[20px] bg-elevated p-4">
                      <p className="mb-3 text-sm font-semibold text-primary">{row.label}</p>
                      <div className="space-y-2.5">
                        {factSnapshots.map((snapshot, idx) => (
                          <div
                            key={`${row.key}-${snapshot.provider}-${idx}-mobile`}
                            className="rounded-[16px] bg-surface px-3 py-2.5"
                          >
                            <div className="mb-1.5 inline-flex items-center gap-2 text-xs font-semibold text-primary">
                              <img
                                src={
                                  snapshot.provider === 'openai'
                                    ? '/openai.svg?v=3'
                                    : snapshot.provider === 'anthropic'
                                    ? '/claude.svg?v=3'
                                    : '/perplexity.svg?v=3'
                                }
                                alt=""
                                className="h-4 w-4 shrink-0 object-contain brightness-0 invert"
                              />
                              <span>{snapshot.model || getProviderLabel(snapshot.provider)}</span>
                            </div>
                            <p className="text-sm leading-relaxed text-secondary">
                              {snapshot.detected[row.key] || 'Non trouvé'}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="hidden sm:block overflow-hidden rounded-2xl border border-elevated">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[720px] table-fixed border-collapse">
                    <colgroup>
                      <col className="w-[21%]" />
                      {factSnapshots.map((_, idx) => (
                        <col key={idx} className="w-[26.33%]" />
                      ))}
                    </colgroup>
                    <thead>
                      <tr className="bg-elevated">
                        <th className="border border-elevated p-2 sm:p-3 text-left text-sm sm:text-base font-semibold text-primary">
                          Information
                        </th>
                        {factSnapshots.map((snapshot, idx) => (
                          <th
                            key={`${snapshot.provider}-${idx}`}
                            className="border border-elevated p-2 sm:p-3 text-center text-sm sm:text-base font-semibold text-primary"
                          >
                            <div className="inline-flex items-center justify-center gap-1 sm:gap-1.5">
                              <img
                                src={
                                  snapshot.provider === 'openai'
                                    ? '/openai.svg?v=3'
                                    : snapshot.provider === 'anthropic'
                                    ? '/claude.svg?v=3'
                                    : '/perplexity.svg?v=3'
                                }
                                alt=""
                                className="h-3.5 w-3.5 shrink-0 object-contain brightness-0 invert sm:h-4 sm:w-4"
                              />
                              <span>
                                {snapshot.model || getProviderLabel(snapshot.provider)}
                              </span>
                            </div>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {factSnapshotRows.map((row) => (
                        <tr key={row.key} className="hover:bg-elevated/50 align-top">
                          <td className="border border-elevated p-2 sm:p-3 text-xs sm:text-sm font-medium text-primary align-top">
                            {row.label}
                          </td>
                          {factSnapshots.map((snapshot, idx) => (
                            <td
                              key={`${row.key}-${snapshot.provider}-${idx}`}
                              className="border border-elevated p-2 sm:p-3 text-xs sm:text-sm text-primary align-top"
                            >
                              {snapshot.detected[row.key] || 'Non trouvé'}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              </>
            )}
          </div>
        </div>

        {/* SECTION 4 — Analyse Concurrentielle */}
        <div className="mb-10 sm:mb-12">
          <div className="ds-card p-5 sm:p-8">
            <div className="mb-3 flex flex-col gap-3 sm:mb-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex items-center gap-3">
                <h2 className="text-xl sm:text-2xl font-bold flex items-center text-primary">
                  Analyse Concurrentielle
                </h2>
              </div>
              <div className="flex items-center gap-3">
                {topCompetitors.length > 0 && (
                  <div className="inline-flex w-fit items-center gap-1 rounded-full bg-elevated p-1">
                    <button
                      type="button"
                      onClick={() => setCompetitiveView('bars')}
                      className={`relative inline-flex w-[92px] items-center justify-center rounded-full px-3 py-1.5 text-xs font-semibold transition-colors sm:w-[96px] sm:px-3.5 ${
                        competitiveView === 'bars'
                          ? 'text-white'
                          : 'text-white/55 hover:text-white'
                      }`}
                    >
                      {competitiveView === 'bars' && (
                        <motion.span
                          layoutId="competitive-view-toggle-pill"
                          className="absolute inset-0 rounded-full bg-[#4BA7F5]"
                          transition={{ type: 'spring', stiffness: 360, damping: 30 }}
                        />
                      )}
                      <span className="relative z-10">Barres</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setCompetitiveView('chart')}
                      className={`relative inline-flex w-[92px] items-center justify-center rounded-full px-3 py-1.5 text-xs font-semibold transition-colors sm:w-[96px] sm:px-3.5 ${
                        competitiveView === 'chart'
                          ? 'text-white'
                          : 'text-white/55 hover:text-white'
                      }`}
                    >
                      {competitiveView === 'chart' && (
                        <motion.span
                          layoutId="competitive-view-toggle-pill"
                          className="absolute inset-0 rounded-full bg-[#4BA7F5]"
                          transition={{ type: 'spring', stiffness: 360, damping: 30 }}
                        />
                      )}
                      <span className="relative z-10">Graphique</span>
                    </button>
                  </div>
                )}
              </div>
            </div>

            {topCompetitors.length === 0 ? (
              <div className="rounded-[18px] bg-elevated p-4 sm:p-6">
                <p className="text-secondary">
                  Aucun concurrent clairement identifié sur cet audit.
                </p>
              </div>
            ) : (
              <motion.div
              layout
              className="relative overflow-hidden"
              transition={{
                layout: {
                  duration: 0.38,
                  ease: [0.22, 1, 0.36, 1],
                },
              }}
            >
              <AnimatePresence mode="popLayout" initial={false}>
              {competitiveView === 'bars' ? (
                <motion.div
                  key="competitive-bars"
                  layout
                  initial={{ opacity: 0, x: -24 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -24 }}
                  transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                  className="space-y-2.5 sm:space-y-3"
                >
                  {topCompetitors.map((comp, idx) => {
                    const competitorMentionDisplay = Math.min(
                      comp.mentionCount,
                      competitorQueriesDisplay
                    );
                    return (
                    <div key={idx} className="flex items-center justify-between gap-2 sm:gap-4">
                      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                        <span className="w-4 sm:w-5 text-primary font-bold text-sm sm:text-base">{idx + 1}.</span>
                        <span className="text-primary font-semibold truncate text-sm sm:text-base">{comp.name}</span>
                      </div>
                      <div className="flex items-center gap-2 sm:gap-3 w-36 sm:w-52 max-w-[50%] sm:max-w-[55%]">
                        <div className="flex-1 h-2 overflow-hidden rounded-full bg-elevated">
                          <div
                            className={`h-2 rounded-full ${getCompetitiveBarColor(competitorMentionDisplay)}`}
                            style={{ width: `${Math.min((competitorMentionDisplay / competitorQueriesDisplay) * 100, 100)}%` }}
                          />
                        </div>
                        <span className="text-secondary text-xs sm:text-sm tabular-nums whitespace-nowrap">
                          {competitorMentionDisplay}/{competitorQueriesDisplay}
                        </span>
                      </div>
                    </div>
                  );
                  })}

                  <div className="pt-2 border-t border-elevated flex items-center justify-between gap-2 sm:gap-4">
                    <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                      <span className="w-4 sm:w-5 text-tertiary font-bold text-sm sm:text-base">—</span>
                      <span className="text-secondary truncate text-sm sm:text-base">Vous</span>
                    </div>
                    <div className="flex items-center gap-2 sm:gap-3 w-36 sm:w-52 max-w-[50%] sm:max-w-[55%]">
                      <div className="flex-1 h-2 overflow-hidden rounded-full bg-elevated">
                        <div
                          className="h-2 rounded-full bg-[#4BA7F5]"
                          style={{ width: `${Math.min((youMentionDisplay / competitorQueriesDisplay) * 100, 100)}%` }}
                        />
                      </div>
                      <span className="text-secondary text-xs sm:text-sm tabular-nums whitespace-nowrap">
                        {youMentionDisplay}/{competitorQueriesDisplay}
                      </span>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="competitive-chart"
                  layout
                  initial={{ opacity: 0, x: 24 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 24 }}
                  transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                  className="pt-1 sm:pt-2"
                >
                  <div className="mb-3 sm:mb-4">
                    <p className="text-xs font-medium uppercase tracking-[0.14em] text-tertiary">
                      Nombre de citations
                    </p>
                  </div>

                  <div className="-mx-3 overflow-x-auto px-3 sm:mx-0 sm:px-0">
                    <div className="min-w-[460px]">
                      <div className="grid grid-cols-[2.5rem_minmax(0,1fr)] gap-3 sm:grid-cols-[3rem_minmax(0,1fr)] sm:gap-4">
                        <div className="relative h-[240px] sm:h-[280px]">
                          {competitiveChartTicks.map((tick) => {
                            const bottom = `${(tick / competitiveChartUpperBound) * 100}%`;

                            return (
                              <span
                                key={tick}
                                className="absolute right-0 -translate-y-1/2 text-[11px] font-medium tabular-nums text-tertiary sm:text-xs"
                                style={{ bottom }}
                              >
                                {tick}
                              </span>
                            );
                          })}
                        </div>

                        <div
                          ref={competitiveChartPlotRef}
                          className="relative h-[240px] border-b border-l border-[#DCE3EF] sm:h-[280px]"
                          onMouseLeave={() => {
                            setCompetitiveTooltip(null);
                            setCompetitiveHoveredBar(null);
                          }}
                        >
                          {competitiveChartTicks.map((tick) => {
                            const bottom = `${(tick / competitiveChartUpperBound) * 100}%`;

                            return (
                              <div
                                key={tick}
                                className="pointer-events-none absolute inset-x-0 border-t border-[#E6EBF2]"
                                style={{ bottom }}
                              />
                            );
                          })}

                          {competitiveTooltip && (
                            <div
                              className="pointer-events-none absolute z-20"
                              style={{
                                left: competitiveTooltip.x,
                                top: competitiveTooltip.y,
                                transform: 'translateY(-50%)',
                              }}
                            >
                              <div className="rounded-[18px] border border-white/[0.08] bg-surface px-3 py-2 shadow-[0_18px_40px_rgba(29,29,31,0.12)]">
                                <p className="text-[10px] font-medium uppercase tracking-[0.12em] text-tertiary">
                                  {competitiveTooltip.label}
                                </p>
                                <p className="mt-1 text-sm font-semibold text-primary">
                                  {competitiveTooltip.mentions} citation{competitiveTooltip.mentions > 1 ? 's' : ''}
                                </p>
                              </div>
                            </div>
                          )}

                          <div className="absolute inset-0 flex items-end justify-between gap-3 px-3 sm:gap-4 sm:px-4">
                            {competitiveChartSeries.map((entry) => {
                              const barKey = `${entry.label}-${entry.isYou ? 'you' : 'competitor'}`;
                              const barHeight = `${(entry.mentions / competitiveChartUpperBound) * 100}%`;
                              const barColorClass = competitiveHoveredBar === barKey
                                ? getCompetitiveHoverBarColor(entry.mentions, entry.isYou)
                                : entry.isYou
                                ? 'bg-[#4BA7F5]'
                                : getCompetitiveBarColor(entry.mentions);

                              return (
                                <div
                                  key={barKey}
                                  className="flex h-full min-w-0 flex-1 items-end justify-center"
                                >
                                  <div className="relative flex h-full w-full max-w-[54px] items-end justify-center">
                                    <div
                                      className={`w-full rounded-t-[18px] ${barColorClass} shadow-[0_16px_32px_rgba(29,29,31,0.08)] transition-colors duration-200 ease-out`}
                                      style={{ height: barHeight }}
                                      onMouseEnter={() => setCompetitiveHoveredBar(barKey)}
                                      onMouseMove={(event) => {
                                        const plotRect = competitiveChartPlotRef.current?.getBoundingClientRect();
                                        if (!plotRect) return;

                                        const tooltipWidth = 148;
                                        const x = Math.min(
                                          Math.max(event.clientX - plotRect.left + 14, 12),
                                          Math.max(plotRect.width - tooltipWidth, 12)
                                        );
                                        const y = Math.min(
                                          Math.max(event.clientY - plotRect.top, 18),
                                          plotRect.height - 18
                                        );

                                        setCompetitiveTooltip({
                                          label: entry.label,
                                          mentions: entry.mentions,
                                          x,
                                          y,
                                        });
                                        setCompetitiveHoveredBar(barKey);
                                      }}
                                      onMouseLeave={() => {
                                        setCompetitiveTooltip(null);
                                        setCompetitiveHoveredBar(null);
                                      }}
                                    />
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        <div />

                        <div className="flex items-start justify-between gap-3 px-3 pt-3 sm:gap-4 sm:px-4">
                          {competitiveChartSeries.map((entry) => (
                            <div
                              key={`${entry.label}-${entry.isYou ? 'you-label' : 'competitor-label'}`}
                              className="flex min-w-0 flex-1 justify-center"
                            >
                              <span
                                className={`line-clamp-2 min-h-[2.5rem] text-center text-[11px] leading-tight sm:text-xs ${
                                  entry.isYou ? 'font-semibold text-[#4BA7F5]' : 'text-secondary'
                                }`}
                              >
                                {entry.label}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
              </AnimatePresence>
              </motion.div>
            )}
          </div>
        </div>

        {/* SECTION 5 — Audit Technique */}
        <div className="mb-10 sm:mb-12">
          <div className="ds-card p-5 sm:p-8">
            <div className="mb-3 flex items-center justify-between gap-3 sm:mb-4">
              <h2 className="text-xl sm:text-2xl font-bold flex items-center text-primary">
                Audit Technique
              </h2>
              <InfoTooltip
                label="Information audit technique"
                description="Résume les signaux techniques qui aident ou freinent la lecture de votre site par les IA, comme robots.txt, sitemap et données structurées. Si le crawl a été partiel ou incomplet, certains résultats peuvent être incohérents: en cas de doute, le mieux est de vérifier directement les éléments concernés."
              />
            </div>
            
            <div className="space-y-3 sm:hidden">
              {technicalRows.map((row) => (
                <div key={row.check} className="rounded-[20px] bg-elevated p-4">
                  <p className="text-sm font-semibold leading-relaxed text-primary">{row.check}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <span className={`inline-flex px-3 py-1 rounded-full text-[10px] font-semibold ${getTechnicalStatusBadge(row.status)}`}>
                      Statut : {row.status}
                    </span>
                    <span className={`inline-flex px-3 py-1 rounded-full text-[10px] font-semibold ${getTechnicalImpactBadge(row.impact)}`}>
                      Impact : {row.impact}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="hidden sm:block -mx-5 sm:mx-0 overflow-x-auto">
              <div className="overflow-hidden rounded-2xl border border-elevated">
              <table className="w-full border-collapse min-w-[420px]">
              <thead>
                <tr className="bg-elevated">
                  <th className="border border-elevated p-2 sm:p-3 text-left text-sm sm:text-base font-semibold text-primary">Check</th>
                  <th className="border border-elevated p-2 sm:p-3 text-center text-sm sm:text-base font-semibold text-primary">Statut</th>
                  <th className="border border-elevated p-2 sm:p-3 text-center text-sm sm:text-base font-semibold text-primary">Impact</th>
                </tr>
              </thead>
              <tbody>
                {technicalRows.map((row, idx) => (
                  <tr
                    key={row.check}
                    className="hover:bg-elevated/50"
                  >
                    <td className="border border-elevated p-2 sm:p-3 text-xs sm:text-sm text-primary">{row.check}</td>
                    <td className="border border-elevated p-2 sm:p-3 text-center">
                      <span className={`inline-block px-2 sm:px-3 py-1 rounded-full text-[10px] sm:text-xs font-semibold ${getTechnicalStatusBadge(row.status)}`}>
                        {row.status}
                      </span>
                    </td>
                    <td className="border border-elevated p-2 sm:p-3 text-center">
                      <span className={`inline-block px-2 sm:px-3 py-1 rounded-full text-[10px] sm:text-xs font-semibold ${getTechnicalImpactBadge(row.impact)}`}>
                        {row.impact}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
              </table>
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 6 — Plan d'Action */}
        <div className="mb-10 sm:mb-12">
          <div className="ds-card p-5 sm:p-8">
            <div className="mb-3 flex items-center justify-between gap-3 sm:mb-4">
              <h2 className="text-xl sm:text-2xl font-bold flex items-center text-primary">
                Plan d'Action Recommandé
              </h2>
              <InfoTooltip
                label="Information plan d'action recommandé"
                description="Liste les actions à prioriser pour améliorer votre présence dans les réponses IA, classées par impact et difficulté pour identifier rapidement les meilleurs leviers."
              />
            </div>

            <div className="space-y-3 sm:space-y-4">
              {visibleRecommendations.map((recommendation) =>
                renderRecommendationCard(recommendation)
              )}
            </div>

            {extraRecommendations.length > 0 ? (
              <div className="mt-4 flex justify-center sm:mt-5">
                <motion.button
                  type="button"
                  onClick={() => setShowAllRecommendations(true)}
                  whileTap={{ scale: 0.98, y: 1 }}
                  transition={{ type: 'spring', stiffness: 700, damping: 24, mass: 0.45 }}
                  className="inline-flex items-center justify-center rounded-full border border-white px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-white hover:text-black"
                >
                  Voir {extraRecommendations.length} action{extraRecommendations.length > 1 ? 's' : ''} complémentaire{extraRecommendations.length > 1 ? 's' : ''}
                </motion.button>
              </div>
            ) : null}
          </div>
        </div>

        <div className="mb-10 sm:mb-12">
          <div className="ds-card p-5 sm:p-8">
            <h2 className="mb-3 sm:mb-4 text-xl sm:text-2xl font-bold flex items-center text-primary">
              Résumé Global Du Rapport
            </h2>
            <div className="rounded-[18px] bg-elevated p-4 sm:p-6">
              <p className="text-primary leading-relaxed">
                {displayGlobalExecutiveSummary}
              </p>
            </div>
          </div>
        </div>

        {/* SECTION 7 — Upsell Monitoring */}
        <div className="p-5 text-primary sm:p-8">
          <div className="text-center mb-3 sm:mb-4">
            <h2 className="text-xl sm:text-2xl font-bold mb-2 sm:mb-3">
              Surveillez votre score chaque mois
            </h2>
            <p className="text-secondary">
              Recevez un nouvel audit automatique tous les 30 jours et suivez votre progression.
            </p>
          </div>

          <div className="mx-auto max-w-xl">
            <AnimatePresence mode="wait" initial={false}>
              {!waitlistSubmitted ? (
                <motion.form
                  key="waitlist-form"
                  onSubmit={handleWaitlistSubmit}
                  initial={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
                  animate={{
                    opacity: 1,
                    y: 0,
                    scale: 1,
                    filter: 'blur(0px)',
                    transition: { duration: 0.22, ease: [0.22, 1, 0.36, 1] },
                  }}
                  exit={{
                    opacity: 0,
                    y: -6,
                    scale: 0.978,
                    filter: 'blur(10px)',
                    transition: { duration: 0.42, ease: [0.16, 1, 0.3, 1] },
                  }}
                >
                  <div className="relative flex min-h-[56px] items-center rounded-[28px] bg-surface p-[4px] sm:min-h-[60px] sm:rounded-[30px] sm:p-[6px]">
                    <HugeiconsIcon
                      icon={Mail01Icon}
                      size={20}
                      strokeWidth={1.8}
                      className="ml-4 h-5 w-5 shrink-0 text-white/45 sm:ml-5"
                    />
                    <input
                      type="email"
                      value={waitlistEmail}
                      onChange={(e) => setWaitlistEmail(e.target.value)}
                      placeholder="votre@email.com"
                      required
                      className="min-w-0 flex-1 bg-transparent px-3 pr-3 text-sm text-primary outline-none transition-colors placeholder:text-tertiary focus:outline-none sm:px-4 sm:pr-4 sm:text-base"
                    />
                    <button
                      type="submit"
                      className="inline-flex h-11 shrink-0 items-center justify-center rounded-full bg-white px-5 text-sm font-semibold whitespace-nowrap text-black transition-colors hover:bg-[#F2F2F2] sm:h-12 sm:px-7 sm:text-base"
                    >
                      Être prévenu
                    </button>
                  </div>
                  <p className="text-center text-tertiary text-sm mt-4">
                    Bientôt disponible - Pas de spam
                  </p>
                </motion.form>
              ) : (
                <motion.div
                  key="waitlist-success"
                  initial={{ opacity: 0, y: 8, scale: 0.96, filter: 'blur(12px)', borderRadius: 24 }}
                  animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)', borderRadius: 16 }}
                  transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
                  className="flex items-center justify-center p-4 text-center"
                >
                  <p className="font-semibold text-success">✓ Merci ! Vous serez prévenu dès le lancement.</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <div className="mt-1 flex flex-col flex-wrap items-center justify-center gap-3 sm:mt-2 sm:flex-row">
          <a
            href="/"
            className="inline-flex h-11 w-full items-center justify-center rounded-full bg-white text-black text-sm font-semibold transition-colors hover:bg-[#F2F2F2] sm:h-12 sm:w-[220px] sm:text-base"
          >
            Analyser un autre site
          </a>
          <motion.button
            type="button"
            onClick={handleCopyReportLink}
            whileTap={{ scale: 0.96, y: 1 }}
            transition={{ type: 'spring', stiffness: 700, damping: 24, mass: 0.45 }}
            className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-full border border-white bg-transparent text-white text-sm font-semibold transition-colors hover:bg-white hover:text-black sm:h-12 sm:w-[220px] sm:text-base"
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={isLinkCopied ? 'copied' : 'copy'}
                initial={{ opacity: 0, filter: 'blur(10px)', scale: 0.94 }}
                animate={{ opacity: 1, filter: 'blur(0px)', scale: 1 }}
                exit={{ opacity: 0, filter: 'blur(10px)', scale: 1.06 }}
                transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                className="inline-flex items-center justify-center gap-2"
              >
                <HugeiconsIcon
                  icon={isLinkCopied ? CheckmarkCircle02Icon : Copy01Icon}
                  size={18}
                  strokeWidth={1.9}
                  className="h-4 w-4 shrink-0"
                />
                {isLinkCopied ? 'Lien copié' : 'Copier le lien'}
              </motion.span>
            </AnimatePresence>
          </motion.button>
        </div>
        {shareFeedback ? (
          <p className="mt-3 text-center text-sm text-tertiary">{shareFeedback}</p>
        ) : null}
        {shareFallbackUrl ? (
          <div className="mx-auto mt-3 max-w-xl rounded-[20px] bg-elevated px-4 py-3 text-left">
            <p className="mb-2 text-xs font-medium uppercase tracking-[0.12em] text-tertiary">
              Lien du rapport
            </p>
            <p className="break-all text-sm text-primary">{shareFallbackUrl}</p>
          </div>
        ) : null}
      </div>

      <div className="mt-8 sm:mt-10 md:mt-12">
        <ReportFooterBrand />
      </div>

      {typeof window !== 'undefined'
        ? createPortal(
            <>
              <AnimatePresence>
                {isPdfDownloading ? (
                  <motion.div
                    className="fixed inset-0 z-[110] flex items-center justify-center bg-black/35 px-4 backdrop-blur-[6px]"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                    >
                    <motion.div
                      role="dialog"
                      aria-modal="true"
                      aria-live="polite"
                      initial={{ opacity: 0, y: 16, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 16, scale: 0.96 }}
                      transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
                      className="w-full max-w-sm rounded-[24px] bg-surface p-6 text-center shadow-[0_24px_64px_rgba(29,29,31,0.16)]"
                    >
                      <h3 className="mt-4 text-lg font-bold tracking-tight text-primary">
                        Génération du PDF en cours
                      </h3>
                      <div className="mt-5">
                        <div
                          role="progressbar"
                          aria-valuemin={0}
                          aria-valuemax={100}
                          aria-valuenow={Math.round(pdfDownloadProgress)}
                          className="h-3 w-full overflow-hidden rounded-full bg-elevated"
                        >
                          <div
                            className="h-3 rounded-full bg-gradient-to-r from-white to-white/85 shadow-[0_0_14px_rgba(255,255,255,0.28)]"
                            style={{
                              width: `${Math.max(0, Math.min(100, pdfDownloadProgress))}%`,
                              transition: 'width 220ms linear, box-shadow 0.45s ease',
                            }}
                          />
                        </div>
                        <div className="mt-2 flex items-center justify-between text-xs">
                          <span className="text-secondary">{pdfDownloadLabel}</span>
                          <span className="font-semibold text-primary">{Math.round(pdfDownloadProgress)}%</span>
                        </div>
                      </div>
                    </motion.div>
                  </motion.div>
                ) : null}
              </AnimatePresence>
              <AnimatePresence>
                {showAllRecommendations ? (
                  <motion.div
                    className="fixed inset-0 z-[100] flex items-center justify-center bg-black/30 px-4 backdrop-blur-[6px]"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                    onClick={() => setShowAllRecommendations(false)}
                  >
                    <motion.div
                      role="dialog"
                      aria-modal="true"
                      initial={{ opacity: 0, y: 16, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 16, scale: 0.96 }}
                      transition={{ duration: 0.34, ease: [0.16, 1, 0.3, 1] }}
                      className="relative w-full max-w-3xl rounded-[24px] bg-surface p-5 shadow-[0_24px_64px_rgba(29,29,31,0.16)] sm:p-6"
                      onClick={(event) => event.stopPropagation()}
                    >
                      <button
                        type="button"
                        onClick={() => setShowAllRecommendations(false)}
                        className="absolute right-5 top-5 inline-flex h-8 w-8 items-center justify-center rounded-full bg-elevated text-white/60 transition-colors hover:bg-white/[0.08] hover:text-white sm:right-6 sm:top-6"
                        aria-label="Fermer"
                      >
                        ×
                      </button>
                      <h3 className="pr-10 text-xl font-bold tracking-tight text-primary sm:text-2xl">
                        Toutes les recommandations du rapport
                      </h3>
                      <p className="mt-1 text-sm leading-relaxed text-secondary">
                        Voici les actions complémentaires à envisager après vos 5 priorités.
                      </p>
                      <div className="mt-5 max-h-[70vh] space-y-3 overflow-y-auto pr-1">
                        {extraRecommendations.map((recommendation) =>
                          renderRecommendationCard(recommendation, { inModal: true })
                        )}
                      </div>
                    </motion.div>
                  </motion.div>
                ) : null}
              </AnimatePresence>
              <AnimatePresence>
                {selectedMarketSignal ? (
                  <motion.div
                    className="fixed inset-0 z-[100] flex items-center justify-center bg-black/30 px-4 backdrop-blur-[6px]"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                    onClick={() => setSelectedMarketSignal(null)}
                  >
                    <motion.div
                      role="dialog"
                      aria-modal="true"
                      initial={{ opacity: 0, y: 16, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 16, scale: 0.96 }}
                      transition={{ duration: 0.34, ease: [0.16, 1, 0.3, 1] }}
                      className="relative w-full max-w-md rounded-[24px] bg-surface p-6 shadow-[0_24px_64px_rgba(29,29,31,0.16)]"
                      onClick={(event) => event.stopPropagation()}
                    >
                      <span className="pointer-events-none absolute left-6 top-6 text-primary" style={{ opacity: 0.12 }}>
                    <ReportSectionIcon
                      icon={
                        selectedMarketSignal.eyebrow === 'Prix'
                              ? AddMoneyCircleIcon
                              : selectedMarketSignal.eyebrow === 'Ressenti'
                              ? ActivitySparkIcon
                              : selectedMarketSignal.eyebrow === 'Polarisation'
                          ? ChartBarLineIcon
                          : selectedMarketSignal.eyebrow === 'Signal'
                          ? AiSearchIcon
                          : Shield01Icon
                      }
                      className="h-16 w-16"
                    />
                  </span>
                      <button
                        type="button"
                        onClick={() => setSelectedMarketSignal(null)}
                        className="absolute right-6 top-6 inline-flex h-8 w-8 items-center justify-center rounded-full bg-elevated text-white/60 transition-colors hover:bg-white/[0.08] hover:text-white"
                        aria-label="Fermer"
                      >
                        ×
                      </button>
                  <p className="mb-1 text-center text-[11px] font-semibold tracking-[0.14em] text-tertiary uppercase px-10">
                    {selectedMarketSignal.eyebrow}
                  </p>
                  <h3 className={`px-10 text-center text-[1.8rem] font-bold tracking-tight ${
                    selectedMarketSignal.barClass === 'bg-success'
                      ? 'text-success'
                      : selectedMarketSignal.barClass === 'bg-warning'
                      ? 'text-warning'
                      : selectedMarketSignal.barClass === 'bg-error'
                      ? 'text-error'
                      : selectedMarketSignal.barClass === 'bg-[#4BA7F5]'
                      ? 'text-[#4BA7F5]'
                      : 'text-primary'
                  }`}>
                    {selectedMarketSignal.title}
                  </h3>
                      <div className="mx-auto mt-4 h-1.5 w-full rounded-full bg-elevated">
                        <div
                          className={`h-1.5 rounded-full ${selectedMarketSignal.barClass}`}
                          style={{ width: `${selectedMarketSignal.progress}%` }}
                        />
                      </div>
                      <p className="mt-5 text-center text-sm leading-relaxed text-secondary">
                        {selectedMarketSignal.summary}
                      </p>
                    </motion.div>
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </>,
            document.body
          )
        : null}
    </div>
  );
}

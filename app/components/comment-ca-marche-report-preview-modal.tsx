'use client';

import Image from 'next/image';
import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import qoryIcon from '@/app/icon.png';
import { HugeiconsIcon } from '@hugeicons/react';
import { AlertSquareIcon, CheckmarkBadge02Icon } from '@hugeicons/core-free-icons';

type CommentCaMarcheReportPreviewModalProps = {
  open: boolean;
  onClose: () => void;
};

const DEMO_DOMAIN = 'qory.fr';
const DEMO_SCORE = 68;
const DEMO_QUERIES = 30;

const DEMO_DETAIL_SCORES = [
  { label: 'Visibilité', value: 55 },
  { label: 'Couverture factuelle', value: 62 },
  { label: 'Positionnement', value: 72 },
  { label: 'Technique', value: 78 },
] as const;

const DEMO_PROVIDER_HEALTH = [
  { label: 'ChatGPT', value: 82 },
  { label: 'Claude', value: 74 },
  { label: 'Perplexity', value: 79 },
] as const;

/** Requêtes génériques (sans nom de marque ni domaine), comme `buildDigitalDeterministicPrompts` dans le scan. */
const DEMO_QUERY_MATRIX = [
  {
    query:
      'Quels outils recommander pour auditer la visibilité d’un site dans les réponses des modèles d’IA ?',
    category: 'recommendation',
    openai: 'cited',
    anthropic: 'not_cited',
    perplexity: 'cited_first',
  },
  {
    query:
      'Donne-moi une liste de services pour mesurer si une marque est citée dans ChatGPT, Claude ou Perplexity.',
    category: 'listing',
    openai: 'not_cited',
    anthropic: 'cited',
    perplexity: 'cited',
  },
  {
    query: 'Quelle solution choisir pour obtenir un rapport de visibilité dans les assistants conversationnels ?',
    category: 'situation',
    openai: 'cited',
    anthropic: 'cited',
    perplexity: 'not_cited',
  },
  {
    query: 'Quels acteurs ressortent le plus pour l’analyse GEO et l’optimisation pour l’IA générative ?',
    category: 'listing',
    openai: 'not_cited',
    anthropic: 'not_cited',
    perplexity: 'cited',
  },
  {
    query: 'Quels services sont les plus fiables pour suivre les mentions de son site dans les assistants IA ?',
    category: 'reputation',
    openai: 'cited_first',
    anthropic: 'cited',
    perplexity: 'cited',
  },
] as const;

const DEMO_MENTION_RATES = { openai: 47, anthropic: 53, perplexity: 41 };

/** Mêmes SVG que la page rapport (`brightness-0 invert` sur fond sombre). */
const PROVIDER_HEADER_SVG = {
  openai: '/openai.svg',
  claude: '/claude.svg',
  perplexity: '/perplexity.svg',
} as const;

const DEMO_MARKET_CARDS = [
  { eyebrow: 'Prix', title: 'Intermédiaire', barClass: 'bg-warning', progress: 55 },
  { eyebrow: 'Ressenti', title: 'Plutôt positif', barClass: 'bg-success', progress: 72 },
  { eyebrow: 'Polarisation', title: 'Modérée', barClass: 'bg-warning', progress: 48 },
  { eyebrow: 'Confiance', title: 'Correcte', barClass: 'bg-success', progress: 65 },
  { eyebrow: 'Signal', title: 'Moyen', barClass: 'bg-warning', progress: 58 },
] as const;

const DEMO_STRENGTHS = [
  { label: 'Offre claire', evidence: 'Les IA résument bien la promesse « audit de visibilité IA » et le positionnement prix unique.' },
  { label: 'Site rapide', evidence: 'Les pages marketing sont perçues comme lisibles et directes sur l’intention utilisateur.' },
] as const;

const DEMO_WEAKNESSES = [
  { label: 'Concurrence citée avant vous', evidence: 'Sur plusieurs requêtes génériques, d’autres outils apparaissent en premier dans les réponses.' },
  { label: 'Preuves sociales limites', evidence: 'Peu d’extraits « cas client » repris tels quels dans les réponses des modèles.' },
] as const;

const DEMO_MARKET_SUMMARY =
  'Aperçu fictif : le marché perçoit Qory comme une offre claire et accessible, avec un bon ressenti global. La concurrence reste très présente sur les requêtes larges ; le signal est exploitable mais pas encore dominant.';

const DEMO_FACT_ROWS = [
  { label: 'Adresse', openai: 'Non trouvé', claude: 'Non trouvé', perplexity: 'Non trouvé' },
  { label: 'Téléphone', openai: 'Non trouvé', claude: 'Non trouvé', perplexity: 'Non trouvé' },
  { label: 'Email', openai: 'contact@qory.fr (approx.)', claude: 'Non trouvé', perplexity: 'contact@qory.fr' },
  { label: 'Horaires', openai: 'Non trouvé', claude: 'Non trouvé', perplexity: 'Non trouvé' },
  { label: 'Ville', openai: 'Non trouvé', claude: 'Paris (approx.)', perplexity: 'Non trouvé' },
] as const;

const DEMO_COMPETITORS = [
  { name: 'Concurrent A', mentions: 22 },
  { name: 'Concurrent B', mentions: 18 },
  { name: 'Concurrent C', mentions: 15 },
  { name: 'Concurrent D', mentions: 12 },
  { name: 'Concurrent E', mentions: 5 },
] as const;
const DEMO_YOU_MENTIONS = 9;

const DEMO_TECHNICAL = [
  { check: 'GPTBot autorisé dans robots.txt', status: 'Autorisé', impact: '—' },
  { check: 'ClaudeBot autorisé', status: 'Autorisé', impact: '—' },
  { check: 'PerplexityBot autorisé', status: 'Autorisé', impact: '—' },
  { check: 'Google-Extended autorisé', status: 'Autorisé', impact: '—' },
  { check: 'Données structurées (schema.org)', status: 'Présent', impact: '—' },
  { check: 'Sitemap.xml présent', status: 'Présent', impact: '—' },
  { check: 'HTTPS actif', status: 'Oui', impact: '—' },
] as const;

const DEMO_RECOMMENDATIONS = [
  {
    priority: 1,
    title: 'Renforcer les pages preuves et références clients',
    description:
      'Ajouter des blocs courts citables (résultats chiffrés, logos, témoignages) que les modèles peuvent reprendre dans leurs réponses.',
    difficulty: 'easy' as const,
    impact: 'high' as const,
  },
  {
    priority: 2,
    title: 'Publier une FAQ alignée sur les intentions « audit IA »',
    description:
      'Couvrir les formulations exactes que les utilisateurs posent aux IA (prix, méthode, livrables) pour augmenter les citations.',
    difficulty: 'medium' as const,
    impact: 'high' as const,
  },
  {
    priority: 3,
    title: 'Harmoniser le nom de marque et la description méta',
    description:
      'Réduire les variations « Qory / audit IA / GEO » pour que les modèles associent plus systématiquement la marque au bon site.',
    difficulty: 'easy' as const,
    impact: 'medium' as const,
  },
  {
    priority: 4,
    title: 'Surveiller les pages comparatives concurrentes',
    description:
      'Identifier les pages qui se classent sur « vs » et « alternative » ; compléter votre angle différenciant de façon factuelle.',
    difficulty: 'medium' as const,
    impact: 'medium' as const,
  },
] as const;

const DEMO_GLOBAL_SUMMARY =
  'Résumé de démonstration pour qory.fr : la base technique est saine et l’offre est comprise par les IA, mais la part de voix dans les réponses reste à gagner sur les requêtes génériques. Prioriser les preuves exploitables et la FAQ métier avant d’élargir le champ sémantique.';

function scoreToneClass(value: number) {
  if (value >= 70) return 'text-success';
  if (value >= 40) return 'text-warning';
  return 'text-error';
}

function scoreBarClass(value: number) {
  if (value >= 70) return 'bg-success';
  if (value >= 40) return 'bg-warning';
  return 'bg-error';
}

function getStatusColor(status: string) {
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
}

function getStatusLabel(status: string) {
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
}

function getStatusWidthClass(status: string) {
  return status === 'not_cited' ? 'w-20' : '';
}

function getTechnicalStatusBadge(status: string) {
  if (status === 'Bloqué' || status === 'Absent' || status === 'Non') {
    return 'bg-error/10 text-error';
  }
  if (status === 'Autorisé' || status === 'Présent' || status === 'Oui') {
    return 'bg-success/10 text-success';
  }
  return 'bg-warning/10 text-warning';
}

function getTechnicalImpactBadge(impact: string) {
  if (impact === 'Élevé') return 'bg-error/10 text-error';
  if (impact === 'Moyen') return 'bg-warning/10 text-warning';
  if (impact === 'Faible') return 'bg-success/10 text-success';
  return 'bg-elevated/50 text-secondary';
}

function competitiveBarClass(mentions: number) {
  if (mentions >= 20) return 'bg-[#FF3B30]';
  if (mentions >= 10) return 'bg-[#FF9F0A]';
  if (mentions >= 1) return 'bg-[#34C759]';
  return 'bg-[#8E96A3]';
}

function competitiveHoverBarClass(mentions: number, isYou: boolean) {
  if (isYou) return '!bg-[#d4d4d8]';
  if (mentions >= 20) return 'bg-[#E13227]';
  if (mentions >= 10) return 'bg-[#E08E09]';
  if (mentions >= 1) return 'bg-[#2FB24D]';
  return 'bg-[#6F7785]';
}

function getDemoCompetitiveChartData() {
  const series = [
    ...DEMO_COMPETITORS.map((c) => ({
      label: c.name,
      mentions: Math.min(c.mentions, DEMO_QUERIES),
      isYou: false,
    })),
    {
      label: 'Vous (Qory)',
      mentions: Math.min(DEMO_YOU_MENTIONS, DEMO_QUERIES),
      isYou: true,
    },
  ];
  const max = Math.max(1, ...series.map((e) => e.mentions));
  const tickStep = max <= 8 ? 1 : Math.max(1, Math.ceil(max / 4));
  const upperBoundBase = Math.max(tickStep, Math.ceil(max / tickStep) * tickStep);
  const upperBound = upperBoundBase === max ? upperBoundBase + tickStep : upperBoundBase;
  const ticks = Array.from(
    { length: Math.floor(upperBound / tickStep) + 1 },
    (_, index) => index * tickStep
  );
  return { series, ticks, upperBound };
}

function ReportSectionIcon({
  icon,
  className = 'h-5 w-5',
}: {
  icon: typeof CheckmarkBadge02Icon;
  className?: string;
}) {
  return <HugeiconsIcon icon={icon} size={24} strokeWidth={1.9} className={className} />;
}

export default function CommentCaMarcheReportPreviewModal({
  open,
  onClose,
}: CommentCaMarcheReportPreviewModalProps) {
  const [mounted, setMounted] = useState(false);
  const [competitiveView, setCompetitiveView] = useState<'bars' | 'chart'>('bars');
  const [competitiveTooltip, setCompetitiveTooltip] = useState<{
    label: string;
    mentions: number;
    x: number;
    y: number;
  } | null>(null);
  const [competitiveHoveredBar, setCompetitiveHoveredBar] = useState<string | null>(null);
  const competitiveChartPlotRef = useRef<HTMLDivElement | null>(null);

  const demoCompetitiveChart = useMemo(() => getDemoCompetitiveChartData(), []);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  if (!mounted) return null;

  const scoreColor = scoreToneClass(DEMO_SCORE);
  const scoreBarColor = scoreBarClass(DEMO_SCORE);
  const scoreLabel = DEMO_SCORE >= 70 ? 'Bonne' : DEMO_SCORE >= 40 ? 'Moyenne' : 'Faible';

  return createPortal(
    open ? (
      <div className="fixed inset-0 z-[200] flex items-end justify-center p-0 sm:items-center sm:p-3 md:p-4">
        <button
          type="button"
          aria-label="Fermer l’aperçu"
          className="absolute inset-0 bg-black/90 backdrop-blur-[3px]"
          onClick={onClose}
        />
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="report-preview-title"
          className="report-shell relative z-[1] flex max-h-[min(96dvh,56rem)] w-full max-w-4xl flex-col overflow-hidden rounded-t-[1.25rem] border border-white/10 bg-[#050506] shadow-[0_32px_120px_rgba(0,0,0,0.65)] sm:max-h-[min(92vh,52rem)] sm:rounded-2xl"
        >
          <button
            type="button"
            onClick={onClose}
            className="absolute right-2 top-2 z-10 inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/15 text-lg leading-none text-white backdrop-blur-sm transition-colors hover:bg-white/25 sm:right-3 sm:top-3 sm:h-10 sm:w-10"
            aria-label="Fermer"
          >
            <span aria-hidden>×</span>
          </button>

          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 pb-5 pt-12 sm:px-6 sm:pb-6 sm:pt-14 md:pb-8 md:pt-14">
            <div className="mb-5 flex items-center justify-center gap-3 sm:mb-6 sm:gap-4">
              <Image
                src={qoryIcon}
                alt=""
                width={40}
                height={40}
                className="h-9 w-9 shrink-0 rounded-[12px] object-cover sm:h-10 sm:w-10"
              />
              <p
                id="report-preview-title"
                className="min-w-0 break-words text-center text-xl font-semibold leading-tight tracking-tight text-primary sm:text-2xl md:text-3xl"
              >
                {DEMO_DOMAIN}
              </p>
            </div>

            {/* Score global */}
            <div className="mb-8 sm:mb-10">
              <div className="ds-card p-5 sm:p-8">
                <h2 className="mb-4 text-center text-xl font-bold text-primary sm:mb-5 sm:text-2xl md:text-3xl">
                  Votre Score de Visibilité IA
                </h2>
                <div className="mb-3 flex items-center justify-center sm:mb-4">
                  <div className={`text-5xl font-bold tabular-nums sm:text-6xl ${scoreColor}`}>
                    {DEMO_SCORE}/100
                  </div>
                </div>
                <p className="mb-4 text-center text-base text-secondary sm:mb-5 sm:text-lg">
                  Votre visibilité IA est{' '}
                  <span className={`font-semibold ${scoreColor}`}>{scoreLabel}</span>
                </p>
                <div className="mb-4 h-3 w-full overflow-hidden rounded-full bg-elevated sm:mb-5 sm:h-4">
                  <div
                    className={`h-3 rounded-full sm:h-4 ${scoreBarColor}`}
                    style={{ width: `${DEMO_SCORE}%` }}
                  />
                </div>
                <div className="rounded-[18px] bg-elevated p-4 sm:p-6">
                  <p className="text-sm leading-relaxed text-primary sm:text-base">
                    Données de démonstration : votre site présente bien l’offre Qory, mais la visibilité dans les
                    réponses IA varie selon les requêtes. Sur les intentions « audit visibilité IA » et « outil GEO
                    », d’autres acteurs sont souvent cités en premier.
                  </p>
                </div>
              </div>
            </div>

            {/* Fiabilité + Détail */}
            <div className="mb-8 grid gap-4 sm:mb-10 md:grid-cols-2">
              <div className="ds-card h-full p-4 sm:p-6">
                <h2 className="mb-3 text-xl font-bold text-primary sm:mb-4 sm:text-2xl">
                  Fiabilité des données IA
                </h2>
                <div className="mb-4 flex items-center justify-between gap-3">
                  <span className="text-sm font-semibold text-primary">Qualité globale</span>
                  <span className="inline-flex items-center justify-center rounded-full bg-warning/10 px-3 py-1 text-xs font-semibold text-warning">
                    Partielle
                  </span>
                </div>
                <div className="space-y-2 text-sm">
                  {DEMO_PROVIDER_HEALTH.map((row) => (
                    <div key={row.label} className="flex items-center justify-between">
                      <span className="text-secondary">{row.label}</span>
                      <span className={`font-semibold ${scoreToneClass(row.value)}`}>{row.value}%</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="ds-card h-full p-4 sm:p-6">
                <h2 className="mb-3 text-xl font-bold text-primary sm:mb-4 sm:text-2xl">Détail du score</h2>
                <div className="grid grid-cols-2 gap-2 sm:gap-3">
                  {DEMO_DETAIL_SCORES.map((item) => (
                    <div key={item.label} className="rounded-[18px] bg-elevated p-2.5 sm:p-3">
                      <p className="mb-1.5 text-xs font-semibold text-primary">{item.label}</p>
                      <p className={`text-xl font-bold tabular-nums sm:text-2xl ${scoreToneClass(item.value)}`}>
                        {item.value}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Visibilité par modèle */}
            <div className="mb-8 sm:mb-10">
              <div className="ds-card p-5 sm:p-8">
                <h2 className="text-xl font-bold text-primary sm:text-2xl">Visibilité par Modèle IA</h2>
                <p className="mb-4 mt-1 text-xs text-tertiary sm:mb-6 sm:text-sm">
                  Extrait de {DEMO_QUERY_MATRIX.length} requêtes sur {DEMO_QUERIES} effectuées (fictif)
                </p>
                <div className="space-y-3 sm:hidden">
                  {DEMO_QUERY_MATRIX.map((row) => (
                    <div key={row.query} className="rounded-[20px] bg-elevated p-4">
                      <p className="text-[0.98rem] font-semibold leading-relaxed text-primary">{row.query}</p>
                      <p className="mt-1 text-xs text-tertiary">{row.category}</p>
                      <div className="mt-3 space-y-2.5">
                        {(
                          [
                            { label: 'ChatGPT', icon: PROVIDER_HEADER_SVG.openai, value: row.openai },
                            { label: 'Claude', icon: PROVIDER_HEADER_SVG.claude, value: row.anthropic },
                            { label: 'Perplexity', icon: PROVIDER_HEADER_SVG.perplexity, value: row.perplexity },
                          ] as const
                        ).map((p) => (
                          <div
                            key={p.label}
                            className="flex items-center justify-between gap-3 rounded-[16px] bg-surface px-3 py-2.5"
                          >
                            <span className="inline-flex min-w-0 items-center gap-2 text-sm font-medium text-primary">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={p.icon}
                                alt=""
                                className="h-4 w-4 shrink-0 object-contain brightness-0 invert"
                              />
                              {p.label}
                            </span>
                            <span
                              className={`inline-flex items-center justify-center rounded-full px-3 py-1 text-[10px] font-semibold ${getStatusWidthClass(p.value)} ${getStatusColor(p.value)}`}
                            >
                              {getStatusLabel(p.value)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="hidden sm:block sm:overflow-x-auto">
                  <div className="overflow-hidden rounded-2xl border border-elevated">
                    <table className="w-full min-w-[540px] border-collapse">
                      <thead>
                        <tr className="bg-elevated">
                          <th className="border border-elevated p-2 text-left text-sm font-semibold text-primary sm:p-3 sm:text-base">
                            Requête
                          </th>
                          <th className="border border-elevated p-2 text-center text-sm font-semibold text-primary sm:p-3 sm:text-base">
                            <span className="inline-flex items-center justify-center gap-1.5">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={PROVIDER_HEADER_SVG.openai}
                                alt=""
                                className="h-4 w-4 object-contain brightness-0 invert"
                              />
                              ChatGPT
                            </span>
                          </th>
                          <th className="border border-elevated p-2 text-center text-sm font-semibold text-primary sm:p-3 sm:text-base">
                            <span className="inline-flex items-center justify-center gap-1.5">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={PROVIDER_HEADER_SVG.claude}
                                alt=""
                                className="h-4 w-4 object-contain brightness-0 invert"
                              />
                              Claude
                            </span>
                          </th>
                          <th className="border border-elevated p-2 text-center text-sm font-semibold text-primary sm:p-3 sm:text-base">
                            <span className="inline-flex items-center justify-center gap-1.5">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={PROVIDER_HEADER_SVG.perplexity}
                                alt=""
                                className="h-4 w-4 object-contain brightness-0 invert"
                              />
                              Perplexity
                            </span>
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {DEMO_QUERY_MATRIX.map((row) => (
                          <tr key={row.query} className="align-top hover:bg-elevated/50">
                            <td className="border border-elevated p-2 text-xs text-primary sm:p-3 sm:text-sm">
                              <div className="font-medium leading-relaxed">{row.query}</div>
                              <div className="mt-1 text-xs text-tertiary">{row.category}</div>
                            </td>
                            {(
                              [
                                { id: 'openai', cell: row.openai },
                                { id: 'anthropic', cell: row.anthropic },
                                { id: 'perplexity', cell: row.perplexity },
                              ] as const
                            ).map(({ id, cell }) => (
                              <td
                                key={`${row.query}-${id}`}
                                className="border border-elevated p-2 text-center align-top sm:p-3"
                              >
                                <span
                                  className={`inline-flex items-center justify-center rounded-full px-2 py-1 text-[10px] font-semibold sm:px-3 sm:text-xs ${getStatusWidthClass(cell)} ${getStatusColor(cell)}`}
                                >
                                  {getStatusLabel(cell)}
                                </span>
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
                <p className="mt-4 text-xs text-secondary sm:mt-6 sm:text-sm">
                  <span className="font-semibold text-primary">Résumé :</span> Vous apparaissez dans{' '}
                  <span className={`font-bold ${scoreToneClass(DEMO_MENTION_RATES.openai)}`}>
                    {DEMO_MENTION_RATES.openai}%
                  </span>{' '}
                  des réponses ChatGPT,{' '}
                  <span className={`font-bold ${scoreToneClass(DEMO_MENTION_RATES.anthropic)}`}>
                    {DEMO_MENTION_RATES.anthropic}%
                  </span>{' '}
                  des réponses Claude, et{' '}
                  <span className={`font-bold ${scoreToneClass(DEMO_MENTION_RATES.perplexity)}`}>
                    {DEMO_MENTION_RATES.perplexity}%
                  </span>{' '}
                  des réponses Perplexity (fictif).
                </p>
              </div>
            </div>

            {/* Positionnement marché */}
            <div className="mb-8 sm:mb-10">
              <div className="ds-card p-5 sm:p-8">
                <h2 className="mb-4 text-xl font-bold text-primary sm:mb-5 sm:text-2xl">Positionnement Marché</h2>
                <div className="grid gap-3 sm:gap-4 md:grid-cols-2 xl:grid-cols-5">
                  {DEMO_MARKET_CARDS.map((card) => (
                    <div
                      key={card.eyebrow}
                      className="rounded-[18px] border border-white/[0.08] bg-elevated/80 p-3 sm:p-4"
                    >
                      <p className="text-[0.65rem] font-semibold uppercase tracking-wide text-tertiary">
                        {card.eyebrow}
                      </p>
                      <p className="mt-1 text-sm font-bold text-primary sm:text-base">{card.title}</p>
                      <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-surface">
                        <div className={`h-full rounded-full ${card.barClass}`} style={{ width: `${card.progress}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  <div>
                    <h3 className="mb-3 flex items-center gap-2 text-base font-bold text-success sm:text-lg">
                      <ReportSectionIcon icon={CheckmarkBadge02Icon} className="h-5 w-5" />
                      Avantages identifiés par l&apos;IA
                    </h3>
                    <div className="space-y-3">
                      {DEMO_STRENGTHS.map((item) => (
                        <div key={item.label} className="rounded-[18px] bg-success/10 px-4 py-4">
                          <p className="text-sm font-semibold text-success">{item.label}</p>
                          <p className="mt-1 text-sm text-white">{item.evidence}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h3 className="mb-3 flex items-center gap-2 text-base font-bold text-error sm:text-lg">
                      <ReportSectionIcon icon={AlertSquareIcon} className="h-5 w-5" />
                      Limites et points de friction
                    </h3>
                    <div className="space-y-3">
                      {DEMO_WEAKNESSES.map((item) => (
                        <div key={item.label} className="rounded-[18px] bg-error/10 px-4 py-4">
                          <p className="text-sm font-semibold text-error">{item.label}</p>
                          <p className="mt-1 text-sm text-white">{item.evidence}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="mt-4">
                  <h3 className="mb-3 text-base font-bold text-primary sm:text-lg">Résumé Marché</h3>
                  <div className="rounded-[18px] bg-elevated p-4 sm:p-6">
                    <p className="leading-relaxed text-primary">{DEMO_MARKET_SUMMARY}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Informations attribuées */}
            <div className="mb-8 sm:mb-10">
              <div className="ds-card p-5 sm:p-8">
                <h2 className="mb-3 text-xl font-bold text-primary sm:mb-4 sm:text-2xl">
                  Informations attribuées par les IA
                </h2>
                <div className="overflow-x-auto">
                  <div className="overflow-hidden rounded-2xl border border-elevated">
                    <table className="w-full min-w-[520px] border-collapse">
                      <thead>
                        <tr className="bg-elevated">
                          <th className="border border-elevated p-2 text-left text-sm font-semibold text-primary sm:p-3">
                            Information
                          </th>
                          <th className="border border-elevated p-2 text-center text-sm font-semibold text-primary sm:p-3">
                            <span className="inline-flex flex-col items-center justify-center gap-1 sm:flex-row sm:gap-1.5">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={PROVIDER_HEADER_SVG.openai}
                                alt=""
                                className="h-4 w-4 shrink-0 object-contain brightness-0 invert"
                              />
                              <span>ChatGPT</span>
                            </span>
                          </th>
                          <th className="border border-elevated p-2 text-center text-sm font-semibold text-primary sm:p-3">
                            <span className="inline-flex flex-col items-center justify-center gap-1 sm:flex-row sm:gap-1.5">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={PROVIDER_HEADER_SVG.claude}
                                alt=""
                                className="h-4 w-4 shrink-0 object-contain brightness-0 invert"
                              />
                              <span>Claude</span>
                            </span>
                          </th>
                          <th className="border border-elevated p-2 text-center text-sm font-semibold text-primary sm:p-3">
                            <span className="inline-flex flex-col items-center justify-center gap-1 sm:flex-row sm:gap-1.5">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={PROVIDER_HEADER_SVG.perplexity}
                                alt=""
                                className="h-4 w-4 shrink-0 object-contain brightness-0 invert"
                              />
                              <span>Perplexity</span>
                            </span>
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {DEMO_FACT_ROWS.map((row) => (
                          <tr key={row.label} className="hover:bg-elevated/50">
                            <td className="border border-elevated p-2 text-xs font-medium text-primary sm:p-3 sm:text-sm">
                              {row.label}
                            </td>
                            <td className="border border-elevated p-2 text-xs text-primary sm:p-3 sm:text-sm">
                              {row.openai}
                            </td>
                            <td className="border border-elevated p-2 text-xs text-primary sm:p-3 sm:text-sm">
                              {row.claude}
                            </td>
                            <td className="border border-elevated p-2 text-xs text-primary sm:p-3 sm:text-sm">
                              {row.perplexity}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>

            {/* Analyse concurrentielle */}
            <div className="mb-8 sm:mb-10">
              <div className="ds-card p-5 sm:p-8">
                <div className="mb-3 flex flex-col gap-3 sm:mb-4 sm:flex-row sm:items-start sm:justify-between">
                  <h2 className="text-xl font-bold text-primary sm:text-2xl">Analyse Concurrentielle</h2>
                  <div className="inline-flex w-fit items-center gap-1 rounded-full bg-elevated p-1">
                    <button
                      type="button"
                      onClick={() => setCompetitiveView('bars')}
                      className={`relative inline-flex w-[92px] items-center justify-center rounded-full px-3 py-1.5 text-xs font-semibold transition-colors sm:w-[96px] sm:px-3.5 ${
                        competitiveView === 'bars'
                          ? 'text-[#0a0a0b]'
                          : 'text-white/55 hover:text-white'
                      }`}
                    >
                      {competitiveView === 'bars' && (
                        <motion.span
                          layoutId="ccm-report-preview-competitive-toggle"
                          className="absolute inset-0 rounded-full bg-white shadow-[0_1px_2px_rgba(0,0,0,0.12)]"
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
                          ? 'text-[#0a0a0b]'
                          : 'text-white/55 hover:text-white'
                      }`}
                    >
                      {competitiveView === 'chart' && (
                        <motion.span
                          layoutId="ccm-report-preview-competitive-toggle"
                          className="absolute inset-0 rounded-full bg-white shadow-[0_1px_2px_rgba(0,0,0,0.12)]"
                          transition={{ type: 'spring', stiffness: 360, damping: 30 }}
                        />
                      )}
                      <span className="relative z-10">Graphique</span>
                    </button>
                  </div>
                </div>

                <motion.div
                  layout
                  className="relative overflow-hidden"
                  transition={{
                    layout: { duration: 0.38, ease: [0.22, 1, 0.36, 1] },
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
                        {DEMO_COMPETITORS.map((comp, idx) => (
                          <div key={comp.name} className="flex items-center justify-between gap-2 sm:gap-4">
                            <div className="flex min-w-0 items-center gap-2 sm:gap-3">
                              <span className="w-4 shrink-0 text-sm font-bold text-primary sm:w-5 sm:text-base">
                                {idx + 1}.
                              </span>
                              <span className="truncate text-sm font-semibold text-primary sm:text-base">
                                {comp.name}
                              </span>
                            </div>
                            <div className="flex w-36 max-w-[50%] items-center gap-2 sm:w-52 sm:max-w-[55%] sm:gap-3">
                              <div className="h-2 flex-1 overflow-hidden rounded-full bg-elevated">
                                <div
                                  className={`h-2 rounded-full ${competitiveBarClass(comp.mentions)}`}
                                  style={{
                                    width: `${Math.min((comp.mentions / DEMO_QUERIES) * 100, 100)}%`,
                                  }}
                                />
                              </div>
                              <span className="whitespace-nowrap text-xs tabular-nums text-secondary sm:text-sm">
                                {comp.mentions}/{DEMO_QUERIES}
                              </span>
                            </div>
                          </div>
                        ))}
                        <div className="flex items-center justify-between gap-2 border-t border-elevated pt-2 sm:gap-4">
                          <div className="flex min-w-0 items-center gap-2 sm:gap-3">
                            <span className="w-4 shrink-0 text-sm font-bold text-tertiary sm:w-5">—</span>
                            <span className="truncate text-sm text-secondary sm:text-base">Vous (Qory)</span>
                          </div>
                          <div className="flex w-36 max-w-[50%] items-center gap-2 sm:w-52 sm:max-w-[55%] sm:gap-3">
                            <div className="h-2 flex-1 overflow-hidden rounded-full bg-elevated">
                              <div
                                className="h-2 rounded-full !bg-white"
                                style={{
                                  width: `${Math.min((DEMO_YOU_MENTIONS / DEMO_QUERIES) * 100, 100)}%`,
                                }}
                              />
                            </div>
                            <span className="whitespace-nowrap text-xs tabular-nums text-secondary sm:text-sm">
                              {DEMO_YOU_MENTIONS}/{DEMO_QUERIES}
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
                          <div className="min-w-[520px] sm:min-w-[560px]">
                            <div className="grid grid-cols-[2.5rem_minmax(0,1fr)] gap-3 sm:grid-cols-[3rem_minmax(0,1fr)] sm:gap-4">
                              <div className="relative h-[240px] sm:h-[280px]">
                                {demoCompetitiveChart.ticks.map((tick) => {
                                  const bottom = `${(tick / demoCompetitiveChart.upperBound) * 100}%`;
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
                                className="relative h-[240px] border-b border-l border-white/[0.12] sm:h-[280px]"
                                onMouseLeave={() => {
                                  setCompetitiveTooltip(null);
                                  setCompetitiveHoveredBar(null);
                                }}
                              >
                                {demoCompetitiveChart.ticks.map((tick) => {
                                  const bottom = `${(tick / demoCompetitiveChart.upperBound) * 100}%`;
                                  return (
                                    <div
                                      key={tick}
                                      className="pointer-events-none absolute inset-x-0 border-t border-white/[0.08]"
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
                                        {competitiveTooltip.mentions} citation
                                        {competitiveTooltip.mentions > 1 ? 's' : ''}
                                      </p>
                                    </div>
                                  </div>
                                )}

                                <div className="absolute inset-0 flex items-end justify-between gap-2 px-2 sm:gap-3 sm:px-3">
                                  {demoCompetitiveChart.series.map((entry) => {
                                    const barKey = `${entry.label}-${entry.isYou ? 'you' : 'competitor'}`;
                                    const barHeight = `${(entry.mentions / demoCompetitiveChart.upperBound) * 100}%`;
                                    const barColorClass =
                                      competitiveHoveredBar === barKey
                                        ? competitiveHoverBarClass(entry.mentions, entry.isYou)
                                        : entry.isYou
                                          ? '!bg-white'
                                          : competitiveBarClass(entry.mentions);

                                    return (
                                      <div
                                        key={barKey}
                                        className="flex h-full min-w-0 flex-1 items-end justify-center"
                                      >
                                        <div className="relative flex h-full w-full max-w-[48px] items-end justify-center sm:max-w-[54px]">
                                          <div
                                            role="presentation"
                                            className={`w-full rounded-t-[18px] ${barColorClass} transition-colors duration-200 ease-out ${
                                              entry.isYou ? '' : 'shadow-[0_16px_32px_rgba(29,29,31,0.08)]'
                                            }`}
                                            style={{ height: barHeight }}
                                            onMouseEnter={() => setCompetitiveHoveredBar(barKey)}
                                            onMouseMove={(event) => {
                                              const plotRect =
                                                competitiveChartPlotRef.current?.getBoundingClientRect();
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
                            </div>

                            <div className="grid grid-cols-[2.5rem_minmax(0,1fr)] gap-3 sm:grid-cols-[3rem_minmax(0,1fr)] sm:gap-4">
                              <div />
                              <div className="flex items-start justify-between gap-2 px-2 pt-3 sm:gap-3 sm:px-3">
                                {demoCompetitiveChart.series.map((entry) => (
                                  <div
                                    key={`${entry.label}-${entry.isYou ? 'you-label' : 'competitor-label'}`}
                                    className="flex min-w-0 flex-1 justify-center"
                                  >
                                    <span
                                      className={`line-clamp-2 min-h-[2.5rem] text-center text-[11px] leading-tight sm:text-xs ${
                                        entry.isYou ? 'font-semibold text-white' : 'text-secondary'
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
              </div>
            </div>

            {/* Audit technique */}
            <div className="mb-8 sm:mb-10">
              <div className="ds-card p-5 sm:p-8">
                <h2 className="mb-3 text-xl font-bold text-primary sm:mb-4 sm:text-2xl">Audit Technique</h2>
                <div className="space-y-3 sm:hidden">
                  {DEMO_TECHNICAL.map((row) => (
                    <div key={row.check} className="rounded-[20px] bg-elevated p-4">
                      <p className="text-sm font-semibold leading-relaxed text-primary">{row.check}</p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-[10px] font-semibold ${getTechnicalStatusBadge(row.status)}`}
                        >
                          Statut : {row.status}
                        </span>
                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-[10px] font-semibold ${getTechnicalImpactBadge(row.impact)}`}
                        >
                          Impact : {row.impact}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="hidden sm:block sm:overflow-x-auto">
                  <div className="overflow-hidden rounded-2xl border border-elevated">
                    <table className="min-w-[420px] w-full border-collapse">
                      <thead>
                        <tr className="bg-elevated">
                          <th className="border border-elevated p-2 text-left text-sm font-semibold text-primary sm:p-3 sm:text-base">
                            Check
                          </th>
                          <th className="border border-elevated p-2 text-center text-sm font-semibold text-primary sm:p-3 sm:text-base">
                            Statut
                          </th>
                          <th className="border border-elevated p-2 text-center text-sm font-semibold text-primary sm:p-3 sm:text-base">
                            Impact
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {DEMO_TECHNICAL.map((row) => (
                          <tr key={row.check} className="hover:bg-elevated/50">
                            <td className="border border-elevated p-2 text-xs text-primary sm:p-3 sm:text-sm">
                              {row.check}
                            </td>
                            <td className="border border-elevated p-2 text-center">
                              <span
                                className={`inline-block rounded-full px-2 py-1 text-[10px] font-semibold sm:px-3 sm:text-xs ${getTechnicalStatusBadge(row.status)}`}
                              >
                                {row.status}
                              </span>
                            </td>
                            <td className="border border-elevated p-2 text-center">
                              <span
                                className={`inline-block rounded-full px-2 py-1 text-[10px] font-semibold sm:px-3 sm:text-xs ${getTechnicalImpactBadge(row.impact)}`}
                              >
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

            {/* Plan d'action */}
            <div className="mb-8 sm:mb-10">
              <div className="ds-card p-5 sm:p-8">
                <h2 className="mb-3 text-xl font-bold text-primary sm:mb-4 sm:text-2xl">
                  Plan d&apos;Action Recommandé
                </h2>
                <div className="space-y-3 sm:space-y-4">
                  {DEMO_RECOMMENDATIONS.map((rec) => (
                    <div key={rec.priority} className="rounded-[18px] bg-elevated p-4 sm:p-6">
                      <div className="mb-1.5 text-sm font-bold text-primary sm:mb-2 sm:text-base">
                        {rec.priority}. {rec.title}
                      </div>
                      <p className="text-sm leading-relaxed text-secondary sm:text-base">{rec.description}</p>
                      <div className="mt-3 flex flex-wrap items-center gap-2 sm:mt-4">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${
                            rec.difficulty === 'easy'
                              ? 'bg-success/10 text-success'
                              : rec.difficulty === 'medium'
                                ? 'bg-warning/10 text-warning'
                                : 'bg-error/10 text-error'
                          }`}
                        >
                          {rec.difficulty === 'easy'
                            ? 'Facile'
                            : rec.difficulty === 'medium'
                              ? 'Technique'
                              : 'Complexe'}
                        </span>
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${
                            rec.impact === 'high'
                              ? 'bg-error/10 text-error'
                              : rec.impact === 'medium'
                                ? 'bg-warning/10 text-warning'
                                : 'bg-success/10 text-success'
                          }`}
                        >
                          Impact: {rec.impact === 'high' ? 'Élevé' : rec.impact === 'medium' ? 'Moyen' : 'Faible'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Résumé global */}
            <div className="mb-6 sm:mb-8">
              <div className="ds-card p-5 sm:p-8">
                <h2 className="mb-3 text-xl font-bold text-primary sm:mb-4 sm:text-2xl">
                  Résumé Global Du Rapport
                </h2>
                <div className="rounded-[18px] bg-elevated p-4 sm:p-6">
                  <p className="leading-relaxed text-primary">{DEMO_GLOBAL_SUMMARY}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    ) : null,
    document.body,
  );
}

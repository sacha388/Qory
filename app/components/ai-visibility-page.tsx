import Image from 'next/image';
import Link from 'next/link';
import {
  AiViewIcon,
  ArrowReloadHorizontalIcon,
  AutoConversationsIcon,
  BrowserIcon,
  Cancel01Icon,
  ChartBarLineIcon,
  CheckmarkCircle02Icon,
  FileSearchIcon,
  RankingIcon,
  Search01Icon,
  Structure05Icon,
  Target02Icon,
  TradeDownIcon,
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import type { IconSvgElement } from '@hugeicons/react';
import LandingHeroSafariComparison from '@/app/components/landing-hero-safari-comparison';
import SeoGeoSplitMockup from '@/app/components/seo-geo-split-mockup';
import ReportPreviewTrigger from '@/app/components/report-preview-trigger';
import SiteFooter from '@/app/components/site-footer';
import SiteHeader from '@/app/components/site-header';
import qoryIcon from '@/app/icon.png';
import { getSiteUrl } from '@/app/lib/site-url';
import type {
  AiVisibilityCard,
  AiVisibilityPageData,
  AiVisibilitySection,
} from '@/app/lib/ai-visibility-pages-content';

type AiVisibilityPageProps = {
  page: AiVisibilityPageData;
};

function isLightColor(hex: string) {
  const value = hex.replace('#', '');
  if (value.length !== 6) {
    return false;
  }

  const r = Number.parseInt(value.slice(0, 2), 16);
  const g = Number.parseInt(value.slice(2, 4), 16);
  const b = Number.parseInt(value.slice(4, 6), 16);

  return (r * 299 + g * 587 + b * 114) / 1000 > 170;
}

function SectionEyebrow({ children, accent }: { children?: string; accent: string }) {
  if (!children) {
    return null;
  }

  return (
    <p className="text-xs font-semibold uppercase tracking-normal" style={{ color: accent }}>
      {children}
    </p>
  );
}

function ArrowMark({ accent }: { accent: string }) {
  return (
    <span
      className="mt-1 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/[0.045]"
      style={{ color: accent }}
      aria-hidden
    >
      <svg viewBox="0 0 16 16" className="h-4 w-4" fill="none">
        <path
          d="M3.25 8h8.2M8.75 4.75 12 8l-3.25 3.25"
          stroke="currentColor"
          strokeWidth="1.55"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}

function BulletList({ items, accent }: { items?: string[]; accent: string }) {
  if (!items || items.length === 0) {
    return null;
  }

  return (
    <ul className="mt-7 grid gap-3">
      {items.map((item) => (
        <li key={item} className="flex items-start gap-3.5 text-base leading-7 text-white/74 sm:text-lg">
          <ArrowMark accent={accent} />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

function CardGrid({ cards, accent }: { cards: AiVisibilityCard[]; accent: string }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {cards.map((card, index) => (
        <article
          key={card.title}
          className="rounded-[1.75rem] border border-white/10 bg-white/[0.04] p-5 sm:rounded-[2rem]"
        >
          <div
            className="mb-5 inline-flex h-9 min-w-9 items-center justify-center rounded-full px-3 text-sm font-semibold text-white"
            style={{ backgroundColor: accent }}
          >
            {String(index + 1).padStart(2, '0')}
          </div>
          <h3 className="text-xl font-semibold leading-tight text-white">{card.title}</h3>
          <p className="mt-3 text-sm leading-6 text-white/64 sm:text-base sm:leading-7">{card.body}</p>
        </article>
      ))}
    </div>
  );
}

function IconCardGrid({ cards, accent }: { cards: AiVisibilityCard[]; accent: string }) {
  const icons: IconSvgElement[] = [Search01Icon, BrowserIcon, RankingIcon, CheckmarkCircle02Icon];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card, index) => (
        <article
          key={card.title}
          className="min-h-64 rounded-[1.5rem] border border-white/[0.08] bg-white/[0.055] p-5"
        >
          <div
            className="flex h-16 w-16 items-center justify-center rounded-full text-white"
            style={{ backgroundColor: accent }}
          >
            <HugeiconsIcon icon={icons[index % icons.length]} size={34} strokeWidth={1.65} aria-hidden />
          </div>
          <h3 className="mt-8 text-2xl font-semibold leading-tight text-white">{card.title}</h3>
          <p className="mt-4 text-base leading-7 text-white/62">{card.body}</p>
        </article>
      ))}
    </div>
  );
}

function ProblemVisual({ accent }: { accent: string }) {
  return (
    <div className="grid gap-3">
      <div className="grid gap-3">
        {['Site', 'Modèle IA', 'Réponse'].map((label, index) => (
          <div key={label} className="grid grid-cols-[5.5rem_1fr] items-center gap-4 rounded-[1.25rem] bg-white/[0.055] p-4">
            <span className="text-xs uppercase tracking-normal text-white/46">{label}</span>
            <div className="h-12 rounded-full bg-white/[0.07] p-2">
              <div
                className="h-full rounded-full"
                style={{
                  width: `${index === 0 ? 100 : index === 1 ? 68 : 42}%`,
                  backgroundColor: index === 1 ? accent : 'rgba(255,255,255,0.24)',
                }}
              />
            </div>
          </div>
        ))}
      </div>
      <p className="text-sm leading-6 text-white/60">
        Une réponse IA retient rarement tout. Elle condense ce qu’elle juge assez clair pour être utilisé.
      </p>
    </div>
  );
}

function BigIconVisual({
  accent,
  icon,
}: {
  accent: string;
  icon: 'eye' | 'rewrite' | 'cross';
}) {
  return (
    <div className="relative flex min-h-[18rem] items-center justify-center overflow-visible py-8 sm:min-h-[22rem]">
      <div
        className="relative flex h-44 w-44 items-center justify-center rounded-full text-white sm:h-56 sm:w-56"
        style={{ backgroundColor: accent }}
      >
        {icon === 'eye' ? (
          <HugeiconsIcon icon={AiViewIcon} size={176} strokeWidth={1.55} className="h-32 w-32 sm:h-44 sm:w-44" aria-hidden />
        ) : null}
        {icon === 'rewrite' ? (
          <HugeiconsIcon
            icon={ArrowReloadHorizontalIcon}
            size={176}
            strokeWidth={1.45}
            className="h-32 w-32 sm:h-44 sm:w-44"
            aria-hidden
          />
        ) : null}
        {icon === 'cross' ? (
          <HugeiconsIcon icon={Cancel01Icon} size={176} strokeWidth={1.7} className="h-32 w-32 sm:h-44 sm:w-44" aria-hidden />
        ) : null}
      </div>
    </div>
  );
}

/** Grille 2×2 Claude / ChatGPT / Perplexity / Google — icônes ~80 % de la carte (marges ~10 %). */
function AiProvidersLogosVisual({ compact = false }: { compact?: boolean }) {
  const inset = compact ? 'inset-[15%]' : 'inset-[14%] sm:inset-[13%]';
  const shell = 'relative aspect-square w-full overflow-hidden rounded-[22%] ';

  return (
    <div
      className={`grid w-full max-w-[20rem] grid-cols-2 ${compact ? 'gap-2.5' : 'gap-3.5 sm:max-w-[22rem] sm:gap-[1.1rem] md:ml-auto'}`}
      aria-hidden
    >
      <div className={`${shell} bg-[#C15F3C]`}>
        <div className={`absolute ${inset} z-0`}>
          <div className="relative h-full w-full">
            <Image
              src="/claude.svg"
              alt=""
              fill
              className="object-contain brightness-0 invert"
              sizes="(max-width: 768px) 40vw, 180px"
            />
          </div>
        </div>
      </div>
      <div className={`${shell} bg-[#FFFFFF]`}>
        <div className={`absolute ${inset} z-0`}>
          <div className="relative h-full w-full">
            <Image src="/openai.svg" alt="" fill className="object-contain" sizes="(max-width: 768px) 40vw, 180px" />
          </div>
        </div>
      </div>
      <div className={`${shell} bg-[#20808D]`}>
        <div className={`absolute ${inset} z-0`}>
          <div className="relative h-full w-full">
            <Image
              src="/perplexity.svg"
              alt=""
              fill
              className="object-contain brightness-0 invert"
              sizes="(max-width: 768px) 40vw, 180px"
            />
          </div>
        </div>
      </div>
      <div className={`${shell} bg-white`}>
        <div className={`absolute ${inset} z-0`}>
          <div className="relative h-full w-full">
            <Image src="/google.svg" alt="" fill className="object-contain" sizes="(max-width: 768px) 40vw, 180px" />
          </div>
        </div>
      </div>
    </div>
  );
}

function ComparisonVisual({ accent }: { accent: string }) {
  return (
    <div className="grid gap-3">
      {[
        { title: 'Lecture floue', body: 'Catégorie large, preuve faible, recommandation fragile.' },
        { title: 'Lecture claire', body: 'Offre précise, signaux alignés, raison d’être cité.' },
      ].map((item, index) => (
        <div key={item.title} className="rounded-[1.5rem] border border-white/[0.08] bg-white/[0.055] p-5">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white">{item.title}</h3>
            <span
              className="rounded-full px-2.5 py-1 text-xs font-semibold text-white"
              style={{
                backgroundColor: index === 1 ? accent : 'rgba(255,255,255,0.1)',
              }}
            >
              {index === 1 ? 'Repris' : 'Ignoré'}
            </span>
          </div>
          <p className="text-sm leading-6 text-white/62">{item.body}</p>
        </div>
      ))}
    </div>
  );
}

function MethodVisual({ accent }: { accent: string }) {
  const points = ['Présence', 'Compréhension', 'Positionnement', 'Cohérence'];
  const icons: IconSvgElement[] = [AiViewIcon, BrowserIcon, Target02Icon, Structure05Icon];

  return (
    <div className="grid grid-cols-2 gap-3">
      {points.map((point, index) => (
        <div key={point} className="rounded-[1.5rem] border border-white/[0.08] bg-white/[0.055] p-4">
          <span
            className="inline-flex h-12 w-12 items-center justify-center rounded-full text-white"
            style={{ backgroundColor: accent }}
          >
            <HugeiconsIcon icon={icons[index % icons.length]} size={25} strokeWidth={1.65} aria-hidden />
          </span>
          <p className="mt-4 text-base font-semibold text-white">{point}</p>
        </div>
      ))}
    </div>
  );
}

function ReportMockup({ compact = false }: { accent: string; compact?: boolean }) {
  return (
    <div className="report-shell overflow-hidden rounded-[1.5rem] border border-white/10 bg-[#050506] px-4 pb-5 pt-5 text-white">
      <div className="mb-5 flex items-center justify-center gap-3">
        <Image
          src={qoryIcon}
          alt=""
          width={40}
          height={40}
          className="h-9 w-9 shrink-0 rounded-[12px] object-cover"
        />
        <p className="min-w-0 break-words text-center text-2xl font-semibold leading-tight tracking-tight text-primary">
          qory.fr
        </p>
      </div>

      <div className="ds-card p-5 sm:p-7">
        <h3 className="mb-4 text-center text-xl font-bold text-primary sm:text-2xl">
          Votre Score de Visibilité IA
        </h3>
        <div className="mb-3 flex items-center justify-center">
          <div className="text-5xl font-bold tabular-nums text-warning sm:text-6xl">
            68/100
          </div>
        </div>
        <p className="mb-4 text-center text-base text-secondary sm:text-lg">
          Votre visibilité IA est <span className="font-semibold text-warning">Moyenne</span>
        </p>
        <div className="mb-4 h-3 w-full overflow-hidden rounded-full bg-elevated sm:h-4">
          <div className="h-3 w-[68%] rounded-full bg-warning sm:h-4" />
        </div>
        <div className="rounded-[18px] bg-elevated p-4 sm:p-5">
          <p className="text-sm leading-relaxed text-primary sm:text-base">
            Données de démonstration : votre site présente bien l’offre Qory, mais la visibilité dans les
            réponses IA varie selon les requêtes. Sur les intentions « audit visibilité IA » et « outil GEO
            », d’autres acteurs sont souvent cités en premier.
          </p>
        </div>
      </div>

      {!compact ? (
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <div className="ds-card p-4">
            <h3 className="mb-4 text-lg font-bold text-primary">Fiabilité des données IA</h3>
            <div className="mb-4 flex items-center justify-between gap-3">
              <span className="text-sm font-semibold text-primary">Qualité globale</span>
              <span className="inline-flex items-center justify-center rounded-full bg-warning/10 px-3 py-1 text-xs font-semibold text-warning">
                Partielle
              </span>
            </div>
            <div className="space-y-2 text-sm">
              {[
                { label: 'ChatGPT', value: '82%' },
                { label: 'Claude', value: '74%' },
                { label: 'Perplexity', value: '79%' },
              ].map((row) => (
                <div key={row.label} className="flex items-center justify-between">
                  <span className="text-secondary">{row.label}</span>
                  <span className="font-semibold text-success">{row.value}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="ds-card p-4">
            <h3 className="mb-4 text-lg font-bold text-primary">Détail du score</h3>
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: 'Visibilité', value: 55 },
                { label: 'Couverture factuelle', value: 62 },
                { label: 'Positionnement', value: 72 },
                { label: 'Technique', value: 78 },
              ].map((item) => (
                <div key={item.label} className="rounded-[18px] bg-elevated p-3">
                  <p className="mb-1.5 text-xs font-semibold text-primary">{item.label}</p>
                  <p className={`text-xl font-bold tabular-nums ${item.value >= 70 ? 'text-success' : 'text-warning'}`}>
                    {item.value}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function SimpleCardsVisual({ accent, labels }: { accent: string; labels: string[] }) {
  const icons: IconSvgElement[] = [BrowserIcon, RankingIcon, FileSearchIcon, Target02Icon];

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {labels.map((label, index) => (
        <div key={label} className="rounded-[1.5rem] border border-white/[0.08] bg-white/[0.055] p-5">
          <div
            className="flex h-12 w-12 items-center justify-center rounded-full text-white"
            style={{ backgroundColor: accent }}
          >
            <HugeiconsIcon icon={icons[index % icons.length]} size={25} strokeWidth={1.65} aria-hidden />
          </div>
          <p className="mt-6 text-xl font-semibold text-white">{label}</p>
        </div>
      ))}
    </div>
  );
}

function BubbleClusterVisual({ accent }: { accent: string }) {
  const bubbles: Array<{
    key: string;
    icon: IconSvgElement;
    className: string;
    featured?: boolean;
  }> = [
    {
      key: 'score',
      icon: ChartBarLineIcon,
      className: 'left-[8%] top-[12%] h-24 w-24 sm:h-28 sm:w-28',
      featured: true,
    },
    {
      key: 'queries',
      icon: Search01Icon,
      className: 'right-[12%] top-[4%] h-20 w-20 sm:h-24 sm:w-24',
    },
    {
      key: 'competitors',
      icon: RankingIcon,
      className: 'left-[38%] top-[36%] h-28 w-28 sm:h-32 sm:w-32',
      featured: true,
    },
    {
      key: 'technical',
      icon: Structure05Icon,
      className: 'left-[8%] bottom-[8%] h-20 w-20 sm:h-24 sm:w-24',
    },
    {
      key: 'actions',
      icon: Target02Icon,
      className: 'right-[10%] bottom-[10%] h-24 w-24 sm:h-28 sm:w-28',
      featured: true,
    },
  ];

  return (
    <div className="relative min-h-[19rem] overflow-visible sm:min-h-[22rem]">
      {bubbles.map((bubble, index) => {
        const active = bubble.featured;
        return (
          <div
            key={bubble.key}
            className={`absolute flex items-center justify-center rounded-full border ${bubble.className}`}
            style={{
              backgroundColor: active ? accent : 'rgba(255,255,255,0.065)',
              borderColor: active ? 'transparent' : 'rgba(255,255,255,0.08)',
              color: '#FFFFFF',
            }}
          >
            <HugeiconsIcon icon={bubble.icon} size={index === 2 ? 52 : 44} strokeWidth={1.55} aria-hidden />
          </div>
        );
      })}
    </div>
  );
}

function DownTrendVisual({ accent }: { accent: string }) {
  return (
    <div className="flex min-h-[20rem] items-center justify-center py-8">
      <div
        className="flex h-48 w-48 items-center justify-center rounded-full text-white sm:h-60 sm:w-60"
        style={{ backgroundColor: accent }}
      >
        <HugeiconsIcon
          icon={TradeDownIcon}
          size={184}
          strokeWidth={1.45}
          className="h-36 w-36 sm:h-44 sm:w-44"
          aria-hidden
        />
      </div>
    </div>
  );
}

function TilesVisual({ accent, labels }: { accent: string; labels: string[] }) {
  const icons: IconSvgElement[] = [ChartBarLineIcon, FileSearchIcon, RankingIcon, Target02Icon];

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {labels.map((label, index) => (
        <div
          key={label}
          className="min-h-36 rounded-[1.5rem] border border-white/[0.08] p-5"
          style={{ backgroundColor: index === 0 ? accent : 'rgba(255,255,255,0.055)' }}
        >
          <div
            className="mb-8 flex h-12 w-12 items-center justify-center rounded-full text-white"
            style={{ backgroundColor: index === 0 ? 'rgba(0,0,0,0.16)' : accent }}
          >
            <HugeiconsIcon icon={icons[index % icons.length]} size={26} strokeWidth={1.65} aria-hidden />
          </div>
          <p className="text-xl font-semibold text-white">
            {label}
          </p>
        </div>
      ))}
    </div>
  );
}

function StackVisual({ accent, labels }: { accent: string; labels: string[] }) {
  return (
    <div className="grid gap-3 py-5">
      {labels.map((label, index) => (
        <div
          key={label}
          className={`flex items-center justify-between gap-4 rounded-[1.35rem] border border-white/[0.08] px-5 text-white ${
            index === labels.length - 1 ? '-mx-3 sm:-mx-5' : ''
          }`}
          style={{
            backgroundColor: index === labels.length - 1 ? accent : 'rgba(255,255,255,0.06)',
            minHeight: index === labels.length - 1 ? '4.5rem' : '3.625rem',
          }}
        >
          <span className={`${index === labels.length - 1 ? 'text-lg' : 'text-base'} font-semibold`}>
            {label}
          </span>
          {index === labels.length - 1 ? (
            <span className="inline-flex h-8 shrink-0 items-center justify-center rounded-full bg-white/20 px-3.5 text-sm font-semibold">
              Critique
            </span>
          ) : (
            <span className="h-3 w-16 rounded-full bg-current opacity-20" />
          )}
        </div>
      ))}
    </div>
  );
}

/** Section « Ordre des corrections » — même échelle que les autres BigIconVisual. */
function OrderOfCorrectionsVisual({ accent }: { accent: string }) {
  return (
    <div className="relative flex min-h-[18rem] items-center justify-center overflow-visible py-8 sm:min-h-[22rem]">
      <div
        className="relative flex h-44 w-44 items-center justify-center rounded-full text-white sm:h-56 sm:w-56"
        style={{ backgroundColor: accent }}
      >
        <HugeiconsIcon
          icon={AutoConversationsIcon}
          size={176}
          strokeWidth={1.55}
          className="h-32 w-32 sm:h-44 sm:w-44"
          aria-hidden
        />
      </div>
    </div>
  );
}

function SectionVisual({
  section,
  accent,
  pageSlug,
  index,
}: {
  section: AiVisibilitySection;
  accent: string;
  pageSlug: AiVisibilityPageData['slug'];
  index: number;
}) {
  const key = `${pageSlug}:${index}`;

  if (key === 'audit-visibilite-ia:0') {
    return <BigIconVisual accent={accent} icon="eye" />;
  }

  if (key === 'audit-visibilite-ia:1') {
    return section.kind === 'cards' ? <IconCardGrid cards={section.cards} accent={accent} /> : null;
  }

  if (key === 'audit-visibilite-ia:2') {
    return <BubbleClusterVisual accent={accent} />;
  }

  if (key === 'audit-visibilite-ia:3') {
    return <DownTrendVisual accent={accent} />;
  }

  if (key === 'presence-reponses-ia:0') {
    return <BigIconVisual accent={accent} icon="rewrite" />;
  }

  if (key === 'presence-reponses-ia:1') {
    return section.kind === 'cards' ? <IconCardGrid cards={section.cards} accent={accent} /> : null;
  }

  if (key === 'presence-reponses-ia:2') {
    return <StackVisual accent={accent} labels={['Flou', 'Contradictions', 'Pages faibles']} />;
  }

  if (key === 'presence-reponses-ia:3') {
    return <LandingHeroSafariComparison />;
  }

  if (key === 'presence-reponses-ia:4') {
    return <AiProvidersLogosVisual />;
  }

  if (key === 'presence-reponses-ia:5') {
    return <DownTrendVisual accent={accent} />;
  }

  if (key === 'presence-reponses-ia:6') {
    return <SimpleCardsVisual accent={accent} labels={['Réponses', 'Concurrents', 'Pages', 'Actions']} />;
  }

  if (key === 'analyse-presence-ia:0') {
    return <BigIconVisual accent={accent} icon="cross" />;
  }

  if (key === 'analyse-presence-ia:1') {
    return <MethodVisual accent={accent} />;
  }

  if (key === 'analyse-presence-ia:2') {
    return <StackVisual accent={accent} labels={['Design', 'Plus de contenu', 'Concurrents ignorés']} />;
  }

  if (key === 'analyse-presence-ia:3') {
    return section.kind === 'cards' ? <IconCardGrid cards={section.cards} accent={accent} /> : null;
  }

  if (key === 'analyse-presence-ia:4') {
    return <OrderOfCorrectionsVisual accent={accent} />;
  }

  if (key === 'analyse-presence-ia:5') {
    return <SeoGeoSplitMockup accent={accent} />;
  }

  if (key === 'analyse-presence-ia:6') {
    return <SimpleCardsVisual accent={accent} labels={['Réponses', 'Écarts', 'Site', 'Priorités']} />;
  }

  if (section.kind === 'problem') {
    return <ProblemVisual accent={accent} />;
  }

  if (section.kind === 'cards') {
    return <CardGrid cards={section.cards} accent={accent} />;
  }

  if (section.kind === 'comparison') {
    return <ComparisonVisual accent={accent} />;
  }

  if (section.kind === 'method') {
    return <MethodVisual accent={accent} />;
  }

  if (section.kind === 'report') {
    return <ReportMockup accent={accent} compact={pageSlug === 'analyse-presence-ia'} />;
  }

  return <AiProvidersLogosVisual compact />;
}

function StandardSection({
  section,
  accent,
  pageSlug,
  index,
}: {
  section: Exclude<AiVisibilitySection, { kind: 'faq' }>;
  accent: string;
  pageSlug: AiVisibilityPageData['slug'];
  index: number;
}) {
  const darkBand = index % 2 === 1;
  const hasTextBullets = 'bullets' in section && section.bullets && section.kind !== 'comparison';
  const hasReportPreviewButton = pageSlug === 'audit-visibilite-ia' && index === 2;
  const isFeatureLayout = section.kind === 'cards' || section.kind === 'report';
  const reverseLayout = index % 3 === 2;

  return (
    <section className={darkBand ? 'bg-[#121418]' : 'bg-[#050506]'}>
      <div
        className={
          isFeatureLayout
            ? 'mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-16 md:py-20'
            : 'mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:px-6 sm:py-16 md:grid-cols-[0.95fr_1.05fr] md:items-center md:gap-14 md:py-20 lg:gap-16'
        }
      >
        <div className={isFeatureLayout ? 'mx-auto max-w-3xl text-center' : reverseLayout ? 'md:order-2' : ''}>
          <SectionEyebrow accent={accent}>{section.eyebrow}</SectionEyebrow>
          <h2 className={`${isFeatureLayout ? 'mx-auto' : ''} mt-4 max-w-2xl text-balance text-[2rem] font-semibold leading-[1.02] tracking-normal text-white sm:text-[2.7rem] md:text-[3.15rem]`}>
            {section.title}
          </h2>
          {'body' in section && section.body ? (
            <p className={`${isFeatureLayout ? 'mx-auto' : ''} mt-5 max-w-2xl text-base leading-7 text-white/68 sm:text-lg sm:leading-8`}>
              {section.body}
            </p>
          ) : null}
          {hasTextBullets ? <BulletList items={section.bullets} accent={accent} /> : null}
          {hasReportPreviewButton ? <ReportPreviewTrigger /> : null}
        </div>
        <div className={isFeatureLayout ? 'mt-10' : reverseLayout ? 'md:order-1' : ''}>
          <SectionVisual section={section} accent={accent} pageSlug={pageSlug} index={index} />
        </div>
      </div>
    </section>
  );
}

function FaqSection({ section, accent }: { section: Extract<AiVisibilitySection, { kind: 'faq' }>; accent: string }) {
  return (
    <section className="bg-[#121418]">
      <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-16 md:py-20">
        <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-start lg:gap-14">
          <div className="lg:sticky lg:top-28">
            <SectionEyebrow accent={accent}>{section.eyebrow}</SectionEyebrow>
            <h2 className="mt-4 max-w-xl text-balance text-[2rem] font-semibold leading-[1.02] tracking-normal text-white sm:text-[2.7rem] md:text-[3.15rem]">
              {section.title}
            </h2>
            <div className="mt-7 h-1 w-24 rounded-full" style={{ backgroundColor: accent }} />
          </div>

          <div className="overflow-hidden rounded-[1.75rem] border border-white/10 bg-black sm:rounded-[2rem]">
            {section.faqs.map((faq, index) => (
              <details
                key={faq.question}
                className="group border-t border-white/10 first:border-t-0"
                open={index === 0}
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-5 text-left transition-colors hover:bg-white/[0.035] marker:hidden sm:px-7 sm:py-6 [&::-webkit-details-marker]:hidden">
                  <span className="text-lg font-semibold leading-snug text-white sm:text-xl">
                    {faq.question}
                  </span>
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 14 14"
                    fill="none"
                    className="shrink-0 text-white/42 transition-transform duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] group-open:rotate-180"
                    aria-hidden
                  >
                    <path
                      d="M3.5 5.25L7 8.75l3.5-3.5"
                      stroke="currentColor"
                      strokeWidth="1.4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </summary>
                <div className="border-t border-white/[0.06] bg-white/[0.035] px-5 pb-6 pt-4 sm:px-7 sm:pb-7">
                  <p className="max-w-2xl text-base leading-7 text-white/68 sm:text-lg sm:leading-8">
                    {faq.answer}
                  </p>
                </div>
              </details>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default function AiVisibilityPage({ page }: AiVisibilityPageProps) {
  const siteUrl = getSiteUrl();
  const pageUrl = `${siteUrl}${page.path}`;
  const accentIsLight = isLightColor(page.accent);
  const secondaryHeroText = 'text-white/78';
  const ctaButtonClassName =
    'border-black bg-black text-white shadow-none hover:bg-[#1A1A1A] hover:shadow-none focus-visible:shadow-none active:shadow-none';
  const heroShapeStyle = accentIsLight
    ? {
        left: { backgroundColor: 'rgba(255,255,255,0.2)' },
        right: { backgroundColor: 'rgba(17,17,17,0.14)' },
        square: { backgroundColor: 'rgba(255,255,255,0.16)' },
      }
    : {
        left: { backgroundColor: 'rgba(255,255,255,0.11)' },
        right: { backgroundColor: 'rgba(5,5,6,0.2)' },
        square: { backgroundColor: 'rgba(255,255,255,0.08)' },
      };

  const webPageJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: page.heroTitle,
    description: page.seoDescription,
    url: pageUrl,
    inLanguage: 'fr-FR',
    isPartOf: {
      '@type': 'WebSite',
      name: 'Qory',
      url: siteUrl,
    },
  };

  return (
    <main className="min-h-screen overflow-x-clip bg-[#050506] text-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageJsonLd) }}
      />
      <SiteHeader
        variant="dark"
        position="fixed"
        landingMinimal
        landingMinimalLightSurface={false}
      />

      <section
        className="relative flex min-h-[min(64svh,36rem)] flex-col overflow-hidden pt-16 pb-12 sm:min-h-[min(68svh,39rem)] sm:pb-16 md:pt-[72px] md:pb-20"
        style={{ backgroundColor: page.accent, color: '#FFFFFF' }}
      >
        <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
          <div
            className="absolute -left-24 top-8 h-56 w-56 rounded-full sm:h-72 sm:w-72"
            style={heroShapeStyle.left}
          />
          <div
            className="absolute -right-16 bottom-4 h-44 w-44 rounded-full sm:h-64 sm:w-64"
            style={heroShapeStyle.right}
          />
          <div
            className="absolute right-1/4 top-1/3 h-24 w-24 rounded-2xl sm:h-32 sm:w-32"
            style={heroShapeStyle.square}
          />
        </div>
        <div className="relative z-[1] mx-auto flex w-full max-w-6xl flex-1 flex-col items-center justify-center px-4 text-center sm:px-6">
          <h1 className="max-w-5xl text-balance text-[2.55rem] font-semibold leading-[0.94] tracking-normal text-white sm:text-[4.2rem] md:text-[5rem]">
            {page.heroTitle}
          </h1>
          <p className={`mt-6 max-w-2xl text-base leading-7 sm:text-lg sm:leading-8 ${secondaryHeroText}`}>
            {page.heroSubtitle}
          </p>
          <Link
            href={page.heroCtaHref}
            className={`mt-8 inline-flex min-h-12 items-center justify-center rounded-full border px-6 text-sm font-semibold transition-colors sm:min-h-14 sm:px-7 sm:text-base ${ctaButtonClassName}`}
          >
            {page.heroCtaLabel}
          </Link>
        </div>
      </section>

      {page.sections.map((section, index) =>
        section.kind === 'faq' ? (
          <div key={`${section.kind}-${section.title}`} className="cv-auto">
            <FaqSection section={section} accent={page.accent} />
          </div>
        ) : (
          <div key={`${section.kind}-${section.title}`} className="cv-auto">
            <StandardSection
              section={section}
              accent={page.accent}
              pageSlug={page.slug}
              index={index}
            />
          </div>
        ),
      )}

      <section className="cv-auto" style={{ backgroundColor: page.accent, color: '#FFFFFF' }}>
        <div className="mx-auto max-w-6xl px-4 py-14 text-center sm:px-6 sm:py-16 md:py-20">
          <h2 className="mx-auto max-w-4xl text-balance text-[2.2rem] font-semibold leading-[0.98] tracking-normal text-white sm:text-[3.3rem] md:text-[4rem]">
            {page.finalCtaTitle}
          </h2>
          <p className={`mx-auto mt-5 max-w-2xl text-base leading-7 sm:text-lg sm:leading-8 ${secondaryHeroText}`}>
            {page.finalCtaBody}
          </p>
          <Link
            href={page.finalCtaHref}
            className={`mt-8 inline-flex min-h-12 items-center justify-center rounded-full border px-6 text-sm font-semibold transition-colors sm:min-h-14 sm:px-7 sm:text-base ${ctaButtonClassName}`}
          >
            {page.finalCtaLabel}
          </Link>
        </div>
      </section>

      <SiteFooter className="relative mt-0 rounded-none bg-[#121418] px-4 pb-10 pt-12 text-white sm:px-6 sm:pb-12 sm:pt-14 md:pb-16 md:pt-16" />
    </main>
  );
}

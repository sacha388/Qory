import {
  ArrowDown01Icon,
  Coffee01Icon,
  Mortarboard01Icon,
  Pen01Icon,
  SourceCodeIcon,
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';

/**
 * Mockup Safari (chrome clair) : Google / SEO, bande d’accent (déchirée), Claude / GEO.
 */
/** Même largeur que la barre de recherche Google (mockup aligné). */
const MOCK_SEARCH_WIDTH =
  'mx-auto w-full max-w-[17rem] sm:max-w-[19rem]';

/** Fond zone Claude — aussi peint sous le SVG pour combler les « vides » sous le zigzag. */
const CLAUDE_SECTION_BG = '#f4f3ee';

type SeoGeoSplitMockupProps = {
  /** Couleur d’accent de la page (ex. jaune analyse présence IA). */
  accent?: string;
};

export default function SeoGeoSplitMockup({ accent = '#F4B43A' }: SeoGeoSplitMockupProps) {
  return (
    <div className="overflow-hidden rounded-[14px] bg-white sm:rounded-[16px]">
      <SafariChrome />
      <div className="overflow-hidden rounded-b-[14px] bg-white sm:rounded-b-[16px]">
        <div className="flex min-h-[248px] flex-col sm:min-h-[272px]">
          <GooglePanel />
          <AccentTearBand accent={accent} />
          <ClaudePanel />
        </div>
      </div>
    </div>
  );
}

function SafariChrome() {
  return (
    <div className="flex w-full min-w-0 items-center gap-1.5 rounded-t-[14px] bg-[#ECECEF] px-2 py-1.5 sm:gap-2 sm:rounded-t-[16px] sm:px-2.5 sm:py-2">
      <span className="h-2 w-2 shrink-0 rounded-full bg-[#ff5f57] sm:h-2.5 sm:w-2.5" aria-hidden />
      <span className="h-2 w-2 shrink-0 rounded-full bg-[#febc2e] sm:h-2.5 sm:w-2.5" aria-hidden />
      <span className="h-2 w-2 shrink-0 rounded-full bg-[#28c840] sm:h-2.5 sm:w-2.5" aria-hidden />
      <div className="ml-1 flex min-h-[20px] min-w-0 flex-1 items-center justify-center rounded-md bg-white px-2 sm:min-h-[22px]">
        <span className="truncate text-[8px] text-[#3c3c43] sm:text-[9px]">google.com</span>
      </div>
      {/* Même largeur réservée qu’à l’emplacement des anciennes icônes Safari — la pilule ne va pas en full largeur */}
      <div className="h-5 w-[52px] shrink-0 sm:h-[22px] sm:w-[60px]" aria-hidden />
    </div>
  );
}

function GooglePanel() {
  return (
    <div className="flex min-h-0 flex-[1.12] flex-col items-center justify-center gap-3 px-3 py-3 sm:gap-4 sm:px-5 sm:py-4">
      <div className="flex shrink-0 justify-center">
        <img
          src="/brandgoogle.svg"
          alt="Google"
          className="h-7 w-auto max-w-[min(100%,11rem)] object-contain object-center sm:h-8 sm:max-w-[12.5rem]"
        />
      </div>
      <div
        className={`${MOCK_SEARCH_WIDTH} flex shrink-0 items-center gap-1.5 rounded-full border border-[#dfe1e5] bg-white px-2.5 py-1.5 shadow-sm sm:gap-2 sm:px-3 sm:py-2`}
      >
        <svg className="h-3.5 w-3.5 shrink-0 text-[#9aa0a6] sm:h-4 sm:w-4" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path
            d="M10.5 18a7.5 7.5 0 100-15 7.5 7.5 0 000 15zM16.5 16.5L21 21"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
        <span className="min-w-0 flex-1 truncate text-left text-[9px] text-[#70757a] sm:text-[10px]">
          Recherche sur Google ou saisissez une URL
        </span>
        <div className="mr-0.5 shrink-0">
          <img
            src="/google-bar-icons.png"
            alt=""
            className="h-[13px] w-auto max-h-[14px] max-w-[48px] object-contain object-center sm:h-[14px] sm:max-h-[15px] sm:max-w-[54px]"
          />
        </div>
      </div>
    </div>
  );
}

/**
 * Bande d’accent « papier déchiré » entre SEO (Google) et GEO (Claude).
 * Bords supérieur et inférieur en crénelage décalé (comme une languette arrachée).
 */
function AccentTearBand({ accent }: { accent: string }) {
  /** Remplit l’espace sous le bord déchiré bas (hors polygone jaune → sinon transparence / blanc). */
  const underTearCream = [
    'M0 31.2',
    'L18 29.4 L34 31.9 L50 28.5 L66 32.8 L82 29.1 L98 31.5 L114 28.8 L130 32.2 L146 29.5',
    'L162 33 L178 28.3 L194 32.6 L210 29.8 L226 33.1 L242 28.6 L258 32.4 L274 29.2 L290 33.5',
    'L306 27.9 L322 32.8 L338 28.1 L354 33.2 L370 27.4 L386 32.5 L400 28.8',
    'L400 34 L0 34 Z',
  ].join(' ');

  return (
    <svg
      className="block h-[30px] w-full shrink-0 leading-none sm:h-[34px]"
      viewBox="0 0 400 34"
      preserveAspectRatio="none"
      aria-hidden
    >
      <path fill={CLAUDE_SECTION_BG} d={underTearCream} />
      <path
        fill={accent}
        d="M0 13
           L15 5.5 L28 13.8 L44 6.2 L58 15 L74 8.3 L90 14.6 L106 7.1 L124 13.4 L142 5.8 L158 14.2 L176 8.9 L192 15.5 L210 7.4 L226 12.8 L244 6.6 L260 14.9 L278 8.2 L294 13.1 L312 10.4 L330 15.2 L346 7.7 L364 13.6 L382 9.4 L400 11.2
           L400 28.8
           L386 32.5 L370 27.4 L354 33.2 L338 28.1 L322 32.8 L306 27.9 L290 33.5 L274 29.2 L258 32.4 L242 28.6 L226 33.1 L210 29.8 L194 32.6 L178 28.3 L162 33 L146 29.5 L130 32.2 L114 28.8 L98 31.5 L82 29.1 L66 32.8 L50 28.5 L34 31.9 L18 29.4 L0 31.2
           Z"
      />
    </svg>
  );
}

const CLAUDE_PILLS: Array<{ label: string; icon: typeof Pen01Icon }> = [
  { label: 'Écrire', icon: Pen01Icon },
  { label: 'Apprendre', icon: Mortarboard01Icon },
  { label: 'Code', icon: SourceCodeIcon },
  { label: 'Vie quotidienne', icon: Coffee01Icon },
];

function ClaudePanel() {
  return (
    <div
      className="flex min-h-0 flex-1 flex-col justify-center gap-0 px-3 py-3 sm:px-5 sm:py-4"
      style={{ backgroundColor: CLAUDE_SECTION_BG }}
    >
      <div className={`${MOCK_SEARCH_WIDTH} mb-3 flex shrink-0 items-center justify-center gap-1.5 sm:mb-3.5`}>
        <img
          src="/claude.svg?v=3"
          alt=""
          className="h-4 w-4 shrink-0 object-contain [filter:brightness(0)_saturate(100%)_invert(52%)_sepia(35%)_saturate(900%)_hue-rotate(334deg)_brightness(0.95)_contrast(0.92)] sm:h-[18px] sm:w-[18px]"
        />
        <span className="font-serif text-[0.82rem] font-normal tracking-tight text-[#3c4043] sm:text-[0.92rem]">
          Bon après-midi, John
        </span>
      </div>

      <div
        className={`${MOCK_SEARCH_WIDTH} rounded-[0.85rem] border border-[#e8eaed] bg-white p-2 shadow-[0_1px_3px_rgba(60,64,67,0.1)] sm:rounded-[1rem] sm:p-2.5`}
      >
        <p className="mb-2.5 text-left text-[8px] leading-snug text-[#9aa0a6] sm:mb-3 sm:text-[9px]">
          Comment puis-je vous aider&nbsp;?
        </p>
        <div className="flex items-center justify-between gap-2 pt-1">
          <svg
            className="h-3 w-3 shrink-0 text-[#5f6368] sm:h-3.5 sm:w-3.5"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden
          >
            <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
          <div className="flex shrink-0 items-center gap-1 text-[7px] font-medium text-[#5f6368] sm:gap-1.5 sm:text-[8px]">
            <span className="tabular-nums">Opus 4.7</span>
            <HugeiconsIcon icon={ArrowDown01Icon} size={10} strokeWidth={2} className="text-[#5f6368]" aria-hidden />
            <svg
              className="h-3 w-3 sm:h-3.5 sm:w-3.5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              aria-hidden
            >
              <path
                d="M12 3a3 3 0 013 3v5a3 3 0 01-6 0V6a3 3 0 013-3z"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path d="M19 10v1a7 7 0 01-14 0v-1M12 19v3" strokeLinecap="round" />
            </svg>
          </div>
        </div>
      </div>

      <div
        className={`${MOCK_SEARCH_WIDTH} mt-2.5 flex flex-wrap justify-center gap-1 sm:mt-3 sm:gap-1.5`}
      >
        {CLAUDE_PILLS.map(({ label, icon }) => (
          <span
            key={label}
            className="inline-flex max-w-full items-center gap-0.5 rounded-full border border-[#e8eaed] bg-white px-1.5 py-0.5 text-[6.5px] font-medium text-[#3c4043] shadow-sm sm:gap-1 sm:px-2 sm:py-1 sm:text-[7.5px]"
          >
            <HugeiconsIcon icon={icon} size={10} strokeWidth={1.75} className="shrink-0 text-[#5f6368]" aria-hidden />
            <span className="truncate">{label}</span>
          </span>
        ))}
      </div>
    </div>
  );
}

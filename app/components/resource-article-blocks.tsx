import Link from 'next/link';
import ResourceArticleParagraph from '@/app/components/resource-article-paragraph';
import type { ResourceArticleBodyBlock } from '@/app/lib/resources-content';

function IconLink({ className = 'h-6 w-6' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden>
      <path d="M18 13v6a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M15 3h6v6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M10 14 21 3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconChart({ className = 'h-6 w-6' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden>
      <path d="M4 19V5" strokeLinecap="round" />
      <path d="M4 19h16" strokeLinecap="round" />
      <path d="M8 15v-4M12 15V9M16 15v-6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconSearch({ className = 'h-6 w-6' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden>
      <circle cx="11" cy="11" r="6" />
      <path d="m20 20-3.2-3.2" strokeLinecap="round" />
    </svg>
  );
}

function IconSparkle({ className = 'h-6 w-6' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden>
      <path d="M12 3v2M12 19v2M3 12h2M19 12h2" strokeLinecap="round" />
      <path d="m5.6 5.6 1.4 1.4m10 10 1.4 1.4M6.4 17.6l1.4-1.4m10-10L17.6 6.4" strokeLinecap="round" />
      <path d="m12 8.5 1.2 3.6 3.3 1.2-3.3 1.2L12 18l-1.2-3.5L7.5 13.3l3.3-1.2L12 8.5z" strokeLinejoin="round" />
    </svg>
  );
}

const iconMap = {
  link: IconLink,
  chart: IconChart,
  search: IconSearch,
  sparkle: IconSparkle,
} as const;

export function expandResourceSectionBlocks(section: {
  paragraphs: string[];
  bullets?: string[];
  body?: ResourceArticleBodyBlock[];
}): ResourceArticleBodyBlock[] {
  if (section.body && section.body.length > 0) {
    return section.body;
  }
  const out: ResourceArticleBodyBlock[] = [];
  for (const text of section.paragraphs) {
    out.push({ type: 'paragraph', text });
  }
  if (section.bullets && section.bullets.length > 0) {
    out.push({ type: 'bulletList', items: section.bullets });
  }
  return out;
}

type ResourceArticleBlocksProps = {
  blocks: ResourceArticleBodyBlock[];
  proseClassName: string;
};

export default function ResourceArticleBlocks({ blocks, proseClassName }: ResourceArticleBlocksProps) {
  return (
    <div className="space-y-5">
      {blocks.map((block, i) => {
        const key = `block-${i}-${block.type}`;

        if (block.type === 'paragraph') {
          return (
            <div key={key} className={proseClassName}>
              <ResourceArticleParagraph
                text={block.text}
                className="text-base leading-[1.95] text-[#5C5C64] sm:text-lg"
              />
            </div>
          );
        }

        if (block.type === 'bulletList') {
          return (
            <div key={key} className={proseClassName}>
              <ul className="space-y-3 text-[#5C5C64]">
                {block.items.map((item) => (
                  <li key={item} className="flex items-start gap-3 text-base leading-relaxed sm:text-lg">
                    <span className="mt-3 h-1.5 w-1.5 shrink-0 rounded-full bg-[#4BA7F5]" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          );
        }

        if (block.type === 'figure') {
          const inner = (
            <>
              {block.variant === 'photo' && block.src ? (
                <img src={block.src} alt={block.alt} className="h-auto w-full object-cover" />
              ) : (
                <div className="flex min-h-[220px] flex-col items-center justify-center gap-4 bg-gradient-to-br from-[#1a1a1c] via-[#252528] to-[#121214] px-8 py-14 sm:min-h-[280px]">
                  <div className="flex h-20 w-20 items-center justify-center rounded-2xl border border-white/12 bg-white/[0.06] text-white/90 shadow-[0_20px_50px_rgba(0,0,0,0.35)]">
                    <IconLink className="h-9 w-9" />
                  </div>
                  <p className="max-w-md text-center text-sm font-medium text-white/55">{block.alt}</p>
                </div>
              )}
              {block.caption ? (
                <p className="mt-3 flex items-start justify-between gap-4 text-sm text-[#6E6E73]">
                  <span>{block.caption}</span>
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-black/[0.08] text-[#86868B]" aria-hidden>
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="-mb-px">
                      <path d="M3.5 5.25 7 8.75l3.5-3.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                </p>
              ) : null}
            </>
          );

          const framed = (
            <div className="overflow-hidden rounded-[28px] border border-black/[0.08] bg-black shadow-[0_24px_60px_rgba(0,0,0,0.12)]">
              {inner}
            </div>
          );

          if (block.href) {
            return (
              <div key={key} className="w-full">
                <Link href={block.href} className="block transition-opacity hover:opacity-92">
                  {framed}
                </Link>
              </div>
            );
          }

          return (
            <div key={key} className="w-full">
              {framed}
            </div>
          );
        }

        if (block.type === 'bento') {
          const accent = block.accent ?? '#4BA7F5';
          const [first, ...rest] = block.items;
          if (!first) return null;

          const bigCard = (
            <div className="flex flex-col justify-between gap-6 rounded-[28px] bg-[#1B1B1E] p-6 text-white sm:p-8 lg:min-h-[260px]">
              <div className="aspect-[16/10] w-full rounded-2xl bg-gradient-to-br from-white/[0.08] to-white/[0.02] ring-1 ring-white/10" />
              <div>
                <p className="text-2xl font-semibold leading-tight sm:text-3xl" style={{ color: accent }}>
                  {first.highlight}
                </p>
                <p className="mt-2 text-sm leading-relaxed text-white/72 sm:text-base">{first.description}</p>
                {first.href ? (
                  <Link
                    href={first.href}
                    className="mt-4 inline-flex text-sm font-semibold text-white/90 underline decoration-white/25 underline-offset-4 hover:decoration-white/60"
                  >
                    En savoir plus
                  </Link>
                ) : null}
              </div>
            </div>
          );

          const smallCard = (cell: (typeof block.items)[number]) => (
            <div key={cell.highlight} className="flex flex-col justify-center gap-2 rounded-[28px] bg-[#1B1B1E] p-6 text-white sm:p-7">
              <p className="text-2xl font-semibold leading-tight sm:text-[1.65rem]" style={{ color: accent }}>
                {cell.highlight}
              </p>
              <p className="text-sm leading-relaxed text-white/72 sm:text-base">{cell.description}</p>
              {cell.href ? (
                <Link
                  href={cell.href}
                  className="mt-2 inline-flex text-sm font-semibold text-white/90 underline decoration-white/25 underline-offset-4 hover:decoration-white/60"
                >
                  Détails
                </Link>
              ) : null}
            </div>
          );

          return (
            <div key={key} className="w-full space-y-5">
              {block.headline ? (
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <p className="text-lg font-semibold tracking-tight text-[#1D1D1F] sm:text-xl">{block.headline}</p>
                  <span
                    className="flex h-8 w-8 items-center justify-center rounded-full bg-[#1D1D1F] text-[0.65rem] font-semibold text-white"
                    aria-hidden
                  >
                    Q
                  </span>
                </div>
              ) : null}
              {rest.length === 0 ? (
                bigCard
              ) : (
                <div className="grid gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]">
                  {bigCard}
                  <div className="grid gap-3 sm:gap-4">{rest.map((cell) => smallCard(cell))}</div>
                </div>
              )}
            </div>
          );
        }

        if (block.type === 'bannerQuote') {
          return (
            <div
              key={key}
              className="w-full rounded-[28px] px-6 py-12 sm:px-10 sm:py-14 md:py-16"
              style={{ backgroundColor: block.color }}
            >
              <blockquote className="mx-auto max-w-3xl text-center">
                <p className="text-[1.35rem] font-semibold leading-snug tracking-tight text-white sm:text-2xl md:text-[1.75rem] md:leading-tight">
                  <span className="text-white/45" aria-hidden>
                    «{' '}
                  </span>
                  {block.quote}
                  <span className="text-white/45" aria-hidden>
                    {' '}
                    »
                  </span>
                </p>
                {block.attribution ? (
                  <footer className="mt-6 text-sm font-medium text-white/85 sm:text-base">{block.attribution}</footer>
                ) : null}
              </blockquote>
            </div>
          );
        }

        if (block.type === 'iconFrames') {
          return (
            <div key={key} className="w-full">
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {block.items.map((item) => {
                  const Icon = iconMap[item.icon];
                  return (
                    <Link
                      key={item.href + item.label}
                      href={item.href}
                      className="group flex flex-col gap-4 rounded-2xl border border-black/[0.08] bg-[#F5F5F7] p-5 transition-colors hover:border-black/[0.12] hover:bg-[#ECECEF]"
                    >
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white text-[#1D1D1F] shadow-sm ring-1 ring-black/[0.06] transition-transform group-hover:scale-[1.03]">
                        <Icon className="h-6 w-6" />
                      </div>
                      <div className="flex flex-1 items-end justify-between gap-2">
                        <span className="text-sm font-semibold leading-snug text-[#1D1D1F] sm:text-base">{item.label}</span>
                        <span className="text-[#4BA7F5] opacity-80 transition group-hover:opacity-100" aria-hidden>
                          →
                        </span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          );
        }

        return null;
      })}
    </div>
  );
}

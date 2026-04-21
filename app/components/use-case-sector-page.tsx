'use client';

import dynamic from 'next/dynamic';
import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react';
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import { HugeiconsIcon } from '@hugeicons/react';
import { Globe02Icon } from '@hugeicons/core-free-icons';
import SiteHeader from '@/app/components/site-header';
import { TitleDecoScribble, REPORT_DECO_BLUE } from '@/app/components/title-deco';
import { getSiteUrl } from '@/app/lib/site-url';
import { useRouteProgressRouter } from '@/app/components/route-progress';
import type { UseCaseFamily, UseCaseSectorPage as UseCaseSectorPageData } from '@/app/lib/use-cases-content';

const HomeMarketingSections = dynamic(() => import('@/app/components/home-marketing-sections'));

type UseCaseSectorPageProps = {
  family: UseCaseFamily;
  page: UseCaseSectorPageData;
};

const SOFT_EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];
const DEFAULT_SECTOR_HERO_SUBTITLE =
  "Positionnez votre site là où se joue déjà la prochaine bataille de visibilité : dans les réponses IA où se gagne désormais l'attention.";

const HERO_PLATFORMS = [
  { name: 'ChatGPT', src: '/openai.svg?v=3' },
  { name: 'Claude', src: '/claude.svg?v=3' },
  { name: 'Perplexity', src: '/perplexity.svg?v=3' },
] as const;

function splitTitle(title: string): [string, string?] {
  const words = title.trim().split(/\s+/);

  if (words.length <= 5) {
    return [title];
  }

  const midpoint = Math.ceil(words.length / 2);
  return [words.slice(0, midpoint).join(' '), words.slice(midpoint).join(' ')];
}

/** Acronymes / mots courts en fin de proposition : souligner le groupe (ex. « réponses IA »), pas la ponctuation. */
function shouldMergeHighlightWithPrevious(word: string): boolean {
  const w = word.replace(/[?!.,…]+$/u, '');
  if (!w) return false;
  if (/^[\p{Lu}]{2,5}$/u.test(w)) return true;
  return w.length <= 2;
}

function renderHeroTitleLine(line: string, decorate: boolean) {
  if (!decorate) {
    return line;
  }

  const words = line.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) {
    return line;
  }

  const trailingPunct: string[] = [];
  while (words.length > 0 && /^[?!.,…;:–—]+$/u.test(words[words.length - 1]!)) {
    trailingPunct.unshift(words.pop()!);
  }

  let decorated = words.pop();
  if (!decorated) {
    return line;
  }

  let punctOnWord = '';
  const attached = decorated.match(/^(.+?)([?!.,…]+)$/u);
  if (attached) {
    decorated = attached[1]!;
    punctOnWord = attached[2]!;
  }

  while (words.length > 0 && shouldMergeHighlightWithPrevious(decorated)) {
    decorated = `${words.pop()} ${decorated}`;
  }

  const prefix = words.join(' ');
  const suffix = trailingPunct.join('');

  if (!prefix) {
    return (
      <>
        <TitleDecoScribble color={REPORT_DECO_BLUE}>{decorated}</TitleDecoScribble>
        {punctOnWord}
        {suffix}
      </>
    );
  }

  return (
    <>
      {prefix}{' '}
      <TitleDecoScribble color={REPORT_DECO_BLUE}>{decorated}</TitleDecoScribble>
      {punctOnWord}
      {suffix}
    </>
  );
}

export default function UseCaseSectorPage({
  family,
  page,
}: UseCaseSectorPageProps) {
  const router = useRouteProgressRouter();
  const siteUrl = getSiteUrl();
  const reduceMotion = useReducedMotion();
  const heroRef = useRef<HTMLElement | null>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  });
  const contentY = useTransform(scrollYProgress, [0, 1], reduceMotion ? [0, 0] : [0, -42]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.85, 1], [1, 1, 0.35]);
  const pageUrl = `${siteUrl}${page.path}`;
  const pageJsonLd = {
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
    about: {
      '@type': 'Thing',
      name: family.label,
    },
  };

  const [url, setUrl] = useState('');
  const [error, setError] = useState('');
  const heroTitleLines = useMemo(
    () =>
      (page.heroTitleLines ?? splitTitle(page.heroTitle)).filter(
        (line): line is string => Boolean(line)
      ),
    [page.heroTitle, page.heroTitleLines]
  );

  useEffect(() => {
    const html = document.documentElement;
    const body = document.body;
    const prevHtml = html.style.overscrollBehaviorX;
    const prevBody = body.style.overscrollBehaviorX;
    html.style.overscrollBehaviorX = 'none';
    body.style.overscrollBehaviorX = 'none';
    return () => {
      html.style.overscrollBehaviorX = prevHtml;
      body.style.overscrollBehaviorX = prevBody;
    };
  }, []);

  useEffect(() => {
    const resetLandingView = () => {
      window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    };

    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }

    resetLandingView();
    const rafId = window.requestAnimationFrame(resetLandingView);
    const timeoutId = window.setTimeout(resetLandingView, 120);
    const timeoutIdLate = window.setTimeout(resetLandingView, 420);
    const onPageShow = () => {
      resetLandingView();
      window.setTimeout(resetLandingView, 60);
      window.setTimeout(resetLandingView, 320);
    };
    const onPopState = () => {
      resetLandingView();
      window.setTimeout(resetLandingView, 60);
      window.setTimeout(resetLandingView, 320);
    };
    window.addEventListener('pageshow', onPageShow);
    window.addEventListener('popstate', onPopState);

    return () => {
      window.cancelAnimationFrame(rafId);
      window.clearTimeout(timeoutId);
      window.clearTimeout(timeoutIdLate);
      window.removeEventListener('pageshow', onPageShow);
      window.removeEventListener('popstate', onPopState);
    };
  }, []);

  const handleUrlChange = (nextUrl: string) => {
    if (error) {
      setError('');
    }

    setUrl(nextUrl);
  };

  const submitCurrentUrl = () => {
    setError('');

    if (!url) {
      setError('Veuillez entrer une URL');
      return false;
    }

    const normalizedUrl = url.startsWith('http') ? url : `https://${url}`;

    try {
      new URL(normalizedUrl);
      router.push(
        `/audit?url=${encodeURIComponent(normalizedUrl)}&autostart=1&returnTo=${encodeURIComponent(page.path)}`
      );
      return true;
    } catch {
      setError('URL invalide');
      return false;
    }
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    submitCurrentUrl();
  };

  return (
    <main className="relative min-h-[100svh] bg-black overscroll-x-none">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(pageJsonLd) }}
      />

      <SiteHeader variant="dark" position="fixed" landingMinimal />

      <section
        ref={heroRef}
        className="relative z-10 flex min-h-[100svh] items-center justify-center bg-black px-6 py-10 text-white sm:px-10 sm:py-12 lg:px-16"
      >
        <motion.div
          className="mx-auto flex w-full max-w-6xl flex-col items-stretch justify-center text-center"
          style={{ y: contentY, opacity: contentOpacity }}
        >
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: SOFT_EASE }}
            className="mb-7 flex items-center justify-center gap-3 self-center"
          >
            {HERO_PLATFORMS.map((platform) => (
              <div
                key={platform.name}
                className="flex h-[38px] w-[38px] items-center justify-center rounded-xl border border-white/[0.12] bg-white/10 sm:h-[42px] sm:w-[42px] sm:rounded-[13px]"
                aria-label={platform.name}
              >
                <img
                  src={platform.src}
                  alt={platform.name}
                  className="h-[24px] w-[24px] shrink-0 brightness-0 invert sm:h-[26px] sm:w-[26px]"
                />
              </div>
            ))}
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.78, ease: SOFT_EASE, delay: 0.1 }}
            className="w-full max-w-[min(100%,72rem)] px-1 text-[clamp(1.85rem,4.2vw,5.15rem)] font-semibold leading-[1.02] tracking-tight sm:px-2 sm:leading-[1.04] lg:leading-[1.06]"
          >
            {heroTitleLines.map((line, index) => (
              <span
                key={`${line}-${index}`}
                className="block [overflow-wrap:anywhere] lg:whitespace-nowrap"
              >
                {renderHeroTitleLine(line, index === heroTitleLines.length - 1)}
              </span>
            ))}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.78, ease: SOFT_EASE, delay: 0.25 }}
            className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-white/[0.75] sm:text-lg md:text-xl"
          >
            {page.heroSubtitle || DEFAULT_SECTOR_HERO_SUBTITLE}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.78, ease: SOFT_EASE, delay: 0.4 }}
            className="w-full"
          >
            <form id="hero-form" onSubmit={handleSubmit} className="mx-auto mt-9 w-full max-w-3xl">
              <div className="relative flex min-h-[62px] items-center rounded-[31px] border border-white/[0.12] bg-white/[0.06] p-[5px] sm:min-h-[66px] sm:rounded-[33px] sm:p-[7px]">
                <span className="pointer-events-none absolute left-[18px] top-1/2 -translate-y-1/2 text-white sm:left-5">
                  <HugeiconsIcon
                    icon={Globe02Icon}
                    size={22}
                    className="h-[22px] w-[22px] opacity-40 [&_*]:[stroke-linecap:butt] [&_*]:[stroke-linejoin:miter]"
                    aria-hidden="true"
                  />
                </span>
                <input
                  id="hero-url-input"
                  type="text"
                  value={url}
                  onChange={(event) => handleUrlChange(event.target.value)}
                  placeholder="https://votre-site.fr"
                  className="min-w-0 flex-1 bg-transparent pl-12 pr-3 text-base text-white outline-none transition-colors placeholder:text-white/40 sm:pl-14 sm:pr-4 sm:text-lg"
                />
                <button
                  type="submit"
                  className="inline-flex h-[52px] shrink-0 items-center justify-center rounded-[26px] bg-white px-3.5 text-base font-semibold whitespace-nowrap text-black transition-colors hover:bg-[#F2F2F2] sm:px-5 sm:text-lg md:px-7"
                >
                  Analyser
                </button>
              </div>

              {error ? <div className="mt-3 text-left text-sm text-red-400">{error}</div> : null}

              <div className="mt-4 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs font-medium tracking-normal text-white/50 sm:gap-x-8 sm:text-sm">
                <span className="inline-flex items-center gap-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-3.5 w-3.5"
                    aria-hidden="true"
                  >
                    <path d="M12 3l7 3v6c0 5-3.5 8-7 9-3.5-1-7-4-7-9V6l7-3z" />
                    <path d="M9.5 12.5l1.6 1.6 3.4-3.4" />
                  </svg>
                  <span>100% sécurisé</span>
                </span>
                <span className="inline-flex items-center gap-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    className="h-3.5 w-3.5"
                    aria-hidden="true"
                  >
                    <path d="M13 2L4 14h6l-1 8 9-12h-6l1-8z" fill="currentColor" />
                  </svg>
                  <span>Scan express</span>
                </span>
              </div>
            </form>
          </motion.div>
        </motion.div>
      </section>

      <div className="cv-auto">
        <HomeMarketingSections
          url={url}
          error={error}
          onUrlChange={handleUrlChange}
          onUrlSubmit={handleSubmit}
          faqItemsOverride={page.faqs}
        />
      </div>
    </main>
  );
}

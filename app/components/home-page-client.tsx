'use client';

import dynamic from 'next/dynamic';
import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react';
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import { HugeiconsIcon } from '@hugeicons/react';
import { Globe02Icon } from '@hugeicons/core-free-icons';
import { TitleDecoScribble, REPORT_DECO_BLUE } from '@/app/components/title-deco';
import SiteHeader from '@/app/components/site-header';
import { useRouteProgressRouter } from '@/app/components/route-progress';
import { getSiteUrl } from '@/app/lib/site-url';

const HomeMarketingSections = dynamic(() => import('@/app/components/home-marketing-sections'));

const SOFT_EASE = [0.22, 1, 0.36, 1] as const;

const HERO_PLATFORMS = [
  { name: 'ChatGPT', src: '/openai.svg?v=3' },
  { name: 'Claude', src: '/claude.svg?v=3' },
  { name: 'Perplexity', src: '/perplexity.svg?v=3' },
] as const;

export default function HomePageClient() {
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

  const pageJsonLd = useMemo(
    () => ({
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      name: 'Qory | Audit de visibilit\u00e9 IA',
      description:
        'Mesurez votre visibilit\u00e9 sur ChatGPT, Claude et Perplexity avec un rapport en fran\u00e7ais, un plan d\u2019action prioris\u00e9 et un paiement one-shot \u00e0 9,99\u00a0\u20ac.',
      url: siteUrl,
      inLanguage: 'fr-FR',
      isPartOf: {
        '@type': 'WebSite',
        name: 'Qory',
        url: siteUrl,
      },
    }),
    [siteUrl]
  );

  const [url, setUrl] = useState('');
  const [error, setError] = useState('');

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

  const handleUrlChange = (nextUrl: string) => {
    if (error) setError('');
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
        `/audit?url=${encodeURIComponent(normalizedUrl)}&autostart=1&returnTo=${encodeURIComponent('/')}`
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

      {/* ── Hero ── */}
      <section
        ref={heroRef}
        className="relative z-10 flex min-h-[100svh] items-center justify-center bg-black px-6 py-10 text-white sm:px-10 sm:py-12 lg:px-16"
      >
        <motion.div
          className="mx-auto flex w-full max-w-5xl flex-col items-stretch justify-center text-center"
          style={{ y: contentY, opacity: contentOpacity }}
        >
          {/* Platform icons */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: SOFT_EASE }}
            className="mb-7 flex items-center justify-center gap-3 self-center"
          >
            {HERO_PLATFORMS.map((p) => (
              <div
                key={p.name}
                className="flex h-[38px] w-[38px] items-center justify-center rounded-xl border border-white/[0.12] bg-white/10 sm:h-[42px] sm:w-[42px] sm:rounded-[13px]"
                aria-label={p.name}
              >
                <img
                  src={p.src}
                  alt={p.name}
                  className="h-[24px] w-[24px] shrink-0 brightness-0 invert sm:h-[26px] sm:w-[26px]"
                />
              </div>
            ))}
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.78, ease: SOFT_EASE, delay: 0.1 }}
            className="mx-auto max-w-5xl text-balance text-[clamp(2.2rem,8.5vw,3rem)] font-semibold leading-[0.96] tracking-tight sm:text-[4.35rem] lg:text-[5.5rem]"
          >
            <span className="block">Savez-vous ce que</span>
            <span className="block">
              l&apos;IA dit de{' '}
              <TitleDecoScribble color={REPORT_DECO_BLUE} showUnderlineOnMobile>
                vous
              </TitleDecoScribble>
              &nbsp;?
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.78, ease: SOFT_EASE, delay: 0.25 }}
            className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-white/[0.75] sm:text-lg md:text-xl"
          >
            Découvrez si votre site ressort dans les réponses de ChatGPT, Claude et Perplexity — et ce qu&apos;il faut corriger.
          </motion.p>

          {/* Input */}
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
                  onChange={(e) => handleUrlChange(e.target.value)}
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

      <HomeMarketingSections
        url={url}
        error={error}
        onUrlChange={handleUrlChange}
        onUrlSubmit={handleSubmit}
      />
    </main>
  );
}

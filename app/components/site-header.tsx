'use client';

import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import Link from 'next/link';
import type { MotionValue } from 'framer-motion';
import {
  AnimatePresence,
  animate,
  motion,
  useMotionValue,
  useReducedMotion,
  useTransform,
} from 'framer-motion';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  InstagramIcon,
  Linkedin01Icon,
  NewTwitterIcon,
  TiktokIcon,
} from '@hugeicons/core-free-icons';
import QoryWord from '@/app/components/qory-word';
import { REPORT_DECO_CORAL } from '@/app/components/title-deco';
import {
  LANDING_FULL_MENU_SECTIONS,
  LANDING_MENU_LEGAL_LINKS,
} from '@/app/lib/landing-full-menu';

type SiteHeaderProps = {
  variant?: 'paper' | 'dark';
  position?: 'fixed' | 'absolute';
  autoHideOnScrollDown?: boolean;
  landingMinimal?: boolean;
  landingMinimalLightSurface?: boolean;
};

const PANEL_EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];
const LANDING_MENU_GUTTER = 'px-4 md:px-8';
const LANDING_MENU_TEXT_INSET = 'pl-0.5';
const LANDING_MENU_SCROLL_SELECTOR = '[data-landing-menu-scroll]';
const LANDING_OVERLAY_SOCIAL = [
  { label: 'X', href: '#', icon: NewTwitterIcon },
  { label: 'LinkedIn', href: '#', icon: Linkedin01Icon },
  { label: 'Instagram', href: '#', icon: InstagramIcon },
  { label: 'TikTok', href: '#', icon: TiktokIcon },
] as const;

const OV_PANEL_IN = 0.88;
const OV_PANEL_OUT = 0.76;
const OV_ITEM_IN = 0.58;
const OV_STAGGER_IN = 0.1;
const OV_CONTENT_DELAY = 0.34;
const OV_ITEM_Y_IN = 22;

const LANDING_LOGO_DARK = '#141416';
const LANDING_LOGO_LIGHT = '#ffffff';

function logoFillFromPanelBounds(
  t: number,
  logoTop: number,
  logoBottom: number,
  vh: number,
  inverted = false,
): string {
  const vhSafe = Math.max(1, vh);
  const range = Math.max(1, logoBottom - logoTop);
  const clampPercent = (v: number) => Math.min(100, Math.max(0, v));
  const solid = (color: string) => `linear-gradient(to bottom, ${color}, ${color})`;
  const split = (topColor: string, bottomColor: string, pct: number) => {
    const p = clampPercent(pct);
    return `linear-gradient(to bottom, ${topColor} 0%, ${topColor} ${p}%, ${bottomColor} ${p}%, ${bottomColor} 100%)`;
  };

  if (t >= 0) {
    const panelTop = (vhSafe * t) / 100;
    const pct = ((panelTop - logoTop) / range) * 100;

    if (!inverted) {
      if (panelTop >= logoBottom) return solid(LANDING_LOGO_LIGHT);
      if (panelTop <= logoTop) return solid(LANDING_LOGO_DARK);
      return split(LANDING_LOGO_LIGHT, LANDING_LOGO_DARK, pct);
    }

    if (panelTop >= logoBottom) return solid(LANDING_LOGO_DARK);
    if (panelTop <= logoTop) return solid(LANDING_LOGO_LIGHT);
    return split(LANDING_LOGO_DARK, LANDING_LOGO_LIGHT, pct);
  }

  const panelBottom = vhSafe * (1 + t / 100);
  const pct = ((panelBottom - logoTop) / range) * 100;

  if (!inverted) {
    if (panelBottom >= logoBottom) return solid(LANDING_LOGO_DARK);
    if (panelBottom <= logoTop) return solid(LANDING_LOGO_LIGHT);
    return split(LANDING_LOGO_DARK, LANDING_LOGO_LIGHT, pct);
  }

  if (panelBottom >= logoBottom) return solid(LANDING_LOGO_LIGHT);
  if (panelBottom <= logoTop) return solid(LANDING_LOGO_DARK);
  return split(LANDING_LOGO_LIGHT, LANDING_LOGO_DARK, pct);
}

const MENU_ICON_BAR_DURATION = 0.44;
const MENU_ICON_BAR_STAGGER = 0.09;
const MENU_ICON_X_IN_DELAY = 0.2;
const MENU_ICON_X_IN_DURATION = 0.52;
const MENU_ICON_X_OUT_DURATION = 0.3;
const MENU_ICON_X_ARM_STAGGER = 0.05;

function AnimatedLandingMenuIcon({
  expanded,
  onLightBackground,
  reduceMotion,
}: {
  expanded: boolean;
  onLightBackground?: boolean;
  reduceMotion?: boolean | null;
}) {
  const instant = !!reduceMotion;
  const barDuration = instant ? 0.04 : MENU_ICON_BAR_DURATION;
  const barStagger = instant ? 0 : MENU_ICON_BAR_STAGGER;
  const xInDur = instant ? 0.04 : MENU_ICON_X_IN_DURATION;
  const xOutDur = instant ? 0.04 : MENU_ICON_X_OUT_DURATION;
  const xInDelay = instant ? 0 : MENU_ICON_X_IN_DELAY;
  const xArmStagger = instant ? 0 : MENU_ICON_X_ARM_STAGGER;
  const barClass = onLightBackground ? 'bg-[#141416]' : 'bg-white';

  return (
    <span className="relative inline-flex h-[22px] w-[26px] items-center justify-center" aria-hidden>
      <span className="absolute flex h-[15px] w-[26px] flex-col justify-between">
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            className={`h-[2px] w-full origin-right rounded-full will-change-transform ${barClass}`}
            initial={false}
            animate={{
              scaleX: expanded ? 0 : 1,
              opacity: expanded ? 0 : 1,
            }}
            transition={{
              ease: PANEL_EASE,
              duration: barDuration,
              delay: i * barStagger,
            }}
          />
        ))}
      </span>
      <span className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <motion.span
          className={`absolute h-[2px] w-[22px] rounded-full will-change-transform ${barClass}`}
          initial={false}
          style={{ left: '50%', top: '50%', transformOrigin: '50% 50%' }}
          animate={{
            rotate: 45,
            x: '-50%',
            y: '-50%',
            scaleX: expanded ? 1 : 0,
            opacity: expanded ? 1 : 0,
          }}
          transition={{
            ease: PANEL_EASE,
            duration: expanded ? xInDur : xOutDur,
            delay: expanded ? xInDelay : 0,
          }}
        />
        <motion.span
          className={`absolute h-[2px] w-[22px] rounded-full will-change-transform ${barClass}`}
          initial={false}
          style={{ left: '50%', top: '50%', transformOrigin: '50% 50%' }}
          animate={{
            rotate: -45,
            x: '-50%',
            y: '-50%',
            scaleX: expanded ? 1 : 0,
            opacity: expanded ? 1 : 0,
          }}
          transition={{
            ease: PANEL_EASE,
            duration: expanded ? xInDur : xOutDur,
            delay: expanded ? xInDelay + xArmStagger : 0,
          }}
        />
      </span>
    </span>
  );
}

function SectionArrowIcon({ expanded, lightOverlay }: { expanded: boolean; lightOverlay?: boolean }) {
  const strokeClass = lightOverlay ? 'text-[#141416]' : 'text-white';
  return (
    <svg
      width="44"
      height="44"
      viewBox="0 0 24 24"
      fill="none"
      className={`shrink-0 ${strokeClass} transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] md:h-12 md:w-12 ${
        expanded ? 'rotate-90' : ''
      }`}
      aria-hidden
    >
      <path
        d="M9 6l6 6-6 6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function LandingHeaderLogoWithMenuFill({
  sheetY,
  panelActive,
  inverted,
  onMenuNavigate,
}: {
  sheetY: MotionValue<number>;
  panelActive: boolean;
  inverted: boolean;
  onMenuNavigate?: () => void;
}) {
  const logoRef = useRef<HTMLSpanElement>(null);
  const logoBounds = useRef({ top: 23, bottom: 45 });

  useLayoutEffect(() => {
    const measure = () => {
      const el = logoRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      logoBounds.current = { top: rect.top, bottom: rect.bottom };
    };

    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, []);

  const logoFillMotion = useTransform(sheetY, (t) => {
    if (!panelActive) {
      const color = inverted ? LANDING_LOGO_DARK : LANDING_LOGO_LIGHT;
      return `linear-gradient(to bottom, ${color}, ${color})`;
    }

    const vh = typeof window !== 'undefined' ? window.innerHeight : 900;
    return logoFillFromPanelBounds(
      t,
      logoBounds.current.top,
      logoBounds.current.bottom,
      vh,
      inverted,
    );
  });

  return (
    <Link
      href="/"
      className={`inline-flex min-w-0 items-center gap-[9px] ${LANDING_MENU_TEXT_INSET} text-left md:gap-2.5`}
      onClick={() => onMenuNavigate?.()}
    >
      <span ref={logoRef} className="relative inline-flex shrink-0 items-center gap-[9px]">
        <motion.span
          aria-hidden
          className="h-[18px] w-[18px] shrink-0 md:h-[22px] md:w-[22px]"
          style={{
            backgroundImage: logoFillMotion,
            WebkitMaskImage: 'url("/logo.svg")',
            WebkitMaskPosition: 'center',
            WebkitMaskRepeat: 'no-repeat',
            WebkitMaskSize: 'contain',
            maskImage: 'url("/logo.svg")',
            maskPosition: 'center',
            maskRepeat: 'no-repeat',
            maskSize: 'contain',
            willChange: 'background-image',
          }}
        />
        <motion.span
          className="truncate bg-clip-text text-[1.2rem] font-semibold tracking-tight text-transparent md:text-[1.75rem]"
          style={{
            backgroundImage: logoFillMotion,
            WebkitTextFillColor: 'transparent',
            willChange: 'background-image',
          }}
        >
          <QoryWord />
        </motion.span>
      </span>
    </Link>
  );
}

function LandingFullMenuHeader({
  position,
  lightSurface = false,
}: {
  position: 'fixed' | 'absolute';
  lightSurface?: boolean;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const [isExiting, setIsExiting] = useState(false);
  const [menuBtnHovered, setMenuBtnHovered] = useState(false);
  const reduceMotion = useReducedMotion();
  const sheetY = useMotionValue(100);
  const prevMenuOpen = useRef(false);

  useEffect(() => {
    if (!(menuOpen || isExiting)) return;

    const eventElement = (target: EventTarget | null) => {
      if (target instanceof Element) return target;
      if (target instanceof Node) return target.parentElement;
      return null;
    };

    const menuScroller = (target: EventTarget | null) =>
      eventElement(target)?.closest<HTMLElement>(LANDING_MENU_SCROLL_SELECTOR) ?? null;

    const shouldBlockPageScroll = (scroller: HTMLElement | null, deltaY: number) => {
      if (!scroller) return true;
      if (scroller.scrollHeight <= scroller.clientHeight + 1) return true;
      if (deltaY < 0 && scroller.scrollTop <= 0) return true;
      if (deltaY > 0 && scroller.scrollTop + scroller.clientHeight >= scroller.scrollHeight - 1) {
        return true;
      }
      return false;
    };

    let lastTouchY: number | null = null;

    const onWheel = (event: WheelEvent) => {
      if (shouldBlockPageScroll(menuScroller(event.target), event.deltaY)) {
        event.preventDefault();
      }
      event.stopPropagation();
    };

    const onTouchStart = (event: TouchEvent) => {
      lastTouchY = event.touches[0]?.clientY ?? null;
    };

    const onTouchMove = (event: TouchEvent) => {
      const touchY = event.touches[0]?.clientY ?? lastTouchY;
      const deltaY = lastTouchY == null || touchY == null ? 0 : lastTouchY - touchY;
      lastTouchY = touchY;

      if (shouldBlockPageScroll(menuScroller(event.target), deltaY)) {
        event.preventDefault();
      }
      event.stopPropagation();
    };

    document.addEventListener('wheel', onWheel, { capture: true, passive: false });
    document.addEventListener('touchstart', onTouchStart, { capture: true, passive: false });
    document.addEventListener('touchmove', onTouchMove, { capture: true, passive: false });

    return () => {
      document.removeEventListener('wheel', onWheel, { capture: true });
      document.removeEventListener('touchstart', onTouchStart, { capture: true });
      document.removeEventListener('touchmove', onTouchMove, { capture: true });
    };
  }, [menuOpen, isExiting]);

  useEffect(() => {
    if (!menuOpen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape' || isExiting) return;
      setIsExiting(true);
      setMenuOpen(false);
      setExpandedSection(null);
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [menuOpen, isExiting]);

  const toggleSection = (id: string) => {
    setExpandedSection((prev) => (prev === id ? null : id));
  };

  const openMenu = () => {
    if (isExiting) return;
    sheetY.set(100);
    setMenuOpen(true);
  };

  const closeAll = () => {
    if (isExiting) return;
    setIsExiting(true);
    setMenuOpen(false);
    setExpandedSection(null);
  };

  const rm = !!reduceMotion;
  const sheetTranslateY = useTransform(sheetY, (value) => `${Math.min(100, Math.max(-100, value))}%`);
  const contentCounterY = useTransform(sheetY, (value) => {
    if (value >= 0) return 0;
    const vh = typeof window !== 'undefined' ? window.innerHeight : 900;
    return (-value * vh) / 100;
  });

  useLayoutEffect(() => {
    let ctrl: ReturnType<typeof animate> | undefined;

    if (menuOpen && !prevMenuOpen.current) {
      sheetY.set(100);
      if (rm) {
        sheetY.set(0);
      } else {
        ctrl = animate(sheetY, 0, { duration: OV_PANEL_IN, ease: PANEL_EASE });
      }
    }

    if (!menuOpen && prevMenuOpen.current) {
      if (rm) {
        sheetY.set(-100);
        setIsExiting(false);
      } else {
        ctrl = animate(sheetY, -100, {
          duration: OV_PANEL_OUT,
          ease: PANEL_EASE,
          onComplete: () => setIsExiting(false),
        });
      }
    }

    prevMenuOpen.current = menuOpen;
    return () => ctrl?.stop();
  }, [menuOpen, rm, sheetY]);

  const overlaySectionBorder = lightSurface
    ? 'border-b border-white/[0.12]'
    : 'border-b border-black/[0.1]';
  const overlayTitleClass = lightSurface
    ? 'text-[clamp(1.75rem,6vw,3.25rem)] font-bold uppercase leading-[1.05] tracking-tight text-white'
    : 'text-[clamp(1.75rem,6vw,3.25rem)] font-bold uppercase leading-[1.05] tracking-tight text-[#111111]';
  const overlaySublinkClass = lightSurface
    ? 'block text-[1.05rem] font-medium text-white/85 transition-opacity hover:opacity-75 md:text-xl'
    : 'block text-[1.05rem] font-medium text-[#1d1d1f] transition-opacity hover:opacity-75 md:text-xl';
  const overlayLegalClass = lightSurface
    ? 'text-[0.65rem] font-medium uppercase tracking-[0.14em] text-white/45 transition-colors hover:text-white/90 md:text-[0.7rem]'
    : 'text-[0.65rem] font-medium uppercase tracking-[0.14em] text-[#6e6e73] transition-colors hover:text-[#111111] md:text-[0.7rem]';
  const overlaySocialClass = lightSurface
    ? 'inline-flex h-10 w-10 items-center justify-center rounded-full text-white/85 transition-colors hover:bg-white/[0.08] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/30'
    : 'inline-flex h-10 w-10 items-center justify-center rounded-full text-[#1d1d1f] transition-colors hover:bg-black/[0.06] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black/25';
  const barMenuBtnClass = lightSurface
    ? 'text-[#141416] focus-visible:outline-[#141416]/35'
    : 'text-white focus-visible:outline-white/60';

  const menuChromeActive = menuOpen || isExiting;
  const menuIconOnLight = lightSurface && !menuChromeActive && !menuBtnHovered;

  return (
    <>
      <header
        className={`site-chrome-ignore-grid-stack ${menuChromeActive ? 'fixed' : position} inset-x-0 top-0 z-[102] flex h-16 items-center justify-between md:h-[72px] ${LANDING_MENU_GUTTER}`}
      >
        <div className="min-w-0 flex-1">
          <LandingHeaderLogoWithMenuFill
            sheetY={sheetY}
            panelActive={menuChromeActive}
            inverted={lightSurface}
            onMenuNavigate={menuChromeActive ? closeAll : undefined}
          />
        </div>

        <motion.button
          type="button"
          aria-label={menuChromeActive ? 'Fermer le menu' : 'Ouvrir le menu'}
          aria-expanded={menuChromeActive}
          onClick={menuChromeActive ? closeAll : openMenu}
          onPointerEnter={() => setMenuBtnHovered(true)}
          onPointerLeave={() => setMenuBtnHovered(false)}
          whileTap={reduceMotion ? undefined : { scale: 0.94 }}
          transition={{ duration: 0.2, ease: PANEL_EASE }}
          className={`group relative inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ${barMenuBtnClass}`}
        >
          <span
            aria-hidden
            style={{ backgroundColor: REPORT_DECO_CORAL }}
            className={`pointer-events-none absolute left-1/2 top-1/2 size-11 max-h-full max-w-full -translate-x-1/2 -translate-y-1/2 rounded-full ease-[cubic-bezier(0.16,1,0.3,1)] ${
              reduceMotion ? 'transition-none' : 'transition-transform duration-[400ms]'
            } ${menuChromeActive ? 'scale-100' : 'scale-0 group-hover:scale-100 group-focus-visible:scale-100'}`}
          />
          <span className="relative z-10 flex size-full items-center justify-center">
            <AnimatedLandingMenuIcon
              expanded={menuOpen}
              onLightBackground={menuIconOnLight}
              reduceMotion={reduceMotion}
            />
          </span>
        </motion.button>
      </header>

      <AnimatePresence>
        {(menuOpen || isExiting) && (
          <motion.div
            key="landing-menu-full"
            role="dialog"
            aria-modal="true"
            aria-label="Navigation"
            initial={false}
            exit={{ opacity: 0, transition: { duration: 0 } }}
            className={`site-chrome-ignore-grid-stack fixed inset-0 z-[101] flex max-h-[100dvh] flex-col overflow-hidden overscroll-contain pt-16 md:pt-[72px] ${
              lightSurface ? 'bg-[#0a0a0b]' : 'bg-white'
            }`}
            style={{
              y: sheetTranslateY,
              willChange: 'transform',
              WebkitBackfaceVisibility: 'hidden',
              backfaceVisibility: 'hidden',
            }}
          >
            <motion.div
              className="flex min-h-0 flex-1 flex-col"
              style={{ y: contentCounterY, willChange: 'transform' }}
            >
              <motion.div
                className="relative flex min-h-0 flex-1 flex-col"
                initial="hidden"
                animate="visible"
                variants={{
                  hidden: {},
                  visible: {
                    transition: {
                      staggerChildren: rm ? 0 : OV_STAGGER_IN,
                      delayChildren: rm ? 0 : OV_CONTENT_DELAY,
                    },
                  },
                }}
              >
                <motion.nav
                  data-landing-menu-scroll
                  className={`min-h-0 flex-1 overflow-y-auto overscroll-contain ${LANDING_MENU_GUTTER} pb-6`}
                  variants={{
                    hidden: { opacity: 0, y: rm ? 0 : OV_ITEM_Y_IN },
                    visible: {
                      opacity: 1,
                      y: 0,
                      transition: { duration: rm ? 0.01 : OV_ITEM_IN, ease: PANEL_EASE },
                    },
                  }}
                >
                  <motion.div
                    className={LANDING_MENU_TEXT_INSET}
                    variants={{
                      hidden: {},
                      visible: {
                        transition: {
                          staggerChildren: rm ? 0 : OV_STAGGER_IN,
                          delayChildren: rm ? 0 : 0.05,
                        },
                      },
                    }}
                  >
                    {LANDING_FULL_MENU_SECTIONS.map((section) => {
                      const expanded = expandedSection === section.id;
                      return (
                        <motion.div
                          key={section.id}
                          className={`${overlaySectionBorder} last:border-b-0`}
                          variants={{
                            hidden: { opacity: 0, y: rm ? 0 : OV_ITEM_Y_IN },
                            visible: {
                              opacity: 1,
                              y: 0,
                              transition: { duration: rm ? 0.01 : OV_ITEM_IN, ease: PANEL_EASE },
                            },
                          }}
                        >
                          <button
                            type="button"
                            onClick={() => toggleSection(section.id)}
                            className="flex w-full items-center justify-between gap-4 py-7 text-left md:py-9"
                            aria-expanded={expanded}
                          >
                            <span className={overlayTitleClass}>{section.label}</span>
                            <span className="flex h-11 w-11 shrink-0 items-center justify-center md:h-14 md:w-14">
                              <SectionArrowIcon expanded={expanded} lightOverlay={!lightSurface} />
                            </span>
                          </button>

                          <div
                            className={`grid transition-[grid-template-rows] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                              expanded ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
                            }`}
                          >
                            <div className="min-h-0 overflow-hidden">
                              <ul className="flex flex-col gap-3 pb-8 md:gap-3.5">
                                {section.links.map((link) => (
                                  <li key={link.href}>
                                    <Link href={link.href} onClick={closeAll} className={overlaySublinkClass}>
                                      {link.label}
                                    </Link>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </motion.div>
                </motion.nav>

                <motion.div
                  className={`shrink-0 ${LANDING_MENU_GUTTER} pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-2`}
                  variants={{
                    hidden: { opacity: 0, y: rm ? 0 : OV_ITEM_Y_IN },
                    visible: {
                      opacity: 1,
                      y: 0,
                      transition: { duration: rm ? 0.01 : OV_ITEM_IN, ease: PANEL_EASE },
                    },
                  }}
                >
                  <div className={`flex flex-wrap items-center justify-between gap-x-6 gap-y-4 ${LANDING_MENU_TEXT_INSET}`}>
                    <div className="flex min-w-0 flex-1 flex-wrap items-center gap-x-5 gap-y-2">
                      {LANDING_MENU_LEGAL_LINKS.map((item) => (
                        <Link key={item.href} href={item.href} onClick={closeAll} className={overlayLegalClass}>
                          {item.label}
                        </Link>
                      ))}
                    </div>
                    <div className="flex shrink-0 items-center gap-1 sm:gap-2">
                      {LANDING_OVERLAY_SOCIAL.map((social) => (
                        <a
                          key={social.label}
                          href={social.href}
                          aria-label={social.label}
                          className={overlaySocialClass}
                        >
                          <HugeiconsIcon
                            icon={social.icon}
                            size={20}
                            strokeWidth={1.8}
                            className="h-5 w-5"
                          />
                        </a>
                      ))}
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export default function SiteHeader({
  position = 'fixed',
  landingMinimalLightSurface = false,
}: SiteHeaderProps) {
  return (
    <LandingFullMenuHeader
      position={position}
      lightSurface={landingMinimalLightSurface}
    />
  );
}

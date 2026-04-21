import Link from 'next/link';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  Alert02Icon,
  InstagramIcon,
  Linkedin01Icon,
  NewTwitterIcon,
  TiktokIcon,
} from '@hugeicons/core-free-icons';
import QoryWord from '@/app/components/qory-word';

type FooterNavLink = {
  label: string;
  href: string;
  /** Page encore en préparation — affiche une icône d’avertissement. */
  wip?: boolean;
};

const footerColumn1: { title: string; links: readonly FooterNavLink[] }[] = [
  {
    title: 'Produit',
    links: [
      { label: 'Comment ça marche', href: '/comment-ca-marche' },
      { label: 'Pour qui ?', href: '/pour-qui' },
      { label: 'Tarifs', href: '/tarifs' },
      { label: 'FAQ', href: '/faq' },
    ],
  },
  {
    title: 'Cas d’usage',
    links: [
      { label: 'Tous les cas d’usage', href: '/cas-usage' },
      { label: 'Pour SaaS', href: '/cas-usage/saas-applications' },
      { label: 'Pour e-commerce', href: '/cas-usage/ecommerce' },
      { label: 'Pour entreprises locales', href: '/cas-usage/prestataires-locaux' },
    ],
  },
];

const footerColumn2: { title: string; links: readonly FooterNavLink[] }[] = [
  {
    title: 'Qory',
    links: [
      { label: 'Vision', href: '/vision' },
      { label: 'Contact', href: '/contact' },
    ],
  },
  {
    title: 'Blog',
    links: [
      { label: 'Qu’est-ce que le GEO ?', href: '/ressources/quest-ce-que-le-geo' },
      { label: 'SEO vs GEO', href: '/ressources/seo-vs-geo' },
      {
        label: 'Comment savoir si ChatGPT cite votre site',
        href: '/ressources/comment-savoir-si-chatgpt-cite-votre-site',
      },
      { label: 'Blog', href: '/ressources' },
    ],
  },
];

const footerColumn3: { title: string; links: readonly FooterNavLink[] }[] = [
  {
    title: 'Audits IA',
    links: [
      { label: 'Audit de visibilité IA', href: '/audit-visibilite-ia' },
      { label: 'Présence dans les réponses IA', href: '/presence-reponses-ia' },
      { label: 'Analyse de présence IA', href: '/analyse-reponses-ia' },
    ],
  },
  {
    title: 'COMPARATIFS',
    links: [
      { label: 'Qory vs HubSpot AEO Grader', href: '/qory-vs-hubspot-aeo-grader' },
      { label: 'Qory vs Otterly', href: '/qory-vs-otterly' },
    ],
  },
];

const footerColumn4: { title: string; links: readonly FooterNavLink[] }[] = [
  {
    title: 'Plateformes IA',
    links: [
      { label: 'ChatGPT', href: '/presence-chatgpt' },
      { label: 'Claude', href: '/presence-claude' },
      { label: 'Perplexity', href: '/presence-perplexity' },
    ],
  },
  {
    title: 'Légal & confiance',
    links: [
      { label: 'Conditions', href: '/conditions' },
      { label: 'Mentions légales', href: '/mentions-legales' },
      { label: 'Confidentialité', href: '/confidentialite' },
      { label: 'Sécurité', href: '/securite' },
    ],
  },
];

/** Colonnes du bloc liens (desktop : grille 4×2 pour aligner les titres de 2ᵉ rangée). */
const footerNavColumns = [
  footerColumn1,
  footerColumn2,
  footerColumn3,
  footerColumn4,
] as const;

const footerSocialLinks = [
  { label: 'X', href: '#', icon: NewTwitterIcon },
  { label: 'LinkedIn', href: '#', icon: Linkedin01Icon },
  { label: 'Instagram', href: '#', icon: InstagramIcon },
  { label: 'TikTok', href: '#', icon: TiktokIcon },
] as const;

function FooterNavLinkItem({ link }: { link: FooterNavLink }) {
  return (
    <Link href={link.href} className="inline-flex items-start gap-1.5 text-sm text-white transition-colors hover:text-white/70">
      <span className="min-w-0">{link.label}</span>
      {link.wip ? (
        <>
          <HugeiconsIcon
            icon={Alert02Icon}
            size={15}
            strokeWidth={2}
            className="mt-0.5 shrink-0 text-amber-400"
            aria-hidden
          />
          <span className="sr-only">(page en préparation)</span>
        </>
      ) : null}
    </Link>
  );
}

type FooterNavGroupData = { title: string; links: readonly FooterNavLink[] };

function FooterNavGroup({ group }: { group: FooterNavGroupData }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-[0.18em] text-white/70">{group.title}</p>
      <div className="mt-4 flex flex-col gap-3">
        {group.links.map((link) => (
          <FooterNavLinkItem key={`${group.title}-${link.href}-${link.label}`} link={link} />
        ))}
      </div>
    </div>
  );
}

function FooterColumn({ groups }: { groups: readonly FooterNavGroupData[] }) {
  return (
    <div className="flex flex-col gap-10">
      {groups.map((group) => (
        <FooterNavGroup key={group.title} group={group} />
      ))}
    </div>
  );
}

type SiteFooterProps = {
  className?: string;
};

export default function SiteFooter({
  className = 'relative mt-8 rounded-none bg-[#121418] px-4 pb-10 pt-12 text-white sm:px-6 sm:pb-12 sm:pt-14 md:pb-16 md:pt-16',
}: SiteFooterProps) {
  return (
    <footer className={`cv-auto ${className}`.trim()}>
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-12 lg:grid-cols-[1.25fr_2.75fr] lg:gap-16">
          <div>
            <div className="flex items-center gap-4 sm:gap-5">
              <img
                src="/logo.svg"
                alt="Qory"
                className="h-[3.15rem] w-[3.15rem] shrink-0 brightness-0 invert sm:h-[4.35rem] sm:w-[4.35rem] md:h-[5.3rem] md:w-[5.3rem]"
              />
              <p className="whitespace-nowrap text-[3.9rem] font-semibold leading-[0.88] tracking-tight sm:text-[5.3rem] md:text-[6.6rem]">
                <QoryWord />
              </p>
            </div>
          </div>

          <div className="grid gap-10 sm:grid-cols-2 lg:hidden lg:gap-8 xl:gap-10">
            <FooterColumn groups={footerColumn1} />
            <FooterColumn groups={footerColumn2} />
            <FooterColumn groups={footerColumn3} />
            <FooterColumn groups={footerColumn4} />
          </div>
          <div className="hidden gap-x-8 gap-y-10 lg:grid lg:grid-cols-4 xl:gap-x-10">
            {footerNavColumns.map((col, i) => (
              <FooterNavGroup key={`footer-nav-r1-${i}`} group={col[0]} />
            ))}
            {footerNavColumns.map((col, i) => (
              <FooterNavGroup key={`footer-nav-r2-${i}`} group={col[1]} />
            ))}
          </div>
        </div>

        <div className="mt-10 flex items-center justify-between border-t border-white/20 pt-5 text-sm text-white/70">
          <p>@ 2026 <QoryWord />. All rights reserved.</p>
          <div className="flex items-center gap-3">
            {footerSocialLinks.map((link) => (
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

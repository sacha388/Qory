import { useCaseFamilies } from '@/app/lib/use-cases-content';
import { PAID_SCAN_TYPE_OPTIONS } from '@/lib/scanner/paid-scan-catalog';
import type { PaidScanBusinessType } from '@/types';

export const pourQuiPageMeta = {
  path: '/pour-qui',
  documentTitle: 'Pour qui ? | Qory',
  title: 'Pour qui ?',
  seoDescription:
    'Découvrez si Qory correspond à votre site : commerce et restauration, prestataire local, agence, SaaS, produits IA, plateformes, e-commerce ou institutions.',
  heroDescription:
    'L’audit s’adapte à votre réalité : intentions de recherche, signaux attendus et rapport lisible selon que vous vendez en local, en ligne ou via un logiciel. Choisissez votre univers pour voir les cas d’usage détaillés.',
  primaryLabel: 'Lancer une vérification',
  primaryHref: '/audit',
  secondaryLabel: 'Tous les cas d’usage',
  secondaryHref: '/cas-usage',
} as const;

const FAMILY_SLUG_BY_TYPE: Record<PaidScanBusinessType, string> = {
  commerce_restauration: 'commerces-restauration',
  prestataire_local: 'prestataires-locaux',
  agence_studio: 'agences-studios',
  saas_application: 'saas-applications',
  ia_assistants: 'produits-ia',
  plateforme_annuaire: 'plateformes-annuaires',
  ecommerce: 'ecommerce',
  etablissement_institution: 'etablissements-institutions',
};

const familyBySlug = Object.fromEntries(useCaseFamilies.map((f) => [f.slug, f])) as Record<
  string,
  (typeof useCaseFamilies)[number]
>;

/** Visuels Pexels (gratuits) — https://www.pexels.com */
const POUR_QUI_PEXELS = {
  commerce_restauration: {
    imageSrc:
      'https://images.pexels.com/photos/16722390/pexels-photo-16722390.jpeg?auto=compress&cs=tinysrgb&w=1600',
    imageAlt: 'Intérieur de restaurant avec tables dressées, commerce de bouche et restauration',
  },
  prestataire_local: {
    imageSrc:
      'https://images.pexels.com/photos/5974335/pexels-photo-5974335.jpeg?auto=compress&cs=tinysrgb&w=1600',
    imageAlt: 'Artisan au travail avec outil électrique, métier du bâtiment et service local',
  },
  agence_studio: {
    imageSrc:
      'https://images.pexels.com/photos/3184292/pexels-photo-3184292.jpeg?auto=compress&cs=tinysrgb&w=1600',
    imageAlt: 'Équipe en réunion créative dans un bureau lumineux',
  },
  saas_application: {
    imageSrc:
      'https://images.pexels.com/photos/3183183/pexels-photo-3183183.jpeg?auto=compress&cs=tinysrgb&w=1600',
    imageAlt: 'Personnes en réunion autour d’une table en bois, collaboration et travail d’équipe',
  },
  ia_assistants: {
    imageSrc:
      'https://images.pexels.com/photos/8386440/pexels-photo-8386440.jpeg?auto=compress&cs=tinysrgb&w=1600',
    imageAlt: 'Technologie et écrans en contexte professionnel, innovation numérique',
  },
  plateforme_annuaire: {
    imageSrc:
      'https://images.pexels.com/photos/6347919/pexels-photo-6347919.jpeg?auto=compress&cs=tinysrgb&w=1600',
    imageAlt: 'Vue urbaine dense, métaphore des réseaux, places de marché et connexions',
  },
  ecommerce: {
    imageSrc:
      'https://images.pexels.com/photos/5632402/pexels-photo-5632402.jpeg?auto=compress&cs=tinysrgb&w=1600',
    imageAlt: 'Sacs de shopping et expérience d’achat, commerce en ligne ou boutique',
  },
  etablissement_institution: {
    imageSrc:
      'https://images.pexels.com/photos/12590001/pexels-photo-12590001.jpeg?auto=compress&cs=tinysrgb&w=1600',
    imageAlt: 'Bâtiment de musée institutionnel, lieu culturel et éducatif',
  },
} satisfies Record<PaidScanBusinessType, { imageSrc: string; imageAlt: string }>;

export type PourQuiSegment = {
  id: PaidScanBusinessType;
  title: string;
  body: string;
  href: string;
  visualSide: 'left' | 'right';
  imageSrc: string;
  imageAlt: string;
};

export const pourQuiSegments: PourQuiSegment[] = PAID_SCAN_TYPE_OPTIONS.map((option, index) => {
  const slug = FAMILY_SLUG_BY_TYPE[option.id];
  const family = familyBySlug[slug];
  const visual = POUR_QUI_PEXELS[option.id];
  return {
    id: option.id,
    title: option.label,
    body: family?.hubDescription ?? family?.description ?? '',
    href: `/cas-usage/${slug}`,
    visualSide: index % 2 === 0 ? 'left' : 'right',
    imageSrc: visual.imageSrc,
    imageAlt: visual.imageAlt,
  };
});

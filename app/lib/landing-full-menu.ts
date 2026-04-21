/**
 * Menu plein écran (landing) — mêmes familles que le footer, version courte
 * (pas de Cas d’usage, comparatifs, ni hub « Ressources » en section dédiée).
 */
export const LANDING_FULL_MENU_SECTIONS = [
  {
    id: 'produit',
    label: 'Produit',
    links: [
      { label: 'Comment ça marche', href: '/comment-ca-marche' },
      { label: 'Pour qui ?', href: '/pour-qui' },
      { label: 'Tarifs', href: '/tarifs' },
      { label: 'FAQ', href: '/faq' },
    ],
  },
  {
    id: 'qory',
    label: 'Qory',
    links: [
      { label: 'Vision', href: '/vision' },
      { label: 'Contact', href: '/contact' },
    ],
  },
  {
    id: 'blog',
    label: 'Blog',
    links: [
      { label: 'Blog', href: '/ressources' },
      { label: 'Qu’est-ce que le GEO ?', href: '/ressources/quest-ce-que-le-geo' },
      { label: 'SEO vs GEO', href: '/ressources/seo-vs-geo' },
    ],
  },
  {
    id: 'audit-ia',
    label: 'Audit IA',
    links: [
      { label: 'Lancer l’audit', href: '/audit' },
      { label: 'Audit de visibilité IA', href: '/audit-visibilite-ia' },
      { label: 'Présence dans les réponses IA', href: '/presence-reponses-ia' },
      { label: 'Analyse de présence IA', href: '/analyse-reponses-ia' },
    ],
  },
  {
    id: 'plateforme-ia',
    label: 'Plateforme IA',
    links: [
      { label: 'ChatGPT', href: '/presence-chatgpt' },
      { label: 'Claude', href: '/presence-claude' },
      { label: 'Perplexity', href: '/presence-perplexity' },
    ],
  },
] as const;

export const LANDING_MENU_LEGAL_LINKS = [
  { label: 'Conditions', href: '/conditions' },
  { label: 'Mentions légales', href: '/mentions-legales' },
  { label: 'Confidentialité', href: '/confidentialite' },
  { label: 'Sécurité', href: '/securite' },
] as const;

// Common business sectors and their typical search patterns
export const SECTORS = {
  saas: {
    name: 'SaaS',
    keywords: [
      'saas', 'software', 'logiciel', 'platform', 'plateforme', 'dashboard',
      'application', 'app', 'api', 'automation',
    ],
  },
  ecommerce: {
    name: 'E-commerce',
    keywords: [
      'ecommerce', 'e-commerce', 'boutique en ligne', 'online store', 'shop', 'store',
      'panier', 'checkout', 'catalogue', 'product', 'produit',
    ],
  },
  restaurant: {
    name: 'Restaurant',
    keywords: [
      'restaurant', 'cuisine', 'gastronomie', 'brasserie', 'bistrot',
      'food', 'dining', 'eatery',
    ],
  },
  hotel: {
    name: 'Hôtel',
    keywords: [
      'hôtel', 'hotel', 'hébergement', 'accommodation', 'chambre', 'room', 'séjour',
    ],
  },
  dentist: {
    name: 'Dentiste',
    keywords: [
      'dentiste', 'dental', 'dentist', 'cabinet dentaire', 'soins dentaires', 'clinic',
    ],
  },
  lawyer: {
    name: 'Avocat',
    keywords: [
      'avocat', 'lawyer', 'attorney', 'cabinet d\'avocat', 'conseil juridique', 'legal',
    ],
  },
  plumber: {
    name: 'Plombier',
    keywords: [
      'plombier', 'plomberie', 'dépannage', 'plumber', 'plumbing', 'repair',
    ],
  },
  electrician: {
    name: 'Électricien',
    keywords: [
      'électricien', 'électricité', 'installation électrique', 'electrician', 'electrical',
    ],
  },
  hairdresser: {
    name: 'Coiffeur',
    keywords: [
      'coiffeur', 'salon de coiffure', 'coiffure', 'hairdresser', 'hair salon', 'barber',
    ],
  },
  bakery: {
    name: 'Boulangerie',
    keywords: [
      'boulangerie', 'boulanger', 'pain', 'pâtisserie', 'bakery', 'pastry', 'bread',
    ],
  },
  gym: {
    name: 'Salle de sport',
    keywords: [
      'salle de sport', 'fitness', 'gym', 'musculation', 'workout', 'training',
    ],
  },
  media: {
    name: 'Média',
    keywords: [
      'média', 'media', 'blog', 'news', 'article', 'magazine', 'newsletter', 'publication',
    ],
  },
  consulting: {
    name: 'Conseil',
    keywords: [
      'consulting', 'conseil', 'advisor', 'agency', 'agence', 'strategy', 'stratégie',
    ],
  },
  marketing: {
    name: 'Marketing',
    keywords: [
      'marketing', 'seo', 'référencement', 'ads', 'acquisition', 'growth', 'social media',
    ],
  },
  agency: {
    name: 'Agence',
    keywords: ['agence', 'agency', 'services', 'service', 'conseil'],
  },
  shop: {
    name: 'Commerce',
    keywords: ['magasin', 'boutique', 'commerce', 'store', 'shop'],
  },
  service: {
    name: 'Service',
    keywords: ['service', 'services', 'prestation', 'professionnel', 'business', 'company'],
  },
};

export type SectorKey = keyof typeof SECTORS;

const SECTOR_PRIORITY: Record<SectorKey, number> = {
  plumber: 60,
  electrician: 58,
  dentist: 56,
  lawyer: 54,
  restaurant: 52,
  hotel: 50,
  hairdresser: 48,
  bakery: 46,
  gym: 44,
  ecommerce: 42,
  saas: 40,
  marketing: 36,
  consulting: 34,
  agency: 22,
  media: 20,
  shop: 18,
  service: 8,
};

// Detect sector from business info
export function detectSector(businessInfo: {
  name?: string | null;
  description?: string | null;
  services?: string[];
}): string | null {
  const text = [
    businessInfo.name,
    businessInfo.description,
    ...(businessInfo.services || []),
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

  if (!text.trim()) return null;

  const scores = Object.entries(SECTORS)
    .map(([key, sector]) => {
      let keywordMatches = 0;
      let weightedMatchScore = 0;

      for (const keyword of sector.keywords) {
        if (!containsKeyword(text, keyword.toLowerCase())) continue;
        keywordMatches += 1;
        const tokenCount = keyword.trim().split(/\s+/).filter(Boolean).length;
        weightedMatchScore += tokenCount > 1 ? 2 : 1;
      }

      if (keywordMatches === 0) return null;

      const sectorKey = key as SectorKey;
      const priority = SECTOR_PRIORITY[sectorKey] || 0;
      const score = weightedMatchScore * 10 + keywordMatches + priority;

      return {
        name: sector.name,
        score,
      };
    })
    .filter((entry): entry is { name: string; score: number } => Boolean(entry))
    .sort((a, b) => b.score - a.score);

  return scores[0]?.name || null;
}

function containsKeyword(text: string, keyword: string): boolean {
  const escaped = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const pattern = new RegExp(`(^|[^\\p{L}\\p{N}])${escaped}([^\\p{L}\\p{N}]|$)`, 'iu');
  return pattern.test(text);
}

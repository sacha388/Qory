import type { PromptProfileSnapshot } from '@/types';
import { canonicalizeCompetitorKey, canonicalizeCompetitorName } from '@/lib/scanner/competitor-normalization';

export type CompetitorEntityType =
  | 'brand'
  | 'directory'
  | 'marketplace'
  | 'generic_actor'
  | 'noise';

const NOISE_PREFIX_PATTERN =
  /^(?:dans\s+quels?\s+cas|est[\s-]?ce|quel(?:le)?s?|quels?|quelles?|qui|que|comment|pourquoi|o[uù]|selon|entre|parmi|notamment|voici|cependant|toutefois|plusieurs|certains?|certaines?|diff[ée]rents?|diff[ée]rentes?|question|questions|r[ée]ponse|response|answer|answers|excerpt|citation|prompt|requ[êe]te|request|what|which|who|where|when|why|how|according|among|between|however|several|various|comparez?|comparer|demandez?|v[ée]rifiez?|v[ée]rifier|cherchez?|chercher|consultez?|consulter|privil[ée]giez|privil[ée]gier|choisissez?|choisir|contactez?|contacter|regardez?|regarder)\b/i;

const NOISE_EXACT = new Set([
  'aucun',
  'aucune',
  'none',
  'na',
  'n/a',
  'dautre',
  'dautres',
  'autres',
  'other',
  'others',
  'importance',
  'important',
  'importante',
  'verification',
  'verifications',
  'comparaison',
  'comparaisons',
  'variet',
  'variete',
  'disponibilit',
  'choisis',
  'choisir',
  'contacter',
  'contactez',
]);

const DIRECTORY_PATTERNS = [
  /\bpages?\s*jaunes?\b/i,
  /\bpagesjaunes\b/i,
  /\byelp\b/i,
  /\btripadvisor\b/i,
  /\btrustpilot\b/i,
  /\bgoogle maps\b/i,
  /\bgoogle avis\b/i,
  /\bannuaires?\b/i,
  /\bdirectory\b/i,
  /\bcomparateurs?\b/i,
];

const MARKETPLACE_PATTERNS = [
  /\bmarketplace\b/i,
  /\bplateformes?\b/i,
  /\bplatforms?\b/i,
  /\bmise en relation\b/i,
  /\bbooking\b/i,
  /\bfreelancers?\b/i,
  /\bjob board\b/i,
  /\bjobs?\b/i,
  /\brecrutement\b/i,
];

const MARKETPLACE_BRANDS = new Set([
  'helpling',
  'starofservice',
  'myjobcompany',
  'indeed',
  'upwork',
  'fiverr',
  'airbnb',
  'booking',
  'etsy',
  'vinted',
  'leboncoin',
  'doctolib',
]);

const GENERIC_ACTOR_PATTERN =
  /\b(?:entreprises?|plateformes?|annuaires?|services?|d[ée]pannage|mise en relation|r[ée]seaux?|acteurs?|options?|alternatives?|professionnels?|prestataires?|fournisseurs?)\b/i;

const GENERIC_ACTOR_TOKENS = new Set([
  'entreprise',
  'entreprises',
  'plateforme',
  'plateformes',
  'annuaire',
  'annuaires',
  'service',
  'services',
  'depannage',
  'dépannage',
  'mise',
  'relation',
  'reseau',
  'réseau',
  'reseaux',
  'réseaux',
  'acteur',
  'acteurs',
  'option',
  'options',
  'alternative',
  'alternatives',
  'professionnel',
  'professionnels',
  'fournisseur',
  'fournisseurs',
  'prestataire',
  'prestataires',
]);

const DISPLAYABLE_BRAND_PREFIXES = /^(?:allo|sos)\b/i;
const DISPLAYABLE_BRAND_HINT_TOKENS = new Set([
  'express',
  'expert',
  'experts',
  'services',
  'service',
  'solutions',
  'depannage',
  'dépannage',
  'assistance',
  'pro',
  'plus',
  'elite',
  'center',
  'centre',
  'group',
  'groupe',
]);

export function classifyCompetitorEntity(
  rawName: string,
  businessName?: string | null
): { name: string | null; type: CompetitorEntityType; normalizedKey: string | null } {
  const cleaned = canonicalizeCompetitorName(rawName.replace(/\s+/g, ' ').trim());
  if (cleaned.length < 2) return { name: null, type: 'noise', normalizedKey: null };
  if (NOISE_PREFIX_PATTERN.test(cleaned)) return { name: null, type: 'noise', normalizedKey: null };

  const normalizedKey = canonicalizeCompetitorKey(cleaned);
  if (!normalizedKey || normalizedKey.length < 2) {
    return { name: null, type: 'noise', normalizedKey: null };
  }
  if (NOISE_EXACT.has(normalizedKey)) {
    return { name: null, type: 'noise', normalizedKey };
  }
  if (businessName) {
    const businessKey = canonicalizeCompetitorKey(businessName);
    if (
      businessKey &&
      (normalizedKey === businessKey ||
        normalizedKey.includes(businessKey) ||
        businessKey.includes(normalizedKey))
    ) {
      return { name: null, type: 'noise', normalizedKey };
    }
  }

  if (DIRECTORY_PATTERNS.some((pattern) => pattern.test(cleaned))) {
    return { name: cleaned, type: 'directory', normalizedKey };
  }

  if (
    MARKETPLACE_BRANDS.has(normalizedKey) ||
    MARKETPLACE_PATTERNS.some((pattern) => pattern.test(cleaned))
  ) {
    return { name: cleaned, type: 'marketplace', normalizedKey };
  }

  const normalizedTokens = cleaned
    .toLowerCase()
    .split(/\s+/)
    .map((token) => token.replace(/[^\p{L}\p{N}]/gu, ''))
    .filter(Boolean);

  const distinctiveTokens = normalizedTokens.filter(
    (token) => !GENERIC_ACTOR_TOKENS.has(token) && !NOISE_EXACT.has(token) && token.length >= 2
  );

  if (
    GENERIC_ACTOR_PATTERN.test(cleaned) &&
    distinctiveTokens.length === 0 &&
    !DISPLAYABLE_BRAND_PREFIXES.test(cleaned)
  ) {
    return { name: cleaned, type: 'generic_actor', normalizedKey };
  }

  if (DISPLAYABLE_BRAND_PREFIXES.test(cleaned)) {
    return { name: cleaned, type: 'brand', normalizedKey };
  }

  if (
    distinctiveTokens.length > 0 ||
    normalizedTokens.some((token) => DISPLAYABLE_BRAND_HINT_TOKENS.has(token))
  ) {
    return { name: cleaned, type: 'brand', normalizedKey };
  }

  return { name: cleaned, type: 'brand', normalizedKey };
}

export function shouldIncludeCompetitiveEntity(
  entityType: CompetitorEntityType,
  promptProfile?: PromptProfileSnapshot | null
): boolean {
  if (entityType === 'brand') return true;
  if (entityType !== 'marketplace') return false;
  return isMarketplaceCompetitiveForProfile(promptProfile);
}

export function isMarketplaceCompetitiveForProfile(
  promptProfile?: PromptProfileSnapshot | null
): boolean {
  if (!promptProfile) return false;
  if (
    promptProfile.siteType === 'marketplace' ||
    promptProfile.siteType === 'ecommerce' ||
    promptProfile.siteType === 'travel_booking' ||
    promptProfile.siteType === 'jobs_recruitment'
  ) {
    return true;
  }

  return (
    promptProfile.domainVertical === 'ecommerce_retail' ||
    promptProfile.domainVertical === 'travel_hospitality' ||
    promptProfile.domainVertical === 'recruitment_jobs'
  );
}

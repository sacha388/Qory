const CORPORATE_SUFFIX_TOKENS = new Set([
  'inc',
  'llc',
  'ltd',
  'plc',
  'corp',
  'corporation',
  'company',
  'co',
  'gmbh',
  'sas',
  'sa',
  'bv',
  'holding',
  'holdings',
  'group',
  'official',
]);

const WEAK_ALIAS_TOKENS = new Set(['plus']);
const GENERIC_QUALIFIER_TOKENS = new Set([
  'ai',
  'app',
  'apps',
  'assistant',
  'assistants',
  'bot',
  'bots',
  'cloud',
  'engine',
  'platform',
  'platforms',
  'service',
  'services',
  'software',
  'suite',
  'tool',
  'tools',
]);
const VENDOR_ALIAS_TOKENS = new Set([
  'amazon',
  'google',
  'ibm',
  'microsoft',
  'notion',
  'openai',
]);

const CANONICAL_LABEL_REWRITES: Array<[RegExp, string]> = [
  [/^365\s+copilot$/i, 'Microsoft 365 Copilot'],
  [/^microsoft\s+copilot$/i, 'Microsoft 365 Copilot'],
  [/^copilot$/i, 'Microsoft 365 Copilot'],
  [/^google\s+gemini$/i, 'Google Gemini'],
  [/^gemini$/i, 'Google Gemini'],
  [/^romi$/i, 'ROMI Plomberie'],
];

export function canonicalizeCompetitorName(value: string): string {
  const normalizedValue = value
    .replace(/\s+/g, ' ')
    .replace(/^[\s"'`“”‘’]+|[\s"'`“”‘’.,;:!?]+$/g, '')
    .trim();

  const urlDerivedName = extractNameFromCompetitorUrl(normalizedValue);
  const cleaned = applyCanonicalLabelRewrite(urlDerivedName || normalizedValue);

  if (/^\d+$/.test(cleaned)) {
    return '';
  }

  return cleaned;
}

function applyCanonicalLabelRewrite(value: string): string {
  for (const [pattern, replacement] of CANONICAL_LABEL_REWRITES) {
    if (pattern.test(value)) {
      return replacement;
    }
  }

  return value;
}

export function canonicalizeCompetitorKey(value: string): string {
  return buildComparableTokens(value).join(' ');
}

export function areLikelySameCompetitorName(left: string, right: string): boolean {
  const leftKey = canonicalizeCompetitorKey(left);
  const rightKey = canonicalizeCompetitorKey(right);

  if (!leftKey || !rightKey) return false;
  if (leftKey === rightKey) return true;

  const leftAliasTokens = buildAliasTokens(left);
  const rightAliasTokens = buildAliasTokens(right);

  if (leftAliasTokens.length === 0 || rightAliasTokens.length === 0) {
    return false;
  }

  if (leftAliasTokens.join(' ') === rightAliasTokens.join(' ')) {
    return true;
  }

  const shorter =
    leftAliasTokens.length <= rightAliasTokens.length ? leftAliasTokens : rightAliasTokens;
  const longer =
    shorter === leftAliasTokens ? rightAliasTokens : leftAliasTokens;

  const shorterIsSubset = shorter.every((token) => longer.includes(token));
  if (!shorterIsSubset) return false;

  if (shorter.length >= 2) {
    return longer.length - shorter.length <= 2;
  }

  if (shorter.length === 1) {
    if (longer.length === 1) {
      return shorter[0] === longer[0];
    }

    if (VENDOR_ALIAS_TOKENS.has(shorter[0]) && longer.includes(shorter[0]) && longer.length <= 3) {
      return true;
    }

    return longer.length === 2 && shorter[0] === longer[1] && longer[0].length <= 3;
  }

  return false;
}

export function pickPreferredCompetitorName(current: string, candidate: string): string {
  const currentClean = canonicalizeCompetitorName(current);
  const candidateClean = canonicalizeCompetitorName(candidate);

  if (!currentClean) return candidateClean;
  if (!candidateClean) return currentClean;

  const currentScore = scoreCompetitorLabel(currentClean);
  const candidateScore = scoreCompetitorLabel(candidateClean);

  if (candidateScore !== currentScore) {
    return candidateScore > currentScore ? candidateClean : currentClean;
  }

  return candidateClean.length > currentClean.length ? candidateClean : currentClean;
}

export function dedupeDistinctCompetitorNames(names: string[], limit = 5): string[] {
  const result: string[] = [];

  names.forEach((rawName) => {
    const candidate = canonicalizeCompetitorName(rawName);
    if (!candidate) return;

    const existingIndex = result.findIndex((entry) => areLikelySameCompetitorName(entry, candidate));
    if (existingIndex === -1) {
      result.push(candidate);
      return;
    }

    result[existingIndex] = pickPreferredCompetitorName(result[existingIndex], candidate);
  });

  const groups = result.map((name) => ({ name }));
  collapseBareCompetitorAliases(groups, () => {});
  return groups.map((entry) => entry.name).slice(0, limit);
}

export function collapseBareCompetitorAliases<T extends { name: string }>(
  groups: T[],
  mergeGroupData: (target: T, source: T) => void
): void {
  const entries = groups
    .map((group, index) => ({
      index,
      name: canonicalizeCompetitorName(group.name),
      aliasTokens: buildAliasTokens(group.name),
    }))
    .filter((entry) => entry.name.length > 0 && entry.aliasTokens.length > 0);

  if (entries.length < 2) return;

  const toRemove = new Set<number>();
  const mergeTargets = new Map<number, number>();

  for (const entry of entries) {
    if (entry.aliasTokens.length !== 1) continue;

    const candidates = entries.filter((other) => {
      if (other.index === entry.index) return false;
      if (other.aliasTokens.length <= 1) return false;
      return entry.aliasTokens.every((token) => other.aliasTokens.includes(token));
    });

    if (candidates.length === 0) continue;

    if (candidates.length > 1) {
      toRemove.add(entry.index);
      continue;
    }

    const candidate = candidates[0];
    if (!canCollapseBareAliasIntoQualified(entry.aliasTokens[0], candidate.aliasTokens)) {
      continue;
    }

    mergeTargets.set(entry.index, candidate.index);
  }

  if (mergeTargets.size === 0 && toRemove.size === 0) return;

  for (const [sourceIndex, targetIndex] of mergeTargets.entries()) {
    if (toRemove.has(sourceIndex)) continue;

    const source = groups[sourceIndex];
    const target = groups[targetIndex];
    if (!source || !target) continue;

    target.name = pickPreferredCompetitorName(target.name, source.name);
    mergeGroupData(target, source);
    toRemove.add(sourceIndex);
  }

  for (const index of Array.from(toRemove).sort((left, right) => right - left)) {
    groups.splice(index, 1);
  }
}

function normalizeTokens(value: string): string[] {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/\+/g, ' plus ')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .filter((token) => !CORPORATE_SUFFIX_TOKENS.has(token));
}

function buildComparableTokens(value: string): string[] {
  return normalizeTokens(canonicalizeCompetitorName(value));
}

function buildAliasTokens(value: string): string[] {
  const comparableTokens = buildComparableTokens(value);
  const aliasTokens = comparableTokens.filter((token) => !WEAK_ALIAS_TOKENS.has(token));
  return aliasTokens.length > 0 ? aliasTokens : comparableTokens;
}

function scoreCompetitorLabel(value: string): number {
  const comparableTokens = buildComparableTokens(value);
  const aliasTokens = buildAliasTokens(value);
  const hasPlus = /(?:\+|\bplus\b)/i.test(value);
  const hasShortPrefix =
    aliasTokens.length === 2 &&
    comparableTokens.length === 2 &&
    comparableTokens[0].length <= 3;

  return (
    aliasTokens.length * 100 +
    comparableTokens.length * 20 +
    value.length +
    (hasPlus ? 5 : 0) +
    (hasShortPrefix ? 10 : 0)
  );
}

function canCollapseBareAliasIntoQualified(sourceToken: string, targetTokens: string[]): boolean {
  if (targetTokens.length < 2) return false;
  if (targetTokens[targetTokens.length - 1] === sourceToken) return true;

  if (targetTokens.length !== 2 || targetTokens[0] !== sourceToken) {
    return false;
  }

  return GENERIC_QUALIFIER_TOKENS.has(targetTokens[1]);
}

function extractNameFromCompetitorUrl(value: string): string | null {
  if (!looksLikeCompetitorUrl(value)) return null;

  try {
    const withProtocol = /^[a-z]+:\/\//i.test(value) ? value : `https://${value}`;
    const hostname = new URL(withProtocol).hostname.toLowerCase();
    const parts = hostname.split('.').filter(Boolean);
    if (parts.length === 0) return null;

    const commonSubdomains = new Set(['www', 'app', 'go', 'm', 'fr', 'en']);
    const effectiveParts = parts.filter(
      (part, index) => !(index < parts.length - 2 && commonSubdomains.has(part))
    );

    let domainLabel =
      effectiveParts.length >= 2
        ? effectiveParts[effectiveParts.length - 2]
        : effectiveParts[0];

    if (
      effectiveParts.length >= 3 &&
      effectiveParts[effectiveParts.length - 1].length === 2 &&
      ['co', 'com', 'org', 'net', 'gov', 'ac'].includes(
        effectiveParts[effectiveParts.length - 2]
      )
    ) {
      domainLabel = effectiveParts[effectiveParts.length - 3];
    }

    const formatted = domainLabel
      .split('-')
      .filter(Boolean)
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' ')
      .trim();

    return formatted || null;
  } catch {
    return null;
  }
}

function looksLikeCompetitorUrl(value: string): boolean {
  return /^(?:https?:\/\/|www\.|[a-z0-9-]+\.(?:fr|com|net|org|io|co|ai|app|dev|biz|eu|uk)(?:\/|$))/i.test(
    value
  );
}

/**
 * Detects competitor names that are composites of other brands
 * (e.g. "Amazon Prime Video Disney" = "Amazon Prime Video" + "Disney+",
 *  or "Cegid Sage QuickBooks Cegid" = all tokens already in other entries)
 * and returns a split plan mapping each composite to its parts.
 */
export function computeCompositeSplitPlan(allNames: string[]): Map<string, string[]> {
  const entries = allNames
    .map((n) => canonicalizeCompetitorName(n))
    .filter((n) => n.length > 0);

  if (entries.length < 2) return new Map();

  const result = new Map<string, string[]>();

  // Pass 1: detect names fully absorbed by other entries in the list.
  // If every unique token of a name appears in the alias tokens of at least
  // one other distinct entry, the name is a concatenation artifact.
  for (const name of entries) {
    const nameTokens = buildAliasTokens(name);
    if (nameTokens.length < 2) continue;

    const uniqueTokens = [...new Set(nameTokens)];
    const coveringParts = new Set<string>();
    let allCovered = true;

    for (const token of uniqueTokens) {
      const match = entries.find((other) => {
        if (areLikelySameCompetitorName(other, name)) return false;
        return buildAliasTokens(other).includes(token);
      });
      if (match) {
        coveringParts.add(match);
      } else {
        allCovered = false;
        break;
      }
    }

    if (allCovered && coveringParts.size >= 2) {
      result.set(name, [...coveringParts]);
    }
  }

  // Pass 2: two-part decomposition for composites not caught by pass 1.
  interface Decomposition {
    composite: string;
    knownPart: string;
    remainderTokens: string[];
    remainderKey: string;
  }

  const decompositions: Decomposition[] = [];

  for (const name of entries) {
    if (result.has(name)) continue;
    const nameTokens = buildAliasTokens(name);
    if (nameTokens.length < 3) continue;

    for (const other of entries) {
      if (areLikelySameCompetitorName(name, other)) continue;

      const otherTokens = buildAliasTokens(other);
      if (otherTokens.length === 0 || otherTokens.length >= nameTokens.length) continue;

      const remaining = subtractTokens(nameTokens, otherTokens);
      if (!remaining || remaining.length === 0) continue;

      decompositions.push({
        composite: name,
        knownPart: other,
        remainderTokens: remaining,
        remainderKey: [...remaining].sort().join(' '),
      });
    }
  }

  if (decompositions.length > 0) {
    const remainderCounts = new Map<string, number>();
    for (const d of decompositions) {
      remainderCounts.set(d.remainderKey, (remainderCounts.get(d.remainderKey) || 0) + 1);
    }

    for (const d of decompositions) {
      if (result.has(d.composite)) continue;

      const remainderMatchesKnown = entries.some((e) => {
        if (areLikelySameCompetitorName(e, d.composite)) return false;
        if (areLikelySameCompetitorName(e, d.knownPart)) return false;
        return [...buildAliasTokens(e)].sort().join(' ') === d.remainderKey;
      });

      const remainderIsRecurrent =
        d.remainderTokens.length >= 2 && (remainderCounts.get(d.remainderKey) || 0) >= 2;

      // A name with 3+ tokens that contains a known single-token brand
      // plus a 2+ token remainder is very likely a composite
      const compositeTokenCount = buildAliasTokens(d.composite).length;
      const likelyCompositeOfKnownBrand =
        !remainderMatchesKnown &&
        !remainderIsRecurrent &&
        compositeTokenCount >= 3 &&
        buildAliasTokens(d.knownPart).length === 1 &&
        d.remainderTokens.length >= 2;

      if (remainderMatchesKnown || remainderIsRecurrent || likelyCompositeOfKnownBrand) {
        const remainder = extractRemainderFromComposite(d.composite, d.knownPart);
        if (remainder) {
          result.set(d.composite, [d.knownPart, remainder]);
        }
      }
    }
  }

  return result;
}

function subtractTokens(source: string[], toRemove: string[]): string[] | null {
  const remaining = [...source];
  for (const token of toRemove) {
    const idx = remaining.indexOf(token);
    if (idx === -1) return null;
    remaining.splice(idx, 1);
  }
  return remaining.length > 0 ? remaining : null;
}

function extractRemainderFromComposite(composite: string, knownPart: string): string | null {
  const knownTokens = [...buildAliasTokens(knownPart)];
  const words = composite.split(/\s+/);
  const remainingWords: string[] = [];

  for (const word of words) {
    const normalized = word
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '');
    const matchIndex = knownTokens.indexOf(normalized);
    if (matchIndex !== -1) {
      knownTokens.splice(matchIndex, 1);
    } else {
      remainingWords.push(word);
    }
  }

  const result = canonicalizeCompetitorName(remainingWords.join(' '));
  return result.length >= 2 ? result : null;
}

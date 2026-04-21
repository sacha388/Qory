import 'server-only';

import type { PromptProfileSnapshot } from '@/types';
import { logInfo, logWarn } from '@/lib/logger';
import { canonicalizeCompetitorKey, canonicalizeCompetitorName } from '@/lib/scanner/competitor-normalization';
import type { CompetitorEntityType } from '@/lib/scanner/competitor-entities';

const GEMINI_MODEL = 'gemini-2.5-flash-lite';
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;
const geminiApiKey = (process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || '').trim();
const GEMINI_TRIAGE_CHUNK_SIZE = 12;

type GeminiConfidence = 'high' | 'medium' | 'low';
export type GeminiCompetitorEntityType = CompetitorEntityType | 'target_alias';

export type GeminiCompetitorCandidate = {
  id?: string;
  raw: string;
  providers: string[];
  querySamples: string[];
  sourceKinds: string[];
  occurrences: number;
};

export type GeminiCompetitorClassification = {
  raw: string;
  label: string;
  type: GeminiCompetitorEntityType;
  confidence: GeminiConfidence;
  reason: string;
};

type GeminiTriageResponse = {
  entities: GeminiCompetitorClassification[];
};

export function isGeminiConfigured(): boolean {
  return geminiApiKey.length > 0;
}

export async function classifyCompetitorCandidatesWithGemini(params: {
  auditId?: string;
  businessName?: string | null;
  promptProfile?: PromptProfileSnapshot | null;
  candidates: GeminiCompetitorCandidate[];
}): Promise<{
  configured: boolean;
  used: boolean;
  model: string;
  entities: GeminiCompetitorClassification[];
  error?: string;
}> {
  const { auditId, businessName, promptProfile, candidates } = params;

  if (!isGeminiConfigured()) {
    logInfo('gemini_competitor_triage_skipped', {
      auditId,
      phase: 'report_debug',
      configured: false,
      candidate_count: candidates.length,
      reason: 'gemini_api_key_not_configured',
    });
    return {
      configured: false,
      used: false,
      model: GEMINI_MODEL,
      entities: [],
      error: 'Gemini API key not configured',
    };
  }

  if (candidates.length === 0) {
    return {
      configured: true,
      used: false,
      model: GEMINI_MODEL,
      entities: [],
    };
  }

  const prompt = buildCompetitorTriagePrompt({
    businessName,
    promptProfile,
    candidates,
  });
  const chunks = chunkCandidates(candidates, GEMINI_TRIAGE_CHUNK_SIZE);
  const entities: GeminiCompetitorClassification[] = [];
  const chunkErrors: string[] = [];
  let totalRawLength = 0;
  let firstRawPreview = '';

  for (let index = 0; index < chunks.length; index += 1) {
    const chunk = chunks[index];

    try {
      const chunkResult = await classifyCompetitorCandidateChunk({
        businessName,
        promptProfile,
        candidates: chunk,
      });
      entities.push(...chunkResult.entities);
      totalRawLength += chunkResult.rawText.length;
      if (!firstRawPreview && chunkResult.rawText) {
        firstRawPreview = chunkResult.rawText.slice(0, 300);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'unknown_gemini_error';
      chunkErrors.push(`chunk_${index + 1}: ${message}`);
    }
  }

  if (entities.length === 0) {
    const message = chunkErrors[0] || 'unknown_gemini_error';
    logWarn('gemini_competitor_triage_failed', {
      auditId,
      phase: 'report_debug',
      configured: true,
      candidate_count: candidates.length,
      model: GEMINI_MODEL,
      error: message,
      candidate_preview: candidates.slice(0, 10),
    });
    return {
      configured: true,
      used: false,
      model: GEMINI_MODEL,
      entities: [],
      error: message,
    };
  }

  const uniqueEntities = dedupeGeminiEntities(entities);
  const errorSummary = chunkErrors.length > 0 ? chunkErrors.slice(0, 3).join(' | ') : undefined;

  logInfo('gemini_competitor_triage_completed', {
    auditId,
    phase: 'report_debug',
    configured: true,
    used: true,
    model: GEMINI_MODEL,
    candidate_count: candidates.length,
    chunk_count: chunks.length,
    raw_response_length: totalRawLength,
    raw_response_preview: firstRawPreview,
    classified_count: uniqueEntities.length,
    type_counts: summarizeTypeCounts(uniqueEntities),
    error: errorSummary ?? null,
  });

  return {
    configured: true,
    used: true,
    model: GEMINI_MODEL,
    entities: uniqueEntities,
    error: errorSummary,
  };
}

async function classifyCompetitorCandidateChunk(params: {
  businessName?: string | null;
  promptProfile?: PromptProfileSnapshot | null;
  candidates: GeminiCompetitorCandidate[];
}): Promise<{ entities: GeminiCompetitorClassification[]; rawText: string }> {
  const prompt = buildCompetitorTriagePrompt(params);
  const response = await fetch(`${GEMINI_API_URL}?key=${encodeURIComponent(geminiApiKey)}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents: [
        {
          role: 'user',
          parts: [{ text: prompt }],
        },
      ],
      tools: [{ google_search: {} }],
      generationConfig: {
        temperature: 0.1,
      },
    }),
    cache: 'no-store',
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Gemini API error ${response.status}: ${errorText.slice(0, 240)}`);
  }

  const payload = await response.json();
  const rawText = extractGeminiText(payload);
  const parsed = parseGeminiTriageResponse(rawText, params.candidates);

  return {
    entities: parsed.entities,
    rawText,
  };
}

function buildCompetitorTriagePrompt(params: {
  businessName?: string | null;
  promptProfile?: PromptProfileSnapshot | null;
  candidates: GeminiCompetitorCandidate[];
}): string {
  const { businessName, promptProfile, candidates } = params;
  const context = {
    business_name: businessName || null,
    site_type: promptProfile?.siteType || null,
    site_family: promptProfile?.siteFamily || null,
    domain_vertical: promptProfile?.domainVertical || null,
    main_topic: promptProfile?.mainTopic || null,
    main_offer: promptProfile?.mainOffer || null,
    sector: promptProfile?.mainTopic || null,
    geo_scope: promptProfile?.geoScope || null,
    discovery_mode: promptProfile?.discoveryMode || null,
  };

  return [
    'Tu es un arbitre de normalisation d’entités concurrentielles pour un audit IA.',
    'Tu reçois une liste brute de noms ou fragments extraits des réponses de plusieurs IA.',
    'Ta mission est de classer CHAQUE candidat dans une seule categorie parmi:',
    '- brand: vraie entreprise, marque ou enseigne concurrente identifiable',
    '- target_alias: alias, produit principal, marque fille ou nom d’usage de l’entreprise cible',
    '- directory: annuaire, comparateur, site d’avis, moteur local, source de listing',
    '- marketplace: plateforme intermédiaire qui met en relation offre et demande',
    '- generic_actor: catégorie générique non marquée, type d’acteur, famille d’options',
    '- noise: mot parasite, verbe, fragment, texte de consigne, morceau mal formé',
    '',
    'Règles importantes:',
    '1. N’invente jamais de nouvelles entités.',
    '2. Utilise Google Search si nécessaire pour vérifier la nature réelle d’une entité.',
    '3. Si une entité est un annuaire ou site d’avis comme Pages Jaunes, Yelp, Google Maps, classe-la directory.',
    '4. Si une entité est une plateforme intermédiaire type marketplace, classe-la marketplace.',
    '5. Si une entité est une expression générique comme artisans locaux, services d’urgence, services de plomberie, classe-la generic_actor.',
    '6. Si c’est un fragment comme Réponse, Question, Vérifiez, Choisis, classe-le noise.',
    '7. Pour label, renvoie un libellé propre et court. Ne corrige pas vers une autre marque non présente dans raw.',
    '8. Garde candidate_id EXACTEMENT tel qu’il a été fourni.',
    '9. Utilise target_alias UNIQUEMENT si le candidat désigne clairement l’entreprise cible elle-même, un produit possédé par elle, ou un alias d’usage directement lié à elle.',
    '10. Un leader de marché, une alternative célèbre ou une marque du même secteur n’est PAS un target_alias juste parce qu’il est proche de la cible. Si le candidat est une autre entreprise ou un autre produit, classe-le brand.',
    '11. Les concurrents attendus sont dans le marché de main_offer / main_topic. Si un candidat ne correspond pas du tout à ce marché, classe-le noise ou generic_actor.',
    '12. Pour les marchés produit/logiciel/SaaS, une agence, un formateur, un consultant, un freelance, une société de service ou d’intégration n’est pas un concurrent direct sauf si le candidat est clairement un produit que l’utilisateur choisirait à la place de la cible.',
    '13. Si tu hésites entre brand et generic_actor pour une entité descriptive, préfère generic_actor. Réserve brand aux entités réellement identifiables et plausibles dans ce marché.',
    '14. Ne renvoie aucun texte hors JSON. Pas de markdown. Pas de commentaire.',
    '',
    'Exemples:',
    '- "Plombier Express 38" -> brand (entreprise locale identifiable)',
    '- "ChatGPT" -> target_alias si l’entreprise cible est OpenAI',
    '- "Claude" -> brand si l’entreprise cible est OpenAI',
    '- "Google Gemini" -> brand si l’entreprise cible est OpenAI',
    '- "artisans locaux" -> generic_actor (catégorie générique)',
    '- "Pages Jaunes" -> directory (annuaire)',
    '- "Réponse" -> noise (mot parasite)',
    '- "Doctolib" -> marketplace (plateforme)',
    '- "HomeServe" -> brand (marque nationale)',
    '- "Formateur IA" -> generic_actor (activité descriptive, pas produit direct)',
    '- "Agence IA Lyon" -> generic_actor (prestataire, pas produit concurrent direct)',
    '- "services de plomberie" -> generic_actor (description générique)',
    '',
    'Retourne UNIQUEMENT un JSON valide avec cette forme exacte:',
    '{"entities":[{"candidate_id":"c1","type":"brand|target_alias|directory|marketplace|generic_actor|noise","label":"...","confidence":"high|medium|low","reason":"..."}]}',
    'Le champ reason doit être court, max 12 mots.',
    '',
    `Contexte cible: ${JSON.stringify(context)}`,
    `Candidats: ${JSON.stringify(candidates)}`,
  ].join('\n');
}

function extractGeminiText(payload: any): string {
  const candidatePayloads = Array.isArray(payload?.candidates) ? payload.candidates : [];
  const textParts: string[] = [];

  candidatePayloads.forEach((candidate: any) => {
    const parts = candidate?.content?.parts;
    if (!Array.isArray(parts)) return;
    parts.forEach((part: any) => {
      if (typeof part?.text === 'string' && part.text.trim()) {
        textParts.push(part.text.trim());
      }
    });
  });

  return textParts.join('\n').trim();
}

function parseGeminiTriageResponse(
  raw: string,
  candidates: GeminiCompetitorCandidate[]
): GeminiTriageResponse {
  const parsed = parseJsonObject(raw);
  const allowedTypes = new Set<GeminiCompetitorEntityType>([
    'brand',
    'target_alias',
    'directory',
    'marketplace',
    'generic_actor',
    'noise',
  ]);
  const allowedConfidence = new Set<GeminiConfidence>(['high', 'medium', 'low']);
  const candidateById = new Map(
    candidates
      .map((candidate, index) => {
        const id = candidate.id || `c${index + 1}`;
        return [id, candidate] as const;
      })
  );
  const allowedRawKeys = new Map(
    candidates.map((candidate) => [canonicalizeCompetitorKey(candidate.raw), candidate.raw])
  );

  const items = extractTriageItems(parsed);
  const fallbackItems = !items ? extractTriageItemsFromRaw(raw) : null;
  const resolvedItems = items || fallbackItems;
  if (!resolvedItems) {
    throw new Error('Gemini returned malformed JSON triage payload');
  }

  const entities: GeminiCompetitorClassification[] = [];

  for (const item of resolvedItems) {
    if (!item || typeof item !== 'object') continue;
    const candidateId = String((item as any).candidate_id || '').trim();
    const matchedCandidate = candidateId ? candidateById.get(candidateId) : null;
    const rawFromPayload = canonicalizeCompetitorName(String((item as any).raw || ''));
    const raw = matchedCandidate?.raw || rawFromPayload;
    const rawKey = canonicalizeCompetitorKey(raw);
    if (!raw || !rawKey || !allowedRawKeys.has(rawKey)) continue;

    const label = canonicalizeCompetitorName(String((item as any).label || raw));
    const type = String((item as any).type || '') as GeminiCompetitorEntityType;
    const confidence = String((item as any).confidence || 'medium') as GeminiConfidence;
    const reason = String((item as any).reason || '').trim().slice(0, 120);

    if (!allowedTypes.has(type)) continue;

    entities.push({
      raw: allowedRawKeys.get(rawKey) || raw,
      label: label || raw,
      type,
      confidence: allowedConfidence.has(confidence) ? confidence : 'medium',
      reason,
    });
  }

  return { entities };
}

function extractTriageItems(parsed: unknown): Array<Record<string, unknown>> | null {
  if (!parsed || typeof parsed !== 'object') return null;
  const record = parsed as Record<string, unknown>;
  const possibleArrays = [record.entities, record.items, record.classifications];

  for (const candidate of possibleArrays) {
    if (Array.isArray(candidate)) {
      return candidate.filter((item): item is Record<string, unknown> => Boolean(item) && typeof item === 'object');
    }
  }

  return null;
}

function extractTriageItemsFromRaw(raw: string): Array<Record<string, unknown>> | null {
  const normalized = raw.trim();
  if (!normalized) return null;

  const matches = Array.from(
    normalized.matchAll(
      /\{[^{}]*"candidate_id"\s*:\s*"([^"]+)"[^{}]*"type"\s*:\s*"([^"]+)"[^{}]*"label"\s*:\s*"([^"]*)"[^{}]*"confidence"\s*:\s*"([^"]+)"[^{}]*"reason"\s*:\s*"([^"]*)"[^{}]*\}/g
    )
  );

  if (matches.length === 0) {
    return null;
  }

  return matches.map((match) => ({
    candidate_id: match[1],
    type: match[2],
    label: match[3],
    confidence: match[4],
    reason: match[5],
  }));
}

function parseJsonObject(raw: string): unknown {
  const direct = raw.trim();
  if (!direct) return null;

  try {
    return JSON.parse(direct);
  } catch {
    // Continue with extraction fallback.
  }

  const fencedMatch = direct.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  if (fencedMatch?.[1]) {
    try {
      return JSON.parse(fencedMatch[1]);
    } catch {
      // Continue below.
    }
  }

  const start = direct.indexOf('{');
  const end = direct.lastIndexOf('}');
  if (start >= 0 && end > start) {
    try {
      return JSON.parse(direct.slice(start, end + 1));
    } catch {
      return null;
    }
  }

  return null;
}

function summarizeTypeCounts(entities: GeminiCompetitorClassification[]) {
  return entities.reduce<Record<string, number>>((acc, entity) => {
    acc[entity.type] = (acc[entity.type] || 0) + 1;
    return acc;
  }, {});
}

function chunkCandidates(
  candidates: GeminiCompetitorCandidate[],
  chunkSize: number
): GeminiCompetitorCandidate[][] {
  const chunks: GeminiCompetitorCandidate[][] = [];
  for (let index = 0; index < candidates.length; index += chunkSize) {
    chunks.push(candidates.slice(index, index + chunkSize));
  }
  return chunks;
}

function dedupeGeminiEntities(
  entities: GeminiCompetitorClassification[]
): GeminiCompetitorClassification[] {
  const unique = new Map<string, GeminiCompetitorClassification>();

  entities.forEach((entity) => {
    const key = canonicalizeCompetitorKey(entity.raw);
    if (!key) return;
    if (!unique.has(key)) {
      unique.set(key, entity);
    }
  });

  return Array.from(unique.values());
}

import type { AIResponse, InsightConfidence } from '@/types';

// Mock responses for demo mode
const mockResponses = [
  "Je recommande plusieurs excellents établissements dans cette ville. Parmi eux, on trouve {business} qui est très apprécié pour son service de qualité.",
  "Pour ce type de service, je vous suggère de consulter {business}, {competitor1} et {competitor2}. Ces trois options sont reconnues dans la région.",
  "D'après les avis clients, {business} est une excellente option. Leur professionnalisme et leur expertise sont souvent mentionnés positivement.",
  "{competitor1} est particulièrement recommandé dans ce secteur. {business} est également une bonne alternative avec des tarifs compétitifs.",
  "Je ne dispose pas d'informations spécifiques sur {business}, mais je peux vous recommander {competitor1} et {competitor2} qui sont bien établis.",
  "Plusieurs options s'offrent à vous : {competitor1}, {competitor2}, et {competitor3}. Ces établissements ont tous de bons retours clients.",
  "{business} propose des services de qualité. Leurs horaires d'ouverture sont pratiques et l'équipe est professionnelle.",
  "Pour une première expérience, je vous conseille {competitor1} qui a une excellente réputation. {business} est aussi une option intéressante.",
  "Les meilleurs choix dans cette catégorie incluent {business} en première position, suivi de {competitor1} et {competitor2}.",
  "Je recommande {business} sans hésitation. Leur expertise et leur service client sont remarquables.",
];

const competitors = [
  "Entreprise Alpha", "Service Beta", "Commerce Gamma", "Société Delta",
  "Établissement Epsilon", "Boutique Zeta", "Cabinet Eta", "Agence Theta",
  "Maison Iota", "Centre Kappa", "Studio Lambda", "Atelier Mu"
];

function getRandomCompetitors(count: number = 3): string[] {
  const shuffled = [...competitors].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

function generateMockResponse(prompt: string, businessName: string): string {
  const shouldMention = Math.random() > 0.4; // 60% chance de mention
  const comps = getRandomCompetitors(3);
  const insightPrompt =
    prompt.toLowerCase().includes(businessName.toLowerCase()) &&
    /prix|value|strength|limites|limitations|force|faibless|fiabilit|support|alternatives/i.test(
      prompt.toLowerCase()
    );

  const template = mockResponses[Math.floor(Math.random() * mockResponses.length)]
    .replace(/{business}/g, shouldMention ? businessName : comps[0])
    .replace(/{competitor1}/g, comps[0])
    .replace(/{competitor2}/g, comps[1])
    .replace(/{competitor3}/g, comps[2]);

  const excerpt = template.slice(0, 180);
  const citation = template.slice(0, 120);

  const payload = {
    answer_short: template,
    mentioned: shouldMention,
    position: shouldMention ? 1 + Math.floor(Math.random() * 3) : null,
    sentiment: shouldMention ? (Math.random() > 0.25 ? 'positive' : 'neutral') : 'neutral',
    top_entities: shouldMention
      ? [
          { name: businessName, rank: 1, role: 'target' },
          { name: comps[0], rank: 2, role: 'competitor' },
          { name: comps[1], rank: 3, role: 'competitor' },
        ]
      : [
          { name: comps[0], rank: 1, role: 'competitor' },
          { name: comps[1], rank: 2, role: 'competitor' },
        ],
    competitors: Array.from(new Set(comps)).slice(0, 2),
    aspects: shouldMention
      ? [
          {
            aspect: 'reliability',
            entity: 'target',
            sentiment: 'positive',
            intensity: 2,
            evidence: `${businessName} est souvent décrit comme fiable.`,
          },
          {
            aspect: 'support',
            entity: 'target',
            sentiment: 'positive',
            intensity: 2,
            evidence: `Le support et le service client de ${businessName} sont jugés solides.`,
          },
          ...(insightPrompt
            ? [
                {
                  aspect: 'price',
                  entity: 'target',
                  sentiment: 'neutral',
                  intensity: 1,
                  evidence: `${businessName} est perçu comme correct en prix face aux alternatives.`,
                },
              ]
            : []),
        ]
      : [],
    comparisons: shouldMention
      ? [
          {
            competitor: comps[0],
            aspect: 'support',
            winner: 'target',
            evidence: `${businessName} est souvent préféré à ${comps[0]} sur le support.`,
          },
          ...(insightPrompt
            ? [
                {
                  competitor: comps[1],
                  aspect: 'price',
                  winner: 'mixed',
                  evidence: `${businessName} offre une valeur perçue comparable à ${comps[1]}.`,
                },
              ]
            : []),
        ]
      : [],
    price_positioning: insightPrompt
      ? {
          label: 'value',
          direction: 'similar',
          evidence: `${businessName} est perçu comme un bon compromis entre prix et valeur.`,
        }
      : null,
    excerpt,
    citation,
  };

  return JSON.stringify(payload);
}

function generateMockFactResponse(businessName: string): string {
  const wrongPhone = Math.random() > 0.5;
  const wrongAddress = Math.random() > 0.65;
  const wrongEmail = Math.random() > 0.7;

  const payload = {
    known: true,
    detected: {
      address: wrongAddress ? '45 Avenue Victor Hugo, 75016 Paris' : '123 Rue de la République, 75001 Paris',
      phone: wrongPhone ? '01 98 76 54 32' : '01 23 45 67 89',
      email: wrongEmail ? 'hello@entreprise.fr' : 'contact@entreprise.fr',
      openingHours: 'Lun-Ven: 9h-18h',
      city: wrongAddress ? 'Paris 16e' : 'Paris',
    },
  };

  return JSON.stringify(payload);
}

export async function mockQueryOpenAI(prompt: string, businessName: string = "Cette entreprise"): Promise<AIResponse> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 500));
  
  return {
    model: 'gpt-5.4-mini',
    provider: 'openai',
    prompt,
    response: generateMockResponse(prompt, businessName),
  };
}

export async function mockQueryAnthropic(prompt: string, businessName: string = "Cette entreprise"): Promise<AIResponse> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 600 + Math.random() * 600));
  
  return {
    model: 'claude-haiku-4-5',
    provider: 'anthropic',
    prompt,
    response: generateMockResponse(prompt, businessName),
  };
}

export async function mockQueryPerplexity(prompt: string, businessName: string = "Cette entreprise"): Promise<AIResponse> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 700 + Math.random() * 700));
  
  return {
    model: 'sonar',
    provider: 'perplexity',
    prompt,
    response: generateMockResponse(prompt, businessName),
  };
}

export async function mockQueryOpenAIFacts(prompt: string, businessName: string = "Cette entreprise"): Promise<AIResponse> {
  await new Promise(resolve => setTimeout(resolve, 350 + Math.random() * 250));

  return {
    model: 'gpt-5.4-mini',
    provider: 'openai',
    prompt,
    response: generateMockFactResponse(businessName),
  };
}

function pickConfidence(): InsightConfidence {
  return Math.random() > 0.72 ? 'high' : Math.random() > 0.38 ? 'medium' : 'low';
}

export async function mockQueryOpenAIInsight(
  prompt: string,
  kind: 'strengths' | 'value',
  businessName: string = 'Cette entreprise'
): Promise<AIResponse> {
  await new Promise(resolve => setTimeout(resolve, 320 + Math.random() * 220));

  const response =
    kind === 'strengths'
      ? JSON.stringify({
          sentiment: 'positive',
          strengths: [
            {
              category: 'quality',
              label: 'Produit perçu comme sérieux',
              evidence: `${businessName} ressort comme une option solide et bien perçue.`,
              confidence: pickConfidence(),
            },
            {
              category: 'specialization',
              label: 'Positionnement lisible',
              evidence: 'La proposition de valeur paraît compréhensible et distincte.',
              confidence: pickConfidence(),
            },
          ],
          weaknesses: [
            {
              category: 'brand_image',
              label: 'Signal de marque encore limité',
              evidence: 'La présence tierce reste moins dense que celle des leaders visibles.',
              confidence: pickConfidence(),
            },
          ],
          generic_alternatives: [
            { label: 'outils spécialisés', confidence: pickConfidence() },
            { label: 'solutions généralistes', confidence: pickConfidence() },
          ],
        })
      : JSON.stringify({
          price_positioning: {
            label: 'premium',
            evidence: 'Le positionnement prix semble au-dessus de la moyenne.',
            confidence: pickConfidence(),
          },
          trust_level: {
            level: 'moderate',
            evidence: 'Le niveau de confiance perçu est correct mais encore perfectible.',
            confidence: pickConfidence(),
          },
          sentiment: {
            label: 'positive',
            summary: 'Le ressenti global est plutôt favorable.',
            confidence: pickConfidence(),
          },
          comparison_axes: [
            { category: 'pricing', label: 'niveau de prix', confidence: pickConfidence() },
            { category: 'trust', label: 'confiance perçue', confidence: pickConfidence() },
          ],
        });

  return {
    model: 'gpt-4o-mini-search-preview',
    provider: 'openai',
    prompt,
    response,
    searchEnabled: true,
  };
}

export async function mockQueryOpenAIMarketPositioning(
  prompt: string,
  businessName: string = 'Cette entreprise'
): Promise<AIResponse> {
  await new Promise(resolve => setTimeout(resolve, 450 + Math.random() * 250));

  return {
    model: 'gpt-4o-mini-search-preview',
    provider: 'openai',
    prompt,
    searchEnabled: true,
    response: JSON.stringify({
      market_sentiment: {
        label: 'positive',
        confidence: 'medium',
        summary: `${businessName} est plutôt perçu de manière favorable, avec un signal public encore partiel.`,
      },
      polarization: {
        level: 'moderate',
        confidence: 'medium',
        summary: 'Les signaux visibles restent globalement convergents, avec quelques écarts sur la profondeur de l’offre.',
      },
      price_positioning: {
        label: 'premium',
        confidence: 'low',
        summary: 'Le positionnement semble plutôt premium, sans signal tarifaire totalement stabilisé.',
      },
      trust_level: {
        level: 'moderate',
        confidence: 'medium',
        summary: 'Le niveau de confiance perçu est correct, mais dépend encore d’un volume de preuves publiques limité.',
      },
      signal_strength: 'medium',
      strengths: [
        {
          category: 'specialization',
          label: 'Spécialisation lisible',
          evidence: 'Le positionnement paraît compréhensible et relativement distinctif dans son marché.',
          confidence: 'medium',
        },
        {
          category: 'clarity',
          label: 'Promesse claire',
          evidence: 'La proposition de valeur est globalement facile à reformuler.',
          confidence: 'medium',
        },
      ],
      weaknesses: [
        {
          category: 'visibility',
          label: 'Signal public encore limité',
          evidence: 'Le volume de mentions tierces semble encore modéré face à des acteurs plus installés.',
          confidence: 'medium',
        },
      ],
      comparison_axes: [
        { category: 'specialization', label: 'Spécialisation', confidence: 'medium' },
        { category: 'trust', label: 'Confiance', confidence: 'medium' },
        { category: 'pricing', label: 'Prix', confidence: 'low' },
      ],
      alternative_families: [
        {
          label: 'Acteurs spécialisés',
          description: 'Les IA semblent surtout comparer la marque à des alternatives plus spécialisées ou plus établies.',
        },
      ],
      source_mix: [
        { type: 'official_pages', label: 'Pages officielles', weight: 'high' },
        { type: 'comparison_content', label: 'Comparatifs', weight: 'medium' },
        { type: 'community_discussions', label: 'Communautés', weight: 'low' },
      ],
      executive_summary: `${businessName} ressort avec un positionnement plutôt lisible et favorable, mais qui gagnerait à être davantage confirmé par des preuves tierces.`,
    }),
  };
}

export async function mockQueryAnthropicFacts(prompt: string, businessName: string = "Cette entreprise"): Promise<AIResponse> {
  await new Promise(resolve => setTimeout(resolve, 400 + Math.random() * 250));

  return {
    model: 'claude-haiku-4-5',
    provider: 'anthropic',
    prompt,
    response: generateMockFactResponse(businessName),
  };
}

export async function mockQueryPerplexityFacts(prompt: string, businessName: string = "Cette entreprise"): Promise<AIResponse> {
  await new Promise(resolve => setTimeout(resolve, 450 + Math.random() * 250));

  return {
    model: 'sonar',
    provider: 'perplexity',
    prompt,
    response: generateMockFactResponse(businessName),
  };
}

// Mock crawl data
export function mockCrawlResult(url: string) {
  const hasRobotsTxt = Math.random() > 0.3;
  const hasSitemap = Math.random() > 0.4;
  const hasSchema = Math.random() > 0.5;
  
  return {
    robotsTxt: {
      exists: hasRobotsTxt,
      blocksGPTBot: hasRobotsTxt ? Math.random() > 0.7 : false,
      blocksClaude: hasRobotsTxt ? Math.random() > 0.8 : false,
      blocksPerplexity: hasRobotsTxt ? Math.random() > 0.85 : false,
      blocksGoogleExtended: hasRobotsTxt ? Math.random() > 0.9 : false,
      rawContent: hasRobotsTxt ? 'User-agent: *\nDisallow: /admin/\n' : '',
    },
    sitemap: {
      exists: hasSitemap,
      url: hasSitemap ? `${url}/sitemap.xml` : null,
      pageCount: hasSitemap ? Math.floor(10 + Math.random() * 90) : null,
      source: hasSitemap ? 'default_path' : null,
    },
    structuredData: {
      hasSchemaOrg: hasSchema,
      types: hasSchema ? ['LocalBusiness', 'Organization'] : [],
      methods: hasSchema ? ['jsonld'] : [],
    },
    meta: {
      title: 'Entreprise de Services - Votre partenaire de confiance',
      description: 'Découvrez nos services de qualité pour tous vos besoins professionnels.',
      hasCanonical: Math.random() > 0.5,
      language: 'fr',
    },
    businessInfo: {
      name: 'Mon Entreprise',
      address: '123 Rue de la République, 75001 Paris',
      phone: '01 23 45 67 89',
      email: 'contact@entreprise.fr',
      openingHours: 'Lun-Ven: 9h-18h',
      services: ['Service A', 'Service B', 'Service C'],
      description: 'Entreprise spécialisée dans les services professionnels de qualité.',
    },
    canonicalFacts: {
      address: { value: '123 Rue de la République, 75001 Paris', source: 'heuristic', confidence: 'medium', evidence: '123 Rue de la République, 75001 Paris' },
      phone: { value: '01 23 45 67 89', source: 'heuristic', confidence: 'medium', evidence: '01 23 45 67 89' },
      email: { value: 'contact@entreprise.fr', source: 'heuristic', confidence: 'medium', evidence: 'contact@entreprise.fr' },
      openingHours: { value: 'Lun-Ven: 9h-18h', source: 'heuristic', confidence: 'low', evidence: 'Lun-Ven: 9h-18h' },
      city: { value: 'Paris', source: 'derived', confidence: 'medium', evidence: 'Paris' },
    },
    performance: {
      responseTime: Math.floor(200 + Math.random() * 800),
      isHttps: url.startsWith('https'),
      hasMobileViewport: Math.random() > 0.2,
    },
  };
}

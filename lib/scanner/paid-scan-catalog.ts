import type {
  AuditScanContext,
  AuditUserContext,
  PaidScanBusinessType,
  PaidScanGeoMode,
  PaidScanPromptFamily,
  PromptProfileSnapshot,
} from '@/types';

export type PaidScanQuestionnaireInput = AuditUserContext;

export type ActivityCatalogEntry = {
  id: string;
  type: PaidScanBusinessType;
  label: string;
  geoMode: PaidScanGeoMode;
  cityMode: PaidScanGeoMode;
  promptFamily: PaidScanPromptFamily;
  discoveryMode: 'local_places' | 'digital_crawl';
  siteTypeHint: PromptProfileSnapshot['siteType'];
  domainVerticalHint: PromptProfileSnapshot['domainVertical'] | null;
  actorSingular: string;
  actorPlural: string;
  detailLabel: string;
  detailPrefix: string;
  detailExample: string;
  detailQualifiedActorSingular: string;
  detailQualifiedActorPlural: string;
};

export type PaidScanTypeOption = {
  id: PaidScanBusinessType;
  label: string;
  description: string;
  icon: string;
};

type ActivitySeed = {
  id: string;
  label: string;
  actorSingular: string;
  actorPlural: string;
  domainVerticalHint: PromptProfileSnapshot['domainVertical'] | null;
  siteTypeHint?: PromptProfileSnapshot['siteType'];
};

type TypeConfig = {
  promptFamily: PaidScanPromptFamily;
  geoMode: PaidScanGeoMode;
  discoveryMode: 'local_places' | 'digital_crawl';
  siteTypeHint: PromptProfileSnapshot['siteType'];
};

type ActivityDetailConfig = {
  label: string;
  prefix: string;
  example: string;
  singularTemplate: string;
  pluralTemplate: string;
};

const TYPE_CONFIG: Record<PaidScanBusinessType, TypeConfig> = {
  commerce_restauration: {
    promptFamily: 'local_service',
    geoMode: 'required',
    discoveryMode: 'local_places',
    siteTypeHint: 'local_service',
  },
  prestataire_local: {
    promptFamily: 'local_service',
    geoMode: 'required',
    discoveryMode: 'local_places',
    siteTypeHint: 'local_service',
  },
  agence_studio: {
    promptFamily: 'agency_service',
    geoMode: 'optional',
    discoveryMode: 'digital_crawl',
    siteTypeHint: 'brand_site',
  },
  saas_application: {
    promptFamily: 'software_tool',
    geoMode: 'forbidden',
    discoveryMode: 'digital_crawl',
    siteTypeHint: 'saas',
  },
  ia_assistants: {
    promptFamily: 'ai_tool',
    geoMode: 'forbidden',
    discoveryMode: 'digital_crawl',
    siteTypeHint: 'ai_native',
  },
  plateforme_annuaire: {
    promptFamily: 'platform',
    geoMode: 'forbidden',
    discoveryMode: 'digital_crawl',
    siteTypeHint: 'marketplace',
  },
  ecommerce: {
    promptFamily: 'ecommerce_shop',
    geoMode: 'forbidden',
    discoveryMode: 'digital_crawl',
    siteTypeHint: 'ecommerce',
  },
  etablissement_institution: {
    promptFamily: 'institutional_actor',
    geoMode: 'optional',
    discoveryMode: 'digital_crawl',
    siteTypeHint: 'public_service_nonprofit',
  },
};

function createActivityDetailConfig(params: ActivityDetailConfig): ActivityDetailConfig {
  return params;
}

function resolveActivityCityMode(
  type: PaidScanBusinessType,
  activityId: string,
  defaultMode: PaidScanGeoMode
): PaidScanGeoMode {
  switch (type) {
    case 'plateforme_annuaire':
      if (activityId === 'annuaire_local') return 'required';
      if (
        [
          'marketplace_services',
          'plateforme_mise_en_relation',
          'plateforme_experts_freelances',
          'plateforme_emploi_recrutement',
          'plateforme_reservation',
          'plateforme_avis_recommandations',
          'autre_plateforme_specialisee',
          'annuaire_b2b_professionnels',
        ].includes(activityId)
      ) {
        return 'optional';
      }
      return 'forbidden';
    case 'etablissement_institution':
      if (
        ['organisme_public_service_administratif', 'institution_culturelle', 'organisme_sante'].includes(
          activityId
        )
      ) {
        return 'required';
      }
      if (activityId === 'media_publication_information') {
        return 'forbidden';
      }
      return defaultMode;
    case 'agence_studio':
      if (activityId === 'recrutement_rh') return 'forbidden';
      return defaultMode;
    default:
      return defaultMode;
  }
}

function resolveActivityDetailConfig(seed: ActivitySeed, type: PaidScanBusinessType): ActivityDetailConfig {
  switch (type) {
    case 'commerce_restauration':
      switch (seed.id) {
        case 'restaurant':
          return createActivityDetailConfig({
            label: 'Votre cuisine',
            prefix: 'Restaurant de cuisine',
            example: 'italienne',
            singularTemplate: 'restaurant de cuisine',
            pluralTemplate: 'restaurants de cuisine',
          });
        case 'bar_cafe':
          return createActivityDetailConfig({
            label: 'Votre concept',
            prefix: 'Bar-cafe avec',
            example: 'brunch maison',
            singularTemplate: 'bar-cafe avec',
            pluralTemplate: 'bars-cafes avec',
          });
        case 'boulangerie_patisserie':
          return createActivityDetailConfig({
            label: 'Votre spécialité',
            prefix: 'Boulangerie-patisserie specialisee en',
            example: 'patisserie fine',
            singularTemplate: 'boulangerie-patisserie specialisee en',
            pluralTemplate: 'boulangeries-patisseries specialisees en',
          });
        case 'traiteur_epicerie_fine':
          return createActivityDetailConfig({
            label: 'Votre spécialité',
            prefix: 'Traiteur specialise en',
            example: 'cocktails dinatoires',
            singularTemplate: 'traiteur specialise en',
            pluralTemplate: 'traiteurs specialises en',
          });
        case 'commerce_alimentaire':
          return createActivityDetailConfig({
            label: 'Votre spécialité',
            prefix: 'Commerce alimentaire specialise dans',
            example: 'produits bio',
            singularTemplate: 'commerce alimentaire specialise dans',
            pluralTemplate: 'commerces alimentaires specialises dans',
          });
        case 'boutique_mode_accessoires':
          return createActivityDetailConfig({
            label: 'Votre univers',
            prefix: 'Boutique de',
            example: 'mode femme premium',
            singularTemplate: 'boutique de',
            pluralTemplate: 'boutiques de',
          });
        case 'boutique_maison_deco_cadeaux':
          return createActivityDetailConfig({
            label: 'Votre univers',
            prefix: 'Boutique de',
            example: 'decoration artisanale',
            singularTemplate: 'boutique de',
            pluralTemplate: 'boutiques de',
          });
        case 'fleuriste_concept_store':
          return createActivityDetailConfig({
            label: 'Votre univers',
            prefix: 'Concept store de',
            example: 'fleurs sechees et deco',
            singularTemplate: 'concept store de',
            pluralTemplate: 'concept stores de',
          });
        case 'hotel_hebergement_independant':
          return createActivityDetailConfig({
            label: 'Votre positionnement',
            prefix: 'Hebergement avec',
            example: 'spa',
            singularTemplate: 'hebergement avec',
            pluralTemplate: 'hebergements avec',
          });
        case 'loisirs_sorties_activites_locales':
          return createActivityDetailConfig({
            label: 'Votre activité',
            prefix: 'Activite de type',
            example: 'escape game',
            singularTemplate: 'activite de type',
            pluralTemplate: 'activites de type',
          });
        default:
          return createActivityDetailConfig({
            label: 'Votre spécialité',
            prefix: 'Commerce specialise dans',
            example: seed.id === 'autre_commerce_restauration' ? 'produits artisanaux' : 'produits italiens',
            singularTemplate: 'commerce specialise dans',
            pluralTemplate: 'commerces specialises dans',
          });
      }
    case 'prestataire_local':
      switch (seed.id) {
        case 'service_local_general':
          return createActivityDetailConfig({
            label: 'Votre service',
            prefix: 'Prestataire specialise en',
            example: 'conciergerie',
            singularTemplate: 'prestataire specialise en',
            pluralTemplate: 'prestataires specialises en',
          });
        case 'artisan_travaux_renovation':
          return createActivityDetailConfig({
            label: 'Votre spécialité',
            prefix: 'Artisan specialise en',
            example: 'renovation energetique',
            singularTemplate: 'artisan specialise en',
            pluralTemplate: 'artisans specialises en',
          });
        case 'depannage_reparation':
          return createActivityDetailConfig({
            label: 'Votre spécialité',
            prefix: 'Professionnel specialise en',
            example: 'serrurerie urgente',
            singularTemplate: 'professionnel specialise en',
            pluralTemplate: 'professionnels specialises en',
          });
        case 'immobilier':
          return createActivityDetailConfig({
            label: 'Votre spécialité',
            prefix: 'Immobilier specialise en',
            example: 'gestion locative',
            singularTemplate: "professionnel de l'immobilier specialise en",
            pluralTemplate: "professionnels de l'immobilier specialises en",
          });
        case 'sante_soins':
          return createActivityDetailConfig({
            label: 'Votre spécialité',
            prefix: 'Sante specialisee en',
            example: 'orthodontie',
            singularTemplate: 'professionnel de sante specialise en',
            pluralTemplate: 'professionnels de sante specialises en',
          });
        case 'bien_etre_esthetique':
          return createActivityDetailConfig({
            label: 'Votre spécialité',
            prefix: 'Praticien specialise en',
            example: 'epilation laser',
            singularTemplate: 'praticien specialise en',
            pluralTemplate: 'praticiens specialises en',
          });
        case 'sport_coaching':
          return createActivityDetailConfig({
            label: 'Votre spécialité',
            prefix: 'Coach specialise en',
            example: 'perte de poids',
            singularTemplate: 'coach specialise en',
            pluralTemplate: 'coachs specialises en',
          });
        case 'avocat_cabinet_juridique':
          return createActivityDetailConfig({
            label: 'Votre spécialité',
            prefix: 'Avocat specialise en',
            example: 'droit des etrangers',
            singularTemplate: 'avocat specialise en',
            pluralTemplate: 'avocats specialises en',
          });
        case 'expert_comptable_gestion':
          return createActivityDetailConfig({
            label: 'Votre spécialité',
            prefix: 'Expert-comptable specialise en',
            example: 'LMNP',
            singularTemplate: 'expert-comptable specialise en',
            pluralTemplate: 'experts-comptables specialises en',
          });
        case 'services_a_domicile':
          return createActivityDetailConfig({
            label: 'Votre public',
            prefix: 'Service a domicile pour',
            example: 'personnes agees',
            singularTemplate: 'service a domicile pour',
            pluralTemplate: 'services a domicile pour',
          });
        case 'auto_mobilite_locale':
          return createActivityDetailConfig({
            label: 'Votre spécialité',
            prefix: 'Auto specialisee en',
            example: 'vehicules electriques',
            singularTemplate: 'professionnel automobile specialise en',
            pluralTemplate: 'professionnels automobiles specialises en',
          });
        case 'photographie_evenementiel':
          return createActivityDetailConfig({
            label: 'Votre spécialité',
            prefix: 'Photographe specialise en',
            example: 'mariage',
            singularTemplate: 'photographe specialise en',
            pluralTemplate: 'photographes specialises en',
          });
        default:
          return createActivityDetailConfig({
            label: 'Votre spécialité',
            prefix: 'Prestataire specialise en',
            example: 'diagnostic immobilier',
            singularTemplate: 'prestataire specialise en',
            pluralTemplate: 'prestataires specialises en',
          });
      }
    case 'agence_studio':
      switch (seed.id) {
        case 'agence_marketing_acquisition':
          return createActivityDetailConfig({
            label: 'Votre cible',
            prefix: 'Agence marketing pour',
            example: 'e-commerce',
            singularTemplate: 'agence marketing pour',
            pluralTemplate: 'agences marketing pour',
          });
        case 'agence_seo_sea':
          return createActivityDetailConfig({
            label: 'Votre cible',
            prefix: 'Agence SEO pour',
            example: "cabinets d'avocats",
            singularTemplate: 'agence SEO pour',
            pluralTemplate: 'agences SEO pour',
          });
        case 'agence_reseaux_sociaux_contenu':
          return createActivityDetailConfig({
            label: 'Votre cible',
            prefix: 'Agence social media pour',
            example: 'restaurants',
            singularTemplate: 'agence social media pour',
            pluralTemplate: 'agences social media pour',
          });
        case 'agence_web_no_code':
          return createActivityDetailConfig({
            label: 'Votre cible',
            prefix: 'Agence web pour',
            example: 'startups SaaS',
            singularTemplate: 'agence web pour',
            pluralTemplate: 'agences web pour',
          });
        case 'studio_design_branding':
          return createActivityDetailConfig({
            label: 'Votre cible',
            prefix: 'Studio de branding pour',
            example: 'marques premium',
            singularTemplate: 'studio de branding pour',
            pluralTemplate: 'studios de branding pour',
          });
        case 'production_photo_video':
          return createActivityDetailConfig({
            label: 'Votre cible',
            prefix: 'Studio photo video pour',
            example: 'immobilier',
            singularTemplate: 'studio photo video pour',
            pluralTemplate: 'studios photo video pour',
          });
        case 'conseil_strategie_b2b':
          return createActivityDetailConfig({
            label: 'Votre cible',
            prefix: 'Cabinet de conseil pour',
            example: 'PME industrielles',
            singularTemplate: 'cabinet de conseil pour',
            pluralTemplate: 'cabinets de conseil pour',
          });
        case 'recrutement_rh':
          return createActivityDetailConfig({
            label: 'Votre cible',
            prefix: 'Cabinet de recrutement pour',
            example: 'profils commerciaux',
            singularTemplate: 'cabinet de recrutement pour',
            pluralTemplate: 'cabinets de recrutement pour',
          });
        case 'data_ia_automatisation':
          return createActivityDetailConfig({
            label: 'Votre cible',
            prefix: 'Agence data IA pour',
            example: 'equipes ops',
            singularTemplate: 'agence data IA pour',
            pluralTemplate: 'agences data IA pour',
          });
        case 'developpement_produit_tech':
          return createActivityDetailConfig({
            label: 'Votre cible',
            prefix: 'Studio tech pour',
            example: 'fintech',
            singularTemplate: 'studio tech pour',
            pluralTemplate: 'studios tech pour',
          });
        case 'relations_presse_communication':
          return createActivityDetailConfig({
            label: 'Votre cible',
            prefix: 'Agence RP pour',
            example: 'scale-ups',
            singularTemplate: 'agence RP pour',
            pluralTemplate: 'agences RP pour',
          });
        case 'freelance_expert_b2b':
          return createActivityDetailConfig({
            label: 'Votre cible',
            prefix: 'Freelance expert pour',
            example: 'SaaS B2B',
            singularTemplate: 'freelance expert pour',
            pluralTemplate: 'freelances experts pour',
          });
        case 'autre_agence_studio_specialise':
          return createActivityDetailConfig({
            label: 'Votre cible',
            prefix: 'Agence specialisee pour',
            example: 'marques DTC',
            singularTemplate: 'agence specialisee pour',
            pluralTemplate: 'agences specialisees pour',
          });
        default:
          return createActivityDetailConfig({
            label: 'Votre cible',
            prefix: 'Agence pour',
            example: 'PME B2B',
            singularTemplate: 'agence pour',
            pluralTemplate: 'agences pour',
          });
      }
    case 'saas_application':
      switch (seed.id) {
        case 'crm_vente':
          return createActivityDetailConfig({
            label: 'Votre cible',
            prefix: 'Logiciel CRM pour',
            example: 'equipes commerciales',
            singularTemplate: 'logiciel CRM pour',
            pluralTemplate: 'logiciels CRM pour',
          });
        case 'marketing_automation':
          return createActivityDetailConfig({
            label: 'Votre cible',
            prefix: 'Logiciel marketing pour',
            example: 'e-commerce',
            singularTemplate: 'logiciel marketing pour',
            pluralTemplate: 'logiciels marketing pour',
          });
        case 'support_client_helpdesk':
          return createActivityDetailConfig({
            label: 'Votre cible',
            prefix: 'Logiciel support client pour',
            example: 'equipes support',
            singularTemplate: 'logiciel support client pour',
            pluralTemplate: 'logiciels support client pour',
          });
        case 'finance_comptabilite':
          return createActivityDetailConfig({
            label: 'Votre cible',
            prefix: 'Logiciel de comptabilite pour',
            example: 'cabinets comptables',
            singularTemplate: 'logiciel de comptabilite pour',
            pluralTemplate: 'logiciels de comptabilite pour',
          });
        case 'rh_paie':
          return createActivityDetailConfig({
            label: 'Votre cible',
            prefix: 'Logiciel RH pour',
            example: 'PME',
            singularTemplate: 'logiciel RH pour',
            pluralTemplate: 'logiciels RH pour',
          });
        case 'gestion_projet_productivite':
          return createActivityDetailConfig({
            label: 'Votre cible',
            prefix: 'Logiciel de gestion de projet pour',
            example: 'agences',
            singularTemplate: 'logiciel de gestion de projet pour',
            pluralTemplate: 'logiciels de gestion de projet pour',
          });
        case 'collaboration_communication':
          return createActivityDetailConfig({
            label: 'Votre cible',
            prefix: 'Logiciel de collaboration pour',
            example: 'equipes remote',
            singularTemplate: 'logiciel de collaboration pour',
            pluralTemplate: 'logiciels de collaboration pour',
          });
        case 'data_bi_analytics':
          return createActivityDetailConfig({
            label: 'Votre cible',
            prefix: 'Logiciel data pour',
            example: 'directions data',
            singularTemplate: 'logiciel data pour',
            pluralTemplate: 'logiciels data pour',
          });
        case 'it_cybersecurite':
          return createActivityDetailConfig({
            label: 'Votre cible',
            prefix: 'Logiciel cybersécurité pour',
            example: 'PME',
            singularTemplate: 'logiciel de cybersécurité pour',
            pluralTemplate: 'logiciels de cybersécurité pour',
          });
        case 'juridique_conformite':
          return createActivityDetailConfig({
            label: 'Votre cible',
            prefix: 'Logiciel conformite pour',
            example: 'DPO',
            singularTemplate: 'logiciel conformite pour',
            pluralTemplate: 'logiciels conformite pour',
          });
        case 'ecommerce_enablement':
          return createActivityDetailConfig({
            label: 'Votre cible',
            prefix: 'Logiciel e-commerce pour',
            example: 'Shopify',
            singularTemplate: 'logiciel e-commerce pour',
            pluralTemplate: 'logiciels e-commerce pour',
          });
        case 'formation_lms_knowledge_base':
          return createActivityDetailConfig({
            label: 'Votre cible',
            prefix: 'Logiciel de formation pour',
            example: 'centres de formation',
            singularTemplate: 'logiciel de formation pour',
            pluralTemplate: 'logiciels de formation pour',
          });
        case 'booking_planning_reservation':
          return createActivityDetailConfig({
            label: 'Votre cible',
            prefix: 'Logiciel de reservation pour',
            example: 'restaurants',
            singularTemplate: 'logiciel de reservation pour',
            pluralTemplate: 'logiciels de reservation pour',
          });
        case 'logiciel_metier_specialise':
          return createActivityDetailConfig({
            label: 'Votre cible',
            prefix: 'Logiciel metier pour',
            example: 'kines',
            singularTemplate: 'logiciel metier pour',
            pluralTemplate: 'logiciels metier pour',
          });
        case 'autre_logiciel_specialise':
          return createActivityDetailConfig({
            label: 'Votre cible',
            prefix: 'Logiciel specialise pour',
            example: 'garagistes',
            singularTemplate: 'logiciel specialise pour',
            pluralTemplate: 'logiciels specialises pour',
          });
        default:
          return createActivityDetailConfig({
            label: 'Votre cible',
            prefix: 'Logiciel pour',
            example: 'PME',
            singularTemplate: 'logiciel pour',
            pluralTemplate: 'logiciels pour',
          });
      }
    case 'ia_assistants':
      switch (seed.id) {
        case 'copilote_ia_metier':
          return createActivityDetailConfig({
            label: 'Votre cible',
            prefix: 'Copilote IA pour',
            example: 'avocats',
            singularTemplate: 'copilote IA pour',
            pluralTemplate: 'copilotes IA pour',
          });
        case 'assistant_redaction_contenu':
          return createActivityDetailConfig({
            label: 'Votre cible',
            prefix: 'Assistant de redaction pour',
            example: 'equipes marketing',
            singularTemplate: 'assistant de redaction pour',
            pluralTemplate: 'assistants de redaction pour',
          });
        case 'assistant_recherche_synthese':
          return createActivityDetailConfig({
            label: 'Votre cible',
            prefix: 'Assistant de recherche pour',
            example: 'consultants',
            singularTemplate: 'assistant de recherche pour',
            pluralTemplate: 'assistants de recherche pour',
          });
        case 'assistant_support_client':
          return createActivityDetailConfig({
            label: 'Votre cible',
            prefix: 'Assistant IA pour',
            example: 'service client',
            singularTemplate: 'assistant IA pour',
            pluralTemplate: 'assistants IA pour',
          });
        case 'assistant_commercial_prospection':
          return createActivityDetailConfig({
            label: 'Votre cible',
            prefix: 'Assistant commercial pour',
            example: 'SDR',
            singularTemplate: 'assistant commercial pour',
            pluralTemplate: 'assistants commerciaux pour',
          });
        case 'assistant_marketing_growth':
          return createActivityDetailConfig({
            label: 'Votre cible',
            prefix: 'Assistant growth pour',
            example: 'growth teams',
            singularTemplate: 'assistant growth pour',
            pluralTemplate: 'assistants growth pour',
          });
        case 'assistant_automatisation_operations':
          return createActivityDetailConfig({
            label: 'Votre cible',
            prefix: "Assistant d'automatisation pour",
            example: 'equipes ops',
            singularTemplate: "assistant d'automatisation pour",
            pluralTemplate: "assistants d'automatisation pour",
          });
        case 'assistant_code_developpement':
          return createActivityDetailConfig({
            label: 'Votre cible',
            prefix: 'Assistant code pour',
            example: 'equipes produit',
            singularTemplate: 'assistant code pour',
            pluralTemplate: 'assistants code pour',
          });
        case 'assistant_design_image_video':
          return createActivityDetailConfig({
            label: 'Votre cible',
            prefix: 'Assistant creatif pour',
            example: 'createurs',
            singularTemplate: 'assistant creatif pour',
            pluralTemplate: 'assistants creatifs pour',
          });
        case 'assistant_data_analyse':
          return createActivityDetailConfig({
            label: 'Votre cible',
            prefix: 'Assistant data pour',
            example: 'analystes data',
            singularTemplate: 'assistant data pour',
            pluralTemplate: 'assistants data pour',
          });
        case 'assistant_traduction_localisation':
          return createActivityDetailConfig({
            label: 'Votre cible',
            prefix: 'Assistant de traduction pour',
            example: 'sites multilingues',
            singularTemplate: 'assistant de traduction pour',
            pluralTemplate: 'assistants de traduction pour',
          });
        case 'assistant_formation_connaissance':
          return createActivityDetailConfig({
            label: 'Votre cible',
            prefix: 'Assistant formation pour',
            example: 'organismes de formation',
            singularTemplate: 'assistant formation pour',
            pluralTemplate: 'assistants formation pour',
          });
        case 'agent_workflow_orchestration':
          return createActivityDetailConfig({
            label: 'Votre cible',
            prefix: 'Agent workflow pour',
            example: 'back-office',
            singularTemplate: 'agent workflow pour',
            pluralTemplate: 'agents workflow pour',
          });
        case 'infrastructure_modeles_api_ia':
          return createActivityDetailConfig({
            label: 'Votre cible',
            prefix: 'Infrastructure IA pour',
            example: 'developpeurs',
            singularTemplate: 'infrastructure IA pour',
            pluralTemplate: 'infrastructures IA pour',
          });
        case 'autre_produit_ia_specialise':
          return createActivityDetailConfig({
            label: 'Votre cible',
            prefix: 'Produit IA pour',
            example: 'RH',
            singularTemplate: 'produit IA pour',
            pluralTemplate: 'produits IA pour',
          });
        default:
          return createActivityDetailConfig({
            label: 'Votre cible',
            prefix: 'Assistant IA pour',
            example: 'independants',
            singularTemplate: 'assistant IA pour',
            pluralTemplate: 'assistants IA pour',
          });
      }
    case 'plateforme_annuaire':
      switch (seed.id) {
        case 'plateforme_generaliste':
          return createActivityDetailConfig({
            label: 'Votre cible',
            prefix: 'Plateforme pour',
            example: 'PME',
            singularTemplate: 'plateforme pour',
            pluralTemplate: 'plateformes pour',
          });
        case 'annuaire_local':
          return createActivityDetailConfig({
            label: 'Votre domaine',
            prefix: 'Annuaire de',
            example: 'restaurants',
            singularTemplate: 'annuaire de',
            pluralTemplate: 'annuaires de',
          });
        case 'annuaire_b2b_professionnels':
          return createActivityDetailConfig({
            label: 'Votre domaine',
            prefix: 'Annuaire de',
            example: 'logiciels CRM',
            singularTemplate: 'annuaire de',
            pluralTemplate: 'annuaires de',
          });
        case 'marketplace_services':
          return createActivityDetailConfig({
            label: 'Votre cible',
            prefix: 'Plateforme pour',
            example: 'travaux',
            singularTemplate: 'plateforme pour',
            pluralTemplate: 'plateformes pour',
          });
        case 'marketplace_produits':
          return createActivityDetailConfig({
            label: 'Votre domaine',
            prefix: 'Marketplace de',
            example: 'produits artisanaux',
            singularTemplate: 'marketplace de',
            pluralTemplate: 'marketplaces de',
          });
        case 'plateforme_mise_en_relation':
          return createActivityDetailConfig({
            label: 'Votre cible',
            prefix: 'Plateforme pour',
            example: 'freelances tech',
            singularTemplate: 'plateforme pour',
            pluralTemplate: 'plateformes pour',
          });
        case 'plateforme_experts_freelances':
          return createActivityDetailConfig({
            label: 'Votre cible',
            prefix: 'Plateforme pour',
            example: 'developpeurs',
            singularTemplate: 'plateforme pour',
            pluralTemplate: 'plateformes pour',
          });
        case 'plateforme_emploi_recrutement':
          return createActivityDetailConfig({
            label: 'Votre cible',
            prefix: 'Plateforme pour',
            example: 'profils commerciaux',
            singularTemplate: 'plateforme pour',
            pluralTemplate: 'plateformes pour',
          });
        case 'plateforme_reservation':
          return createActivityDetailConfig({
            label: 'Votre cible',
            prefix: 'Plateforme de reservation pour',
            example: 'restaurants',
            singularTemplate: 'plateforme de reservation pour',
            pluralTemplate: 'plateformes de reservation pour',
          });
        case 'comparateur':
          return createActivityDetailConfig({
            label: 'Votre domaine',
            prefix: 'Comparateur de',
            example: 'mutuelles sante',
            singularTemplate: 'comparateur de',
            pluralTemplate: 'comparateurs de',
          });
        case 'forum_reseau':
          return createActivityDetailConfig({
            label: 'Votre thème',
            prefix: 'Forum sur',
            example: 'cybersecurite',
            singularTemplate: 'forum sur',
            pluralTemplate: 'forums sur',
          });
        case 'agregateur_contenus_offres':
          return createActivityDetailConfig({
            label: 'Votre domaine',
            prefix: 'Agregateur de',
            example: 'logiciels RH',
            singularTemplate: 'agregateur de',
            pluralTemplate: 'agregateurs de',
          });
        case 'plateforme_avis_recommandations':
          return createActivityDetailConfig({
            label: 'Votre domaine',
            prefix: "Plateforme d'avis sur",
            example: 'restaurants',
            singularTemplate: "plateforme d'avis sur",
            pluralTemplate: "plateformes d'avis sur",
          });
        default:
          return createActivityDetailConfig({
            label: 'Votre cible',
            prefix: 'Plateforme pour',
            example: 'artisans',
            singularTemplate: 'plateforme pour',
            pluralTemplate: 'plateformes pour',
          });
      }
    case 'ecommerce':
      if (seed.id === 'fournitures_equipement_pro') {
        return createActivityDetailConfig({
          label: 'Votre cible',
          prefix: 'Boutique en ligne pour',
          example: 'restaurateurs',
          singularTemplate: 'boutique en ligne pour',
          pluralTemplate: 'boutiques en ligne pour',
        });
      }

      return createActivityDetailConfig({
        label: 'Votre spécialité',
        prefix: 'Boutique en ligne de',
        example:
          seed.id === 'boutique_multi_categories'
            ? 'produits du quotidien'
            : seed.id === 'mode_accessoires'
            ? 'mode femme'
            : seed.id === 'beaute_cosmetique'
            ? 'cosmetiques naturels'
            : seed.id === 'maison_deco_mobilier'
            ? 'decoration interieure'
            : seed.id === 'alimentation_boissons'
            ? 'produits du terroir'
            : seed.id === 'sante_bien_etre'
            ? 'complements naturels'
            : seed.id === 'enfants_famille'
            ? 'produits pour bebes'
            : seed.id === 'tech_electronique_accessoires'
            ? 'accessoires smartphone'
            : seed.id === 'sport_outdoor'
            ? 'equipement running'
            : seed.id === 'loisirs_culture_cadeaux'
            ? 'cadeaux personnalises'
            : seed.id === 'luxe_premium'
            ? 'maroquinerie premium'
            : seed.id === 'animalerie'
            ? 'produits pour chiens'
            : seed.id === 'pieces_materiel_specialise'
            ? 'pieces moto'
            : seed.id === 'autre_ecommerce_specialise'
            ? 'mobilier design'
            : 'produits pour la maison',
        singularTemplate: 'boutique en ligne de',
        pluralTemplate: 'boutiques en ligne de',
      });
    case 'etablissement_institution':
      switch (seed.id) {
        case 'ecole_organisme_formation':
          return createActivityDetailConfig({
            label: 'Votre spécialité',
            prefix: 'Organisme de formation en',
            example: 'commerce',
            singularTemplate: 'organisme de formation en',
            pluralTemplate: 'organismes de formation en',
          });
        case 'organisme_sante':
          return createActivityDetailConfig({
            label: 'Votre spécialité',
            prefix: 'Organisme de sante specialise en',
            example: 'sante mentale',
            singularTemplate: 'organisme de sante specialise en',
            pluralTemplate: 'organismes de sante specialises en',
          });
        case 'media_publication_information':
          return createActivityDetailConfig({
            label: 'Votre thème',
            prefix: 'Media sur',
            example: 'cybersecurite',
            singularTemplate: 'media sur',
            pluralTemplate: 'medias sur',
          });
        case 'institution_culturelle':
          return createActivityDetailConfig({
            label: 'Votre discipline',
            prefix: 'Institution culturelle autour de',
            example: "l'art contemporain",
            singularTemplate: 'institution culturelle autour de',
            pluralTemplate: 'institutions culturelles autour de',
          });
        case 'organisme_public_service_administratif':
          return createActivityDetailConfig({
            label: 'Votre service',
            prefix: 'Organisme public pour',
            example: 'cartes grises',
            singularTemplate: 'organisme public pour',
            pluralTemplate: 'organismes publics pour',
          });
        case 'association_ong':
          return createActivityDetailConfig({
            label: 'Votre mission',
            prefix: 'Association pour',
            example: "l'inclusion numerique",
            singularTemplate: 'association pour',
            pluralTemplate: 'associations pour',
          });
        case 'federation_syndicat_reseau_pro':
          return createActivityDetailConfig({
            label: 'Votre mission',
            prefix: 'Federation pour',
            example: "l'artisanat",
            singularTemplate: 'federation pour',
            pluralTemplate: 'federations pour',
          });
        case 'organisme_aide_information':
          return createActivityDetailConfig({
            label: 'Votre mission',
            prefix: "Organisme d'aide pour",
            example: "l'acces aux droits",
            singularTemplate: "organisme d'aide pour",
            pluralTemplate: "organismes d'aide pour",
          });
        case 'organisation_communautaire':
          return createActivityDetailConfig({
            label: 'Votre mission',
            prefix: 'Organisation pour',
            example: 'les jeunes',
            singularTemplate: 'organisation pour',
            pluralTemplate: 'organisations pour',
          });
        case 'fondation_interet_general':
          return createActivityDetailConfig({
            label: 'Votre mission',
            prefix: 'Fondation pour',
            example: "l'education",
            singularTemplate: 'fondation pour',
            pluralTemplate: 'fondations pour',
          });
        case 'autre_structure_specialisee':
          return createActivityDetailConfig({
            label: 'Votre mission',
            prefix: 'Structure specialisee pour',
            example: 'la mediation sociale',
            singularTemplate: 'structure specialisee pour',
            pluralTemplate: 'structures specialisees pour',
          });
        default:
          return createActivityDetailConfig({
            label: 'Votre mission',
            prefix: 'Organisation pour',
            example: "l'accompagnement des entrepreneurs",
            singularTemplate: 'organisation pour',
            pluralTemplate: 'organisations pour',
          });
      }
    default:
      return createActivityDetailConfig({
        label: 'Votre précision',
        prefix: 'Activite pour',
        example: 'PME',
        singularTemplate: `${seed.actorSingular} pour`,
        pluralTemplate: `${seed.actorPlural} pour`,
      });
  }
}

function createActivity(
  type: PaidScanBusinessType,
  seed: ActivitySeed
): ActivityCatalogEntry {
  const config = TYPE_CONFIG[type];
  const cityMode = resolveActivityCityMode(type, seed.id, config.geoMode);
  const detailConfig = resolveActivityDetailConfig(seed, type);

  return {
    id: seed.id,
    type,
    label: seed.label,
    geoMode: cityMode,
    cityMode,
    promptFamily: config.promptFamily,
    discoveryMode: config.discoveryMode,
    siteTypeHint: seed.siteTypeHint || config.siteTypeHint,
    domainVerticalHint: seed.domainVerticalHint,
    actorSingular: seed.actorSingular,
    actorPlural: seed.actorPlural,
    detailLabel: detailConfig.label,
    detailPrefix: detailConfig.prefix,
    detailExample: detailConfig.example,
    detailQualifiedActorSingular: detailConfig.singularTemplate,
    detailQualifiedActorPlural: detailConfig.pluralTemplate,
  };
}

export const PAID_SCAN_TYPE_OPTIONS: PaidScanTypeOption[] = [
  {
    id: 'commerce_restauration',
    label: 'Commerce & restauration',
    description: 'Restaurant, boutique ou commerce local',
    icon: '🍽️',
  },
  {
    id: 'prestataire_local',
    label: 'Prestataire local',
    description: 'Artisan, expert local ou service de proximité',
    icon: '🛠️',
  },
  {
    id: 'agence_studio',
    label: 'Agence & studio',
    description: 'Agence, studio, cabinet ou freelance B2B',
    icon: '🎯',
  },
  {
    id: 'saas_application',
    label: 'SaaS & application',
    description: 'Logiciel, application ou outil métier',
    icon: '💻',
  },
  {
    id: 'ia_assistants',
    label: 'IA & assistants',
    description: 'Assistant IA, copilote ou produit IA spécialisé',
    icon: '🤖',
  },
  {
    id: 'plateforme_annuaire',
    label: 'Plateforme & annuaire',
    description: 'Marketplace, annuaire, comparateur ou forum',
    icon: '🗂️',
  },
  {
    id: 'ecommerce',
    label: 'E-commerce',
    description: 'Boutique en ligne qui vend des produits',
    icon: '🛍️',
  },
  {
    id: 'etablissement_institution',
    label: 'Établissement & institution',
    description: 'Association, organisme, média ou institution',
    icon: '🏛️',
  },
];

export const PAID_SCAN_ACTIVITY_CATALOG: ActivityCatalogEntry[] = [
  createActivity('commerce_restauration', {
    id: 'commerce_general',
    label: 'Commerce / établissement général',
    actorSingular: 'commerce local',
    actorPlural: 'commerces locaux',
    domainVerticalHint: 'general_business',
  }),
  createActivity('commerce_restauration', {
    id: 'restaurant',
    label: 'Restaurant',
    actorSingular: 'restaurant',
    actorPlural: 'restaurants',
    domainVerticalHint: 'food_restaurants',
  }),
  createActivity('commerce_restauration', {
    id: 'bar_cafe',
    label: 'Bar / café',
    actorSingular: 'bar ou café',
    actorPlural: 'bars et cafés',
    domainVerticalHint: 'food_restaurants',
  }),
  createActivity('commerce_restauration', {
    id: 'boulangerie_patisserie',
    label: 'Boulangerie / pâtisserie',
    actorSingular: 'boulangerie ou pâtisserie',
    actorPlural: 'boulangeries et pâtisseries',
    domainVerticalHint: 'food_restaurants',
  }),
  createActivity('commerce_restauration', {
    id: 'traiteur_epicerie_fine',
    label: 'Traiteur / épicerie fine',
    actorSingular: 'traiteur ou épicerie fine',
    actorPlural: 'traiteurs et épiceries fines',
    domainVerticalHint: 'food_restaurants',
  }),
  createActivity('commerce_restauration', {
    id: 'commerce_alimentaire',
    label: 'Commerce alimentaire',
    actorSingular: 'commerce alimentaire',
    actorPlural: 'commerces alimentaires',
    domainVerticalHint: 'food_restaurants',
  }),
  createActivity('commerce_restauration', {
    id: 'boutique_mode_accessoires',
    label: 'Boutique mode / accessoires',
    actorSingular: 'boutique de mode et accessoires',
    actorPlural: 'boutiques de mode et accessoires',
    domainVerticalHint: 'ecommerce_retail',
  }),
  createActivity('commerce_restauration', {
    id: 'boutique_maison_deco_cadeaux',
    label: 'Boutique maison / déco / cadeaux',
    actorSingular: 'boutique de décoration et cadeaux',
    actorPlural: 'boutiques de décoration et cadeaux',
    domainVerticalHint: 'ecommerce_retail',
  }),
  createActivity('commerce_restauration', {
    id: 'fleuriste_concept_store',
    label: 'Fleuriste / concept store',
    actorSingular: 'fleuriste ou concept store',
    actorPlural: 'fleuristes et concept stores',
    domainVerticalHint: 'ecommerce_retail',
  }),
  createActivity('commerce_restauration', {
    id: 'hotel_hebergement_independant',
    label: 'Hôtel / hébergement indépendant',
    actorSingular: 'hôtel ou hébergement indépendant',
    actorPlural: 'hôtels et hébergements indépendants',
    domainVerticalHint: 'travel_hospitality',
  }),
  createActivity('commerce_restauration', {
    id: 'loisirs_sorties_activites_locales',
    label: 'Loisirs / sorties / activités locales',
    actorSingular: 'lieu de loisirs',
    actorPlural: 'lieux de loisirs',
    domainVerticalHint: 'travel_hospitality',
  }),
  createActivity('commerce_restauration', {
    id: 'autre_commerce_restauration',
    label: 'Autre activité commerce / restauration',
    actorSingular: 'établissement local',
    actorPlural: 'établissements locaux',
    domainVerticalHint: 'general_business',
  }),

  createActivity('prestataire_local', {
    id: 'service_local_general',
    label: 'Service local général',
    actorSingular: 'prestataire local',
    actorPlural: 'prestataires locaux',
    domainVerticalHint: 'general_business',
  }),
  createActivity('prestataire_local', {
    id: 'artisan_travaux_renovation',
    label: 'Artisan travaux / rénovation',
    actorSingular: 'artisan du bâtiment',
    actorPlural: 'artisans du bâtiment',
    domainVerticalHint: 'construction_home_services',
  }),
  createActivity('prestataire_local', {
    id: 'depannage_reparation',
    label: 'Dépannage / réparation',
    actorSingular: 'professionnel du dépannage',
    actorPlural: 'professionnels du dépannage',
    domainVerticalHint: 'construction_home_services',
  }),
  createActivity('prestataire_local', {
    id: 'immobilier',
    label: 'Immobilier',
    actorSingular: "professionnel de l'immobilier",
    actorPlural: "professionnels de l'immobilier",
    domainVerticalHint: 'real_estate',
  }),
  createActivity('prestataire_local', {
    id: 'sante_soins',
    label: 'Santé / soins',
    actorSingular: 'professionnel de santé',
    actorPlural: 'professionnels de santé',
    domainVerticalHint: 'healthcare_wellness',
  }),
  createActivity('prestataire_local', {
    id: 'bien_etre_esthetique',
    label: 'Bien-être / esthétique',
    actorSingular: 'praticien bien-être',
    actorPlural: 'praticiens bien-être',
    domainVerticalHint: 'healthcare_wellness',
  }),
  createActivity('prestataire_local', {
    id: 'sport_coaching',
    label: 'Sport / coaching',
    actorSingular: 'coach sportif ou professionnel du sport',
    actorPlural: 'coachs sportifs et professionnels du sport',
    domainVerticalHint: 'healthcare_wellness',
  }),
  createActivity('prestataire_local', {
    id: 'avocat_cabinet_juridique',
    label: 'Avocat / cabinet juridique',
    actorSingular: 'avocat',
    actorPlural: 'avocats',
    domainVerticalHint: 'legal_compliance',
  }),
  createActivity('prestataire_local', {
    id: 'expert_comptable_gestion',
    label: 'Expert-comptable / gestion',
    actorSingular: 'expert-comptable',
    actorPlural: 'experts-comptables',
    domainVerticalHint: 'accounting_finance',
  }),
  createActivity('prestataire_local', {
    id: 'services_a_domicile',
    label: 'Services à domicile',
    actorSingular: 'prestataire à domicile',
    actorPlural: 'prestataires à domicile',
    domainVerticalHint: 'construction_home_services',
  }),
  createActivity('prestataire_local', {
    id: 'auto_mobilite_locale',
    label: 'Auto / mobilité locale',
    actorSingular: 'professionnel automobile',
    actorPlural: 'professionnels automobiles',
    domainVerticalHint: 'logistics_mobility',
  }),
  createActivity('prestataire_local', {
    id: 'photographie_evenementiel',
    label: 'Photographie / événementiel',
    actorSingular: 'photographe ou prestataire événementiel',
    actorPlural: 'photographes et prestataires événementiels',
    domainVerticalHint: 'marketing_communication',
  }),
  createActivity('prestataire_local', {
    id: 'autre_service_local_specialise',
    label: 'Autre service local spécialisé',
    actorSingular: 'prestataire spécialisé',
    actorPlural: 'prestataires spécialisés',
    domainVerticalHint: 'general_business',
  }),

  createActivity('agence_studio', {
    id: 'agence_studio_generaliste',
    label: 'Agence / studio généraliste',
    actorSingular: 'agence ou studio',
    actorPlural: 'agences et studios',
    domainVerticalHint: 'general_business',
  }),
  createActivity('agence_studio', {
    id: 'agence_marketing_acquisition',
    label: 'Agence marketing / acquisition',
    actorSingular: 'agence marketing',
    actorPlural: 'agences marketing',
    domainVerticalHint: 'marketing_communication',
  }),
  createActivity('agence_studio', {
    id: 'agence_seo_sea',
    label: 'Agence SEO / SEA',
    actorSingular: 'agence SEO / SEA',
    actorPlural: 'agences SEO / SEA',
    domainVerticalHint: 'marketing_communication',
  }),
  createActivity('agence_studio', {
    id: 'agence_reseaux_sociaux_contenu',
    label: 'Agence réseaux sociaux / contenu',
    actorSingular: 'agence réseaux sociaux',
    actorPlural: 'agences réseaux sociaux',
    domainVerticalHint: 'marketing_communication',
  }),
  createActivity('agence_studio', {
    id: 'agence_web_no_code',
    label: 'Agence web / no-code',
    actorSingular: 'agence web',
    actorPlural: 'agences web',
    domainVerticalHint: 'marketing_communication',
  }),
  createActivity('agence_studio', {
    id: 'studio_design_branding',
    label: 'Studio design / branding',
    actorSingular: 'studio design',
    actorPlural: 'studios design',
    domainVerticalHint: 'marketing_communication',
  }),
  createActivity('agence_studio', {
    id: 'production_photo_video',
    label: 'Production photo / vidéo',
    actorSingular: 'studio de production photo / vidéo',
    actorPlural: 'studios de production photo / vidéo',
    domainVerticalHint: 'marketing_communication',
  }),
  createActivity('agence_studio', {
    id: 'conseil_strategie_b2b',
    label: 'Conseil / stratégie B2B',
    actorSingular: 'cabinet de conseil B2B',
    actorPlural: 'cabinets de conseil B2B',
    domainVerticalHint: 'general_business',
  }),
  createActivity('agence_studio', {
    id: 'recrutement_rh',
    label: 'Recrutement / RH',
    actorSingular: 'cabinet de recrutement ou RH',
    actorPlural: 'cabinets de recrutement et RH',
    domainVerticalHint: 'recruitment_jobs',
  }),
  createActivity('agence_studio', {
    id: 'data_ia_automatisation',
    label: 'Data / IA / automatisation',
    actorSingular: 'agence data / IA',
    actorPlural: 'agences data / IA',
    domainVerticalHint: 'ai_automation',
  }),
  createActivity('agence_studio', {
    id: 'developpement_produit_tech',
    label: 'Développement / produit / tech',
    actorSingular: 'agence de développement',
    actorPlural: 'agences de développement',
    domainVerticalHint: 'developer_tools',
  }),
  createActivity('agence_studio', {
    id: 'relations_presse_communication',
    label: 'Relations presse / communication',
    actorSingular: 'agence de communication',
    actorPlural: 'agences de communication',
    domainVerticalHint: 'marketing_communication',
  }),
  createActivity('agence_studio', {
    id: 'freelance_expert_b2b',
    label: 'Freelance / expert B2B',
    actorSingular: 'freelance B2B',
    actorPlural: 'freelances B2B',
    domainVerticalHint: 'general_business',
  }),
  createActivity('agence_studio', {
    id: 'autre_agence_studio_specialise',
    label: 'Autre agence / studio spécialisé',
    actorSingular: 'agence spécialisée',
    actorPlural: 'agences spécialisées',
    domainVerticalHint: 'general_business',
  }),

  createActivity('saas_application', {
    id: 'logiciel_application_generaliste',
    label: 'Logiciel / application généraliste',
    actorSingular: 'logiciel',
    actorPlural: 'logiciels',
    domainVerticalHint: 'general_business',
  }),
  createActivity('saas_application', {
    id: 'crm_vente',
    label: 'CRM / vente',
    actorSingular: 'logiciel CRM',
    actorPlural: 'logiciels CRM',
    domainVerticalHint: 'sales_crm',
  }),
  createActivity('saas_application', {
    id: 'marketing_automation',
    label: 'Marketing automation',
    actorSingular: "logiciel d'automatisation marketing",
    actorPlural: "logiciels d'automatisation marketing",
    domainVerticalHint: 'marketing_communication',
  }),
  createActivity('saas_application', {
    id: 'support_client_helpdesk',
    label: 'Support client / helpdesk',
    actorSingular: 'logiciel de support client',
    actorPlural: 'logiciels de support client',
    domainVerticalHint: 'sales_crm',
  }),
  createActivity('saas_application', {
    id: 'finance_comptabilite',
    label: 'Finance / comptabilité',
    actorSingular: 'logiciel de comptabilité',
    actorPlural: 'logiciels de comptabilité',
    domainVerticalHint: 'accounting_finance',
  }),
  createActivity('saas_application', {
    id: 'rh_paie',
    label: 'RH / paie',
    actorSingular: 'logiciel RH / paie',
    actorPlural: 'logiciels RH / paie',
    domainVerticalHint: 'hr_payroll',
  }),
  createActivity('saas_application', {
    id: 'gestion_projet_productivite',
    label: 'Gestion de projet / productivité',
    actorSingular: 'logiciel de gestion de projet',
    actorPlural: 'logiciels de gestion de projet',
    domainVerticalHint: 'general_business',
  }),
  createActivity('saas_application', {
    id: 'collaboration_communication',
    label: 'Collaboration / communication',
    actorSingular: 'outil de collaboration',
    actorPlural: 'outils de collaboration',
    domainVerticalHint: 'general_business',
  }),
  createActivity('saas_application', {
    id: 'data_bi_analytics',
    label: 'Data / BI / analytics',
    actorSingular: "logiciel d'analyse de données",
    actorPlural: "logiciels d'analyse de données",
    domainVerticalHint: 'it_cyber_data',
  }),
  createActivity('saas_application', {
    id: 'it_cybersecurite',
    label: 'IT / cybersécurité',
    actorSingular: 'logiciel de cybersécurité',
    actorPlural: 'logiciels de cybersécurité',
    domainVerticalHint: 'it_cyber_data',
  }),
  createActivity('saas_application', {
    id: 'juridique_conformite',
    label: 'Juridique / conformité',
    actorSingular: 'logiciel de conformité',
    actorPlural: 'logiciels de conformité',
    domainVerticalHint: 'legal_compliance',
  }),
  createActivity('saas_application', {
    id: 'ecommerce_enablement',
    label: 'E-commerce enablement',
    actorSingular: 'logiciel e-commerce',
    actorPlural: 'logiciels e-commerce',
    domainVerticalHint: 'ecommerce_retail',
  }),
  createActivity('saas_application', {
    id: 'formation_lms_knowledge_base',
    label: 'Formation / LMS / knowledge base',
    actorSingular: 'logiciel de formation',
    actorPlural: 'logiciels de formation',
    domainVerticalHint: 'education_training',
  }),
  createActivity('saas_application', {
    id: 'booking_planning_reservation',
    label: 'Booking / planning / réservation',
    actorSingular: 'logiciel de réservation',
    actorPlural: 'logiciels de réservation',
    domainVerticalHint: 'travel_hospitality',
  }),
  createActivity('saas_application', {
    id: 'logiciel_metier_specialise',
    label: 'Logiciel métier spécialisé',
    actorSingular: 'logiciel métier spécialisé',
    actorPlural: 'logiciels métiers spécialisés',
    domainVerticalHint: 'general_business',
  }),
  createActivity('saas_application', {
    id: 'autre_logiciel_specialise',
    label: 'Autre logiciel spécialisé',
    actorSingular: 'logiciel spécialisé',
    actorPlural: 'logiciels spécialisés',
    domainVerticalHint: 'general_business',
  }),

  createActivity('ia_assistants', {
    id: 'assistant_ia_generaliste',
    label: 'Assistant IA généraliste',
    actorSingular: 'assistant IA',
    actorPlural: 'assistants IA',
    domainVerticalHint: 'ai_automation',
  }),
  createActivity('ia_assistants', {
    id: 'copilote_ia_metier',
    label: 'Copilote IA métier',
    actorSingular: 'copilote IA métier',
    actorPlural: 'copilotes IA métier',
    domainVerticalHint: 'ai_automation',
  }),
  createActivity('ia_assistants', {
    id: 'assistant_redaction_contenu',
    label: 'Assistant rédaction / contenu',
    actorSingular: 'assistant IA de rédaction',
    actorPlural: 'assistants IA de rédaction',
    domainVerticalHint: 'marketing_communication',
  }),
  createActivity('ia_assistants', {
    id: 'assistant_recherche_synthese',
    label: 'Assistant recherche / synthèse',
    actorSingular: 'assistant IA de recherche',
    actorPlural: 'assistants IA de recherche',
    domainVerticalHint: 'ai_automation',
  }),
  createActivity('ia_assistants', {
    id: 'assistant_support_client',
    label: 'Assistant support client',
    actorSingular: 'assistant IA de support client',
    actorPlural: 'assistants IA de support client',
    domainVerticalHint: 'sales_crm',
  }),
  createActivity('ia_assistants', {
    id: 'assistant_commercial_prospection',
    label: 'Assistant commercial / prospection',
    actorSingular: 'assistant IA commercial',
    actorPlural: 'assistants IA commerciaux',
    domainVerticalHint: 'sales_crm',
  }),
  createActivity('ia_assistants', {
    id: 'assistant_marketing_growth',
    label: 'Assistant marketing / growth',
    actorSingular: 'assistant IA marketing',
    actorPlural: 'assistants IA marketing',
    domainVerticalHint: 'marketing_communication',
  }),
  createActivity('ia_assistants', {
    id: 'assistant_automatisation_operations',
    label: 'Assistant automatisation / opérations',
    actorSingular: "agent IA d'automatisation",
    actorPlural: "agents IA d'automatisation",
    domainVerticalHint: 'ai_automation',
  }),
  createActivity('ia_assistants', {
    id: 'assistant_code_developpement',
    label: 'Assistant code / développement',
    actorSingular: 'assistant IA de développement',
    actorPlural: 'assistants IA de développement',
    domainVerticalHint: 'developer_tools',
  }),
  createActivity('ia_assistants', {
    id: 'assistant_design_image_video',
    label: 'Assistant design / image / vidéo',
    actorSingular: 'outil IA créatif',
    actorPlural: 'outils IA créatifs',
    domainVerticalHint: 'marketing_communication',
  }),
  createActivity('ia_assistants', {
    id: 'assistant_data_analyse',
    label: 'Assistant data / analyse',
    actorSingular: "assistant IA d'analyse de données",
    actorPlural: "assistants IA d'analyse de données",
    domainVerticalHint: 'it_cyber_data',
  }),
  createActivity('ia_assistants', {
    id: 'assistant_traduction_localisation',
    label: 'Assistant traduction / localisation',
    actorSingular: 'assistant IA de traduction',
    actorPlural: 'assistants IA de traduction',
    domainVerticalHint: 'general_business',
  }),
  createActivity('ia_assistants', {
    id: 'assistant_formation_connaissance',
    label: 'Assistant formation / connaissance',
    actorSingular: 'assistant IA de formation',
    actorPlural: 'assistants IA de formation',
    domainVerticalHint: 'education_training',
  }),
  createActivity('ia_assistants', {
    id: 'agent_workflow_orchestration',
    label: 'Agent workflow / orchestration',
    actorSingular: 'agent IA',
    actorPlural: 'agents IA',
    domainVerticalHint: 'ai_automation',
  }),
  createActivity('ia_assistants', {
    id: 'infrastructure_modeles_api_ia',
    label: 'Infrastructure / modèles / API IA',
    actorSingular: 'plateforme IA',
    actorPlural: 'plateformes IA',
    domainVerticalHint: 'ai_automation',
  }),
  createActivity('ia_assistants', {
    id: 'autre_produit_ia_specialise',
    label: 'Autre produit IA spécialisé',
    actorSingular: 'produit IA spécialisé',
    actorPlural: 'produits IA spécialisés',
    domainVerticalHint: 'ai_automation',
  }),

  createActivity('plateforme_annuaire', {
    id: 'plateforme_generaliste',
    label: 'Plateforme généraliste',
    actorSingular: 'plateforme',
    actorPlural: 'plateformes',
    domainVerticalHint: 'general_business',
  }),
  createActivity('plateforme_annuaire', {
    id: 'annuaire_local',
    label: 'Annuaire local',
    actorSingular: 'annuaire local',
    actorPlural: 'annuaires locaux',
    domainVerticalHint: 'general_business',
  }),
  createActivity('plateforme_annuaire', {
    id: 'annuaire_b2b_professionnels',
    label: 'Annuaire B2B / professionnels',
    actorSingular: 'annuaire B2B',
    actorPlural: 'annuaires B2B',
    domainVerticalHint: 'general_business',
  }),
  createActivity('plateforme_annuaire', {
    id: 'marketplace_services',
    label: 'Marketplace de services',
    actorSingular: 'marketplace de services',
    actorPlural: 'marketplaces de services',
    domainVerticalHint: 'general_business',
  }),
  createActivity('plateforme_annuaire', {
    id: 'marketplace_produits',
    label: 'Marketplace de produits',
    actorSingular: 'marketplace de produits',
    actorPlural: 'marketplaces de produits',
    domainVerticalHint: 'ecommerce_retail',
  }),
  createActivity('plateforme_annuaire', {
    id: 'plateforme_mise_en_relation',
    label: 'Plateforme de mise en relation',
    actorSingular: 'plateforme de mise en relation',
    actorPlural: 'plateformes de mise en relation',
    domainVerticalHint: 'general_business',
  }),
  createActivity('plateforme_annuaire', {
    id: 'plateforme_experts_freelances',
    label: 'Plateforme experts / freelances',
    actorSingular: 'plateforme de freelances',
    actorPlural: 'plateformes de freelances',
    domainVerticalHint: 'general_business',
  }),
  createActivity('plateforme_annuaire', {
    id: 'plateforme_emploi_recrutement',
    label: 'Plateforme emploi / recrutement',
    actorSingular: 'plateforme emploi',
    actorPlural: 'plateformes emploi',
    domainVerticalHint: 'recruitment_jobs',
  }),
  createActivity('plateforme_annuaire', {
    id: 'plateforme_reservation',
    label: 'Plateforme de réservation',
    actorSingular: 'plateforme de réservation',
    actorPlural: 'plateformes de réservation',
    domainVerticalHint: 'travel_hospitality',
  }),
  createActivity('plateforme_annuaire', {
    id: 'comparateur',
    label: 'Comparateur',
    actorSingular: 'comparateur',
    actorPlural: 'comparateurs',
    domainVerticalHint: 'general_business',
  }),
  createActivity('plateforme_annuaire', {
    id: 'forum_reseau',
    label: 'Forum / réseau',
    actorSingular: 'forum',
    actorPlural: 'forums',
    domainVerticalHint: 'general_business',
    siteTypeHint: 'community_forum',
  }),
  createActivity('plateforme_annuaire', {
    id: 'agregateur_contenus_offres',
    label: 'Agrégateur de contenus / offres',
    actorSingular: 'agrégateur',
    actorPlural: 'agrégateurs',
    domainVerticalHint: 'general_business',
    siteTypeHint: 'media',
  }),
  createActivity('plateforme_annuaire', {
    id: 'plateforme_avis_recommandations',
    label: 'Plateforme d’avis / recommandations',
    actorSingular: "plateforme d'avis",
    actorPlural: "plateformes d'avis",
    domainVerticalHint: 'general_business',
  }),
  createActivity('plateforme_annuaire', {
    id: 'autre_plateforme_specialisee',
    label: 'Autre plateforme spécialisée',
    actorSingular: 'plateforme spécialisée',
    actorPlural: 'plateformes spécialisées',
    domainVerticalHint: 'general_business',
  }),

  createActivity('ecommerce', {
    id: 'boutique_en_ligne_generaliste',
    label: 'Boutique en ligne généraliste',
    actorSingular: 'boutique en ligne',
    actorPlural: 'boutiques en ligne',
    domainVerticalHint: 'ecommerce_retail',
  }),
  createActivity('ecommerce', {
    id: 'boutique_multi_categories',
    label: 'Boutique multi-catégories',
    actorSingular: 'boutique en ligne multi-catégories',
    actorPlural: 'boutiques en ligne multi-catégories',
    domainVerticalHint: 'ecommerce_retail',
  }),
  createActivity('ecommerce', {
    id: 'mode_accessoires',
    label: 'Mode / accessoires',
    actorSingular: 'boutique de mode',
    actorPlural: 'boutiques de mode',
    domainVerticalHint: 'ecommerce_retail',
  }),
  createActivity('ecommerce', {
    id: 'beaute_cosmetique',
    label: 'Beauté / cosmétique',
    actorSingular: 'boutique de cosmétiques',
    actorPlural: 'boutiques de cosmétiques',
    domainVerticalHint: 'ecommerce_retail',
  }),
  createActivity('ecommerce', {
    id: 'maison_deco_mobilier',
    label: 'Maison / déco / mobilier',
    actorSingular: 'boutique de décoration et mobilier',
    actorPlural: 'boutiques de décoration et mobilier',
    domainVerticalHint: 'ecommerce_retail',
  }),
  createActivity('ecommerce', {
    id: 'alimentation_boissons',
    label: 'Alimentation / boissons',
    actorSingular: 'boutique alimentaire en ligne',
    actorPlural: 'boutiques alimentaires en ligne',
    domainVerticalHint: 'food_restaurants',
  }),
  createActivity('ecommerce', {
    id: 'sante_bien_etre',
    label: 'Santé / bien-être',
    actorSingular: 'boutique santé / bien-être',
    actorPlural: 'boutiques santé / bien-être',
    domainVerticalHint: 'healthcare_wellness',
  }),
  createActivity('ecommerce', {
    id: 'enfants_famille',
    label: 'Enfants / famille',
    actorSingular: 'boutique enfants / famille',
    actorPlural: 'boutiques enfants / famille',
    domainVerticalHint: 'ecommerce_retail',
  }),
  createActivity('ecommerce', {
    id: 'tech_electronique_accessoires',
    label: 'Tech / électronique / accessoires',
    actorSingular: 'boutique tech',
    actorPlural: 'boutiques tech',
    domainVerticalHint: 'ecommerce_retail',
  }),
  createActivity('ecommerce', {
    id: 'sport_outdoor',
    label: 'Sport / outdoor',
    actorSingular: 'boutique de sport',
    actorPlural: 'boutiques de sport',
    domainVerticalHint: 'ecommerce_retail',
  }),
  createActivity('ecommerce', {
    id: 'loisirs_culture_cadeaux',
    label: 'Loisirs / culture / cadeaux',
    actorSingular: 'boutique de loisirs et cadeaux',
    actorPlural: 'boutiques de loisirs et cadeaux',
    domainVerticalHint: 'ecommerce_retail',
  }),
  createActivity('ecommerce', {
    id: 'luxe_premium',
    label: 'Luxe / premium',
    actorSingular: 'boutique de luxe',
    actorPlural: 'boutiques de luxe',
    domainVerticalHint: 'ecommerce_retail',
  }),
  createActivity('ecommerce', {
    id: 'animalerie',
    label: 'Animalerie',
    actorSingular: 'animalerie en ligne',
    actorPlural: 'animaleries en ligne',
    domainVerticalHint: 'ecommerce_retail',
  }),
  createActivity('ecommerce', {
    id: 'fournitures_equipement_pro',
    label: 'Fournitures / équipement pro',
    actorSingular: "boutique d'équipement professionnel",
    actorPlural: "boutiques d'équipement professionnel",
    domainVerticalHint: 'general_business',
  }),
  createActivity('ecommerce', {
    id: 'pieces_materiel_specialise',
    label: 'Pièces / matériel spécialisé',
    actorSingular: 'boutique de matériel spécialisé',
    actorPlural: 'boutiques de matériel spécialisé',
    domainVerticalHint: 'ecommerce_retail',
  }),
  createActivity('ecommerce', {
    id: 'autre_ecommerce_specialise',
    label: 'Autre e-commerce spécialisé',
    actorSingular: 'boutique en ligne spécialisée',
    actorPlural: 'boutiques en ligne spécialisées',
    domainVerticalHint: 'ecommerce_retail',
  }),

  createActivity('etablissement_institution', {
    id: 'organisation_institution_generaliste',
    label: 'Organisation / institution généraliste',
    actorSingular: 'organisme',
    actorPlural: 'organismes',
    domainVerticalHint: 'public_sector_associations',
  }),
  createActivity('etablissement_institution', {
    id: 'organisme_public_service_administratif',
    label: 'Organisme public / service administratif',
    actorSingular: 'service administratif',
    actorPlural: 'services administratifs',
    domainVerticalHint: 'public_sector_associations',
  }),
  createActivity('etablissement_institution', {
    id: 'association_ong',
    label: 'Association / ONG',
    actorSingular: 'association',
    actorPlural: 'associations',
    domainVerticalHint: 'public_sector_associations',
  }),
  createActivity('etablissement_institution', {
    id: 'ecole_organisme_formation',
    label: 'École / organisme de formation',
    actorSingular: 'organisme de formation',
    actorPlural: 'organismes de formation',
    domainVerticalHint: 'education_training',
    siteTypeHint: 'education_training',
  }),
  createActivity('etablissement_institution', {
    id: 'organisme_sante',
    label: 'Organisme de santé',
    actorSingular: 'organisme de santé',
    actorPlural: 'organismes de santé',
    domainVerticalHint: 'healthcare_wellness',
  }),
  createActivity('etablissement_institution', {
    id: 'institution_culturelle',
    label: 'Institution culturelle',
    actorSingular: 'institution culturelle',
    actorPlural: 'institutions culturelles',
    domainVerticalHint: 'public_sector_associations',
  }),
  createActivity('etablissement_institution', {
    id: 'media_publication_information',
    label: 'Média / publication / information',
    actorSingular: 'média',
    actorPlural: 'médias',
    domainVerticalHint: 'general_business',
    siteTypeHint: 'media',
  }),
  createActivity('etablissement_institution', {
    id: 'federation_syndicat_reseau_pro',
    label: 'Fédération / syndicat / réseau pro',
    actorSingular: 'organisation professionnelle',
    actorPlural: 'organisations professionnelles',
    domainVerticalHint: 'public_sector_associations',
  }),
  createActivity('etablissement_institution', {
    id: 'organisme_aide_information',
    label: 'Organisme d’aide / information',
    actorSingular: "organisme d'aide",
    actorPlural: "organismes d'aide",
    domainVerticalHint: 'public_sector_associations',
  }),
  createActivity('etablissement_institution', {
    id: 'organisation_communautaire',
    label: 'Organisation communautaire',
    actorSingular: 'organisation communautaire',
    actorPlural: 'organisations communautaires',
    domainVerticalHint: 'public_sector_associations',
  }),
  createActivity('etablissement_institution', {
    id: 'fondation_interet_general',
    label: 'Fondation / intérêt général',
    actorSingular: 'fondation',
    actorPlural: 'fondations',
    domainVerticalHint: 'public_sector_associations',
  }),
  createActivity('etablissement_institution', {
    id: 'autre_structure_specialisee',
    label: 'Autre structure spécialisée',
    actorSingular: 'structure spécialisée',
    actorPlural: 'structures spécialisées',
    domainVerticalHint: 'public_sector_associations',
  }),
];

const PAID_SCAN_ACTIVITY_MAP = new Map(
  PAID_SCAN_ACTIVITY_CATALOG.map((entry) => [`${entry.type}:${entry.id}`, entry] as const)
);

export function getPaidScanActivitiesByType(type: PaidScanBusinessType): ActivityCatalogEntry[] {
  return PAID_SCAN_ACTIVITY_CATALOG.filter((entry) => entry.type === type);
}

export function getPaidScanActivityCatalogEntry(
  type: PaidScanBusinessType,
  activity: string
): ActivityCatalogEntry | null {
  const normalizedActivity = normalizeCatalogValue(activity);
  if (!normalizedActivity) return null;
  return PAID_SCAN_ACTIVITY_MAP.get(`${type}:${normalizedActivity}`) || null;
}

function startsWithVowelOrMuteH(value: string): boolean {
  return /^[aeiouyhàâäæéèêëîïôöœùûü]/i.test(value);
}

function applyFrenchConnector(connector: string, detail: string): string {
  const trimmedConnector = connector.trim();
  const trimmedDetail = detail.trim();
  if (!trimmedConnector || !trimmedDetail) return trimmedDetail;

  if (trimmedConnector.endsWith("'")) {
    return `${trimmedConnector}${trimmedDetail}`;
  }

  return `${trimmedConnector} ${trimmedDetail}`;
}

export function buildPaidScanActivityDetailPhrase(
  entry: ActivityCatalogEntry,
  value: string | null | undefined
): string | null {
  const detail = getPaidScanActivityDetailInput(value);
  if (!detail) return null;
  return applyFrenchConnector(entry.detailPrefix, detail);
}

export function buildPaidScanQualifiedActorLabel(
  entry: ActivityCatalogEntry,
  value: string | null | undefined,
  plurality: 'singular' | 'plural'
): string {
  const detail = getPaidScanActivityDetailInput(value);
  if (!detail) {
    return plurality === 'singular' ? entry.actorSingular : entry.actorPlural;
  }

  const template =
    plurality === 'singular'
      ? entry.detailQualifiedActorSingular
      : entry.detailQualifiedActorPlural;
  return `${template} ${detail}`.trim();
}

export function usesPaidScanCityStep(entry: ActivityCatalogEntry | null | undefined): boolean {
  return Boolean(entry && entry.cityMode !== 'forbidden');
}

export function canSkipPaidScanCityStep(entry: ActivityCatalogEntry | null | undefined): boolean {
  return Boolean(entry && entry.cityMode === 'optional');
}

export function normalizePaidScanCityInput(value: string | null | undefined): string | null {
  if (typeof value !== 'string') return null;
  const normalized = value.replace(/\s+/g, ' ').trim();
  return normalized.length > 0 ? normalized : null;
}

export function getPaidScanActivityDetailInput(
  value: string | null | undefined
): string | null {
  if (typeof value !== 'string') return null;
  return value.trim().length > 0 ? value : null;
}

export function normalizeCatalogValue(value: string | null | undefined): string | null {
  if (typeof value !== 'string') return null;
  const normalized = value.trim().toLowerCase();
  return normalized.length > 0 ? normalized : null;
}

export function isPaidScanBusinessType(value: unknown): value is PaidScanBusinessType {
  if (typeof value !== 'string') return false;
  return PAID_SCAN_TYPE_OPTIONS.some((option) => option.id === value);
}

export function getQuestionnaireStepCountForType(
  type: PaidScanBusinessType,
  activity: string | null
): number {
  if (!activity) return 4;
  const entry = getPaidScanActivityCatalogEntry(type, activity);
  return entry?.cityMode && entry.cityMode !== 'forbidden' ? 4 : 3;
}

export function buildAuditScanContext(userContext: AuditUserContext): AuditScanContext | null {
  const activityEntry = getPaidScanActivityCatalogEntry(userContext.type, userContext.activity);
  if (!activityEntry) return null;

  const city =
    activityEntry.cityMode !== 'forbidden'
      ? normalizePaidScanCityInput(userContext.city)
      : null;

  return {
    type: userContext.type,
    activity: activityEntry.id,
    activityDetail: getPaidScanActivityDetailInput(userContext.activityDetail),
    city,
    promptFamily: activityEntry.promptFamily,
    geoMode: activityEntry.cityMode,
    discoveryMode: activityEntry.discoveryMode,
    siteTypeHint: activityEntry.siteTypeHint,
    domainVerticalHint: activityEntry.domainVerticalHint,
    actorSingular: activityEntry.actorSingular,
    actorPlural: activityEntry.actorPlural,
  };
}

export function normalizePaidScanQuestionnaireInput(
  value: unknown
): AuditUserContext | null {
  if (!value || typeof value !== 'object') return null;
  const data = value as Record<string, unknown>;
  if (!isPaidScanBusinessType(data.type)) return null;

  const activity = normalizeCatalogValue(typeof data.activity === 'string' ? data.activity : null);
  if (!activity) return null;

  const activityEntry = getPaidScanActivityCatalogEntry(data.type, activity);
  if (!activityEntry) return null;

  const activityDetail = getPaidScanActivityDetailInput(
    typeof data.activityDetail === 'string' ? data.activityDetail : null
  );
  const city = normalizePaidScanCityInput(typeof data.city === 'string' ? data.city : null);
  if (activityEntry.cityMode === 'required' && !city) {
    return null;
  }

  return {
    type: data.type,
    activity: activityEntry.id,
    activityDetail,
    city: activityEntry.cityMode !== 'forbidden' ? city : null,
  };
}

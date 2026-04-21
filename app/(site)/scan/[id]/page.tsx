'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { HugeiconsIcon } from '@hugeicons/react';
import type { IconSvgElement } from '@hugeicons/react';
import {
  ActivitySparkIcon,
  AiChat01Icon,
  AiMagicIcon,
  AiProgrammingIcon,
  AiScanIcon,
  AiSearchIcon,
  ArrowLeft01Icon,
  BalanceScaleIcon,
  Book02Icon,
  Briefcase01Icon,
  Building01Icon,
  CafeIcon,
  CalculatorIcon,
  Calendar01Icon,
  Camera01Icon,
  Car01Icon,
  ChartBarLineIcon,
  CodeIcon,
  DiamondIcon,
  Dumbbell01Icon,
  FlowerPotIcon,
  GemIcon,
  GlassesIcon,
  HeadsetIcon,
  Home01Icon,
  Hospital01Icon,
  Key01Icon,
  LayerIcon,
  Mail01Icon,
  PaintBrush01Icon,
  Pizza01Icon,
  Restaurant01Icon,
  Scissor01Icon,
  Shield01Icon,
  Shirt01Icon,
  ShoppingBag01Icon,
  SparklesIcon,
  Store01Icon,
  TentIcon,
  Ticket01Icon,
  UserGroupIcon,
  Wallet01Icon,
  WellnessIcon,
  Wrench01Icon,
  ZapIcon,
} from '@hugeicons/core-free-icons';
import QoryWord from '@/app/components/qory-word';
import CityAutocompleteInput from '@/app/components/city-autocomplete-input';
import SiteSpinner from '@/app/components/site-spinner';
import { useParams, useSearchParams } from 'next/navigation';
import { useRouteProgressRouter } from '@/app/components/route-progress';
import type { AuditUserContext, PaidScanBusinessType } from '@/types';
import {
  canSkipPaidScanCityStep,
  PAID_SCAN_TYPE_OPTIONS,
  getPaidScanActivitiesByType,
  getPaidScanActivityCatalogEntry,
  getPaidScanActivityDetailInput,
  getQuestionnaireStepCountForType,
  normalizePaidScanCityInput,
  usesPaidScanCityStep,
} from '@/lib/scanner/paid-scan-catalog';
import type { ActivityCatalogEntry } from '@/lib/scanner/paid-scan-catalog';

type ScanPhase = {
  title: string;
  subtitle: string;
  progress: number;
  eta: string;
};

type ScanViewState =
  | 'bootstrapping'
  | 'question_type'
  | 'question_activity'
  | 'question_activity_detail'
  | 'question_city'
  | 'starting_scan'
  | 'scanning'
  | 'completed'
  | 'failed';

type QuestionnaireState = {
  type: PaidScanBusinessType | null;
  activity: string | null;
  activityDetail: string;
  city: string;
};

const PHASES: ScanPhase[] = [
  {
    title: 'Analyse de votre site',
    subtitle: 'Nous récupérons les signaux techniques, structurels et contextuels utiles à l’audit.',
    progress: 8,
    eta: 'Environ 55 secondes restantes',
  },
  {
    title: 'Compréhension de votre marché',
    subtitle:
      'Nous identifions votre activité, votre contexte sectoriel et les requêtes les plus pertinentes.',
    progress: 16,
    eta: 'Environ 50 secondes restantes',
  },
  {
    title: 'Interrogation des modèles IA',
    subtitle:
      'Nous lançons les requêtes sur plusieurs moteurs pour mesurer votre présence réelle.',
    progress: 24,
    eta: 'Environ 45 secondes restantes',
  },
  {
    title: 'Collecte des signaux concurrents',
    subtitle: 'Nous relevons les marques, acteurs et alternatives qui ressortent sur vos requêtes clés.',
    progress: 32,
    eta: 'Environ 40 secondes restantes',
  },
  {
    title: 'Collecte des informations attribuées',
    subtitle:
      'Nous relevons les informations pratiques que les IA associent à votre marque.',
    progress: 40,
    eta: 'Environ 35 secondes restantes',
  },
  {
    title: 'Analyse des réponses',
    subtitle:
      'Nous structurons les résultats bruts pour isoler les signaux vraiment utiles.',
    progress: 50,
    eta: 'Environ 30 secondes restantes',
  },
  {
    title: 'Consolidation des résultats',
    subtitle: 'Nous regroupons les signaux détectés pour construire une lecture cohérente.',
    progress: 60,
    eta: 'Environ 25 secondes restantes',
  },
  {
    title: 'Calcul de votre score',
    subtitle:
      'Nous calculons vos sous-scores et votre score global de visibilité IA.',
    progress: 70,
    eta: 'Environ 20 secondes restantes',
  },
  {
    title: 'Génération du rapport',
    subtitle:
      'Nous préparons votre synthèse, vos priorités et votre plan d’action.',
    progress: 80,
    eta: 'Environ 16 secondes restantes',
  },
  {
    title: 'Finalisation du rendu',
    subtitle:
      'Nous assemblons les derniers éléments pour afficher votre rapport complet.',
    progress: 90,
    eta: 'Environ 12 secondes restantes',
  },
  {
    title: 'Assemblage du rapport',
    subtitle:
      'Votre rapport détaillé est en cours de préparation finale.',
    progress: 96,
    eta: 'Quelques secondes restantes',
  },
  {
    title: 'Votre rapport complet est prêt',
    subtitle: 'Ouverture de vos résultats détaillés',
    progress: 100,
    eta: '',
  },
];

const DOTS_INTERVAL_MS = 500;
const POLL_INTERVAL_MS = 2000;
const POLL_ERROR_THRESHOLD = 5;
const FINAL_REDIRECT_DELAY_MS = 1200;
const PHASE_MIN_DURATION_MS = 2000;
const SOFT_EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];
const QUESTION_STATE_TRANSITION = { duration: 0.4, ease: SOFT_EASE };
const PANEL_FADE_TRANSITION = { duration: 0.36, ease: SOFT_EASE };
const BRANDING_TRANSITION = { duration: 0.32, ease: SOFT_EASE };
const MODAL_TRANSITION = { duration: 0.34, ease: SOFT_EASE };

const FINAL_PHASE_INDEX = PHASES.length - 1;

function getPhaseIndexFromProgress(progress: number): number {
  let index = 0;
  for (let i = 0; i < PHASES.length; i += 1) {
    if (progress >= PHASES[i].progress) {
      index = i;
    } else {
      break;
    }
  }
  return index;
}

function getPhaseIndexFromStep(step: unknown): number | null {
  if (typeof step !== 'string' || !step.trim()) {
    return null;
  }

  const normalizedStep = step.trim().toLowerCase();
  const index = PHASES.findIndex(
    (phase) => phase.title.trim().toLowerCase() === normalizedStep
  );
  return index >= 0 ? index : null;
}

function buildQuestionnaireSnapshot(
  type: PaidScanBusinessType | null,
  activity: string | null,
  activityDetail: string,
  city: string
): QuestionnaireState {
  return {
    type,
    activity,
    activityDetail,
    city,
  };
}

type ActivityIconKind =
  | 'food'
  | 'coffee'
  | 'bakery'
  | 'scissors'
  | 'sparkles'
  | 'flower'
  | 'glasses'
  | 'store'
  | 'wrench'
  | 'bolt'
  | 'key'
  | 'brush'
  | 'home'
  | 'dumbbell'
  | 'camera'
  | 'wellness'
  | 'calculator'
  | 'scale'
  | 'monitor'
  | 'megaphone'
  | 'search'
  | 'palette'
  | 'briefcase'
  | 'code'
  | 'layers'
  | 'users'
  | 'mail'
  | 'shield'
  | 'book'
  | 'chart'
  | 'spark'
  | 'wand'
  | 'headset'
  | 'calendar'
  | 'building'
  | 'ticket'
  | 'shirt'
  | 'paw'
  | 'gem'
  | 'car'
  | 'cross'
  | 'tent'
  | 'generic';

const TYPE_OPTION_ICONS: Record<PaidScanBusinessType, IconSvgElement> = {
  commerce_restauration: Restaurant01Icon,
  prestataire_local: Wrench01Icon,
  agence_studio: Briefcase01Icon,
  etablissement_institution: Building01Icon,
  saas_application: LayerIcon,
  ia_assistants: AiChat01Icon,
  plateforme_annuaire: AiSearchIcon,
  ecommerce: ShoppingBag01Icon,
};

const ACTIVITY_KIND_ICONS: Record<ActivityIconKind, IconSvgElement> = {
  food: Pizza01Icon,
  coffee: CafeIcon,
  bakery: Store01Icon,
  scissors: Scissor01Icon,
  sparkles: SparklesIcon,
  flower: FlowerPotIcon,
  glasses: GlassesIcon,
  store: ShoppingBag01Icon,
  wrench: Wrench01Icon,
  bolt: ZapIcon,
  key: Key01Icon,
  brush: PaintBrush01Icon,
  home: Home01Icon,
  dumbbell: Dumbbell01Icon,
  camera: Camera01Icon,
  wellness: WellnessIcon,
  calculator: CalculatorIcon,
  scale: BalanceScaleIcon,
  monitor: LayerIcon,
  megaphone: ActivitySparkIcon,
  search: AiSearchIcon,
  palette: PaintBrush01Icon,
  briefcase: Briefcase01Icon,
  code: AiProgrammingIcon,
  layers: LayerIcon,
  users: UserGroupIcon,
  mail: Mail01Icon,
  shield: Shield01Icon,
  book: Book02Icon,
  chart: ChartBarLineIcon,
  spark: AiChat01Icon,
  wand: AiMagicIcon,
  headset: HeadsetIcon,
  calendar: Calendar01Icon,
  building: Building01Icon,
  ticket: Ticket01Icon,
  shirt: Shirt01Icon,
  paw: GemIcon,
  gem: DiamondIcon,
  car: Car01Icon,
  cross: Hospital01Icon,
  tent: TentIcon,
  generic: Wallet01Icon,
};

function TypeOptionIcon({
  type,
  className,
}: {
  type: PaidScanBusinessType;
  className?: string;
}) {
  return (
    <HugeiconsIcon
      icon={TYPE_OPTION_ICONS[type]}
      size={22}
      strokeWidth={1.8}
      className={className ?? 'h-5 w-5'}
    />
  );
}

function resolveActivityIconKind(activity: ActivityCatalogEntry): ActivityIconKind {
  const haystack = `${activity.id} ${activity.label}`.toLowerCase();

  if (/pizzeria|restaurant|fast_food|street_food|alimentation|boissons/.test(haystack)) return 'food';
  if (/bar|cafe|coffee/.test(haystack)) return 'coffee';
  if (/boulangerie|patisserie|epicerie|primeur/.test(haystack)) return 'bakery';
  if (/coiffure/.test(haystack)) return 'scissors';
  if (/beaute|cosmet|bijoux|accessoires/.test(haystack)) return 'sparkles';
  if (/fleur/.test(haystack)) return 'flower';
  if (/opticien/.test(haystack)) return 'glasses';
  if (/boutique|ecommerce|mode|vetement/.test(haystack)) return 'store';
  if (/plombier|couvreur|charpentier|services_domicile|devis/.test(haystack)) return 'wrench';
  if (/electric/.test(haystack)) return 'bolt';
  if (/serrurier/.test(haystack)) return 'key';
  if (/peintre|design|creation/.test(haystack)) return 'brush';
  if (/maison|decoration|immobilier/.test(haystack)) return 'home';
  if (/coach_sportif|salle_sport|fitness|sport|outdoor/.test(haystack)) return 'dumbbell';
  if (/photographe|photo|video/.test(haystack)) return 'camera';
  if (/osteo|kine|psychologue|veterinaire|bien_etre/.test(haystack)) return 'wellness';
  if (/comptabil|finance|expert_comptable/.test(haystack)) return 'calculator';
  if (/avocat|juridique|signature|legal|compliance/.test(haystack)) return 'scale';
  if (/agence_web|web|application|logiciel|saas|high_tech|electronique/.test(haystack)) return 'monitor';
  if (/marketing|communication|sales|prospection/.test(haystack)) return 'megaphone';
  if (/seo|sea|annuaire|comparateur/.test(haystack)) return 'search';
  if (/studio_design|designer/.test(haystack)) return 'palette';
  if (/cabinet|consultant|conseil|coworking/.test(haystack)) return 'briefcase';
  if (/develop|code/.test(haystack)) return 'code';
  if (/gestion_projet|automation|automatisation/.test(haystack)) return 'layers';
  if (/crm|commercial|rh|recrutement|emploi/.test(haystack)) return 'users';
  if (/emailing|mail/.test(haystack)) return 'mail';
  if (/cyber/.test(haystack)) return 'shield';
  if (/education|formation|ecole|auto_ecole|creche/.test(haystack)) return 'book';
  if (/analytics|data/.test(haystack)) return 'chart';
  if (/ia_generaliste|assistant/.test(haystack)) return 'spark';
  if (/ia_marketing|ia_design|ia_juridique|documents/.test(haystack)) return 'wand';
  if (/support_client/.test(haystack)) return 'headset';
  if (/reservation/.test(haystack)) return 'calendar';
  if (/hotel|hebergement|clinique|institution/.test(haystack)) return 'building';
  if (/billetterie|evenements/.test(haystack)) return 'ticket';
  if (/enfants|jouets/.test(haystack)) return 'shirt';
  if (/animaux/.test(haystack)) return 'paw';
  if (/bijoux/.test(haystack)) return 'gem';
  if (/auto_ecole/.test(haystack)) return 'car';
  if (/dentiste|clinique|medical/.test(haystack)) return 'cross';
  if (/camping|loisirs|voyage/.test(haystack)) return 'tent';

  return 'generic';
}

function ActivityChipIcon({
  activity,
  className,
}: {
  activity: ActivityCatalogEntry;
  className?: string;
}) {
  const kind = resolveActivityIconKind(activity);
  return (
    <HugeiconsIcon
      icon={ACTIVITY_KIND_ICONS[kind]}
      size={16}
      strokeWidth={1.8}
      className={className ?? 'h-[0.95rem] w-[0.95rem]'}
    />
  );
}

export default function ScanPage() {
  const params = useParams();
  const router = useRouteProgressRouter();
  const searchParams = useSearchParams();
  const routeAuditId = params?.id as string;
  const stripeSessionId = searchParams?.get('session_id') ?? null;
  const queryAccessToken = searchParams?.get('t') ?? null;

  const [resolvedAuditId] = useState<string>(routeAuditId);
  const [accessToken] = useState<string | null>(queryAccessToken);
  const [scanReady, setScanReady] = useState(false);
  const [viewState, setViewState] = useState<ScanViewState>('bootstrapping');
  const [questionnaire, setQuestionnaire] = useState<QuestionnaireState>(
    buildQuestionnaireSnapshot(null, null, '', '')
  );
  const [questionError, setQuestionError] = useState('');

  const [status, setStatus] = useState<'scanning' | 'completed' | 'failed'>('scanning');
  const [errorMessage, setErrorMessage] = useState('');

  const [phaseIndex, setPhaseIndex] = useState(0);
  const [targetPhaseIndex, setTargetPhaseIndex] = useState(0);
  const [displayProgress, setDisplayProgress] = useState(0);
  const [targetProgress, setTargetProgress] = useState(PHASES[0].progress);
  const [progressFlash, setProgressFlash] = useState(false);
  const [dotsCount, setDotsCount] = useState(1);
  const [pollErrorCount, setPollErrorCount] = useState(0);
  const [phaseEnteredAt, setPhaseEnteredAt] = useState(() => Date.now());
  const reportPrefetchPromiseRef = useRef<Promise<void> | null>(null);
  const reportPrefetchStartedRef = useRef(false);
  const startScanInFlightRef = useRef(false);

  const selectedTypeMeta = useMemo(
    () => PAID_SCAN_TYPE_OPTIONS.find((option) => option.id === questionnaire.type) || null,
    [questionnaire.type]
  );
  const selectedActivities = useMemo(
    () => (questionnaire.type ? getPaidScanActivitiesByType(questionnaire.type) : []),
    [questionnaire.type]
  );
  const selectedActivityEntry = useMemo(
    () =>
      questionnaire.type && questionnaire.activity
        ? getPaidScanActivityCatalogEntry(questionnaire.type, questionnaire.activity)
        : null,
    [questionnaire.activity, questionnaire.type]
  );
  const currentQuestionStep = viewState === 'question_type'
    ? 1
    : viewState === 'question_activity'
    ? 2
    : viewState === 'question_activity_detail'
    ? 3
    : 4;
  const totalQuestionSteps = questionnaire.type
    ? getQuestionnaireStepCountForType(questionnaire.type, questionnaire.activity)
    : 4;
  const currentPhase = useMemo(
    () => PHASES[Math.min(phaseIndex, FINAL_PHASE_INDEX)],
    [phaseIndex]
  );

  const shouldAnimateDots =
    (viewState === 'starting_scan' || viewState === 'scanning') &&
    phaseIndex !== FINAL_PHASE_INDEX &&
    status !== 'failed';

  const hydrateQuestionnaire = (userContext: AuditUserContext | null | undefined) => {
    if (!userContext) return;
    setQuestionnaire({
      type: userContext.type,
      activity: userContext.activity,
      activityDetail: userContext.activityDetail || '',
      city: userContext.city || '',
    });
  };

  const resetProgressState = () => {
    setPhaseIndex(0);
    setTargetPhaseIndex(0);
    setTargetProgress(PHASES[0].progress);
    setDisplayProgress(0);
    setPhaseEnteredAt(Date.now());
    setProgressFlash(false);
  };

  const getCurrentUserContext = (
    overrides?: Partial<QuestionnaireState>
  ): AuditUserContext | null => {
    const type = overrides?.type ?? questionnaire.type;
    const activity = overrides?.activity ?? questionnaire.activity;
    const activityDetailValue = overrides?.activityDetail ?? questionnaire.activityDetail;
    const cityValue = overrides?.city ?? questionnaire.city;
    if (!type || !activity) return null;
    const activityEntry = getPaidScanActivityCatalogEntry(type, activity);
    if (!activityEntry) return null;
    const normalizedCity = normalizePaidScanCityInput(cityValue);
    if (activityEntry.cityMode === 'required' && !normalizedCity) {
      return null;
    }
    return {
      type,
      activity,
      activityDetail: getPaidScanActivityDetailInput(activityDetailValue),
      city: activityEntry.cityMode !== 'forbidden' ? normalizedCity : null,
    };
  };

  const syncProgressFromStatus = (data: {
    status: 'pending' | 'scanning' | 'completed' | 'failed';
    progress?: number;
    step?: string | null;
  }) => {
    const backendProgressRaw = Number(data.progress);
    const backendProgress = Number.isFinite(backendProgressRaw)
      ? Math.max(0, Math.min(100, Math.round(backendProgressRaw)))
      : 0;
    const stepIndex = getPhaseIndexFromStep(data.step);
    const progressIndex = getPhaseIndexFromProgress(backendProgress);
    const nextPhaseIndex = stepIndex ?? progressIndex;

    setScanReady(data.status !== 'pending');
    setStatus(
      data.status === 'completed'
        ? 'completed'
        : data.status === 'failed'
        ? 'failed'
        : 'scanning'
    );
    setViewState(
      data.status === 'completed'
        ? 'completed'
        : data.status === 'failed'
        ? 'failed'
        : 'scanning'
    );
    setPhaseIndex(nextPhaseIndex);
    setTargetPhaseIndex(nextPhaseIndex);
    setDisplayProgress(backendProgress);
    setTargetProgress(backendProgress);
    setPhaseEnteredAt(Date.now());
  };

  const startScan = async (userContext: AuditUserContext) => {
    if (startScanInFlightRef.current) {
      return;
    }

    startScanInFlightRef.current = true;
    setQuestionError('');
    setErrorMessage('');
    setPollErrorCount(0);
    setStatus('scanning');
    setScanReady(false);
    resetProgressState();
    setViewState('starting_scan');
    hydrateQuestionnaire(userContext);

    try {
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };
      if (accessToken) {
        headers.Authorization = `Bearer ${accessToken}`;
      }

      const response = await fetch(`/api/scan/${resolvedAuditId}/paid`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ sessionId: stripeSessionId, accessToken, userContext }),
      });

      if (response.status === 403) {
        router.replace('/erreur/paiement-echoue');
        return;
      }

      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        const backendError =
          payload && typeof payload.error === 'string' ? payload.error : null;
        throw new Error(
          backendError
            ? `Impossible de démarrer l’analyse (${response.status}) : ${backendError}`
            : `Impossible de démarrer l’analyse (${response.status})`
        );
      }

      const payload = await response.json();

      if (payload?.status === 'ready') {
        router.replace(`/report/${resolvedAuditId}`);
        return;
      }

      setScanReady(true);
      setViewState('scanning');
      setStatus('scanning');
      setPhaseIndex((previous) => Math.max(previous, 0));
      setTargetPhaseIndex((previous) => Math.max(previous, 0));
      setTargetProgress((previous) => Math.max(previous, PHASES[0].progress));
      setDisplayProgress((previous) => Math.max(previous, PHASES[0].progress));
    } catch (error) {
      console.error('Error starting scan:', error);
      try {
        const headers: HeadersInit = {};
        if (accessToken) {
          headers.Authorization = `Bearer ${accessToken}`;
        }

        const statusResponse = await fetch(`/api/scan/${resolvedAuditId}/status`, {
          cache: 'no-store',
          headers,
        });

        if (statusResponse.ok) {
          const statusPayload = await statusResponse.json();
          if (
            statusPayload.status === 'scanning' ||
            statusPayload.status === 'completed'
          ) {
            syncProgressFromStatus(statusPayload);
            return;
          }
        }
      } catch (statusError) {
        console.error('Error checking scan status after start failure:', statusError);
      }

      setStatus('failed');
      setViewState('failed');
      setErrorMessage('Impossible de lancer l’analyse. Veuillez réessayer.');
    } finally {
      startScanInFlightRef.current = false;
    }
  };

  useEffect(() => {
    if (!resolvedAuditId) {
      return;
    }

    let cancelled = false;

    const bootstrapScanPage = async () => {
      try {
        const headers: HeadersInit = {};
        if (accessToken) {
          headers.Authorization = `Bearer ${accessToken}`;
        }

        const response = await fetch(`/api/scan/${resolvedAuditId}/status`, {
          cache: 'no-store',
          headers,
        });

        if (!response.ok) {
          if (!cancelled) {
            router.replace('/');
          }
          return;
        }

        const data = await response.json();
        if (cancelled) return;

        hydrateQuestionnaire(data.userContext || null);

        if (data.status === 'completed' && data.fullReportReady) {
          router.replace(`/report/${resolvedAuditId}`);
          return;
        }

        if (data.status === 'scanning' || data.status === 'completed' || data.status === 'failed') {
          syncProgressFromStatus(data);
          return;
        }

        if (data.userContext && data.scanContext) {
          const persistedUserContext = getCurrentUserContext({
            type: data.userContext.type,
            activity: data.userContext.activity,
            activityDetail: data.userContext.activityDetail || '',
            city: data.userContext.city || '',
          });
          if (persistedUserContext) {
            void startScan(persistedUserContext);
            return;
          }
        }

        router.replace(data?.url ? `/?url=${encodeURIComponent(data.url)}` : '/');
      } catch (error) {
        console.error('Error bootstrapping scan page:', error);
        if (!cancelled) {
          router.replace('/');
        }
      }
    };

    void bootstrapScanPage();

    return () => {
      cancelled = true;
    };
  }, [accessToken, resolvedAuditId, router]);

  useEffect(() => {
    if (!resolvedAuditId || !scanReady || status !== 'scanning') {
      return;
    }

    const pollStatus = async () => {
      try {
        const headers: HeadersInit = {};
        if (accessToken) {
          headers.Authorization = `Bearer ${accessToken}`;
        }

        const response = await fetch(`/api/scan/${resolvedAuditId}/status`, {
          cache: 'no-store',
          headers,
        });

        if (!response.ok) {
          throw new Error('Impossible de récupérer le statut');
        }

        const data = await response.json();
        setPollErrorCount(0);
        hydrateQuestionnaire(data.userContext || null);

        if (data.status === 'completed' && data.fullReportReady) {
          setStatus('completed');
          setViewState('completed');
          setTargetPhaseIndex(FINAL_PHASE_INDEX);
          setTargetProgress(100);
        } else if (data.status === 'failed') {
          setStatus('failed');
          setViewState('failed');
          setErrorMessage('Une erreur est survenue. Veuillez réessayer.');
        } else {
          const backendProgressRaw = Number(data.progress);
          const backendProgress = Number.isFinite(backendProgressRaw)
            ? Math.max(0, Math.min(100, Math.round(backendProgressRaw)))
            : 0;
          const stepIndex = getPhaseIndexFromStep(data.step);
          const progressIndex = getPhaseIndexFromProgress(backendProgress);
          const nextPhaseIndex = stepIndex ?? progressIndex;

          setStatus('scanning');
          setViewState('scanning');
          setTargetPhaseIndex((previous) => Math.max(previous, nextPhaseIndex));
          setTargetProgress((previous) => Math.max(previous, backendProgress));
        }
      } catch (error) {
        console.error('Error polling status:', error);
        setPollErrorCount((previous) => {
          const next = previous + 1;
          if (next >= POLL_ERROR_THRESHOLD) {
            setStatus('failed');
            setViewState('failed');
            setErrorMessage('Impossible de récupérer la progression du scan. Réessayez dans un instant.');
          }
          return next;
        });
      }
    };

    const interval = setInterval(pollStatus, POLL_INTERVAL_MS);
    void pollStatus();

    return () => clearInterval(interval);
  }, [accessToken, resolvedAuditId, scanReady, status]);

  useEffect(() => {
    if (!scanReady) return;
    if (status === 'failed') return;
    if (phaseIndex >= targetPhaseIndex) return;

    const elapsed = Date.now() - phaseEnteredAt;
    const waitMs = Math.max(0, PHASE_MIN_DURATION_MS - elapsed);

    const phaseTimer = setTimeout(() => {
      setPhaseIndex((previous) => Math.min(previous + 1, targetPhaseIndex));
      setPhaseEnteredAt(Date.now());
    }, waitMs);

    return () => clearTimeout(phaseTimer);
  }, [phaseEnteredAt, phaseIndex, scanReady, status, targetPhaseIndex]);

  useEffect(() => {
    if (!scanReady) return;
    if (status === 'failed') return;

    const progressTimer = setInterval(() => {
      const floor = PHASES[phaseIndex].progress;
      const cap =
        phaseIndex >= FINAL_PHASE_INDEX ? 100 : PHASES[phaseIndex + 1].progress - 1;
      const boundedTarget =
        status === 'completed'
          ? 100
          : Math.max(floor, Math.min(cap, targetProgress));

      setDisplayProgress((previous) => {
        if (boundedTarget <= previous) return previous;
        const delta = boundedTarget - previous;
        const step = Math.max(0.8, delta * 0.2);
        const next = previous + step;
        return Math.min(next, boundedTarget);
      });
    }, 120);

    return () => clearInterval(progressTimer);
  }, [phaseIndex, scanReady, status, targetProgress]);

  useEffect(() => {
    if (status !== 'completed' || phaseIndex !== FINAL_PHASE_INDEX) {
      return;
    }

    const redirectTimer = setTimeout(() => {
      if (!resolvedAuditId) return;
      const prefetchPromise = reportPrefetchPromiseRef.current;
      const openReport = async () => {
        if (prefetchPromise) {
          await Promise.race([
            prefetchPromise.catch(() => undefined),
            new Promise((resolve) => setTimeout(resolve, 2500)),
          ]);
        }
        router.push(`/report/${resolvedAuditId}`);
      };

      void openReport();
    }, FINAL_REDIRECT_DELAY_MS);

    return () => clearTimeout(redirectTimer);
  }, [phaseIndex, status, resolvedAuditId, router]);

  useEffect(() => {
    if (status !== 'completed' || !resolvedAuditId || reportPrefetchStartedRef.current) {
      return;
    }

    reportPrefetchStartedRef.current = true;
    reportPrefetchPromiseRef.current = (async () => {
      try {
        const headers: HeadersInit = {};
        if (accessToken) {
          headers.Authorization = `Bearer ${accessToken}`;
        }

        const response = await fetch(`/api/report/${resolvedAuditId}`, {
          cache: 'no-store',
          headers,
        });

        if (!response.ok) {
          return;
        }

        const auditData = await response.json();
        if (typeof window !== 'undefined') {
          window.sessionStorage.setItem(
            `prefetched-report:${resolvedAuditId}`,
            JSON.stringify(auditData)
          );
        }
      } catch (error) {
        console.warn('Unable to prefetch report payload from scan page.', error);
      }
    })();
  }, [accessToken, resolvedAuditId, status]);

  useEffect(() => {
    if (!shouldAnimateDots) {
      return;
    }

    const dotsTimer = setInterval(() => {
      setDotsCount((prev) => (prev === 3 ? 1 : prev + 1));
    }, DOTS_INTERVAL_MS);

    return () => clearInterval(dotsTimer);
  }, [shouldAnimateDots]);

  useEffect(() => {
    if (phaseIndex !== FINAL_PHASE_INDEX || status !== 'completed') {
      return;
    }

    setProgressFlash(true);
    const flashTimer = setTimeout(() => setProgressFlash(false), 500);

    return () => clearTimeout(flashTimer);
  }, [phaseIndex, status]);

  const progressTitle =
    viewState === 'starting_scan'
      ? 'Préparation de votre audit'
      : currentPhase.title;
  const progressSubtitleBase =
    viewState === 'starting_scan'
      ? 'Calibration de votre analyse personnalisée'
      : currentPhase.subtitle;
  const animatedSubtitle = shouldAnimateDots
    ? `${progressSubtitleBase}${'.'.repeat(dotsCount)}`
    : progressSubtitleBase;
  const progressValue = viewState === 'starting_scan' ? 4 : displayProgress;
  const progressPercent = Math.round(progressValue);
  const usesQuestionHeroLayout =
    viewState === 'question_type' ||
    viewState === 'question_activity' ||
    viewState === 'question_activity_detail' ||
    viewState === 'question_city';
  const panelWidthClass = 'max-w-2xl';
  const showLoadingBranding =
    viewState === 'starting_scan' ||
    viewState === 'scanning' ||
    viewState === 'completed' ||
    viewState === 'failed';

  const handleTypeSelection = (type: PaidScanBusinessType) => {
    setQuestionError('');
    setQuestionnaire(buildQuestionnaireSnapshot(type, null, '', ''));
    setViewState('question_activity');
  };

  const handleActivitySelection = (activity: string) => {
    if (!questionnaire.type) return;
    const activityEntry = getPaidScanActivityCatalogEntry(questionnaire.type, activity);
    if (!activityEntry) return;

    const nextQuestionnaire = buildQuestionnaireSnapshot(
      questionnaire.type,
      activity,
      '',
      ''
    );
    setQuestionError('');
    setQuestionnaire(nextQuestionnaire);

    setViewState('question_activity_detail');
  };

  const handleBackToActivitySelection = () => {
    setQuestionError('');
    setQuestionnaire(buildQuestionnaireSnapshot(questionnaire.type, null, '', ''));
    setViewState('question_activity');
  };

  const handleActivityDetailSkip = () => {
    if (!questionnaire.type || !questionnaire.activity) return;

    const activityEntry = getPaidScanActivityCatalogEntry(questionnaire.type, questionnaire.activity);
    if (!activityEntry) return;

    setQuestionnaire((previous) => ({
      ...previous,
      activityDetail: '',
    }));
    setQuestionError('');

    if (usesPaidScanCityStep(activityEntry)) {
      setViewState('question_city');
      return;
    }

    const userContext = getCurrentUserContext({
      type: questionnaire.type,
      activity: questionnaire.activity,
      activityDetail: '',
      city: '',
    });
    if (!userContext) {
      setQuestionError('Cette activité ne peut pas être utilisée pour lancer le scan.');
      return;
    }

    void startScan(userContext);
  };

  const handleActivityDetailSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!questionnaire.type || !questionnaire.activity) return;

    const activityEntry = getPaidScanActivityCatalogEntry(questionnaire.type, questionnaire.activity);
    if (!activityEntry) return;

    setQuestionError('');

    if (usesPaidScanCityStep(activityEntry)) {
      setViewState('question_city');
      return;
    }

    const userContext = getCurrentUserContext({
      type: questionnaire.type,
      activity: questionnaire.activity,
      activityDetail: questionnaire.activityDetail,
      city: '',
    });
    if (!userContext) {
      setQuestionError('Cette activité ne peut pas être utilisée pour lancer le scan.');
      return;
    }

    void startScan(userContext);
  };

  const handleCitySubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const userContext = getCurrentUserContext();
    if (!userContext) {
      setQuestionError('Veuillez renseigner la ville avant de continuer.');
      return;
    }
    setQuestionError('');
    void startScan(userContext);
  };

  const handleRetryPolling = () => {
    const userContext = getCurrentUserContext();
    setStatus('scanning');
    setErrorMessage('');
    setPollErrorCount(0);

    if (!userContext) {
      setScanReady(false);
      resetProgressState();
      setViewState('question_type');
      return;
    }

    void startScan(userContext);
  };

  return (
    <div className="site-grid-bg ds-shell relative min-h-screen">
      <div className="relative min-h-screen w-full">
        <div className="absolute inset-0 flex items-center justify-center p-4 z-10">
          <div className="flex w-full flex-col items-center justify-center gap-5 sm:gap-6">
            <AnimatePresence initial={false}>
              {showLoadingBranding && (
                <motion.div
                  key="scan-branding"
                  initial={{ opacity: 0, y: -12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={BRANDING_TRANSITION}
                  className="pointer-events-none z-20"
                >
                  <div className="flex items-center justify-center gap-2.5 md:gap-3">
                    <img src="/logo.svg" alt="Qory" className="h-[22px] w-[22px] brightness-0 invert md:h-[26px] md:w-[26px]" />
                    <span className="text-2xl font-semibold text-primary md:text-3xl"><QoryWord /></span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div
              className={
                usesQuestionHeroLayout
                  ? 'w-full max-w-6xl'
                  : `${panelWidthClass} ds-card w-full p-5 sm:p-8`
              }
            >
            <AnimatePresence mode="wait" initial={false}>
              {viewState === 'bootstrapping' && (
                <motion.div
                  key="bootstrapping"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={PANEL_FADE_TRANSITION}
                  className="text-center py-8 sm:py-10"
                >
                  <SiteSpinner className="mx-auto mb-5" />
                  <h1 className="text-[1.35rem] sm:text-3xl font-bold text-primary mb-2">
                    Préparation de votre audit
                  </h1>
                  <p className="text-sm sm:text-base text-secondary">
                    Nous récupérons votre session et préparons la suite.
                  </p>
                </motion.div>
              )}

              {(viewState === 'question_type' ||
                viewState === 'question_activity' ||
                viewState === 'question_activity_detail' ||
                viewState === 'question_city') && (
                <motion.div
                  key={viewState}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={QUESTION_STATE_TRANSITION}
                >
                  <div className={`text-center ${usesQuestionHeroLayout ? 'mb-8 sm:mb-10' : 'mb-6'}`}>
                    <p
                      className={
                        usesQuestionHeroLayout
                          ? 'mb-4 inline-flex items-center rounded-full border border-[#4BA7F5]/15 bg-[#4BA7F5]/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-[#4BA7F5]'
                          : 'mb-3 text-xs sm:text-sm uppercase tracking-[0.22em] text-tertiary'
                      }
                    >
                      Étape {currentQuestionStep}/{totalQuestionSteps}
                    </p>

                    {viewState === 'question_type' && (
                      <>
                        <h1 className="mx-auto mb-3 max-w-4xl text-[2.1rem] font-bold leading-[1.1] tracking-tight text-primary sm:text-4xl md:text-5xl">
                          Quel type de site ou d’activité décrit le mieux votre entreprise ?
                        </h1>
                        <p className="mx-auto max-w-2xl text-sm text-secondary sm:text-base">
                          Nous allons calibrer vos requêtes IA à partir de votre activité réelle.
                        </p>
                      </>
                    )}

                    {viewState === 'question_activity' && (
                      <>
                        <h1 className="mx-auto mb-3 max-w-4xl text-[2.1rem] font-bold leading-[1.1] tracking-tight text-primary sm:text-4xl md:text-5xl">
                          Quelle activité décrit le mieux votre business ?
                        </h1>
                        <p className="mx-auto max-w-2xl text-sm text-secondary sm:text-base">
                          {selectedTypeMeta
                            ? `Sélection actuelle : ${selectedTypeMeta.label}`
                            : 'Choisissez l’activité la plus proche de votre offre.'}
                        </p>
                      </>
                    )}

                    {viewState === 'question_activity_detail' && (
                      <>
                        <h1 className="mx-auto mb-3 max-w-4xl text-[2.1rem] font-bold leading-[1.1] tracking-tight text-primary sm:text-4xl md:text-5xl">
                          Voulez-vous préciser votre activité ?
                        </h1>
                        <p className="mx-auto max-w-2xl text-sm text-secondary sm:text-base">
                          Cette précision nous aide à formuler des requêtes plus proches de votre cas réel.
                        </p>
                      </>
                    )}

                    {viewState === 'question_city' && (
                      <>
                        <h1 className="mx-auto mb-3 max-w-4xl text-[2.1rem] font-bold leading-[1.1] tracking-tight text-primary sm:text-4xl md:text-5xl">
                          {selectedActivityEntry?.cityMode === 'optional'
                            ? 'Avez-vous une ville principale à préciser ?'
                            : 'Dans quelle ville êtes-vous principalement recherché ?'}
                        </h1>
                        <p className="mx-auto max-w-2xl text-sm text-secondary sm:text-base">
                          {selectedActivityEntry?.cityMode === 'optional'
                            ? 'Ajoutez une ville si votre visibilité IA dépend d’un marché local.'
                            : 'Nous utiliserons cette ville pour générer des requêtes locales pertinentes.'}
                        </p>
                      </>
                    )}
                  </div>

                  {viewState === 'question_type' && (
                    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                      {PAID_SCAN_TYPE_OPTIONS.map((option) => (
                        <button
                          key={option.id}
                          type="button"
                          onClick={() => handleTypeSelection(option.id)}
                          className="group relative flex min-h-[164px] items-end overflow-hidden rounded-[24px] border border-white/[0.10] bg-[#111214] p-5 text-left transition-all duration-200 hover:-translate-y-1 hover:border-white/[0.18] hover:bg-[#191B20] sm:min-h-[182px] sm:p-6 xl:min-h-[192px]"
                        >
                          <TypeOptionIcon
                            type={option.id}
                            className="absolute right-5 top-5 h-11 w-11 text-[#4BA7F5] sm:right-6 sm:top-6 sm:h-[3.55rem] sm:w-[3.55rem]"
                          />
                          <div className="max-w-[12ch] text-[1.5rem] font-semibold leading-[1.06] tracking-tight text-white sm:text-[1.72rem]">
                            {option.label}
                          </div>
                        </button>
                      ))}
                    </div>
                  )}

                  {viewState === 'question_activity' && (
                    <div className="space-y-4">
                      <div className="mx-auto flex max-w-4xl flex-wrap justify-center gap-2.5">
                        {selectedActivities.map((activity) => (
                          <button
                            key={activity.id}
                            type="button"
                            onClick={() => handleActivitySelection(activity.id)}
                            className={`inline-flex items-center justify-center gap-2 rounded-full px-4 py-2 text-sm sm:text-[15px] transition-all duration-200 ${
                              questionnaire.activity === activity.id
                                ? 'bg-white text-black ring-1 ring-white'
                                : 'bg-white/[0.06] text-white/70 ring-1 ring-white/[0.10] hover:-translate-y-1 hover:bg-white/[0.10] hover:text-white'
                            }`}
                          >
                            <ActivityChipIcon
                              activity={activity}
                              className="h-[0.95rem] w-[0.95rem] shrink-0 text-[#4BA7F5]"
                            />
                            {activity.label}
                          </button>
                        ))}
                      </div>

                      <button
                        type="button"
                        onClick={() => setViewState('question_type')}
                        className="mx-auto block rounded-full px-3 py-1.5 text-sm text-white/45 transition-colors hover:text-white/75"
                      >
                        Retour à l’étape précédente
                      </button>
                    </div>
                  )}

                  {viewState === 'question_activity_detail' && (
                    <form onSubmit={handleActivityDetailSubmit} className="mx-auto max-w-xl space-y-4">
                      <div>
                        <label
                          htmlFor="scan-activity-detail-input"
                          className="mb-2 block text-sm font-medium text-secondary"
                        >
                          {selectedActivityEntry?.detailLabel || "Précision de l'activité"}
                        </label>
                        <div
                          onClick={(event) => {
                            const input = event.currentTarget.querySelector('input');
                            if (input instanceof HTMLInputElement) {
                              input.focus();
                            }
                          }}
                          className="flex cursor-text flex-wrap items-center gap-x-0 gap-y-1 rounded-[24px] border border-white/[0.12] bg-white/[0.06] px-4 py-3 transition-colors focus-within:border-white/[0.22] focus-within:bg-white/[0.09]"
                        >
                          <span className="shrink-0 pr-[0.35ch] text-base text-white/45">
                            {selectedActivityEntry?.detailPrefix || 'pour'}
                          </span>
                          <input
                            id="scan-activity-detail-input"
                            type="text"
                            value={questionnaire.activityDetail}
                            onChange={(event) => {
                              setQuestionError('');
                              setQuestionnaire((previous) => ({
                                ...previous,
                                activityDetail: event.target.value,
                              }));
                            }}
                            placeholder=""
                            className="min-w-[180px] flex-1 bg-transparent py-1 text-base text-white placeholder:text-white/35 outline-none transition-colors focus:ring-0"
                          />
                        </div>
                      </div>

                      <div className="space-y-3">
                        <button
                          type="submit"
                          className="inline-flex w-full items-center justify-center gap-2 rounded-[24px] bg-white px-5 py-3.5 text-base font-semibold text-black transition-colors hover:bg-[#F2F2F2]"
                        >
                          Continuer
                        </button>

                        <button
                          type="button"
                          onClick={handleActivityDetailSkip}
                          className="mx-auto block rounded-full px-3 py-1.5 text-sm text-white/45 transition-colors hover:text-white/75"
                        >
                          Passer cette étape
                        </button>

                        <button
                          type="button"
                          onClick={handleBackToActivitySelection}
                          className="mx-auto flex w-fit items-center justify-center gap-2 rounded-full px-3 py-1.5 text-[15px] font-medium text-white/55 transition-colors hover:text-white/85"
                        >
                          <HugeiconsIcon
                            icon={ArrowLeft01Icon}
                            size={18}
                            strokeWidth={1.9}
                            className="h-[1.05rem] w-[1.05rem] shrink-0"
                          />
                          Retour
                        </button>
                      </div>
                    </form>
                  )}

                  {viewState === 'question_city' && (
                    <form onSubmit={handleCitySubmit} className="mx-auto max-w-xl space-y-4">
                      <CityAutocompleteInput
                        value={questionnaire.city}
                        onErrorReset={() => setQuestionError('')}
                        onChange={(city) => {
                          setQuestionnaire((previous) => ({
                            ...previous,
                            city,
                          }));
                        }}
                        placeholder={
                          selectedActivityEntry?.cityMode === 'optional'
                            ? 'Ville ou zone principale'
                            : 'Recherchez une ville ou une zone'
                        }
                      />

                      <div className="space-y-3">
                        <button
                          type="submit"
                          className="inline-flex w-full items-center justify-center rounded-[24px] bg-white px-5 py-3.5 text-base font-semibold text-black transition-colors hover:bg-[#F2F2F2]"
                        >
                          Lancer l&apos;analyse
                        </button>

                        {canSkipPaidScanCityStep(selectedActivityEntry) ? (
                          <button
                            type="button"
                            onClick={() => {
                              setQuestionError('');
                              setQuestionnaire((previous) => ({
                                ...previous,
                                city: '',
                              }));
                              const userContext = getCurrentUserContext({
                                type: questionnaire.type,
                                activity: questionnaire.activity,
                                activityDetail: questionnaire.activityDetail,
                                city: '',
                              });
                              if (!userContext) {
                                setQuestionError('Cette activité ne peut pas être utilisée pour lancer le scan.');
                                return;
                              }
                              void startScan(userContext);
                            }}
                            className="mx-auto block rounded-full px-3 py-1.5 text-sm text-white/45 transition-colors hover:text-white/75"
                          >
                            Passer cette étape
                          </button>
                        ) : null}

                        <button
                          type="button"
                          onClick={() => setViewState('question_activity_detail')}
                          className="mx-auto flex w-fit items-center justify-center gap-2 rounded-full px-3 py-1.5 text-[15px] font-medium text-white/55 transition-colors hover:text-white/85"
                        >
                          <HugeiconsIcon
                            icon={ArrowLeft01Icon}
                            size={18}
                            strokeWidth={1.9}
                            className="h-[1.05rem] w-[1.05rem] shrink-0"
                          />
                          Retour
                        </button>
                      </div>
                    </form>
                  )}

                  {questionError && (
                    <p className="mt-4 text-sm text-error text-center">{questionError}</p>
                  )}
                </motion.div>
              )}

              {(viewState === 'starting_scan' ||
                viewState === 'scanning' ||
                viewState === 'completed' ||
                viewState === 'failed') && (
                <motion.div
                  key={viewState === 'failed' ? 'failed-progress' : viewState}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{
                    duration: viewState === 'starting_scan' ? 0.34 : 0.4,
                    ease: SOFT_EASE,
                  }}
                >
                  <div className="text-center mb-3 min-h-[72px] sm:min-h-[84px]">
                    <AnimatePresence mode="wait" initial={false}>
                      <motion.div
                        key={`${viewState}-${phaseIndex}`}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -6 }}
                        transition={{
                          duration: phaseIndex === 0 ? 0.46 : 0.36,
                          ease: SOFT_EASE,
                        }}
                      >
                        <h1 className="text-[1.35rem] sm:text-3xl font-bold text-primary mb-2">
                          {progressTitle}
                        </h1>
                        <p className="text-sm sm:text-base text-secondary">{animatedSubtitle}</p>
                      </motion.div>
                    </AnimatePresence>
                  </div>

                  <div className="mb-4">
                    <div className="flex justify-between text-xs sm:text-sm text-secondary mb-2">
                      <span>{status === 'failed' ? 'Erreur' : 'Progression'}</span>
                      <span>{progressPercent}%</span>
                    </div>
                    <div className="w-full rounded-full bg-white/[0.10] h-3 overflow-hidden">
                      <div
                        className={`h-3 rounded-full bg-gradient-to-r from-white to-white/85 ${
                          progressFlash ? 'brightness-110 shadow-[0_0_18px_rgba(255,255,255,0.35)]' : ''
                        }`}
                        style={{
                          width: `${progressValue}%`,
                          transition:
                            'width 220ms linear, filter 0.5s ease, box-shadow 0.5s ease',
                        }}
                      />
                    </div>
                  </div>

                  {viewState !== 'starting_scan' && currentPhase.eta && status !== 'failed' && (
                    <p className="text-center text-xs sm:text-sm text-tertiary mb-4">
                      {currentPhase.eta}
                    </p>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
            </div>
          </div>
        </div>

        <AnimatePresence>
          {status === 'failed' && (
            <motion.div
              key="scan-error-modal"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={MODAL_TRANSITION}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/72 p-4 backdrop-blur-[2px]"
            >
              <motion.div
                initial={{ opacity: 0, y: 14, scale: 0.985 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.99 }}
                transition={QUESTION_STATE_TRANSITION}
                className="ds-card relative w-full max-w-xl overflow-hidden"
              >
                <div className="relative z-10 px-5 py-6 sm:px-8 sm:py-9 text-center">
                  <div className="mx-auto mb-4 sm:mb-6 flex h-12 w-12 sm:h-16 sm:w-16 items-center justify-center rounded-full border border-error/40 bg-error/10 text-error">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-6 w-6 sm:h-8 sm:w-8"
                      aria-hidden="true"
                    >
                      <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                      <line x1="12" y1="9" x2="12" y2="13" />
                      <line x1="12" y1="17" x2="12.01" y2="17" />
                    </svg>
                  </div>

                  <h3 className="text-2xl sm:text-3xl font-bold text-primary mb-3">
                    Analyse interrompue
                  </h3>
                  <p className="text-sm sm:text-base text-secondary leading-relaxed max-w-lg mx-auto">
                    {errorMessage || 'Nous n’avons pas pu finaliser votre rapport. Réessayez pour reprendre l’analyse.'}
                  </p>

                  <div className="mt-6 sm:mt-8 flex items-center justify-center gap-3">
                    <button
                      type="button"
                      onClick={handleRetryPolling}
                      className="inline-flex items-center justify-center px-5 py-2.5 rounded-lg bg-white text-sm sm:text-base text-black font-semibold hover:bg-[#F2F2F2] transition-colors"
                    >
                      Réessayer
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

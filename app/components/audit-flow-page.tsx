'use client';

import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { HugeiconsIcon } from '@hugeicons/react';
import { ArrowLeft01Icon } from '@hugeicons/core-free-icons';
import type { AuditUserContext, PaidScanBusinessType } from '@/types';
import {
  PAID_SCAN_TYPE_OPTIONS,
  getPaidScanActivitiesByType,
  getPaidScanActivityCatalogEntry,
  getPaidScanActivityDetailInput,
  getQuestionnaireStepCountForType,
  normalizePaidScanCityInput,
  usesPaidScanCityStep,
} from '@/lib/scanner/paid-scan-catalog';
import { ActivityChipIcon, TypeOptionIcon } from '@/app/components/paid-scan-questionnaire-icons';
import QoryWord from '@/app/components/qory-word';
import CityAutocompleteInput from '@/app/components/city-autocomplete-input';
import { useRouteProgressRouter } from '@/app/components/route-progress';

type ViewState =
  | 'url'
  | 'question_type'
  | 'question_activity'
  | 'question_activity_detail'
  | 'question_city'
  | 'payment';

type QuestionnaireState = {
  type: PaidScanBusinessType | null;
  activity: string | null;
  activityDetail: string;
  city: string;
};

const SOFT_EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];
const STEP_TRANSITION = { duration: 0.4, ease: SOFT_EASE };
const STEP_EXIT_TRANSITION = { duration: 0.32, ease: SOFT_EASE };

function buildQuestionnaireSnapshot(
  type: PaidScanBusinessType | null,
  activity: string | null,
  activityDetail: string,
  city: string
): QuestionnaireState {
  return { type, activity, activityDetail, city };
}

function normalizeInitialUrl(rawUrl: string): string {
  const trimmedUrl = rawUrl.trim();
  if (!trimmedUrl) {
    return '';
  }

  return trimmedUrl.startsWith('http') ? trimmedUrl : `https://${trimmedUrl}`;
}

function QoryMark({ className = '' }: { className?: string }) {
  return <img aria-hidden="true" src="/logo.svg" alt="" className={className} />;
}

function AuditBrandLockup({ className = '' }: { className?: string }) {
  return (
    <div className={`flex items-center justify-center gap-2.5 md:gap-3 ${className}`.trim()}>
      <QoryMark className="h-[22px] w-[22px] brightness-0 invert md:h-[26px] md:w-[26px]" />
      <span className="text-[1.9rem] font-semibold text-primary md:text-3xl">
        <QoryWord />
      </span>
    </div>
  );
}

export default function AuditFlowPage({
  initialUrl = '',
  initialReturnTo = '/',
}: {
  initialUrl?: string;
  initialReturnTo?: string;
}) {
  const normalizedInitialUrl = useMemo(() => normalizeInitialUrl(initialUrl), [initialUrl]);
  const router = useRouteProgressRouter();
  const requiresUrlStep = normalizedInitialUrl.length === 0;

  const [viewState, setViewState] = useState<ViewState>(
    requiresUrlStep ? 'url' : 'question_type'
  );
  const [viewHistory, setViewHistory] = useState<ViewState[]>([]);
  const [validatedUrl, setValidatedUrl] = useState(normalizedInitialUrl);
  const [questionnaire, setQuestionnaire] = useState<QuestionnaireState>(
    buildQuestionnaireSnapshot(null, null, '', '')
  );
  const [error, setError] = useState('');
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  const selectedTypeMeta = useMemo(
    () => PAID_SCAN_TYPE_OPTIONS.find((option) => option.id === questionnaire.type) || null,
    [questionnaire.type]
  );
  const activityOptions = useMemo(
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
  const questionStepOffset = requiresUrlStep ? 1 : 0;
  const currentQuestionStep =
    viewState === 'url'
      ? 1
      : viewState === 'question_type'
        ? 1 + questionStepOffset
        : viewState === 'question_activity'
          ? 2 + questionStepOffset
          : viewState === 'question_activity_detail'
            ? 3 + questionStepOffset
            : 4 + questionStepOffset;
  const totalQuestionStepsBase = questionnaire.type
    ? getQuestionnaireStepCountForType(questionnaire.type, questionnaire.activity)
    : 4;
  const totalQuestionSteps = totalQuestionStepsBase + questionStepOffset;

  const handleUrlSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');

    if (!validatedUrl.trim()) {
      setError('Veuillez entrer une URL');
      return;
    }

    const normalizedUrl = normalizeInitialUrl(validatedUrl);

    try {
      new URL(normalizedUrl);
      setValidatedUrl(normalizedUrl);
      advanceToView('question_type');
    } catch {
      setError('URL invalide');
    }
  };

  const advanceToView = (nextView: ViewState) => {
    setViewHistory((previousHistory) =>
      viewState === nextView ? previousHistory : [...previousHistory, viewState]
    );
    setViewState(nextView);
  };

  useEffect(() => {
    const resetCheckoutState = () => {
      setCheckoutLoading(false);
    };

    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        resetCheckoutState();
      }
    };

    window.addEventListener('pageshow', resetCheckoutState);
    window.addEventListener('focus', resetCheckoutState);
    document.addEventListener('visibilitychange', onVisibilityChange);

    return () => {
      window.removeEventListener('pageshow', resetCheckoutState);
      window.removeEventListener('focus', resetCheckoutState);
      document.removeEventListener('visibilitychange', onVisibilityChange);
    };
  }, []);

  const getCurrentUserContext = (
    overrides?: Partial<QuestionnaireState>
  ): AuditUserContext | null => {
    const type = overrides?.type ?? questionnaire.type;
    const activity = overrides?.activity ?? questionnaire.activity;
    const activityDetailValue = overrides?.activityDetail ?? questionnaire.activityDetail;
    const cityValue = overrides?.city ?? questionnaire.city;

    if (!type || !activity) {
      return null;
    }

    const activityEntry = getPaidScanActivityCatalogEntry(type, activity);
    if (!activityEntry) {
      return null;
    }

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

  const handleTypeSelection = (type: PaidScanBusinessType) => {
    setError('');
    setQuestionnaire(buildQuestionnaireSnapshot(type, null, '', ''));
    advanceToView('question_activity');
  };

  const handleActivitySelection = (activity: string) => {
    if (!questionnaire.type) return;

    const activityEntry = getPaidScanActivityCatalogEntry(questionnaire.type, activity);
    if (!activityEntry) return;

    setError('');
    setQuestionnaire(
      buildQuestionnaireSnapshot(questionnaire.type, activityEntry.id, '', '')
    );
    advanceToView('question_activity_detail');
  };

  const handleActivityDetailSkip = () => {
    if (!questionnaire.type || !questionnaire.activity) return;

    const activityEntry = getPaidScanActivityCatalogEntry(questionnaire.type, questionnaire.activity);
    if (!activityEntry) return;

    setError('');
    setQuestionnaire((previous) => ({
      ...previous,
      activityDetail: '',
    }));
    if (usesPaidScanCityStep(activityEntry)) {
      advanceToView('question_city');
      return;
    }

    advanceToView('payment');
  };

  const handleActivityDetailSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    if (!questionnaire.type || !questionnaire.activity) return;

    const activityEntry = getPaidScanActivityCatalogEntry(questionnaire.type, questionnaire.activity);
    if (!activityEntry) return;

    if (usesPaidScanCityStep(activityEntry)) {
      advanceToView('question_city');
      return;
    }

    advanceToView('payment');
  };

  const handleCitySubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const userContext = getCurrentUserContext();
    if (!userContext) {
      setError('Veuillez renseigner la ville avant de continuer.');
      return;
    }

    setError('');
    advanceToView('payment');
  };

  const handleCheckout = async () => {
    setCheckoutLoading(true);
    setError('');

    try {
      const userContext = getCurrentUserContext();
      if (!userContext) {
        throw new Error('Questionnaire incomplet');
      }

      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: validatedUrl, userContext }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || 'Erreur lors de la création du paiement');
      }

      const data = await response.json();
      window.location.assign(data.checkoutUrl);
    } catch (err) {
      const rawMessage = err instanceof Error ? err.message : '';
      const normalized = rawMessage.toLowerCase();
      const isUrlRelatedError =
        normalized.includes('url') ||
        normalized.includes('hostname') ||
        normalized.includes('origin') ||
        normalized.includes('blocked') ||
        normalized.includes('private');

      setError(isUrlRelatedError ? 'URL invalide' : 'Impossible de lancer le paiement');
      setCheckoutLoading(false);
    }
  };

  const handleFlowBack = () => {
    setError('');
    setCheckoutLoading(false);

    if (viewHistory.length > 0) {
      const previousView = viewHistory[viewHistory.length - 1];
      setViewHistory((currentHistory) => currentHistory.slice(0, -1));
      if (previousView === 'question_activity') {
        setQuestionnaire((previous) => ({
          ...previous,
          activity: null,
          activityDetail: '',
          city: '',
        }));
      }
      setViewState(previousView);
      return;
    }

    if (viewState === 'payment') {
      return;
    }

    const canUseBrowserBack = typeof window !== 'undefined' && window.history.length > 1;

    if (viewState === 'question_type' || viewState === 'url') {
      if (canUseBrowserBack) {
        router.back();
        return;
      }

      router.push(initialReturnTo || '/');
      return;
    }

    setQuestionnaire(buildQuestionnaireSnapshot(null, null, '', ''));
    setValidatedUrl('');
    router.push(initialReturnTo || '/');
  };

  const showFlowBackControl = true;

  return (
    <main className="site-grid-bg ds-shell relative min-h-[100svh]">
      <div className="relative min-h-[100svh] w-full px-4 sm:px-6">
        {showFlowBackControl && (
          <motion.button
            key="flow-back"
            type="button"
            onClick={handleFlowBack}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={STEP_TRANSITION}
            className="pointer-events-auto absolute left-4 top-7 z-20 -ml-3 inline-flex items-center gap-2 rounded-full px-3 py-2 text-[15px] font-medium text-white/70 transition-colors hover:text-white sm:left-6 sm:top-8 md:left-8"
          >
            <HugeiconsIcon
              icon={ArrowLeft01Icon}
              size={18}
              strokeWidth={1.9}
              className="h-[1.05rem] w-[1.05rem] shrink-0"
            />
            Retour
          </motion.button>
        )}

        <div className="mx-auto h-full w-full max-w-6xl">
          <AnimatePresence mode="wait" initial={false}>
            {viewState === 'payment' ? (
              <motion.div
                key="payment-card"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0, transition: STEP_TRANSITION }}
                exit={{ opacity: 0, y: -12, transition: STEP_EXIT_TRANSITION }}
                className="flex min-h-[100svh] w-full items-center justify-center px-1 py-10"
              >
                <div className="mx-auto flex w-full max-w-lg flex-col items-center">
                  <AuditBrandLockup className="mb-[72px] sm:mb-[76px] md:mb-[48px]" />

                  <div className="w-full">
                    <div className="ds-card p-5 sm:p-8">
                      <h2 className="mb-4 text-center text-xl font-bold text-primary sm:mb-5 sm:text-2xl">
                        Votre analyse est prête à être lancée
                      </h2>

                      <div className="mb-6 space-y-3 sm:mb-8 sm:space-y-4">
                        {[
                          {
                            title: 'Visibilité sur 3 moteurs IA',
                            desc: 'ChatGPT, Claude et Perplexity analysés sur 20+ requêtes',
                          },
                          {
                            title: 'Informations attribuées par les IA',
                            desc: 'Les coordonnées et infos pratiques que les IA associent à votre marque',
                          },
                          {
                            title: 'Analyse concurrentielle',
                            desc: 'Qui apparaît à votre place dans les réponses IA',
                          },
                          {
                            title: 'Plan d’action personnalisé',
                            desc: '5 à 7 recommandations concrètes pour améliorer votre score',
                          },
                        ].map((feature) => (
                          <div key={feature.title} className="flex items-start gap-3">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="#22C55E"
                              strokeWidth="2.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              className="mt-0.5 h-5 w-5 shrink-0"
                              aria-hidden="true"
                            >
                              <path d="M20 6 9 17l-5-5" />
                            </svg>
                            <div>
                              <p className="text-sm font-semibold text-primary sm:text-[15px]">
                                {feature.title}
                              </p>
                              <p className="text-xs text-tertiary sm:text-sm">
                                {feature.desc}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>

                      <button
                        type="button"
                        onClick={handleCheckout}
                        disabled={checkoutLoading}
                        className="h-[50px] w-full rounded-full bg-white text-base font-bold text-black transition-colors hover:bg-[#F2F2F2] disabled:bg-white/[0.18] disabled:text-white/35 sm:h-[56px] sm:text-lg"
                      >
                        {checkoutLoading ? 'Redirection...' : 'Lancer l’analyse — 9,99€'}
                      </button>

                      {error ? <div className="mt-3 text-center text-sm text-error">{error}</div> : null}

                      <div className="mt-5 space-y-1.5 text-center">
                        <p className="flex items-center justify-center gap-2 text-sm text-tertiary">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="h-3.5 w-3.5"
                            aria-hidden="true"
                          >
                            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                          </svg>
                          Paiement sécurisé par Stripe
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key={viewState}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0, transition: STEP_TRANSITION }}
                exit={{ opacity: 0, y: -12, transition: STEP_EXIT_TRANSITION }}
                className="flex min-h-[100svh] w-full items-center justify-center px-1 py-10"
              >
                <div className="w-full max-w-6xl">
                  <div className="mb-8 text-center sm:mb-10">
                    <p className="mb-3 inline-flex items-center rounded-full border border-[#4BA7F5]/15 bg-[#4BA7F5]/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-[#4BA7F5] sm:mb-4 sm:text-[11px] sm:tracking-[0.24em]">
                      Étape {currentQuestionStep}/{totalQuestionSteps}
                    </p>

                    {viewState === 'question_type' ? (
                      <>
                        <h1 className="mb-2 max-w-[13ch] text-[1.7rem] font-bold leading-[1.08] tracking-tight text-primary sm:mx-auto sm:mb-3 sm:max-w-4xl sm:text-4xl md:text-5xl">
                          Quel type de site ou d’activité décrit le mieux votre entreprise ?
                        </h1>
                        <p className="max-w-[32rem] text-[0.94rem] leading-relaxed text-secondary sm:mx-auto sm:text-base">
                          Nous allons calibrer vos requêtes IA à partir de votre activité réelle.
                        </p>
                      </>
                    ) : null}

                    {viewState === 'question_activity' ? (
                      <>
                        <h1 className="mb-2 max-w-[13ch] text-[1.7rem] font-bold leading-[1.08] tracking-tight text-primary sm:mx-auto sm:mb-3 sm:max-w-4xl sm:text-4xl md:text-5xl">
                          Quelle activité décrit le mieux votre business ?
                        </h1>
                        <p className="max-w-[32rem] text-[0.94rem] leading-relaxed text-secondary sm:mx-auto sm:text-base">
                          {selectedTypeMeta
                            ? `Sélection actuelle : ${selectedTypeMeta.label}`
                            : 'Choisissez l’activité la plus proche de votre offre.'}
                        </p>
                      </>
                    ) : null}

                    {viewState === 'question_activity_detail' ? (
                      <>
                        <h1 className="mb-2 max-w-[13ch] text-[1.7rem] font-bold leading-[1.08] tracking-tight text-primary sm:mx-auto sm:mb-3 sm:max-w-4xl sm:text-4xl md:text-5xl">
                          Voulez-vous préciser votre activité ?
                        </h1>
                        <p className="max-w-[32rem] text-[0.94rem] leading-relaxed text-secondary sm:mx-auto sm:text-base">
                          Cette précision nous aide à formuler des requêtes plus proches de votre cas réel.
                        </p>
                      </>
                    ) : null}

                    {viewState === 'question_city' ? (
                      <>
                        <h1 className="mb-2 max-w-[13ch] text-[1.7rem] font-bold leading-[1.08] tracking-tight text-primary sm:mx-auto sm:mb-3 sm:max-w-4xl sm:text-4xl md:text-5xl">
                          {selectedActivityEntry?.cityMode === 'optional'
                            ? 'Avez-vous une ville principale à préciser ?'
                            : 'Dans quelle ville êtes-vous principalement recherché ?'}
                        </h1>
                        <p className="max-w-[32rem] text-[0.94rem] leading-relaxed text-secondary sm:mx-auto sm:text-base">
                          {selectedActivityEntry?.cityMode === 'optional'
                            ? 'Ajoutez une ville si votre visibilité IA dépend d’un marché local.'
                            : 'Nous utiliserons cette ville pour générer des requêtes locales pertinentes.'}
                        </p>
                      </>
                    ) : null}

                    {viewState === 'url' ? (
                      <>
                        <h1 className="mb-2 max-w-[13ch] text-[1.7rem] font-bold leading-[1.08] tracking-tight text-primary sm:mx-auto sm:mb-3 sm:max-w-4xl sm:text-4xl md:text-5xl">
                          Quel site voulez-vous auditer ?
                        </h1>
                        <p className="max-w-[32rem] text-[0.94rem] leading-relaxed text-secondary sm:mx-auto sm:text-base">
                          Entrez l’URL de votre site pour lancer le questionnaire d’audit.
                        </p>
                      </>
                    ) : null}
                  </div>

                  {viewState === 'url' ? (
                    <form onSubmit={handleUrlSubmit} className="mx-auto max-w-xl">
                      <label
                        htmlFor="audit-url-input"
                        className="mb-2 block text-sm font-medium text-secondary"
                      >
                        URL du site
                      </label>
                      <div
                        onClick={(event) => {
                          const input = event.currentTarget.querySelector('input');
                          if (input instanceof HTMLInputElement) {
                            input.focus();
                          }
                        }}
                        className="flex cursor-text items-center gap-2 rounded-[24px] border border-white/[0.12] bg-white/[0.06] px-4 py-3 transition-colors focus-within:border-white/[0.22] focus-within:bg-white/[0.09] sm:px-4 sm:py-3"
                      >
                        <span className="shrink-0 text-base text-white/45">https://</span>
                        <input
                          id="audit-url-input"
                          type="text"
                          inputMode="url"
                          autoCapitalize="none"
                          autoCorrect="off"
                          spellCheck={false}
                          value={validatedUrl.replace(/^https?:\/\//, '')}
                          onChange={(event) => {
                            setError('');
                            setValidatedUrl(event.target.value);
                          }}
                          placeholder="exemple.com"
                          className="min-w-0 flex-1 bg-transparent py-1 text-base text-white placeholder:text-white/35 outline-none transition-colors focus:ring-0"
                        />
                      </div>

                      <div className="mt-4">
                        <button
                          type="submit"
                          className="inline-flex h-[50px] w-full items-center justify-center gap-2 rounded-[24px] bg-white px-5 text-base font-semibold text-black transition-colors hover:bg-[#F2F2F2]"
                        >
                          Continuer
                        </button>
                      </div>
                    </form>
                  ) : null}

                  {viewState === 'question_type' ? (
                    <div className="grid gap-3 sm:grid-cols-2 sm:gap-4 xl:grid-cols-4">
                      {PAID_SCAN_TYPE_OPTIONS.map((option) => (
                        <button
                          key={option.id}
                          type="button"
                          onClick={() => handleTypeSelection(option.id)}
                          className="group relative flex min-h-[118px] items-end overflow-hidden rounded-[24px] border border-white/[0.10] bg-[#111214] p-4 text-left transition-all duration-200 hover:-translate-y-1 hover:border-white/[0.18] hover:bg-[#191B20] sm:min-h-[182px] sm:p-6 xl:min-h-[192px]"
                        >
                          <TypeOptionIcon
                            type={option.id}
                            className="absolute right-4 top-4 h-9 w-9 text-[#4BA7F5] sm:right-6 sm:top-6 sm:h-[3.55rem] sm:w-[3.55rem]"
                          />
                          <div className="max-w-[13ch] text-[1.18rem] font-semibold leading-[1.06] tracking-tight text-white sm:text-[1.72rem]">
                            {option.label}
                          </div>
                        </button>
                      ))}
                    </div>
                  ) : null}

                  {viewState === 'question_activity' ? (
                    <div className="mx-auto flex max-w-4xl flex-wrap justify-center gap-2.5">
                      {activityOptions.map((activity) => (
                        <button
                          key={activity.id}
                          type="button"
                          onClick={() => handleActivitySelection(activity.id)}
                          className={`inline-flex min-h-[40px] items-center justify-center gap-2 rounded-full px-3.5 py-2 text-[0.92rem] transition-all duration-200 sm:px-4 sm:text-[15px] ${
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
                  ) : null}

                  {viewState === 'question_activity_detail' ? (
                    <form onSubmit={handleActivityDetailSubmit} className="mx-auto max-w-xl">
                      <label
                        htmlFor="activity-detail-input"
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
                        className="flex cursor-text flex-wrap items-center gap-x-0 gap-y-1 rounded-[24px] border border-white/[0.12] bg-white/[0.06] px-4 py-3 transition-colors focus-within:border-white/[0.22] focus-within:bg-white/[0.09] sm:px-4 sm:py-3"
                      >
                        <span className="shrink-0 pr-[0.35ch] text-base text-white/45">
                          {selectedActivityEntry?.detailPrefix || 'pour'}
                        </span>
                        <input
                          id="activity-detail-input"
                          type="text"
                          value={questionnaire.activityDetail}
                          onChange={(event) => {
                            setError('');
                            setQuestionnaire((previous) => ({
                              ...previous,
                              activityDetail: event.target.value,
                            }));
                          }}
                          placeholder=""
                          className="min-w-[180px] flex-1 bg-transparent py-1 text-base text-white placeholder:text-white/35 outline-none transition-colors focus:ring-0"
                        />
                      </div>

                      <div className="mt-4 space-y-3">
                        <button
                          type="submit"
                          className="inline-flex h-[50px] w-full items-center justify-center gap-2 rounded-[24px] bg-white px-5 text-base font-semibold text-black transition-colors hover:bg-[#F2F2F2]"
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
                      </div>
                    </form>
                  ) : null}

                  {viewState === 'question_city' ? (
                    <form onSubmit={handleCitySubmit} className="mx-auto max-w-xl">
                      <CityAutocompleteInput
                        value={questionnaire.city}
                        onErrorReset={() => setError('')}
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

                      <div className="mt-4 space-y-3">
                        <button
                          type="submit"
                          className="inline-flex h-[50px] w-full items-center justify-center rounded-[24px] bg-white px-5 text-base font-semibold text-black transition-colors hover:bg-[#F2F2F2]"
                        >
                          Valider
                        </button>

                        {selectedActivityEntry?.cityMode === 'optional' ? (
                          <button
                            type="button"
                            onClick={() => {
                              setError('');
                              setQuestionnaire((previous) => ({
                                ...previous,
                                city: '',
                              }));
                              advanceToView('payment');
                            }}
                            className="mx-auto block rounded-full px-3 py-1.5 text-sm text-white/45 transition-colors hover:text-white/75"
                          >
                            Passer cette étape
                          </button>
                        ) : null}
                      </div>
                    </form>
                  ) : null}

                  {error ? <p className="mt-4 text-center text-sm text-error">{error}</p> : null}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </main>
  );
}

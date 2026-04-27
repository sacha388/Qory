'use client';

import { useMemo, useState, type FormEvent } from 'react';
import type { AuditUserContext, PaidScanBusinessType } from '@/types';
import {
  PAID_SCAN_TYPE_OPTIONS,
  getPaidScanActivitiesByType,
  getPaidScanActivityCatalogEntry,
  getPaidScanActivityDetailInput,
  normalizePaidScanCityInput,
} from '@/lib/scanner/paid-scan-catalog';
import QoryWord from '@/app/components/qory-word';

type FormState = {
  token: string;
  url: string;
  type: PaidScanBusinessType | '';
  activity: string;
  activityDetail: string;
  city: string;
};

const INITIAL_STATE: FormState = {
  token: '',
  url: '',
  type: '',
  activity: '',
  activityDetail: '',
  city: '',
};

function normalizeUrl(rawUrl: string): string {
  const trimmed = rawUrl.trim();
  if (!trimmed) return '';
  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
}

export default function MarketingReportAdminPage() {
  const [form, setForm] = useState<FormState>(INITIAL_STATE);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const activities = useMemo(
    () => (form.type ? getPaidScanActivitiesByType(form.type) : []),
    [form.type]
  );
  const selectedActivity = useMemo(
    () => (form.type && form.activity ? getPaidScanActivityCatalogEntry(form.type, form.activity) : null),
    [form.activity, form.type]
  );
  const needsCity = selectedActivity?.cityMode !== 'forbidden';
  const cityRequired = selectedActivity?.cityMode === 'required';

  const updateForm = (updates: Partial<FormState>) => {
    setError('');
    setForm((previous) => ({ ...previous, ...updates }));
  };

  const buildUserContext = (): AuditUserContext | null => {
    if (!form.type || !form.activity) return null;
    const activity = getPaidScanActivityCatalogEntry(form.type, form.activity);
    if (!activity) return null;

    const city = normalizePaidScanCityInput(form.city);
    if (activity.cityMode === 'required' && !city) return null;

    return {
      type: form.type,
      activity: activity.id,
      activityDetail: getPaidScanActivityDetailInput(form.activityDetail),
      city: activity.cityMode !== 'forbidden' ? city : null,
    };
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');

    const normalizedUrl = normalizeUrl(form.url);
    const userContext = buildUserContext();

    if (!form.token.trim()) {
      setError('Entre le mot de passe interne.');
      return;
    }

    if (!normalizedUrl) {
      setError('Entre une URL.');
      return;
    }

    try {
      new URL(normalizedUrl);
    } catch {
      setError('URL invalide.');
      return;
    }

    if (!userContext) {
      setError(cityRequired ? 'La localisation est obligatoire pour cette activité.' : 'Complète les étapes.');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/internal/marketing-report', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Internal-Report-Token': form.token.trim(),
        },
        body: JSON.stringify({
          token: form.token.trim(),
          url: normalizedUrl,
          userContext,
        }),
      });

      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(typeof payload.error === 'string' ? payload.error : 'Impossible de lancer le rapport.');
      }

      if (typeof payload.reportUrl !== 'string') {
        throw new Error('Réponse invalide.');
      }

      window.location.assign(payload.reportUrl);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Impossible de lancer le rapport.');
      setLoading(false);
    }
  };

  return (
    <main className="ds-shell min-h-[100svh] px-4 py-8 sm:px-6">
      <div className="mx-auto flex min-h-[calc(100svh-4rem)] w-full max-w-2xl items-center">
        <form onSubmit={submit} className="w-full rounded-[24px] border border-white/[0.10] bg-[#101113] p-5 shadow-2xl shadow-black/30 sm:p-7">
          <div className="mb-7 flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#4BA7F5]">
                Interne
              </p>
              <h1 className="mt-2 text-2xl font-bold tracking-tight text-white sm:text-3xl">
                Rapport marketing
              </h1>
            </div>
            <div className="flex shrink-0 items-center gap-2 text-xl font-semibold text-white">
              <img src="/logo.svg" alt="" className="h-6 w-6 brightness-0 invert" />
              <QoryWord />
            </div>
          </div>

          <div className="space-y-5">
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-white/75">1. Mot de passe interne</span>
              <input
                type="password"
                value={form.token}
                onChange={(event) => updateForm({ token: event.target.value })}
                className="h-12 w-full rounded-[16px] border border-white/[0.12] bg-white/[0.06] px-4 text-white outline-none transition focus:border-white/[0.28]"
                autoComplete="current-password"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-medium text-white/75">2. URL du site</span>
              <input
                type="text"
                inputMode="url"
                value={form.url}
                onChange={(event) => updateForm({ url: event.target.value })}
                placeholder="exemple.com"
                className="h-12 w-full rounded-[16px] border border-white/[0.12] bg-white/[0.06] px-4 text-white outline-none transition placeholder:text-white/35 focus:border-white/[0.28]"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-medium text-white/75">3. Type de site</span>
              <select
                value={form.type}
                onChange={(event) =>
                  updateForm({
                    type: event.target.value as PaidScanBusinessType | '',
                    activity: '',
                    activityDetail: '',
                    city: '',
                  })
                }
                className="h-12 w-full rounded-[16px] border border-white/[0.12] bg-[#17191d] px-4 text-white outline-none transition focus:border-white/[0.28]"
              >
                <option value="">Choisir un type</option>
                {PAID_SCAN_TYPE_OPTIONS.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-medium text-white/75">4. Activité</span>
              <select
                value={form.activity}
                onChange={(event) => updateForm({ activity: event.target.value, activityDetail: '', city: '' })}
                disabled={!form.type}
                className="h-12 w-full rounded-[16px] border border-white/[0.12] bg-[#17191d] px-4 text-white outline-none transition disabled:cursor-not-allowed disabled:opacity-45 focus:border-white/[0.28]"
              >
                <option value="">Choisir une activité</option>
                {activities.map((activity) => (
                  <option key={activity.id} value={activity.id}>
                    {activity.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-medium text-white/75">
                5. Précision de l’activité
              </span>
              <div className="flex min-h-12 items-center rounded-[16px] border border-white/[0.12] bg-white/[0.06] px-4 transition focus-within:border-white/[0.28]">
                <span className="shrink-0 pr-[0.35ch] text-sm text-white/45">
                  {selectedActivity?.detailPrefix || 'Précision'}
                </span>
                <input
                  type="text"
                  value={form.activityDetail}
                  onChange={(event) => updateForm({ activityDetail: event.target.value })}
                  disabled={!selectedActivity}
                  placeholder={selectedActivity?.detailExample || ''}
                  className="min-w-0 flex-1 bg-transparent py-3 text-white outline-none placeholder:text-white/30 disabled:cursor-not-allowed"
                />
              </div>
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-medium text-white/75">
                6. Localisation {needsCity ? (cityRequired ? '' : '(optionnel)') : '(non utilisée)'}
              </span>
              <input
                type="text"
                value={form.city}
                onChange={(event) => updateForm({ city: event.target.value })}
                disabled={!needsCity}
                placeholder={cityRequired ? 'Paris, Lyon, Bordeaux...' : needsCity ? 'Ville ou zone principale' : ''}
                className="h-12 w-full rounded-[16px] border border-white/[0.12] bg-white/[0.06] px-4 text-white outline-none transition placeholder:text-white/35 disabled:cursor-not-allowed disabled:opacity-45 focus:border-white/[0.28]"
              />
            </label>
          </div>

          {error ? <p className="mt-5 text-sm text-red-300">{error}</p> : null}

          <button
            type="submit"
            disabled={loading}
            className="mt-7 inline-flex h-12 w-full items-center justify-center rounded-[16px] bg-white px-5 text-base font-bold text-black transition hover:bg-[#f2f2f2] disabled:cursor-wait disabled:bg-white/35"
          >
            {loading ? 'Lancement du rapport...' : 'Générer le rapport sans Stripe'}
          </button>
        </form>
      </div>
    </main>
  );
}

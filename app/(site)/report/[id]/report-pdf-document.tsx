import type { ReactNode } from 'react';
import type { Audit, Recommendation } from '@/types';
import QoryWord from '@/app/components/qory-word';
import { getSitemapVerdict, getStructuredDataVerdict } from '@/lib/scanner/crawl-status';
import { REPORT_PDF_STYLES } from './report-pdf-styles';
import {
  FACT_ROWS,
  chunkArray,
  getCompetitiveBarColor,
  getDataQualityClass,
  getDataQualityLabel,
  getDisplayDomain,
  getMarketSentimentLabel,
  getMarketSentimentTone,
  getMarketToneTextClass,
  getPricePositionLabel,
  getPricePositionTone,
  getPolarizationLabel,
  getPolarizationTone,
  getProviderIconSrc,
  getProviderLabel,
  getRecommendationDifficultyClass,
  getRecommendationDifficultyLabel,
  getRecommendationImpactClass,
  getRecommendationImpactLabel,
  getScoreFillClass,
  getScoreLabel,
  getScoreToneClass,
  getSignalStrengthLabel,
  getSignalStrengthTone,
  getStatusClass,
  getStatusLabel,
  getTechnicalImpactClass,
  getTechnicalStatusClass,
  getTrustLevelLabel,
  getTrustLevelTone,
} from './report-pdf-utils';

function QoryLogoMark({ className = '' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 183 183"
      aria-hidden="true"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M183 102.74V183H0v-61h91.5L0 61V0h91.5v61h53.74c20.86 0 37.76 18.69 37.76 41.74Z" fill="#1D1D1F" />
    </svg>
  );
}

function PdfFooter({ pageNumber, totalPages }: { pageNumber: number; totalPages: number }) {
  return (
    <div className="pdf-footer">
      <div className="pdf-footer__brand">
        <span className="pdf-footer__word">
          <QoryWord />
        </span>
      </div>
      <span className="pdf-footer__page">
        Page {pageNumber} / {totalPages}
      </span>
    </div>
  );
}

function PdfPageFrame({
  pageNumber,
  totalPages,
  children,
  cover = false,
}: {
  pageNumber: number;
  totalPages: number;
  children: ReactNode;
  cover?: boolean;
}) {
  return (
    <section className={`pdf-sheet ${cover ? 'pdf-sheet--cover' : ''}`.trim()}>
      <div className="pdf-sheet__body">{children}</div>
      <PdfFooter pageNumber={pageNumber} totalPages={totalPages} />
    </section>
  );
}

function PdfSection({
  title,
  children,
  titleClassName,
}: {
  title?: string;
  children: ReactNode;
  titleClassName?: string;
}) {
  return (
    <section className="pdf-section">
      {title ? (
        <div className="pdf-section__header">
          <h2 className={`pdf-section__title ${titleClassName || ''}`.trim()}>{title}</h2>
        </div>
      ) : null}
      <div className="pdf-section__content">{children}</div>
    </section>
  );
}

function PdfEmptyState({ text }: { text: string }) {
  return (
    <div className="pdf-empty-state">
      <p>{text}</p>
    </div>
  );
}

function PdfMetricCard({
  label,
  value,
  toneClassName,
  cardClassName,
  valueClassName,
  labelClassName,
}: {
  label: string;
  value: string | number;
  toneClassName?: string;
  cardClassName?: string;
  valueClassName?: string;
  labelClassName?: string;
}) {
  return (
    <div className={`pdf-metric-card ${cardClassName || ''}`.trim()}>
      <span className={`pdf-metric-card__label ${labelClassName || ''}`.trim()}>{label}</span>
      <strong className={`pdf-metric-card__value ${toneClassName || ''} ${valueClassName || ''}`.trim()}>{value}</strong>
    </div>
  );
}

function PdfStatusBadge({ value }: { value: string }) {
  return <span className={`pdf-badge ${getStatusClass(value)}`.trim()}>{getStatusLabel(value)}</span>;
}

function PdfTechnicalBadge({
  value,
  type,
}: {
  value: string;
  type: 'status' | 'impact';
}) {
  return (
    <span className={`pdf-badge ${type === 'status' ? getTechnicalStatusClass(value) : getTechnicalImpactClass(value)}`.trim()}>
      {value}
    </span>
  );
}

function PdfProviderHead({
  source,
  label,
}: {
  source: 'openai' | 'anthropic' | 'perplexity';
  label: string;
}) {
  const iconSrc = getProviderIconSrc(source);
  return (
    <span className="pdf-provider-head">
      {iconSrc ? (
        <img
          src={iconSrc}
          alt=""
          aria-hidden="true"
          className="pdf-provider-head__icon"
        />
      ) : null}
      <span>{label}</span>
    </span>
  );
}

export default function ReportPdfDocument({ audit }: { audit: Audit }) {
  const report = audit.report;

  const queryMatrixRows = (() => {
    if (!report) return [];
    const fallbackQueryMatrix = (audit.results?.prompts || []).slice(0, 5).map((prompt) => ({
      query: prompt.prompt,
      category: prompt.category,
      openai: 'unavailable' as const,
      anthropic: 'unavailable' as const,
      perplexity: 'unavailable' as const,
    }));
    return report.queryMatrix.length > 0 ? report.queryMatrix : fallbackQueryMatrix;
  })();

  const factSnapshots = report?.factSnapshots ?? [];

  const competitiveData = (() => {
    if (!report) {
      return { totalQueries: 1, youMentionCount: 0, items: [] as Array<{ label: string; mentions: number; isYou: boolean }> };
    }

    const fallbackCompetitorTotal = Math.max(report.providerHealth.activeProviders || 1, 1) * 10;
    const totalQueries = report.competitorBenchmark?.totalQueries ?? fallbackCompetitorTotal;
    const safeTotal = Math.max(totalQueries, 1);
    const youMentionCount = Math.min(report.competitorBenchmark?.youMentionCount ?? 0, safeTotal);
    const competitors = [...report.competitors]
      .sort((a, b) => b.mentionCount - a.mentionCount)
      .slice(0, 5)
      .map((competitor) => ({
        label: competitor.name,
        mentions: Math.min(competitor.mentionCount, safeTotal),
        isYou: false,
      }));

    return {
      totalQueries: safeTotal,
      youMentionCount,
      items: [
        ...competitors,
        { label: 'Vous', mentions: youMentionCount, isYou: true },
      ],
    };
  })();

  const technicalRows = (() => {
    if (!audit || !report) return [];

    const crawl = audit.results?.crawl;
    const technicalRobotBots = report.technicalAudit.robotsTxt.bots;
    const robotsFetchUnknown = crawl
      ? Boolean(crawl.robotsTxt.fetchError)
      : report.technicalAudit.robotsTxt.verdict === 'unknown';
    const gptVerdict = crawl
      ? robotsFetchUnknown
        ? 'unknown'
        : crawl.robotsTxt.blocksGPTBot
          ? 'blocked'
          : 'authorized'
      : technicalRobotBots?.gptbot?.verdict ?? (technicalRobotBots?.gptbot?.blocked ? 'blocked' : 'authorized');
    const claudeVerdict = crawl
      ? robotsFetchUnknown
        ? 'unknown'
        : crawl.robotsTxt.blocksClaude
          ? 'blocked'
          : 'authorized'
      : technicalRobotBots?.claudebot?.verdict ?? (technicalRobotBots?.claudebot?.blocked ? 'blocked' : 'authorized');
    const perplexityVerdict = crawl
      ? robotsFetchUnknown
        ? 'unknown'
        : crawl.robotsTxt.blocksPerplexity
          ? 'blocked'
          : 'authorized'
      : technicalRobotBots?.perplexitybot?.verdict ?? (technicalRobotBots?.perplexitybot?.blocked ? 'blocked' : 'authorized');
    const googleExtendedVerdict = crawl
      ? robotsFetchUnknown
        ? 'unknown'
        : crawl.robotsTxt.blocksGoogleExtended
          ? 'blocked'
          : 'authorized'
      : technicalRobotBots?.googleExtended?.verdict ?? (technicalRobotBots?.googleExtended?.blocked ? 'blocked' : 'authorized');
    const hasHttps = crawl ? crawl.performance.isHttps : audit.url.startsWith('https://');
    const schemaVerdict = crawl
      ? getStructuredDataVerdict(crawl)
      : report.technicalAudit.structuredData.verdict ??
        (report.technicalAudit.structuredData.status === 'good' ? 'present' : 'absent');
    const sitemapVerdict = crawl
      ? getSitemapVerdict(crawl)
      : report.technicalAudit.sitemap.verdict ??
        ((report.technicalAudit.sitemap.exists ?? report.technicalAudit.sitemap.status === 'good')
          ? 'present'
          : 'absent');

    return [
      {
        check: 'GPTBot autorisé dans robots.txt',
        status: gptVerdict === 'unknown' ? 'Non confirmé' : gptVerdict === 'blocked' ? 'Bloqué' : 'Autorisé',
        impact: gptVerdict === 'unknown' ? 'Moyen' : gptVerdict === 'blocked' ? 'Élevé' : '—',
      },
      {
        check: 'ClaudeBot autorisé',
        status: claudeVerdict === 'unknown' ? 'Non confirmé' : claudeVerdict === 'blocked' ? 'Bloqué' : 'Autorisé',
        impact: claudeVerdict === 'unknown' ? 'Moyen' : claudeVerdict === 'blocked' ? 'Élevé' : '—',
      },
      {
        check: 'PerplexityBot autorisé',
        status:
          perplexityVerdict === 'unknown' ? 'Non confirmé' : perplexityVerdict === 'blocked' ? 'Bloqué' : 'Autorisé',
        impact: perplexityVerdict === 'unknown' ? 'Moyen' : perplexityVerdict === 'blocked' ? 'Moyen' : '—',
      },
      {
        check: 'Google-Extended autorisé',
        status:
          googleExtendedVerdict === 'unknown'
            ? 'Non confirmé'
            : googleExtendedVerdict === 'blocked'
              ? 'Bloqué'
              : 'Autorisé',
        impact: googleExtendedVerdict === 'unknown' ? 'Faible' : googleExtendedVerdict === 'blocked' ? 'Moyen' : '—',
      },
      {
        check: 'Données structurées (schema.org)',
        status: schemaVerdict === 'unknown' ? 'Non confirmé' : schemaVerdict === 'present' ? 'Présent' : 'Absent',
        impact: schemaVerdict === 'unknown' ? 'Faible' : schemaVerdict === 'present' ? '—' : 'Moyen',
      },
      {
        check: 'Sitemap.xml présent',
        status: sitemapVerdict === 'unknown' ? 'Non confirmé' : sitemapVerdict === 'present' ? 'Présent' : 'Absent',
        impact: sitemapVerdict === 'unknown' ? 'Faible' : sitemapVerdict === 'present' ? '—' : 'Faible',
      },
      {
        check: 'HTTPS actif',
        status: hasHttps ? 'Oui' : 'Non',
        impact: hasHttps ? '—' : 'Élevé',
      },
    ];
  })();

  const recommendations = [...(report?.recommendations ?? [])]
    .sort((a, b) => a.priority - b.priority)
    .slice(0, 5);
  const visibilityChunks = chunkArray(queryMatrixRows, 6);
  const unconfiguredProviders = report?.providerHealth.unconfiguredProviders ?? [];
  const configuredProviderScores = [
    unconfiguredProviders.includes('openai') ? null : report?.providerHealth.openai ?? null,
    unconfiguredProviders.includes('anthropic') ? null : report?.providerHealth.anthropic ?? null,
    unconfiguredProviders.includes('perplexity') ? null : report?.providerHealth.perplexity ?? null,
  ].filter((value): value is number => value !== null);
  const providerHealthTotal = configuredProviderScores.reduce((sum, value) => sum + value, 0);
  const providerDrivenDataQuality =
    configuredProviderScores.length === 0
      ? 'poor'
      : providerHealthTotal >= configuredProviderScores.length * 80
        ? 'good'
        : providerHealthTotal >= configuredProviderScores.length * 55
          ? 'partial'
          : 'poor';
  const resolvedDataQuality = report?.dataQuality || providerDrivenDataQuality;
  const score = report?.summary?.globalScore ?? audit.score ?? 0;
  const scoreLabel = getScoreLabel(score);
  const factualCoverageValue = report?.summary.factualCoverage ?? null;
  const factualCoverageDisplay = factualCoverageValue === null ? 'N/A' : factualCoverageValue;
  const factualCoverageToneClass =
    factualCoverageValue === null ? 'text-[#6B7280]' : getScoreToneClass(factualCoverageValue);

  const displayGlobalExecutiveSummary =
    report?.globalExecutiveSummary ||
    'Ce rapport synthétise votre niveau actuel de visibilité dans les réponses IA, les signaux prioritaires à surveiller et les actions à mener.';
  const displaySynthesis =
    report?.synthesis ||
    'Votre score reflète votre présence actuelle dans les réponses IA, la fiabilité des données détectées et votre préparation technique.';

  const domain = getDisplayDomain(audit.url);
  const marketInsights = report?.marketInsights ?? null;
  if (!report) return null;

  const extraVisibilityChunks = visibilityChunks.slice(1);
  const visibilityStartPage = 3;
  const marketPageNumber = visibilityStartPage + visibilityChunks.length;
  const attributionCompetitionPageNumber = marketPageNumber + 1;
  const technicalPageNumber = attributionCompetitionPageNumber + 1;
  const recommendationsPageNumber = technicalPageNumber + 1;
  const finalSummaryPageNumber = recommendationsPageNumber + 1;
  const totalPages = finalSummaryPageNumber;

  return (
    <div className="pdf-report-shell bg-[#EDEFF3] text-[#1D1D1F]">
      <div className="pdf-document">
        <PdfPageFrame pageNumber={1} totalPages={totalPages} cover>
          <div className="pdf-cover">
            <div className="pdf-cover__eyebrow">
              <span>Rapport de visibilité IA</span>
              <span className="pdf-cover__eyebrow-dot" />
              <span>{new Date(report.generatedAt || audit.created_at).toLocaleDateString('fr-FR')}</span>
            </div>

            <div className="pdf-cover__brand">
              <QoryLogoMark className="pdf-cover__logo" />
              <p className="pdf-cover__brand-name">
                <QoryWord className="pdf-cover__wordmark" />
              </p>
            </div>

            <div className="pdf-cover__hero">
              <div>
                <p className="pdf-cover__label">Site analysé</p>
                <h1 className="pdf-cover__title">{domain}</h1>
                <p className="pdf-cover__description">
                  Une synthèse document claire de votre visibilité IA, conçue pour être partagée facilement.
                </p>
              </div>
              <div className="pdf-cover__score-card">
                <span className="pdf-cover__score-label">Score global</span>
                <strong className={`pdf-cover__score-value ${getScoreToneClass(report.summary.globalScore)}`.trim()}>
                  {report.summary.globalScore}
                </strong>
                <span className="pdf-cover__score-caption">/100</span>
              </div>
            </div>
          </div>
        </PdfPageFrame>

        <PdfPageFrame pageNumber={2} totalPages={totalPages}>
          <div className="pdf-page-grid">
            <PdfSection>
              <div className="pdf-score-hero">
                <h3 className="pdf-score-hero__title">Votre Score de Visibilité IA</h3>
                <div className="pdf-score-hero__value-wrap">
                  <strong className={`pdf-score-hero__value ${getScoreToneClass(score)}`.trim()}>{score}</strong>
                  <span className={`pdf-score-hero__suffix ${getScoreToneClass(score)}`.trim()}>/100</span>
                </div>
                <p className="pdf-score-hero__label">
                  Votre visibilité IA est <span className={getScoreToneClass(score)}>{scoreLabel}</span>
                </p>
                <div className="pdf-score-hero__track">
                  <div
                    className={`pdf-score-hero__fill ${getScoreFillClass(score)}`.trim()}
                    style={{ width: `${score}%` }}
                  />
                </div>
                <div className="pdf-highlight pdf-highlight--score">
                  <p>{displaySynthesis}</p>
                </div>
              </div>
            </PdfSection>

            <div className="pdf-two-column-grid">
              <PdfSection title="Fiabilité des données IA">
                <div className="pdf-quality-header">
                  <span className="pdf-quality-header__label">Qualité globale</span>
                  <span className={`pdf-badge ${getDataQualityClass(resolvedDataQuality)}`.trim()}>
                    {getDataQualityLabel(resolvedDataQuality)}
                  </span>
                </div>
                <div className="pdf-provider-health">
                  {[
                    { label: 'ChatGPT', value: unconfiguredProviders.includes('openai') ? 'N/A' : `${report.providerHealth.openai}%` },
                    { label: 'Claude', value: unconfiguredProviders.includes('anthropic') ? 'N/A' : `${report.providerHealth.anthropic}%` },
                    { label: 'Perplexity', value: unconfiguredProviders.includes('perplexity') ? 'N/A' : `${report.providerHealth.perplexity}%` },
                  ].map((provider) => (
                    <div key={provider.label} className="pdf-provider-health__row">
                      <span>{provider.label}</span>
                      <strong>{provider.value}</strong>
                    </div>
                  ))}
                </div>
              </PdfSection>

              <PdfSection title="Détail du score">
                <div className="pdf-metrics-grid pdf-metrics-grid--two">
                  <PdfMetricCard
                    label="Visibilité"
                    value={report.summary.visibility}
                    toneClassName={getScoreToneClass(report.summary.visibility)}
                    cardClassName="pdf-metric-card--score-detail"
                    labelClassName="pdf-metric-card__label--score-detail"
                  />
                  <PdfMetricCard
                    label="Couverture factuelle"
                    value={factualCoverageDisplay}
                    toneClassName={factualCoverageToneClass}
                    cardClassName="pdf-metric-card--score-detail"
                    labelClassName="pdf-metric-card__label--score-detail"
                  />
                  <PdfMetricCard
                    label="Positionnement"
                    value={report.summary.positioning}
                    toneClassName={getScoreToneClass(report.summary.positioning)}
                    cardClassName="pdf-metric-card--score-detail"
                    labelClassName="pdf-metric-card__label--score-detail"
                  />
                  <PdfMetricCard
                    label="Technique"
                    value={report.summary.technical}
                    toneClassName={getScoreToneClass(report.summary.technical)}
                    cardClassName="pdf-metric-card--score-detail"
                    labelClassName="pdf-metric-card__label--score-detail"
                  />
                </div>
              </PdfSection>
            </div>
          </div>
        </PdfPageFrame>

        <PdfPageFrame pageNumber={visibilityStartPage} totalPages={totalPages}>
          <div className="pdf-page-grid">
            <PdfSection title="Visibilité par modèle IA">
              {visibilityChunks[0] && visibilityChunks[0].length > 0 ? (
                <table className="pdf-table">
                  <thead>
                    <tr>
                      <th>Requête</th>
                      <th>
                        <PdfProviderHead source="openai" label="ChatGPT" />
                      </th>
                      <th>
                        <PdfProviderHead source="anthropic" label="Claude" />
                      </th>
                      <th>
                        <PdfProviderHead source="perplexity" label="Perplexity" />
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {visibilityChunks[0].map((row, idx) => (
                      <tr key={idx}>
                        <td>
                          <strong>{row.query}</strong>
                          <span className="pdf-table__sub">{row.category}</span>
                        </td>
                        <td><PdfStatusBadge value={row.openai} /></td>
                        <td><PdfStatusBadge value={row.anthropic} /></td>
                        <td><PdfStatusBadge value={row.perplexity} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <PdfEmptyState text="Données insuffisantes pour la matrice de visibilité sur cet audit." />
              )}
            </PdfSection>
          </div>
        </PdfPageFrame>

        {extraVisibilityChunks.map((chunk, index) => (
          <PdfPageFrame
            key={`visibility-chunk-${index}`}
            pageNumber={visibilityStartPage + 1 + index}
            totalPages={totalPages}
          >
            <div className="pdf-page-grid">
              <PdfSection title="Visibilité par modèle IA">
                <table className="pdf-table">
                  <thead>
                    <tr>
                      <th>Requête</th>
                      <th>
                        <PdfProviderHead source="openai" label="ChatGPT" />
                      </th>
                      <th>
                        <PdfProviderHead source="anthropic" label="Claude" />
                      </th>
                      <th>
                        <PdfProviderHead source="perplexity" label="Perplexity" />
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {chunk.map((row, rowIndex) => (
                      <tr key={`${row.query}-${rowIndex}`}>
                        <td>
                          <strong>{row.query}</strong>
                          <span className="pdf-table__sub">{row.category}</span>
                        </td>
                        <td><PdfStatusBadge value={row.openai} /></td>
                        <td><PdfStatusBadge value={row.anthropic} /></td>
                        <td><PdfStatusBadge value={row.perplexity} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </PdfSection>
            </div>
          </PdfPageFrame>
        ))}

        <PdfPageFrame pageNumber={marketPageNumber} totalPages={totalPages}>
          <div className="pdf-page-grid">
            <PdfSection title="Positionnement marché">
              {marketInsights ? (
                <>
                  {(() => {
                    const priceTone = getPricePositionTone(marketInsights.pricePositioning.label);
                    const sentimentTone = getMarketSentimentTone(marketInsights.marketSentiment.label);
                    const polarizationTone = getPolarizationTone(marketInsights.polarization.level);
                    const trustTone = getTrustLevelTone(marketInsights.trustLevel.level);
                    const signalTone = getSignalStrengthTone(marketInsights.signalStrength);

                    return (
                      <div className="pdf-metrics-grid pdf-metrics-grid--five">
                        <PdfMetricCard
                          label="Prix"
                          value={getPricePositionLabel(marketInsights.pricePositioning.label)}
                          toneClassName={getMarketToneTextClass(priceTone)}
                          cardClassName="pdf-metric-card--market"
                          valueClassName="pdf-metric-card__value--signal"
                        />
                        <PdfMetricCard
                          label="Ressenti"
                          value={getMarketSentimentLabel(marketInsights.marketSentiment.label)}
                          toneClassName={getMarketToneTextClass(sentimentTone)}
                          cardClassName="pdf-metric-card--market"
                          valueClassName="pdf-metric-card__value--signal"
                        />
                        <PdfMetricCard
                          label="Polarisation"
                          value={getPolarizationLabel(marketInsights.polarization.level)}
                          toneClassName={getMarketToneTextClass(polarizationTone)}
                          cardClassName="pdf-metric-card--market"
                          valueClassName="pdf-metric-card__value--signal"
                        />
                        <PdfMetricCard
                          label="Confiance"
                          value={getTrustLevelLabel(marketInsights.trustLevel.level)}
                          toneClassName={getMarketToneTextClass(trustTone)}
                          cardClassName="pdf-metric-card--market"
                          valueClassName="pdf-metric-card__value--signal"
                        />
                        <PdfMetricCard
                          label="Signal"
                          value={getSignalStrengthLabel(marketInsights.signalStrength)}
                          toneClassName={getMarketToneTextClass(signalTone)}
                          cardClassName="pdf-metric-card--market"
                          valueClassName="pdf-metric-card__value--signal"
                        />
                      </div>
                    );
                  })()}
                  <div className="pdf-market-grid">
                    <div className="pdf-market-column">
                      <h3 className="pdf-market-title pdf-market-title--success">Avantages identifiés</h3>
                      {marketInsights.strengths.length > 0 ? (
                        <div className="pdf-market-list">
                          {marketInsights.strengths.map((item, index) => (
                            <div key={`${item.label}-${index}`} className="pdf-market-item pdf-market-item--success">
                              <p className="pdf-market-item__label">{item.label}</p>
                              <p className="pdf-market-item__text">{item.evidence}</p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <PdfEmptyState text="Aucun avantage récurrent n'a pu être isolé sur cet audit." />
                      )}
                    </div>
                    <div className="pdf-market-column">
                      <h3 className="pdf-market-title pdf-market-title--error">Limites et points de friction</h3>
                      {marketInsights.weaknesses.length > 0 ? (
                        <div className="pdf-market-list">
                          {marketInsights.weaknesses.map((item, index) => (
                            <div key={`${item.label}-${index}`} className="pdf-market-item pdf-market-item--error">
                              <p className="pdf-market-item__label">{item.label}</p>
                              <p className="pdf-market-item__text">{item.evidence}</p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <PdfEmptyState text="Aucun point de friction dominant n'a pu être confirmé sur cet audit." />
                      )}
                    </div>
                  </div>
                  {marketInsights.alternativeFamilies.length > 0 ? (
                    <div className="pdf-market-alternatives">
                      <h3 className="pdf-market-title">Familles d'alternatives</h3>
                      <div className="pdf-market-list">
                        {marketInsights.alternativeFamilies.map((item, index) => (
                          <div key={`${item.label}-${index}`} className="pdf-market-item">
                            <p className="pdf-market-item__label">{item.label}</p>
                            <p className="pdf-market-item__text">{item.description}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : null}
                  <div className="pdf-market-summary">
                    <h3 className="pdf-market-title">Résumé marché</h3>
                    <div className="pdf-highlight">
                      <p>{marketInsights.executiveSummary}</p>
                    </div>
                  </div>
                </>
              ) : (
                <PdfEmptyState text="Le positionnement marché n'a pas pu être déterminé sur cet audit." />
              )}
            </PdfSection>
          </div>
        </PdfPageFrame>

        <PdfPageFrame pageNumber={attributionCompetitionPageNumber} totalPages={totalPages}>
          <div className="pdf-page-grid">
            <PdfSection title="Informations attribuées par les IA">
              {factSnapshots.length > 0 ? (
                <table className="pdf-table">
                  <thead>
                    <tr>
                      <th>Information</th>
                      {factSnapshots.map((snapshot, idx) => {
                        const providerIconSrc = getProviderIconSrc(snapshot.provider);
                        return (
                          <th key={`${snapshot.provider}-${idx}`}>
                            <span className="pdf-provider-head">
                              {providerIconSrc ? (
                                <img
                                  src={providerIconSrc}
                                  alt=""
                                  aria-hidden="true"
                                  className="pdf-provider-head__icon"
                                />
                              ) : null}
                              <span>{snapshot.model || getProviderLabel(snapshot.provider)}</span>
                            </span>
                          </th>
                        );
                      })}
                    </tr>
                  </thead>
                  <tbody>
                    {FACT_ROWS.map((row) => (
                      <tr key={row.key}>
                        <td><strong>{row.label}</strong></td>
                        {factSnapshots.map((snapshot, idx) => (
                          <td key={`${row.key}-${snapshot.provider}-${idx}`}>
                            {snapshot.detected[row.key] || 'Non trouvé'}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <PdfEmptyState text="Les IA n'ont pas remonté d'informations pratiques pour ce site." />
              )}
            </PdfSection>
            <PdfSection title="Analyse Concurrentielle">
              {competitiveData.items.length > 0 ? (
                <div className="pdf-bars">
                  {competitiveData.items.map((entry) => (
                    <div key={`${entry.label}-${entry.isYou ? 'you' : 'other'}`} className="pdf-bars__row">
                      <div className="pdf-bars__meta">
                        <span className={`pdf-bars__label ${entry.isYou ? 'pdf-bars__label--you' : ''}`.trim()}>
                          {entry.label}
                        </span>
                        <span className="pdf-bars__value">
                          {entry.mentions}/{competitiveData.totalQueries}
                        </span>
                      </div>
                      <div className="pdf-bars__track">
                        <div
                          className="pdf-bars__fill"
                          style={{
                            width: `${Math.min((entry.mentions / competitiveData.totalQueries) * 100, 100)}%`,
                            background: entry.isYou ? '#4BA7F5' : getCompetitiveBarColor(entry.mentions),
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <PdfEmptyState text="Données concurrentielles insuffisantes pour cet audit." />
              )}
            </PdfSection>
          </div>
        </PdfPageFrame>

        <PdfPageFrame pageNumber={technicalPageNumber} totalPages={totalPages}>
          <div className="pdf-page-grid">
            <PdfSection title="Audit Technique">
              {technicalRows.length > 0 ? (
                <table className="pdf-table">
                  <thead>
                    <tr>
                      <th>Check</th>
                      <th>Statut</th>
                      <th>Impact</th>
                    </tr>
                  </thead>
                  <tbody>
                    {technicalRows.map((row) => (
                      <tr key={row.check}>
                        <td><strong>{row.check}</strong></td>
                        <td><PdfTechnicalBadge value={row.status} type="status" /></td>
                        <td><PdfTechnicalBadge value={row.impact} type="impact" /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <PdfEmptyState text="Signaux techniques non disponibles pour cette version." />
              )}
            </PdfSection>
          </div>
        </PdfPageFrame>

        <PdfPageFrame pageNumber={recommendationsPageNumber} totalPages={totalPages}>
          <div className="pdf-page-grid">
            <PdfSection title="Plan d'Action Recommandé">
              {recommendations.length > 0 ? (
                <div className="pdf-recommendations">
                  {recommendations.map((recommendation: Recommendation, index) => (
                    <div key={recommendation.id} className="pdf-recommendation-card">
                      <div className="pdf-recommendation-card__copy">
                        <h3>
                          {index + 1}. {recommendation.title}
                        </h3>
                        <p>{recommendation.description}</p>
                      </div>
                      <div className="pdf-recommendation-card__meta">
                        <span className={`pdf-badge pdf-badge--recommendation ${getRecommendationDifficultyClass(recommendation.difficulty)}`.trim()}>
                          {getRecommendationDifficultyLabel(recommendation.difficulty)}
                        </span>
                        <span className={`pdf-badge pdf-badge--recommendation ${getRecommendationImpactClass(recommendation.impact)}`.trim()}>
                          Impact: {getRecommendationImpactLabel(recommendation.impact)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <PdfEmptyState text="Aucune recommandation prioritaire n'a été identifiée." />
              )}
            </PdfSection>
          </div>
        </PdfPageFrame>

        <PdfPageFrame pageNumber={finalSummaryPageNumber} totalPages={totalPages}>
          <div className="pdf-page-grid">
            <PdfSection title="Résumé Global Du Rapport">
              <div className="pdf-highlight">
                <p>{displayGlobalExecutiveSummary}</p>
              </div>
            </PdfSection>
          </div>
        </PdfPageFrame>
      </div>

      <style dangerouslySetInnerHTML={{ __html: REPORT_PDF_STYLES }} />
    </div>
  );
}

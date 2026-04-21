type CrawlStatusLike = {
  homepageStatus?: number | null;
  failedFetchCount?: number | null;
  crawlFailed?: boolean | null;
  homepageFailed?: boolean | null;
  subpageFailureCount?: number | null;
};

type SitemapProbeLike = {
  status: number | null;
  error?: string | null;
};

type CrawlLike = {
  structuredData?: {
    hasSchemaOrg?: boolean | null;
  } | null;
  sitemap?: {
    exists?: boolean | null;
    probes?: SitemapProbeLike[] | null;
  } | null;
  crawlStatus?: CrawlStatusLike | null;
};

export function isFailedFetchStatus(status: number | null | undefined): boolean {
  return typeof status === 'number' && (status === 0 || status >= 400);
}

export function deriveHomepageFailed(status?: CrawlStatusLike | null): boolean {
  if (typeof status?.homepageFailed === 'boolean') {
    return status.homepageFailed;
  }

  if (typeof status?.homepageStatus === 'number') {
    return isFailedFetchStatus(status.homepageStatus);
  }

  return Boolean(status?.crawlFailed);
}

export function deriveSubpageFailureCount(status?: CrawlStatusLike | null): number {
  if (typeof status?.subpageFailureCount === 'number') {
    return Math.max(0, status.subpageFailureCount);
  }

  const failedFetchCount = Number(status?.failedFetchCount ?? 0);
  if (failedFetchCount <= 0) {
    return 0;
  }

  const legacyCountIncludesHomepage =
    status?.homepageFailed == null && status?.subpageFailureCount == null;

  return Math.max(0, failedFetchCount - (legacyCountIncludesHomepage && deriveHomepageFailed(status) ? 1 : 0));
}

export function getStructuredDataVerdict(
  crawl?: CrawlLike | null
): 'present' | 'absent' | 'unknown' {
  if (crawl?.structuredData?.hasSchemaOrg) {
    return 'present';
  }

  if (deriveHomepageFailed(crawl?.crawlStatus)) {
    return 'unknown';
  }

  return 'absent';
}

export function hasSitemapProbeUncertainty(probes?: SitemapProbeLike[] | null): boolean {
  return Array.isArray(probes) && probes.some((probe) =>
    probe.status === null ||
    Boolean(probe.error) ||
    (typeof probe.status === 'number' && probe.status >= 400 && probe.status !== 404)
  );
}

export function getSitemapVerdict(
  crawl?: CrawlLike | null
): 'present' | 'absent' | 'unknown' {
  if (crawl?.sitemap?.exists) {
    return 'present';
  }

  const probes = Array.isArray(crawl?.sitemap?.probes) ? crawl?.sitemap?.probes : [];
  const allProbesMissing = probes.length > 0 && probes.every((probe) => probe.status === 404);

  if (allProbesMissing) {
    return 'absent';
  }

  if (hasSitemapProbeUncertainty(probes)) {
    return 'unknown';
  }

  return 'absent';
}

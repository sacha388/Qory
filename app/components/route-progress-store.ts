export type RouteProgressSnapshot = {
  isVisible: boolean;
  progress: number;
};

type InternalRouteProgressSnapshot = RouteProgressSnapshot & {
  isLoading: boolean;
};

const INITIAL_PROGRESS = 0.08;
const MAX_PROGRESS = 0.94;
const TRICKLE_INTERVAL_MS = 120;
const COMPLETE_HIDE_DELAY_MS = 220;

let snapshot: InternalRouteProgressSnapshot = {
  isVisible: false,
  progress: 0,
  isLoading: false,
};

const subscribers = new Set<(state: RouteProgressSnapshot) => void>();

let trickleTimer: number | null = null;
let hideTimer: number | null = null;

function emitRouteProgress() {
  const publicSnapshot: RouteProgressSnapshot = {
    isVisible: snapshot.isVisible,
    progress: snapshot.progress,
  };

  subscribers.forEach((subscriber) => subscriber(publicSnapshot));
}

function updateRouteProgress(next: Partial<InternalRouteProgressSnapshot>) {
  snapshot = {
    ...snapshot,
    ...next,
  };
  emitRouteProgress();
}

function clearTrickleTimer() {
  if (trickleTimer === null) {
    return;
  }

  window.clearInterval(trickleTimer);
  trickleTimer = null;
}

function isInternalNavigationUrl(url: URL) {
  return (url.protocol === 'http:' || url.protocol === 'https:') && url.origin === window.location.origin;
}

function shouldTrackAnchorNavigation(anchor: HTMLAnchorElement, event: MouseEvent) {
  if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
    return false;
  }

  if (anchor.target && anchor.target !== '_self') {
    return false;
  }

  if (anchor.hasAttribute('download')) {
    return false;
  }

  const href = anchor.getAttribute('href');
  if (!href || href.startsWith('#')) {
    return false;
  }

  const nextUrl = new URL(anchor.href, window.location.href);
  if (!isInternalNavigationUrl(nextUrl)) {
    return false;
  }

  const currentUrl = new URL(window.location.href);
  return nextUrl.pathname !== currentUrl.pathname || nextUrl.search !== currentUrl.search;
}

export function subscribeToRouteProgress(callback: (state: RouteProgressSnapshot) => void) {
  subscribers.add(callback);
  callback({
    isVisible: snapshot.isVisible,
    progress: snapshot.progress,
  });

  return () => {
    subscribers.delete(callback);
  };
}

export function startRouteProgress() {
  if (typeof window === 'undefined') {
    return;
  }

  if (hideTimer !== null) {
    window.clearTimeout(hideTimer);
    hideTimer = null;
  }

  if (!snapshot.isLoading) {
    updateRouteProgress({
      isVisible: true,
      progress: INITIAL_PROGRESS,
      isLoading: true,
    });
  } else if (!snapshot.isVisible) {
    updateRouteProgress({ isVisible: true });
  }

  if (trickleTimer !== null) {
    return;
  }

  trickleTimer = window.setInterval(() => {
    const remaining = MAX_PROGRESS - snapshot.progress;

    if (remaining <= 0.001) {
      updateRouteProgress({ progress: MAX_PROGRESS });
      clearTrickleTimer();
      return;
    }

    updateRouteProgress({
      progress: snapshot.progress + remaining * 0.18,
    });
  }, TRICKLE_INTERVAL_MS);
}

export function completeRouteProgress() {
  if (typeof window === 'undefined') {
    return;
  }

  if (!snapshot.isVisible && !snapshot.isLoading) {
    return;
  }

  clearTrickleTimer();
  updateRouteProgress({
    isVisible: true,
    progress: 1,
    isLoading: false,
  });

  if (hideTimer !== null) {
    window.clearTimeout(hideTimer);
  }

  hideTimer = window.setTimeout(() => {
    snapshot = {
      isVisible: false,
      progress: 0,
      isLoading: false,
    };
    emitRouteProgress();
    hideTimer = null;
  }, COMPLETE_HIDE_DELAY_MS);
}

export function attachRouteProgressListeners() {
  const handleDocumentClick = (event: MouseEvent) => {
    const target = event.target;
    if (!(target instanceof Element)) {
      return;
    }

    const anchor = target.closest('a[href]');
    if (!(anchor instanceof HTMLAnchorElement)) {
      return;
    }

    if (!shouldTrackAnchorNavigation(anchor, event)) {
      return;
    }

    startRouteProgress();
  };

  const handlePopState = () => {
    startRouteProgress();
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        completeRouteProgress();
      });
    });
  };

  document.addEventListener('click', handleDocumentClick);
  window.addEventListener('popstate', handlePopState);

  return () => {
    document.removeEventListener('click', handleDocumentClick);
    window.removeEventListener('popstate', handlePopState);
  };
}

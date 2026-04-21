'use client';

import { useCallback, useState } from 'react';

type ResourceArticleShareRowProps = {
  url: string;
  title: string;
};

const iconBtn =
  'flex h-10 w-10 items-center justify-center rounded-full text-[#6E6E73] transition-colors hover:bg-black/[0.06] hover:text-[#1D1D1F] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4BA7F5]';

export default function ResourceArticleShareRow({ url, title }: ResourceArticleShareRowProps) {
  const [copied, setCopied] = useState(false);
  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);

  const copyLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      /* ignore */
    }
  }, [url]);

  return (
    <div className="mt-8 flex flex-wrap items-center gap-1 sm:gap-2">
      <span className="sr-only" aria-live="polite">
        {copied ? 'Lien copié dans le presse-papiers' : ''}
      </span>
      <a
        href={`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`}
        target="_blank"
        rel="noopener noreferrer"
        className={iconBtn}
        aria-label="Partager sur Facebook"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
          <path d="M14 13.5h2.5L17 10h-2.5V8.25c0-.69.56-1.25 1.25-1.25H17V5h-2.5c-2.48 0-4.5 2.02-4.5 4.5V10H8v3.5h2V22h3V13.5z" />
        </svg>
      </a>
      <a
        href={`https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`}
        target="_blank"
        rel="noopener noreferrer"
        className={iconBtn}
        aria-label="Partager sur X"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      </a>
      <a
        href={`mailto:?subject=${encodedTitle}&body=${encodeURIComponent(`${title}\n\n${url}`)}`}
        className={iconBtn}
        aria-label="Partager par e-mail"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
          <path d="M4 6h16v12H4V6z" strokeLinejoin="round" />
          <path d="M4 7l8 6 8-6" strokeLinecap="round" />
        </svg>
      </a>
      <button type="button" onClick={copyLink} className={iconBtn} aria-label="Copier le lien">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.65" aria-hidden>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
          />
        </svg>
      </button>
    </div>
  );
}

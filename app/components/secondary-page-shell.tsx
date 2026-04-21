import type { CSSProperties, ReactNode } from 'react';
import SiteFooter from '@/app/components/site-footer';
import SiteHeader from '@/app/components/site-header';

type SecondaryPageShellProps = {
  children: ReactNode;
  containerClassName?: string;
  pageClassName?: string;
  pageStyle?: CSSProperties;
  footerClassName?: string;
  topContent?: ReactNode;
  /** Bloc pleine largeur sous le header (ex. hero image plein écran), sans wrapper blanc ni max-width. */
  fullBleedTop?: ReactNode;
  /** Bloc pleine largeur entre le contenu principal et le footer (ex. CTA plein écran). */
  fullBleedBottom?: ReactNode;
  contentSectionClassName?: string;
  /** Avec `landingMinimal` : traits de menu/logo adaptés au fond clair (true) ou sombre (false). */
  landingHeaderLightSurface?: boolean;
  /** Une seule zone sous le header (ex. cas d’usage famille) : évite une bande blanche vide si pas de hero. */
  mainOnly?: boolean;
  /** Hero plein écran : pas de padding-top sur le wrapper (le hero gère le dégagement du header). */
  fullViewportTop?: boolean;
  /** Remplace le padding vertical par défaut de la zone sous le hero (`py-10 sm:py-12 md:py-14`). */
  contentPaddingClassName?: string;
  /** Padding bas du bloc `topContent` (défaut `pb-10 sm:pb-12 md:pb-14`). */
  topContentBottomPaddingClassName?: string;
  /** Fond du wrapper autour de `topContent` (défaut blanc). */
  topContentOuterClassName?: string;
};

export default function SecondaryPageShell({
  children,
  containerClassName = 'max-w-6xl',
  pageClassName = '',
  pageStyle,
  /** Même pied de page que la landing (`home-marketing-sections`). */
  footerClassName = 'relative mt-0 rounded-none bg-[#121418] px-4 pb-10 pt-12 text-white sm:px-6 sm:pb-12 sm:pt-14 md:pb-16 md:pt-16',
  topContent,
  fullBleedTop,
  fullBleedBottom,
  contentSectionClassName = 'bg-white',
  landingHeaderLightSurface = true,
  mainOnly = false,
  fullViewportTop = false,
  contentPaddingClassName,
  topContentBottomPaddingClassName = 'pb-10 sm:pb-12 md:pb-14',
  topContentOuterClassName = 'bg-white',
}: SecondaryPageShellProps) {
  const mainPaddingClass =
    'pt-[5.25rem] sm:pt-24 md:pt-28 pb-10 sm:pb-12 md:pb-14';
  const defaultContentPadding = 'py-10 sm:py-12 md:py-14';
  const contentPadding =
    contentPaddingClassName ?? (mainOnly ? mainPaddingClass : defaultContentPadding);
  const topContentPaddingClass = fullViewportTop
    ? 'pt-0'
    : 'pt-[5.25rem] sm:pt-24 md:pt-28';

  return (
    <main
      className={`site-grid-bg ds-shell relative min-h-screen bg-white ${pageClassName}`.trim()}
      style={pageStyle}
    >
      <SiteHeader
        variant="dark"
        position="fixed"
        landingMinimal
        landingMinimalLightSurface={landingHeaderLightSurface}
      />

      {fullBleedTop ? <div className="cv-auto">{fullBleedTop}</div> : null}

      {!mainOnly && topContent ? (
        <div className={`cv-auto ${topContentOuterClassName}`.trim()}>
          <div
            className={`mx-auto w-full px-4 sm:px-6 ${topContentBottomPaddingClassName} ${topContentPaddingClass} ${containerClassName}`.trim()}
          >
            {topContent}
          </div>
        </div>
      ) : null}

      <div className={`cv-auto ${contentSectionClassName}`.trim()}>
        <div
          className={`mx-auto w-full px-4 sm:px-6 ${contentPadding} ${containerClassName}`.trim()}
        >
          {children}
        </div>
      </div>

      {fullBleedBottom ? <div className="cv-auto">{fullBleedBottom}</div> : null}

      <SiteFooter className={footerClassName} />
    </main>
  );
}

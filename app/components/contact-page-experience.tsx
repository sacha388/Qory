import Link from 'next/link';
import SiteFooter from '@/app/components/site-footer';
import SiteHeader from '@/app/components/site-header';
import { contactHeroNaturePexels, contactPageMeta } from '@/app/lib/contact-page-content';

export default function ContactPageExperience() {
  const mailto = `mailto:${contactPageMeta.email}?subject=${encodeURIComponent('Contact Qory')}`;

  /** Même gouttière et largeur max que le bloc hero (texte centré). */
  const pageColumn = 'mx-auto w-full max-w-5xl px-4 sm:px-6';
  const kicker = 'text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-white/45';
  const h2 = 'text-lg font-semibold tracking-tight text-white sm:text-xl';
  const body = 'text-[0.98rem] leading-relaxed text-white/78';
  const itemTitle = 'text-[1.02rem] font-medium text-white';

  return (
    <main className="site-grid-bg relative min-h-screen overflow-x-clip bg-[#0c0d0f] text-white">
      <SiteHeader variant="dark" position="fixed" landingMinimal landingMinimalLightSurface={false} />

      <section className="relative flex min-h-svh flex-col items-center justify-center px-4 pb-[5.25rem] pt-[5.25rem] sm:px-6 sm:pb-24 sm:pt-24 md:pb-28 md:pt-28">
        <div className="absolute inset-0">
          <img
            src={contactHeroNaturePexels.src}
            alt=""
            className="h-full w-full object-cover object-center"
            width={1920}
            height={1080}
            fetchPriority="high"
            decoding="async"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/75 via-black/55 to-black/80" aria-hidden />
        </div>

        <div className={`relative z-10 mx-auto flex w-full max-w-5xl flex-col items-center text-center px-4 sm:px-6`}>
          <img
            src="/logo.svg"
            alt="Qory"
            className="mx-auto mb-8 h-[4.75rem] w-[4.75rem] brightness-0 invert sm:h-[5.4rem] sm:w-[5.4rem]"
          />
          <h1 className="max-w-5xl text-balance text-[3.25rem] font-semibold leading-[0.92] tracking-tight text-white sm:text-[4.9rem] lg:text-[6.25rem]">
            {contactPageMeta.title}
          </h1>
          <p className="mt-6 max-w-3xl text-base leading-7 text-white/88 sm:text-lg">
            {contactPageMeta.heroLead}
          </p>

          <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
            <Link
              href={contactPageMeta.primaryCtaHref}
              className="inline-flex h-14 items-center justify-center rounded-full bg-white px-7 text-sm font-semibold text-[#111111] transition-colors hover:bg-white/90 sm:text-base"
            >
              {contactPageMeta.primaryCtaLabel}
            </Link>
            <Link
              href={contactPageMeta.secondaryCtaHref}
              className="inline-flex h-14 items-center justify-center rounded-full border border-white/35 bg-white/10 px-7 text-sm font-semibold text-white shadow-none backdrop-blur-[6px] transition-[background-color,border-color,box-shadow,color] duration-200 ease-out hover:border-white/60 hover:bg-white/25 hover:shadow-[0_0_0_1px_rgba(255,255,255,0.12)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/60 sm:text-base"
            >
              {contactPageMeta.secondaryCtaLabel}
            </Link>
          </div>
        </div>
      </section>

      <article className={`${pageColumn} cv-auto space-y-16 pb-20 pt-14 sm:space-y-20 sm:pb-28 sm:pt-16`}>
        <section className="cv-auto space-y-4" aria-labelledby="contact-email-heading">
          <h2 id="contact-email-heading" className={kicker}>
            Adresse e-mail
          </h2>
          <p className={`${body} text-white/70`}>Pour toute question ou demande, écrivez-nous directement.</p>
          <a
            href={mailto}
            className="inline-block break-all text-[1.35rem] font-medium text-[#8EC8FF] underline decoration-[#8EC8FF]/40 underline-offset-[5px] transition-colors hover:text-[#b8ddff] hover:decoration-[#b8ddff]/55 sm:text-[1.5rem]"
          >
            {contactPageMeta.email}
          </a>
          <p className={`${body} max-w-md text-white/62`}>{contactPageMeta.emailFootnote}</p>
        </section>

        <section className="cv-auto space-y-6" aria-labelledby="contact-why-heading">
          <h2 id="contact-why-heading" className={kicker}>
            Dans quels cas nous écrire
          </h2>
          <ol className="space-y-8">
            <li className="grid gap-2 sm:grid-cols-[auto_1fr] sm:gap-x-4 sm:gap-y-1">
              <span className="font-mono text-[0.85rem] tabular-nums text-white/40 sm:pt-0.5" aria-hidden>
                01
              </span>
              <div>
                <p className={itemTitle}>Comprendre votre rapport</p>
                <p className={`mt-2 ${body}`}>
                  Score surprenant, passage peu clair, ordre des corrections : on vous aide à lire le rapport concrètement.
                </p>
              </div>
            </li>
            <li className="grid gap-2 sm:grid-cols-[auto_1fr] sm:gap-x-4 sm:gap-y-1">
              <span className="font-mono text-[0.85rem] tabular-nums text-white/40 sm:pt-0.5" aria-hidden>
                02
              </span>
              <div>
                <p className={itemTitle}>Régler un problème</p>
                <p className={`mt-2 ${body}`}>
                  Paiement, accès au rapport, chargement ou lien expiré : décrivez la situation, on vous indique la marche à
                  suivre.
                </p>
              </div>
            </li>
            <li className="grid gap-2 sm:grid-cols-[auto_1fr] sm:gap-x-4 sm:gap-y-1">
              <span className="font-mono text-[0.85rem] tabular-nums text-white/40 sm:pt-0.5" aria-hidden>
                03
              </span>
              <div>
                <p className={itemTitle}>Parler d’un besoin professionnel</p>
                <p className={`mt-2 ${body}`}>
                  Équipe, volume d’analyses, usage métier : expliquez votre contexte, nous répondons de façon directe.
                </p>
              </div>
            </li>
          </ol>
        </section>

        <section className="cv-auto space-y-4" aria-labelledby="contact-tips-heading">
          <h2 id="contact-tips-heading" className={kicker}>
            Ce qui nous aide à répondre vite
          </h2>
          <p className={body}>Si vous le pouvez, indiquez dans votre message :</p>
          <ul className={`space-y-2.5 ${body}`}>
            {[
              'l’URL analysée',
              'le lien vers le rapport (si vous l’avez)',
              'ce que vous attendez comme réponse',
              'une capture d’écran en cas d’erreur',
            ].map((item) => (
              <li key={item} className="flex gap-2.5">
                <span className="mt-[0.5em] shrink-0 text-white/35" aria-hidden>
                  ·
                </span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
          <p className={`${body} text-white/65`}>Plus le message est précis, plus notre retour sera utile.</p>
        </section>

        <section className="cv-auto space-y-3" aria-labelledby="contact-delays-heading">
          <h2 id="contact-delays-heading" className={h2}>
            Délais
          </h2>
          <p className={body}>
            En règle générale sous 24 à 48h ouvrées. Les demandes liées au paiement ou à l’accès sont traitées en priorité.
          </p>
        </section>
      </article>

      <SiteFooter className="relative mt-0 rounded-none bg-[#121418] px-4 pb-10 pt-12 text-white sm:px-6 sm:pb-12 sm:pt-14 md:pb-16 md:pt-16" />
    </main>
  );
}

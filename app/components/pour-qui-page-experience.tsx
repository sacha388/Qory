import Link from 'next/link';
import SiteFooter from '@/app/components/site-footer';
import SiteHeader from '@/app/components/site-header';
import { pourQuiPageMeta, pourQuiSegments } from '@/app/lib/pour-qui-content';

function SegmentRow({
  title,
  body,
  href,
  visualSide,
  imageSrc,
  imageAlt,
}: {
  title: string;
  body: string;
  href: string;
  visualSide: 'left' | 'right';
  imageSrc: string;
  imageAlt: string;
}) {
  const visual = (
    <div className="relative min-h-[240px] sm:min-h-[300px] lg:min-h-[min(26rem,58vh)]">
      <img
        src={imageSrc}
        alt={imageAlt}
        className="absolute inset-0 h-full w-full object-cover"
        loading="lazy"
        decoding="async"
      />
    </div>
  );

  const copy = (
    <div className="flex min-h-[min(26rem,58vh)] flex-col justify-center px-4 py-12 sm:px-8 sm:py-16 lg:px-12 lg:py-20">
      <h2 className="text-balance text-[2rem] font-semibold leading-[0.94] tracking-tight text-[#111111] sm:text-[2.65rem] lg:text-[3rem]">
        {title}
      </h2>
      <p className="mt-5 max-w-xl text-base leading-7 text-[#5C5C64] sm:text-lg">{body}</p>
      <div className="mt-8">
        <Link
          href={href}
          className="text-sm font-semibold text-[#111111] underline decoration-black/25 underline-offset-4 transition-colors hover:decoration-black/60 sm:text-base"
        >
          Voir les cas d’usage
        </Link>
      </div>
    </div>
  );

  if (visualSide === 'left') {
    return (
      <section className="cv-auto grid border-t border-black/[0.06] bg-white lg:grid-cols-2">
        <div className="order-1 lg:col-start-1 lg:row-start-1">{visual}</div>
        <div className="order-2 mx-auto w-full max-w-xl lg:col-start-2 lg:row-start-1 lg:max-w-none">{copy}</div>
      </section>
    );
  }

  return (
    <section className="cv-auto grid border-t border-black/[0.06] bg-white lg:grid-cols-2">
      <div className="order-2 mx-auto w-full max-w-xl lg:order-1 lg:col-start-1 lg:row-start-1 lg:max-w-none">
        {copy}
      </div>
      <div className="order-1 lg:order-2 lg:col-start-2 lg:row-start-1">{visual}</div>
    </section>
  );
}

export default function PourQuiPageExperience() {
  return (
    <main className="site-grid-bg relative min-h-screen overflow-x-clip bg-white">
      <SiteHeader variant="dark" position="fixed" landingMinimal landingMinimalLightSurface />

      <section className="relative flex min-h-svh flex-col items-center justify-center bg-white px-4 pb-[5.25rem] pt-[5.25rem] sm:px-6 sm:pb-24 sm:pt-24 md:pb-28 md:pt-28">
        <div className="mx-auto flex w-full max-w-5xl flex-col items-center text-center">
          <img
            src="/logo.svg"
            alt="Qory"
            className="mx-auto mb-8 h-[4.75rem] w-[4.75rem] sm:h-[5.4rem] sm:w-[5.4rem]"
          />
          <h1 className="max-w-5xl text-balance text-[3.25rem] font-semibold leading-[0.92] tracking-tight text-[#111111] sm:text-[4.9rem] lg:text-[6.25rem]">
            {pourQuiPageMeta.title}
          </h1>
          <p className="mt-6 max-w-3xl text-base leading-7 text-[#5C5C64] sm:text-lg">{pourQuiPageMeta.heroDescription}</p>

          <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
            <Link
              href={pourQuiPageMeta.primaryHref}
              className="inline-flex h-14 items-center justify-center rounded-full bg-[#111111] px-7 text-sm font-semibold text-white transition-colors hover:bg-[#000000] sm:text-base"
            >
              {pourQuiPageMeta.primaryLabel}
            </Link>
            <Link
              href={pourQuiPageMeta.secondaryHref}
              className="inline-flex h-14 items-center justify-center rounded-full border border-black/10 bg-white px-7 text-sm font-semibold text-[#111111] transition-colors hover:bg-[#F5F5F7] sm:text-base"
            >
              {pourQuiPageMeta.secondaryLabel}
            </Link>
          </div>
        </div>
      </section>

      <div className="cv-auto">
        {pourQuiSegments.map((seg) => (
          <SegmentRow
            key={seg.id}
            title={seg.title}
            body={seg.body}
            href={seg.href}
            visualSide={seg.visualSide}
            imageSrc={seg.imageSrc}
            imageAlt={seg.imageAlt}
          />
        ))}
      </div>

      <SiteFooter className="relative mt-0 rounded-none bg-[#121418] px-4 pb-10 pt-12 text-white sm:px-6 sm:pb-12 sm:pt-14 md:pb-16 md:pt-16" />
    </main>
  );
}

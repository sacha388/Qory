import Link from 'next/link';
import QoryWord from '@/app/components/qory-word';

type ErrorAction = {
  href: string;
  label: string;
  variant?: 'primary' | 'secondary';
};

type ErrorStatePageProps = {
  eyebrow: string;
  title: string;
  description: string;
  actions: ErrorAction[];
  equalActionWidths?: boolean;
};

export default function ErrorStatePage({
  eyebrow,
  title,
  description,
  actions,
  equalActionWidths = false,
}: ErrorStatePageProps) {
  return (
    <main className="site-grid-bg ds-shell relative min-h-screen overflow-hidden">
      <div className="pointer-events-none absolute left-1/2 top-8 sm:top-10 md:top-[84px] -translate-x-1/2 z-10">
        <div className="flex items-center justify-center gap-2.5 md:gap-3">
          <img src="/logo.svg" alt="Qory" className="h-[22px] w-[22px] brightness-0 invert md:h-[26px] md:w-[26px]" />
          <span className="text-2xl font-semibold text-primary md:text-3xl"><QoryWord /></span>
        </div>
      </div>

      <div className="absolute inset-0 flex items-center justify-center px-4 sm:px-6 z-20">
        <div className="ds-card w-full max-w-2xl p-6 text-center sm:p-8 md:p-10">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.08em] text-white sm:text-sm md:text-base">
            {eyebrow}
          </p>
          <h1 className="mb-4 text-3xl font-bold leading-tight text-primary sm:text-4xl md:text-5xl">{title}</h1>
          <p className="mx-auto max-w-xl text-sm text-secondary sm:text-base md:text-lg">{description}</p>

          <div className="mt-6 sm:mt-8 flex flex-wrap items-center justify-center gap-3">
            {actions.map((action) => {
              const isPrimary = action.variant !== 'secondary';
              return (
                <Link
                  key={`${action.href}-${action.label}`}
                  href={action.href}
                  className={
                    isPrimary
                      ? `inline-flex h-11 items-center justify-center rounded-full bg-white px-5 text-sm font-semibold text-black transition-colors hover:bg-[#F2F2F2] sm:h-12 sm:px-6 sm:text-base ${
                          equalActionWidths ? 'w-[170px] sm:w-[190px]' : ''
                        }`
                      : `inline-flex h-11 items-center justify-center rounded-full border border-white/[0.1] bg-elevated px-5 text-sm font-semibold text-primary transition-colors hover:bg-white/[0.12] sm:h-12 sm:px-6 sm:text-base ${
                          equalActionWidths ? 'w-[170px] sm:w-[190px]' : ''
                        }`
                  }
                >
                  {action.label}
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </main>
  );
}

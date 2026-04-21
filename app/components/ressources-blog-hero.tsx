import { ressourcesBlogHero, ressourcesBlogHeroPexels } from '@/app/lib/ressources-page-content';

export default function RessourcesBlogHero() {
  return (
    <section className="relative flex min-h-svh flex-col items-center justify-center px-4 pb-[5.25rem] pt-[5.25rem] sm:px-6 sm:pb-24 sm:pt-24 md:pb-28 md:pt-28">
      <div className="absolute inset-0">
        <img
          src={ressourcesBlogHeroPexels.src}
          alt=""
          className="h-full w-full object-cover object-center"
          width={1920}
          height={1080}
          fetchPriority="high"
          decoding="async"
        />
        <div
          className="absolute inset-0 bg-gradient-to-b from-black/75 via-black/55 to-black/80"
          aria-hidden
        />
      </div>

      <div className="relative z-10 mx-auto flex w-full max-w-5xl flex-col items-center text-center">
        <img
          src="/logo.svg"
          alt="Qory"
          className="mx-auto mb-8 h-[4.75rem] w-[4.75rem] brightness-0 invert sm:h-[5.4rem] sm:w-[5.4rem]"
        />
        <h1 className="max-w-5xl text-balance text-[3.25rem] font-semibold leading-[0.92] tracking-tight text-white sm:text-[4.9rem] lg:text-[6.25rem]">
          {ressourcesBlogHero.title}
        </h1>
        <p className="mt-6 max-w-3xl text-base leading-7 text-white/88 sm:text-lg">
          {ressourcesBlogHero.description}
        </p>
      </div>
    </section>
  );
}

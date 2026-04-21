/** Hero plein écran : centrage vertical du bloc (logo + titre + texte) dans la fenêtre. */
export default function SecondaryPageHero({
  title,
  description,
  /** Remplace le padding bas symétrique (ex. page Cas d’usage plus serrée). */
  sectionPaddingBottomClassName = 'pb-[5.25rem] sm:pb-24 md:pb-28',
}: {
  title: string;
  description: string;
  sectionPaddingBottomClassName?: string;
}) {
  return (
    <section
      className={`relative flex min-h-svh flex-col items-center justify-center bg-white px-0 pt-[5.25rem] sm:pt-24 md:pt-28 ${sectionPaddingBottomClassName}`}
    >
      <div className="mx-auto flex w-full max-w-5xl flex-col items-center text-center">
        <img
          src="/logo.svg"
          alt="Qory"
          className="mx-auto mb-8 h-[4.75rem] w-[4.75rem] sm:h-[5.4rem] sm:w-[5.4rem]"
        />
        <h1 className="max-w-5xl text-balance text-[3.25rem] font-semibold leading-[0.92] tracking-tight text-[#111111] sm:text-[4.9rem] lg:text-[6.25rem]">
          {title}
        </h1>
        <p className="mt-6 max-w-3xl text-base leading-7 text-[#5C5C64] sm:text-lg">{description}</p>
      </div>
    </section>
  );
}

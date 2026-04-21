import Link from 'next/link';

type SecondaryBreadcrumbItem = {
  label: string;
  href?: string;
};

type SecondaryBreadcrumbsProps = {
  items: SecondaryBreadcrumbItem[];
  className?: string;
};

export default function SecondaryBreadcrumbs({
  items,
  className = 'mt-8 flex flex-wrap items-center gap-2 text-sm text-[#6E6E73] sm:mt-10',
}: SecondaryBreadcrumbsProps) {
  return (
    <nav aria-label="Fil d’Ariane" className={className}>
      {items.map((item, index) => (
        <div key={`${item.label}-${index}`} className="inline-flex items-center gap-2">
          {item.href ? (
            <Link href={item.href} className="text-[#4BA7F5] transition-opacity hover:opacity-75">
              {item.label}
            </Link>
          ) : (
            <span className="text-[#1D1D1F]">{item.label}</span>
          )}

          {index < items.length - 1 ? <span className="text-black/20">/</span> : null}
        </div>
      ))}
    </nav>
  );
}

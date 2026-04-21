import Link from 'next/link';
import type { ReactNode } from 'react';

/** Paragraphe avec liens Markdown légers `[libellé](/chemin)`. */
export default function ResourceArticleParagraph({
  text,
  className,
}: {
  text: string;
  className?: string;
}) {
  const parts: ReactNode[] = [];
  let last = 0;
  let m: RegExpExecArray | null;
  const re = /\[([^\]]+)\]\(([^)]+)\)/g;
  let key = 0;
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) {
      parts.push(text.slice(last, m.index));
    }
    parts.push(
      <Link
        key={key++}
        href={m[2]!}
        className="font-medium text-[#4BA7F5] underline decoration-[#4BA7F5]/35 underline-offset-[3px] transition-colors hover:decoration-[#4BA7F5]/70"
      >
        {m[1]}
      </Link>
    );
    last = m.index + m[0].length;
  }
  if (last < text.length) {
    parts.push(text.slice(last));
  }
  return <p className={className}>{parts.length > 0 ? parts : text}</p>;
}

type QoryWordProps = {
  className?: string;
  lowercase?: boolean;
};

export default function QoryWord({
  className = '',
  lowercase = false,
}: QoryWordProps) {
  const firstLetter = lowercase ? 'q' : 'Q';

  return (
    <span className={className}>
      <span>{firstLetter}</span>
      <span>o</span>
      <span>r</span>
      <span className="inline-block ml-[0.02em]">y</span>
    </span>
  );
}

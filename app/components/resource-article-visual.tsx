type ResourceArticleVisualProps = {
  className?: string;
  logoClassName?: string;
  logoHoverClassName?: string;
};

export default function ResourceArticleVisual({
  className = '',
  logoClassName = '',
  logoHoverClassName = '',
}: ResourceArticleVisualProps) {
  return (
    <div
      className={`flex items-center justify-center overflow-hidden rounded-[28px] bg-black ${className}`.trim()}
    >
      <img
        src="/logo.svg"
        alt="Qory"
        className={`h-16 w-16 brightness-0 invert ${logoClassName} ${logoHoverClassName}`.trim()}
      />
    </div>
  );
}

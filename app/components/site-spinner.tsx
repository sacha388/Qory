type SiteSpinnerProps = {
  className?: string;
};

export default function SiteSpinner({ className = '' }: SiteSpinnerProps) {
  return (
    <div
      aria-hidden="true"
      className={`h-12 w-12 rounded-full border-2 border-elevated border-t-white animate-spin ${className}`.trim()}
    />
  );
}

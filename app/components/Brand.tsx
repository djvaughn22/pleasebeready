// The PleaseBeReady mark and wordmark. The mark is an orange tile with a navy
// shopping bag and an orange check: shop for it, then you're ready. The same
// shapes are in app/icon.svg, the app icons, the share card and the social
// images (docs/social/brand/make.py), so keep them in step.

export const BRAND = { orange: "#F97316", navy: "#0b1220" };

export function Mark({ size = 32, className = "" }: { size?: number; className?: string }) {
  return (
    <svg viewBox="0 0 96 96" width={size} height={size} aria-hidden className={className}>
      <rect width="96" height="96" rx="24" fill={BRAND.orange} />
      <path d="M37 43V31a11 11 0 0 1 22 0v12" fill="none" stroke={BRAND.navy} strokeWidth="5.5" strokeLinecap="round" />
      <path d="M19 37h58l-4.2 37.4a7 7 0 0 1-7 6.2H30.2a7 7 0 0 1-7-6.2Z" fill={BRAND.navy} />
      <circle cx="37" cy="44" r="2.5" fill={BRAND.orange} />
      <circle cx="59" cy="44" r="2.5" fill={BRAND.orange} />
      <path d="M36.5 63l8 8L61 54.5" fill="none" stroke={BRAND.orange} strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** "PleaseBeReady" with "Ready" in brand orange, in the display face. */
export function Wordmark({ className = "" }: { className?: string }) {
  return (
    <span className={`pbr-display font-black tracking-tight text-[#e8edf5] ${className}`}>
      PleaseBe<span className="pbr-accent">Ready</span>
    </span>
  );
}

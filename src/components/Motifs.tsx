// Lightweight Polynesian-inspired SVG motifs. Used sparingly: a tiare mark for
// kickers/section marks and a niho-mano (shark-teeth) row as a divider.

export function TiareMark({ className = "" }: { className?: string }) {
  // Five-petal tiare (Tahitian gardenia) glyph; inherits currentColor.
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      aria-hidden="true"
    >
      {[0, 72, 144, 216, 288].map((deg) => (
        <ellipse
          key={deg}
          cx="12"
          cy="6.5"
          rx="3.1"
          ry="5.5"
          fill="currentColor"
          opacity="0.9"
          transform={`rotate(${deg} 12 12)`}
        />
      ))}
      <circle cx="12" cy="12" r="2" fill="var(--color-bg)" />
    </svg>
  );
}

export function NihoMano({ className = "" }: { className?: string }) {
  // A repeating shark-teeth band — purely decorative divider.
  return (
    <svg
      viewBox="0 0 120 8"
      preserveAspectRatio="none"
      className={className}
      aria-hidden="true"
    >
      <defs>
        <pattern id="niho" width="12" height="8" patternUnits="userSpaceOnUse">
          <path d="M0 8 L6 0 L12 8 Z" fill="currentColor" />
        </pattern>
      </defs>
      <rect width="120" height="8" fill="url(#niho)" />
    </svg>
  );
}

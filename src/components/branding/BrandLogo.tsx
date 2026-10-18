interface BrandLogoProps {
  className?: string;
  variant?: 'standalone' | 'badge';
}

export function BrandLogo({ className = "w-8 h-8", variant = "badge" }: BrandLogoProps) {
  // SVG des arche dorées officielles McDonald's
  const GoldenArchesSVG = (
    <svg
      viewBox="0 0 273 239"
      className="w-full h-full text-mcd-yellow fill-current"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="McDonald's Golden Arches"
    >
      <path d="M195.8 17.933c23.3 0 42.2 98.3 42.2 219.7h34c0-130.7-34.3-236.5-76.3-236.5-24 0-45.2 31.7-59.2 81.5-14-49.8-35.2-81.5-59-81.5-42 0-76.2 105.7-76.2 236.4h34c0-121.4 18.7-219.6 42-219.6s42.2 90.8 42.2 219.6h34.3c0-121.4 18.8-219.7 42.1-219.7z" />
    </svg>
  );

  // Variant Badge (Encadré dans un carré vert/rouge avec coins légèrement arrondis)
  if (variant === 'badge') {
    return (
      <div className={`bg-mcd-green p-1.5 rounded-sm flex items-center justify-center border border-emerald-500/30 shrink-0 ${className}`}>
        {GoldenArchesSVG}
      </div>
    );
  }

  // Variant Standalone (Logo Jaune pur sans fond)
  return (
    <div className={`shrink-0 ${className}`}>
      {GoldenArchesSVG}
    </div>
  );
}
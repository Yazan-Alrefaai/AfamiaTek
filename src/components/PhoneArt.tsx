import Image from "next/image";

/**
 * Device artwork.
 *
 * Every catalog entry ships a real press render in /public/products, keyed to
 * a transparent background and letterboxed onto the same 4:5 frame so the grid
 * reads as one set. The vector handset below is the fallback for a product
 * added without a photo yet — it is tinted with the product accent.
 */
export function PhoneArt({
  accent,
  name,
  seed = 0,
  image,
  className = "",
  priority = false,
  sizes = "(min-width: 1024px) 22rem, (min-width: 640px) 45vw, 88vw",
}: {
  accent: string;
  name: string;
  seed?: number;
  image?: string;
  className?: string;
  priority?: boolean;
  /** every render is letterboxed to 900×1125, so this only tunes the srcset */
  sizes?: string;
}) {
  if (image) {
    return (
      <Image
        src={image}
        alt={name}
        width={900}
        height={1125}
        sizes={sizes}
        priority={priority}
        className={`h-full w-full object-contain ${className}`}
      />
    );
  }

  const uid = `pa${seed}`;
  // nudge the screen glow around so a grid of cards never looks stamped
  const glowX = 30 + ((seed * 37) % 45);
  const glowY = 22 + ((seed * 53) % 45);

  return (
    <svg
      viewBox="0 0 320 560"
      role="img"
      aria-label={name}
      className={`h-full w-full ${className}`}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id={`${uid}-frame`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#3a4049" />
          <stop offset="18%" stopColor="#8d94a0" />
          <stop offset="38%" stopColor="#2b3038" />
          <stop offset="62%" stopColor="#6f7580" />
          <stop offset="85%" stopColor="#22262d" />
          <stop offset="100%" stopColor="#4a505a" />
        </linearGradient>

        <linearGradient id={`${uid}-screen`} x1="0" y1="0" x2="0.6" y2="1">
          <stop offset="0%" stopColor="#0d1015" />
          <stop offset="100%" stopColor="#05070a" />
        </linearGradient>

        <radialGradient
          id={`${uid}-glow`}
          cx={`${glowX}%`}
          cy={`${glowY}%`}
          r="72%"
        >
          <stop offset="0%" stopColor={accent} stopOpacity="0.85" />
          <stop offset="45%" stopColor={accent} stopOpacity="0.22" />
          <stop offset="100%" stopColor={accent} stopOpacity="0" />
        </radialGradient>

        <linearGradient id={`${uid}-sheen`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.16" />
          <stop offset="42%" stopColor="#ffffff" stopOpacity="0.03" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
        </linearGradient>

        <linearGradient id={`${uid}-fade`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
        </linearGradient>

        <clipPath id={`${uid}-clip`}>
          <rect x="18" y="18" width="284" height="524" rx="34" />
        </clipPath>
      </defs>

      {/* contact shadow */}
      <ellipse
        cx="160"
        cy="548"
        rx="104"
        ry="12"
        fill="#000"
        opacity="0.55"
        filter="blur(1px)"
      />

      {/* metal frame */}
      <rect
        x="10"
        y="10"
        width="300"
        height="540"
        rx="42"
        fill={`url(#${uid}-frame)`}
      />
      <rect
        x="14"
        y="14"
        width="292"
        height="532"
        rx="38"
        fill="#0a0c10"
      />

      {/* screen */}
      <g clipPath={`url(#${uid}-clip)`}>
        <rect
          x="18"
          y="18"
          width="284"
          height="524"
          fill={`url(#${uid}-screen)`}
        />
        <rect
          x="18"
          y="18"
          width="284"
          height="524"
          fill={`url(#${uid}-glow)`}
        />

        {/* colonnade motif, echoing the Apamea columns in the brand */}
        <g opacity="0.16">
          {Array.from({ length: 9 }, (_, i) => (
            <rect
              key={i}
              x={30 + i * 30}
              y="18"
              width="1"
              height="524"
              fill={accent}
            />
          ))}
        </g>

        {/* horizon band */}
        <rect
          x="18"
          y="330"
          width="284"
          height="1"
          fill={accent}
          opacity="0.35"
        />

        {/* diagonal sheen */}
        <path
          d="M18 18 L302 18 L302 120 L18 300 Z"
          fill={`url(#${uid}-sheen)`}
        />

        {/* status bar */}
        <rect x="38" y="40" width="26" height="4" rx="2" fill="#ffffff" opacity="0.35" />
        <rect x="248" y="40" width="34" height="4" rx="2" fill="#ffffff" opacity="0.25" />

        {/* dock hint */}
        <rect
          x="112"
          y="518"
          width="96"
          height="4"
          rx="2"
          fill="#ffffff"
          opacity="0.4"
        />
      </g>

      {/* punch-hole camera */}
      <circle cx="160" cy="44" r="7" fill="#04060a" />
      <circle cx="160" cy="44" r="7" fill={`url(#${uid}-fade)`} opacity="0.5" />
      <circle cx="158" cy="42" r="2" fill={accent} opacity="0.6" />

      {/* side buttons */}
      <rect x="308" y="150" width="4" height="34" rx="2" fill="#5a616c" />
      <rect x="308" y="196" width="4" height="58" rx="2" fill="#5a616c" />

      {/* frame highlight */}
      <rect
        x="10.5"
        y="10.5"
        width="299"
        height="539"
        rx="41.5"
        fill="none"
        stroke="#ffffff"
        strokeOpacity="0.14"
      />
    </svg>
  );
}

/** Stable small integer from a slug, so artwork is deterministic per product. */
export function seedFromSlug(slug: string): number {
  let hash = 0;
  for (let i = 0; i < slug.length; i++) {
    hash = (hash * 31 + slug.charCodeAt(i)) % 9973;
  }
  return hash;
}

/**
 * The AFAMIA TEK mark, from the brand book: Apamea's pediment and arch sitting
 * on five column shafts, sheared along one diagonal so the shafts also read as
 * a rising signal wave.
 *
 * Drawn as a single colour in `currentColor`, so it inherits Apama Crimson from
 * whatever it sits in and stays legible down to favicon size.
 */
export function Logo({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 104 128"
      className={className}
      aria-hidden
      xmlns="http://www.w3.org/2000/svg"
      fill="currentColor"
    >
      <defs>
        {/* the single shear that turns five equal columns into the wave */}
        <clipPath id="afamia-shear">
          <path d="M0 0h104v120L0 64Z" />
        </clipPath>
      </defs>

      {/* pediment + arcade band, with the arch cut out of the centre */}
      <path d="M52 5 L102 29 V37 H98 V53 H68 A16 16 0 0 0 36 53 H6 V37 H2 V29 Z" />

      {/* five columns: capital, then shaft, all clipped by the shear */}
      <g clipPath="url(#afamia-shear)">
        {[13, 32.5, 52, 71.5, 91].map((x) => (
          <g key={x}>
            <rect x={x - 7.5} y="57" width="15" height="7" />
            <rect x={x - 4} y="64" width="8" height="64" />
          </g>
        ))}
      </g>
    </svg>
  );
}

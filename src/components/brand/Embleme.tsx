/**
 * L'EMBLÈME — la marque réduite.
 *
 * Le `MaskEmblem` du loader porte une gastroenterie : environ cinquante points de
 * décor. À 28 px — la taille d'un onglet de navigateur, ou d'un en-tête — cela devient
 * une bouillie. Cette version garde **ce qui porte le masque** : la silhouette, le
 * bandeau de front, le losange, les deux arcs des yeux, la bouche.
 *
 * Une seule identité, deux Scales :
 * - `MaskEmblem` (motion/) pour le loader, où la pièce a la place d'être détaillée ;
 * - ce composant pour l'en-tête, le favicon et toute petite taille.
 *
 * ⚠️ Le favicon public de `public/favicon.svg` reproduit cette géométrie. Modifier
 * l'un, c'est modifier l'autre : ils doivent rester identiques.
 */
export function Embleme({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 300 440"
      role="img"
      aria-label="Emblème Prince Edja — masque"
      className={className}
    >
      <g strokeLinejoin="round" strokeLinecap="round" stroke="currentColor" strokeWidth="6">
        {/* La silhouette : c'est elle qu'on reconnaît à n'importe quelle taille. */}
        <path
          d="M150 20C235 20 262 118 252 220 244 310 202 400 150 428 98 400 56 310 48 220 38 118 65 20 150 20Z"
          fill="currentColor"
          opacity="0.18"
        />
        <rect x="30" y="212" width="34" height="80" rx="16" fill="none" />
        <rect x="236" y="212" width="34" height="80" rx="16" fill="none" />

        {/* Bandeau de front et losange. */}
        <path d="M60 122C70 42 230 42 240 122 200 92 100 92 60 122Z" fill="currentColor" opacity="0.85" />
        <path d="M150 112 190 154 150 196 110 154Z" fill="none" strokeWidth="8" />

        {/* Les deux arcs des yeux. */}
        <path d="M84 238C96 214 130 208 144 234" fill="none" strokeWidth="13" />
        <path d="M216 238C204 214 170 208 156 234" fill="none" strokeWidth="13" />

        {/* La bouche. */}
        <path d="M150 212 174 302 150 318 126 302Z" fill="none" strokeWidth="8" />
      </g>
    </svg>
  )
}

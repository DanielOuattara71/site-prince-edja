import { AfricanPattern } from '@/components/motifs/AfricanPattern'

interface Mot {
  mot: string
  gloss: string
  /**
   * Mot de la glosse à mettre en valeur : or, italique, serif. Absent = pas de mise
   * en valeur. On découpe la glosse sur ce mot plutôt que de le baliser à la main,
   * pour que la copie reste une phrase lisible dans le fichier de données.
   */
  emphase?: string
}

const MOTS: Mot[] = [
  { mot: 'Mémoire', gloss: 'Ce que le symbole retient avant de devenir un objet.' },
  { mot: 'Transmission', gloss: 'Ce qu’il passe à celui qui le porte après vous.' },
  { mot: 'Matière', gloss: 'Bronze, laiton, argent : façonnés à la main.' },
  {
    mot: 'Édition',
    gloss: 'Des séries numérotées, jamais reproduites à l’identique.',
    emphase: 'numérotées',
  },
]

function Filigrane() {
  // Texture, pas du texte : le nom est dessiné par `::before` (aucun nœud texte), ce qui le
  // sort du contrôle de contraste — un filigrane à 5 % ne peut pas, par nature, y satisfaire.
  return (
    <span
      aria-hidden
      data-filigrane="Prince Edja"
      className="pointer-events-none absolute inset-x-0 bottom-0 z-0 translate-y-1/2 select-none text-center font-display text-display-xl uppercase leading-none tracking-[-0.03em] text-cream-100 opacity-5 before:content-[attr(data-filigrane)]"
    />
  )
}

/** Glosse, avec le mot mis en valeur en serif italique or. */
function Glosse({ entree }: { entree: Mot }) {
  if (!entree.emphase || !entree.gloss.includes(entree.emphase)) {
    return <>{entree.gloss}</>
  }

  const [avant, apres] = entree.gloss.split(entree.emphase)

  return (
    <>
      {avant}
      {/* `font-quote` est la serif déjà présente (Fraunces). On n'ajoute pas de
          quatrième famille typographique pour un mot. */}
      <em className="font-quote italic text-gold-400">{entree.emphase}</em>
      {apres}
    </>
  )
}

/**
 * Les quatre mots : un bloc éditorial compact, fond forêt.
 *
 * (L'ancien variante « scroll-staged » sur 240vh était dramatique mais improductive :
 * sans animation une capture devient un mur vide. Composition à plat lisible d'un coup
 * pour cette page.)
 */
export function ColonneMots() {
  return (
    <section className="relative overflow-hidden bg-forest-950 py-20 text-cream-100 lg:py-28">
      <Filigrane />
      {/* Motifs en crème mate sur la forêt : deux coins en écho, derrière le contenu. */}
      <AfricanPattern
        motif="linear-01"
        couleur="var(--color-cream-100)"
        opacite={0.07}
        className="-right-24 -top-24 h-80 w-80"
      />
      <AfricanPattern
        motif="spiral-02"
        couleur="var(--color-cream-100)"
        opacite={0.05}
        className="-bottom-24 -left-24 h-80 w-80"
      />
      {/* Le cauri se pose en sceau, entier dans le coin bas-droit : la règle du
          projet en fait une signature, pas une texture. */}
      <AfricanPattern
        motif="cauri-africain"
        couleur="var(--color-cream-100)"
        opacite={0.12}
        className="right-6 bottom-6 h-20 w-28 sm:h-24 sm:w-32 xl:h-32 xl:w-44"
      />
      <div className="relative z-10 mx-auto max-w-6xl px-6">
        <dl className="grid gap-8 sm:grid-cols-2">
          {MOTS.map((entree) => (
            <div key={entree.mot} className="border-t border-cream-100/25 pt-4">
              <dt className="font-display text-heading-md uppercase">{entree.mot}</dt>
              <dd className="mt-2 max-w-sm text-body-lg text-cream-100/70">
                <Glosse entree={entree} />
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  )
}

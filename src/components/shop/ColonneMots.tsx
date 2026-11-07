import { useRef, useState } from 'react'
import { motion, useMotionValueEvent, useReducedMotion, useScroll } from 'motion/react'
import { AfricanPattern } from '@/components/motifs/AfricanPattern'
import { DUR, EASE_EXPO } from '@/lib/motion'

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
      <em className={'font-quote italic text-gold-400'}>{entree.emphase}</em>
      {apres}
    </>
  )
}

/**
 * Colonne de mots révélée par le défilement.
 *
 * Quatre mots, un écran, quatre chapitres : le défilement choisit celui qui est allumé.
 * Un seul mouvement, répété : c'est ce qui le rend lisible plutôt que décoratif.
 *
 * Sans mouvement réduit, la colonne devient une liste à plat : les quatre mots et
 * leurs gloses sont là, lisibles d'un coup, sans dépendre du défilement.
 */
export function ColonneMots() {
  const conteneur = useRef<HTMLDivElement>(null)
  const reduit = useReducedMotion()
  const [actif, setActif] = useState(0)

  const { scrollYProgress } = useScroll({
    target: conteneur,
    offset: ['start start', 'end end'],
  })

  useMotionValueEvent(scrollYProgress, 'change', (progression) => {
    if (reduit) return
    const brut = Math.floor(progression * MOTS.length)
    setActif(Math.max(0, Math.min(brut, MOTS.length - 1)))
  })

  if (reduit) {
    return (
      <section className="relative overflow-hidden bg-forest-950 py-20 text-cream-100 lg:py-28">
        <Filigrane />
        {/* Motifs fournis, crème très atténuée sur la forêt : les coins se
            répondent, derrière le contenu (z-10). */}
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
        {/* Le cauri se pose en sceau, entier dans le coin bas-droit : la règle
            du projet en fait une signature, pas une texture. */}
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

  return (
    // 240vh et non 320 : quatre mots tenaient quatre écrans de défilement, la page
    // boutique en comptait onze. Le geste reste, la fatigue en moins.
    <div ref={conteneur} className="relative h-[240vh] bg-forest-950 text-cream-100">
      <div className="sticky top-0 flex h-svh items-center overflow-hidden">
        {/* Motifs fournis aux deux coins, crème très atténuée sur la forêt :
            même grammaire que le bandeau de l'accueil, derrière le contenu
            (z-10 sur la colonne) et même accrochage dans les deux variantes. */}
        <AfricanPattern
          motif="linear-01"
          couleur="var(--color-cream-100)"
          opacite={0.07}
          className="-right-28 -top-28 h-96 w-96"
        />
        <AfricanPattern
          motif="spiral-02"
          couleur="var(--color-cream-100)"
          opacite={0.05}
          className="-bottom-28 -left-28 h-96 w-96"
        />
        {/* Le cauri, sceau entier : signature du bloc, coin bas-droit. */}
        <AfricanPattern
          motif="cauri-africain"
          couleur="var(--color-cream-100)"
          opacite={0.12}
          className="right-6 bottom-6 h-20 w-28 sm:right-8 sm:bottom-8 sm:h-24 sm:w-32 xl:right-12 xl:bottom-12 xl:h-32 xl:w-44"
        />
        <Filigrane />

        <div className="relative z-10 mx-auto flex w-full max-w-6xl flex-col items-start gap-10 px-6 lg:flex-row lg:items-center lg:gap-20">
          <ul className="min-w-0 flex-1 space-y-2 lg:space-y-4">
            {MOTS.map((entree, index) => (
              <li key={entree.mot} aria-hidden={index !== actif}>
                <span
                  className={
                    'block font-display text-display-lg uppercase leading-none transition-opacity duration-(--d-reveal) ease-expo ' +
                    (index === actif ? 'text-cream-100' : 'text-cream-100/40')
                  }
                >
                  {entree.mot}
                </span>
              </li>
            ))}
          </ul>

          {/* Filet vertical : en dégradé plutôt qu'en trait plein, pour qu'il naisse et
              meure avec le bloc au lieu de le traverser de part en part. */}
          <div
            aria-hidden
            className={'hidden w-px shrink-0 self-stretch bg-linear-to-b from-transparent via-gold-400/40 to-transparent lg:block'}
          />

          <div className="w-full lg:w-auto">
            {/* Entrée différée de 200 ms : elle lit la section après les titres. */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: DUR.reveal, ease: EASE_EXPO, delay: 0.2 }}
              className="space-y-5"
            >
              <motion.p
                key={actif}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: DUR.base, ease: EASE_EXPO }}
                className={'max-w-sm text-heading-sm leading-snug text-cream-100/85'}
              >
                <Glosse entree={MOTS[actif]} />
              </motion.p>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}

import { useRef, useState } from 'react'
import { motion, useMotionValueEvent, useReducedMotion, useScroll } from 'motion/react'
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
  return (
    <span
      aria-hidden
      className="pointer-events-none absolute inset-x-0 bottom-0 z-0 translate-y-1/2 select-none text-center font-display text-display-xl uppercase leading-none tracking-[-0.03em] text-cream-100 opacity-5"
    >
      Prince Edja
    </span>
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
      {/* La trame est posée sur le bloc collant, pas sur le conteneur de 240vh : elle
          accompagne ainsi la partie visible pendant tout le défilement. */}
      <div className="motif-tisse sticky top-0 flex h-svh items-center overflow-hidden">
        <Filigrane />

        <div className="relative z-10 mx-auto flex w-full max-w-6xl flex-col items-start gap-10 px-6 lg:flex-row lg:items-center lg:gap-20">
          <ul className="min-w-0 flex-1 space-y-2 lg:space-y-4">
            {MOTS.map((entree, index) => (
              <li key={entree.mot} aria-hidden={index !== actif}>
                <span
                  className={
                    'block font-display text-display-lg uppercase leading-none transition-opacity duration-(--d-reveal) ease-expo ' +
                    (index === actif ? 'text-cream-100' : 'text-cream-100/25')
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
              <div className="flex items-center gap-4">
                <span
                  className={'label-caps text-gold-400 tracking-[0.25em]'}
                >
                  {String(actif + 1).padStart(2, '0')} /{' '}
                  {String(MOTS.length).padStart(2, '0')}
                </span>
                {/* Le trait doré de 48 px : il donne une assise au compteur. */}
                <span aria-hidden className={'h-px w-12 bg-gold-400'} />
              </div>

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

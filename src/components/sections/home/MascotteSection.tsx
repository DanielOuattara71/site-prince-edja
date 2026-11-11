import type { ReactNode } from 'react'
import { motion, useReducedMotion } from 'motion/react'
import { useLangue } from '@/i18n/contexteLangue'
import { DUR, EASE_EXPO, STAGGER_STEP } from '@/lib/motion'
import { cn } from '@/lib/cn'
import { Section } from '@/components/layout/Section'
import { Eyebrow } from '@/components/ui/Eyebrow'
import { Button } from '@/components/ui/Button'
import { Reveal } from '@/components/motion/Reveal'
import { AfricanPattern } from '@/components/motifs/AfricanPattern'

/**
 * Mascotte exploratrice en paille — le petit guide qui incarne l’univers du voyage.
 *
 * Le fichier source (à la racine du projet) est une planche RGBA : la copie servie vit
 * dans `public/images/mascotte/`. Ce n’est pas un asset animé : les animations ci-dessous
 * concernent l’image entière, sans déformation ni recolorisation (aucune articulation de
 * tête, de bras, ni le flottement de l’écharpe n’étant simulés — un asset animé serait
 * nécessaire pour animer le personnage lui-même).
 */
const MASCOTTE_SRC = `${import.meta.env.BASE_URL}images/mascotte/mascotte-exploratrice-en-paille.png`

/**
 * « Voulez-vous découvrir et voyager avec moi dans mon univers ? »
 *
 * Les mots arrivent un à un (stagger), en lignes : chaque ligne se termine par
 * `finDeLigne`, les mots de la dernière ligne portent l’accent (`accent` → `text-clay-600`).
 */
const MOTS_TITRE = [
  { texte: 'Voulez-vous', finDeLigne: true },
  { texte: 'découvrir' },
  { texte: 'et', finDeLigne: true },
  { texte: 'voyager' },
  { texte: 'avec' },
  { texte: 'moi', finDeLigne: true },
  { texte: 'dans' },
  { texte: 'mon', accent: true },
  { texte: 'univers', accent: true },
  { texte: '?', finDeLigne: true },
]

export function MascotteSection() {
  const { t } = useLangue()
  const reducedMotion = useReducedMotion()

  // Apparition de la mascotte : fondu + légère translation verticale depuis le bas.
  const apparanceMascotte = reducedMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 72 }

  const invisibleTitre = reducedMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 32 }
  const visibleTitre = { opacity: 1, y: 0 }

  // Les mots du titre défilent les uns après les autres, en lignes (sauts après `finDeLigne`).
  const enfantsDuTitre: ReactNode[] = MOTS_TITRE.flatMap((mot, index) => {
    const dernier = index === MOTS_TITRE.length - 1
    const enfants: ReactNode[] = [
      <motion.span
        key={`mot-${index}`}
        initial={invisibleTitre}
        whileInView={visibleTitre}
        viewport={{ once: true, amount: 0.35 }}
        transition={{
          duration: DUR.reveal,
          ease: EASE_EXPO,
          delay: index * STAGGER_STEP,
        }}
        className={cn('mr-2 inline-block', mot.accent ? 'text-clay-600' : undefined)}
      >
        {mot.texte}
      </motion.span>,
    ]
    if (!dernier && mot.finDeLigne) {
      enfants.push(<br key={`saut-${index}`} />)
    }
    return enfants
  })

  return (
    <Section tone="light" className="relative isolate overflow-hidden">
      {/*
        Motifs africains fournis (SVG réels), décor uniquement. Le calque est placé
        derrière le contenu (`-z-10` + `isolate` sur la section) : aucun trait ne passe
        au-dessus du titre, du texte ou du bouton. Les motifs de coin ne s'affichent
        qu'à partir de `lg`, quand la colonne de droite dégage le coin haut-droit.
      */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <AfricanPattern
          motif="symetrique-04"
          opacite={0.06}
          className="-right-16 -top-16 hidden h-72 w-72 lg:block"
        />
        <AfricanPattern
          motif="spiral-02"
          opacite={0.05}
          className="bottom-4 left-2 hidden h-44 w-44 lg:block"
        />
      </div>

      {/* Pleine largeur, comme les autres cadrages forts du site : le titre et la
          colonne mascotte gagnent du terrain sur le conteneur centré. */}
      <div>
        <div className="relative z-10 grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          {/* Colonne texte */}
          <div className="max-w-2xl">
            <Reveal>
              <Eyebrow tone="light">{t('mascotte.surTitre')}</Eyebrow>
            </Reveal>

            <h2 className="mt-5 font-display uppercase text-display-lg text-ink-900">
              {enfantsDuTitre}
            </h2>

            <Reveal delay={1.35}>
              <p className="mt-6 max-w-2xl text-body-lg text-ink-500">
                Des paysages fascinants, des cultures authentiques et des histoires à découvrir.
                L’aventure commence ici.
              </p>
            </Reveal>

            <Reveal delay={2.15}>
              <Button to="/xplore" variant="primary" className="mt-8">
                {t('mascotte.cta')}
              </Button>
            </Reveal>
          </div>

          {/* Colonne mascotte */}
          <div className="relative flex justify-center lg:pl-8">
            {/*
              Accent géométrique ocre derrière la mascotte : le motif vertical rappelle
              un panneau tissé. Il reste sous l'image (`z-10` sur la mascotte), donc il
              ne masque ni le corps ni les accessoires.
            */}
            <AfricanPattern
              motif="linear-01"
              couleur="var(--color-clay-600)"
              opacite={0.18}
              className="top-0 -right-2 h-40 w-40 sm:h-52 sm:w-52 lg:-right-12 lg:h-72 lg:w-72"
            />
            <motion.div
              initial={apparanceMascotte}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{
                duration: DUR.reveal,
                ease: EASE_EXPO,
                delay: reducedMotion ? 0 : 0.35,
              }}
              className="relative z-10 flex w-full max-w-[20rem] justify-center lg:max-w-[32rem]"
            >
              <motion.img
                src={MASCOTTE_SRC}
                alt="Mascotte exploratrice en paille"
                className="h-auto w-full"
                animate={reducedMotion ? undefined : { y: [0, -8, 0] }}
                transition={
                  reducedMotion
                    ? undefined
                    : { repeat: Infinity, duration: 5, ease: 'easeInOut', repeatDelay: 2 }
                }
              />
            </motion.div>
          </div>
        </div>
      </div>
    </Section>
  )
}

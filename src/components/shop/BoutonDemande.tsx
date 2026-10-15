import { useState } from 'react'
import { motion } from 'motion/react'
import { useDemande } from '@/lib/demande'
import { useLangue } from '@/i18n/contexteLangue'
import { DUR, EASE_EXPO } from '@/lib/motion'
import { PanneauDemande } from './PanneauDemande'

/**
 * Déclencheur de la demande, toujours atteignable.
 *
 * Il porte le nombre de pièces sélectionnées et disparaît quand la sélection est vide :
 * un panier à zéro objet serait une invitation à cliquer dans le vide.
 */
export function BoutonDemande() {
  const { nombre } = useDemande()
  const { t } = useLangue()
  const [ouvert, setOuvert] = useState(false)

  if (nombre === 0) return null

  return (
    <>
      <button
        type="button"
        onClick={() => setOuvert(true)}
        // Le compteur visuel est décoratif : c'est le libellé accessible qui porte
        // le nombre. Sans lui, « Voir ma sélection » ne disait jamais combien.
        aria-label={`${t('demande.declencheur')} · ${nombre}`}
        className="fixed right-4 bottom-4 z-60 inline-flex min-h-11 items-center gap-3 rounded-full bg-night-900 px-5 text-caption font-semibold text-cream-100 transition-transform duration-(--d-fast) hover:scale-[1.03] focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-clay-600 lg:right-6 lg:bottom-6"
      >
        {t('demande.declencheur')}
        {/* Le compteur est animé sur sa clé : chaque ajout le fait naître, donc
            l'action est confirmée même quand on ne regarde pas la carte. */}
        <motion.span
          key={nombre}
          initial={{ scale: 0.4, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: DUR.fast, ease: EASE_EXPO }}
          aria-hidden
          className="flex size-6 items-center justify-center rounded-full bg-clay-500 text-cream-100"
        >
          {nombre}
        </motion.span>
      </button>

      <PanneauDemande ouvert={ouvert} onFermer={() => setOuvert(false)} />
    </>
  )
}

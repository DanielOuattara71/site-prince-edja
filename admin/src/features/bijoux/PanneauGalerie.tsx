import { useQueries } from '@tanstack/react-query'
import { ImagePlus } from 'lucide-react'
import { useState } from 'react'
import { cles } from '@/api/cles'
import { medias } from '@/api/endpoints/contenus'
import { SelecteurMedia } from '@/components/medias/SelecteurMedia'
import { ListeOrdonnable } from '@/components/listes/ListeOrdonnable'
import { Bouton } from '@/components/ui/Bouton'
import { IndicateurAFournir } from '@/components/ui/IndicateurAFournir'
import { t } from '@/i18n/fr'

/**
 * Galerie d'un bijou (§ 10.3) : images ordonnées, ajoutées depuis la médiathèque (texte
 * alternatif exigé avant validation), retirées, réordonnées au glisser-déposer ou au clavier.
 * Le CDC en attend 5 à 8 ; en deçà, la galerie est « à fournir ». Le bouton porte l'`id`
 * `galerieMediaIds` : le résumé d'erreurs y mène (D-44).
 */
export function PanneauGalerie({
  valeur,
  surChange,
  desactive,
}: {
  valeur: string[]
  surChange: (ids: string[]) => void
  desactive: boolean
}) {
  const [ouvert, setOuvert] = useState(false)
  const lus = useQueries({
    queries: valeur.map((id) => ({ queryKey: cles.media(id), queryFn: () => medias.lire(id) })),
  })
  const elements = valeur.map((id, i) => ({ id, media: lus[i]?.data }))

  return (
    <fieldset className="space-y-3">
      <legend className="text-body font-semibold text-ink-900">{t('bijou.galerie')}</legend>
      <p className="text-caption text-ink-700">
        {t('bijou.galerieAide')} ({valeur.length})
      </p>
      {elements.length > 0 ? (
        <ListeOrdonnable
          libelle={t('bijou.galerie')}
          elements={elements}
          cle={(e) => e.id}
          nom={(e) => e.media?.traductions.fr?.texteAlt || t('media.sansAlt')}
          desactivee={desactive}
          surOrdre={(nouveaux) => surChange(nouveaux.map((e) => e.id))}
          renderLigne={(e) => (
            <div className="flex flex-1 items-center gap-3">
              {e.media ? (
                <img
                  src={e.media.url}
                  alt=""
                  className="size-12 rounded-md bg-sand-200 object-cover"
                />
              ) : null}
              <span className="flex-1 text-caption text-ink-700">
                {e.media?.traductions.fr?.texteAlt || t('media.sansAlt')}
                {e.media ? <IndicateurAFournir champs={e.media.champsAFournir} /> : null}
              </span>
              {desactive ? null : (
                <Bouton
                  variante="discret"
                  onClick={() => surChange(valeur.filter((id) => id !== e.id))}
                >
                  {t('bijou.retirer')}
                </Bouton>
              )}
            </div>
          )}
        />
      ) : null}
      {desactive ? null : (
        <Bouton id="galerieMediaIds" variante="secondaire" onClick={() => setOuvert(true)}>
          <ImagePlus aria-hidden className="size-4" />
          {t('bijou.ajouterImage')}
        </Bouton>
      )}
      <SelecteurMedia
        ouverte={ouvert}
        surFermeture={() => setOuvert(false)}
        surChoix={(choisi) => {
          setOuvert(false)
          if (!valeur.includes(choisi.id)) surChange([...valeur, choisi.id])
        }}
      />
    </fieldset>
  )
}

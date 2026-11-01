import { useQuery } from '@tanstack/react-query'
import { ImagePlus } from 'lucide-react'
import { useState } from 'react'
import { cles } from '@/api/cles'
import { medias } from '@/api/endpoints/contenus'
import { SelecteurMedia } from '@/components/medias/SelecteurMedia'
import { Bouton } from '@/components/ui/Bouton'
import { MessageErreurChamp } from '@/components/ui/EnveloppeChamp'
import { IndicateurAFournir } from '@/components/ui/IndicateurAFournir'
import { t } from '@/i18n/fr'

/**
 * Image principale d'un contenu : vignette, choix dans la médiathèque (texte alternatif exigé
 * avant validation, RG-08), retrait. Le bouton porte l'`id` `imageId` : le résumé d'erreurs et
 * la liste des manques y mènent (D-44).
 */
export function PanneauImage({
  valeur,
  surChange,
  erreur,
  libelle = t('article.image'),
  id = 'imageId',
}: {
  valeur: string | null
  surChange: (id: string | null) => void
  erreur?: string | undefined
  libelle?: string
  /** Chemin du champ : le résumé d'erreurs et les manques y mènent (D-44). */
  id?: string
}) {
  const [ouvert, setOuvert] = useState(false)
  const media = useQuery({
    queryKey: cles.media(valeur ?? ''),
    queryFn: () => medias.lire(valeur ?? ''),
    enabled: Boolean(valeur),
  })

  return (
    <fieldset className="space-y-3">
      <legend className="text-body font-semibold text-ink-900">{libelle}</legend>
      {valeur && media.data ? (
        <figure className="space-y-2">
          <img
            src={media.data.url}
            alt={media.data.traductions.fr?.texteAlt ?? ''}
            className="aspect-[4/3] w-full rounded-md bg-sand-200 object-cover"
          />
          <figcaption className="space-y-1 text-caption text-ink-700">
            <span className="block">
              {media.data.traductions.fr?.texteAlt || t('media.sansAlt')}
            </span>
            <IndicateurAFournir champs={media.data.champsAFournir} />
          </figcaption>
        </figure>
      ) : null}
      <div className="flex flex-wrap gap-2">
        <Bouton id={id} variante="secondaire" onClick={() => setOuvert(true)}>
          <ImagePlus aria-hidden className="size-4" />
          {valeur ? t('article.changerImage') : t('media.choisir')}
        </Bouton>
        {valeur ? (
          <Bouton variante="discret" onClick={() => surChange(null)}>
            {t('article.retirerImage')}
          </Bouton>
        ) : null}
      </div>
      {erreur ? <MessageErreurChamp>{erreur}</MessageErreurChamp> : null}
      <SelecteurMedia
        ouverte={ouvert}
        surFermeture={() => setOuvert(false)}
        surChoix={(choisi) => {
          setOuvert(false)
          surChange(choisi.id)
        }}
      />
    </fieldset>
  )
}

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { CircleAlert, Upload } from 'lucide-react'
import { useDeferredValue, useState } from 'react'
import { cles } from '@/api/cles'
import { medias, type ParametresMedias } from '@/api/endpoints/contenus'
import type { Langue } from '@/api/schemas/communs'
import { TYPES_MEDIA_ACCEPTES, type Media } from '@/api/schemas/medias'
import { useSession } from '@/auth/contexte-session'
import { Alerte } from '@/components/ui/Alerte'
import { BoiteDialogue } from '@/components/ui/BoiteDialogue'
import { Bouton } from '@/components/ui/Bouton'
import { Case } from '@/components/ui/Case'
import { Champ } from '@/components/ui/Champ'
import { EtatErreur, EtatVide } from '@/components/ui/Etats'
import { Squelette } from '@/components/ui/Squelette'
import { ZoneTexte } from '@/components/ui/ZoneTexte'
import { t } from '@/i18n/fr'
import { cn } from '@/lib/cn'
import { messageErreur } from '@/lib/message-erreur'

/**
 * Choix d'une image dans la médiathèque (section 10) : recherche, envoi à la volée, et
 * **refus** de valider une image sans texte alternatif dans chaque langue active (RG-08),
 * sauf si elle est déclarée décorative. Le texte manquant se saisit sur place : il est
 * enregistré sur le média, pas recopié dans le contenu.
 *
 * @example
 * <SelecteurMedia ouverte={ouverte} surFermeture={() => setOuverte(false)}
 *   surChoix={(media) => setValue('imageId', media.id, { shouldDirty: true })} />
 */
const IMAGES_ACCEPTEES = TYPES_MEDIA_ACCEPTES.filter((type) => type.startsWith('image/')).join(',')

export function SelecteurMedia({
  ouverte,
  surFermeture,
  surChoix,
  titre = t('media.choisir'),
}: {
  ouverte: boolean
  surFermeture: () => void
  surChoix: (media: Media) => void
  titre?: string
}) {
  const { moi } = useSession()
  const actives: Langue[] = moi?.reglages.languesActives ?? ['fr']
  const client = useQueryClient()

  const [recherche, setRecherche] = useState('')
  const [selection, setSelection] = useState<Media | null>(null)
  const [alts, setAlts] = useState<Partial<Record<Langue, string>>>({})
  const [decoratif, setDecoratif] = useState(false)
  const [credit, setCredit] = useState('')
  const [ouverteVue, setOuverteVue] = useState(ouverte)
  // Chaque ouverture repart d'un choix vide (ajustement pendant le rendu, sans effet).
  if (ouverteVue !== ouverte) {
    setOuverteVue(ouverte)
    if (ouverte) {
      setRecherche('')
      setSelection(null)
    }
  }

  const terme = useDeferredValue(recherche.trim())
  const parametres: ParametresMedias = {
    mime: 'image',
    pageSize: 24,
    ...(terme ? { q: terme } : {}),
  }
  const liste = useQuery({
    queryKey: cles.medias(parametres),
    queryFn: () => medias.lister(parametres),
    enabled: ouverte,
  })

  const selectionner = (media: Media) => {
    setSelection(media)
    setDecoratif(media.decoratif)
    setAlts({})
    setCredit('')
  }

  const envoi = useMutation({
    mutationFn: (fichier: File) => medias.envoyer(fichier),
    onSuccess: (media) => {
      void client.invalidateQueries({ queryKey: ['medias'] })
      selectionner(media)
    },
  })

  const manquantes =
    selection && !decoratif
      ? actives.filter((langue) => !selection.traductions[langue]?.texteAlt.trim())
      : []
  const saisiesCompletes = manquantes.every((langue) => Boolean(alts[langue]?.trim()))
  // Le crédit est exigé à la publication (RG-03, RG-08), pas au choix : saisi s'il est connu,
  // jamais inventé ; vide, il restera « à fournir ».
  const creditManquant = selection !== null && !selection.credit
  const aCompleter =
    selection !== null &&
    (manquantes.length > 0 || decoratif !== selection.decoratif || Boolean(credit.trim()))

  const completion = useMutation({
    mutationFn: (media: Media) =>
      medias.modifier(media.id, {
        version: media.version,
        decoratif,
        ...(credit.trim() ? { credit: credit.trim() } : {}),
        ...(manquantes.length > 0
          ? {
              traductions: Object.fromEntries(
                manquantes.map((langue) => [
                  langue,
                  {
                    texteAlt: alts[langue]?.trim() ?? '',
                    legende: media.traductions[langue]?.legende ?? null,
                  },
                ]),
              ),
            }
          : {}),
      }),
    onSuccess: (media) => {
      client.setQueryData(cles.media(media.id), media)
      void client.invalidateQueries({ queryKey: ['medias', 'liste'] })
      surChoix(media)
    },
  })

  const valider = () => {
    if (!selection) return
    if (aCompleter) completion.mutate(selection)
    else surChoix(selection)
  }

  return (
    <BoiteDialogue
      ouverte={ouverte}
      surFermeture={surFermeture}
      titre={titre}
      taille="large"
      actions={
        <>
          <Bouton variante="secondaire" onClick={surFermeture}>
            {t('confirmation.annuler')}
          </Bouton>
          <Bouton
            onClick={valider}
            disabled={!selection || !saisiesCompletes || completion.isPending}
          >
            {completion.isPending
              ? t('confirmation.enCours')
              : aCompleter
                ? t('media.enregistrerEtChoisir')
                : t('media.choisirCe')}
          </Bouton>
        </>
      }
    >
      <div className="flex flex-wrap items-end gap-3">
        <Champ
          type="search"
          libelle={t('media.rechercher')}
          value={recherche}
          onChange={(evenement) => setRecherche(evenement.target.value)}
          className="min-w-60 flex-1"
        />
        <label className="inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-md border border-ink-500 bg-sand-50 px-4 text-button font-semibold text-ink-900 hover:bg-sand-100 has-focus-visible:outline-2 has-focus-visible:outline-offset-3 has-focus-visible:outline-clay-600">
          <Upload aria-hidden className="size-4" />
          {envoi.isPending ? t('media.envoiEnCours') : t('media.envoyer')}
          <input
            type="file"
            accept={IMAGES_ACCEPTEES}
            className="sr-only"
            disabled={envoi.isPending}
            onChange={(evenement) => {
              const fichier = evenement.target.files?.[0]
              if (fichier) envoi.mutate(fichier)
              evenement.target.value = ''
            }}
          />
        </label>
      </div>
      {envoi.isError ? <Alerte ton="erreur">{messageErreur(envoi.error)}</Alerte> : null}

      {liste.isPending ? (
        <Squelette />
      ) : liste.isError ? (
        <EtatErreur erreur={liste.error} surReessai={() => void liste.refetch()} />
      ) : liste.data.items.length === 0 ? (
        <EtatVide titre={terme ? t('media.aucunResultat') : t('media.aucun')} />
      ) : (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {liste.data.items.map((media) => {
            const alt = media.traductions.fr?.texteAlt
            const choisi = selection?.id === media.id
            return (
              <li key={media.id}>
                <button
                  type="button"
                  aria-pressed={choisi}
                  onClick={() => selectionner(media)}
                  className={cn(
                    'flex h-full w-full flex-col gap-1 rounded-md border-2 p-1.5 text-left hover:bg-sand-100',
                    choisi ? 'border-clay-600 bg-sand-100' : 'border-transparent',
                  )}
                >
                  <img
                    src={media.url}
                    alt=""
                    loading="lazy"
                    className="aspect-[4/3] w-full rounded-md bg-sand-200 object-cover"
                  />
                  <span className="line-clamp-2 text-caption text-ink-900">
                    {alt ?? (
                      <span className="inline-flex items-center gap-1 font-semibold text-clay-700">
                        <CircleAlert aria-hidden className="size-3.5" />
                        {t('media.sansAlt')}
                      </span>
                    )}
                  </span>
                </button>
              </li>
            )
          })}
        </ul>
      )}

      {selection && (manquantes.length > 0 || decoratif || creditManquant) ? (
        <fieldset className="space-y-3 rounded-md border border-dashed border-clay-600 p-4">
          <legend className="px-1 text-body font-semibold text-ink-900">
            {t('media.aCompleter')}
          </legend>
          <Case
            libelle={t('media.decoratif')}
            aide={t('media.decoratifAide')}
            checked={decoratif}
            onChange={(evenement) => setDecoratif(evenement.target.checked)}
          />
          {manquantes.map((langue) => (
            <ZoneTexte
              key={langue}
              libelle={`${t('media.texteAlt')} (${langue.toUpperCase()})`}
              aide={t('media.texteAltAide')}
              required
              rows={2}
              maxLength={300}
              value={alts[langue] ?? ''}
              onChange={(evenement) => setAlts({ ...alts, [langue]: evenement.target.value })}
            />
          ))}
          {creditManquant ? (
            <Champ
              libelle={t('media.credit')}
              aide={t('media.creditAide')}
              maxLength={200}
              value={credit}
              onChange={(evenement) => setCredit(evenement.target.value)}
            />
          ) : null}
          {completion.isError ? (
            <Alerte ton="erreur">{messageErreur(completion.error)}</Alerte>
          ) : null}
        </fieldset>
      ) : null}
    </BoiteDialogue>
  )
}

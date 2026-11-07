import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ImageOff, Plus } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router'
import { galerie } from '@/api/endpoints/editorial'
import { emplacementsPhotos } from '@/api/endpoints/emplacements'
import { EMPLACEMENTS_GALERIE } from '@/api/schemas/editorial'
import type { EmplacementPhoto } from '@/api/schemas/emplacements'
import { useSession } from '@/auth/contexte-session'
import { peut } from '@/auth/permissions'
import { FilAriane } from '@/components/layout/FilAriane'
import { TitrePage } from '@/components/layout/TitrePage'
import { ListeOrdonnable } from '@/components/listes/ListeOrdonnable'
import { SelecteurMedia } from '@/components/medias/SelecteurMedia'
import { useNotifications } from '@/components/retours/contexte-notifications'
import { Bouton } from '@/components/ui/Bouton'
import { CLASSES_LIEN } from '@/components/ui/classes'
import { EtatErreur, EtatVide } from '@/components/ui/Etats'
import { Squelette } from '@/components/ui/Squelette'
import { t, type CleTraduction } from '@/i18n/fr'
import { formaterDateHeure } from '@/lib/dates'
import { messageErreur } from '@/lib/message-erreur'

/**
 * Médiathèque › Sur le site (ECRANS § 5.2) : trois blocs. Les **photos fixes** (une place unique
 * du site, on ne la crée pas ici), puis les **galeries** de l'accueil et de la boutique,
 * ordonnables au glisser-déposer ou au clavier. Les photos des produits, articles et projets
 * restent dans leur propre fiche.
 */
export default function SurLeSite() {
  const { moi } = useSession()
  const lirePhotos = peut(moi?.compte, 'lire', 'emplacements-photos')
  return (
    <section className="space-y-10">
      <div>
        <FilAriane
          elements={[
            { libelle: t('menu.medias'), chemin: '/medias' },
            { libelle: t('menu.surLeSite') },
          ]}
        />
        <TitrePage titre={t('surLeSite.titre')}>{t('surLeSite.titre')}</TitrePage>
        <p className="mt-2 max-w-3xl text-body text-ink-700">{t('surLeSite.intro')}</p>
      </div>
      {lirePhotos ? <PhotosFixes /> : null}
      {EMPLACEMENTS_GALERIE.map((emplacement) => (
        <BlocGalerie key={emplacement} emplacement={emplacement} />
      ))}
    </section>
  )
}

function PhotosFixes() {
  const { moi } = useSession()
  const client = useQueryClient()
  const notifier = useNotifications()
  const modifiable = peut(moi?.compte, 'modifier', 'emplacements-photos')
  const [cible, setCible] = useState<EmplacementPhoto | null>(null)
  const liste = useQuery({
    queryKey: ['emplacements-photos'],
    queryFn: ({ signal }) => emplacementsPhotos.lister(signal),
  })
  const changer = useMutation({
    mutationFn: ({ cle, mediaId }: { cle: string; mediaId: string }) =>
      emplacementsPhotos.changer(cle, mediaId),
    onSuccess: () => notifier.succes(t('surLeSite.photoChangee')),
    onError: (erreur) => notifier.erreur(messageErreur(erreur)),
    onSettled: () => client.invalidateQueries({ queryKey: ['emplacements-photos'] }),
  })

  return (
    <section aria-labelledby="photos-fixes" className="space-y-4">
      <div>
        <h2 id="photos-fixes" className="font-display text-heading-sm uppercase text-ink-900">
          {t('surLeSite.photosFixes')}
        </h2>
        <p className="text-body text-ink-700">{t('surLeSite.photosFixesAide')}</p>
      </div>
      {liste.isPending ? (
        <Squelette lignes={4} />
      ) : liste.isError ? (
        <EtatErreur erreur={liste.error} surReessai={() => void liste.refetch()} />
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {liste.data.items.map((e) => (
            <li key={e.cle} className="flex gap-4 rounded-xl border border-sand-200 bg-sand-50 p-4">
              {e.media ? (
                <img
                  src={e.media.url}
                  alt={e.media.texteAlt}
                  className="size-24 shrink-0 rounded-md bg-sand-200 object-cover"
                />
              ) : (
                <span className="flex size-24 shrink-0 flex-col items-center justify-center gap-1 rounded-md border border-dashed border-sand-300 text-caption text-ink-700">
                  <ImageOff aria-hidden className="size-5" />
                  {t('surLeSite.aucunePhoto')}
                </span>
              )}
              <div className="min-w-0 flex-1 space-y-1">
                <p className="font-semibold text-ink-900">{e.libelle}</p>
                <p className="text-caption text-ink-700">
                  <span className="sr-only">{t('surLeSite.cle')} : </span>
                  <code>{e.cle}</code>
                </p>
                <p className="text-caption text-ink-700">
                  {t('surLeSite.format')} : {e.formatConseille ?? t('surLeSite.aPreciser')}
                </p>
                <p className="text-caption text-ink-700">
                  {e.misAJourLe
                    ? `${t('surLeSite.misAJour')} ${formaterDateHeure(e.misAJourLe)}`
                    : t('surLeSite.jamais')}
                </p>
                {modifiable ? (
                  <Bouton
                    variante="secondaire"
                    aria-label={`${t('surLeSite.changer')} — ${e.libelle}`}
                    disabled={changer.isPending}
                    onClick={() => setCible(e)}
                  >
                    {t('surLeSite.changer')}
                  </Bouton>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      )}
      <SelecteurMedia
        ouverte={cible !== null}
        {...(cible ? { titre: `${t('surLeSite.changer')} — ${cible.libelle}` } : {})}
        surFermeture={() => setCible(null)}
        surChoix={(media) => {
          if (cible) changer.mutate({ cle: cible.cle, mediaId: media.id })
          setCible(null)
        }}
      />
    </section>
  )
}

function BlocGalerie({ emplacement }: { emplacement: (typeof EMPLACEMENTS_GALERIE)[number] }) {
  const { moi } = useSession()
  const client = useQueryClient()
  const notifier = useNotifications()
  const ordonnable = peut(moi?.compte, 'ordonner', 'galerie')
  const creer = peut(moi?.compte, 'creer', 'galerie')
  const cle = ['galerie', 'liste', 'sur-le-site', emplacement]
  const liste = useQuery({
    queryKey: cle,
    queryFn: () => galerie.lister({ pageSize: 100, tri: 'ordre' }, undefined, { emplacement }),
  })
  const ordonner = useMutation({
    mutationFn: (ids: string[]) => galerie.ordonner(ids),
    onSuccess: () => notifier.succes(t('ordre.enregistre')),
    onError: (erreur) => notifier.erreur(messageErreur(erreur)),
    onSettled: () => client.invalidateQueries({ queryKey: ['galerie'] }),
  })
  const titre = t(`surLeSite.galerie.${emplacement}` as CleTraduction)
  const id = `galerie-${emplacement}`

  return (
    <section aria-labelledby={id} className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 id={id} className="font-display text-heading-sm uppercase text-ink-900">
            {titre}
          </h2>
          <p className="text-body text-ink-700">{t('surLeSite.galerieAide')}</p>
        </div>
        {creer ? (
          <Link
            to={`/galerie/nouveau?emplacement=${emplacement}`}
            aria-label={`${t('surLeSite.ajouterPhoto')} — ${titre}`}
            className="inline-flex min-h-11 items-center gap-2 rounded-md border border-sand-300 px-4 text-button font-semibold text-ink-900 hover:bg-sand-100"
          >
            <Plus aria-hidden className="size-4" />
            {t('surLeSite.ajouterPhoto')}
          </Link>
        ) : null}
      </div>
      {liste.isPending ? (
        <Squelette lignes={3} />
      ) : liste.isError ? (
        <EtatErreur erreur={liste.error} surReessai={() => void liste.refetch()} />
      ) : liste.data.items.length === 0 ? (
        <EtatVide titre={t('surLeSite.galerieVide')} />
      ) : (
        <ListeOrdonnable
          libelle={`${t('ordre.titre')} — ${titre}`}
          elements={liste.data.items}
          cle={(o) => o.id}
          nom={(o) => o.titre || t('declaratif.sansTitre')}
          desactivee={!ordonnable || ordonner.isPending}
          surOrdre={(nouveaux) => {
            client.setQueryData(cle, (page: typeof liste.data) =>
              page ? { ...page, items: nouveaux } : page,
            )
            ordonner.mutate(nouveaux.map((o) => o.id))
          }}
          renderLigne={(o) => (
            <Link to={`/galerie/${o.id}`} className={CLASSES_LIEN}>
              {o.titre || t('declaratif.sansTitre')}
            </Link>
          )}
        />
      )}
    </section>
  )
}

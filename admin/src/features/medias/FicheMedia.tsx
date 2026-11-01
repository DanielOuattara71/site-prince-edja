import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { FileText } from 'lucide-react'
import { useState } from 'react'
import { useNavigate, useParams } from 'react-router'
import { Introuvable } from '@/app/pages-erreur'
import { cles } from '@/api/cles'
import { medias } from '@/api/endpoints/contenus'
import { aLeCode, estErreurApi, usagesDe } from '@/api/erreurs'
import type { Langue } from '@/api/schemas/communs'
import type { Media } from '@/api/schemas/medias'
import { useSession } from '@/auth/contexte-session'
import { peut } from '@/auth/permissions'
import { AvertissementSortie } from '@/components/formulaire/AvertissementSortie'
import { ChampTraduit } from '@/components/formulaire/ChampTraduit'
import { FilAriane } from '@/components/layout/FilAriane'
import { TitrePage } from '@/components/layout/TitrePage'
import { PanneauUsages } from '@/components/medias/PanneauUsages'
import { useNotifications } from '@/components/retours/contexte-notifications'
import { Bouton } from '@/components/ui/Bouton'
import { Case } from '@/components/ui/Case'
import { Champ } from '@/components/ui/Champ'
import { Confirmation } from '@/components/ui/Confirmation'
import { EtatErreur } from '@/components/ui/Etats'
import { IndicateurAFournir } from '@/components/ui/IndicateurAFournir'
import { Squelette } from '@/components/ui/Squelette'
import { t } from '@/i18n/fr'
import { formaterDateHeure } from '@/lib/dates'
import { messageErreur } from '@/lib/message-erreur'

/**
 * Fiche d'un média (section 9) : texte alternatif et légende en FR et EN, crédit, image
 * décorative, déclinaisons, usages. La suppression d'un média utilisé est refusée (RG-08) et
 * remplacée par la liste de ses usages ; le fichier ne se remplace pas (on envoie un nouveau
 * média, contrat § 11.2). Le recadrage n'existe pas dans cette version (contrat § 11.3).
 */
export default function FicheMedia() {
  const { id = '' } = useParams()
  const requete = useQuery({ queryKey: cles.media(id), queryFn: () => medias.lire(id) })
  if (requete.isPending) return <Squelette lignes={6} />
  if (requete.isError) {
    if (estErreurApi(requete.error) && requete.error.status === 404) return <Introuvable />
    return <EtatErreur erreur={requete.error} surReessai={() => void requete.refetch()} />
  }
  return <Fiche key={`${requete.data.id}-${requete.data.version}`} media={requete.data} />
}

interface Saisie {
  texteAlt: Record<Langue, string>
  legende: Record<Langue, string>
  credit: string
  decoratif: boolean
}

const depuis = (media: Media): Saisie => ({
  texteAlt: { fr: media.traductions.fr?.texteAlt ?? '', en: media.traductions.en?.texteAlt ?? '' },
  legende: { fr: media.traductions.fr?.legende ?? '', en: media.traductions.en?.legende ?? '' },
  credit: media.credit ?? '',
  decoratif: media.decoratif,
})

const LIBELLES = { texteAlt: 'Texte alternatif', credit: 'Crédit' }

function Fiche({ media }: { media: Media }) {
  const { moi } = useSession()
  const client = useQueryClient()
  const navigate = useNavigate()
  const notifier = useNotifications()
  const [saisie, setSaisie] = useState<Saisie>(() => depuis(media))
  const [confirmer, setConfirmer] = useState(false)
  const modifie = JSON.stringify(saisie) !== JSON.stringify(depuis(media))
  const titre = media.traductions.fr?.texteAlt || t('media.sansAlt')
  const usages = useQuery({
    queryKey: cles.usagesMedia(media.id),
    queryFn: () => medias.usages(media.id),
  })

  const enregistrement = useMutation({
    mutationFn: () =>
      medias.modifier(media.id, {
        version: media.version,
        decoratif: saisie.decoratif,
        credit: saisie.credit.trim() || null,
        traductions: Object.fromEntries(
          (['fr', 'en'] as const).map((langue) => [
            langue,
            saisie.texteAlt[langue].trim() || saisie.legende[langue].trim()
              ? {
                  texteAlt: saisie.texteAlt[langue].trim(),
                  legende: saisie.legende[langue].trim() || null,
                }
              : null,
          ]),
        ),
      }),
    onSuccess: (suivant) => {
      client.setQueryData(cles.media(suivant.id), suivant)
      void client.invalidateQueries({ queryKey: ['medias', 'liste'] })
      notifier.succes(t('formulaire.enregistre'))
    },
    onError: (erreur) => {
      notifier.erreur(
        aLeCode(erreur, 'VERSION_PERIMEE') ? t('formulaire.versionPerimee') : messageErreur(erreur),
        estErreurApi(erreur) ? erreur.requeteId : undefined,
      )
    },
  })

  const suppression = useMutation({
    mutationFn: () => medias.supprimer(media.id, media.version),
    onSuccess: () => {
      setConfirmer(false)
      void client.invalidateQueries({ queryKey: ['medias'] })
      notifier.succes(t('mediatheque.supprime'))
      void navigate('/medias', { replace: true })
    },
    onError: (erreur) => {
      setConfirmer(false)
      if (aLeCode(erreur, 'RG-08'))
        client.setQueryData(cles.usagesMedia(media.id), usagesDe(erreur))
      notifier.erreur(messageErreur(erreur))
    },
  })

  const modifiable = peut(moi?.compte, 'modifier', 'medias')
  const image = media.mime.startsWith('image/')

  return (
    <section className="space-y-6">
      <div>
        <FilAriane
          elements={[{ libelle: t('menu.medias'), chemin: '/medias' }, { libelle: titre }]}
        />
        <TitrePage titre={titre}>{titre}</TitrePage>
      </div>
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <form
          className="min-w-0 space-y-6"
          onSubmit={(evenement) => {
            evenement.preventDefault()
            enregistrement.mutate()
          }}
        >
          <fieldset disabled={!modifiable} className="space-y-6">
            <legend className="sr-only">{t('mediatheque.description')}</legend>
            <Case
              libelle={t('media.decoratif')}
              aide={t('media.decoratifAide')}
              checked={saisie.decoratif}
              onChange={(evenement) =>
                setSaisie({ ...saisie, decoratif: evenement.target.checked })
              }
            />
            <ChampTraduit
              nom="texteAlt"
              libelle={t('media.texteAlt')}
              aide={t('media.texteAltAide')}
              multiligne
              maxLength={300}
              requis={!saisie.decoratif}
              valeurs={saisie.texteAlt}
              surChange={(langue, valeur) =>
                setSaisie({ ...saisie, texteAlt: { ...saisie.texteAlt, [langue]: valeur } })
              }
            />
            <ChampTraduit
              nom="legende"
              libelle={t('mediatheque.legende')}
              multiligne
              maxLength={500}
              valeurs={saisie.legende}
              surChange={(langue, valeur) =>
                setSaisie({ ...saisie, legende: { ...saisie.legende, [langue]: valeur } })
              }
            />
            <Champ
              libelle={t('mediatheque.credit')}
              aide={t('media.creditAide')}
              maxLength={200}
              value={saisie.credit}
              onChange={(evenement) => setSaisie({ ...saisie, credit: evenement.target.value })}
            />
          </fieldset>
          {modifiable ? (
            <div className="flex flex-wrap gap-2">
              <Bouton type="submit" disabled={!modifie || enregistrement.isPending}>
                {enregistrement.isPending
                  ? t('barre.enregistrementEnCours')
                  : t('barre.enregistrer')}
              </Bouton>
              {modifie ? (
                <Bouton variante="discret" onClick={() => setSaisie(depuis(media))}>
                  {t('mediatheque.annulerModifications')}
                </Bouton>
              ) : null}
            </div>
          ) : null}
        </form>

        <aside className="space-y-5">
          {image ? (
            <img
              src={media.url}
              alt={media.decoratif ? '' : (media.traductions.fr?.texteAlt ?? '')}
              className="w-full rounded-md bg-sand-200"
            />
          ) : (
            <a
              href={media.url}
              className="flex items-center gap-2 font-semibold text-clay-700 underline underline-offset-4"
            >
              <FileText aria-hidden className="size-5" />
              {t('mediatheque.ouvrirPdf')}
            </a>
          )}
          <IndicateurAFournir champs={media.champsAFournir} libelles={LIBELLES} detail />
          <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-caption">
            <dt className="text-ink-700">{t('mediatheque.format')}</dt>
            <dd className="text-ink-900">{media.mime}</dd>
            {media.largeur && media.hauteur ? (
              <>
                <dt className="text-ink-700">{t('mediatheque.dimensions')}</dt>
                <dd className="tnum text-ink-900">
                  {media.largeur} × {media.hauteur} px
                </dd>
              </>
            ) : null}
            <dt className="text-ink-700">{t('mediatheque.poids')}</dt>
            <dd className="tnum text-ink-900">{Math.round(media.poids / 1024)} Ko</dd>
            <dt className="text-ink-700">{t('mediatheque.declinaisons')}</dt>
            <dd className="tnum text-ink-900">
              {media.declinaisons.length > 0
                ? media.declinaisons.map((d) => `${d.largeur} px`).join(', ')
                : '—'}
            </dd>
            <dt className="text-ink-700">{t('mediatheque.envoye')}</dt>
            <dd className="text-ink-900">
              {formaterDateHeure(media.creeLe)}
              {media.creePar ? ` · ${media.creePar.nom}` : ''}
            </dd>
          </dl>
          {usages.data ? (
            <PanneauUsages objet={t('mediatheque.ceMedia')} usages={usages.data} />
          ) : null}
          {peut(moi?.compte, 'supprimer', 'medias') ? (
            <Bouton variante="danger" onClick={() => setConfirmer(true)}>
              {t('liste.supprimer')}
            </Bouton>
          ) : null}
        </aside>
      </div>
      <AvertissementSortie actif={modifie && !enregistrement.isPending} />
      <Confirmation
        ouverte={confirmer}
        titre={t('mediatheque.supprimerTitre')}
        objet={titre}
        consequence={t('mediatheque.supprimerTexte')}
        libelleConfirmer={t('liste.supprimer')}
        danger
        enCours={suppression.isPending}
        surConfirmer={() => suppression.mutate()}
        surAnnuler={() => setConfirmer(false)}
      />
    </section>
  )
}

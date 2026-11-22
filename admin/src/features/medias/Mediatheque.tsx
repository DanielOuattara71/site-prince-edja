import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { CircleAlert, FileText, Search, Upload } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { Link, useSearchParams } from 'react-router'
import { medias, type ParametresMedias } from '@/api/endpoints/contenus'
import { TYPES_MEDIA_ACCEPTES, type Media, type EnvoiMedia } from '@/api/schemas/medias'
import { useSession } from '@/auth/contexte-session'
import { peut } from '@/auth/permissions'
import { FiltreCreateur } from '@/components/createurs/SelecteurCreateur'
import { FilAriane } from '@/components/layout/FilAriane'
import { TitrePage } from '@/components/layout/TitrePage'
import { useNotifications } from '@/components/retours/contexte-notifications'
import { Bouton } from '@/components/ui/Bouton'
import { Case } from '@/components/ui/Case'
import { Champ } from '@/components/ui/Champ'
import { EtatErreur, EtatVide } from '@/components/ui/Etats'
import { IndicateurAFournir } from '@/components/ui/IndicateurAFournir'
import { Select } from '@/components/ui/Select'
import { BoiteDialogue } from '@/components/ui/BoiteDialogue'
import { Squelette } from '@/components/ui/Squelette'
import { t } from '@/i18n/fr'
import { cn } from '@/lib/cn'
import { messageErreur } from '@/lib/message-erreur'

/**
 * Médiathèque (section 9) : grille, recherche, filtres (type, « à fournir », non utilisés,
 * créateur en multi-vendeurs), envoi multiple. Un fichier par requête (contrat § 11.2) : l'envoi
 * multiple enchaîne les appels et rend compte fichier par fichier. Un média envoyé sans texte
 * alternatif ni crédit est accepté mais reste « à fournir » (E-05).
 */
// Grille de 40 (ECRANS § 5.1).
const PAGE = 40

interface Envoi {
  nom: string
  etat: 'en_cours' | 'reussi' | 'refuse'
  message?: string
}

export default function Mediatheque() {
  const { moi } = useSession()
  const client = useQueryClient()
  const [adresse, setAdresse] = useSearchParams()
  const [recherche, setRecherche] = useState(adresse.get('q') ?? '')
  const [emplacement, setEmplacement] = useState(adresse.get('emplacement') ?? '')
  const [fichiersEnAttente, setFichiersEnAttente] = useState<File[] | null>(null)
  const [emplacementEnvoi, setEmplacementEnvoi] = useState('')
  const [envois, setEnvois] = useState<Envoi[]>([])

  const page = Number(adresse.get('page') ?? '1') || 1
  const type = adresse.get('mime')
  const parametres: ParametresMedias = {
    page,
    pageSize: PAGE,
    ...(adresse.get('q') ? { q: adresse.get('q') ?? '' } : {}),
    ...(adresse.get('emplacement') ? { emplacement: adresse.get('emplacement') ?? '' } : {}),
    ...(type === 'image' || type === 'pdf' ? { mime: type } : {}),
    ...(adresse.get('aFournir') === 'true' ? { aFournir: true } : {}),
    ...(adresse.get('nonUtilise') === 'true' ? { nonUtilise: true } : {}),
    ...(adresse.get('createur') ? { createur: adresse.get('createur') ?? '' } : {}),
  }
  const liste = useQuery({
    queryKey: ['medias', 'liste', parametres],
    queryFn: () => medias.lister(parametres),
    placeholderData: (precedent) => precedent,
  })

  const regler = (cle: string, valeur: string | null) => {
    const suivante = new URLSearchParams(adresse)
    if (valeur) suivante.set(cle, valeur)
    else suivante.delete(cle)
    if (cle !== 'page') suivante.delete('page')
    setAdresse(suivante, { replace: true })
  }

  const chercher = (evenement: FormEvent) => {
    evenement.preventDefault()
    regler('q', recherche.trim() || null)
  }

  const chercherEmplacement = (evenement: FormEvent) => {
    evenement.preventDefault()
    regler('emplacement', emplacement.trim() || null)
  }

  /** Envoi multiple : un appel par fichier, dans l'ordre, chacun avec son résultat. */
  const envoyer = async (fichiers: File[], champs: EnvoiMedia) => {
    setEnvois(fichiers.map((fichier) => ({ nom: fichier.name, etat: 'en_cours' })))
    for (const [index, fichier] of fichiers.entries()) {
      let resultat: Envoi
      try {
        await medias.envoyer(fichier, champs)
        resultat = { nom: fichier.name, etat: 'reussi' }
      } catch (erreur) {
        resultat = { nom: fichier.name, etat: 'refuse', message: messageErreur(erreur) }
      }
      setEnvois((actuels) => actuels.map((envoi, i) => (i === index ? resultat : envoi)))
    }
    await client.invalidateQueries({ queryKey: ['medias'] })
  }

  /** L'emplacement est facultatif (contrat 1.21.0 § 38) : absent = « non précisé ». */
  const validerEnvoi = async () => {
    const fichiers = fichiersEnAttente ?? []
    setFichiersEnAttente(null)
    await envoyer(fichiers, { emplacement: emplacementEnvoi.trim() || null })
  }

  const total = liste.data?.total ?? 0
  const pages = Math.max(1, Math.ceil(total / PAGE))
  const filtresActifs = ['q', 'emplacement', 'mime', 'aFournir', 'nonUtilise', 'createur'].some(
    (cle) => adresse.has(cle),
  )

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <FilAriane elements={[{ libelle: t('menu.medias') }]} />
          <TitrePage titre={t('menu.medias')}>{t('menu.medias')}</TitrePage>
        </div>
        {peut(moi?.compte, 'creer', 'medias') ? (
          <label className="inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-md bg-clay-600 px-4 text-button font-semibold text-cream-100 hover:bg-clay-700 has-focus-visible:outline-2 has-focus-visible:outline-offset-3 has-focus-visible:outline-clay-600">
            <Upload aria-hidden className="size-4" />
            {t('mediatheque.envoyer')}
            <input
              type="file"
              multiple
              accept={TYPES_MEDIA_ACCEPTES.join(',')}
              className="sr-only"
              onChange={(evenement) => {
                const fichiers = [...(evenement.target.files ?? [])]
                evenement.target.value = ''
                if (fichiers.length > 0) {
                  setEmplacementEnvoi('')
                  setFichiersEnAttente(fichiers)
                }
              }}
            />
          </label>
        ) : null}
      </div>

      {envois.length > 0 ? (
        <section
          aria-label={t('mediatheque.envois')}
          className="space-y-2 rounded-md border border-sand-200 bg-sand-100 p-4"
        >
          <h2 className="label-caps text-ink-700">{t('mediatheque.envois')}</h2>
          <ul aria-live="polite" className="space-y-1 text-body">
            {envois.map((envoi, index) => (
              <li key={`${envoi.nom}-${index}`} className="flex flex-wrap gap-2">
                <span className="font-semibold">{envoi.nom}</span>
                <span className={envoi.etat === 'refuse' ? 'text-clay-700' : 'text-ink-700'}>
                  {envoi.etat === 'en_cours'
                    ? t('mediatheque.envoiEnCours')
                    : envoi.etat === 'reussi'
                      ? t('mediatheque.envoiReussi')
                      : `${t('mediatheque.envoiRefuse')} ${envoi.message ?? ''}`}
                </span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {fichiersEnAttente ? (
        <BoiteDialogue
          ouverte
          surFermeture={() => setFichiersEnAttente(null)}
          titre={`${t('mediatheque.envoyer')} (${fichiersEnAttente.length})`}
          actions={
            <>
              <Bouton variante="secondaire" onClick={() => setFichiersEnAttente(null)}>
                {t('confirmation.annuler')}
              </Bouton>
              <Bouton type="submit" form="formulaire-envoi">
                {t('mediatheque.envoyer')}
              </Bouton>
            </>
          }
        >
          <form
            id="formulaire-envoi"
            noValidate
            className="space-y-4"
            onSubmit={(evenement) => {
              evenement.preventDefault()
              void validerEnvoi()
            }}
          >
            <p className="text-body text-ink-700">
              <span className="font-semibold text-ink-900">
                {fichiersEnAttente.map((f) => f.name).join(', ')}
              </span>
            </p>
            <Champ
              libelle={`${t('media.emplacement')} (${t('media.emplacementFacultatif')})`}
              aide={t('mediatheque.emplacementAide')}
              value={emplacementEnvoi}
              maxLength={120}
              list="emplacements-suggerees"
              onChange={(evenement) => setEmplacementEnvoi(evenement.target.value)}
            />
            <datalist id="emplacements-suggerees">
              {t('mediatheque.suggestionsEmplacement')
                .split(', ')
                .map((suggestion) => (
                  <option key={suggestion} value={suggestion}>
                    {suggestion}
                  </option>
                ))}
            </datalist>
          </form>
        </BoiteDialogue>
      ) : null}

      <div className="flex flex-wrap items-end gap-3 rounded-md border border-sand-200 bg-sand-100 p-4">
        <search className="flex min-w-64 flex-1 items-end gap-2">
          <form onSubmit={chercher} className="flex flex-1 items-end gap-2">
            <Champ
              type="search"
              libelle={t('media.rechercher')}
              value={recherche}
              onChange={(evenement) => setRecherche(evenement.target.value)}
              className="flex-1"
            />
            <Bouton type="submit" variante="secondaire">
              <Search aria-hidden className="size-4" />
              <span className="sr-only sm:not-sr-only">{t('liste.chercher')}</span>
            </Bouton>
          </form>
        </search>
        <form onSubmit={chercherEmplacement} className="flex min-w-48 items-end gap-2">
          <Champ
            type="search"
            libelle={t('mediatheque.filtrerEmplacement')}
            placeholder={t('mediatheque.filtrerEmplacement')}
            value={emplacement}
            onChange={(evenement) => setEmplacement(evenement.target.value)}
            className="flex-1"
          />
          <Bouton type="submit" variante="secondaire" aria-label={t('liste.chercher')}>
            <Search aria-hidden className="size-4" />
          </Bouton>
        </form>
        <Select
          libelle={t('mediatheque.type')}
          value={type ?? ''}
          onChange={(evenement) => regler('mime', evenement.target.value || null)}
          options={[
            { valeur: '', libelle: t('liste.tous') },
            { valeur: 'image', libelle: t('mediatheque.images') },
            { valeur: 'pdf', libelle: t('mediatheque.pdf') },
          ]}
        />
        <FiltreCreateur
          valeur={adresse.get('createur') ?? undefined}
          surChange={(id) => regler('createur', id ?? null)}
        />
        <Case
          libelle={t('liste.aFournirSeulement')}
          checked={adresse.get('aFournir') === 'true'}
          onChange={(evenement) => regler('aFournir', evenement.target.checked ? 'true' : null)}
        />
        <Case
          libelle={t('mediatheque.nonUtilises')}
          checked={adresse.get('nonUtilise') === 'true'}
          onChange={(evenement) => regler('nonUtilise', evenement.target.checked ? 'true' : null)}
        />
      </div>

      {liste.isPending ? (
        <Squelette lignes={6} />
      ) : liste.isError ? (
        <EtatErreur erreur={liste.error} surReessai={() => void liste.refetch()} />
      ) : liste.data.items.length === 0 ? (
        <EtatVide titre={filtresActifs ? t('liste.aucunResultat') : t('media.aucun')} />
      ) : (
        <>
          <p className="text-caption text-ink-700" aria-live="polite">
            {total} {total > 1 ? t('mediatheque.medias') : t('mediatheque.media')}
          </p>
          <ul
            aria-label={t('menu.medias')}
            className="grid grid-cols-1 gap-4 min-[420px]:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5"
          >
            {liste.data.items.map((media) => {
              const alt = media.traductions.fr?.texteAlt
              const image = media.mime.startsWith('image/')
              return (
                <li
                  key={media.id}
                  className="flex flex-col gap-2 rounded-md border border-sand-200 bg-sand-50 p-2"
                >
                  <Link to={`/medias/${media.id}`} className="group flex flex-col gap-2">
                    {image ? (
                      <img
                        src={media.declinaisons[0]?.url ?? media.url}
                        alt=""
                        loading="lazy"
                        className="aspect-[4/3] w-full rounded-md bg-sand-200 object-cover"
                      />
                    ) : (
                      <span className="flex aspect-[4/3] w-full items-center justify-center rounded-md bg-sand-200">
                        <FileText aria-hidden className="size-10 text-ink-700" />
                      </span>
                    )}
                    <span
                      className={cn(
                        'line-clamp-2 text-caption group-hover:underline',
                        alt ? 'text-ink-900' : 'text-clay-700',
                      )}
                    >
                      {alt || (
                        <span className="inline-flex items-center gap-1">
                          <CircleAlert aria-hidden className="size-4" />
                          {t('media.sansAlt')}
                        </span>
                      )}
                    </span>
                  </Link>
                  {image && !alt && !media.decoratif && peut(moi?.compte, 'modifier', 'medias') ? (
                    <AltEnLigne media={media} />
                  ) : null}
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-caption leading-5 text-ink-700">
                    <IndicateurAFournir champs={media.champsAFournir} />
                    <span className="tnum">
                      {media.usages > 0
                        ? `${t('mediatheque.utiliseA')} ${media.usages} ${t('mediatheque.usages')}`
                        : t('mediatheque.nonUtilise')}
                    </span>
                    <span className="min-w-0 truncate">
                      {media.emplacement ? (
                        <>
                          <span className="font-semibold text-ink-900">{`${t('media.emplacement')} : `}</span>
                          {media.emplacement}
                        </>
                      ) : (
                        <span className="italic">{t('mediatheque.nonPrecise')}</span>
                      )}
                    </span>
                  </div>
                </li>
              )
            })}
          </ul>
          {pages > 1 ? (
            <nav
              aria-label={`${t('tableau.pagination')} : ${t('menu.medias')}`}
              className="flex items-center justify-between gap-2"
            >
              <Bouton
                variante="secondaire"
                disabled={page <= 1}
                onClick={() => regler('page', String(page - 1))}
              >
                {t('tableau.precedente')}
              </Bouton>
              <span className="tnum text-caption">
                {t('tableau.page')} {page} / {pages}
              </span>
              <Bouton
                variante="secondaire"
                disabled={page >= pages}
                onClick={() => regler('page', String(page + 1))}
              >
                {t('tableau.suivante')}
              </Bouton>
            </nav>
          ) : null}
        </>
      )}
    </section>
  )
}

/**
 * Texte alternatif saisi dans la grille (U9) : sans ouvrir la fiche, pour une image qui n'en a pas.
 * La légende existante est gardée telle quelle.
 */
function AltEnLigne({ media }: { media: Media }) {
  const client = useQueryClient()
  const notifier = useNotifications()
  const [texte, setTexte] = useState('')
  const enregistrer = useMutation({
    mutationFn: () =>
      medias.modifier(media.id, {
        traductions: {
          fr: { texteAlt: texte.trim(), legende: media.traductions.fr?.legende ?? null },
        },
        version: media.version,
      }),
    onSuccess: () => {
      notifier.succes(t('formulaire.enregistre'))
      void client.invalidateQueries({ queryKey: ['medias'] })
    },
    onError: (erreur) => notifier.erreur(messageErreur(erreur)),
  })
  return (
    <form
      noValidate
      className="flex items-end gap-2"
      onSubmit={(evenement) => {
        evenement.preventDefault()
        if (texte.trim()) enregistrer.mutate()
      }}
    >
      <Champ
        libelle={t('mediatheque.altEnLigne')}
        value={texte}
        maxLength={300}
        onChange={(evenement) => setTexte(evenement.target.value)}
        className="flex-1"
      />
      <Bouton type="submit" variante="secondaire" disabled={!texte.trim() || enregistrer.isPending}>
        {t('formulaire.enregistrer')}
      </Bouton>
    </form>
  )
}

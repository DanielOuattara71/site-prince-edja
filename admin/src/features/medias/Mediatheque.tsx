import { useQuery, useQueryClient } from '@tanstack/react-query'
import { CircleAlert, FileText, Search, Upload } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { Link, useSearchParams } from 'react-router'
import { medias, type ParametresMedias } from '@/api/endpoints/contenus'
import { TYPES_MEDIA_ACCEPTES } from '@/api/schemas/medias'
import { useSession } from '@/auth/contexte-session'
import { peut } from '@/auth/permissions'
import { FiltreCreateur } from '@/components/createurs/SelecteurCreateur'
import { FilAriane } from '@/components/layout/FilAriane'
import { TitrePage } from '@/components/layout/TitrePage'
import { Bouton } from '@/components/ui/Bouton'
import { Case } from '@/components/ui/Case'
import { Champ } from '@/components/ui/Champ'
import { EtatErreur, EtatVide } from '@/components/ui/Etats'
import { IndicateurAFournir } from '@/components/ui/IndicateurAFournir'
import { Select } from '@/components/ui/Select'
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
const PAGE = 24

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
  const [envois, setEnvois] = useState<Envoi[]>([])

  const page = Number(adresse.get('page') ?? '1') || 1
  const type = adresse.get('mime')
  const parametres: ParametresMedias = {
    page,
    pageSize: PAGE,
    ...(adresse.get('q') ? { q: adresse.get('q') ?? '' } : {}),
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

  /** Envoi multiple : un appel par fichier, dans l'ordre, chacun avec son résultat. */
  const envoyer = async (fichiers: File[]) => {
    setEnvois(fichiers.map((fichier) => ({ nom: fichier.name, etat: 'en_cours' })))
    for (const [index, fichier] of fichiers.entries()) {
      let resultat: Envoi
      try {
        await medias.envoyer(fichier)
        resultat = { nom: fichier.name, etat: 'reussi' }
      } catch (erreur) {
        resultat = { nom: fichier.name, etat: 'refuse', message: messageErreur(erreur) }
      }
      setEnvois((actuels) => actuels.map((envoi, i) => (i === index ? resultat : envoi)))
    }
    await client.invalidateQueries({ queryKey: ['medias'] })
  }

  const total = liste.data?.total ?? 0
  const pages = Math.max(1, Math.ceil(total / PAGE))
  const filtresActifs = ['q', 'mime', 'aFournir', 'nonUtilise', 'createur'].some((cle) =>
    adresse.has(cle),
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
                if (fichiers.length > 0) void envoyer(fichiers)
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
            className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6"
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
                        alt ? 'text-ink-900' : 'font-semibold text-clay-700',
                      )}
                    >
                      {alt || (
                        <span className="inline-flex items-center gap-1">
                          <CircleAlert aria-hidden className="size-3.5" />
                          {t('media.sansAlt')}
                        </span>
                      )}
                    </span>
                  </Link>
                  <div className="flex flex-wrap items-center gap-1 text-caption text-ink-700">
                    <IndicateurAFournir champs={media.champsAFournir} />
                    <span>
                      {media.usages > 0
                        ? `${media.usages} ${t('mediatheque.usages')}`
                        : t('mediatheque.nonUtilise')}
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

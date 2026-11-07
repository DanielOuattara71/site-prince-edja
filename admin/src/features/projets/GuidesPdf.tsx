import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Upload } from 'lucide-react'
import { useState } from 'react'
import { Link, useSearchParams } from 'react-router'
import { medias } from '@/api/endpoints/contenus'
import { POIDS_MAX_PDF, type Media } from '@/api/schemas/medias'
import { useSession } from '@/auth/contexte-session'
import { peut } from '@/auth/permissions'
import { FilAriane } from '@/components/layout/FilAriane'
import { TitrePage } from '@/components/layout/TitrePage'
import { TableauDonnees, type Colonne } from '@/components/listes/TableauDonnees'
import { useNotifications } from '@/components/retours/contexte-notifications'
import { CLASSES_LIEN } from '@/components/ui/classes'
import { EtatVide } from '@/components/ui/Etats'
import { t } from '@/i18n/fr'
import { formaterDate } from '@/lib/dates'
import { messageErreur } from '@/lib/message-erreur'
import { numeroPage, TAILLES_PAGE, taillePage } from '@/lib/pagination'

/**
 * Guides PDF (ECRANS § 3.6) : un guide est un **média PDF** rattaché à une destination ou à un
 * épisode (champ `guideMediaId`) ; il n'a pas de table propre. Liste en lecture, dépôt d'un PDF
 * (taille maximale affichée) ; pas d'édition de contenu. La suppression passe par la fiche du
 * média, qui la refuse si le guide est utilisé.
 */
const nomDe = (m: Media) =>
  m.traductions.fr?.legende || m.traductions.fr?.texteAlt || t('guides.sansNom')

const COLONNES: Colonne<Media>[] = [
  {
    id: 'nom',
    entete: t('guides.nom'),
    principale: true,
    cellule: (m) => (
      <Link to={`/medias/${m.id}`} className={CLASSES_LIEN}>
        {nomDe(m)}
      </Link>
    ),
  },
  {
    id: 'poids',
    entete: t('mediatheque.poids'),
    cellule: (m) => `${Math.round(m.poids / 1024)} Ko`,
  },
  {
    id: 'usages',
    entete: t('guides.utilisePar'),
    cellule: (m) =>
      m.usages > 0
        ? `${t('mediatheque.utiliseA')} ${m.usages} ${t('mediatheque.usages')}`
        : t('mediatheque.nonUtilise'),
  },
  { id: 'date', entete: t('guides.date'), cellule: (m) => formaterDate(m.creeLe) },
]

export default function GuidesPdf() {
  const { moi } = useSession()
  const client = useQueryClient()
  const notifier = useNotifications()
  const [adresse, setAdresse] = useSearchParams()
  const [envoi, setEnvoi] = useState(false)
  const page = numeroPage(adresse.get('page'))
  const taille = taillePage(adresse.get('taille'))
  const liste = useQuery({
    queryKey: ['medias', 'liste', 'guides', page, taille],
    queryFn: () => medias.lister({ page, pageSize: taille, mime: 'pdf' }),
    placeholderData: (precedent) => precedent,
  })

  const regler = (cle: string, valeur: string | null) =>
    setAdresse(
      (actuelle) => {
        const suivante = new URLSearchParams(actuelle)
        if (valeur) suivante.set(cle, valeur)
        else suivante.delete(cle)
        if (cle !== 'page') suivante.delete('page')
        return suivante
      },
      { replace: true },
    )

  const deposer = async (fichier: File) => {
    if (fichier.type !== 'application/pdf') {
      notifier.erreur(t('guides.pdfSeulement'))
      return
    }
    setEnvoi(true)
    try {
      await medias.envoyer(fichier)
      notifier.succes(t('guides.depose'))
      await client.invalidateQueries({ queryKey: ['medias'] })
    } catch (erreur) {
      notifier.erreur(messageErreur(erreur))
    } finally {
      setEnvoi(false)
    }
  }

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <FilAriane
            elements={[
              { libelle: t('menu.projets'), chemin: '/projets' },
              { libelle: t('menu.guides') },
            ]}
          />
          <TitrePage titre={t('menu.guides')}>{t('menu.guides')}</TitrePage>
          <p className="mt-2 max-w-3xl text-body text-ink-700">{t('guides.intro')}</p>
        </div>
        {peut(moi?.compte, 'creer', 'medias') ? (
          <div className="space-y-1">
            <label className="inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-md bg-clay-600 px-4 text-button font-semibold text-cream-100 hover:bg-clay-700 has-focus-visible:outline-2 has-focus-visible:outline-offset-3 has-focus-visible:outline-clay-600">
              <Upload aria-hidden className="size-4" />
              {envoi ? t('guides.depotEnCours') : t('guides.deposer')}
              <input
                type="file"
                accept="application/pdf"
                className="sr-only"
                disabled={envoi}
                onChange={(evenement) => {
                  const fichier = evenement.target.files?.[0]
                  evenement.target.value = ''
                  if (fichier) void deposer(fichier)
                }}
              />
            </label>
            <p className="text-caption text-ink-700">
              {t('guides.tailleMax')} {Math.round(POIDS_MAX_PDF / (1024 * 1024))} Mo
            </p>
          </div>
        ) : null}
      </div>

      <TableauDonnees
        libelle={t('menu.guides')}
        colonnes={COLONNES}
        lignes={liste.data?.items}
        cle={(m) => m.id}
        etat={liste.isPending ? 'chargement' : liste.isError ? 'erreur' : 'pret'}
        erreur={liste.error}
        surReessai={() => void liste.refetch()}
        total={liste.data?.total ?? 0}
        page={page}
        pageSize={taille}
        surPage={(n) => regler('page', n === 1 ? null : String(n))}
        surTaille={(n) => regler('taille', n === TAILLES_PAGE[0] ? null : String(n))}
        vide={<EtatVide titre={t('guides.vide')} texte={t('guides.videTexte')} />}
      />
    </section>
  )
}

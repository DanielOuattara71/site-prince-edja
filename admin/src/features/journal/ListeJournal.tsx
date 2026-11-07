import { useState } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { journal } from '@/api/endpoints/contenus'
import type { EntreeJournal } from '@/api/schemas/site'
import { Bouton } from '@/components/ui/Bouton'
import { EtatErreur, EtatVide } from '@/components/ui/Etats'
import { Squelette } from '@/components/ui/Squelette'
import { TableauDonnees, type Colonne, type EtatTableau } from '@/components/listes/TableauDonnees'
import { TitrePage } from '@/components/layout/TitrePage'
import { useSession } from '@/auth/contexte-session'
import { peut } from '@/auth/permissions'
import { t } from '@/i18n/fr'
import { formaterDateHeure } from '@/lib/dates'

/**
 * Écran « Journal » (étape 9) : les écritures d’audit du back end, en lecture seule (contrat
 * § 15.2). La consultation est ouverte aux admins, l’export CSV aux super-admins.
 */
export default function ListeJournal() {
  const { moi } = useSession()
  const compte = moi?.compte
  const [page, setPage] = useState(1)
  const pageSize = 20
  const requete = useQuery({
    queryKey: ['journal', 'liste', page, pageSize],
    queryFn: () => journal.lister({ page, pageSize }),
  })
  const exporter = useMutation({
    mutationFn: async () => {
      const csv = await journal.exporter()
      const uri = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }))
      const lien = document.createElement('a')
      lien.href = uri
      lien.download = 'journal.csv'
      document.body.appendChild(lien)
      lien.click()
      lien.remove()
      URL.revokeObjectURL(uri)
    },
  })

  const etat: EtatTableau = requete.isPending ? 'chargement' : requete.isError ? 'erreur' : 'pret'
  const lignes = requete.data?.items ?? []
  const total = requete.data?.total ?? 0

  const colonnes: Colonne<EntreeJournal>[] = [
    {
      id: 'creeLe',
      entete: t('journal.date'),
      principale: true,
      cellule: (ligne) => formaterDateHeure(ligne.creeLe),
    },
    { id: 'action', entete: t('journal.action'), cellule: (ligne) => ligne.action },
    { id: 'entite', entete: t('journal.entite'), cellule: (ligne) => ligne.entite },
    { id: 'compte', entete: t('journal.compte'), cellule: (ligne) => ligne.compte?.nom ?? '—' },
  ]

  return (
    <section className="space-y-8">
      <div className="space-y-2">
        <TitrePage titre={t('menu.activite')}>{t('menu.activite')}</TitrePage>
        {etat === 'chargement' ? <Squelette lignes={5} /> : null}
        {etat === 'erreur' ? (
          <EtatErreur erreur={requete.error} surReessai={() => void requete.refetch()} />
        ) : null}
      </div>

      {etat === 'pret' ? (
        <TableauDonnees<EntreeJournal>
          libelle={t('menu.activite')}
          colonnes={colonnes}
          lignes={lignes}
          cle={(ligne) => ligne.id}
          etat={etat}
          total={total}
          page={page}
          pageSize={pageSize}
          surPage={setPage}
          vide={<EtatVide titre={t('journal.aucun')} />}
        />
      ) : null}

      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-caption text-ink-700" aria-live="polite">
          {etat === 'pret'
            ? `${total} ${total > 1 ? t('tableau.resultats') : t('tableau.resultat')}`
            : ''}
        </p>
        <Bouton
          variante="secondaire"
          onClick={() => exporter.mutate()}
          disabled={!peut(compte, 'exporter', 'journal') || exporter.isPending}
        >
          {exporter.isPending ? 'Export…' : t('journal.export')}
        </Bouton>
      </div>
    </section>
  )
}

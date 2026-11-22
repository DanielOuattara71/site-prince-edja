import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { site } from '@/api/endpoints/contenus'
import {
  ETATS_PUBLICATION,
  MOTIFS_PUBLICATION,
  type EtatPublication,
  type Publication,
} from '@/api/schemas/site'
import { Bouton } from '@/components/ui/Bouton'
import { EtatErreur } from '@/components/ui/Etats'
import { Squelette } from '@/components/ui/Squelette'
import { t } from '@/i18n/fr'

/** Historique des reconstructions du site (contrat § 14.1). L'endpoint existe côté API mais
 *  n'était affiché nulle part : le lien « Voir les publications » menait au même suivi. */
export function HistoriquePublications() {
  const [etat, setEtat] = useState<EtatPublication | ''>('')
  const [motif, setMotif] = useState<Publication['motif'] | ''>('')
  const [page, setPage] = useState(1)
  const pageSize = 10

  const requete = useQuery({
    queryKey: ['site', 'publications', etat, motif, page],
    queryFn: () =>
      site.publications({
        page,
        pageSize,
        ...(etat ? { etat } : {}),
        ...(motif ? { motif } : {}),
      }),
  })

  return (
    <section className="space-y-4">
      <h2 className="text-heading-sm text-ink-900">{t('publication.historique')}</h2>
      <div className="flex flex-wrap gap-4">
        <label className="space-y-1 text-caption text-ink-700">
          {t('publication.filtreEtat')}
          <select
            className="block rounded-md border border-sand-200 bg-white px-3 py-2 text-body text-ink-900"
            value={etat}
            onChange={(e) => {
              setEtat(e.target.value as EtatPublication | '')
              setPage(1)
            }}
          >
            <option value="">—</option>
            {ETATS_PUBLICATION.map((valeur) => (
              <option key={valeur} value={valeur}>
                {t(`publication.${valeur}` as 'publication.reussie')}
              </option>
            ))}
          </select>
        </label>
        <label className="space-y-1 text-caption text-ink-700">
          {t('publication.filtreMotif')}
          <select
            className="block rounded-md border border-sand-200 bg-white px-3 py-2 text-body text-ink-900"
            value={motif}
            onChange={(e) => {
              setMotif(e.target.value as Publication['motif'] | '')
              setPage(1)
            }}
          >
            <option value="">—</option>
            {MOTIFS_PUBLICATION.map((valeur) => (
              <option key={valeur} value={valeur}>
                {valeur}
              </option>
            ))}
          </select>
        </label>
      </div>

      {requete.isPending ? (
        <Squelette lignes={4} />
      ) : requete.isError ? (
        <EtatErreur erreur={requete.error} surReessai={() => void requete.refetch()} />
      ) : requete.data.items.length === 0 ? (
        <p className="text-body text-ink-700">{t('publication.vide')}</p>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full text-body">
              <thead>
                <tr className="border-b border-sand-200 text-left text-caption text-ink-700">
                  <th className="py-2 pr-4">{t('publication.colonneDate')}</th>
                  <th className="py-2 pr-4">{t('publication.filtreMotif')}</th>
                  <th className="py-2 pr-4">{t('publication.filtreEtat')}</th>
                  <th className="py-2 pr-4">{t('publication.colonneObjet')}</th>
                  <th className="py-2 pr-4">{t('publication.colonnePar')}</th>
                </tr>
              </thead>
              <tbody>
                {requete.data.items.map((publication) => (
                  <tr key={publication.id} className="border-b border-sand-100">
                    <td className="py-2 pr-4">
                      {new Date(publication.declencheeLe).toLocaleString('fr-FR')}
                    </td>
                    <td className="py-2 pr-4">{publication.motif}</td>
                    <td className="py-2 pr-4">{t(`publication.${publication.etat}` as 'publication.reussie')}</td>
                    <td className="py-2 pr-4">{publication.objet?.titre ?? '—'}</td>
                    <td className="py-2 pr-4">{publication.demandeePar?.nom ?? 'système'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex items-center gap-3">
            <Bouton
              variante="discret"
              disabled={page <= 1}
              onClick={() => setPage((n) => Math.max(1, n - 1))}
            >
              {t('publication.precedent')}
            </Bouton>
            <span className="text-caption text-ink-700">
              {page} / {Math.max(1, Math.ceil(requete.data.total / pageSize))}
            </span>
            <Bouton
              variante="discret"
              disabled={page * pageSize >= requete.data.total}
              onClick={() => setPage((n) => n + 1)}
            >
              {t('tableau.suivante')}
            </Bouton>
          </div>
        </>
      )}
    </section>
  )
}

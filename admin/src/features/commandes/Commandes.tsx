import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { commandes } from '@/api/endpoints/commandes'
import { cles } from '@/api/cles'
import type { EtatCommande } from '@/api/schemas/commandes'
import { useNotifications } from '@/components/retours/contexte-notifications'
import { Bouton } from '@/components/ui/Bouton'
import { Confirmation } from '@/components/ui/Confirmation'
import { FilAriane } from '@/components/layout/FilAriane'
import { TitrePage } from '@/components/layout/TitrePage'
import { formatFCFA } from '@/lib/format'
import { messageErreur } from '@/lib/message-erreur'
import { t } from '@/i18n/fr'

/** Écran « Commandes » (contrat 1.14.0 § 31.5) : liste, détail et remboursement. */

const ETATS: EtatCommande[] = ['en_attente', 'payee', 'expiree', 'echouee', 'rembourse']

function DetailCommande({
  numero,
  surFermer,
}: {
  numero: string
  surFermer: () => void
}) {
  const client = useQueryClient()
  const notifier = useNotifications()
  const [confirmer, setConfirmer] = useState(false)
  const detail = useQuery({
    queryKey: cles.commande(numero),
    queryFn: () => commandes.lire(numero),
  })
  const rembourser = useMutation({
    mutationFn: () => commandes.rembourser(numero, 'Remboursement demandé depuis l’admin'),
    onSuccess: (resultat) => {
      notifier.succes(resultat.dejaFait ? 'Commande déjà remboursée.' : 'Commande remboursée.')
      void client.invalidateQueries({ queryKey: ['commandes'] })
      setConfirmer(false)
    },
    onError: (erreur) => notifier.erreur(messageErreur(erreur)),
  })
  if (!detail.data) return null
  const c = detail.data

  return (
    <dialog open aria-label={`Commande ${c.numero}`} className="fixed inset-0 z-80 flex max-w-none items-center justify-center bg-ink-900/50 p-4">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl bg-sand-50 p-6 shadow-xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="label-caps text-ink-500">Commande</p>
            <h2 className="font-display text-heading-sm text-ink-900">{c.numero}</h2>
            <p className="text-caption text-ink-700">{c.nom} · {c.email}</p>
          </div>
          <Bouton variante="discret" onClick={surFermer}>Fermer</Bouton>
        </div>

        <dl className="mt-5 grid gap-3 rounded-md border border-sand-200 bg-sand-100 p-4 text-caption sm:grid-cols-2">
          <div><dt className="text-ink-500">Statut</dt><dd className="font-semibold text-ink-900">{c.statut}</dd></div>
          <div><dt className="text-ink-500">Total</dt><dd className="font-semibold text-ink-900">{formatFCFA(Number(c.total))}</dd></div>
          <div><dt className="text-ink-500">Prestataire</dt><dd className="font-semibold text-ink-900">{c.fournisseur}</dd></div>
          <div><dt className="text-ink-500">Payée le</dt><dd className="font-semibold text-ink-900">{c.payeeLe ? new Date(c.payeeLe).toLocaleString('fr-FR') : '—'}</dd></div>
        </dl>

        <h3 className="mt-6 label-caps text-ink-700">Pièces commandées</h3>
        <ul className="mt-2 divide-y divide-sand-200 rounded-md border border-sand-200">
          {c.lignes.map((l) => (
            <li key={l.id} className="flex items-center justify-between gap-3 p-3 text-caption">
              <span className="text-ink-900">{l.libelle}</span>
              <span className="text-ink-700">×{l.quantite} · {formatFCFA(Number(l.prixUnitaire))}</span>
            </li>
          ))}
        </ul>

        {c.paiements.length > 0 ? (
          <>
            <h3 className="mt-6 label-caps text-ink-700">Paiements</h3>
            <ul className="mt-2 divide-y divide-sand-200 rounded-md border border-sand-200">
              {c.paiements.map((p) => (
                <li key={p.id} className="flex items-center justify-between gap-3 p-3 text-caption">
                  <span className="text-ink-900">{p.statut} · {formatFCFA(Number(p.montant))}</span>
                  <span className="text-ink-700">{p.prestataire}</span>
                </li>
              ))}
            </ul>
          </>
        ) : null}

        {c.statut === 'payee' ? (
          <div className="mt-6 flex justify-end">
            <Bouton variante="secondaire" onClick={() => setConfirmer(true)}>Rembourser</Bouton>
          </div>
        ) : null}
      </div>

      {confirmer ? (
        <Confirmation
          ouverte
          titre="Rembourser cette commande ?"
          objet={c.numero}
          consequence="Le montant sera reversé au client. Cette action est enregistrée dans l’historique."
          libelleConfirmer="Rembourser"
          surConfirmer={() => void rembourser.mutate()}
          surAnnuler={() => setConfirmer(false)}
          enCours={rembourser.isPending}
        />
      ) : null}
    </dialog>
  )
}

export default function Commandes() {
  const [page, setPage] = useState(1)
  const [statut, setStatut] = useState<EtatCommande | ''>('')
  const [ouvert, setOuvert] = useState<string | null>(null)
  const liste = useQuery({
    queryKey: cles.commandes({ page, statut }),
    queryFn: () => commandes.lister({ page, pageSize: 20, ...(statut ? { statut } : {}) }),
  })
  const compteurs = useQuery({ queryKey: cles.compteursCommandes(), queryFn: () => commandes.compteurs() })

  return (
    <section className="space-y-6">
      <FilAriane elements={[{ libelle: t('menu.boutique') }, { libelle: 'Commandes' }]} />
      <TitrePage titre="Commandes">Commandes</TitrePage>

      {compteurs.data ? (
        <dl className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-md border border-sand-200 bg-sand-100 p-4">
            <dt className="text-caption text-ink-500">En attente</dt>
            <dd className="text-heading-sm font-semibold text-ink-900">{compteurs.data.commandesEnAttente}</dd>
          </div>
          <div className="rounded-md border border-sand-200 bg-sand-100 p-4">
            <dt className="text-caption text-ink-500">Payées</dt>
            <dd className="text-heading-sm font-semibold text-ink-900">{compteurs.data.commandesPayees}</dd>
          </div>
          <div className="rounded-md border border-sand-200 bg-sand-100 p-4">
            <dt className="text-caption text-ink-500">Chiffre d’affaires</dt>
            <dd className="text-heading-sm font-semibold text-ink-900">{formatFCFA(Number(compteurs.data.chiffreAffaires))}</dd>
          </div>
        </dl>
      ) : null}

      <div className="flex items-end gap-3">
        <label className="space-y-1 text-caption text-ink-700" htmlFor="statut-commandes">
          Statut
          <select
            id="statut-commandes"
            value={statut}
            onChange={(e) => { setStatut(e.target.value as EtatCommande | ''); setPage(1) }}
            className="block min-h-11 rounded-md border border-ink-500 bg-sand-50 px-3"
          >
            <option value="">Tous</option>
            {ETATS.map((etat) => <option key={etat} value={etat}>{etat}</option>)}
          </select>
        </label>
      </div>

      {liste.data?.items.length ? (
        <>
          <ul className="divide-y divide-sand-200 rounded-md border border-sand-200">
            {liste.data.items.map((c) => (
              <li key={c.id}>
                <button
                  type="button"
                  aria-label={`Ouvrir la commande ${c.numero}`}
                  onClick={() => setOuvert(c.numero)}
                  className="flex w-full flex-wrap items-center justify-between gap-3 p-4 text-left hover:bg-sand-100"
                >
                  <span>
                    <span className="block font-semibold text-ink-900">{c.numero}</span>
                    <span className="block text-caption text-ink-700">{c.nom} · {new Date(c.creeLe).toLocaleDateString('fr-FR')}</span>
                  </span>
                  <span className="flex items-center gap-3 text-caption">
                    <span className="font-semibold text-ink-900">{formatFCFA(Number(c.total))}</span>
                    <span className="rounded-full border border-sand-300 px-2 text-ink-700">{c.statut}</span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
          <div className="flex items-center justify-between gap-3">
            <Bouton variante="secondaire" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Précédente</Bouton>
            <span className="text-caption text-ink-700">Page {page} · {liste.data.total} commande(s)</span>
            <Bouton variante="secondaire" disabled={page * 20 >= liste.data.total} onClick={() => setPage((p) => p + 1)}>Suivante</Bouton>
          </div>
        </>
      ) : (
        <p className="rounded-md border border-dashed border-sand-300 p-6 text-center text-body text-ink-700">
          Aucune commande pour le moment.
        </p>
      )}

      {ouvert ? <DetailCommande numero={ouvert} surFermer={() => setOuvert(null)} /> : null}
    </section>
  )
}

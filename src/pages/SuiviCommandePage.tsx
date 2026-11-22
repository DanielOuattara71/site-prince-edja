import { useEffect, useState } from 'react'
import { Link, useSearchParams, useParams } from 'react-router'
import { Check, Clock3, XCircle } from 'lucide-react'
import { useSeo } from '@/hooks/useSeo'
import { useLangue } from '@/i18n/contexteLangue'
import { annulerCommande, lireCommande, type CommandePublique } from '@/api/commandes'
import { formatFCFA } from '@/lib/format'
import { Section } from '@/components/layout/Section'
import { Container } from '@/components/layout/Container'
import { Eyebrow } from '@/components/ui/Eyebrow'
import { Button } from '@/components/ui/Button'

/**
 * Suivi d'une commande (contrat 1.14.0 § 31.4). Le numéro et l'e-mail sont nécessaires :
 * l'API ne renvoie la commande que si les deux correspondent. Aucune donnée n'est inventée
 * ici — le statut affiché est exactement celui renvoyé par le serveur.
 */

const ETIQUETTES: Record<string, { fr: string; en: string }> = {
  en_attente: { fr: 'En attente de paiement', en: 'Awaiting payment' },
  payee: { fr: 'Payée', en: 'Paid' },
  expiree: { fr: 'Expirée', en: 'Expired' },
  echouee: { fr: 'Paiement échoué', en: 'Payment failed' },
  rembourse: { fr: 'Remboursée', en: 'Refunded' },
}

export default function SuiviCommandePage() {
  const { numero } = useParams()
  const [parametres] = useSearchParams()
  const email = parametres.get('email') ?? ''
  const { l } = useLangue()
  const [commande, setCommande] = useState<CommandePublique | null>(null)
  const [erreur, setErreur] = useState('')
  const [chargement, setChargement] = useState(true)
  const [confirmer, setConfirmer] = useState(false)
  const [annulationEnCours, setAnnulationEnCours] = useState(false)
  const [erreurAnnulation, setErreurAnnulation] = useState('')

  // Une autre commande ouverte dans le même onglet réinitialise l'état pendant le rendu
  // (plutôt qu'un effet de reset, qui déclencherait un rendu visible).
  const identifiant = `${numero ?? ''}|${email}`
  const [cleChargee, setCleChargee] = useState(identifiant)
  if (cleChargee !== identifiant) {
    setCleChargee(identifiant)
    setCommande(null)
    setErreur('')
    setChargement(true)
    setConfirmer(false)
    setErreurAnnulation('')
  }

  useSeo({
    title: 'Suivi de commande · Edja Shop',
    description: 'Suivez l’état de votre commande Edja Shop.',
    indexable: false,
  })

  useEffect(() => {
    let actif = true
    lireCommande(numero ?? '', email)
      .then((donnees) => {
        if (actif) setCommande(donnees)
      })
      .catch((e: unknown) => {
        if (actif) setErreur(e instanceof Error ? e.message : 'Commande introuvable.')
      })
      .finally(() => {
        if (actif) setChargement(false)
      })
    return () => {
      actif = false
    }
  }, [numero, email])

  async function annuler() {
    if (!numero) return
    setAnnulationEnCours(true)
    setErreurAnnulation('')
    try {
      await annulerCommande(numero)
      setCommande(await lireCommande(numero, email))
      setConfirmer(false)
    } catch (e) {
      setErreurAnnulation(e instanceof Error ? e.message : 'Une erreur est survenue.')
    } finally {
      setAnnulationEnCours(false)
    }
  }

  const etat = commande?.statut ?? ''
  const libelle = ETIQUETTES[etat]

  return (
    <Section tone="light" padded={false} className="pt-32 pb-20 lg:pt-44 lg:pb-28">
      <Container className="max-w-3xl space-y-8">
        <div className="space-y-4">
          <Eyebrow>Edja Shop</Eyebrow>
          <h1 className="font-display uppercase text-display-lg">
            {l({ fr: 'Votre commande', en: 'Your order' })}
          </h1>
        </div>

        {chargement ? (
          <p className="text-body text-ink-700">
            {l({ fr: 'Chargement de votre commande…', en: 'Loading your order…' })}
          </p>
        ) : erreur ? (
          <div className="space-y-6 rounded-xl border border-sand-200 bg-sand-100 p-8">
            <p role="alert" className="text-body font-semibold text-clay-700">{erreur}</p>
            <Button to="/boutique" variant="dark">
              {l({ fr: 'Retour à la boutique', en: 'Back to the shop' })}
            </Button>
          </div>
        ) : commande ? (
          <div className="space-y-6 rounded-xl border border-sand-200 bg-sand-100 p-8">
            <div className="flex items-start gap-4">
              <span
                aria-hidden
                className={`mt-1 inline-flex size-10 shrink-0 items-center justify-center rounded-full ${
                  etat === 'payee'
                    ? 'bg-leaf-600 text-sand-50'
                    : etat === 'en_attente'
                      ? 'bg-sand-300 text-ink-900'
                      : 'bg-promo-500 text-sand-50'
                }`}
              >
                {etat === 'payee' ? (
                  <Check className="size-5" />
                ) : etat === 'en_attente' ? (
                  <Clock3 className="size-5" />
                ) : (
                  <XCircle className="size-5" />
                )}
              </span>
              <div>
                <p className="label-caps text-ink-500">{commande.numero}</p>
                <p className="text-heading-sm font-semibold text-ink-900">
                  {libelle ? l(libelle) : etat}
                </p>
              </div>
            </div>

            <dl className="grid gap-3 border-t border-sand-200 pt-5 text-caption sm:grid-cols-2">
              <div>
                <dt className="text-ink-500">Total</dt>
                <dd className="font-semibold text-ink-900">
                  {formatFCFA(Number(commande.total))}
                </dd>
              </div>
              <div>
                <dt className="text-ink-500">Date</dt>
                <dd className="font-semibold text-ink-900">
                  {new Date(commande.creeLe).toLocaleDateString('fr-FR')}
                </dd>
              </div>
            </dl>

            {etat === 'en_attente' ? (
              <div className="space-y-3 border-t border-sand-200 pt-5">
                <p className="text-caption text-ink-700">
                  {l({
                    fr: 'Votre paiement n’a pas encore été confirmé. Le statut se mettra à jour automatiquement.',
                    en: 'Your payment has not been confirmed yet. The status will update automatically.',
                  })}
                </p>
                {confirmer ? (
                  <div className="space-y-3 rounded-md border border-clay-500 bg-sand-50 p-4">
                    <p className="text-caption text-ink-700">
                      {l({
                        fr: 'Annuler cette commande libère les pièces réservées. Cette action est définitive.',
                        en: 'Cancelling this order releases the reserved pieces. This cannot be undone.',
                      })}
                    </p>
                    {erreurAnnulation ? (
                      <p role="alert" className="text-caption font-semibold text-clay-700">
                        {erreurAnnulation}
                      </p>
                    ) : null}
                    <div className="flex flex-wrap gap-3">
                      <Button
                        variant="primary"
                        magnetic={false}
                        disabled={annulationEnCours}
                        onClick={() => void annuler()}
                      >
                        {annulationEnCours
                          ? l({ fr: 'Annulation…', en: 'Cancelling…' })
                          : l({ fr: 'Confirmer l’annulation', en: 'Confirm cancellation' })}
                      </Button>
                      <Button
                        variant="dark"
                        magnetic={false}
                        disabled={annulationEnCours}
                        onClick={() => setConfirmer(false)}
                      >
                        {l({ fr: 'Garder la commande', en: 'Keep the order' })}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setConfirmer(true)}
                    className="inline-flex min-h-11 items-center text-caption font-semibold text-clay-700 underline-offset-4 hover:underline"
                  >
                    {l({ fr: 'Annuler cette commande', en: 'Cancel this order' })}
                  </button>
                )}
              </div>
            ) : null}

            <Link
              to="/boutique"
              className="inline-flex min-h-11 items-center text-caption font-semibold text-clay-600 underline-offset-4 hover:underline"
            >
              {l({ fr: 'Continuer mes achats', en: 'Continue shopping' })}
            </Link>
          </div>
        ) : null}
      </Container>
    </Section>
  )
}

import { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { Minus, Plus, Trash2 } from 'lucide-react'
import { useSeo } from '@/hooks/useSeo'
import { useLangue } from '@/i18n/contexteLangue'
import { ACHAT_ACTIF, usePanier } from '@/lib/panier-contexte'
import { creerCommande, type CommandeCreee } from '@/api/commandes'
import { formatFCFA } from '@/lib/format'
import { Section } from '@/components/layout/Section'
import { Container } from '@/components/layout/Container'
import { Eyebrow } from '@/components/ui/Eyebrow'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Field'

/**
 * Panier et passage de commande (contrat 1.14.0). Le total affiché est indicatif :
 * l'API recalcule le montant depuis la base au moment de la création. Aucun paiement
 * n'est demandé ici — la redirection vers Wave intervient après création de la commande.
 */
export default function CommandePage() {
  const { t, l } = useLangue()
  const { lignes, nombre, totalIndicatif, retirer, changerQuantite, vider } = usePanier()
  const naviguer = useNavigate()
  const [nom, setNom] = useState('')
  const [email, setEmail] = useState('')
  const [envoi, setEnvoi] = useState(false)
  const [erreur, setErreur] = useState('')

  useSeo({
    title: 'Votre panier · Edja Shop',
    description: 'Finalisez votre commande d’objets Edja Shop.',
    indexable: false,
  })

  async function soumettre(evenement: React.FormEvent) {
    evenement.preventDefault()
    if (lignes.length === 0) return
    setEnvoi(true)
    setErreur('')
    try {
      const commande: CommandeCreee = await creerCommande(lignes, { nom, email }, 'fr')
      vider()
      // En simulation, aucun prestataire externe n'est contacté : on ouvre le suivi public.
      // En production, c'est Wave qui fournit l'URL de paiement à ouvrir par le navigateur.
      if (commande.fournisseur === 'simulation') {
        naviguer(`/commande/${commande.numero}?email=${encodeURIComponent(email)}`)
      } else {
        window.location.href = commande.waveLaunchUrl
      }
    } catch (e) {
      setErreur(e instanceof Error ? e.message : 'Une erreur est survenue.')
    } finally {
      setEnvoi(false)
    }
  }

  // Le parcours d'achat est grisé tant que le prestataire de paiement n'est pas branché.
  // Le code reste en place : remettre ACHAT_ACTIF à true réactive toute la page.
  if (!ACHAT_ACTIF) {
    return (
      <Section tone="light" padded={false} className="pt-32 pb-20 lg:pt-44 lg:pb-28">
        <Container className="max-w-3xl space-y-6">
          <Eyebrow>Edja Shop</Eyebrow>
          <h1 className="font-display uppercase text-display-lg text-ink-500">
            {t('achat.bientot')}
          </h1>
          <p className="max-w-2xl text-body-lg text-ink-700">{t('achat.indisponible')}</p>
          <Button to="/boutique" variant="dark">
            {l({ fr: 'Découvrir la collection', en: 'Explore the collection' })}
          </Button>
        </Container>
      </Section>
    )
  }

  return (
    <Section tone="light" padded={false} className="pt-32 pb-20 lg:pt-44 lg:pb-28">
      <Container className="max-w-5xl space-y-10">
        <div className="space-y-4">
          <Eyebrow>Edja Shop</Eyebrow>
          <h1 className="font-display uppercase text-display-lg">
            {l({ fr: 'Votre panier', en: 'Your basket' })}
          </h1>
        </div>

        {lignes.length === 0 ? (
          <div className="space-y-6 rounded-xl border border-sand-200 bg-sand-100 p-8">
            <p className="text-body text-ink-700">
              {l({ fr: 'Votre panier est vide.', en: 'Your basket is empty.' })}
            </p>
            <Button to="/boutique" variant="dark">
              {l({ fr: 'Découvrir la collection', en: 'Explore the collection' })}
            </Button>
          </div>
        ) : (
          <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_22rem]">
            <div className="space-y-4">
              <ul className="divide-y divide-sand-200 rounded-xl border border-sand-200">
                {lignes.map((ligne) => (
                  <li key={ligne.varianteId} className="flex flex-wrap items-center gap-4 p-4">
                    <div className="min-w-0 flex-1">
                      <Link
                        to={`/boutique/${ligne.slug}`}
                        className="font-semibold text-ink-900 hover:underline"
                      >
                        {ligne.nom}
                      </Link>
                      <p className="text-caption text-ink-500">
                        {ligne.prixIndicatif != null
                          ? formatFCFA(ligne.prixIndicatif)
                          : 'Sur demande'}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        aria-label="Diminuer la quantité"
                        disabled={ligne.quantite <= 1}
                        onClick={() => changerQuantite(ligne.slug, ligne.quantite - 1)}
                        className="inline-flex min-h-11 items-center px-2 disabled:opacity-40"
                      >
                        <Minus aria-hidden className="size-4" />
                      </button>
                      <span aria-live="polite" className="min-w-6 text-center">{ligne.quantite}</span>
                      <button
                        type="button"
                        aria-label="Augmenter la quantité"
                        onClick={() => changerQuantite(ligne.slug, ligne.quantite + 1)}
                        className="inline-flex min-h-11 items-center px-2"
                      >
                        <Plus aria-hidden className="size-4" />
                      </button>
                    </div>
                    <button
                      type="button"
                      aria-label={`Retirer ${ligne.nom}`}
                      onClick={() => retirer(ligne.slug)}
                      className="inline-flex min-h-11 items-center text-clay-700"
                    >
                      <Trash2 aria-hidden className="size-4" />
                    </button>
                  </li>
                ))}
              </ul>
              <p className="text-caption text-ink-500">{nombre} article(s)</p>
            </div>

            <form onSubmit={soumettre} className="space-y-5 rounded-xl border border-sand-200 bg-sand-100 p-6">
              <h2 className="label-caps text-ink-700">
                {l({ fr: 'Vos coordonnées', en: 'Your details' })}
              </h2>
              <Input
                id="commande-nom"
                label={l({ fr: 'Votre nom', en: 'Your name' })}
                value={nom}
                onChange={(e) => setNom(e.target.value)}
                required
                autoComplete="name"
              />
              <Input
                id="commande-email"
                label={l({ fr: 'Votre e-mail', en: 'Your email' })}
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
              <div className="flex items-center justify-between border-t border-sand-200 pt-4">
                <span className="text-body text-ink-700">Total indicatif</span>
                <span className="text-body font-semibold text-ink-900">{formatFCFA(totalIndicatif)}</span>
              </div>
              <p className="text-caption text-ink-500">
                Le montant définitif est calculé par la maison. Le paiement se fait ensuite auprès de Wave.
              </p>
              {erreur ? <p role="alert" className="text-caption font-semibold text-clay-700">{erreur}</p> : null}
              <Button type="submit" variant="primary" className="w-full" disabled={envoi || !nom.trim() || !email.trim()}>
                {envoi ? 'Envoi…' : l({ fr: 'Continuer vers le paiement', en: 'Continue to payment' })}
              </Button>
            </form>
          </div>
        )}
      </Container>
    </Section>
  )
}

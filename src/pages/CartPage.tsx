import { Link } from 'react-router'
import { Minus, Plus, Trash2 } from 'lucide-react'
import { useCart } from '@/lib/cart'
import { formatPrice } from '@/lib/format'
import { SITE } from '@/data/site'
import { useSeo } from '@/hooks/useSeo'
import { Container } from '@/components/layout/Container'
import { Button } from '@/components/ui/Button'

export default function CartPage() {
  const { lines, count, total, setQuantite, remove, clear } = useCart()

  useSeo({
    title: 'Panier — Marketplace Prince Edja',
    description: 'Votre sélection de pièces faites main — précommande et livraison internationale.',
  })

  const mailtoHref = `mailto:${SITE.email}?subject=${encodeURIComponent(
    'Précommande — Marketplace Prince Edja',
  )}&body=${encodeURIComponent(
    lines
      .map((line) => `${line.nom} x${line.quantite} — ${formatPrice(line.prix * line.quantite)}`)
      .join('\n') +
      `\n\nTotal : ${formatPrice(total)}\n(Paiement : mobile money, carte ou virement international)`,
  )}`

  return (
    <div className="bg-sand-50 text-ink-900">
      <Container className="pt-32 pb-24 lg:pt-44 lg:pb-32">
        <div className="space-y-4">
          <p className="label-caps text-clay-600">La maison · Espace neutre</p>
          <h1 className="font-display uppercase text-display-lg">
            Votre panier <span className="tnum text-clay-500">[{count}]</span>
          </h1>
        </div>

        {lines.length === 0 ? (
          <div className="mt-12 space-y-6 rounded-3xl border border-sand-200 bg-sand-100 p-10 text-center">
            <p className="text-body-lg text-ink-500">
              Votre panier est vide — les salles vous attendent.
            </p>
            <Button to="/boutique" variant="dark">
              Visiter la marketplace
            </Button>
          </div>
        ) : (
          <div className="mt-12 grid gap-12 lg:grid-cols-12">
            {/* Lignes */}
            <ul className="space-y-4 lg:col-span-8">
              {lines.map((line) => (
                <li
                  key={line.slug}
                  className="flex items-center gap-4 rounded-2xl border border-sand-200 bg-sand-100 p-4 sm:gap-6"
                >
                  <img
                    src={line.image}
                    alt={line.nom}
                    loading="lazy"
                    className="size-20 shrink-0 rounded-xl object-cover sm:size-24"
                  />
                  <div className="min-w-0 flex-1 space-y-1">
                    <Link
                      to={`/boutique/${line.univers}/${line.slug}`}
                      className="font-display uppercase text-heading-sm transition-colors hover:text-clay-600"
                    >
                      {line.nom}
                    </Link>
                    <p className="label-caps tnum text-ink-500">{formatPrice(line.prix)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setQuantite(line.slug, line.quantite - 1)}
                      aria-label={`Retirer une unité de ${line.nom}`}
                      className="flex size-9 cursor-pointer items-center justify-center rounded-full border border-sand-300 transition-colors hover:bg-ink-900 hover:text-cream-100"
                    >
                      <Minus className="size-4" aria-hidden />
                    </button>
                    <span className="tnum w-8 text-center text-body font-semibold">
                      {line.quantite}
                    </span>
                    <button
                      type="button"
                      onClick={() => setQuantite(line.slug, line.quantite + 1)}
                      aria-label={`Ajouter une unité de ${line.nom}`}
                      className="flex size-9 cursor-pointer items-center justify-center rounded-full border border-sand-300 transition-colors hover:bg-ink-900 hover:text-cream-100"
                    >
                      <Plus className="size-4" aria-hidden />
                    </button>
                  </div>
                  <p className="hidden w-28 text-right text-button font-semibold tnum sm:block">
                    {formatPrice(line.prix * line.quantite)}
                  </p>
                  <button
                    type="button"
                    onClick={() => remove(line.slug)}
                    aria-label={`Retirer ${line.nom} du panier`}
                    className="cursor-pointer rounded-full p-2 text-ink-400 transition-colors hover:text-clay-700"
                  >
                    <Trash2 className="size-4" aria-hidden />
                  </button>
                </li>
              ))}
              <li>
                <button
                  type="button"
                  onClick={clear}
                  className="label-caps cursor-pointer text-ink-400 transition-colors hover:text-clay-700"
                >
                  Vider le panier
                </button>
              </li>
            </ul>

            {/* Total */}
            <aside className="h-fit space-y-5 rounded-3xl border border-sand-200 bg-night-900 p-8 text-cream-100 lg:sticky lg:top-28 lg:col-span-4">
              <h2 className="font-display uppercase text-heading-md">Récapitulatif</h2>
              <div className="flex items-baseline justify-between border-b border-cream-100/15 pb-4">
                <span className="label-caps text-cream-100/60">Sous-total</span>
                <span className="font-display uppercase text-heading-sm tnum">
                  {formatPrice(total)}
                </span>
              </div>
              <p className="text-body text-cream-100/70">
                Mobile money (Orange, MTN, Wave), carte ou virement international. Livraison
                suivie depuis Abidjan.
              </p>
              <Button href={mailtoHref} external variant="primary" className="w-full">
                Précommander — {formatPrice(total)}
              </Button>
              <p className="label-caps text-cream-100/40">
                Étape 1/2 — un lien de paiement sécurisé vous sera envoyé par email.
              </p>
            </aside>
          </div>
        )}
      </Container>
    </div>
  )
}
import { useMemo, useState } from 'react'
import { Link } from 'react-router'
import type { Bijou } from '@/types'
import { BIJOUX } from '@/data/content'
import { marche } from '@/data/produits'
import { SITE } from '@/data/site'
import { useSeo } from '@/hooks/useSeo'
import { useSelection, numeroDemande } from '@/lib/selection'
import { formatFCFA } from '@/lib/format'
import { Container } from '@/components/layout/Container'
import { SectionMarker } from '@/components/ui/SectionMarker'
import { Input, Textarea, Select } from '@/components/ui/Field'
import { Button } from '@/components/ui/Button'

const VILLES = [
  'Abidjan',
  'Bouaké',
  'Dabou',
  'Grand-Bassam',
  'Korhogo',
  'Man',
  'San-Pédro',
  'Yamoussoukro',
  'Hors Côte d’Ivoire',
]

/** Deux demandes par heure et par navigateur : ce formulaire ouvre des mails. */
const CLE_LIMITE = 'pe_demande_recentes'
const MAX_PAR_HEURE = 2

function tropDeDemandes(): boolean {
  try {
    const brut = window.localStorage.getItem(CLE_LIMITE)
    if (!brut) return false
    const instants: number[] = JSON.parse(brut)
    const limite = Date.now() - 3_600_000
    const recents = instants.filter((t) => t > limite)
    window.localStorage.setItem(CLE_LIMITE, JSON.stringify(recents))
    return recents.length >= MAX_PAR_HEURE
  } catch {
    return false
  }
}

function marquerDemande(): void {
  try {
    const brut = window.localStorage.getItem(CLE_LIMITE)
    const instants: number[] = brut ? JSON.parse(brut) : []
    instants.push(Date.now())
    window.localStorage.setItem(CLE_LIMITE, JSON.stringify(instants))
  } catch {
    /* sans stockage, le seul frein restant est le mail lui-même */
  }
}

/**
 * MA DEMANDE — le dernier écran du parcours, et le seul qui transforme.
 *
 * Pas de paiement en ligne : on réserve une pièce, on envoie une demande, et un
 * conseiller répond. Le formulaire est donc **minimal** — en Côte d'Ivoire le numéro
 * de téléphone est le compte client, l'email est facultatif.
 *
 * Le message est envoyé sur deux canaux : un mail pré-rempli (toujours disponible) et
 * Web3Forms si la clé est configurée, pour l'archive. Aucun des deux ne supprime
 * l'autre : si le mail ne s'ouvre pas, la demande part quand même par le formulaire.
 */
export default function DemandePage() {
  useSeo({
    title: 'Ma demande — Le Marché | Prince Edja',
    description: 'Réserver une pièce : réponse sous 24 h.',
    // Page de composition : pas d'intérêt à être indexée, et elle n'est pas dans le
    // sitemap — le noindex évite qu'un moteur la découvre par les liens du dock.
    indexable: false,
  })

  const selection = useSelection()
  const [envoyee, setEnvoyee] = useState<{ numero: string; corps: string } | null>(null)
  const [bloque, setBloque] = useState(false)

  const lignes = useMemo(
    () =>
      selection.lignes
        .map((l) => ({ ligne: l, bijou: BIJOUX.find((b) => b.slug === l.slug) }))
        .filter((x) => x.bijou !== undefined),
    [selection.lignes],
  )

  const total = lignes.reduce((somme, { ligne, bijou }) => {
    const prix = bijou ? marche(bijou.slug).prix : null
    return somme + (prix ?? 0) * ligne.quantite
  }, 0)

  const sujet = (numero: string) => `Demande ${numero} — ${SITE.name}`

  function envoyer(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (lignes.length === 0) return
    if (tropDeDemandes()) {
      setBloque(true)
      return
    }

    const data = new FormData(event.currentTarget)
    const numero = numeroDemande(new Date(), selection.total)
    const details = lignes
      .map(({ ligne, bijou }) => {
        const m = bijou ? marche(bijou.slug) : null
        const prix = m?.prix ? formatFCFA(m.prix) : 'sur devis'
        const taille = ligne.taille ? ` — taille ${ligne.taille}` : ''
        return `• ${bijou?.nom} (${m?.reference ?? '—'})${taille} ×${ligne.quantite} — ${prix}`
      })
      .join('\n')

    const corps = [
      `Demande ${numero}`,
      '',
      `Nom : ${data.get('nom') ?? ''}`,
      `Téléphone : ${data.get('telephone') ?? ''}`,
      `Ville : ${data.get('ville') ?? ''}`,
      data.get('email') ? `Email : ${data.get('email')}` : '',
      data.get('note') ? `Note : ${data.get('note')}` : '',
      '',
      'Pièces :',
      details,
      '',
      `Total indicatif : ${formatFCFA(total)} — hors livraison`,
    ]
      .filter(Boolean)
      .join('\n')

    marquerDemande()
    setEnvoyee({ numero, corps })

    // Le mail s'ouvre en arrière-plan : si le client est absent, Web3Forms part quand même.
    window.location.href = `mailto:${SITE.email}?subject=${encodeURIComponent(
      sujet(numero),
    )}&body=${encodeURIComponent(corps)}`

    const cle = import.meta.env.VITE_WEB3FORMS_ACCESS_KEY
    if (cle) {
      void fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          access_key: cle,
          subject: sujet(numero),
          message: corps,
          from_name: String(data.get('nom') ?? 'Visiteur'),
          replyto: String(data.get('email') ?? ''),
          botcheck: String(data.get('site') ?? ''),
        }),
      })
    }
  }

  return (
    <section className="pt-32 pb-24 lg:pt-40 lg:pb-32">
      <Container>
        <div className="max-w-3xl">
          <SectionMarker eyebrow="Le Marché" />

          {envoyee ? (
            <Confirmation numero={envoyee.numero} corps={envoyee.corps} />
          ) : lignes.length === 0 ? (
            <div className="mt-8 space-y-6">
              <h1 className="font-title text-display-lg leading-[0.98]">La sélection est vide.</h1>
              <p className="text-body-lg text-ink-500">
                Choisis d'abord une pièce dans un comptoir, puis reviens ici pour envoyer ta
                demande.
              </p>
              <Button to="/boutique" variant="dark">
                Voir les comptoirs
              </Button>
            </div>
          ) : (
            <>
              <h1 className="mt-6 font-title text-display-lg leading-[0.98]">Ma demande.</h1>
              <p className="mt-5 text-body-lg text-ink-500">
                Rien n'est réservé ni facturé sur cette page. Tu poses une option, tu reçois une
                réponse sous 24 h, et le règlement se fait ensuite — par Mobile Money, virement
                ou sur place.
              </p>

              <Recap lignes={lignes} total={total} />

              <Formulaire
                bloque={bloque}
                onEnvoyer={envoyer}
                email={SITE.email}
              />
            </>
          )}
        </div>
      </Container>
    </section>
  )
}

/** Le récapitulatif : 56 px de visuel, pas plus — c'est un moment marchand, pas éditorial. */
function Recap({
  lignes,
  total,
}: {
  lignes: { ligne: { slug: string; quantite: number; taille: string | null }; bijou?: Bijou }[]
  total: number
}) {
  return (
    <ul className="mt-10 divide-y divide-sand-200 border-y border-sand-200">
      {lignes.map(({ ligne, bijou }) => {
        const m = bijou ? marche(bijou.slug) : null
        return (
          <li key={bijou?.slug ?? ligne.slug} className="flex items-center gap-4 py-4">
            <img
              src={bijou?.image}
              alt=""
              loading="lazy"
              decoding="async"
              className="size-14 shrink-0 rounded-sharp object-cover"
            />
            <div className="min-w-0 flex-1">
              <p className="font-title text-body">{bijou?.nom}</p>
              <p className="data-mono text-caption text-ink-500">{m?.reference}</p>
            </div>
            <p className="data-mono text-sm text-ink-700">×{ligne.quantite}</p>
            <p className="data-mono w-28 text-right text-sm">
              {m?.prix ? formatFCFA(m.prix * ligne.quantite) : '—'}
            </p>
          </li>
        )
      })}
      <li className="flex items-baseline justify-between py-4">
        <span className="label-caps text-ink-500">Total indicatif</span>
        <span className="data-mono text-lg">{formatFCFA(total)}</span>
      </li>
    </ul>
  )
}

function Formulaire({
  bloque,
  onEnvoyer,
  email,
}: {
  bloque: boolean
  onEnvoyer: (event: React.FormEvent<HTMLFormElement>) => void
  email: string
}) {
  return (
    <form onSubmit={onEnvoyer} className="mt-10 space-y-6">
      <Input label="Nom" id="nom" name="nom" required autoComplete="name" className="rounded-sharp" />
      <Input
        label="Téléphone (WhatsApp)"
        id="telephone"
        name="telephone"
        type="tel"
        inputMode="tel"
        required
        autoComplete="tel"
        minLength={8}
        className="rounded-sharp"
      />
      <Select label="Ville" id="ville" name="ville" options={VILLES} className="rounded-sharp" />
      <Input
        label="Email (facultatif)"
        id="email"
        name="email"
        type="email"
        autoComplete="email"
        className="rounded-sharp"
      />
      <Textarea
        label="Ce que tu cherches (facultatif)"
        id="note"
        name="note"
        rows={4}
        placeholder="Taille, délai, ou simplement ce qui t’a plu."
        className="rounded-sharp"
      />

      {/* Piège à robots : invisible, jamais rempli par un humain. */}
      <div aria-hidden className="absolute left-[-9999px] h-px w-px overflow-hidden">
        <label htmlFor="site">Ne pas remplir</label>
        <input id="site" name="site" tabIndex={-1} autoComplete="off" />
      </div>

      {bloque && (
        <p role="alert" className="text-body text-clay-600">
          Plusieurs demandes sont déjà parties depuis cet appareil. Écris-nous directement à{' '}
          {email} et on répondra dans la journée.
        </p>
      )}

      <Button type="submit" variant="primary">
        Envoyer ma demande
      </Button>
      <p className="text-caption text-ink-500">
        Ton numéro et ton nom servent uniquement à te répondre au sujet de cette demande.
      </p>
    </form>
  )
}

/** L'accusé : le numéro de demande, et la possibilité de renvoyer. */
function Confirmation({ numero, corps }: { numero: string; corps: string }) {
  return (
    <div className="mt-8 space-y-8">
      <h1 className="font-title text-display-lg leading-[0.98]">Demande transmise.</h1>

      <div className="border-y border-sand-200 py-6">
        <p className="label-caps text-ink-500">Numéro de demande</p>
        <p className="data-mono mt-2 text-2xl">{numero}</p>
        <p className="mt-3 text-body text-ink-500">
          Un conseiller te répond sur ton numéro sous 24 h. Garde cette référence : c’est la clé
          de suivi de la conversation.
        </p>
      </div>

      <details className="border-b border-sand-200 pb-4">
        <summary className="cursor-pointer text-button font-semibold">
          Le message qui a été envoyé
        </summary>
        <pre className="data-mono mt-4 overflow-x-auto text-caption whitespace-pre-wrap text-ink-700">
          {corps}
        </pre>
      </details>

      <div className="flex flex-wrap gap-3">
        <Button
          href={`mailto:${SITE.email}?subject=${encodeURIComponent(`Demande ${numero}`)}&body=${encodeURIComponent(corps)}`}
          variant="dark"
        >
          Renvoyer par mail
        </Button>
        <Link
          to="/boutique"
          className="inline-flex items-center px-4 text-button font-semibold underline underline-offset-4"
        >
          Retour au marché
        </Link>
      </div>
    </div>
  )
}


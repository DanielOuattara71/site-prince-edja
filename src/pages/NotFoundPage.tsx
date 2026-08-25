import { Link } from 'react-router'
import { useSeo } from '@/hooks/useSeo'
import { Button } from '@/components/ui/Button'

export default function NotFoundPage() {
  useSeo({ title: 'Page introuvable — Prince Edja' })

  return (
    <section className="grain flex min-h-svh flex-col items-center justify-center gap-6 bg-night-900 px-6 text-center text-cream-100">
      <h1 className="font-display uppercase text-display-xl text-gold-400">
        404<span aria-hidden className="text-clay-500">.</span>
      </h1>
      <p className="max-w-md text-body-lg text-cream-100/70">
        Cette route n’existe pas encore — mais chaque voyage commence par un détour.
      </p>
      <Button to="/" variant="primary">
        Retour à l’accueil
      </Button>
      <Link to="/contact" className="label-caps text-cream-100/50 underline-offset-4 hover:underline">
        Signaler le problème
      </Link>
    </section>
  )
}

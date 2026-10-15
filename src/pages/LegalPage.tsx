import { useLocation } from 'react-router'
import { useSeo } from '@/hooks/useSeo'
import { useLangue } from '@/i18n/contexteLangue'
import { Section } from '@/components/layout/Section'
import { Container } from '@/components/layout/Container'
import { Eyebrow } from '@/components/ui/Eyebrow'
import { Button } from '@/components/ui/Button'
import { Breadcrumb } from '@/components/layout/Breadcrumb'
import { PAGES_LEGALES } from '@/data/navigation'

export default function LegalPage() {
  const { t, l } = useLangue()
  const { pathname } = useLocation()
  const page = PAGES_LEGALES.find((entree) => entree.chemin === pathname)

  useSeo({
    title: page
      ? `${page.titre.fr} · Prince Edja`
      : 'Page introuvable · Prince Edja',
    description: page?.resume.fr,
    // Une page dont le contenu n'existe pas encore n'a rien à faire dans l'index :
    // l'indexer montrerait aux moteurs une coquille vide.
    indexable: false,
  })

  if (!page) {
    return (
      <Section tone="light" padded={false} className="pt-32 pb-20 lg:pt-44 lg:pb-28">
        <Container className="space-y-4">
          <h1 className="font-display uppercase text-display-lg">Page introuvable.</h1>
          <Button to="/" variant="dark">
            Retour à l'accueil
          </Button>
        </Container>
      </Section>
    )
  }

  return (
    <Section tone="light" padded={false} className="pt-32 pb-20 lg:pt-44 lg:pb-28">
      <Container className="max-w-3xl space-y-8">
        <Breadcrumb />

        <div className="space-y-5">
          <Eyebrow num={page.numero}>{page.famille}</Eyebrow>
          <h1 className="font-display uppercase text-display-lg">{l(page.titre)}</h1>
          <p className="text-body-lg text-ink-500">{l(page.resume)}</p>
        </div>

        {/* Squelette assumé : mieux vaut une page honnête qu'un texte juridique inventé. */}
        <div className="space-y-3 rounded-xl border border-sand-200 bg-sand-100 p-6 lg:p-8">
          <p className="label-caps text-clay-600">{t('legal.aFournir')}</p>
          <p className="text-body text-ink-700">{t('legal.aFournirTexte')}</p>
          <ul className="space-y-2 pt-2">
            {page.sections.map((section) => (
              <li key={section} className="flex items-baseline gap-3 text-body text-ink-500">
                <span aria-hidden className="mt-2 size-1.5 shrink-0 rounded-full bg-gold-400" />
                {section}
              </li>
            ))}
          </ul>
        </div>

        <Button to="/contact" variant="dark">
          {t('legal.contactLien')}
        </Button>
      </Container>
    </Section>
  )
}
